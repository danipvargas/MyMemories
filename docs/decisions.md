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

### Backend generates thumbnails

The frontend only provides the crop area.

Reason:
- Consistent thumbnail sizes.
- Single image processing pipeline.
- Easier to change thumbnail dimensions later.
