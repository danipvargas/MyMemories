FROM python:3.13-slim

WORKDIR /src

COPY pyproject.toml uv.lock ./

RUN pip install uv
RUN uv sync --frozen

COPY src ./src

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
