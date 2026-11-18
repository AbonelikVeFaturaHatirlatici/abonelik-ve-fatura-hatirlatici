# C4 Diagrams: Subscription Reminder
 
GitHub renders the Mermaid diagrams on this page automatically. The text on each arrow says what is carried over that connection.
 
## Level 1: System context (system boundary)
 
Who uses the system, and who does the system talk to?
 
```mermaid
flowchart LR
    user["<b>User</b><br/>Person who tracks their subscriptions"]
 
    subgraph boundary["System boundary: Subscription Reminder"]
        system["<b>Subscription Reminder</b><br/>Stores subscriptions, generates<br/>reminders before renewal"]
    end
 
    services["<b>Subscription services</b><br/>(Netflix, Spotify, etc.)<br/>NO integration"]
    push["<b>Push notification service</b><br/>NOT in the first release<br/>(a mock record is kept)"]
 
    user -->|"adds and lists subscriptions,<br/>removes them from tracking; sees reminders"| system
    system -.->|"no real notification is sent"| push
    system -.->|"never touches the real subscription"| services
```
 
**Inside the system boundary:** the mobile app, the backend API and the database.
 
**Outside the system boundary (on purpose):**
- Subscription services: The app only stores what the user enters. Removing a subscription from tracking does not cancel the real subscription at the service.
- Real push notifications: The first release keeps a mock record (`NotificationPort` interface, `MockNotifier` implementation).
- Payments, banking, reading e-mail, multiple currencies, iOS.
## Level 2: Containers
 
Which running parts does the system consist of, and how do they talk to each other?
 
```mermaid
flowchart TB
    user["<b>User</b>"]
 
    subgraph system["Subscription Reminder"]
        mobile["<b>Mobile app</b><br/>React Native + Expo (TypeScript)<br/>Android"]
 
        subgraph apiBox["<b>Backend API</b>  (FastAPI, single process)"]
            http["API layer<br/>register, login, subscription and reminder endpoints"]
            domain["Domain module<br/>next_renewal, reminder rule<br/>(pure functions)"]
            scheduler["Daily job (APScheduler)<br/>every day at 09:00 Europe/Istanbul"]
            notification["NotificationPort<br/>MockNotifier"]
        end
 
        db[("<b>PostgreSQL</b><br/>users, subscriptions, reminders")]
    end
 
    user -->|"taps"| mobile
    mobile -->|"HTTPS, JSON, JWT<br/>(contract: api/openapi.yaml)"| http
    http --> domain
    http -->|"SQL"| db
    scheduler --> domain
    scheduler -->|"adds reminders<br/>(unique constraint prevents duplicates)"| db
    scheduler --> notification
```
 
| Part | Responsibility | Decision record |
|---|---|---|
| Mobile app | Screens (login, subscription list, add), API calls; internals in Level 3 | ADR-004 |
| API layer | Request validation, authentication (JWT), responses | ADR-001, ADR-004 |
| Domain module | Renewal date and reminder rules; independent of web and database | ADR-003 |
| Daily job | Generates the reminders for 3 days and 1 day before renewal | ADR-002 |
| NotificationPort | Notification interface; mock record in the first release | ADR-002 |
| PostgreSQL | Persistent data; unique constraints also protect the rules in the database | ADR-002, ADR-003 |
 
How it runs: Docker Compose starts two containers: `api` (API + daily job) and `db` (PostgreSQL). The mobile app runs on the device. In the Android emulator the API address is `http://10.0.2.2:8000`.
 
Change introduced in Sprint 2: The mobile app calls the API through a typed client generated from the `api/openapi.yaml` contract (S2-06). During development, the Prism mock server can be used before the backend is ready.
 
## Level 3: Components (Backend API)
 
The inside of the `api` container. The text on each arrow says what is carried. Dependencies point one way only: `domain/` depends on nothing (ADR-001).
 
Status note: At the end of Sprint 1 the code contains only `domain/` (renewal, reminders), `infra/` (config, db, errors, models) and the `/health` endpoint. The routers, the security layer, the daily job and `MockNotifier` are design and have not been written yet.
 
```mermaid
flowchart TB
    mobile["<b>Mobile app</b>"]
    db[("<b>PostgreSQL</b>")]
 
    subgraph api["Backend API (FastAPI, single process)"]
        subgraph apiLayer["API layer (routers)"]
            routerAuth["<b>auth router</b><br/>POST /auth/register<br/>POST /auth/login"]
            routerSub["<b>subscriptions router</b><br/>POST, GET /subscriptions<br/>GET /subscriptions/{id}<br/>POST /subscriptions/{id}/cancel"]
            routerRem["<b>reminders router</b><br/>GET /reminders"]
            security["<b>Security</b><br/>JWT creation and verification (24 hours)<br/>argon2 password hash"]
            errors["<b>Error handler</b><br/>app/infra/errors.py<br/>one format: { code, message }"]
        end
 
        subgraph domainLayer["Domain module (app/domain), pure functions"]
            renewal["<b>renewal</b><br/>next_renewal(start, period, after)"]
            reminders["<b>reminders</b><br/>due_reminders(start, period,<br/>created_on, today)"]
        end
 
        subgraph dataLayer["Data layer (app/infra)"]
            repo["<b>Models and data access</b><br/>users, subscriptions, reminders<br/>SQLAlchemy + Alembic"]
        end
 
        subgraph jobLayer["Scheduler"]
            dailyJob["<b>Daily reminder job</b><br/>APScheduler, 09:00 Europe/Istanbul"]
        end
 
        subgraph notifyLayer["Notification"]
            port["<b>NotificationPort</b><br/>(interface)"]
            mock["<b>MockNotifier</b><br/>sets the record to sent_mock"]
        end
    end
 
    mobile -->|"HTTPS, JSON, Bearer JWT"| routerAuth
    mobile -->|"HTTPS, JSON, Bearer JWT"| routerSub
    mobile -->|"HTTPS, JSON, Bearer JWT"| routerRem
 
    routerAuth -->|"password hash, token"| security
    routerSub -->|"token verification"| security
    routerRem -->|"token verification"| security
    routerSub -->|"renewal date calculation"| renewal
    routerRem -->|"list query"| repo
    routerSub -->|"subscription create, list, cancel"| repo
    routerAuth -->|"user create, look up by e-mail"| repo
    routerAuth -.->|"400, 401, 409"| errors
    routerSub -.->|"400, 404, 409"| errors
 
    dailyJob -->|"active subscriptions"| repo
    dailyJob -->|"today, start date, period"| reminders
    reminders --> renewal
    dailyJob -->|"inserts new reminder<br/>(unique constraint rejects duplicates)"| repo
    dailyJob -->|"send(reminder)"| port
    port --- mock
    mock -->|"sets status to sent_mock"| repo
 
    repo -->|"SQL"| db
```
 
| Component | Responsibility | Decision record |
|---|---|---|
| auth router | Register and login; lower-cases the e-mail, returns a token | ADR-004 |
| subscriptions router | Create, list, get one, cancel a subscription; ownership check | ADR-001 |
| reminders router | The user's reminder list | ADR-002 |
| Security | JWT (24 hours), argon2; secret key comes from the `JWT_SECRET` environment variable | ADR-004 |
| Error handler | `app/infra/errors.py`; returns every error as `{ code, message }` (codes in English, messages in Turkish) | ADR-004 |
| renewal | Renewal date: calculated from the start date, last day of the month in short months | ADR-003 |
| reminders (domain) | Reminders due today for 3 days and 1 day before; does not generate one that falls in the past, catches up on missed ones | ADR-002 |
| Models and data access | `app/infra/models.py`, `db.py`; database access; partial unique indexes and CHECK constraints are in the schema | ADR-001, ADR-003 |
| Daily reminder job | Every day at 09:00; inserts the record and hands it to `NotificationPort`; silently skips a unique-constraint error | ADR-002 |
| NotificationPort / MockNotifier | Mock record instead of real push; if real push is added, only the adapter changes | ADR-002 |
 
## Level 3: Components (Mobile app)
 
The inside of the Android app (React Native + Expo, TypeScript). In Sprint 2 the screens are built from the Figma mockups (S2-04, S2-05).
 
```mermaid
flowchart TB
    user["<b>User</b>"]
    api["<b>Backend API</b><br/>(10.0.2.2:8000 in the emulator)"]
 
    subgraph mobile["Mobile app (mobile/)"]
        nav["<b>Navigation</b><br/>moves between the 3 screens"]
        subgraph screens["Screens"]
            login["<b>Login and register</b>"]
            list["<b>Subscription list</b><br/>reminder label: sent (mock)"]
            add["<b>Add subscription</b><br/>cancel confirmation warning"]
        end
        client["<b>Typed API client</b><br/>generated from openapi.yaml"]
        storage["<b>Token storage</b><br/>Expo SecureStore (JWT)"]
        errorMap["<b>Error mapping</b><br/>{ code, message } → Turkish message"]
    end
 
    user -->|"taps, fills in forms"| login
    user -->|"taps"| list
    user -->|"taps, fills in forms"| add
    nav --- login
    nav --- list
    nav --- add
    login -->|"e-mail, password"| client
    list -->|"list and cancel calls"| client
    add -->|"new subscription data"| client
    client -->|"read, write token"| storage
    client -->|"HTTPS, JSON, Bearer JWT"| api
    client -->|"error body"| errorMap
    errorMap -->|"text to show the user"| screens
```
 
| Component | Responsibility |
|---|---|
| Navigation | Moves between the login, list and add screens |
| Screens | Show the empty, filled and error states; do not make network calls on their own |
| Typed API client | Types are generated from the contract (never edited by hand); all network calls go through it |
| Token storage | The JWT is kept in secure storage on the device |
| Error mapping | Turns errors such as 400, 401 and 409 into Turkish messages (D-19) |
 
These diagrams are consistent with the class and sequence diagrams in `docs/architecture/uml.md`. Class names are the same as in the domain module.
 