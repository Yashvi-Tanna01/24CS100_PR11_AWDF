# Practical 11: Containerization with Docker and Docker Compose

**Student Name:** Maitri Sheta  
**Student ID:** D25CS120  
**Course:** Advanced Web Development Frameworks (AWDF) — Semester 5  
**Department:** Computer Science & Engineering (CSE)  
**Institution:** Charotar University of Science and Technology (CHARUSAT)  

---

## Course Outcome & Program Outcomes (CO / PO)
- **Course Outcome:** CO5
- **Program Outcomes:** PO3, PO5

---

## Practical Objective
To containerize the full-stack application using Docker and orchestrate services using Docker Compose.

---

## Architecture & Service Topology Diagram

```text
docker-compose.yml
├── frontend (React, built + served, port 5173)
├── backend (Node/Express, port 5000)
└── mongodb (official mongo image, port 27017)

Network: app-network (bridge)
frontend ──► backend ──► mongodb
All 3 services start together via: docker-compose up
```

---

## Problem Definition & Problem Statement
- Write a Dockerfile for the React frontend of the Task Management application.
- Write a Dockerfile for the Node/Express backend.
- Create a `docker-compose.yml` file that orchestrates all 3 services: frontend, backend, and MongoDB.
- Configure correct port mappings and an internal Docker network so the services can communicate seamlessly.
- Ensure the entire application starts with a single `docker-compose up` command, with no manual steps in between.

---

## Key Questions & Analysis

### 1. Why does the backend container need to reference the MongoDB container by its service name (e.g., `mongodb`) rather than `localhost`?
Each Docker container operates inside its own isolated network namespace with its own private loopback interface (`localhost` / `127.0.0.1`). If the backend container attempts to connect to `localhost:27017`, it queries its own local container interface where MongoDB is not listening.

When containers are joined to a custom bridge network in Docker Compose (`app-network`), Docker sets up an internal DNS server. This embedded DNS resolver automatically translates service names defined in `docker-compose.yml` (such as `mongodb`) into the container's private bridge IP address. Therefore, the backend must use `mongodb://mongodb:27017/taskdb` to reach the database container.

### 2. What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
- **`EXPOSE` (Dockerfile):** Acts as container metadata and documentation specifying which ports the container process listens on. It informs users and inter-container links about the listening port, but does not publish or open the port on the host operating system.
- **`ports` mapping (docker-compose.yml):** Actively binds a host machine port to a container port using the format `HOST:CONTAINER` (for example, `5173:5173`, `5000:5000`, `27017:27017`). This establishes port forwarding so that external traffic from the host machine (such as a web browser or Postman) can reach the services running inside the containers.

### 3. Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
- **Platform Incompatibility:** Certain npm packages (like `bcrypt` or filesystem monitors) compile native C++ binaries specific to the host operating system and architecture. Copying a host's Windows or macOS `node_modules` into a Linux-based Docker image causes runtime failures.
- **Bloated Build Context:** The `node_modules` directory contains thousands of files and hundreds of megabytes. Sending it over the Docker daemon during build context evaluation severely slows down the build process.
- **Cache Invalidation:** Docker caches image layers. By copying only `package*.json` first and executing `RUN npm install` inside the container, Docker caches the dependency layer and only reinstalls packages when dependencies actually change.

---

## Supplementary Problems

### 1. Build Context Optimization with `.dockerignore`
Both root, backend, and frontend directories include dedicated `.dockerignore` files excluding `node_modules`, `.env`, build artifacts (`dist/`), and git logs. This minimizes the build context sent to the Docker daemon and protects sensitive environment credentials.

### 2. Multi-Stage Build for React Frontend
The frontend `Dockerfile` implements a multi-stage build pattern using Node.js 18:
- **Build Stage (`AS build`):** Installs development dependencies and executes `npm run build` using Vite.
- **Runtime Stage:** Produces optimized static assets and serves them via Vite preview on host `0.0.0.0` and port `5173`, significantly reducing layer weight and decoupling development tooling from the running container.

### 3. Persistent Data Storage with Named MongoDB Volume
A named volume `mongo-data` is declared and mounted to `/data/db` within the MongoDB service. This ensures that all registered users, tasks, and state remain intact across container stops, restarts, and image updates without data loss.

---

## Key Skills Addressed
- Writing Dockerfiles for both frontend and backend Node-based applications.
- Orchestrating multi-container applications using Docker Compose.
- Configuring inter-container networking and port mapping across isolated services.
- Running and verifying a complete full-stack application with a single orchestration command.

---

## Learning Outcome
Students are able to containerize a full-stack application using Docker and orchestrate multiple services together using Docker Compose, running the entire stack with one command.
