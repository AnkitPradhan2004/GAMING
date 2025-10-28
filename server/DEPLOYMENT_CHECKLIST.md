# Production Deployment Checklist

## Pre-Deployment

- [ ] All environment variables configured in `.env`
- [ ] MongoDB connection string verified
- [ ] JWT secret is strong (min 32 characters)
- [ ] CLIENT_URL correctly set to production domain
- [ ] All dependencies installed (`npm install`)
- [ ] Code tested locally (`npm run dev`)
- [ ] No console.log statements left (use logger instead)
- [ ] Security headers verified (helmet.js)
- [ ] CORS configured for production URLs only

## Database

- [ ] MongoDB Atlas cluster created
- [ ] Database credentials secure
- [ ] Backup strategy in place
- [ ] Connection pooling configured
- [ ] Indexes created for queries

## Deployment Methods

### Option 1: PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
npm run pm2:start

# Set to restart on server reboot
pm2 startup

# Save PM2 config
pm2 save

# Monitor
npm run pm2:monit
```

Checklist:

- [ ] PM2 installed globally
- [ ] Startup hook configured
- [ ] PM2 processes saved
- [ ] Log rotation configured
- [ ] Memory limits set

### Option 2: Docker Deployment

```bash
# Build image
docker build -t aura-gaming-server:latest .

# Run container
docker run -d \
  --name aura-server \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  -v logs:/app/logs \
  aura-gaming-server:latest

# Or use docker-compose
docker-compose -f docker-compose.yml up -d
```

Checklist:

- [ ] Dockerfile builds successfully
- [ ] Environment variables passed correctly
- [ ] Port mapping verified
- [ ] Volume mounting for logs
- [ ] Restart policy set

### Option 3: Cloud Platform Deployment

**Railway:**

- [ ] GitHub repository connected
- [ ] Environment variables added in dashboard
- [ ] Automatic deployments enabled
- [ ] Health checks configured

**Heroku (Legacy):**

- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] Config variables set
- [ ] Procfile created (if needed)

**AWS/DigitalOcean/GCP:**

- [ ] Server provisioned
- [ ] Node.js installed
- [ ] PM2 or systemd configured
- [ ] Nginx reverse proxy setup (if needed)
- [ ] SSL certificate obtained

## Post-Deployment

- [ ] Health check endpoint responds: `/health`
- [ ] API endpoints accessible
- [ ] Socket.io connection works
- [ ] Logging shows no errors
- [ ] Database connection active
- [ ] CORS working from frontend domain
- [ ] Rate limiting active
- [ ] Authentication working
- [ ] Wallet operations functional
- [ ] Chess game creation/joining works

## Monitoring & Maintenance

- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Configure log aggregation (ELK, Datadog, etc.)
- [ ] Monitor application performance
- [ ] Set up automated backups
- [ ] Monitor MongoDB metrics
- [ ] Watch for security updates
- [ ] Regular dependency updates planned

## SSL/HTTPS

- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Certificate auto-renewal configured
- [ ] HTTPS enforced
- [ ] Secure headers configured
- [ ] Mixed content warnings resolved

## Security

- [ ] `.env` file never committed to git
- [ ] Secrets stored securely
- [ ] Database user has minimal required permissions
- [ ] API keys rotated regularly
- [ ] CORS whitelist reviewed
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] SQL injection protection (Mongoose validation)

## Performance

- [ ] PM2 clustering enabled (if multi-core)
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Compression middleware enabled
- [ ] Load testing performed
- [ ] Response times acceptable
- [ ] Memory usage monitored

## Backup & Disaster Recovery

- [ ] MongoDB automated backups enabled
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Environment variables backup
- [ ] Database dump locations documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

## Documentation

- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created
- [ ] Runbook for common issues
- [ ] Team trained on deployment process

## Team Communication

- [ ] Deployment notification sent
- [ ] Team aware of new environment
- [ ] Support contact information updated
- [ ] Status page updated
- [ ] Changelog updated

## Final Sign-off

- [ ] All items checked off
- [ ] Testing completed successfully
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Product owner approval obtained
- [ ] Ready for production traffic
