# API Documentation for /api/upload-image Endpoint

## Endpoint
`POST /api/upload-image`

## Authentication
- Requires a valid JWT token in the request (authenticated endpoint).
- The token should be sent as a cookie or Authorization header as per existing auth setup.

## Request Body
- Content-Type: application/json
- JSON payload with the following field:
  - `imageBase64` (string): Base64-encoded image data (e.g., "data:image/png;base64,iVBORw0...")

Example:
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Response
- Success (HTTP 200):
```json
{
  "message": "Image received successfully"
}
```

- Error (HTTP 400):
```json
{
  "error": "Image data is required"
}
```

- Error (HTTP 401):
```json
{
  "error": "Unauthorized"
}
```

## Notes
- The backend currently logs the receipt of the image.
- You can extend the backend to process, store, or analyze the image as needed.
