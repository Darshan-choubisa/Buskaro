# Deployment Documentation

This section explains how to take your app from `localhost` and put it on the public internet.

## 1. Overall Strategy
MERN stack apps are usually deployed in two separate pieces:
- **Frontend (React/Vite):** Deployed to a static hosting service like Netlify or Vercel.
- **Backend (Node/Express):** Deployed to a server platform like Render, Heroku, or DigitalOcean.
- **Database (MongoDB):** Hosted on MongoDB Atlas (which you are already using).

## 2. Deploying the Backend (e.g., Render)
1. **Push to GitHub:** Commit your code and push it to a GitHub repository.
2. **Connect to Render:** Create a Web Service on Render and connect your repo.
3. **Set the Root Directory:** Tell Render your backend is in the `backend/` folder.
4. **Build Command:** Usually `npm install`.
5. **Start Command:** Usually `node server.js`.
6. **Environment Variables:** You MUST copy everything from your local `.env` file into Render's Environment Variables settings.
   - `MONGO_URI`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

## 3. Deploying the Frontend (e.g., Netlify)
1. **Connect to Netlify:** Create a new site from your GitHub repo.
2. **Set the Root Directory:** Leave blank if your frontend is in the root, or set to `src/` if configured that way.
3. **Build Command:** `npm run build` (Vite compiles your React code into static HTML/CSS/JS).
4. **Publish Directory:** `dist` (This is where Vite puts the compiled files).
5. **Environment Variables:** Any `.env` variables your frontend uses (like `VITE_API_URL`) must be added in Netlify.
   - **Crucial step:** You must change `VITE_API_URL` from `http://localhost:5000/api` to your new live Render backend URL (e.g., `https://buskaro-api.onrender.com/api`).

## 4. Common Deployment Issues

- **CORS Errors:** If your frontend on Netlify tries to talk to your backend on Render, the backend might block it. You need to update your `cors` configuration in `server.js` to allow your specific Netlify domain.
- **Routing Issues (Frontend):** Because React Router handles URLs locally, if a user directly visits `yoursite.com/login`, Netlify might return a 404 because there is no actual `login.html` file. You need to add a `_redirects` file in your `public` folder with the rule: `/* /index.html 200` to tell Netlify to send all traffic to React.
- **Database IP Allowlist:** MongoDB Atlas blocks outside connections by default. You must ensure your network access is set to `0.0.0.0/0` (allow all IPs) so your Render server can connect to it.
