# Docker Setup for Simli Interview Application

This document provides instructions for running the Simli Interview Application using Docker.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- Git

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Required
NEXT_PUBLIC_SIMLI_API_KEY=your_simli_api_key
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key

# Optional (defaults to https://www.google.com)
NEXT_PUBLIC_REDIRECT_URL=https://your-redirect-url.com
```

## Quick Start

### Development Mode

Run the application in development mode with hot reload:

```bash
# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

Access the application at: http://localhost:3000

### Production Mode

#### Basic Production Setup

```bash
# Build and start the production container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Production with Nginx Proxy

```bash
# Start with nginx profile
docker-compose --profile production up --build
```

This will start both the Next.js application and Nginx proxy server.
- Application: http://localhost:3000
- Nginx Proxy: http://localhost

## Docker Commands

### Build Commands

```bash
# Build the production image
docker build -t simli-interview-app .

# Build the development image
docker build -f Dockerfile.dev -t simli-interview-app-dev .

# Build with specific environment variables
docker build --build-arg NEXT_PUBLIC_SIMLI_API_KEY=your_key -t simli-interview-app .
```

### Container Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f simli-interview-app

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a service
docker-compose restart simli-interview-app
```

### Debugging

```bash
# Execute commands in running container
docker-compose exec simli-interview-app sh

# View container resource usage
docker stats simli-interview-app

# Inspect container
docker inspect simli-interview-app
```

## Production Deployment

### Using Docker Hub

1. Build and tag the image:
```bash
docker build -t your-username/simli-interview-app:latest .
```

2. Push to Docker Hub:
```bash
docker login
docker push your-username/simli-interview-app:latest
```

3. On production server:
```bash
docker pull your-username/simli-interview-app:latest
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name simli-interview-app \
  your-username/simli-interview-app:latest
```

### Using Docker Compose in Production

1. Copy files to production server:
   - `docker-compose.yml`
   - `.env` (with production values)
   - `nginx.conf` (if using nginx)

2. Run:
```bash
docker-compose up -d
```

### SSL/HTTPS Configuration

1. Obtain SSL certificates (e.g., using Let's Encrypt)
2. Place certificates in `./ssl/` directory
3. Update `nginx.conf` with your domain and uncomment HTTPS section
4. Run with nginx profile:
```bash
docker-compose --profile production up -d
```

## Optimization Tips

### Multi-Stage Build
The production Dockerfile uses multi-stage building to minimize image size:
- Stage 1: Install dependencies
- Stage 2: Build the application
- Stage 3: Run with minimal footprint

### Image Size Optimization
- Uses Alpine Linux for smaller base image
- Only copies necessary files for production
- Uses Next.js standalone output mode

### Performance
- Nginx serves as reverse proxy for better performance
- Health check endpoint available at `/health`
- Automatic restart on failure with `restart: unless-stopped`

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use 3001 instead
   ```

2. **Environment variables not loading**
   - Ensure `.env` file is in project root
   - Check variable names match exactly
   - Rebuild after changing build-time variables

3. **Hot reload not working in development**
   - Ensure `WATCHPACK_POLLING=true` is set
   - Check volume mounts are correct
   - Restart container after file structure changes

4. **Out of memory errors**
   ```bash
   # Increase memory limit in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

5. **Permission issues**
   ```bash
   # Fix permissions
   docker-compose exec simli-interview-app chown -R nextjs:nodejs /app
   ```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use secrets management** in production (Docker Secrets, Kubernetes Secrets, etc.)
3. **Run as non-root user** (already configured in Dockerfile)
4. **Keep base images updated** regularly
5. **Scan images for vulnerabilities**:
   ```bash
   docker scan simli-interview-app
   ```

## URL Parameters

The application supports dynamic configuration via URL parameters. See main README for details.

Example with Docker:
```
http://localhost:3000/?name=John%20Doe&position=Software%20Engineer
```

## Support

For issues specific to Docker setup, check:
- Docker logs: `docker-compose logs`
- Container status: `docker-compose ps`
- System resources: `docker system df`

## Clean Up

Remove all project containers and images:
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi simli-interview-app simli-interview-app-dev

# Clean up unused Docker resources
docker system prune -a
```
