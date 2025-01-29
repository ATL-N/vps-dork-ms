#!/bin/bash

# Exit on any error
set -e

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Create application directory
echo "Creating application directory..."
APP_DIR="$HOME/school-app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Extract distribution package
echo "Extracting distribution package..."
tar xzf "$SCRIPT_DIR/school-app-distribution.tar.gz"

# Copy .env file and update with your values
echo "Copying .env file..."
cp .env.example .env
nano .env

# Load Docker images
echo "Loading Docker images..."
docker load -i school-app-full.tar

# Start the application
echo "Starting the application..."
docker compose up -d

# Function to check if a container is healthy
check_container_health() {
    local container_name=$1
    local max_attempts=30
    local attempt=1

    echo "Waiting for $container_name to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if [ "$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)" == "healthy" ]; then
            echo "$container_name is healthy!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: Waiting for $container_name to be healthy..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "Error: $container_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Wait for the PostgreSQL container to be healthy
if ! check_container_health "school-management-system-db-1"; then
    echo "Error: PostgreSQL container failed to become healthy. Exiting..."
    exit 1
fi

# Check if the database is initialized
echo "Checking if the database is initialized..."
if ! docker exec school-management-system-db-1 psql -U postgres -d atlschoolmamangementsystem -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND column_name IN ('user_id', 'user_name', 'user_email', 'password', 'role')"; then
    echo "Initializing the database with initial data..."
    docker exec school-management-system-db-1 psql -U postgres -d atlschoolmamangementsystem < /app/init-db/01-initial-data.sql
    echo "Applying database schema changes..."
    docker exec school-management-system-db-1 psql -U postgres -d atlschoolmamangementsystem < /app/init-db/02-schema-changes.sql
elif ! docker exec school-management-system-db-1 psql -U postgres -d atlschoolmamangementsystem -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND column_name IN ('user_id', 'user_name', 'user_email', 'password', 'role', 'new_column')"; then
    echo "Applying database schema changes..."
    docker exec school-management-system-db-1 psql -U postgres -d atlschoolmamangementsystem < /app/init-db/02-schema-changes.sql
else
    echo "Database is already initialized and up-to-date. Skipping data and schema changes."
fi

# Create startup script
echo "Creating startup script..."
cat >"$APP_DIR/start-school-app.sh" <<'EOL'
#!/bin/bash
cd "$HOME/school-app"
docker compose up -d
EOL
chmod +x "$APP_DIR/start-school-app.sh"

# Add startup script to crontab
(
    crontab -l
    echo "@reboot $APP_DIR/start-school-app.sh"
) | crontab -

echo "School Management System installed and configured."
echo "The application will start automatically on system startup."
echo "You can also manually start the application by running: $APP_DIR/start-school-app.sh"