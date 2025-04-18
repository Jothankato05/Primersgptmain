#!/bin/bash

# Export environment variables
export JWT_SECRET=c6ac6f33046d50700a93ed5a5483cba6beeb1fd7f368569751629ecc7c3a01cb4922c722b4b11afe2f7cf280b07d10544b64445ef8de0915e7ed2cd0f8dbd47d

# Pull latest changes
git pull

# Build and start containers
docker-compose down
docker-compose build
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service health
curl http://localhost:3000/health
curl http://localhost:3000/api/ollama-status

echo "Deployment complete! Services are running at:"
echo "Backend: http://localhost:3000"
echo "Ollama: http://localhost:11434"
