-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2025 at 02:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sakato`
--

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `id_barang` char(36) NOT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `stok_tersedia` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id_barang`, `nama_barang`, `stok_tersedia`, `created_at`, `updated_at`) VALUES
('4e7638c7-94e1-4bc6-916e-4c4b70b95d17', 'papan tulis', 10, '2025-10-09 01:31:03', '2025-10-09 01:31:03'),
('521f0afd-3626-4eee-8f88-c27f48da7b55', 'talenan', 10, '2025-10-09 01:31:34', '2025-10-09 01:31:34'),
('7bb95359-23c9-4d67-9dc7-3439d32a56ab', 'speaker', 10, '2025-10-09 01:32:02', '2025-10-09 01:32:02'),
('a9f16a36-b1ca-4e29-80bb-a74b64c1a62b', 'infocus', 10, '2025-10-09 01:32:07', '2025-10-09 01:32:07'),
('af3986e7-5670-485f-86eb-49e57f8ea3ab', 'pisau', 10, '2025-10-09 01:31:26', '2025-10-09 01:31:26'),
('cf93f4a4-1b67-41c7-ba70-566796ad1f77', 'mic', 10, '2025-10-09 01:32:25', '2025-10-09 01:32:25'),
('f8e8fe4a-67b4-4282-8eb7-3772a4b00c46', 'mandai', 10, '2025-10-09 01:31:41', '2025-10-09 01:31:41');

-- --------------------------------------------------------

--
-- Table structure for table `gambar_ruangan`
--

CREATE TABLE `gambar_ruangan` (
  `id_gambar_ruangan` char(36) NOT NULL,
  `id_ruangan` char(36) NOT NULL,
  `gambar` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gambar_ruangan`
--

INSERT INTO `gambar_ruangan` (`id_gambar_ruangan`, `id_ruangan`, `gambar`, `created_at`, `updated_at`) VALUES
('3a07fae7-775a-4621-8882-d574daef9b5f', 'e2558546-9ed8-49ac-af27-5439516eebeb', '1762275009598-basecamp.jpg', '2025-11-04 23:50:09', '2025-11-04 23:50:09'),
('59be6981-b988-11f0-a474-f85ea01d1a4f', '408a34e5-d98c-4627-8fe4-8c90893daca3', '1759950545939-basecamp.jpg', '2025-11-04 21:12:52', '2025-11-04 21:12:52'),
('b006df78-b988-11f0-a474-f85ea01d1a4f', '6fd5fa49-00d2-4bcb-b00c-773636d4ce12', '1760967508966-ruangan.jpg', '2025-11-04 21:15:16', '2025-11-04 21:15:16'),
('b006e6e4-b988-11f0-a474-f85ea01d1a4f', 'e31a115b-d3f4-42e5-9088-c889a2b1dafb', '1759949964287-ruang seminar.jpg', '2025-11-04 21:15:16', '2025-11-04 21:15:16'),
('bfead384-b988-11f0-a474-f85ea01d1a4f', 'f081c100-298c-4495-8333-24b954442211', '1759951834289-gazebo.jpg', '2025-11-04 21:15:43', '2025-11-04 21:15:43'),
('c61f10b3-4994-4fdd-a299-6d08197b840c', 'e2558546-9ed8-49ac-af27-5439516eebeb', '1762275009596-ruangan.jpg', '2025-11-04 23:50:09', '2025-11-04 23:50:09');

-- --------------------------------------------------------

--
-- Table structure for table `pengajuan`
--

CREATE TABLE `pengajuan` (
  `id_pengajuan` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `id_ruangan` char(36) NOT NULL,
  `tanggal_sewa` date NOT NULL,
  `waktu_mulai` time NOT NULL,
  `waktu_selesai` time NOT NULL,
  `surat_peminjaman` varchar(255) NOT NULL,
  `organisasi_komunitas` varchar(255) NOT NULL,
  `kegiatan` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengajuan`
--

INSERT INTO `pengajuan` (`id_pengajuan`, `id_user`, `id_ruangan`, `tanggal_sewa`, `waktu_mulai`, `waktu_selesai`, `surat_peminjaman`, `organisasi_komunitas`, `kegiatan`, `status`, `created_at`, `updated_at`) VALUES
('18c72d56-c6db-4ec9-9773-5f3e8a094400', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-11-08', '12:00:00', '17:00:00', '1762525107513-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'Departemen Sistem Informasi', 'Rapat', 'Disetujui', '2025-11-07 21:18:27', '2025-11-07 21:18:27'),
('4cd8e7ee-1a4d-4458-a172-413c54e33b3d', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-11-07', '12:00:00', '17:00:00', '1761669463951-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'HMSI', 'Rapat', 'Disetujui', '2025-10-28 23:37:44', '2025-10-28 23:37:44'),
('7bd17609-90fb-45d4-afcb-660001d5ed66', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-10-25', '13:00:00', '17:00:00', '1761552400507-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'BEM Fakultas Teknik', 'Rapat Persiapan Acara Seminar Nasional', 'Disetujui', '2025-10-27 15:06:40', '2025-10-27 15:06:40'),
('9b90bc2b-6ac2-432f-b4d5-65d7f3cb319e', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-10-29', '07:00:00', '17:00:00', '1761665995986-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'BEM FTI', 'Rapat Koordinasi', 'Disetujui', '2025-10-28 22:39:56', '2025-10-28 22:39:56'),
('a9be1bae-41ae-4adb-831a-5cdecbcf1ef7', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-11-05', '14:00:00', '16:30:00', '1762007983872-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'BEM Fakultas Teknik', 'Rapat Persiapan Acara Seminar Nasional', 'Disetujui', '2025-11-01 21:39:43', '2025-11-01 21:59:16'),
('b9faeece-4e31-4197-8302-453c5ff7801c', '9314804d-7484-4ff9-b3ab-009c033438b9', '408a34e5-d98c-4627-8fe4-8c90893daca3', '2025-10-28', '07:00:00', '17:00:00', '1760973833606-Jadwal Kuliah Ganjil 2025-2026 FTI -.pdf', 'BEM Fakultas Teknik', 'Rapat Persiapan Acara Seminar Nasional', 'Disetujui', '2025-10-20 22:23:53', '2025-10-21 22:05:59');

-- --------------------------------------------------------

--
-- Table structure for table `pengajuan_barang`
--

CREATE TABLE `pengajuan_barang` (
  `id_pengajuan_barang` char(36) NOT NULL,
  `id_pengajuan` char(36) NOT NULL,
  `id_barang` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengajuan_barang`
--

INSERT INTO `pengajuan_barang` (`id_pengajuan_barang`, `id_pengajuan`, `id_barang`, `created_at`, `updated_at`) VALUES
('103dfc95-bcf9-4329-91d2-5b50204eae1d', 'a9be1bae-41ae-4adb-831a-5cdecbcf1ef7', '7bb95359-23c9-4d67-9dc7-3439d32a56ab', '2025-11-01 21:59:17', '2025-11-01 21:59:17'),
('1149c436-da77-46fd-8023-93e6ae578e1e', '18c72d56-c6db-4ec9-9773-5f3e8a094400', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-11-07 21:18:27', '2025-11-07 21:18:27'),
('13d47561-8b91-424c-b7d9-6fbf87239c2a', '9b90bc2b-6ac2-432f-b4d5-65d7f3cb319e', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-10-28 22:39:56', '2025-10-28 22:39:56'),
('1894c448-8a96-438c-947c-062c7f090981', 'a9be1bae-41ae-4adb-831a-5cdecbcf1ef7', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-11-01 21:59:17', '2025-11-01 21:59:17'),
('499eaad7-6a1c-40c6-b0f8-11fd5cb3a9d8', '7bd17609-90fb-45d4-afcb-660001d5ed66', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-10-27 15:06:40', '2025-10-27 15:06:40'),
('7f8e812b-8c26-4342-8616-e031d76c6622', '18c72d56-c6db-4ec9-9773-5f3e8a094400', '7bb95359-23c9-4d67-9dc7-3439d32a56ab', '2025-11-07 21:18:27', '2025-11-07 21:18:27'),
('863394b8-cdf3-4f3d-8ce9-8e37353989b1', '18c72d56-c6db-4ec9-9773-5f3e8a094400', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-11-07 21:18:27', '2025-11-07 21:18:27'),
('89fd6e69-09ad-47d8-b515-a878d222f52c', '4cd8e7ee-1a4d-4458-a172-413c54e33b3d', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-10-28 23:37:44', '2025-10-28 23:37:44'),
('8a7297ec-ea0a-485c-b269-37897796a03c', '4cd8e7ee-1a4d-4458-a172-413c54e33b3d', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-10-28 23:37:44', '2025-10-28 23:37:44'),
('941c1e4b-456b-4bc3-91f6-5930ea8aea8f', 'a9be1bae-41ae-4adb-831a-5cdecbcf1ef7', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-11-01 21:59:17', '2025-11-01 21:59:17'),
('96b2a537-2cd0-4638-bdbb-a14de28575a0', 'b9faeece-4e31-4197-8302-453c5ff7801c', '4e7638c7-94e1-4bc6-916e-4c4b70b95d17', '2025-10-21 22:05:59', '2025-10-21 22:05:59'),
('bb459bd2-2ac2-4c1a-948c-c27ec1b190fc', '7bd17609-90fb-45d4-afcb-660001d5ed66', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-10-27 15:06:40', '2025-10-27 15:06:40'),
('bc7657ad-0fcb-4214-b93a-166f2e6d59eb', 'b9faeece-4e31-4197-8302-453c5ff7801c', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-10-21 22:05:59', '2025-10-21 22:05:59'),
('db47c500-e2d5-4451-a12c-01be121dab4f', '9b90bc2b-6ac2-432f-b4d5-65d7f3cb319e', '521f0afd-3626-4eee-8f88-c27f48da7b55', '2025-10-28 22:39:56', '2025-10-28 22:39:56');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id_review` char(36) NOT NULL,
  `id_pengajuan` char(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `review` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id_review`, `id_pengajuan`, `rating`, `review`, `created_at`, `updated_at`) VALUES
('32ca7224-91e9-4c1c-a8c2-0edc172a0fc2', '9b90bc2b-6ac2-432f-b4d5-65d7f3cb319e', 5, 'Bagus', '2025-11-01 22:35:30', '2025-11-01 22:35:30'),
('e5b36f8d-f607-43d5-81fc-c66573b823d7', 'a9be1bae-41ae-4adb-831a-5cdecbcf1ef7', 5, 'test', '2025-11-01 23:06:38', '2025-11-01 23:06:38'),
('f8c4520c-465b-4c5e-9346-105bfa08426b', '18c72d56-c6db-4ec9-9773-5f3e8a094400', 1, 'burik', '2025-11-09 00:48:59', '2025-11-09 00:48:59'),
('fea9cd72-e753-45a6-bc3f-a28d79cdc679', 'b9faeece-4e31-4197-8302-453c5ff7801c', 5, 'Bagus', '2025-10-21 23:14:03', '2025-10-21 23:14:03');

-- --------------------------------------------------------

--
-- Table structure for table `ruangan`
--

CREATE TABLE `ruangan` (
  `id_ruangan` char(36) NOT NULL,
  `nama_ruangan` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ruangan`
--

INSERT INTO `ruangan` (`id_ruangan`, `nama_ruangan`, `deskripsi`, `created_at`, `updated_at`) VALUES
('408a34e5-d98c-4627-8fe4-8c90893daca3', 'Ruang Basecamp', 'ruang basecamp bisa dijadikan tempat istirahat dan tempat rapat non formal ', '2025-10-09 02:09:05', '2025-10-09 02:09:05'),
('6fd5fa49-00d2-4bcb-b00c-773636d4ce12', 'Ruang', 'ruangan nyaman', '2025-10-20 20:38:29', '2025-10-20 20:38:29'),
('e2558546-9ed8-49ac-af27-5439516eebeb', 'Ruang A', 'ruangan nyaman bet', '2025-11-04 23:50:09', '2025-11-04 23:50:09'),
('e31a115b-d3f4-42e5-9088-c889a2b1dafb', 'Ruang Seminar', 'ruang seminar bisa memuat lebih dari 100 orang', '2025-10-09 01:59:24', '2025-10-09 01:59:24'),
('f081c100-298c-4495-8333-24b954442211', 'Ruang Gazebo', 'ruang gazebo bisa menampung hingga 15 orang', '2025-10-09 02:30:34', '2025-10-09 02:30:34');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `nohp` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `email`, `username`, `password`, `nama`, `nohp`, `created_at`, `updated_at`) VALUES
('529887ac-7215-421d-958a-24886e13ed3f', 'mahir1234@gmail.com', 'mahira123', '$2b$10$LsRRyGxUlHfdGII2.rAHG.qDVC5ZY20ZFnxLo75.1RmyyJF7ysgHC', 'mahiraaaaaaaa sistri', '08154234658', '2025-11-08 22:05:22', '2025-11-08 22:05:22'),
('9314804d-7484-4ff9-b3ab-009c033438b9', 'mahir@gmail.com', 'mahir', '$2b$10$yShX4KBdMNrXpolkmbG99OMALoHULGi4C6ezr6u0pZe4QQbLMpkyW', 'sistri mahira', '08214555445', '2025-10-13 22:04:40', '2025-10-13 22:12:44'),
('ad5a60e0-1e4f-45ca-b1bc-e12e21aecf49', 'mahir1234@gmail.com', 'mahira123', '$2b$10$K4hGjShQ7k3JMvx2U3BKsO7qgU2B9oxdLlAZQo9vvM9C/pQ.CsYqu', 'mahiraaaaaaaa sistri', '08154234658', '2025-11-08 22:05:22', '2025-11-08 22:05:22'),
('b8623ae9-28cb-4196-aebe-f8d4447e6493', 'meutia@gmail.com', 'meutia', '$2b$10$A9SafyMN70OhdJvabsOVIePpq29.sBgx48SfShnkClzVNzT/Hr84C', 'meutia', '081234567891', '2025-10-08 23:52:57', '2025-10-08 23:52:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id_barang`);

--
-- Indexes for table `gambar_ruangan`
--
ALTER TABLE `gambar_ruangan`
  ADD PRIMARY KEY (`id_gambar_ruangan`),
  ADD KEY `fk_gambar_ruangan_ruangan` (`id_ruangan`);

--
-- Indexes for table `pengajuan`
--
ALTER TABLE `pengajuan`
  ADD PRIMARY KEY (`id_pengajuan`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_ruangan` (`id_ruangan`);

--
-- Indexes for table `pengajuan_barang`
--
ALTER TABLE `pengajuan_barang`
  ADD PRIMARY KEY (`id_pengajuan_barang`),
  ADD KEY `id_pengajuan` (`id_pengajuan`),
  ADD KEY `id_barang` (`id_barang`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`),
  ADD KEY `id_pengajuan_review` (`id_pengajuan`);

--
-- Indexes for table `ruangan`
--
ALTER TABLE `ruangan`
  ADD PRIMARY KEY (`id_ruangan`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gambar_ruangan`
--
ALTER TABLE `gambar_ruangan`
  ADD CONSTRAINT `fk_gambar_ruangan_ruangan` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id_ruangan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pengajuan`
--
ALTER TABLE `pengajuan`
  ADD CONSTRAINT `id_ruangan` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id_ruangan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pengajuan_barang`
--
ALTER TABLE `pengajuan_barang`
  ADD CONSTRAINT `id_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_pengajuan` FOREIGN KEY (`id_pengajuan`) REFERENCES `pengajuan` (`id_pengajuan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `id_pengajuan_review` FOREIGN KEY (`id_pengajuan`) REFERENCES `pengajuan` (`id_pengajuan`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
