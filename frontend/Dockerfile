# ---- Build ----
FROM node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

WORKDIR /app
COPY frontend/ ./frontend/
COPY shared/ ./shared/

WORKDIR /app/frontend
RUN --mount=type=secret,id=maptiler_api_key \
    VITE_MAPTILER_API_KEY="$(cat /run/secrets/maptiler_api_key)" npm run build


# ---- Runtime ----
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
