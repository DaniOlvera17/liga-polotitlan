-- =====================================================
--  LIGA POLOTITLÁN — init.sql
--  Docker ejecuta este archivo automáticamente
--  al crear el contenedor de MariaDB
-- =====================================================

CREATE DATABASE IF NOT EXISTS liga_polotitlan
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE liga_polotitlan;

CREATE TABLE IF NOT EXISTS torneo (
    id_torneo  INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    categoria  VARCHAR(50),
    temporada  VARCHAR(20),
    estado     VARCHAR(20) DEFAULT 'activo',
    anio       INT DEFAULT 2026
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS equipo (
    id_equipo    INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    id_torneo    INT,
    color        VARCHAR(10) DEFAULT '#888888',
    pj           INT DEFAULT 0,
    pg           INT DEFAULT 0,
    pe           INT DEFAULT 0,
    pp           INT DEFAULT 0,
    goles_favor  INT DEFAULT 0,
    goles_contra INT DEFAULT 0,
    pts          INT DEFAULT 0,
    id_delegado  INT DEFAULT NULL,
    FOREIGN KEY (id_torneo) REFERENCES torneo(id_torneo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jugador (
    id_jugador INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    id_equipo  INT,
    posicion   VARCHAR(30),
    numero     INT DEFAULT 0,
    goles      INT DEFAULT 0,
    amarillas  INT DEFAULT 0,
    rojas      INT DEFAULT 0,
    FOREIGN KEY (id_equipo) REFERENCES equipo(id_equipo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS partido (
    id_partido      INT AUTO_INCREMENT PRIMARY KEY,
    id_torneo       INT,
    jornada         INT,
    id_local        INT,
    id_visitante    INT,
    goles_local     INT DEFAULT NULL,
    goles_visitante INT DEFAULT NULL,
    fecha           DATE,
    estado          VARCHAR(20) DEFAULT 'pendiente',
    tipo            VARCHAR(20) DEFAULT 'regular',
    FOREIGN KEY (id_torneo)    REFERENCES torneo(id_torneo),
    FOREIGN KEY (id_local)     REFERENCES equipo(id_equipo),
    FOREIGN KEY (id_visitante) REFERENCES equipo(id_equipo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anotador (
    id_anotador INT AUTO_INCREMENT PRIMARY KEY,
    id_partido  INT NOT NULL,
    id_jugador  INT NOT NULL,
    goles       INT DEFAULT 0,
    amarillas   INT DEFAULT 0,
    rojas       INT DEFAULT 0,
    FOREIGN KEY (id_partido) REFERENCES partido(id_partido) ON DELETE CASCADE,
    FOREIGN KEY (id_jugador) REFERENCES jugador(id_jugador) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Datos iniciales de ejemplo
INSERT INTO torneo (nombre, categoria, temporada, estado, anio) VALUES
('Varonil 1ra Fuerza — Clausura 2026', 'Primera Fuerza', 'Clausura', 'activo', 2026),
('Femenil 1ra Fuerza — Clausura 2026', 'Femenil',        'Clausura', 'activo', 2026);
