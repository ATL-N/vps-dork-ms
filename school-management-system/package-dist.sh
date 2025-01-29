#!/bin/bash

# Create distribution directory
mkdir -p dist
DIST_NAME="school-management-system"
DIST_FILE="$DIST_NAME.tar.gz"

# Copy necessary files
cp Dockerfile dist/
cp docker-compose.yml dist/
cp install.sh dist/

# Create README file
cat > dist/README.md << EOF
# School Management System Installation Guide

## Prerequisites
- Linux/Unix-based system
- Internet connection for initial setup

## Installation Steps
1. Extract the archive:
   \`\`\`bash
   tar -xzf $DIST_FILE
   cd $DIST_NAME
   \`\`\`

2. Run the installation script:
   \`\`\`bash
   ./install.sh
   \`\`\`

3. The application will be available at http://localhost:3000

## Troubleshooting
- To view logs: \`docker-compose logs\`
- To restart: \`docker-compose restart\`
- To stop: \`docker-compose down\`
- To start: \`docker-compose up -d\`

For support, contact: [Your Contact Information]
EOF

# Create version file
echo "1.0.0" > dist/version.txt

# Package everything
cd dist
tar -czf "../$DIST_FILE" ./*
cd ..

# Clean up
rm -rf dist

echo "Distribution package created: $DIST_FILE"