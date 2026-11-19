CREATE DATABASE IF NOT EXISTS schnittpunkt_salon
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE schnittpunkt_salon;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS termin;
DROP TABLE IF EXISTS freietagen;
DROP TABLE IF EXISTS mitarbeiter_leistung;
DROP TABLE IF EXISTS kunde;
DROP TABLE IF EXISTS leistung;
DROP TABLE IF EXISTS mitarbeiter;
DROP TABLE IF EXISTS oeffnungstag;
DROP TABLE IF EXISTS meldung;

CREATE TABLE kunde (
  idKunde INT NOT NULL AUTO_INCREMENT,
  kunde_name VARCHAR(45) NOT NULL,
  telefonnummer VARCHAR(20) NOT NULL,
  mail VARCHAR(45) NOT NULL,
  PRIMARY KEY (idKunde),
  UNIQUE KEY uq_kunde_mail (mail)
) ENGINE=InnoDB;

CREATE TABLE mitarbeiter (
  idMitarbeiter INT NOT NULL AUTO_INCREMENT,
  mitarbeiter_name VARCHAR(45) NOT NULL,
  mitarbeiter_status VARCHAR(45) NOT NULL DEFAULT 'aktiv',
  PRIMARY KEY (idMitarbeiter),
  CONSTRAINT chk_mitarbeiter_status CHECK (mitarbeiter_status IN ('aktiv', 'inaktiv'))
) ENGINE=InnoDB;

CREATE TABLE leistung (
  idLeistung INT NOT NULL AUTO_INCREMENT,
  leistung_name VARCHAR(45) NOT NULL,
  dauer_in_minuten INT NOT NULL,
  preis DECIMAL(6,2) NOT NULL,
  aktiv TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (idLeistung),
  UNIQUE KEY uq_leistung_name (leistung_name),
  CONSTRAINT chk_leistung_dauer CHECK (dauer_in_minuten > 0),
  CONSTRAINT chk_leistung_preis CHECK (preis >= 0),
  CONSTRAINT chk_leistung_aktiv CHECK (aktiv IN (0, 1))
) ENGINE=InnoDB;

CREATE TABLE oeffnungstag (
  idOeffnungstag INT NOT NULL AUTO_INCREMENT,
  tag_name VARCHAR(45) NOT NULL,
  arbeit_anfang TIME NOT NULL,
  arbeit_ende TIME NOT NULL,
  PRIMARY KEY (idOeffnungstag),
  UNIQUE KEY uq_oeffnungstag_name (tag_name),
  CONSTRAINT chk_oeffnungstag_zeit CHECK (arbeit_ende > arbeit_anfang)
) ENGINE=InnoDB;

CREATE TABLE mitarbeiter_leistung (
  idMitarbeiter_leistung INT NOT NULL AUTO_INCREMENT,
  mitarbeiter_Id INT NOT NULL,
  leistung_Id INT NOT NULL,
  PRIMARY KEY (idMitarbeiter_leistung),
  UNIQUE KEY uq_mitarbeiter_leistung (mitarbeiter_Id, leistung_Id),
  KEY idx_ml_leistung (leistung_Id),
  CONSTRAINT fk_ml_mitarbeiter FOREIGN KEY (mitarbeiter_Id) REFERENCES mitarbeiter (idMitarbeiter),
  CONSTRAINT fk_ml_leistung FOREIGN KEY (leistung_Id) REFERENCES leistung (idLeistung)
) ENGINE=InnoDB;

CREATE TABLE freietagen (
  idFreieTagen INT NOT NULL AUTO_INCREMENT,
  tag_id INT NOT NULL,
  mitarbeiter_id INT NOT NULL,
  PRIMARY KEY (idFreieTagen),
  UNIQUE KEY uq_freietagen (mitarbeiter_id, tag_id),
  KEY idx_freietagen_tag (tag_id),
  CONSTRAINT fk_freietagen_mitarbeiter FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter (idMitarbeiter),
  CONSTRAINT fk_freietagen_tag FOREIGN KEY (tag_id) REFERENCES oeffnungstag (idOeffnungstag)
) ENGINE=InnoDB;

CREATE TABLE termin (
  idTermin INT NOT NULL AUTO_INCREMENT,
  kunde_id INT NOT NULL,
  mitarbeiter_id INT NOT NULL,
  leistung_id INT NOT NULL,
  anfang DATETIME NOT NULL,
  ende DATETIME NOT NULL,
  termin_status VARCHAR(45) NOT NULL DEFAULT 'offen',
  stornocode VARCHAR(36) NOT NULL,
  PRIMARY KEY (idTermin),
  UNIQUE KEY uq_termin_stornocode (stornocode),
  KEY idx_termin_kunde (kunde_id),
  KEY idx_termin_mitarbeiter_anfang (mitarbeiter_id, anfang),
  KEY idx_termin_leistung (leistung_id),
  CONSTRAINT fk_termin_kunde FOREIGN KEY (kunde_id) REFERENCES kunde (idKunde),
  CONSTRAINT fk_termin_mitarbeiter FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter (idMitarbeiter),
  CONSTRAINT fk_termin_leistung FOREIGN KEY (leistung_id) REFERENCES leistung (idLeistung),
  CONSTRAINT chk_termin_zeit CHECK (ende > anfang),
  CONSTRAINT chk_termin_status CHECK (termin_status IN ('offen', 'erledigt', 'nicht erschienen', 'storniert'))
) ENGINE=InnoDB;

CREATE TABLE meldung (
  idMeldung INT NOT NULL AUTO_INCREMENT,
  text TEXT,
  meldung_status VARCHAR(45) NOT NULL,
  PRIMARY KEY (idMeldung)
) ENGINE=InnoDB;

INSERT INTO mitarbeiter (mitarbeiter_name, mitarbeiter_status) VALUES
('Sabine', 'aktiv'),
('Mara', 'aktiv'),
('Jonas', 'aktiv');

INSERT INTO leistung (leistung_name, dauer_in_minuten, preis, aktiv) VALUES
('Herrenschnitt', 30, 28.00, 1),
('Damenschnitt', 45, 42.00, 1),
('Waschen & Föhnen', 30, 22.00, 1),
('Kinderschnitt', 20, 16.00, 1),
('Bartpflege', 15, 12.00, 1),
('Färben', 90, 75.00, 1);

INSERT INTO oeffnungstag (tag_name, arbeit_anfang, arbeit_ende) VALUES
('Dienstag', '09:00:00', '18:00:00'),
('Mittwoch', '09:00:00', '18:00:00'),
('Donnerstag', '09:00:00', '18:00:00'),
('Freitag', '09:00:00', '18:00:00'),
('Samstag', '09:00:00', '14:00:00');

INSERT INTO mitarbeiter_leistung (mitarbeiter_Id, leistung_Id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),
(3,1),(3,3),(3,4),(3,5);

INSERT INTO freietagen (tag_id, mitarbeiter_id) VALUES
(5, 1),
(2, 2),
(4, 3);

INSERT INTO kunde (kunde_name, telefonnummer, mail) VALUES
('John conor','0175111212','john.conor.skynet@hotmail.com'),
('Gostavo Frink','0166545454','frink.lospoloshermanos@gmail.com'),
('Rambo vorever','0177111111','rambo.nichttot@gmail.com'),
('Bruce Lee','015500880','dragon.hero@hotmail.com'),
('Jacky Chan','016666666','jacky.jacky@gmail.com'),
('Iron Man','016523232','iron.man911@gmail.com'),
('Anna Roth','0151111222','anna.roth@example.de'),
('Thomas Becker','0160234567','thomas.becker@example.de'),
('Fatma Yilmaz','0176345678','fatma.yilmaz@example.de'),
('Peter Klein','0157456789','peter.klein@example.de'),
('Julia Hoffmann','0162567890','julia.hoffmann@example.de'),
('Mehmet Demir','0170678901','mehmet.demir@example.de'),
('Sophie Wagner','0152789012','sophie.wagner@example.de'),
('Lukas Schmidt','0163890123','lukas.schmidt@example.de'),
('Elena Popescu','0178901234','elena.popescu@example.de'),
('Max Neumann','0159012345','max.neumann@example.de'),
('Katarina Novak','0171123456','katarina.novak@example.de'),
('Jan Krueger','0155234567','jan.krueger@example.de'),
('Nina Hahn','0164345678','nina.hahn@example.de'),
('Paul Berger','0179456789','paul.berger@example.de');

INSERT INTO termin (kunde_id, mitarbeiter_id, leistung_id, anfang, ende, termin_status, stornocode) VALUES
(1,3,1,'2026-11-12 15:00:00','2026-11-12 15:30:00','erledigt','7c9e6679-7425-40de-944b-e07fc1f90ae7'),
(2,1,6,'2026-11-24 11:00:00','2026-11-24 12:30:00','offen','110e8400-e29b-41d4-a716-446655440000'),
(3,2,5,'2026-11-26 13:15:00','2026-11-26 13:30:00','offen','550e8400-e29b-41d4-a716-446655440001'),
(4,3,1,'2026-11-24 10:00:00','2026-11-24 10:30:00','storniert','a8098c1a-f86e-4da0-bd17-9382eb8b129c'),
(5,1,3,'2026-11-27 12:15:00','2026-11-27 12:45:00','offen','c4a760a8-dbcf-4254-a0d9-6e4c19852b3f'),
(19,1,2,'2026-11-13 10:00:00','2026-11-13 10:45:00','erledigt','5fb90e99-26fd-4f50-8aed-534eba6654ce'),
(20,2,6,'2026-11-14 09:00:00','2026-11-14 10:30:00','nicht erschienen','1c2641f2-6718-43a8-8c9f-7b67033fa52f'),
(2,3,5,'2026-11-17 11:00:00','2026-11-17 11:15:00','erledigt','710f8b7e-66b3-4358-b085-ca9530146dbc'),
(1,1,1,'2026-11-18 14:00:00','2026-11-18 14:30:00','erledigt','e5d44f0e-5a9d-407f-b974-4ee5353f3471'),
(7,1,2,'2026-11-24 09:00:00','2026-11-24 09:45:00','offen','757348a3-3591-4fe3-9958-927e3e881fcd'),
(8,1,1,'2026-11-24 10:00:00','2026-11-24 10:30:00','offen','8bd20d92-ec77-41a3-98b7-54b20550ee21'),
(9,1,2,'2026-11-24 13:00:00','2026-11-24 13:45:00','offen','0a990faf-f1ae-40b8-8256-9c125107c605'),
(10,1,6,'2026-11-24 14:00:00','2026-11-24 15:30:00','offen','95f16e69-bb6c-433a-b699-9982ecfaadad'),
(11,1,4,'2026-11-24 16:00:00','2026-11-24 16:20:00','offen','19cd90ed-da31-4620-a958-9910a4a59485'),
(12,2,6,'2026-11-24 09:00:00','2026-11-24 10:30:00','offen','84eebcb3-8f43-4070-a7f8-a32d0903746e'),
(13,2,1,'2026-11-24 10:45:00','2026-11-24 11:15:00','offen','c4dcfcc5-fb62-4025-b663-4b12b0cdab1b'),
(1,2,5,'2026-11-24 11:30:00','2026-11-24 11:45:00','offen','772c530c-80a6-476a-87a7-ff493c4996a2'),
(14,2,3,'2026-11-24 13:00:00','2026-11-24 13:30:00','offen','12a25200-1525-41fa-a678-67ca2b265f67'),
(15,2,2,'2026-11-24 15:00:00','2026-11-24 15:45:00','offen','418c8460-a5b9-4952-8059-5c8e529ed59a'),
(16,2,6,'2026-11-24 16:30:00','2026-11-24 18:00:00','offen','a7f85161-eaa1-479d-a4cc-f03afbdc0530'),
(3,3,1,'2026-11-24 09:00:00','2026-11-24 09:30:00','offen','093bcb96-38e0-4deb-9b7c-32dbd74cf49a'),
(17,3,5,'2026-11-24 10:00:00','2026-11-24 10:15:00','offen','040ddd91-ccb2-41b6-adb4-7ac7252e7c72'),
(18,3,4,'2026-11-24 11:00:00','2026-11-24 11:20:00','offen','14b87ead-4137-4f0d-9078-8cf4f23322c8'),
(19,3,3,'2026-11-24 14:00:00','2026-11-24 14:30:00','offen','35220892-1363-48ae-94b4-021122e331aa'),
(20,3,1,'2026-11-24 17:30:00','2026-11-24 18:00:00','offen','214e88cc-349f-4337-b7d3-d0b726065baa'),
(5,1,6,'2026-11-25 10:00:00','2026-11-25 11:30:00','offen','855defc3-19a9-45ee-a11b-7bff206ee7e7'),
(6,3,1,'2026-11-25 09:30:00','2026-11-25 10:00:00','offen','4ff3e831-c1c0-4ec5-b3c2-82a7363b5bfe'),
(7,1,1,'2026-11-25 15:00:00','2026-11-25 15:30:00','storniert','1ab73ac2-c744-41cd-84e7-df772d7f108f'),
(13,1,2,'2026-11-26 09:00:00','2026-11-26 09:45:00','offen','3e07c3e3-bf8d-4268-a10a-6d4e86a5c72d'),
(14,3,4,'2026-11-26 12:00:00','2026-11-26 12:20:00','offen','aa35112d-e570-4eb3-9ddb-a19fd1d34424'),
(8,2,6,'2026-11-27 10:00:00','2026-11-27 11:30:00','offen','5c12a0b7-e5a2-49bc-b97a-300eec8c23d6'),
(9,2,2,'2026-11-28 09:00:00','2026-11-28 09:45:00','offen','7a31c844-4b9e-47bf-9a69-ca205cac8c7b'),
(10,2,6,'2026-11-28 12:30:00','2026-11-28 14:00:00','offen','73b6126f-5a1a-4fcb-971f-c12090ff31d3'),
(11,3,1,'2026-11-28 11:00:00','2026-11-28 11:30:00','offen','0e0b0371-2102-4738-88c2-2b021c42fe2a'),
(12,1,1,'2026-12-01 09:00:00','2026-12-01 09:30:00','offen','ca04cb71-3ea2-4e19-9941-7084d4be1202'),
(15,2,5,'2026-12-01 14:00:00','2026-12-01 14:15:00','offen','c06ddca3-0ff6-4546-9a16-6c5082eb4ac9'),
(16,3,1,'2026-12-01 16:00:00','2026-12-01 16:30:00','offen','f873416b-3ca7-4078-864a-e7db0112b464'),
(17,2,6,'2026-12-03 10:00:00','2026-12-03 11:30:00','offen','b490b667-4246-423a-a5e4-b1171c9e6eb7'),
(18,3,3,'2026-12-03 13:00:00','2026-12-03 13:30:00','offen','f6ce98be-5d3d-48de-ba24-70712d9a9a01');

INSERT INTO meldung (text, meldung_status) VALUES
('Die Kaffeemaschine ist kaputt', 'aktiv'),
('das Eingangslicht funktioniert wieder', 'aktiv');
