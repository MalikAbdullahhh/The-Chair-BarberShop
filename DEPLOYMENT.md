# THE CHAIR — Vercel Deployment Guide

## 1. Fast Vercel Deployment (Dashboard)

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Under **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` *(or leave as root if using the included `vercel.json`)*
3. Under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://your-the-chair-backend.onrender.com/api
   ```
   *(Replace with your live production API backend URL)*
4. Click **Deploy**.

---

## 2. Deploying with Vercel CLI

```bash
# Navigate to frontend
cd frontend

# Deploy preview
npx vercel

# Deploy to production
npx vercel --prod
```

---

## 3. Production Environment Variables Summary

### Frontend (`frontend/.env.production` or Vercel Environment Variables):
| Variable | Value Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api` | Live backend API URL |

### Backend (`backend/.env` on Render / Railway / DigitalOcean / VPS):
| Variable | Value Example | Description |
|---|---|---|
| `PORT` | `5000` | Server listening port |
| `NODE_ENV` | `production` | Production mode |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas database URI |
| `JWT_SECRET` | `your-secure-production-jwt-secret` | Authentication token secret |
| `FRONTEND_URL` | `https://the-chair.vercel.app` | Vercel production domain |

---

## 4. Build Verification

- Tested with `next build` & Next.js 15 App Router.
- All 29 static and dynamic routes compile cleanly with zero errors.
