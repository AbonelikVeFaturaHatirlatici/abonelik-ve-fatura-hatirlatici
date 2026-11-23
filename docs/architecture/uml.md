# UML Diagrams: Subscription Reminder

GitHub renders the Mermaid diagrams on this page automatically. The diagrams are consistent with the `api/openapi.yaml` contract, `docs/architecture/db-semasi.md` and the ADRs; if they ever conflict, the contract and the ADRs win.

Contents: 1. Class diagram · 2. Sequence diagrams (login, create subscription, daily reminder job) · 3. State diagrams · 4. Deployment diagram (S2-12, added by DevOps)

## 1. Class diagram

Scope: User, Subscription, Reminder, Period and NotificationPort. The domain types (`Period`, `DueReminder`) are pure code; `User`, `Subscription` and `Reminder` correspond to the database tables.

```mermaid
classDiagram
    class User {
        +UUID id
        +string email
        +string passwordHash
        +datetime createdAt
    }
    class Subscription {
        +UUID id
        +UUID userId
        +string serviceName
        +int amountKurus
        +Period period
        +date startDate
        +SubscriptionStatus status
        +datetime createdAt
        +datetime cancelledAt
        +cancel()
    }
    class Reminder {
        +UUID id
        +UUID subscriptionId
        +date renewalDate
        +int daysBefore
        +date remindOn
        +ReminderStatus status
        +datetime createdAt
    }
    class Period {
        <<enumeration>>
        MONTHLY
        YEARLY
    }
    class SubscriptionStatus {
        <<enumeration>>
        ACTIVE
        CANCELLED
    }
    class ReminderStatus {
        <<enumeration>>
        CREATED
        SENT_MOCK
    }
    class DueReminder {
        <<value object>>
        +date renewalDate
        +int daysBefore
        +date remindOn
    }
    class NotificationPort {
        <<interface>>
        +send(reminder)
    }
    class MockNotifier {
        +send(reminder)
    }
    class ReminderJob {
        +run(today)
    }

    User "1" --> "0..*" Subscription : owns
    Subscription "1" --> "0..*" Reminder : generates
    Subscription --> Period
    Subscription --> SubscriptionStatus
    Reminder --> ReminderStatus
    ReminderJob ..> DueReminder : computes with due_reminders(...)
    ReminderJob --> NotificationPort : uses
    NotificationPort <|.. MockNotifier
    ReminderJob ..> Reminder : saves
    DueReminder ..> Period : next_renewal(start, period, after)
```

Notes:
- `User`, `Subscription` and `Reminder` match `backend/app/infra/models.py`, and `Period` and `DueReminder` match `backend/app/domain/`. `ReminderJob` is implemented by the functions in `backend/app/services/reminder_job.py`, `NotificationPort` by `backend/app/domain/notifications.py` and `MockNotifier` by `backend/app/infra/notifier.py`.
- The renewal date is not stored; it is computed from `start_date` and `period` with `next_renewal` (ADR-003).
- `(subscriptionId, renewalDate, daysBefore)` is unique; the database prevents duplicate reminders (ADR-002).
- A user can have only one active subscription with the same service name and period (409).
- A real push adapter can be added without changing `NotificationPort` (ADR-002).

## 2. Sequence diagrams

### 2.1 Login (`POST /auth/login`)

```mermaid
sequenceDiagram
    actor U as User
    participant M as Mobile app
    participant A as API (auth router)
    participant D as Database

    U->>M: enters e-mail and password
    M->>A: POST /auth/login { email, password }
    A->>A: lower-cases the e-mail, validates the format
    alt invalid request
        A-->>M: 400 { code, message }
    else valid request
        A->>D: look up user by e-mail
        D-->>A: user or nothing
        alt user not found or password does not match (argon2)
            A-->>M: 401 { code, message }
            M-->>U: Turkish error message
        else success
            A->>A: creates a JWT (24 hours)
            A-->>M: 200 { token }
            M->>M: stores the token in SecureStore
            M-->>U: subscription list screen
        end
    end
```

### 2.2 Create subscription (`POST /subscriptions`, 201 and 409)

```mermaid
sequenceDiagram
    actor U as User
    participant M as Mobile app
    participant A as API (subscriptions router)
    participant G as Security (JWT)
    participant D as Database

    U->>M: enters service name, amount, period, start date
    M->>A: POST /subscriptions + Bearer token
    A->>G: verify token
    alt token invalid
        A-->>M: 401 { code, message }
    else token valid
        A->>A: validates fields (amount at least 1 TRY, date range, period)
        alt validation error
            A-->>M: 400 { code, message }
        else valid
            A->>D: INSERT subscriptions (status = active)
            alt same user already has an active subscription with the same service name and period
                D-->>A: partial unique index violation
                A-->>M: 409 { code, message }
                M-->>U: "This subscription is already tracked" warning
            else record inserted
                D-->>A: subscription record
                A->>A: computes the renewal date with next_renewal(start, period, today)
                A-->>M: 201 subscription (including nextRenewalDate)
                M-->>U: list is refreshed
            end
        end
    end
```

### 2.3 Daily reminder job (including the duplicate-send constraint)

The job runs inside the API process every day at 09:00 (Europe/Istanbul) (ADR-002). The job has two phases and each can be repeated safely. Even if the job runs twice, or two API copies run, a reminder is saved and sent only once.

```mermaid
sequenceDiagram
    participant Z as Scheduler (APScheduler)
    participant J as ReminderJob
    participant R as domain.due_reminders
    participant D as Database
    participant N as NotificationPort (MockNotifier)

    Z->>J: triggers at 09:00 (today = Europe/Istanbul date)
    Note over J,D: Phase 1: generation
    J->>D: fetch active subscriptions
    D-->>J: subscription list
    loop each active subscription
        J->>R: due_reminders(start, period, created_on, today)
        R-->>J: reminders that are due (3 days and/or 1 day)
        J->>D: INSERT reminders (status = created) ON CONFLICT DO NOTHING
        Note over J,D: an existing (subscription_id, renewal_date, days_before) is skipped silently
    end
    Note over J,D: Phase 2: dispatch
    J->>D: select ids: status = created, remind_on <= today, renewal_date > today, subscription active
    D-->>J: reminder ids
    loop each reminder (own transaction)
        J->>D: lock the row (FOR UPDATE SKIP LOCKED)
        alt locked by another process, or already sent or cancelled
            D-->>J: no row
            J->>J: skip
        else row locked
            J->>N: send(reminder)
            alt send succeeded
                J->>D: status = sent_mock, commit
            else send failed
                J->>D: roll back (record stays created)
                Note over J: retried on the next run
            end
        end
    end
```

Rules (ADR-002): `R` is the first renewal day strictly after today; a record is inserted only if `remind_on ≤ today` and `remind_on ≥` the day the subscription was added. A record is sent only if its status is `created`, `remind_on ≤ today` and `renewal_date > today`. If the server is down at 09:00, the reminders that are due are generated and sent on the next run. On the renewal day `R` moves to the next period, so no reminder is produced for that day. Known limitation: if a subscription is added on a reminder day after 09:00, that day's reminder is not generated. A cancelled subscription gets no new reminders; existing ones stay in the list but are not sent.

## 3. State diagrams

### 3.1 Subscription

```mermaid
stateDiagram-v2
    [*] --> active : POST /subscriptions (201)
    active --> cancelled : POST /subscriptions/{id}/cancel (200)
    cancelled --> [*]
    note right of cancelled
        Cancelling again returns 409.
        No new reminders are generated; existing ones stay in the list.
        The real subscription at the service is not cancelled.
    end note
```

### 3.2 Reminder

```mermaid
stateDiagram-v2
    [*] --> created : daily job inserts the record
    created --> sent_mock : NotificationPort.send (MockNotifier)
    sent_mock --> [*]
    note right of created
        (subscription_id, renewal_date, days_before)
        is unique; a second record is rejected.
    end note
```

## 4. Deployment diagram

Docker Compose (`api` and `db` containers) on the host machine and the React Native (Expo) mobile app running on the Android Emulator ([ADR-001](../adr/ADR-001-moduler-monolit.md), [ADR-004](../adr/ADR-004-teknoloji-secimi.md)).

```mermaid
flowchart LR
    subgraph Emulator["Android Emulator"]
        Mobile["Mobile App (React Native + Expo)\nExpo SecureStore (JWT)"]
    end

    subgraph Host["Host Machine (Docker Compose)"]
        API["Container: abonelik_api (api)\nFastAPI + Uvicorn + APScheduler\nPort: 8000:8000"]
        DB[("Container: abonelik_db (db)\nPostgreSQL 16-alpine\nPort: 5432:5432")]
        BindMount["./backend -> /app\n(backend/.env)"]
        PgVolume[("Volume: postgres_data\n-> /var/lib/postgresql/data")]
    end

    Mobile -->|"HTTP / JSON (Bearer JWT)\nhttp://10.0.2.2:8000"| API
    API -->|"SQLAlchemy / TCP\npostgresql://db:5432/abonelik"| DB
    BindMount -.-> API
    DB -.-> PgVolume
```

Notes:
- The Android Emulator reaches the host machine's port `8000` via `http://10.0.2.2:8000`.
- `api` waits for `db` (`pg_isready` healthcheck) and runs `alembic upgrade head` on startup.
- Runtime configuration is read from `backend/.env` (template: `backend/.env.example` with `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `TZ=Europe/Istanbul`).

## Related documents
- Decision records: [ADR-001](../adr/ADR-001-moduler-monolit.md), [ADR-002](../adr/ADR-002-hatirlatma-uretimi.md), [ADR-003](../adr/ADR-003-para-ve-tarih.md), [ADR-004](../adr/ADR-004-teknoloji-secimi.md)
- Component and container view: [c4-diyagramlar.md](c4-diyagramlar.md)
- Data model: [db-semasi.md](db-semasi.md)