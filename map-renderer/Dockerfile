FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

CMD ["/app/entrypoint.sh"]
