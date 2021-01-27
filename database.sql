-- --------------------------------------------------------
-- Server version:               10.3.25-MariaDB-0ubuntu0.20.04.1 - Ubuntu 20.04
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for iprwc_webshop
CREATE DATABASE IF NOT EXISTS `iprwc_webshop` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `iprwc_webshop`;

-- Dumping structure for table iprwc_webshop.order
CREATE TABLE IF NOT EXISTS `order` (
  `id` varchar(10) NOT NULL,
  `user_id` varchar(10) NOT NULL,
  `status` enum('received','shipped','delivered') NOT NULL DEFAULT 'received',
  `date` datetime NOT NULL DEFAULT curtime(),
  PRIMARY KEY (`id`),
  KEY `FK_order_user` (`user_id`),
  CONSTRAINT `FK_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table iprwc_webshop.order: ~8 rows (approximately)
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;

-- Dumping structure for table iprwc_webshop.order_line
CREATE TABLE IF NOT EXISTS `order_line` (
  `order_id` varchar(10) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `quantity` int(3) NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`) USING BTREE,
  KEY `FK_order_line_product` (`product_id`),
  CONSTRAINT `FK_order_line_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_order_line_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table iprwc_webshop.order_line: ~2 rows (approximately)
/*!40000 ALTER TABLE `order_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_line` ENABLE KEYS */;

-- Dumping structure for table iprwc_webshop.product
CREATE TABLE IF NOT EXISTS `product` (
  `id` varchar(10) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` varchar(300) NOT NULL,
  `image` text NOT NULL,
  `price` double(7,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table iprwc_webshop.product: ~7 rows (approximately)
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` (`id`, `title`, `description`, `image`, `price`) VALUES
	('0z0aE--d_r', 'Urban classics', 'Hoodie', 'https://i.postimg.cc/KzxLZRWs/0135da5b9815460da01ff8517db8c89f-1.jpg', 20.99),
	('1Xxt-yRK92', 'Gap sweater', 'Gele GAP Hoodie', 'https://i.postimg.cc/hGjjtKG0/Adjo-N5x6-Qx.png', 64.95),
	('CqAEQg7N3s', 'Chasin Gene', 'Sweater van chasin', 'https://i.postimg.cc/YC6pmRf4/9trs-Af6i4-S.jpg', 79.95),
	('P6qxhAryRL', 'Tommy Hilfiger', 'Zachte sweater van Tommy', 'https://i.postimg.cc/WpybRh14/Rs-H7q-XSge-N.jpg', 99.95),
	('QZNlef2HH9', 'MERCY LOGO HOODIE', 'Hoodie van mercy', 'https://i.postimg.cc/NjbFtKQM/ah4ap-LLf-NK.png', 59.95),
	('s5B5YiAhMU', 'Lyle en Scott', 'Zwarte hoodie', 'https://i.postimg.cc/qqWk2Z5K/F7ii4-LK4-X1.jpg', 45.00),
	('uxUMW-oD2t', 'Pier one', 'Gele hoodie van pier one', 'https://i.postimg.cc/bNxd66M1/Y6-CRB3ot6h.png', 22.99),
	('VsjaXgucJY', 'Club Hoodie', 'Witte hoodie van nike', 'https://i.postimg.cc/YCt0T6KZ/h-Nhj-BSq8-TP.png', 46.95),
	('x5eAj49tAA', 'Jack and jones', 'Olijf groene sweater', 'https://i.postimg.cc/XqrjG0Q3/s8ez-Aa-Mo-NB.jpg', 26.24),
	('XkJSrS7nxe', 'Nike Hoodie', 'Donger groene hoodie', 'https://i.postimg.cc/5tpbstrb/g6a-Hg-Lx-BPJ.jpg', 60.00);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;

-- Dumping structure for table iprwc_webshop.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `permission_group` enum('customer','admin') NOT NULL DEFAULT 'customer',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table iprwc_webshop.user: ~1 rows (approximately)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`id`, `name`, `email`, `password`, `permission_group`) VALUES
	('0ZWEZ_C0AX', 'Niels', 's1120245@student.hsleiden.nl', '$2a$07$KNM6ipEKttADb/HzzpHyseCNKARYHYDyQN5NcANqUBGC.azyH4iVq', 'customer'),
	('Vgf_BuORBV', 'Niels Prins', 'niels123.prins@gmail.com', '$2a$07$KNM6ipEKttADb/HzzpHyseCNKARYHYDyQN5NcANqUBGC.azyH4iVq', 'admin');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
