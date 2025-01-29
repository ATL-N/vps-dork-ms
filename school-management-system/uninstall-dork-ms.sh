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

# Ask for confirmation
confirm_uninstall() {
    log "YELLOW" "Are you sure you want to uninstall the application? This will remove all containers, volumes, networks, and the installation directory. (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log "GREEN" "Uninstallation confirmed. Proceeding..."
    else
        log "RED" "Uninstallation cancelled."
        exit 0
    fi
}

# Stop and remove Docker containers
stop_and_remove_containers() {
    local install_dir=$1

    log "GREEN" "Stopping and removing Docker containers..."
    if [ -f "$install_dir/docker-compose.yml" ]; then
        cd "$install_dir" || {
            log "RED" "Error: Could not change to directory: $install_dir"
            exit 1
        }
        docker compose down --volumes --remove-orphans
        log "GREEN" "Docker containers stopped and removed."
    else
        log "YELLOW" "No docker-compose.yml found in $install_dir. Skipping container removal."
    fi
}

# Remove Docker volumes
remove_docker_volumes() {
    log "GREEN" "Removing Docker volumes..."
    if docker volume ls -q | grep -q 'postgres-data'; then
        docker volume rm postgres-data
        log "GREEN" "Docker volume 'postgres-data' removed."
    else
        log "YELLOW" "No Docker volume 'postgres-data' found. Skipping volume removal."
    fi
}

# Remove Docker networks
remove_docker_networks() {
    log "GREEN" "Removing Docker networks..."
    if docker network ls -q | grep -q 'app-network'; then
        docker network rm app-network
        log "GREEN" "Docker network 'app-network' removed."
    else
        log "YELLOW" "No Docker network 'app-network' found. Skipping network removal."
    fi
}

# Remove the installation directory
remove_installation_directory() {
    local install_dir=$1

    log "GREEN" "Removing installation directory: $install_dir..."
    if [ -d "$install_dir" ]; then
        sudo rm -rf "$install_dir"
        log "GREEN" "Installation directory removed."
    else
        log "YELLOW" "Installation directory $install_dir not found. Skipping directory removal."
    fi
}

# Remove the cron job
remove_cron_job() {
    log "GREEN" "Removing cron job..."
    if crontab -l | grep -q "@reboot /usr/bin/docker compose -f /opt/dork-ms/docker-compose.yml up -d"; then
        crontab -l | grep -v "@reboot /usr/bin/docker compose -f /opt/dork-ms/docker-compose.yml up -d" | crontab -
        log "GREEN" "Cron job removed."
    else
        log "YELLOW" "No matching cron job found. Skipping cron job removal."
    fi
}

# Main function
main() {
    local install_dir="/opt/dork-ms"

    log "GREEN" "Starting uninstallation..."

    # Ask for confirmation
    confirm_uninstall

    # Stop and remove Docker containers
    stop_and_remove_containers "$install_dir"

    # Remove Docker volumes
    remove_docker_volumes

    # Remove Docker networks
    remove_docker_networks

    # Remove the cron job first
    remove_cron_job

    # Remove the installation directory last
    remove_installation_directory "$install_dir"

    log "GREEN" "Uninstallation completed successfully!"
}

main "$@"
