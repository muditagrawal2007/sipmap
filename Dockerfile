# sipmap — production Dockerfile
# Build:   docker build -t sipmap .
# Run:     docker run -p 3000:3000 --env-file .env sipmap

FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source
COPY src ./src
COPY server.js ./
COPY app.yml ./

# Health-check (Glitch/Render/Fly all expose port 3000 by default)
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server
CMD ["node", "server.js"]
