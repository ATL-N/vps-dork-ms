#!/bin/bash

# Exit on any error
set -e

# Colors for messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    case "$1" in
    "GREEN")
        echo -e "${GREEN}${*:2}${NC}"
        ;;
    "RED")
        echo -e "${RED}${*:2}${NC}"
        ;;
    "YELLOW")
        echo -e "${YELLOW}${*:2}${NC}"
        ;;
    *)
        echo -e "${*:2}"
        ;;
    esac
}

generate_nextauth_secret() {
    if command -v openssl &>/dev/null; then
        openssl rand -base64 32
    else
        # Fallback to /dev/urandom if openssl is not available
        head -c 32 /dev/urandom | base64
    fi
}

check_prerequisites() {
    log "GREEN" "Checking prerequisites..."

    if ! command -v docker &>/dev/null; then
        log "RED" "Error: Docker is not installed. Please install Docker first."
        log "YELLOW" "Installation guides:"
        log "YELLOW" "- Ubuntu/Debian: sudo apt install docker.io docker-compose-plugin"
        log "YELLOW" "- Windows/Mac: Download Docker Desktop from https://www.docker.com"
        exit 1
    fi

    if ! docker compose version &>/dev/null; then
        log "RED" "Error: Docker Compose V2 is not installed."
        log "YELLOW" "Please install Docker Compose V2 or Docker Desktop."
        exit 1
    fi

    if ! docker info &>/dev/null; then
        log "RED" "Error: Docker daemon is not running."
        log "YELLOW" "Please start Docker and try again."
        exit 1
    fi

    # Clean up any existing containers with the same names
    log "GREEN" "Cleaning up any existing containers..."
    docker compose down 2>/dev/null || true
    docker rm -f nextjs-app-app-1 2>/dev/null || true
    docker rm -f nextjs-app-db-1 2>/dev/null || true

    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_MEM" -lt 4000 ]; then
        log "RED" "Warning: Less than 4GB RAM available. Application may not run properly."
    fi

    FREE_SPACE=$(df -m "$(pwd)" | awk 'NR==2 {print $4}')
    if [ "$FREE_SPACE" -lt 10000 ]; then
        log "RED" "Warning: Less than 10GB free disk space. Application may not have enough space."
    fi
}

setup_application() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
    local package_file=$(find "$script_dir" -maxdepth 1 -type f -name "dork-ms-*.tar.gz")

    if [ -z "$package_file" ]; then
        log "RED" "Error: Distribution package (dork-ms-*.tar.gz) not found."
        log "YELLOW" "Current directory contents:"
        ls -la "$script_dir"
        exit 1
    fi

    log "GREEN" "Distribution package found: $package_file"

    local app_dir="$HOME/nextjs-app"
    log "GREEN" "Creating application directory: $app_dir"
    mkdir -p "$app_dir"
    cd "$app_dir"

    log "GREEN" "Extracting distribution package..."
    tar xzf "$package_file" -v

    # Check for required files
    log "GREEN" "Checking for required files..."
    for file in "docker-compose.yml" "docker-images.tar" ".env.local"; do
        if [ ! -f "$file" ]; then
            log "RED" "Error: Required file '$file' not found after extraction"
            log "YELLOW" "Extracted contents:"
            ls -la
            exit 1
        else
            log "GREEN" "Found required file: $file"
        fi
    done

    log "GREEN" "Loading Docker images..."
    if ! docker load <docker-images.tar; then
        log "RED" "Error: Failed to load Docker images"
        exit 1
    fi

    log "GREEN" "Setting up environment configuration..."
    if [ ! -f ".env.local" ]; then
        log "RED" "Error: .env.local not found in distribution package"
        exit 1
    fi

    # Generate NextAuth secret
    local nextauth_secret=$(generate_nextauth_secret)
    log "GREEN" "Generated NextAuth secret"

    # Create .env file with NextAuth configuration
    cp .env.local .env
    {
        echo "NEXTAUTH_SECRET=$nextauth_secret"
        echo "NEXTAUTH_URL=http://localhost:\${APP_PORT}"
    } >>.env

    log "YELLOW" "Please edit the .env file with your configuration: nano .env"
    log "YELLOW" "Make sure to configure these important variables:"
    log "YELLOW" "- DB_USER"
    log "YELLOW" "- DB_PASSWORD"
    log "YELLOW" "- DB_NAME"
    log "YELLOW" "- DB_PORT (default: 5435)"
    log "YELLOW" "- APP_PORT (default: 3000)"
    read -p "Press Enter when you have finished editing the .env file..."

    echo "$app_dir"
}

start_application() {
    local app_dir=$1
    cd "$app_dir"

    log "GREEN" "Starting application..."
    log "GREEN" "Current directory: $(pwd)"

    if [ ! -f "docker-compose.yml" ]; then
        log "RED" "Error: docker-compose.yml not found in $(pwd)"
        exit 1
    fi

    # Verify environment variables
    local required_vars=("DB_USER" "DB_PASSWORD" "DB_NAME" "DB_PORT" "APP_PORT" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            log "RED" "Error: Required environment variable ${var} not found in .env file"
            exit 1
        fi
    done

    if ! docker compose up -d; then
        log "RED" "Error: Failed to start application"
        log "YELLOW" "Docker Compose logs:"
        docker compose logs
        exit 1
    fi

    local max_attempts=30
    local attempt=1

    log "GREEN" "Waiting for services to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps | grep -q "healthy"; then
            log "GREEN" "All services are healthy!"
            break
        fi
        log "YELLOW" "Attempt $attempt/$max_attempts: Waiting for services to be ready..."
        docker compose logs --tail=10
        sleep 5
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        log "RED" "Error: Services failed to become healthy"
        log "YELLOW" "Full logs:"
        docker compose logs
        exit 1
    fi
}

# Rest of the script remains the same (create_startup_script and display_completion_message functions)

main() {
    log "GREEN" "Starting installation..."

    check_prerequisites

    local app_dir
    app_dir=$(setup_application)

    start_application "$app_dir"
    create_startup_script "$app_dir"
    display_completion_message
}

main "$@"
