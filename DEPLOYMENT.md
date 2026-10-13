# VEYRO Deployment Guide
## Railway (Backend) + Vercel (Frontend)

---

## Step 1 - Deploy Backend on Railway

### 1.1 Create Railway account
Go to https://railway.app and Sign in with GitHub.

### 1.2 Create a new project
1. Click New Project -> Deploy from GitHub repo
2. Select SidduKondapaka/VEYRO
3. Set Root Directory -> backend
4. Railway detects the Dockerfile automatically

### 1.3 Add a MySQL Database
1. In your Railway project, click + New -> Database -> MySQL
2. Railway creates a MySQL instance

### 1.4 Set Environment Variables in Railway
Click on your backend service -> Variables -> Add all of these:

| Variable | Value |
|---|---|
| DB_HOST | ${{MySQL.MYSQLHOST}} |
| DB_PORT | ${{MySQL.MYSQLPORT}} |
| DB_NAME | ${{MySQL.MYSQLDATABASE}} |
| DB_USERNAME | ${{MySQL.MYSQLUSER}} |
| DB_PASSWORD | ${{MySQL.MYSQLPASSWORD}} |
| JWT_SECRET | veyroSecureMarketplaceSuperSecretKey2026MustBeAtLeast256BitsLong! |
| JWT_EXPIRATION_MS | 86400000 |
| JWT_REFRESH_EXPIRATION_MS | 604800000 |
| CORS_ALLOWED_ORIGINS | https://veyro-mu.vercel.app |
| SERVER_PORT | 8080 |

### 1.5 Deploy and get your backend URL
- Click Deploy -> Wait 2-3 minutes for build
- Railway gives you a URL like: https://veyro-backend-production.up.railway.app
- Copy this URL for Step 2

### 1.6 Test your backend
Visit: https://YOUR-RAILWAY-URL.up.railway.app/api-docs
You should see the Swagger UI

---

## Step 2 - Configure Vercel Frontend

### 2.1 Add Environment Variable in Vercel
1. Go to https://vercel.com -> your VEYRO project
2. Settings -> Environment Variables
3. Add:

| Key | Value |
|---|---|
| VITE_API_URL | https://YOUR-RAILWAY-URL.up.railway.app |

NOTE: No trailing slash in the URL!

### 2.2 Redeploy the Frontend
- Go to Deployments -> click Redeploy on the latest deployment
- OR push a new commit to GitHub (auto-deploys)

---

## Step 3 - Test Login

Visit https://veyro-mu.vercel.app/login

| Role | Email | Password |
|---|---|---|
| Admin | admin@veyro.com | Admin@123456! |
| Customer | customer@veyro.com | Customer@123456! |

---

## Architecture

Browser -> Vercel (React frontend)
               |
          VITE_API_URL
               |
          Railway (Spring Boot backend)
               |
          Railway MySQL Database

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Login returns HTML | VITE_API_URL not set in Vercel, or frontend not redeployed |
| CORS error | CORS_ALLOWED_ORIGINS not set in Railway, or wrong URL |
| 500 on login | DB not connected - check Railway MySQL env vars |
| Backend not starting | Check Railway build logs for Docker errors |
