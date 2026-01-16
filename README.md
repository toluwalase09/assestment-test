# DevOps Assessment - Production-Ready Node.js Application

This repository contains a production-ready Node.js application with a complete DevOps pipeline, including containerization, CI/CD, Infrastructure as Code, and security best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Application Features](#application-features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure Deployment](#infrastructure-deployment)
- [Security Features](#security-features)
- [Key Decisions](#key-decisions)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This application demonstrates a production-ready DevOps setup for a Node.js web application with the following endpoints:

- `GET /health` - Health check endpoint
- `GET /status` - Status endpoint with database connectivity check
- `POST /process` - Data processing endpoint

The application runs on port 3000 and includes:
- Full containerization with Docker
- CI/CD pipeline with GitHub Actions
- Infrastructure as Code with Terraform
- AWS ECS deployment with zero-downtime
- Security best practices
- Comprehensive logging and monitoring

## 🚀 Application Features

- **Express.js** web framework
- **PostgreSQL** database integration
- **Health checks** for container orchestration
- **Graceful shutdown** handling
- **Comprehensive error handling**
- **Structured logging**

## 🏗️ Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Actions │
│   (CI/CD)       │
└────────┬────────┘
         │
         ├──► Test & Build
         │
         ▼
┌─────────────────┐
│  Container Reg  │
│  (GHCR/Docker)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AWS ECS       │
│   (Fargate)     │
└────────┬────────┘
         │
         ├──► Application Load Balancer
         │
         ▼
┌─────────────────┐
│   Application   │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RDS Postgres  │
└─────────────────┘
```

## 📦 Prerequisites

### Local Development
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Docker** 20.x or higher
- **Docker Compose** 2.x or higher

### Infrastructure Deployment
- **Terraform** 1.6.0 or higher
- **AWS CLI** configured with appropriate credentials
- **AWS Account** with permissions for:
  - VPC, EC2, ECS, RDS, ALB, ACM, Secrets Manager, CloudWatch

## 🛠️ Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assestment-test
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devops_app
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:
- Node.js application on `http://localhost:3000`
- PostgreSQL database on `localhost:5432`

### 5. Run Locally (Without Docker)

First, start PostgreSQL:

```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=devops_app \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Or use your local PostgreSQL installation
```

Then start the application:

```bash
npm start
```

### 6. Run Tests

```bash
npm test
```

### 7. Access the Application

- **Health Check**: `http://localhost:3000/health`
- **Status**: `http://localhost:3000/status`
- **Process Endpoint**: `POST http://localhost:3000/process`

Example request:

```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"data": "test data"}'
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t devops-assessment-app:latest .
```

### Run Container

```bash
docker run -d \
  --name devops-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-password \
  devops-assessment-app:latest
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) includes:

### Workflow Stages

1. **Test** - Runs on all pushes and PRs
   - Installs dependencies
   - Runs Jest test suite

2. **Build and Push** - Runs on pushes to main
   - Builds Docker image using Buildx
   - Pushes to GitHub Container Registry (GHCR)
   - Tags images with branch, SHA, and latest

3. **Deploy Staging** - Runs after successful build
   - Initializes Terraform
   - Plans and applies infrastructure changes
   - Deploys to staging environment

4. **Deploy Production** - Requires manual approval
   - Same process as staging
   - Deploys to production environment
   - Includes additional safety checks

### Required GitHub Secrets

Configure these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Manual Approval

Production deployments require manual approval through GitHub Environments:
1. Go to Repository Settings → Environments
2. Create "production" environment
3. Enable "Required reviewers"

## ☁️ Infrastructure Deployment

### Terraform Configuration

The infrastructure is defined in the `terraform/` directory:

- **VPC** with public and private subnets
- **Application Load Balancer** with HTTPS
- **ECS Fargate** service for zero-downtime deployments
- **RDS PostgreSQL** database
- **Security Groups** with least privilege
- **Secrets Manager** for database credentials
- **CloudWatch** for logging

### Deployment Steps

1. **Configure Terraform Variables**

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

2. **Initialize Terraform**

```bash
terraform init
```

3. **Plan Deployment**

```bash
terraform plan \
  -var="environment=staging" \
  -var="image_tag=latest" \
  -var="db_password=your-secure-password"
```

4. **Apply Infrastructure**

```bash
terraform apply
```

5. **Using Deployment Script**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh staging latest
```

### Terraform Backend (Optional)

For production use, configure an S3 backend:

```hcl
# terraform/backend.tf
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "devops-assessment/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### Outputs

After deployment, Terraform outputs:

- `alb_dns_name` - Application Load Balancer DNS
- `application_url` - Full application URL
- `ecs_cluster_name` - ECS cluster name
- `rds_endpoint` - Database endpoint

## 🔒 Security Features

### Container Security

- **Multi-stage builds** to reduce image size
- **Non-root user** (nodejs:1001) inside container
- **Minimal base image** (Alpine Linux)
- **No secrets in images** - all secrets via environment variables or AWS Secrets Manager

### Infrastructure Security

- **Private subnets** for application and database
- **Security groups** with least privilege access
- **Encrypted RDS** storage
- **HTTPS only** via ALB with ACM certificate
- **Secrets Manager** for sensitive data
- **IAM roles** with minimal required permissions

### CI/CD Security

- **No secrets in code** - all secrets in GitHub Secrets
- **Automated security scanning** (can be extended)
- **Manual approval** for production deployments

## 🎯 Key Decisions

### 1. Containerization

**Decision**: Multi-stage Dockerfile with Alpine Linux

**Rationale**:
- Reduces image size (~50MB vs ~900MB)
- Improves security with minimal attack surface
- Faster deployments and reduced storage costs

### 2. Orchestration Platform

**Decision**: AWS ECS Fargate

**Rationale**:
- Serverless - no EC2 management
- Automatic scaling capabilities
- Integrated with AWS services (ALB, CloudWatch, Secrets Manager)
- Cost-effective for variable workloads

### 3. Database

**Decision**: RDS PostgreSQL in private subnets

**Rationale**:
- Managed service reduces operational overhead
- Automatic backups and point-in-time recovery
- Encryption at rest and in transit
- High availability options

### 4. Zero-Downtime Deployment

**Decision**: ECS rolling deployment with health checks

**Rationale**:
- ECS handles rolling updates automatically
- Health checks ensure only healthy tasks receive traffic
- Minimum healthy percent (100%) ensures availability
- Maximum percent (200%) allows new tasks before stopping old ones

### 5. Secrets Management

**Decision**: AWS Secrets Manager

**Rationale**:
- Centralized secret management
- Automatic rotation capabilities
- Audit logging
- Integration with ECS task definitions

### 6. CI/CD Platform

**Decision**: GitHub Actions

**Rationale**:
- Native GitHub integration
- Free for public repositories
- Extensive marketplace of actions
- Environment protection with manual approvals

### 7. Infrastructure as Code

**Decision**: Terraform

**Rationale**:
- Declarative infrastructure
- State management
- Multi-cloud support
- Large community and provider ecosystem

## 📊 Monitoring & Observability

### Health Checks

- **Container health check**: `/health` endpoint every 30s
- **ALB health check**: `/health` endpoint every 30s
- **ECS service health**: Monitored by ECS

### Logging

- **Application logs**: CloudWatch Logs via ECS
- **Structured logging**: JSON format for easy parsing
- **Log retention**: 7 days (configurable)

### Metrics

- **ECS metrics**: Available in CloudWatch
- **ALB metrics**: Request count, latency, error rates
- **RDS metrics**: CPU, memory, connections

## 🐛 Troubleshooting

### Application Not Starting

1. Check container logs:
```bash
docker logs devops-app
```

2. Verify environment variables:
```bash
docker exec devops-app env
```

3. Check database connectivity:
```bash
curl http://localhost:3000/status
```

### Database Connection Issues

1. Verify database is running:
```bash
docker ps | grep postgres
```

2. Check connection string in environment variables
3. Verify network connectivity between containers

### Terraform Deployment Issues

1. Verify AWS credentials:
```bash
aws sts get-caller-identity
```

2. Check Terraform state:
```bash
terraform state list
```

3. Review Terraform plan:
```bash
terraform plan -detailed-exitcode
```

### ECS Deployment Issues

1. Check ECS service events:
```bash
aws ecs describe-services \
  --cluster <cluster-name> \
  --services <service-name>
```

2. Review task logs in CloudWatch
3. Verify security group rules
4. Check IAM role permissions

## 📝 Additional Notes

### Environment Variables

All sensitive values should be:
- Stored in AWS Secrets Manager (production)
- Set via GitHub Secrets (CI/CD)
- Never committed to repository

### Cost Optimization

- Use `db.t3.micro` for development/staging
- Consider Reserved Instances for production
- Enable ECS container insights only when needed
- Use appropriate log retention periods

### Scaling

The infrastructure supports:
- **Horizontal scaling**: Increase `service_desired_count`
- **Vertical scaling**: Adjust `task_cpu` and `task_memory`
- **Auto-scaling**: Can be added via ECS Auto Scaling policies

## 📚 Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 📄 License

ISC

---

**Built for DevOps Assessment** - Demonstrating production-ready DevOps practices and infrastructure automation.
