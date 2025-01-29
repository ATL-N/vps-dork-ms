# 3. Create installation script
cat > install-autostart.sh << 'EOL'
#!/bin/bash

# Exit on any error
set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Set your application directory
APP_DIR="/opt/school-app"

# Create application directory if it doesn't exist
mkdir -p $APP_DIR

# Copy necessary files to the application directory
echo "Copying application files..."
# Add commands to copy your application files here
# Example: cp -r /path/to/your/app/* $APP_DIR/
cp -r /opt/lampp/htdocs/school-management-system $APP_DIR/

# Set permissions
chmod +x /usr/local/bin/start-school-app.sh

# Reload systemd daemon
systemctl daemon-reload

# Enable the service
systemctl enable school-app.service

# Start the service
systemctl start school-app.service

echo "Installation complete! Your application will now start automatically on boot."
echo "You can manually start/stop the service with:"
echo "  systemctl start school-app"
echo "  systemctl stop school-app"
echo "Check status with:"
echo "  systemctl status school-app"
EOL

# Make the installation script executable
chmod +x install-autostart.sh