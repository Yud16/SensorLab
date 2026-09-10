# Build context must be the repo root, e.g.:
#   docker build -f simulator/Dockerfile -t sensor-simulator .
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY db.js ./
COPY simulator ./simulator
USER app
CMD ["node", "simulator/simulate.js"]
