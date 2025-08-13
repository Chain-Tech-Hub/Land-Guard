-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2024 at 11:42 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mzuniadmin`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `user_id` int(10) NOT NULL,
  `land_id` varchar(255) NOT NULL,
  `application_date` datetime NOT NULL DEFAULT current_timestamp(),
  `accepted` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `user_id`, `land_id`, `application_date`, `accepted`) VALUES
(10, 5, 'BLCH1', '2024-11-21 04:27:15', 2),
(11, 5, 'LIAR2', '2024-11-21 07:55:28', 2),
(12, 6, 'LIAR2', '2024-11-22 07:56:23', 2);

-- --------------------------------------------------------

--
-- Table structure for table `blockchain_transactions`
--

CREATE TABLE `blockchain_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_hash` varchar(255) NOT NULL,
  `title_deed_number` varchar(255) NOT NULL,
  `title_deed_name` varchar(255) NOT NULL,
  `land_code` varchar(255) NOT NULL,
  `owner_nation_id` varchar(255) NOT NULL,
  `owner_phone_number` varchar(255) NOT NULL,
  `land_type` varchar(255) NOT NULL,
  `land_layout_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blockchain_transactions`
--

INSERT INTO `blockchain_transactions` (`id`, `user_id`, `transaction_hash`, `title_deed_number`, `title_deed_name`, `land_code`, `owner_nation_id`, `owner_phone_number`, `land_type`, `land_layout_url`) VALUES
(35, 5, '22274789b529c780699f62616312d11f', '22274789b529c780699f62616312d11f', 'Joseph Matekenya', 'LIAR2', 'HK8HY6', '+265999254721', 'Commercial', 'www.api.googlemaps.com/apiKey/78.98.08.678.98.08.678.98.08.678.98.08.6'),
(37, 5, '783e4699c7eb3cc26602e7cb48fe74bd', '783e4699c7eb3cc26602e7cb48fe74bd', 'Joseph Matekenya', 'BLCH1', 'HK8HY6', '+265999254721', 'Customary', 'www.api.googlemaps.com/apiKey/11.45.32.2.311.45.32.2.311.45.32.2.311.45.32.2.3'),
(38, 6, '5e6c895706d57e9697cc2f9b14b91031', '5e6c895706d57e9697cc2f9b14b91031', 'Jacob Moses', 'LIAR2', 'H7W4KT5M', '+265999005432', 'Commercial', 'www.api.googlemaps.com/apiKey/78.98.08.678.98.08.678.98.08.678.98.08.6');

-- --------------------------------------------------------

--
-- Table structure for table `land`
--

CREATE TABLE `land` (
  `id` int(11) NOT NULL,
  `land_id` varchar(255) NOT NULL,
  `owner_id` int(11) DEFAULT 3,
  `description` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `land_loard` varchar(255) DEFAULT 'lands',
  `layout` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `land_status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `land`
--

INSERT INTO `land` (`id`, `land_id`, `owner_id`, `description`, `type`, `size`, `land_loard`, `layout`, `price`, `duration`, `land_status`) VALUES
(1, 'BLCH1', 5, 'close to market opposite with standard bank branch', 'Customary', '3.5', 'Lands', 'www.api.googlemaps.com/apiKey/11.45.32.2.311.45.32.2.311.45.32.2.311.45.32.2.3', 26.00, 99, 2),
(2, 'LIAR2', 6, 'Nsungwi filling station stadium', 'Commercial', '7', 'Lands', 'www.api.googlemaps.com/apiKey/78.98.08.678.98.08.678.98.08.678.98.08.6', 14.00, 99, 0);

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `applicant_id` int(11) DEFAULT NULL,
  `gr_number` varchar(255) NOT NULL,
  `endorsed` varchar(255) NOT NULL,
  `offer_accepted` varchar(255) NOT NULL,
  `developmental_charge` decimal(10,2) NOT NULL,
  `city_layout` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `title_deeds`
--

CREATE TABLE `title_deeds` (
  `id` int(11) NOT NULL,
  `appllication_number` varchar(255) NOT NULL,
  `deed_number` varchar(255) NOT NULL,
  `approved` varchar(255) NOT NULL,
  `expiary_date` date NOT NULL,
  `title_deed` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `title_deeds`
--

INSERT INTO `title_deeds` (`id`, `appllication_number`, `deed_number`, `approved`, `expiary_date`, `title_deed`, `type`) VALUES
(10, '11', '22274789b529c780699f62616312d11f', '1', '2123-11-22', 'Joseph Matekenya', 'Commercial'),
(11, '11', '16dd22520dcb39f9c3a74f1ce74f2ad9', '1', '2123-11-22', 'Joseph Matekenya', 'Commercial'),
(12, '10', '783e4699c7eb3cc26602e7cb48fe74bd', '1', '2123-11-22', 'Joseph Matekenya', 'Customary'),
(13, '12', '5e6c895706d57e9697cc2f9b14b91031', '1', '2123-11-22', 'Jacob Moses', 'Commercial');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `private_key` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `nation_id` varchar(256) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `role` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `phone_number`, `password`, `address`, `private_key`, `date_of_birth`, `email`, `nation_id`, `gender`, `role`) VALUES
(1, 'Min Of Lands', '+265123456789', '4321', 'Capital Hill, Lilongwe 1.Malawi', '4321', '0000-00-00', 'min@lands.gov.mw', 'Capital Hill', '[object Object]', 1),
(5, 'Joseph Matekenya', '+265999254721', 'joseph1347', 'P/Bag chiriri BT 3 Malawi', 'joseph1347', '0000-00-00', 'josephhy564@gmail.com', 'HK8HY6', '[object Object]', 0),
(6, 'Jacob Moses', '+265999005432', '13457', 'P.O.Box 234 Mzuzu 3', '1347', '0000-00-00', 'jacob@gmail.com', 'H7W4KT5M', '', 0),
(7, 'Mr Unyolo', '+265888001234', 'untolo1347', 'P/Bag 575A, Mzuzu, Malawi', 'unyolo1347', '0000-00-00', 'unyolo@lands.gov.mw', 'H68FD3M', '', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blockchain_transactions`
--
ALTER TABLE `blockchain_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `land`
--
ALTER TABLE `land`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `title_deeds`
--
ALTER TABLE `title_deeds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `blockchain_transactions`
--
ALTER TABLE `blockchain_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `land`
--
ALTER TABLE `land`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `title_deeds`
--
ALTER TABLE `title_deeds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
