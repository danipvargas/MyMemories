# Architecture Decisions

## 2026-07-31

### PostgreSQL selected over SQLite

Reason:
- Better scalability.
- PostGIS support.
- Closer to production environments.

### Store images on disk

Images are stored in the filesystem instead of PostgreSQL BLOBs.

Reason:
- Smaller database.
- Easier backups.
- Easier CDN integration.

## 2026-08-03

### Backend processes uploaded images

The frontend creates the original image and the cover crop. The backend stores
both files after resizing them according to the image processing limits.

Reason:
- Consistent thumbnail sizes.
- Single image processing pipeline.
- Easier to change thumbnail dimensions later.

## 2026-08-04

### Separate original image and cover crop

The frontend creates two files when adding a postcard:

- The original image keeps a free aspect ratio and the user's crop and rotation.
- The cover uses a fixed 3:2 aspect ratio for consistent thumbnails.

The backend resizes both files but does not impose the cover crop.

### Seeded admin user

The initial database contains the admin user with `id=1`. The current MVP uses
this user for frontend integration while authentication is deferred.

### Location selection with OpenStreetMap

The add-postcard flow uses Leaflet and OpenStreetMap for manual coordinate
selection. The map is centered on Spain by default and does not perform
geocoding. The global map and detail maps remain deferred.

### Spanish searchable country selection

The frontend displays Spanish country names, stores ISO Alpha-2 codes, and
shows country flags. The backend keeps the country field as a string because
the API is private and the frontend controls the submitted values.
