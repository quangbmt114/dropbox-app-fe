#!/bin/bash

# Docker Build & Run Script for Dropbox Frontend

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Dropbox Frontend - Docker Setup${NC}"

# Function to build production image
build_prod() {
    echo -e "${GREEN}Building production image...${NC}"
    docker build -t dropbox-frontend:latest -f Dockerfile .
    echo -e "${GREEN}✅ Production image built successfully${NC}"
}

# Function to build development image
build_dev() {
    echo -e "${GREEN}Building development image...${NC}"
    docker build -t dropbox-frontend:dev -f Dockerfile.dev .
    echo -e "${GREEN}✅ Development image built successfully${NC}"
}

# Function to run production container
run_prod() {
    echo -e "${GREEN}Running production container...${NC}"
    docker run -d \
        --name dropbox-frontend \
        -p 4000:4000 \
        -e NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:7002} \
        dropbox-frontend:latest
    echo -e "${GREEN}✅ Production container started on port 4000${NC}"
}

# Function to run with docker-compose
compose_up() {
    echo -e "${GREEN}Starting with docker-compose...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to stop containers
stop() {
    echo -e "${GREEN}Stopping containers...${NC}"
    docker stop dropbox-frontend 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}✅ Containers stopped${NC}"
}

# Function to view logs
logs() {
    docker logs -f dropbox-frontend
}

# Main menu
case "${1:-help}" in
    build-prod)
        build_prod
        ;;
    build-dev)
        build_dev
        ;;
    run-prod)
        run_prod
        ;;
    compose-up)
        compose_up
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    help|*)
        echo "Usage: $0 {build-prod|build-dev|run-prod|compose-up|stop|logs}"
        echo ""
        echo "Commands:"
        echo "  build-prod   - Build production Docker image"
        echo "  build-dev    - Build development Docker image"
        echo "  run-prod     - Run production container"
        echo "  compose-up   - Start with docker-compose"
        echo "  stop         - Stop all containers"
        echo "  logs         - View container logs"
        ;;
esac
