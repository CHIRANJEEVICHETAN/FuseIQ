# EvolveSync - Deployment & Setup Guide

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### **1. Clone Repository**
```bash
git clone <repository-url>
cd FuseIQ
```

### **2. Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### **3. Start Development Environment**
```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
npm run dev:full
```

### **4. Access Application**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:8080 (admin@evolve-sync.com / admin123)
- **Redis Commander**: http://localhost:8081

## 🐳 **Docker Development Setup**

### **Services Included**
- **PostgreSQL**: Database server
- **Redis**: Caching and session storage
- **pgAdmin**: Database administration
- **Redis Commander**: Redis administration

### **Start Services**
```bash
# Start all Docker services
npm run docker:up

# View service logs
npm run docker:logs

# Stop services
npm run docker:down

# Reset everything (removes data)
npm run docker:clean
```

### **Service Configuration**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: evolve_sync
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
  
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  
  pgadmin:
    image: dpage/pgadmin4:latest
    ports: ["8080:80"]
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@evolve-sync.com
      PGADMIN_DEFAULT_PASSWORD: admin123
  
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports: ["8081:8081"]
```

## 🗄️ **Database Setup**

### **Environment Variables**
Create `.env` file in backend directory:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/evolve_sync"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:8080"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@evolve-sync.com"
```

### **Database Migration**
```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run seed
```

### **Database Seeding**
The seed script creates:
- **10 User Roles**: Super Admin, Org Admin, Dept Admin, HR, Project Manager, Team Lead, Employee, Contractor, Intern, Trainee
- **Sample Departments**: Engineering, Marketing, Sales, HR
- **Sample Projects**: With tasks and team assignments
- **Test Users**: With different roles and permissions

**Default Login Credentials:**
- **Super Admin**: `admin@fuseiq.com` / `Admin123!`
- **HR Manager**: `hr@fuseiq.com` / `HR123!`
- **Project Manager**: `pm@fuseiq.com` / `PM123!`
- **Employee**: `employee@fuseiq.com` / `Employee123!`

## 🏗️ **Production Deployment**

### **Environment Setup**

#### **1. Server Requirements**
- **OS**: Ubuntu 20.04+ or similar
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended

#### **2. Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **3. Database Setup (Production)**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE evolve_sync;
CREATE USER evolve_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE evolve_sync TO evolve_user;
\q
```

#### **4. Redis Setup (Production)**
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
# Set: bind 127.0.0.1

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### **Application Deployment**

#### **1. Clone and Setup**
```bash
# Clone repository
git clone <repository-url>
cd FuseIQ

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build
```

#### **2. Environment Configuration**
Create production `.env` file:
```env
# Database
DATABASE_URL="postgresql://evolve_user:secure_password@localhost:5432/evolve_sync"

# Redis
REDIS_URL="redis://:your_redis_password@localhost:6379"

# JWT Secrets (Generate strong secrets)
JWT_SECRET="your-production-jwt-secret-256-bits"
JWT_REFRESH_SECRET="your-production-refresh-secret-256-bits"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-domain.com"

# Email
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"
FROM_EMAIL="noreply@your-domain.com"
```

#### **3. Database Migration**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

#### **4. Process Management**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/server.ts --name "evolvesync-api"

# Start frontend (if serving from Node.js)
pm2 start "npm run preview" --name "evolvesync-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Nginx Configuration**

#### **1. Install Nginx**
```bash
sudo apt install nginx
```

#### **2. Configure Nginx**
```nginx
# /etc/nginx/sites-available/evolvesync
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/FuseIQ/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **3. Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/evolvesync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **Development Workflow**

### **Daily Development**
```bash
# Start development environment
npm run dev:full

# Make changes to code
# Hot reload is enabled for both frontend and backend

# Run tests (when implemented)
npm run test

# Check code quality
npm run lint
npm run type-check
```

### **Database Changes**
```bash
cd backend

# Make changes to schema.prisma
# Generate migration
npm run prisma:migrate

# Update Prisma client
npm run prisma:generate

# Reset database (if needed)
npm run prisma:reset
npm run seed
```

### **Adding New Features**
1. **Backend**: Add routes, services, and middleware
2. **Frontend**: Add components, pages, and API hooks
3. **Database**: Update schema and run migrations
4. **Testing**: Add tests for new functionality
5. **Documentation**: Update API and component documentation

## 📊 **Monitoring & Logging**

### **Application Monitoring**
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs evolvesync-api
pm2 logs evolvesync-frontend

# Restart services
pm2 restart evolvesync-api
```

### **Database Monitoring**
```bash
# PostgreSQL monitoring
sudo -u postgres psql
SELECT * FROM pg_stat_activity;

# Redis monitoring
redis-cli
INFO stats
```

### **System Monitoring**
```bash
# System resources
htop
df -h
free -h

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 **Security Checklist**

### **Production Security**
- [ ] Strong JWT secrets (256-bit)
- [ ] Secure database passwords
- [ ] Redis password protection
- [ ] HTTPS with SSL certificates
- [ ] Firewall configuration (ports 80, 443 only)
- [ ] Regular security updates
- [ ] Database backups
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### **Backup Strategy**
```bash
# Database backup
pg_dump -h localhost -U evolve_user evolve_sync > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U evolve_user evolve_sync > /backups/evolve_sync_$DATE.sql
find /backups -name "*.sql" -mtime +7 -delete
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U evolve_user -d evolve_sync

# Reset database
cd backend
npm run prisma:reset
```

#### **Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### **Port Conflicts**
```bash
# Check port usage
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :8080

# Kill processes
sudo kill -9 <PID>
```

#### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/FuseIQ
chmod -R 755 /path/to/FuseIQ
```

### **Performance Optimization**

#### **Database Optimization**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
```

#### **Application Optimization**
```bash
# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Annual SSL certificate renewal
- [ ] Regular log rotation
- [ ] Performance monitoring
- [ ] Security audits

### **Emergency Procedures**
1. **Service Down**: Check PM2 status, restart services
2. **Database Issues**: Restore from backup, check logs
3. **High Load**: Scale horizontally, optimize queries
4. **Security Breach**: Rotate secrets, audit logs, update dependencies
