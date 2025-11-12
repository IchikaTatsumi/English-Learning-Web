# --- Stage 1: Build code ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Run production ---
FROM node:18-alpine
WORKDIR /app

# Copy build output từ stage builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --omit=dev

EXPOSE 4000
CMD ["node", "dist/main.js"]
