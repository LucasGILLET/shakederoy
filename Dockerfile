# =========================
# Stage 1 — Build
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================
# Stage 2 — Runtime
# =========================
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ENV NODE_ENV=production
ENV BACKEND_URL=${BACKEND_URL}

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "start"]
