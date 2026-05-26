-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-05-2026 a las 06:35:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `liga_polotitlan`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `anotador`
--

CREATE TABLE `anotador` (
  `id_anotador` int(11) NOT NULL,
  `id_partido` int(11) NOT NULL,
  `id_jugador` int(11) NOT NULL,
  `goles` int(11) DEFAULT 0,
  `amarillas` int(11) DEFAULT 0,
  `rojas` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `anotador`
--

INSERT INTO `anotador` (`id_anotador`, `id_partido`, `id_jugador`, `goles`, `amarillas`, `rojas`) VALUES
(1, 26, 23, 2, 1, 0),
(2, 26, 24, 7, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

CREATE TABLE `equipo` (
  `id_equipo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_torneo` int(11) DEFAULT NULL,
  `color` varchar(10) DEFAULT '#888888',
  `pj` int(11) DEFAULT 0,
  `pg` int(11) DEFAULT 0,
  `pe` int(11) DEFAULT 0,
  `pp` int(11) DEFAULT 0,
  `goles_favor` int(11) DEFAULT 0,
  `goles_contra` int(11) DEFAULT 0,
  `pts` int(11) DEFAULT 0,
  `id_delegado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id_equipo`, `nombre`, `id_torneo`, `color`, `pj`, `pg`, `pe`, `pp`, `goles_favor`, `goles_contra`, `pts`, `id_delegado`) VALUES
(1, 'Colonial', 1, '#4A90D9', 1, 1, 0, 0, 6, 0, 3, NULL),
(2, 'Chivas', 1, '#CC0000', 1, 1, 0, 0, 6, 2, 3, NULL),
(3, 'Real Hidalgo', 1, '#2E7D32', 1, 1, 0, 0, 2, 1, 3, NULL),
(4, 'Galaxy', 1, '#1B5E20', 1, 1, 0, 0, 1, 0, 3, NULL),
(5, 'Pueblo Nuevo', 1, '#F57C00', 1, 0, 1, 0, 3, 3, 1, NULL),
(6, 'San Antonio', 1, '#7B1FA2', 1, 0, 1, 0, 3, 3, 1, NULL),
(7, 'Cobras', 1, '#FF8F00', 0, 0, 0, 0, 0, 0, 0, NULL),
(8, 'San Lorenzo', 1, '#00838F', 1, 0, 0, 1, 1, 2, 0, NULL),
(9, 'Arsenal', 1, '#D32F2F', 1, 0, 0, 1, 0, 1, 0, NULL),
(10, 'Fresno', 1, '#5D4037', 1, 0, 0, 1, 2, 6, 0, NULL),
(11, 'Chaves F.C', 1, '#795548', 1, 0, 0, 1, 0, 6, 0, NULL),
(12, 'Selección Cazadero', 2, '#AD1457', 4, 4, 0, 0, 21, 3, 12, NULL),
(13, 'Cobras (F)', 2, '#FF8F00', 3, 3, 0, 0, 24, 5, 9, NULL),
(14, 'Mexico F.C', 2, '#1565C0', 3, 3, 0, 0, 16, 1, 9, NULL),
(15, 'Reencuentro B.B.V', 2, '#6A1B9A', 4, 2, 0, 2, 13, 12, 6, NULL),
(16, 'Dvo. Bañe', 2, '#2E7D32', 4, 2, 0, 2, 10, 17, 6, NULL),
(17, 'Amazonas', 2, '#00695C', 3, 1, 0, 2, 5, 13, 3, NULL),
(18, 'R.S.A Las Toñas', 2, '#558B2F', 4, 1, 0, 3, 4, 16, 3, NULL),
(19, 'Galactic Girls', 2, '#4527A0', 3, 0, 0, 3, 1, 12, 0, NULL),
(20, 'Dvo. Fenix', 2, '#BF360C', 4, 0, 0, 4, 0, 15, 0, NULL),
(21, 'Dvo. Queny', 3, '#1B5E20', 9, 9, 0, 0, 32, 12, 27, NULL),
(22, 'Rayados', 3, '#1565C0', 9, 6, 3, 0, 41, 12, 21, NULL),
(23, 'Flip Power', 3, '#E65100', 9, 6, 1, 2, 44, 14, 19, NULL),
(24, 'Los Del Barrio', 3, '#4A148C', 8, 6, 1, 1, 36, 8, 19, NULL),
(25, 'Halcones F.C', 3, '#827717', 9, 5, 3, 1, 27, 21, 18, NULL),
(26, 'Juventus', 3, '#000000', 9, 5, 2, 2, 36, 23, 17, NULL),
(27, 'Ruano F.C', 3, '#880E4F', 9, 5, 2, 2, 19, 20, 17, NULL),
(28, 'Real Dañu', 3, '#BF360C', 9, 5, 1, 3, 21, 13, 16, NULL),
(29, 'Real San Antonio', 3, '#3E2723', 8, 4, 1, 3, 27, 18, 13, NULL),
(30, 'Toluca F.C', 3, '#B71C1C', 8, 4, 1, 3, 24, 15, 13, NULL),
(31, '60 Y Mas', 3, '#37474F', 8, 4, 1, 3, 30, 25, 13, NULL),
(32, 'Cuervos', 3, '#212121', 9, 4, 1, 4, 20, 17, 13, NULL),
(33, 'Maquina Del Mal', 3, '#F57F17', 9, 3, 2, 4, 15, 20, 11, NULL),
(34, 'Buena Vista', 3, '#004D40', 9, 3, 1, 5, 21, 28, 10, NULL),
(35, 'Dvo. Ruano', 3, '#C62828', 8, 2, 1, 5, 19, 24, 7, NULL),
(36, 'Alces', 3, '#5D4037', 9, 2, 0, 7, 16, 46, 6, NULL),
(37, 'Gaseros 10-75', 3, '#546E7A', 8, 1, 1, 6, 9, 35, 4, NULL),
(38, 'Isotopos', 3, '#00796B', 8, 1, 0, 7, 6, 41, 3, NULL),
(39, 'Ejemplo', 4, '#98a300', 1, 0, 0, 1, 2, 7, 0, NULL),
(40, 'EPrueba2', 4, '#7C9FBF', 1, 1, 0, 0, 7, 2, 3, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jugador`
--

CREATE TABLE `jugador` (
  `id_jugador` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `posicion` varchar(30) DEFAULT NULL,
  `numero` int(11) DEFAULT 0,
  `goles` int(11) DEFAULT 0,
  `amarillas` int(11) DEFAULT 0,
  `rojas` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `jugador`
--

INSERT INTO `jugador` (`id_jugador`, `nombre`, `id_equipo`, `posicion`, `numero`, `goles`, `amarillas`, `rojas`) VALUES
(1, 'Leonardo Reyes', 2, 'Delantero', 0, 4, 0, 0),
(2, 'Carlos Garcia', 1, 'Delantero', 0, 3, 0, 0),
(3, 'Luis Zamudio', 1, 'Delantero', 0, 3, 0, 0),
(4, 'Fernando Garcia', 2, 'Delantero', 0, 2, 0, 0),
(5, 'Jesus Mejia', 6, 'Delantero', 22, 2, 0, 0),
(6, 'Cinthia Rosalio', 13, 'Delantero', 0, 16, 0, 0),
(7, 'Claudia Barcenas', 12, 'Delantero', 19, 6, 0, 0),
(8, 'Teresa Estrada', 15, 'Mediocampo', 14, 6, 0, 0),
(9, 'Kenia Enriquez', 14, 'Delantero', 99, 4, 0, 0),
(10, 'Mariana Ruiz', 16, 'Mediocampo', 0, 4, 0, 0),
(11, 'Jennifer Cruz', 12, 'Mediocampo', 0, 3, 0, 0),
(12, 'Judith Ramirez', 13, 'Mediocampo', 0, 3, 0, 0),
(13, 'Karina Uribe', 14, 'Delantero', 0, 3, 0, 0),
(14, 'Mayte Cruz', 12, 'Delantero', 4, 3, 0, 0),
(15, 'Selene Chavez', 15, 'Delantero', 5, 3, 0, 0),
(16, 'Brayan Garcia', 23, 'Delantero', 18, 21, 0, 0),
(17, 'Luis Perez', 21, 'Delantero', 7, 17, 0, 0),
(18, 'David Linares', 31, 'Delantero', 23, 12, 0, 0),
(19, 'Giovanny Garcia', 23, 'Delantero', 10, 11, 0, 0),
(20, 'Daniel Lizarde', 26, 'Delantero', 16, 10, 0, 0),
(21, 'Rigoberto Cruz', 34, 'Mediocampo', 2, 10, 0, 0),
(22, 'Romualdo Lara', 35, 'Delantero', 23, 10, 0, 0),
(23, 'Jugador Prueba', 39, 'Portero', 100, 2, 1, 0),
(24, 'Daniel', 40, 'Delantero', 17, 7, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partido`
--

CREATE TABLE `partido` (
  `id_partido` int(11) NOT NULL,
  `id_torneo` int(11) DEFAULT NULL,
  `jornada` int(11) DEFAULT NULL,
  `id_local` int(11) DEFAULT NULL,
  `id_visitante` int(11) DEFAULT NULL,
  `goles_local` int(11) DEFAULT NULL,
  `goles_visitante` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `tipo` varchar(20) DEFAULT 'regular'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `partido`
--

INSERT INTO `partido` (`id_partido`, `id_torneo`, `jornada`, `id_local`, `id_visitante`, `goles_local`, `goles_visitante`, `fecha`, `estado`, `tipo`) VALUES
(1, 1, 1, 3, 8, 2, 1, '2026-03-01', 'jugado', 'regular'),
(2, 1, 1, 2, 10, 6, 2, '2026-03-01', 'jugado', 'regular'),
(3, 1, 1, 1, 11, 6, 0, '2026-03-01', 'jugado', 'regular'),
(4, 1, 1, 9, 4, 0, 1, '2026-03-01', 'jugado', 'regular'),
(5, 1, 1, 5, 6, 3, 3, '2026-03-01', 'jugado', 'regular'),
(6, 1, 1, 7, NULL, NULL, NULL, '2026-03-01', 'descansa', 'regular'),
(7, 1, 2, 1, 3, NULL, NULL, '2026-04-05', 'pendiente', 'regular'),
(8, 1, 2, 2, 4, NULL, NULL, '2026-04-05', 'pendiente', 'regular'),
(9, 1, 2, 5, 9, NULL, NULL, '2026-04-05', 'pendiente', 'regular'),
(10, 1, 2, 6, 10, NULL, NULL, '2026-04-05', 'pendiente', 'regular'),
(11, 1, 2, 7, 11, NULL, NULL, '2026-04-05', 'pendiente', 'regular'),
(12, 1, 2, 8, NULL, NULL, NULL, '2026-04-05', 'descansa', 'regular'),
(13, 2, 4, 16, 18, 3, 0, '2026-03-01', 'jugado', 'regular'),
(14, 2, 4, 15, 20, 2, 0, '2026-03-01', 'jugado', 'regular'),
(15, 2, 4, 14, 19, 3, 0, '2026-03-01', 'jugado', 'regular'),
(16, 2, 4, 17, 12, 0, 4, '2026-03-01', 'jugado', 'regular'),
(17, 2, 4, 13, NULL, NULL, NULL, '2026-03-01', 'descansa', 'regular'),
(18, 3, 9, 29, 36, 10, 2, '2026-03-01', 'jugado', 'regular'),
(19, 3, 9, 28, 24, 2, 4, '2026-03-01', 'jugado', 'regular'),
(20, 3, 9, 26, 30, 1, 3, '2026-03-01', 'jugado', 'regular'),
(21, 3, 9, 31, 38, 8, 0, '2026-03-01', 'jugado', 'regular'),
(22, 3, 9, 23, 25, 3, 4, '2026-03-01', 'jugado', 'regular'),
(23, 3, 9, 32, 21, 1, 2, '2026-03-01', 'jugado', 'regular'),
(24, 3, 9, 34, 33, 2, 3, '2026-03-01', 'jugado', 'regular'),
(25, 3, 9, 35, 37, NULL, NULL, '2026-03-01', 'pospuesto', 'regular'),
(26, 4, 1, 39, 40, 2, 7, '2026-05-17', 'jugado', 'regular');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torneo`
--

CREATE TABLE `torneo` (
  `id_torneo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `temporada` varchar(20) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `anio` int(11) DEFAULT 2026
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `torneo`
--

INSERT INTO `torneo` (`id_torneo`, `nombre`, `categoria`, `temporada`, `estado`, `anio`) VALUES
(1, 'Varonil 1ra Fuerza — Clausura 2026', 'Primera Fuerza', 'Clausura', 'activo', 2026),
(2, 'Femenil 1ra Fuerza — Clausura 2026', 'Femenil', 'Clausura', 'activo', 2026),
(3, 'Varonil 2da Fuerza — Apertura 2026', 'Segunda Fuerza', 'Apertura', 'activo', 2026),
(4, 'Prueba 1', 'Primera Fuerza', 'Clausura', 'activo', 2026);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `anotador`
--
ALTER TABLE `anotador`
  ADD PRIMARY KEY (`id_anotador`),
  ADD KEY `id_partido` (`id_partido`),
  ADD KEY `id_jugador` (`id_jugador`);

--
-- Indices de la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id_equipo`),
  ADD KEY `id_torneo` (`id_torneo`);

--
-- Indices de la tabla `jugador`
--
ALTER TABLE `jugador`
  ADD PRIMARY KEY (`id_jugador`),
  ADD KEY `id_equipo` (`id_equipo`);

--
-- Indices de la tabla `partido`
--
ALTER TABLE `partido`
  ADD PRIMARY KEY (`id_partido`),
  ADD KEY `id_torneo` (`id_torneo`),
  ADD KEY `id_local` (`id_local`),
  ADD KEY `id_visitante` (`id_visitante`);

--
-- Indices de la tabla `torneo`
--
ALTER TABLE `torneo`
  ADD PRIMARY KEY (`id_torneo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `anotador`
--
ALTER TABLE `anotador`
  MODIFY `id_anotador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id_equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `jugador`
--
ALTER TABLE `jugador`
  MODIFY `id_jugador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `partido`
--
ALTER TABLE `partido`
  MODIFY `id_partido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `torneo`
--
ALTER TABLE `torneo`
  MODIFY `id_torneo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `anotador`
--
ALTER TABLE `anotador`
  ADD CONSTRAINT `anotador_ibfk_1` FOREIGN KEY (`id_partido`) REFERENCES `partido` (`id_partido`) ON DELETE CASCADE,
  ADD CONSTRAINT `anotador_ibfk_2` FOREIGN KEY (`id_jugador`) REFERENCES `jugador` (`id_jugador`) ON DELETE CASCADE;

--
-- Filtros para la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD CONSTRAINT `equipo_ibfk_1` FOREIGN KEY (`id_torneo`) REFERENCES `torneo` (`id_torneo`);

--
-- Filtros para la tabla `jugador`
--
ALTER TABLE `jugador`
  ADD CONSTRAINT `jugador_ibfk_1` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

--
-- Filtros para la tabla `partido`
--
ALTER TABLE `partido`
  ADD CONSTRAINT `partido_ibfk_1` FOREIGN KEY (`id_torneo`) REFERENCES `torneo` (`id_torneo`),
  ADD CONSTRAINT `partido_ibfk_2` FOREIGN KEY (`id_local`) REFERENCES `equipo` (`id_equipo`),
  ADD CONSTRAINT `partido_ibfk_3` FOREIGN KEY (`id_visitante`) REFERENCES `equipo` (`id_equipo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
