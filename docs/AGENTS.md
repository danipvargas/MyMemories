# AGENTS

This document provides context for AI coding agents.

## Project

MyMemories

A mobile-first application for managing postcard collections.

Current scope is limited to postcards.

---

## Tech stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- TanStack Query
- Leaflet + React Leaflet
- OpenStreetMap
- React Advanced Cropper

Backend

- FastAPI
- SQLAlchemy

Database

- PostgreSQL

---

## Coding principles

- TypeScript everywhere.
- Functional React components.
- One component per file.
- Reusable UI.
- Prefer composition.
- Avoid duplicated logic.

---

## Frontend

- Mobile-first.
- Responsive.
- Spanish user interface.
- Use Tailwind utilities.
- Prefer shadcn components.

---

## Backend

- REST API.
- SQLAlchemy ORM.
- Images stored on disk.
- PostgreSQL.

---

## Current priorities

1. Mobile interface.
2. Album.
3. Add postcard.
4. Search.
5. Backend integration.

---

## Important decisions

- The original image uses a user-selected free crop and rotation.
- The cover uses a fixed 3:2 crop for thumbnails.
- The backend resizes uploaded images but does not choose the cover crop.
- Every postcard belongs to one user.
- Images are not stored as BLOBs.
- The current frontend MVP uses the seeded admin user with `user_id=1`.
