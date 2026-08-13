-- LaLiga Sports MySQL schema
CREATE DATABASE IF NOT EXISTS `ll_sports` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ll_sports`;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'admin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_category_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `short_description` TEXT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `discount_price` DECIMAL(12,2) NULL,
  `discount_percent` INT NULL,
  `sku` VARCHAR(100) NULL,
  `barcode` VARCHAR(100) NULL,
  `brand` VARCHAR(100) NULL,
  `team` VARCHAR(100) NULL,
  `season` VARCHAR(50) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_slug` (`slug`),
  KEY `idx_product_category` (`category_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_image_product` (`product_id`),
  CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_sizes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `size` VARCHAR(50) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_product_size_product` (`product_id`),
  CONSTRAINT `fk_product_size_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `content` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `author` VARCHAR(150) NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blog_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `offers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `discount_percent` INT NOT NULL DEFAULT 0,
  `product_ids` JSON NULL,
  `start_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `size` VARCHAR(50) NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` INT UNSIGNED NULL,
  `event` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_security_admin` (`admin_id`),
  CONSTRAINT `fk_security_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('siteName', 'LaLiga Sports'),
('footerText', 'بزرگترین و معتبرترین فروشگاه آنلاین لباس و تجهیزات ورزشی. ارائه‌دهنده جدیدترین کیت‌های باشگاهی و ملی با بالاترین کیفیت.'),
('whatsapp', '989120000000'),
('telegram', 'laligasports'),
('instagram', 'laligasports'),
('contactEmail', 'info@laligasports.ir'),
('address', 'تهران، خیابان ولیعصر، نبش کوچه اسپرت، پلاک ۱۲'),
('businessHours', 'شنبه تا پنجشنبه، ۱۰ صبح تا ۹ شب'),
('mapEmbedUrl', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8!2d51.401!3d35.734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ0JzAyLjQiTiA1McKwMjQnMDMuNiJF!5e0!3m2!1sen!2sus!4v1'),
('hero_backgroundImage', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1800&h=1000&fit=crop'),
('hero_eyebrow', 'به دلیل بازگشایی تازه سایت روی همه محصولاتی که از سایت خریده شود ۱۰ درصد تخفیف اعمال میشه'),
('hero_title', 'بازی رو'),
('hero_titleHighlight', 'تسخیر کن'),
('hero_subtitle', 'جدیدترین کیت‌های باشگاهی و ملی با بالاترین کیفیت اورجینال. انتخابی برای قهرمانان واقعی.'),
('hero_cta1Text', 'مشاهده کالکشن'),
('hero_cta1Link', '/products.html'),
('hero_cta2Text', 'تخفیف‌های ویژه'),
('hero_cta2Link', '/offers.html'),
('homepage_categoriesTitle', 'دسته‌بندی‌های محبوب'),
('homepage_categoriesSubtitle', 'بر اساس سبک بازی خود انتخاب کنید'),
('homepage_featuredTitle', 'محصولات برگزیده'),
('homepage_featuredSubtitle', 'محبوب‌ترین انتخاب‌های این ماه'),
('homepage_promoBanner_enabled', '0'),
('homepage_promoBanner_image', ''),
('homepage_promoBanner_title', ''),
('homepage_promoBanner_link', '');
