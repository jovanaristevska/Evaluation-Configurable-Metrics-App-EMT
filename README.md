# Configurable Metrics Evaluation App

A full-stack web application for evaluating answers produced by Large Language Models (e.g. GPT, Gemini, Claude) using **configurable evaluation metrics**.

The app is designed for domain experts — for example, doctors evaluating health-related answers. An expert uploads a JSON file containing health questions (e.g. *"Why does my head hurt?"*), the model that produced the answer, and the answer itself. The expert can then create a **workspace**, choose which evaluation **metrics** to apply (via a reusable **configuration**), and score each answer against those metrics. Existing workspaces can also be reused.

All workspaces, configurations, metrics, questions, answers, and evaluations are persisted in a **PostgreSQL** database.

## Features

- Upload questions, models, and answers as JSON to evaluate model output.
- Create a workspace with a brand-new configuration, or attach an existing configuration.
- Reuse and browse previously created workspaces.
- Configure which metrics are used per evaluation, including their order (`position`) and scoring scale (e.g. `1-5`, `0-1`).
- A library of 20 built-in metrics (accuracy, comprehensiveness, clarity, empathy, bias, harm, relevance, reasoning, factuality, plagiarism, and more), each with a description and value range.
- Metric suggestion endpoint that filters metrics by description, type, and domain.
- Drag-and-drop metric ordering in the UI (powered by `@dnd-kit`).
- Auto-generated REST API documentation via Swagger / OpenAPI (springdoc).

## Tech Stack

**Backend**
- Java 17
- Spring Boot 3.4.5 (Spring Web, Spring Data JPA)
- Hibernate / JPA
- PostgreSQL
- Lombok
- springdoc-openapi (Swagger UI)
- Maven (with the included Maven Wrapper)

**Frontend**
- React 18
- React Router
- react-select
- @dnd-kit (drag-and-drop)

**Infrastructure**
- Docker / Docker Compose (PostgreSQL 17.4)

## Project Structure

```
.
├── src/main/java/com/example/evaluation_project/
│   ├── config/          # CORS / web configuration
│   ├── dto/             # Request/response DTOs
│   ├── model/           # JPA entities (Workspace, Configuration, Metric, ...)
│   ├── repository/      # Spring Data JPA repositories
│   ├── service/         # Business logic (e.g. MetricService)
│   └── web/controller/  # REST controllers
├── src/main/resources/
│   └── application.properties
├── frontend/            # React application
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── 01_init.sql          # Database schema
├── 02_data.sql          # Seed data (metrics, sample configs/workspaces)
├── docker-compose.yml   # PostgreSQL container
└── pom.xml
```

## Database

The schema (`01_init.sql`) defines the core tables: `workspaces`, `configurations`, `configuration_metrics`, `metrics`, `models`, `questions`, `answers`, `evaluations`, `evaluation_metrics`, `memberships`, and `hef_users`.

A configuration groups a set of metrics (each with a position and scale). A workspace is linked to one configuration and holds the imported questions, answers, and the models that produced them. Evaluations store the expert's scores per metric.

Seed data (`02_data.sql`) inserts the 20 built-in metrics, three sample configurations, two sample workspaces, and a default `admin` user.

## Getting Started

### Prerequisites
- Java 17+
- Maven (or use the bundled `./mvnw` wrapper)
- Node.js & npm
- Docker & Docker Compose

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on host port **15432** and automatically runs `01_init.sql` and `02_data.sql` to create the schema and seed data.

Default credentials (see `docker-compose.yml`):
- Database: `evaluation_platform`
- User: `core`
- Password: `core`

### 2. Run the backend

```bash
./mvnw spring-boot:run
```

The Spring Boot application connects to the database using the settings in `src/main/resources/application.properties` and starts on **http://localhost:8080**.

Swagger UI is available at: **http://localhost:8080/swagger-ui.html**

### 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

The React app runs on **http://localhost:3000**. CORS is configured on the backend to allow requests from this origin.

## REST API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/api/configurations` | List all configurations |
| `GET`  | `/api/configurations/{id}/metrics` | Get metrics for a configuration (ordered) |
| `POST` | `/api/configurations` | Create a configuration together with a workspace |
| `GET`  | `/api/metrics` | List all available metrics |
| `POST` | `/api/metrics/suggest` | Suggest metrics by description, type, and domain |
| `GET`  | `/api/workspaces` | List all workspaces |
| `POST` | `/api/workspaces` | Create a workspace from an existing configuration |
| `POST` | `/api/workspaces/with-new-configuration` | Create a workspace with a new configuration and imported Q&A |
| `POST` | `/api/workspaces/import?configId={id}` | Import a workspace with questions/answers under a configuration |
| `GET`  | `/api/workspaces/{id}/qa` | Get questions and answers for a workspace |

## Configuration

Backend settings live in `src/main/resources/application.properties`. The default datasource points to the Dockerized PostgreSQL instance:

```properties
spring.datasource.url=jdbc:postgresql://localhost:15432/evaluation_platform
spring.datasource.username=core
spring.datasource.password=core
```

Adjust these values if you run PostgreSQL elsewhere or change the Docker Compose configuration.
