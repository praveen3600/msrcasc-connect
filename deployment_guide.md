# MSRCASC Connect - Deployment Guide

This guide covers the necessary steps to deploy the MSRCASC Connect platform to production using modern, free-tier friendly services.

---

## 🏗️ 1. Database Deployment (MongoDB Atlas)

We use MongoDB Atlas for a managed, cloud-hosted database.

### Setup Steps
1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account.
2. Click **Build a Database** and select the **FREE Shared Tier**.
3. Choose a cloud provider and region closest to your users.
4. Set up database access:
   - Create a database user with a **Username** and **Password**. *Save these securely.*
5. Set up network access:
   - Go to **Network Access** -> **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) for ease of deployment.
6. Get your connection string:
   - Go to **Databases** -> **Connect** -> **Drivers**.
   - Copy the connection string.
   - Replace `<password>` with the password you created in step 4.

---

## ⚙️ 2. Backend Deployment (Render)

We use Render to host the Node.js Express API.

### Preparation
1. Push your complete code (including the `server` folder) to a GitHub repository.

### Deployment Steps
1. Log into [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Name**: `msrcasc-connect-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Configure Environment Variables (under Advanced):
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render will override this, which is fine)
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Generate a long random string (e.g., using `crypto.randomBytes(64).toString('hex')`)*
   - `JWT_EXPIRE`: `30d`
   - `CLIENT_URL`: *We will update this after deploying the frontend*
   - `OPENAI_API_KEY`: *Your OpenAI API key (if you want real AI instead of mock responses)*
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g., `https://msrcasc-connect-api.onrender.com`).

---

## 🌐 3. Frontend Deployment (Vercel)

We use Vercel for fast, optimized hosting of the React (Vite) frontend.

### Preparation
1. Ensure your React code inside the `client` folder is pushed to GitHub.

### Deployment Steps
1. Log into [Vercel](https://vercel.com/login).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Project Name**: `msrcasc-connect`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` 
5. Configure Environment Variables:
   - We need to tell Vite how to reach the backend API.
   - Add a new variable named `VITE_API_URL`.
   - Set the value to your Render backend URL (e.g., `https://msrcasc-connect-api.onrender.com/api`).
6. Click **Deploy**.

> **Note on Vite Proxy:**
> The `vite.config.js` proxy only works in local development! For production, you need to update `client/src/api/index.js`. Vercel doesn't run the dev server. Modify the Axios base URL to use the environment variable:
> 
> ```javascript
> const API = axios.create({
>   baseURL: import.meta.env.VITE_API_URL || '/api',
>   headers: {
>     'Content-Type': 'application/json',
>   },
> });
> ```

---

## 🔗 4. Final Connections

1. **Update Frontend Axios (Crucial)**: As mentioned above, ensure `client/src/api/index.js` points to your lived backend URL if not using a proxy setup on Vercel.
2. **Update Backend CORS**: Go back to Render -> your web service -> Environment section. Update the `CLIENT_URL` variable to your new Vercel DOMAIN (e.g., `https://msrcasc-connect.vercel.app`). This allows the frontend to talk to the backend without CORS errors.
3. Restart the backend service on Render to apply the variable changes.

Your platform is now live! 🎉
