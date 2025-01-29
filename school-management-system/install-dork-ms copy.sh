#!/bin/bash

# Exit on error, undefined variables, and propagate pipe failures
set -euo pipefail
trap 'echo "Error on line $LINENO. Exit code: $?"' ERR

# Color definitions
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Configuration
readonly SERVICE_NAME="nextjs-school-app"
readonly INSTALL_DIR="/opt/school-app"
readonly SYSTEMD_SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

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

check_prerequisites() {
    log "GREEN" "Checking prerequisites..."

    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log "RED" "Error: Please run as root (use sudo)"
        exit 1
    fi

    # Check for required commands
    local required_commands=("docker" "docker-compose" "systemctl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &>/dev/null; then
            log "RED" "Error: Required command '$cmd' not found"
            exit 1
        fi
    done
}

create_install_directory() {
    log "GREEN" "Creating installation directory..."
    mkdir -p "${INSTALL_DIR}"
    cd "${INSTALL_DIR}" || exit 1
}

extract_distribution() {
    local dist_file=$1
    log "GREEN" "Extracting distribution package..."

    if [ ! -f "$dist_file" ]; then
        log "RED" "Error: Distribution file not found: $dist_file"
        exit 1
    fi

    tar xzf "$dist_file" -C "${INSTALL_DIR}"
    log "GREEN" "Loading Docker images..."
    docker load <"${INSTALL_DIR}/docker-images.tar"
}

create_systemd_service() {
    log "GREEN" "Creating systemd service..."

    cat >"${SYSTEMD_SERVICE_FILE}" <<EOF
[Unit]
Description=School Management System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    # Set proper permissions
    chmod 644 "${SYSTEMD_SERVICE_FILE}"
}

setup_autostart() {
    log "GREEN" "Setting up auto-start..."

    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}"
    systemctl start "${SERVICE_NAME}"

    log "GREEN" "Checking service status..."
    if ! systemctl is-active --quiet "${SERVICE_NAME}"; then
        log "RED" "Warning: Service failed to start. Check logs with: journalctl -u ${SERVICE_NAME}"
        exit 1
    fi
}

check_app_health() {
    log "GREEN" "Checking application health..."

    # Wait for the application to start
    local max_attempts=30
    local attempt=1
    local wait_time=10

    while ! curl -s "http://localhost:3005" >/dev/null; do
        if [ $attempt -ge $max_attempts ]; then
            log "RED" "Error: Application failed to start after $((max_attempts * wait_time)) seconds"
            exit 1
        fi
        log "YELLOW" "Waiting for application to start (attempt $attempt/$max_attempts)..."
        sleep $wait_time
        ((attempt++))
    done

    log "GREEN" "Application is running!"
}

print_success_message() {
    log "GREEN" "\nInstallation completed successfully!"
    echo -e "\nApplication Details:"
    echo -e "  - URL: http://localhost:3005"
    echo -e "  - Install Directory: ${INSTALL_DIR}"
    echo -e "  - Service Name: ${SERVICE_NAME}"
    echo -e "\nUseful commands:"
    echo -e "  - Check status: systemctl status ${SERVICE_NAME}"
    echo -e "  - View logs: journalctl -u ${SERVICE_NAME}"
    echo -e "  - Start service: systemctl start ${SERVICE_NAME}"
    echo -e "  - Stop service: systemctl stop ${SERVICE_NAME}"
    echo -e "  - Restart service: systemctl restart ${SERVICE_NAME}"
}

main() {
    if [ $# -ne 1 ]; then
        echo "Usage: $0 <distribution-package.tar.gz>"
        exit 1
    fi

    local dist_file=$1

    log "GREEN" "Starting installation..."
    check_prerequisites
    create_install_directory
    extract_distribution "$dist_file"
    create_systemd_service
    setup_autostart
    check_app_health
    print_success_message
}

main "$@"
