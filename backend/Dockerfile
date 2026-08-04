FROM python:3.14-slim

WORKDIR /src

COPY pyproject.toml uv.lock ./

RUN pip install uv
RUN uv sync --frozen

COPY src ./src
COPY tests/media/default_profile.jpg ./seed/default_profile.jpg
COPY entrypoint.sh ./entrypoint.sh

RUN mkdir -p /app/storage/images/profiles \
    && mkdir -p /app/storage/images/postcards \
    && mkdir -p /app/storage/images/covers \
    && chmod +x ./entrypoint.sh

EXPOSE 8000

CMD ["/src/entrypoint.sh"]
