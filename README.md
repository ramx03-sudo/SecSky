# SecSky

Zero-knowledge, client-side encrypted file storage application.

## Strict Security Model
- **Zero Knowledge**: Plantext files are NEVER sent to the backend. Encryption happens entirely in the browser using the Web Crypto API (AES-256-GCM).
- **Master Keys**: The user's master key is derived via PBKDF2 (100k iterations) on login/registration and stored ONLY in memory. It is never transmitted.
- **Double Wrapping**: Optional file-specific passwords wrap the AES key an additional time for a second layer of defense.
- **Metadata**: Backend (FastAPI + MongoDB) only stores encrypted metadata, IVs, and securely wrapped keys.
- **Storage**: Encrypted blob bytes are piped directly into a secure Google Cloud Storage bucket.

## Deployment Guide (Cloud Run)

### 1. MongoDB Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User.
3. Allow access from any IP address `0.0.0.0/0` (or Google Cloud IPs).
4. Copy the connection string into the `.env` `MONGODB_URI`.

### 2. Google Cloud Storage Setup
1. Create a project in Google Cloud Console.
2. Navigate to Cloud Storage -> Buckets -> Create.
3. Name: `secsky-prod-rm01`. Location: `Multi-region`.
4. Enforce Public Access Prevention on the bucket.
5. Create a Service Account, assign the `Storage Object Admin` role.
6. Generate a New JSON Key, download it, and reference it via `GOOGLE_APPLICATION_CREDENTIALS` in the backend runtime.

### 3. Backend Deployment (FastAPI on Cloud Run)
Create a `Dockerfile` in `backend/`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Deploying to Cloud Run:
```bash
gcloud run deploy secsky-backend --source ./backend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=...,JWT_SECRET_KEY=...,GCS_BUCKET_NAME=secsky-prod-rm01" \
  --set-secrets="GOOGLE_APPLICATION_CREDENTIALS=service_account_json:latest"
```

### 4. Frontend Deployment (React Vite on Cloud Run / Storage / Vercel)
Update `src/utils/api.js` `API_BASE` to point to the production backend Cloud Run URL.

Create a `Dockerfile` in `frontend/` leveraging NGINX:
```dockerfile
# Build Stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy to Cloud Run:
```bash
gcloud run deploy secsky-frontend --source ./frontend --platform managed --allow-unauthenticated
```
