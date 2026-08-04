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

Backend

- FastAPI
- SQLAlchemy

Database

- PostgreSQL
- PostGIS (future)

Images

- Stored on disk
- Database stores only metadata and paths

---

## Design Principles

- Mobile first
- REST API
- Stateless backend
- Clean separation between frontend and backend
- Database independent from UI
