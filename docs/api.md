# Next.js Serverless API Documentation

## 1. Create Share Snapshot
- **Endpoint**: `POST /api/share`
- **Body**:
  ```json
  {
    "title": "Document Title.md",
    "content": "# Markdown Content",
    "expiresInDays": 30
  }
  ```
- **Response**:
  ```json
  {
    "id": "abc123xyz",
    "expiresAt": 1742650000000
  }
  ```

## 2. Retrieve Share Snapshot
- **Endpoint**: `GET /api/share/:id`
- **Response**: Returns document snapshot payload.
