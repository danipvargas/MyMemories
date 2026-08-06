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
    cover_path VARCHAR (60) NOT NULL,
    map_path VARCHAR(60),
    title VARCHAR(60) NOT NULL,
    adquisition_date DATE,
    adquisition_date_precision date_precision NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    region VARCHAR(50),
    coordinates geography(Point, 4326) NOT NULL,
    description TEXT
);

INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    profile_image_path
)
OVERRIDING SYSTEM VALUE
VALUES (
    1,
    'danipvargas',
    'danipvargas@gmail.com',
    '$argon2id$v=19$m=65536,t=3,p=4$J9Av0qb5xRVSlr2t3BeJdw$97yNsQB9XEgQtiRp2H/plALt+Ov5wRRVuzNV4c193xc',
    'profiles/default_profile.jpg'
)
ON CONFLICT DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    GREATEST(COALESCE((SELECT MAX(id) FROM users), 0) + 1, 1),
    false
);
