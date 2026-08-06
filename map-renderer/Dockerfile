FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /app

COPY map-renderer/package.json map-renderer/package-lock.json ./

RUN npm ci --omit=dev

COPY map-renderer/src ./src
COPY shared/maps/style.json ./src/assets/style.json
COPY map-renderer/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

CMD ["/app/entrypoint.sh"]
