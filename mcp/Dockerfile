FROM python:3.11-slim

WORKDIR /app

COPY . .
RUN pip install --no-cache-dir .

CMD ["sh", "-c", "alembic upgrade head && rejeki"]
