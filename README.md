donwload the project
install docker desktop

cd PFE2026
run "docker-compose up --build" 

docker cp ./backend/creer_admin.py 3lm_backend:/app/
docker exec -it 3lm_backend python creer_admin.py

Enter email, name and password 

Go to http://localhost:3000 in the browser.

to stop
"docker-compose down"
to resart
"docker-compose up"
