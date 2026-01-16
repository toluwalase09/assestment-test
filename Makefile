.PHONY: help install test build run docker-build docker-up docker-down docker-logs clean deploy-staging deploy-production

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install npm dependencies
	npm install

test: ## Run tests
	npm test

build: ## Build Docker image
	docker build -t devops-assessment-app:latest .

run: ## Run application locally
	npm start

docker-up: ## Start services with docker-compose
	docker-compose up -d

docker-down: ## Stop services with docker-compose
	docker-compose down

docker-logs: ## View application logs
	docker-compose logs -f app

docker-clean: ## Stop services and remove volumes
	docker-compose down -v

deploy-staging: ## Deploy to staging environment
	@echo "Deploying to staging..."
	cd terraform && terraform init && terraform apply -var="environment=staging" -var="image_tag=latest" -auto-approve

deploy-production: ## Deploy to production environment (requires confirmation)
	@echo "Deploying to production..."
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd terraform && terraform init && terraform apply -var="environment=production" -var="image_tag=latest" -auto-approve; \
	fi

clean: ## Clean up local files
	rm -rf node_modules coverage .nyc_output


