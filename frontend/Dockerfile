# Multi-stage build for React frontend
# Stage 1: Build stage
FROM node:18 AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the production bundle with Vite
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve production build across Docker network
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
