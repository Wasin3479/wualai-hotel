-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 07, 2025 at 03:47 PM
-- Server version: 5.7.15-log
-- PHP Version: 5.6.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `program_buntook`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `tel` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pin` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT 'pin6หลัก',
  `verify` int(11) NOT NULL DEFAULT '0' COMMENT '0=ยังไม่ยืนยัน',
  `logintype` enum('TEL','LINE','GOOGLE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEL',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'พ.ศ.  (DDMMYYYY)',
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` enum('individual','corporate') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `individual_document` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_document` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tel`, `pin`, `verify`, `logintype`, `first_name`, `last_name`, `birth_date`, `gender`, `email`, `user_type`, `individual_document`, `company_name`, `company_document`, `profile_picture`, `createAt`, `updateAt`) VALUES
(35, '0620243887', '140541', 0, 'TEL', 'ภานุวัฒน์', 'กาวิละ', '14052541', 'male', 'kompanuwat@gmail.com', 'corporate', NULL, 'pkbit', NULL, '/storage/users/35.jpg', '2024-09-24 17:54:34', '2025-05-20 07:48:09'),
(36, '0898899880', '000000', 0, 'TEL', ' จุติเสฏฐ์', 'โชติศุภอนัน์', '31012443', 'male', 'asiaoriel@gmail.com', 'corporate', NULL, 'asiaoriel', NULL, NULL, '2024-09-25 04:09:25', '2025-05-20 07:36:14'),
(37, '0899379279', '000000', 0, 'TEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-23 11:05:57', '2024-12-23 11:05:57'),
(38, '0805163593', '000000', 0, 'TEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-23 11:57:37', '2024-12-23 11:57:37'),
(39, '0659657707', '000000', 0, 'TEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-24 18:39:53', '2024-12-24 18:39:53'),
(40, '0808624872', '000000', 0, 'TEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-24 18:45:14', '2024-12-24 18:45:14'),
(41, '0800660096', '000000', 0, 'TEL', '', '', '', NULL, '', NULL, NULL, 'pkbit', NULL, NULL, '2025-03-17 06:56:14', '2025-03-17 06:56:23'),
(44, '0988589245', '000000', 0, 'TEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-07 11:32:19', '2025-05-07 11:32:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tel` (`tel`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
