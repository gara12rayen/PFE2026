-- ============================================================
--  TalentFlow ATS v2 — Schéma MySQL complet
--  Base : PFE2026  |  Encodage : utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS PFE2026
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PFE2026;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('candidate','rh','admin') NOT NULL DEFAULT 'candidate',
  phone       VARCHAR(30)  NULL,
  department  VARCHAR(120) NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX ix_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── offers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id          INT          NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  skills      JSON         NOT NULL,
  date_start  DATE         NOT NULL,
  date_close  DATE         NOT NULL,
  status      ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_by  INT          NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX ix_offers_status (status),
  INDEX ix_offers_created_by (created_by),
  CONSTRAINT fk_offers_users
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── applications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id           INT              NOT NULL AUTO_INCREMENT,
  offer_id     INT              NOT NULL,
  user_id      INT              NOT NULL,
  motivation   TEXT             NOT NULL,
  cv_filename  VARCHAR(255)     NULL,
  status       ENUM('pending','reviewed','selected','rejected','hired')
                                NOT NULL DEFAULT 'pending',
  score        TINYINT UNSIGNED NULL,
  applied_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME         NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_offer_user (offer_id, user_id),
  INDEX ix_applications_offer_id (offer_id),
  INDEX ix_applications_user_id  (user_id),
  INDEX ix_applications_status   (status),
  CONSTRAINT fk_applications_offer
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_applications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id             INT      NOT NULL AUTO_INCREMENT,
  user_id        INT      NOT NULL,
  type           ENUM('status_update','interview','general') NOT NULL DEFAULT 'general',
  message        TEXT     NOT NULL,
  application_id INT      NULL,
  is_read        TINYINT(1) NOT NULL DEFAULT 0,
  created_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX ix_notifications_user_id (user_id),
  INDEX ix_notifications_is_read (is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_notifications_application
    FOREIGN KEY (application_id) REFERENCES applications(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── platform_settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  id               INT          NOT NULL AUTO_INCREMENT,
  calendly_link    VARCHAR(500) NULL,
  google_meet_link VARCHAR(500) NULL,
  updated_at       DATETIME     NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert empty settings row
INSERT INTO platform_settings (calendly_link, google_meet_link) VALUES (NULL, NULL);

-- ── Verification ─────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM users)             AS nb_users,
  (SELECT COUNT(*) FROM offers)            AS nb_offers,
  (SELECT COUNT(*) FROM applications)      AS nb_applications,
  (SELECT COUNT(*) FROM notifications)     AS nb_notifications,
  (SELECT COUNT(*) FROM platform_settings) AS nb_settings;

-- ── Migration v4: update platform_settings ───────────────
-- Run this if you already have the table from v3:
-- ALTER TABLE platform_settings ADD COLUMN cal_api_key VARCHAR(500) NULL;
-- ALTER TABLE platform_settings DROP COLUMN google_meet_link;
