CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE date_precision AS ENUM (
    'YEAR',
    'MONTH',
    'DAY',
    'UNKNOWN'
);

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_path VARCHAR(60) NOT NULL
);

CREATE TABLE postcards (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path VARCHAR(60) NOT NULL,
    thumbnail_path VARCHAR (60) NOT NULL,
    adquisition_date DATE,
    adquisition_date_precision date_precision NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    region VARCHAR(50),
    coordinates geography(Point, 4326) NOT NULL,
    description TEXT
);
