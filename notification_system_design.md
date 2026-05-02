# Notification System Design

## Stage 1: API Design

### `GET /notifications`

- Headers:
  - `Accept: application/json`
- Response:

```json
{
  "data": [
    {
      "id": "1",
      "studentId": "s101",
      "type": "Placement",
      "message": "Interview schedule updated",
      "isRead": false,
      "createdAt": "2026-05-02T06:00:00.000Z"
    }
  ]
}
```

### `GET /notifications/unread`

- Headers:
  - `Accept: application/json`
- Response:

```json
{
  "data": [
    {
      "id": "1",
      "studentId": "s101",
      "type": "Result",
      "message": "Assessment result available",
      "isRead": false,
      "createdAt": "2026-05-02T06:00:00.000Z"
    }
  ]
}
```

### `POST /notifications`

- Headers:
  - `Content-Type: application/json`
- Request body:

```json
{
  "studentId": "s101",
  "type": "Event",
  "message": "Orientation starts at 9 AM"
}
```

- Response:

```json
{
  "data": {
    "id": "n-1",
    "studentId": "s101",
    "type": "Event",
    "message": "Orientation starts at 9 AM",
    "isRead": false,
    "createdAt": "2026-05-02T06:00:00.000Z"
  }
}
```

### `PUT /notifications/:id/read`

- Headers:
  - `Content-Type: application/json`
- Response:

```json
{
  "data": {
    "id": "n-1",
    "studentId": "s101",
    "type": "Event",
    "message": "Orientation starts at 9 AM",
    "isRead": true,
    "createdAt": "2026-05-02T06:00:00.000Z"
  }
}
```

## Stage 2: Database Design

### MySQL schema

```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  studentId VARCHAR(64) NOT NULL,
  type ENUM('Event', 'Result', 'Placement') NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Indexing strategy

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (studentId, isRead, createdAt DESC);

CREATE INDEX idx_notifications_type_created
ON notifications (type, createdAt DESC);
```

- `studentId + isRead + createdAt` supports inbox queries.
- `type + createdAt` supports analytics and placement-notification lookups.

### Scaling notes

- Partition large tables by time or tenant if volume grows.
- Use read replicas for heavy inbox traffic.
- Archive old notifications to cold storage.

## Stage 3: Query Optimization

### Why the original query is slow

```sql
SELECT * FROM notifications
WHERE studentID = ? AND isRead = false
ORDER BY createdAt DESC;
```

- Without a composite index, MySQL may scan many rows for a student.
- Sorting by `createdAt` adds extra work after filtering.
- `SELECT *` can read more data than needed.

### Better index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (studentId, isRead, createdAt DESC);
```

### Optimized query

```sql
SELECT id, studentId, type, message, isRead, createdAt
FROM notifications
WHERE studentId = ? AND isRead = FALSE
ORDER BY createdAt DESC
LIMIT 50;
```

### Placement notifications in the last 7 days

```sql
SELECT DISTINCT studentId
FROM notifications
WHERE type = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

## Stage 4: Performance Improvement

### Caching

- Cache unread counts and top notifications in Redis.
- Trade-off: cache invalidation complexity and stale reads.

### Pagination

- Use cursor or offset pagination for `/notifications`.
- Trade-off: cursor logic is slightly harder but scales better.

### Load balancing

- Run multiple stateless API instances behind a load balancer.
- Trade-off: sessionless design is required; file-based stores do not scale well.

### Indexing

- Composite indexes reduce scans and sort cost.
- Trade-off: slower writes and more storage use.

## Stage 5: System Design Fix

### Problems in the sequential version

- One slow channel delays all others.
- A single failure can stop later recipients.
- No retries for temporary delivery problems.
- No queue means no backpressure handling.

### Improved pseudocode

```text
function notify_all(student_ids, message):
  for student_id in student_ids:
    event = {
      student_id: student_id,
      message: message,
      attempts: 0
    }
    queue.publish("notification_jobs", event)

worker notification_consumer():
  while true:
    event = queue.consume("notification_jobs")
    try:
      parallel_execute(
        send_email(event.student_id, event.message),
        push_to_app(event.student_id, event.message),
        save_to_db(event.student_id, event.message)
      )
      queue.ack(event)
    catch transient_error:
      event.attempts += 1
      if event.attempts < 5:
        queue.retry_with_backoff("notification_jobs", event)
      else:
        queue.publish("notification_dead_letter", event)
        queue.ack(event)
```

### Queue choice

- RabbitMQ is good for work queues and retries.
- Kafka is good for high-throughput event streams and replay.

## Architecture Diagram

```text
client
  |
  v
express api
  |
  +--> notification service
  |      |
  |      +--> mysql
  |
  +--> logging middleware
  |      |
  |      +--> external log api
  |
  +--> worker queue
         |
         +--> email/push/db workers
```
