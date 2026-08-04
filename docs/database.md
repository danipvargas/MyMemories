# Database

## Overview

The database stores users and their postcard collections.

Every postcard belongs to exactly one user.

Images are stored outside the database.

---

## Main entities

### User

Stores authentication and profile information.

Fields

- id (int): Database internal identifier of the user.
- username (str): Application public identifier of the user.
- email (str): User email to allow authentication and future option to send messages.
- password_hash (str): User password hash generated with pwdlib.
- profile_image_path (str): Path of the profile path.

---

### Postcard

Stores the postcard metadata.

Fields

- id (int): Database internal identifier of the postcard.
- user_id (int): Database id of the user who owns the postcard.
- title (str): Main title to be shown with the postcard.
- country (str): Country the postcard belongs to.
- region (Optional[str]): Region of the country where the postcard belongs to.
- city (Optional[str]): City the postcard belongs to.
- adquisition_date (Optional[date]): Date when the postcard was bought.
- adquisition_date_precision (Enum["day", "month", "year", "unknown"]): Precision of the given date.
- latitude (float): Latitude coordinate of the place of the postcard.
- longitude (float): Longitude coordinate of the place of the postcard.
- image_path (str): Path where the "big" image of the postcard is stored.
- cover_path (str): Path where the 3:2 cover image is stored.
- coordinates (Point): PostGIS geography point containing latitude and longitude.
- description (Optional[str]): Additional information about the postcard.

---

## Design decisions

- Serial integer id primary keys.
- Images stored on disk.
- PostgreSQL as primary database.
- SQLAlchemy ORM.
- The initial database seeds the admin user with `id=1`.
