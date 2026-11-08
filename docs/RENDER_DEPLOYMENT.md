# Render.com Deployment Guide: AI-Powered CRM

This guide provides step-by-step instructions to deploy the full-stack **AI-Powered CRM** application to [Render.com](https://render.com).

---

## Architecture on Render

- **Web Service**: A single unified Node.js Web Service running Express.
  - Serves the **React + Vite** frontend SPA (`client/dist`).
  - Hosts the **REST API** (`/api/v1/*`).
  - Eliminates cross-origin CORS issues and avoids paying for multiple services on Render's free tier.
- **Database**: Already hosted on **Neon Lakebase Postgres** (AWS `ap-southeast-1`).
- **Object Storage**: Neon S3-compatible bucket `assets`.
- **AI Intelligence**: Backend-only integration with Google Gemini / Neon AI Gateway.

---

## Method 1: Deploy with Render Blueprint (Recommended)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint specification.

1. **Push your repository** to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation bar and select **Blueprint**.
4. Connect your CRM Git repository.
5. Render will detect `render.yaml` and display the `ai-powered-crm` service configuration.
6. Under **Environment Variables**, fill in your secret credentials:
   - `DATABASE_URL`: Your Neon pooled connection string (with `-pooler`).
   - `DATABASE_URL_UNPOOLED`: Your direct Neon connection string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
7. Click **Apply**. Render will install dependencies, generate the Prisma client, build both client & server, and launch the service!

---

## Method 2: Manual Web Service Setup (Step-by-Step)

If you prefer configuring through the Render Web UI manually:

### Step 1: Create a New Web Service
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Connect your Git repository (e.g. `GitHub/your-username/MaVionix_assignment`).
3. Select your repository and choose the `main` branch.

### Step 2: Configure Service Settings
- **Name**: `ai-powered-crm` (or your preferred name)
- **Region**: `Singapore (Southeast Asia)` *(closest to AWS ap-southeast-1 where Neon is hosted)*
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm run build:render
  ```
- **Start Command**:
  ```bash
  npm run start
  ```
- **Instance Type**: `Free`

### Step 3: Configure Environment Variables
Under the **Environment Variables** section, click **Add Environment Variable** and enter the following:

| Key | Recommended Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically, but good to declare)* |
| `DATABASE_URL` | `postgresql://neondb_owner:YOUR_PASSWORD@ep-little-base-azfz27rd-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15&pool_timeout=15&connection_limit=5` |
| `DATABASE_URL_UNPOOLED` | `postgresql://neondb_owner:YOUR_PASSWORD@ep-little-base-azfz27rd.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15` |
| `CLIENT_URL` | `https://your-service-name.onrender.com` *(Update with your Render service URL once generated)* |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | `Your Gemini API key` |
| `GEMINI_MODEL` | `gemini-3.5-flash` |
| `ALLOW_NO_AUTH` | `true` |
| `NEON_BRANCH` | `production` |
| `AWS_REGION` | `ap-southeast-1` |
| `AWS_ENDPOINT_URL_S3` | `https://br-royal-band-azikn3ny.storage.c-3.ap-southeast-1.aws.neon.tech` |
| `AWS_ACCESS_KEY_ID` | `nak_live_...` *(From your .env.local)* |
| `AWS_SECRET_ACCESS_KEY` | `nsk_live_...` *(From your .env.local)* |
| `NEON_FUNCTION_URL` | `https://br-royal-band-azikn3ny-hello.compute.c-3.ap-southeast-1.aws.neon.tech/` |
| `NEON_AUTH_BASE_URL` | `https://ep-little-base-azfz27rd.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth` |
| `NEON_AUTH_JWKS_URL` | `https://ep-little-base-azfz27rd.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json` |
| `NEON_REALTIME_URL` | `wss://ep-little-base-azfz27rd.rt.c-3.ap-southeast-1.aws.neon.tech/` |
| `NEON_REALTIME_SECRET` | `nrt_live_...` *(From your .env.local)* |
| `NEON_AI_GATEWAY_TOKEN` | `nt_live_...` *(From your .env.local)* |
| `NEON_AI_GATEWAY_BASE_URL`| `https://br-royal-band-azikn3ny-api.ai.c-3.ap-southeast-1.aws.neon.tech` |

### Step 4: Health Check Path
Under **Advanced Settings**:
- **Health Check Path**: `/api/health`

### Step 5: Deploy
Click **Create Web Service**.
Render will trigger the initial build. You can monitor the live build logs:
1. Cloning repository.
2. Running `npm run build:render` (`npm install`, `prisma:generate`, and building both `server/` and `client/`).
3. Starting Express via `npm run start`.
4. Render detects `/api/health` responding `200 OK` and marks the deployment live!

---

## Post-Deployment Verification

Once Render displays **Live**:

1. **Verify API Health**:
   Open in your browser:
   ```text
   https://<your-service-name>.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "ai-crm-api",
     "environment": "production",
     "database": "connected",
     "aiProvider": "gemini"
   }
   ```

2. **Verify Neon Cloud Status**:
   ```text
   https://<your-service-name>.onrender.com/api/v1/neon/status
   ```
   All services should report `healthy` with operational status.

3. **Verify Frontend UI**:
   Open:
   ```text
   https://<your-service-name>.onrender.com
   ```
   The full CRM application will load, including dashboard metrics, pipeline kanban, activities timeline, tutorial mode, and lead profile AI intelligence.
