# Base image with Node.js 18 runtime
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies inside container
RUN npm install

# Copy application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
