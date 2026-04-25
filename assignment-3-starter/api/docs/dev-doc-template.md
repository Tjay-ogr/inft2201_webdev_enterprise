# Assignment 3 – Developer Documentation

## 1. Overview

This API provides authenticated access to mail messages. Users can log in to receive a JWT token and then use that token to access protected endpoints. The API enforces role-based access control (RBAC), logs requests using unique request IDs, applies rate limiting to prevent abuse, and uses a centralized error handler to return consistent responses.

---

## 2. Authentication

### 2.1 Auth Method

- Scheme: Bearer token (JWT)
- How to obtain a token:
  - Endpoint: `POST /auth/login`
  - Request body format:
    ```json
    {
      "username": "user1",
      "password": "user123"
    }
    ```
  - Example success response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### 2.2 Using the Token

- Required header for authenticated requests:
  - `Authorization: Bearer <token>`

Tokens are valid for **1 hour**. If the token is missing, invalid, or expired, the request will be rejected.

---

## 3. Roles & Access Rules

There are two roles in the system:

- `admin`
  - Can view any mail message.
- `user`
  - Can only view their own mail messages.

| Endpoint        | Method | admin         | user              |
|----------------|--------|--------------|------------------|
| `/mail/:id`    | GET    | ✅ all mail   | ✅ own mail only  |
| `/auth/login`  | POST   | ✅           | ✅               |
| `/status`      | GET    | ✅           | ✅               |

---

## 4. Endpoints

### 4.1 `POST /auth/login`

**Description:**  
Authenticate with username/password and receive a JWT.

**Request Body:**

```json
{
  "username": "user1",
  "password": "user123"
}

Success Response (200):

{
  "token": "..."
}

Notes:

Returns 400 if fields are missing
Returns 401 if credentials are invalid
4.2 GET /mail/:id

Description:
Retrieve a single mail message by ID.

Authentication:

Requires Authorization: Bearer <token> header.

Access Rules:

admin: may view any mail ID.
user: may view only mail where mail.userId matches their own userId.

Example Request:

curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"

Example Success Response (200):

{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}

Example Forbidden Response:

{
  "error": "Forbidden",
  "message": "Access denied",
  "statusCode": 403,
  "requestId": "abc-123",
  "timestamp": "2026-04-24T23:00:00Z"
}
4.3 GET /status

Description:
Simple health check to confirm the API is running.

Authentication:

None required.

Example Response (200):

{
  "status": "ok"
}
5. Rate Limiting

Rate limiting is implemented using an in-memory approach.

Keyed by: IP address
Limit: 5 requests per 60 seconds
Controlled by environment variables:
RATE_LIMIT_MAX
RATE_LIMIT_WINDOW_SECONDS

If the limit is exceeded:

{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded",
  "statusCode": 429,
  "requestId": "abc-456",
  "timestamp": "2026-04-24T23:30:00Z"
}

A Retry-After header is also included to indicate how long to wait before retrying.

6. Error Response Format

All errors follow a consistent JSON structure:

{
  "error": "ErrorType",
  "message": "Description of the issue",
  "statusCode": 400,
  "requestId": "abc-123",
  "timestamp": "2026-04-24T23:45:00Z"
}

Common error types include:

BadRequest
Unauthorized
Forbidden
NotFound
TooManyRequests
InternalServerError
7. Example Flows
7.1 Happy Path: Login + Access Own Mail
Login:
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"user1","password":"user123"}'

Response:

{
  "token": "..."
}
Access mail:
curl http://localhost:3000/mail/2 \
-H "Authorization: Bearer <token>"

Response:

{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
7.2 Error Path: User Accessing Someone Else’s Mail
Login as user1
Attempt to access another user's mail:
curl http://localhost:3000/mail/1 \
-H "Authorization: Bearer <token>"

Response:

{
  "error": "Forbidden",
  "message": "Access denied",
  "statusCode": 403
}

---