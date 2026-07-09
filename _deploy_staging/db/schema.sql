-- House of Moo Database Schema
-- Run: mysql -u root -p < server/db/schema.sql

CREATE DATABASE IF NOT EXISTS house_of_moo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE house_of_moo;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  short_desc     VARCHAR(500),
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) DEFAULT NULL,
  category       VARCHAR(100) NOT NULL,
  stock_status   ENUM('In Stock','Low Stock','Out of Stock','Restocking Soon') DEFAULT 'In Stock',
  stock_quantity INT NOT NULL DEFAULT 0,
  images         JSON,
  badge          VARCHAR(50) DEFAULT NULL,
  rating         DECIMAL(3,1) DEFAULT 0.0,
  review_count   INT DEFAULT 0,
  featured       TINYINT(1) DEFAULT 0,
  ingredients    TEXT DEFAULT NULL,
  specs          TEXT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  reference        VARCHAR(60) UNIQUE NOT NULL,
  customer_name    VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(25) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city    VARCHAR(100) DEFAULT '',
  delivery_state   VARCHAR(100) DEFAULT '',
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping_fee     DECIMAL(10,2) DEFAULT 2000.00,
  total            DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','paid','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  paystack_ref     VARCHAR(100) DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_id          INT NOT NULL,
  product_id        INT DEFAULT 0,
  product_name      VARCHAR(255) NOT NULL,
  quantity          INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spa_bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(25) NOT NULL,
  service_id     INT DEFAULT NULL,
  service_name   VARCHAR(255) NOT NULL,
  service_price  DECIMAL(10,2) DEFAULT NULL,
  booking_date   DATE NOT NULL,
  booking_time   VARCHAR(20) NOT NULL,
  notes          TEXT DEFAULT NULL,
  status         ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) DEFAULT 'Admin',
  role          ENUM('admin','attendant') NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restock_log (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL,
  quantity_added  INT NOT NULL,
  previous_qty    INT NOT NULL,
  new_qty         INT NOT NULL,
  restocked_by    INT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (restocked_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL,
  product_name    VARCHAR(255) NOT NULL,
  quantity        INT NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total           DECIMAL(10,2) NOT NULL,
  sale_type       ENUM('walk-in','online') NOT NULL DEFAULT 'walk-in',
  customer_name   VARCHAR(255) DEFAULT NULL,
  customer_phone  VARCHAR(25) DEFAULT NULL,
  recorded_by     INT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_reference   ON orders(reference);
CREATE INDEX idx_bookings_date      ON spa_bookings(booking_date);
CREATE INDEX idx_bookings_status    ON spa_bookings(status);
CREATE INDEX idx_sales_created      ON sales(created_at);
CREATE INDEX idx_sales_type         ON sales(sale_type);
