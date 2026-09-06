# Deployment Guide

## 1. Vercel Deployment (Recommended)
1. Push your changes to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Select Next.js framework preset.
4. Deploy!

## 2. Docker Deployment
1. Build the image:
   ```bash
   docker build -t dnyx-draft .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 dnyx-draft
   ```
