#!/bin/bash

# Exit on error, undefined variables, and propagate pipe failures
set -euo pipefail
trap 'echo "Error on line $LINENO. Exit code: $?"' ERR

# Color definitions
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Logging function
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

# Check prerequisites
check_prerequisites() {
    log "GREEN" "Checking prerequisites..."

    if ! command -v docker &>/dev/null; then
        log "RED" "Error: Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker compose version &>/dev/null; then
        log "RED" "Error: Docker Compose is not installed. Please install Docker Compose V2 or Docker Desktop."
        exit 1
    fi

    if ! docker info &>/dev/null; then
        log "RED" "Error: Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
}

# Extract the distribution package
extract_package() {
    local package_file=$1
    local install_dir=$2

    log "GREEN" "Extracting distribution package: $package_file"
    if ! tar xzf "$package_file" -C "$install_dir"; then
        log "RED" "Error: Failed to extract distribution package"
        exit 1
    fi

    log "GREEN" "Package extracted to: $install_dir"
}

# Load Docker images
load_docker_images() {
    local install_dir=$1

    log "GREEN" "Loading Docker images..."
    if ! docker load <"$install_dir/docker-images.tar"; then
        log "RED" "Error: Failed to load Docker images"
        exit 1
    fi

    log "GREEN" "Docker images loaded successfully"
}

# Configure environment
configure_environment() {
    local install_dir=$1

    log "GREEN" "Configuring environment..."
    if [ ! -f "$install_dir/.env.local" ]; then
        log "RED" "Error: .env.local file not found in $install_dir"
        exit 1
    fi

    cp "$install_dir/.env.local" "$install_dir/.env"
    log "YELLOW" "Please edit the .env file with your configuration: nano $install_dir/.env"
    log "YELLOW" "Make sure to configure these important variables:"
    log "YELLOW" "- DB_USER"
    log "YELLOW" "- DB_PASSWORD"
    log "YELLOW" "- DB_NAME"
    log "YELLOW" "- DB_PORT (default: 5435)"
    log "YELLOW" "- APP_PORT (default: 3005)"
    read -p "Press Enter when you have finished editing the .env file..."
}

# Start the application
start_application() {
    local install_dir=$1

    log "GREEN" "Starting application..."
    cd "$install_dir" || {
        log "RED" "Error: Could not change to directory: $install_dir"
        exit 1
    }

    if ! docker compose up -d; then
        log "RED" "Error: Failed to start application"
        log "YELLOW" "Docker Compose logs:"
        docker compose logs
        exit 1
    fi

    log "GREEN" "Application started successfully!"

    # Restore the pre-created backup
    if [ -f "$install_dir/backups/initial_backup.sql" ]; then
        log "GREEN" "Restoring pre-created backup..."
        docker compose exec -T db psql -U postgres -d atlschoolmamangementsystem <"$install_dir/backups/initial_backup.sql"
        log "GREEN" "Backup restored successfully!"
    else
        log "YELLOW" "No pre-created backup found. Skipping restore..."
    fi
}

# Add a cron job to start the application on reboot
add_cron_job() {
    local install_dir=$1

    log "GREEN" "Adding cron job to start the application on reboot..."

    # Add the cron job
    (
        crontab -l 2>/dev/null
        echo "@reboot /usr/bin/docker compose -f $install_dir/docker-compose.yml up -d"
    ) | crontab -

    log "GREEN" "Cron job added successfully!"
}

# Main function
main() {
    if [ $# -ne 1 ]; then
        log "RED" "Usage: $0 <distribution-package.tar.gz>"
        exit 1
    fi

    local package_file=$1
    local install_dir="/opt/dork-ms" # Changed to /opt/dork-ms

    log "GREEN" "Starting installation..."

    check_prerequisites

    # Create installation directory
    log "GREEN" "Creating installation directory: $install_dir"
    sudo mkdir -p "$install_dir"
    sudo chown -R "$(whoami):$(id -gn)" "$install_dir"

    # Extract the package
    extract_package "$package_file" "$install_dir"

    # Load Docker images
    load_docker_images "$install_dir"

    # Configure environment
    configure_environment "$install_dir"

    # Start the application
    start_application "$install_dir"

    # Add cron job to start the application on reboot
    add_cron_job "$install_dir"

    log "GREEN" "Installation completed successfully!"
    log "YELLOW" "You can access the application at: http://localhost:3005"
    log "YELLOW" "To stop the application, run: docker compose -f $install_dir/docker-compose.yml down"
    log "YELLOW" "To start the application, run: docker compose -f $install_dir/docker-compose.yml up -d"
}

main "$@"
