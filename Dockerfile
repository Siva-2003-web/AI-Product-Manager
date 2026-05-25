# builder stage
FROM node:24-alpine AS builder
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ libc6-compat

# copy package files and install (all deps needed for build)
COPY package.json package-lock.json* ./
RUN npm ci

# copy source
COPY . .

# prevent OOM during build
ENV NODE_OPTIONS=--max-old-space-size=3072

# build project (vite + esbuild bundling server.ts -> dist/server.cjs)
RUN npm run build

# runtime stage
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
