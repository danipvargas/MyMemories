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
    password_hash TEXT NOT NULL
);

CREATE TABLE postcards (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_path VARCHAR(50) NOT NULL,
    adquisition_date DATE,
    adquisition_date_precision date_precision NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    region VARCHAR(50),
    coordinates geometry(Point, 4326) NOT NULL,
    description TEXT
);
