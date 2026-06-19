-- Create schemas for the Medallion Architecture
CREATE SCHEMA IF NOT EXISTS bronze;
CREATE SCHEMA IF NOT EXISTS silver;
CREATE SCHEMA IF NOT EXISTS gold;

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS bronze.restocks CASCADE;
DROP TABLE IF EXISTS bronze.stocklogs CASCADE;
DROP TABLE IF EXISTS bronze.orders CASCADE;
DROP TABLE IF EXISTS bronze.products CASCADE;
DROP TABLE IF EXISTS bronze.users CASCADE;

-- 1. Create Bronze Users Table (Raw Staging)
CREATE TABLE bronze.users (
    _id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(50),
    createdAt VARCHAR(100),
    updatedAt VARCHAR(100),
    __v INT
);

-- 2. Create Bronze Products Table (Raw Staging)
CREATE TABLE bronze.products (
    _id VARCHAR(50) PRIMARY KEY,
    productName VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    price NUMERIC(12, 2),
    quantity INT,
    reorderLevel INT,
    warehouseLocation VARCHAR(50),
    createdAt VARCHAR(100),
    updatedAt VARCHAR(100),
    __v INT
);

-- 3. Create Bronze Orders Table (Raw Staging)
CREATE TABLE bronze.orders (
    _id VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(50),
    productId VARCHAR(50),
    quantity INT,
    totalAmount NUMERIC(12, 2),
    status VARCHAR(50),
    createdAt VARCHAR(100),
    updatedAt VARCHAR(100),
    __v INT,
    customer VARCHAR(50),
    product VARCHAR(50),
    totalPrice NUMERIC(12, 2),
    deliverypartner VARCHAR(50)
);

-- 4. Create Bronze Stocklogs Table (Raw Staging)
CREATE TABLE bronze.stocklogs (
    _id VARCHAR(50) PRIMARY KEY,
    productId VARCHAR(50),
    userId VARCHAR(50),
    action VARCHAR(50),
    quantity INT,
    reason TEXT,
    createdAt VARCHAR(100),
    updatedAt VARCHAR(100),
    __v INT
);

-- 5. Create Bronze Restocks Table (Raw Staging)
CREATE TABLE bronze.restocks (
    _id VARCHAR(50) PRIMARY KEY,
    productId VARCHAR(50),
    currentStock INT,
    requestedQuantity INT,
    status VARCHAR(50),
    createdAt VARCHAR(100),
    updatedAt VARCHAR(100),
    __v INT
);
