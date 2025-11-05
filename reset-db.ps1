# reset-db.ps1
Write-Host "🔄 Resetting PostgreSQL database..." -ForegroundColor Yellow

# Stop all services
Write-Host "⏹️  Stopping services..." -ForegroundColor Cyan
docker-compose down

# Force remove containers
Write-Host "🗑️  Removing containers..." -ForegroundColor Cyan
docker stop english_learning_db 2>$null
docker rm english_learning_db 2>$null
docker stop english_learning_postgres 2>$null
docker rm english_learning_postgres 2>$null

# Remove volume
Write-Host "🗑️  Removing volume..." -ForegroundColor Cyan
docker volume rm english-learning-web_postgres_data -f 2>$null

# Start fresh
Write-Host "🚀 Starting fresh database..." -ForegroundColor Green
docker-compose up -d postgres

# Wait for database
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verify
Write-Host "✅ Verifying database..." -ForegroundColor Green
docker exec english_learning_db psql -U dbuser -d mydatabase -c "\dt"

Write-Host "✨ Database reset complete!" -ForegroundColor Green
Write-Host "💡 You can now run: cd backend && npm run start:dev" -ForegroundColor Cyan