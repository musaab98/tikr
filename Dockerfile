# -- build frontend --
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# -- build backend --
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# -- production --
FROM node:20-alpine
WORKDIR /app

COPY --from=backend /app/backend/dist ./backend/dist
COPY --from=backend /app/backend/node_modules ./backend/node_modules
COPY --from=backend /app/backend/package.json ./backend/package.json
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/data/audio

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "backend/dist/server.js"]
