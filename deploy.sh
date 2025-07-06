#!/bin/bash

# Gifted Giving Website Deployment Script
# This script helps deploy the application using Docker

set -e

echo "🎁 Gifted Giving Website - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check environment files
check_env_files() {
    if [ ! -f "server/config.env" ]; then
        print_warning "server/config.env not found. Creating from example..."
        if [ -f "server/config.env.example" ]; then
            cp server/config.env.example server/config.env
            print_warning "Please edit server/config.env with your configuration"
        else
            print_error "server/config.env.example not found"
            exit 1
        fi
    fi
    
    if [ ! -f "client/.env" ]; then
        print_warning "client/.env not found. Creating from example..."
        if [ -f "client/env.example" ]; then
            cp client/env.example client/.env
            print_warning "Please edit client/.env with your configuration"
        else
            print_error "client/env.example not found"
            exit 1
        fi
    fi
}

# Build and start services
deploy() {
    print_status "Building and starting services..."
    
    # Stop existing containers
    docker-compose down
    
    # Remove old images
    docker-compose down --rmi all
    
    # Build and start
    docker-compose up --build -d
    
    print_status "Services are starting up..."
    print_status "You can view logs with: docker-compose logs -f"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "All services are running!"
        echo ""
        echo "🌐 Access your application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:5000"
        echo "   MongoDB: localhost:27017"
        echo ""
        echo "📊 Useful commands:"
        echo "   View logs: docker-compose logs -f"
        echo "   Stop services: docker-compose down"
        echo "   Restart services: docker-compose restart"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Main deployment function
main() {
    case "$1" in
        "deploy")
            check_docker
            check_env_files
            deploy
            check_health
            ;;
        "stop")
            print_status "Stopping services..."
            docker-compose down
            print_status "Services stopped"
            ;;
        "restart")
            print_status "Restarting services..."
            docker-compose restart
            print_status "Services restarted"
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "clean")
            print_status "Cleaning up Docker resources..."
            docker-compose down --volumes --rmi all
            docker system prune -f
            print_status "Cleanup completed"
            ;;
        *)
            echo "Usage: $0 {deploy|stop|restart|logs|clean}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Build and start all services"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  logs     - View service logs"
            echo "  clean    - Clean up Docker resources"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 