#!/bin/bash

# Deployment script for DevOps Assessment Application
# This script handles zero-downtime deployments

set -e

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}

echo "Deploying to ${ENVIRONMENT} with image tag ${IMAGE_TAG}"

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
  echo "Initializing Terraform..."
  terraform init
fi

# Plan deployment
echo "Planning Terraform deployment..."
terraform plan \
  -var="environment=${ENVIRONMENT}" \
  -var="image_tag=${IMAGE_TAG}" \
  -out=tfplan

# Apply deployment
echo "Applying Terraform deployment..."
terraform apply tfplan

# Clean up plan file
rm -f tfplan

echo "Deployment completed successfully!"


