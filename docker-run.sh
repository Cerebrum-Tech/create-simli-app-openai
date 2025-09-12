#!/bin/bash

# Docker helper script for Simli Interview Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_message "⚠️  .env file not found!" "$YELLOW"
        print_message "Creating .env from .env.example..." "$YELLOW"
        
        cat > .env << EOF
# Simli API Key (required)
NEXT_PUBLIC_SIMLI_API_KEY=your_simli_api_key_here

# Redirect URL after interview (optional)
NEXT_PUBLIC_REDIRECT_URL=https://www.google.com

# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# SerpAPI Key (required for search functionality)
SERPAPI_API_KEY=your_serpapi_key_here
EOF
        
        print_message "✅ .env file created. Please update it with your API keys." "$GREEN"
        exit 1
    fi
}

# Function to display help
show_help() {
    cat << EOF
Simli Interview Application - Docker Helper Script

Usage: ./docker-run.sh [COMMAND]

Commands:
    dev         Start development environment with hot reload
    prod        Start production environment
    build       Build production Docker image
    stop        Stop all containers
    clean       Stop containers and remove images
    logs        Show container logs
    shell       Open shell in running container
    help        Show this help message

Examples:
    ./docker-run.sh dev     # Start development mode
    ./docker-run.sh prod    # Start production mode
    ./docker-run.sh logs    # View logs

EOF
}

# Main script logic
case "$1" in
    dev)
        check_env_file
        print_message "🚀 Starting development environment..." "$GREEN"
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    
    prod)
        check_env_file
        print_message "🚀 Starting production environment..." "$GREEN"
        docker-compose up --build -d
        print_message "✅ Application is running at http://localhost:3000" "$GREEN"
        ;;
    
    build)
        check_env_file
        print_message "🔨 Building production image..." "$YELLOW"
        docker-compose build
        print_message "✅ Build complete!" "$GREEN"
        ;;
    
    stop)
        print_message "⏹️  Stopping containers..." "$YELLOW"
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        print_message "✅ All containers stopped" "$GREEN"
        ;;
    
    clean)
        print_message "🧹 Cleaning up Docker resources..." "$YELLOW"
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker rmi simli-interview-app simli-interview-app-dev 2>/dev/null || true
        print_message "✅ Cleanup complete" "$GREEN"
        ;;
    
    logs)
        print_message "📋 Showing container logs..." "$YELLOW"
        docker-compose logs -f
        ;;
    
    shell)
        print_message "🐚 Opening shell in container..." "$YELLOW"
        docker-compose exec simli-interview-app sh
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        print_message "❌ Invalid command: $1" "$RED"
        show_help
        exit 1
        ;;
esac
