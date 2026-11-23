# Subscription Reminder (Abonelik Hatırlatıcı)

Subscription Reminder is a mobile application with an API server that lets users keep a list of their subscriptions (monthly or yearly, in TRY) and creates reminders 3 days and 1 day before each renewal. It is the SENG 321 Software Engineering course project of Team 11.

Sprint 1 documents (proposal, vision, OpenAPI contract, roles and RACI, Git-Flow workflow, product backlog): see [`docs/SPRINT-1-SUBMISSION.md`](docs/SPRINT-1-SUBMISSION.md). The API contract is [`api/openapi.yaml`](api/openapi.yaml).

---

## Setup and Run from Scratch (Docker Compose)

### 1. Prerequisites
Only **Docker Desktop** (with Compose) is required to run the system. You do not need to install Python, PostgreSQL or any other tool on your computer.

### 2. Environment Variables (.env)
After cloning the project, copy the example environment file for the backend:

```bash
# Linux / macOS
cp backend/.env.example backend/.env

# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
```

> **Note:** The `backend/.env` file may contain secrets, so it is protected by `.gitignore` and must never be committed to git. For local development you can replace the `JWT_SECRET` value in the file with any random key you like.

### 3. Starting the Services
In the project root directory, run the following command to build and start the API (`api`) and PostgreSQL (`db`) services in the background:

```bash
docker compose up -d --build
```

To check the status of the containers:
```bash
docker compose ps
```

To follow the live logs:
```bash
docker compose logs -f api
```

### 4. Verifying the Setup
To verify that the setup works, open the health check address in your browser or terminal:

- **Address:** http://localhost:8000/health
- **Expected response (HTTP 200):**
  ```json
  {"status": "ok"}
  ```
If you see this response, the API and PostgreSQL are running successfully.

### 5. Stopping the Services (Important)
- **Stop and keep the data:**
  ```bash
  docker compose down
  ```
  This command stops and removes the containers, but your database data (the `postgres_data` named volume) is **kept**.

- **Stop and delete all data (WARNING):**
  ```bash
  docker compose down -v
  ```
  > **WARNING:** The `-v` flag also deletes the database volume (`postgres_data`) completely, and all your data is lost. Do not use this command unless you want to start with a clean database.

---

## Local Development (Without Docker, Optional)

If you prefer to run the service with Python on your own machine instead of Docker:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Tests and Quality Checks

```bash
cd backend
ruff check .
pytest --cov=app --cov-fail-under=50
```
