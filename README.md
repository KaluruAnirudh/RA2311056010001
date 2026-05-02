# RA2311056010001

Backend-only campus hiring evaluation project.

## Structure

```text
RA2311056010001/
├── logging_middleware/
├── vehicle_maintenance_scheduler/
├── notification_system_design.md
├── README.md
└── .gitignore
```

## Stack

- Node.js
- Express
- TypeScript

## Environment

Create `vehicle_maintenance_scheduler/.env` from `vehicle_maintenance_scheduler/.env.example`.

Required values:

```env
PORT=4000
EVALUATION_BASE_URL=http://20.207.122.201/evaluation-service
EVALUATION_ACCESS_TOKEN=replace_with_existing_access_token
```

Optional values:

```env
TOP_NOTIFICATION_LIMIT=10
```

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Endpoints

### Scheduler

- `GET /schedule`

### Notification APIs

- `GET /notifications`
- `GET /notifications/unread`
- `POST /notifications`
- `PUT /notifications/:id/read`
- `GET /notifications/top`

### Utility

- `GET /health`

## Sample Output

### `GET /schedule`

```json
{
  "results": [
    {
      "depotId": "depot-1",
      "selectedTasks": ["task-1", "task-4"],
      "totalDuration": 9,
      "totalImpact": 50
    }
  ]
}
```

### `GET /notifications/top`

```json
{
  "limit": 10,
  "results": [
    {
      "id": "notice-2",
      "type": "Placement",
      "message": "Round 2 results published",
      "timestamp": "2026-05-02T06:00:00.000Z",
      "score": 99.83
    }
  ]
}
```

## Notes

- The logging middleware reuses an existing bearer token from `.env`.
- Protected external API calls always send `Authorization: Bearer <token>`.
- If the external service is unavailable, request handlers still return internal validation or cached results where applicable, while logging failures are captured as handler errors.
