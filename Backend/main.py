from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
from typing import List, Optional
import mysql.connector
import pdfplumber
import json
import io

app = FastAPI()

# -------------------------------
# DATABASE CONNECTION FUNCTION
# Opens a new MySQL connection for each request
# -------------------------------
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="talentflow_ats_v2"
    )


# -------------------------------
# CORS SETTINGS
# Allows the React frontend (localhost:3000) to call this API
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# OFFER MODEL
# Defines the expected shape of offer data sent from the frontend
# Used for POST /offers and PUT /offers/{id}
# -------------------------------
class Offer(BaseModel):
    title: str
    description: str
    skills: List[str]        # Stored as JSON array in MySQL
    date_start: date
    date_close: date
    status: str              # "open", "closed", or "archived"
    interview_date: Optional[date] = None  # Can be null if not scheduled yet
    created_by: int          # user_id of the RH Manager or Admin who created it


# -------------------------------
# ROOT
# Health check — confirms the backend is running
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Backend is working"}


# -------------------------------
# GET ALL OFFERS
# Returns all offers from the database
# Skills are stored as a JSON string in MySQL, so we parse them into a list
# -------------------------------
@app.get("/offers")
def get_all_offers():
    db = get_db()
    cursor = db.cursor(dictionary=True)  # dictionary=True returns rows as dicts instead of tuples

    try:
        cursor.execute("SELECT * FROM offers")
        offers = cursor.fetchall()

        # Convert the JSON skills string (e.g. '["React","Python"]') to a Python list
        for offer in offers:
            if offer["skills"]:
                offer["skills"] = json.loads(offer["skills"])
            else:
                offer["skills"] = []

        return offers

    except HTTPException:
        raise  # Re-raise 404s and other HTTP errors as-is
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()  # Always close the connection even if an error occurs


# -------------------------------
# GET OFFER BY ID
# Returns a single offer by its ID
# Used by the EditOffer and Apply pages to pre-fill data
# -------------------------------
@app.get("/offers/{offer_id}")
def get_offer(offer_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM offers WHERE id = %s", (offer_id,))
        offer = cursor.fetchone()

        # Return 404 if no offer was found with that ID
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Parse skills JSON string into a Python list
        offer["skills"] = json.loads(offer["skills"]) if offer["skills"] else []

        return offer

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()


# -------------------------------
# ADD OFFER
# Creates a new job offer in the database
# Skills list is serialized back to JSON string for storage
# -------------------------------
@app.post("/offers")
def add_offer(offer: Offer):
    db = get_db()
    cursor = db.cursor()

    try:
        sql = """
        INSERT INTO offers
        (title, description, skills, date_start, date_close, status, interview_date, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            offer.title,
            offer.description,
            json.dumps(offer.skills),   # Convert list to JSON string for MySQL
            offer.date_start,
            offer.date_close,
            offer.status.lower(),       # Normalize to lowercase to match ENUM
            offer.interview_date,       # Can be None
            offer.created_by
        )

        cursor.execute(sql, values)
        db.commit()

        return {"message": "Offer added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()


# -------------------------------
# UPDATE OFFER
# Updates all fields of an existing offer by ID
# updated_at is set automatically by MySQL ON UPDATE, but we set it explicitly too
# -------------------------------
@app.put("/offers/{offer_id}")
def update_offer(offer_id: int, offer: Offer):
    db = get_db()
    cursor = db.cursor()

    try:
        sql = """
        UPDATE offers SET
        title=%s,
        description=%s,
        skills=%s,
        date_start=%s,
        date_close=%s,
        status=%s,
        interview_date=%s,
        created_by=%s,
        updated_at=NOW()
        WHERE id=%s
        """

        values = (
            offer.title,
            offer.description,
            json.dumps(offer.skills),   # Convert list to JSON string for MySQL
            offer.date_start,
            offer.date_close,
            offer.status.lower(),
            offer.interview_date,
            offer.created_by,
            offer_id
        )

        cursor.execute(sql, values)
        db.commit()

        # rowcount == 0 means no row matched the WHERE id=%s — offer doesn't exist
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        return {"message": "Offer updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()


# -------------------------------
# DELETE OFFER
# Deletes an offer by ID
# Also cascades to applications linked to this offer (defined in DB schema)
# -------------------------------
@app.delete("/offers/{offer_id}")
def delete_offer(offer_id: int):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("DELETE FROM offers WHERE id=%s", (offer_id,))
        db.commit()

        # rowcount == 0 means the offer didn't exist
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        return {"message": "Offer deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        db.close()


# -------------------------------
# SUBMIT APPLICATION
# Handles candidate job applications
# Accepts multipart/form-data because it includes a PDF file upload
#
# Flow:
#   1. Extract text from the uploaded PDF using pdfplumber
#   2. Look up the candidate by email — create a new user if they don't exist
#   3. Check they haven't already applied for this offer
#   4. Insert the application into the database
# -------------------------------
@app.post("/apply")
async def submit_application(
    offer_id: int = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),        # Optional — not required in the form
    motivation: str = Form(...),
    cv_file: UploadFile = File(...), # PDF file uploaded by the candidate
):
    # Step 1 — Read the PDF and extract its text content
    # pdfplumber reads each page and joins the text with newlines
    try:
        contents = await cv_file.read()
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            cv_text = "\n".join(
                page.extract_text() or "" for page in pdf.pages
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not read PDF: " + str(e))

    db = get_db()
    cursor = db.cursor()

    try:
        # Step 2 — Find existing user by email or create a new candidate account
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            # Candidate already has an account — reuse their user_id
            user_id = user[0]
        else:
            # New candidate — create user row and candidate profile row
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, 'candidate')",
                (full_name, email, "pending")  # password_hash is "pending" until they register properly
            )
            user_id = cursor.lastrowid  # Get the auto-generated ID of the new user

            # Insert into candidates satellite table (phone, birthdate, etc.)
            cursor.execute(
                "INSERT INTO candidates (user_id, phone) VALUES (%s, %s)",
                (user_id, phone)
            )

        # Step 3 — Prevent duplicate applications (enforced by DB UNIQUE KEY too)
        cursor.execute(
            "SELECT id FROM applications WHERE user_id = %s AND offer_id = %s",
            (user_id, offer_id)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="You have already applied for this offer.")

        # Step 4 — Insert the application
        # experience_years and skills_text are omitted — the AI agent will extract them from cv_text later
        cursor.execute("""
            INSERT INTO applications
            (user_id, offer_id, phone, motivation, cv_text)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, offer_id, phone, motivation, cv_text))

        db.commit()
        return {"message": "Application submitted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Always close DB connection whether success or failure
        cursor.close()
        db.close()