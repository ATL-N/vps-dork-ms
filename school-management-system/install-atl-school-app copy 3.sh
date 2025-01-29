#!/bin/bash

# Exit on any error
set -e

# Colors for messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "${GREEN}Starting School Management System installation...${NC}"

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    echo "${RED}Error: Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Find distribution package
PACKAGE_FILE=$(find "$SCRIPT_DIR" -maxdepth 1 -type f -name "school-app-distribution-*.tar.gz")
if [ -z "$PACKAGE_FILE" ]; then
  echo "${RED}Error: Distribution package (school-app-distribution-*.tar.gz) not found in the same directory as the installation script.${NC}"
  exit 1
fi
echo "${GREEN}Distribution package found: $PACKAGE_FILE${NC}"

# Extract the version from the filename
PACKAGE_VERSION=$(echo "$PACKAGE_FILE" | sed -E 's/.*school-app-distribution-(.*).tar.gz/\1/')

# Create application directory
echo "${GREEN}Creating application directory...${NC}"
APP_DIR="$HOME/school-app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Extract distribution package
echo "${GREEN}Extracting distribution package...${NC}"
tar xzf "$PACKAGE_FILE"

# Copy .env file
echo "${GREEN}Copying .env file...${NC}"
cp .env.example .env

# Display instructions for editing .env
echo "${GREEN}Please edit the .env file with your actual values using any text editor. You can run: nano .env or vim .env ${NC}"

# Load Docker images
echo "${GREEN}Loading Docker images... this may take some minutes...${NC}"
docker load -i school-app-full.tar
echo "${GREEN}Docker images loaded successfully!${NC}"

# Start the application
echo "${GREEN}Starting the application...${NC}"
docker compose up -d

# Function to check if a container is healthy
check_container_health() {
    local container_name=$1
    local max_attempts=30
    local attempt=1

    echo "Waiting for $container_name to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if [ "$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)" == "healthy" ]; then
            echo "${GREEN}$container_name is healthy!${NC}"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: Waiting for $container_name to be healthy..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "${RED}Error: $container_name failed to become healthy after $max_attempts attempts${NC}"
    return 1
}

# Get the db container id
DB_CONTAINER_ID=$(docker ps -q --filter name="db")

# Wait for the PostgreSQL container to be healthy
if ! check_container_health "$DB_CONTAINER_ID"; then
    echo "${RED}Error: PostgreSQL container failed to become healthy. Exiting...${NC}"
    exit 1
fi

# Create startup script
echo "${GREEN}Creating startup script...${NC}"
cat >"$APP_DIR/start-school-app.sh" <<'EOL'
#!/bin/bash
cd "$HOME/school-app"
docker compose up -d
EOL
chmod +x "$APP_DIR/start-school-app.sh"

# Check if the crontab entry already exists
CRONTAB_ENTRY_EXISTS=$(crontab -l | grep "$APP_DIR/start-school-app.sh")

# Add startup script to crontab if it doesn't already exist
if [ -z "$CRONTAB_ENTRY_EXISTS" ]; then
  (
      crontab -l
      echo "@reboot $APP_DIR/start-school-app.sh"
  ) | crontab -
  echo "${GREEN}Startup script added to crontab for automatic startup.${NC}"
else
  echo "${GREEN}Startup script is already in crontab. Skipping crontab entry creation.${NC}"
fi


# Get ports to display to the user
NEXTJS_PORT=$(grep NEXTAUTH_URL .env | awk -F'=' '{print $2}' | awk -F':' '{print $3}')
DB_PORT=$(grep DB_PORT .env | awk -F'=' '{print $2}')

echo "${GREEN}School Management System installed and configured.${NC}"
echo "${GREEN}The application will start automatically on system startup.${NC}"
echo "${GREEN}You can also manually start the application by running: $APP_DIR/start-school-app.sh${NC}"
echo "${GREEN}The application should be available at http://localhost:$NEXTJS_PORT ${NC}"
echo "${GREEN}You can connect to the database at port $DB_PORT on your host machine ${NC}"