# Architecture

## Overview

The project follows a classic client-server architecture.

Frontend
    React + Vite + TypeScript

↓

REST API

↓

Backend
    FastAPI

↓

PostgreSQL

↓

Image Storage

---

## Current Technology Stack

Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- React Router
- TanStack Query
- Leaflet + React Leaflet
- OpenStreetMap
- React Advanced Cropper

Backend

- FastAPI
- SQLAlchemy

Database

- PostgreSQL
- PostGIS

Images

- Stored on disk
- Database stores only metadata and paths

The frontend creates the user-selected original image and the 3:2 cover before
uploading both files to the REST API.

The current frontend integration uses the private admin user with `user_id=1`.
The API base URL is configured through `VITE_API_BASE_URL`.

---

## Design Principles

- Mobile first
- REST API
- Stateless backend
- Clean separation between frontend and backend
- Database independent from UI
