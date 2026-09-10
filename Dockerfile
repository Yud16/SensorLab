FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js db.js ./
COPY routes ./routes
COPY views ./views
COPY public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
