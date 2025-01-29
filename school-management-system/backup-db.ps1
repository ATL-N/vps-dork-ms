Write-Host "Creating database backup..."
docker exec school-management-system-db-1 pg_dump -U postgres atlschoolmamangementsystem > initial-data.sql
