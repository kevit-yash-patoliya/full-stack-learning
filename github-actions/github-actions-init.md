# Complete GitHub Actions & CI/CD Learning Guide

GitHub Actions is a Continuous Integration and Continuous Delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipelines directly from your GitHub repository.

---

## 1. What is CI/CD?

* **Continuous Integration (CI):** Automates building, testing, and merging code changes back into the main branch. This catches integration bugs early.
* **Continuous Delivery/Deployment (CD):** Automates the release process to deploy the successfully tested code to production or staging servers.

---

## 2. Core GitHub Actions Terminology

```
   [ Trigger Event (e.g., push) ]
                 │
                 ▼
          [ Workflow ]
        ┌────────────────┐
        │ Job 1 (Build)  │
        │  ├── Step 1    │
        │  └── Step 2    │
        └───────┬────────┘
                │ (needs)
                ▼
        ┌────────────────┐
        │ Job 2 (Deploy) │
        │  ├── Step 1    │
        │  └── Step 2    │
        └────────────────┘
```

* **Workflow:** A configurable automated process written in a YAML file in the `.github/workflows/` directory.
* **Event:** A specific trigger that starts a workflow (e.g., `push`, `pull_request`, `schedule`, or manual triggering via `workflow_dispatch`).
* **Job:** A set of steps that execute on the same runner. Jobs run in parallel by default but can be run sequentially using `needs`.
* **Runner:** The server that executes the job. Can be GitHub-hosted (Ubuntu, macOS, Windows) or Self-hosted on your own hardware.
* **Step:** An individual task within a job. A step can run shell commands (`run:`) or reusable packages called Actions (`uses:`).
* **Action:** A reusable extension/plugin for GitHub Actions (e.g., checking out code, setting up Node.js).
* **Secrets:** Encrypted variables containing sensitive tokens (like API keys, passwords, or AWS keys) configured in your repository settings under **Settings -> Secrets and variables -> Actions**.

---

## 3. Step-by-Step CI Workflow (Build & Test React/Node.js)

Create a file named `.github/workflows/ci.yml` in your project root.

```yaml
name: Continuous Integration

# 1. Triggers
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 2. Global Environment Variables
env:
  NODE_VERSION: '18'

# 3. Workflows Jobs
jobs:
  build-and-test:
    runs-on: ubuntu-latest # Runner OS

    steps:
      # Step A: Checkout code from the repository
      - name: Checkout Code
        uses: actions/checkout@v4

      # Step B: Install Node.js runtime
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm' # Automatically caches node_modules for faster builds

      # Step C: Install dependencies
      - name: Install Dependencies
        run: npm ci

      # Step D: Run Linter
      - name: Lint Code
        run: npm run lint

      # Step E: Run Tests
      - name: Run Tests
        run: npm run test

      # Step F: Run production compilation
      - name: Build Application
        run: npm run build
```

---

## 4. End-to-End CD Workflow: Deploying Docker App to AWS (ECR & ECS Fargate)

This production-grade workflow automatically builds a Docker container on push, pushes it to AWS ECR, and deploys it to ECS Fargate.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production AWS ECS

on:
  push:
    branches:
      - main

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: node-app
  ECS_SERVICE: my-production-service
  ECS_CLUSTER: my-production-cluster
  ECS_TASK_DEFINITION: .aws/task-definition.json # Local JSON definition file
  CONTAINER_NAME: node-app

jobs:
  deploy:
    name: Build, Push and Deploy
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout Repository
      - name: Checkout Code
        uses: actions/checkout@v4

      # 2. Configure AWS Credentials safely using repository secrets
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # 3. Log in to AWS ECR
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      # 4. Build, Tag, and Push Docker image to ECR
      - name: Build, Tag, and Push Image to ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }} # Use git commit SHA as version tag
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          # Store image name in outputs for the next steps
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      # 5. Inject the new ECR Image URL into the ECS Task Definition
      - name: Update Task Definition Image
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v2
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION }}
          container-name: ${{ env.CONTAINER_NAME }}
          image: ${{ steps.build-image.outputs.image }}

      # 6. Deploy the updated Task Definition to the ECS cluster
      - name: Deploy to Amazon ECS Fargate
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

---

## 5. Advanced Pipeline Concepts

### Sequential Dependency Chain (`needs`)
By default, jobs run in parallel. Use `needs` to enforce ordering. If the `test` job fails, `deploy` will not run:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: test # 👈 Enforces that the test job must pass first!
    steps:
      - run: echo "Deploying app..."
```

### Artifact Storage (Upload/Download)
Share files (like test reports or build outputs) between jobs, or save them for review.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      
      # Save build folder as an artifact
      - name: Save Build output
        uses: actions/upload-artifact@v4
        with:
          name: build-folder
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      # Retrieve the saved build folder
      - name: Download Build output
        uses: actions/download-artifact@v4
        with:
          name: build-folder
          path: public-html/
```

### Conditional Execution (`if`)
Run steps only under specific conditions (e.g., only run deployment if we are on the `main` branch):
```yaml
- name: Deploy to Production Server
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

---

## 6. GitHub Actions Best Practices

1. **Pin Action Versions:** Lock third-party actions to a specific tag or commit SHA (e.g., `actions/checkout@v4`) instead of `@main` to prevent unexpected breaking changes.
2. **Use Matrix Strategy for Testing:** Test your application across multiple environments or Node.js versions in parallel:
   ```yaml
   strategy:
     matrix:
       node-version: [16, 18, 20]
       os: [ubuntu-latest, macos-latest]
   ```
3. **Minimize Build Times:** Utilize `actions/cache` or built-in caches in `setup-node` to avoid downloading packages from scratch on every run.
4. **Enforce Branch Protection:** Make CI checks mandatory before a pull request can be merged into production.
