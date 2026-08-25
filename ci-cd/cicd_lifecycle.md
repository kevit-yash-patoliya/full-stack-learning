# End-to-End CI/CD Pipeline & DevOps Lifecycle

This guide maps out the full lifecycle of a modern application—from writing code locally to hosting it in production on AWS with continuous monitoring.

---

## 1. Visual Flow of the DevOps Pipeline

```
  [ Local Dev ] ────► [ Git Commit ] ────► [ GitHub Push ] ────► [ GitHub Actions ]
                                                                        │
 ┌──────────────────────────────────────────────────────────────────────┘
 ▼
 [ Run Tests ] ────► [ Build Docker Image ] ────► [ ECR Registry ] ────► [ Deploy to AWS ]
                                                                                │
                                                                                ▼
                                                                        [ CloudWatch Logs ]
```

---

## 2. Deep Dive: Phase by Phase

### Phase 1: Local Development & Version Control (Git)
Developers write features or fixes on their local machines.
* **Feature Branches:** Developers work in isolated branches (e.g., `feature/login`) rather than committing directly to `main`.
* **Committing Code:** Code changes are grouped and committed:
  ```bash
  git checkout -b feature/login
  git add .
  git commit -m "feat: implement JWT authentication"
  ```

### Phase 2: Centralized Collaboration (GitHub)
GitHub hosts the code repository and acts as the collaboration hub.
* **Pushing Code:** Code is pushed from local machine to the remote repository.
  ```bash
  git push origin feature/login
  ```
* **Pull Request (PR):** A developer creates a PR to merge their feature branch into the `main` branch. This is where code review happens, and automated checks (CI) are triggered.

### Phase 3: Automation Orchestration (GitHub Actions)
GitHub Actions listens for webhook events (like a new PR or push to `main`).
* **Trigger:** An event is received, starting a workflow run.
* **Runners:** GitHub allocates an isolated virtual machine (Runner) to execute the commands defined in the workflow YAML file.
* **Secrets Handling:** Secrets (credentials, keys) are injected into the runner dynamically without exposing them in the codebase.

### Phase 4: Verification (Build & Test)
The runner starts executing verification steps:
* **Linting:** Scans the code formatting and syntax (`npm run lint`).
* **Testing:** Runs automated test suites (`npm run test`) to verify the code behaves as expected and regression bugs are caught.
* **Building:** Compiles TS/JS files or minifies frontend bundles (`npm run build`) to ensure the code compiles without errors.

### Phase 5: Containerization (Docker Image)
Once the tests pass, the application code is packaged into an isolated, portable **Docker Image**.
* **Dockerfile:** The runner executes `docker build -t my-app:latest .` based on the project's Dockerfile.
* **Consistency:** Containerization guarantees that the app will run exactly the same way in production as it did during testing.

### Phase 6: Image Storage (Container Registry)
The newly built Docker image must be saved in a centralized registry so production servers can retrieve it.
* **ECR Login:** The runner authenticates with AWS ECR.
* **Tagging:** The image is tagged with the unique Git Commit SHA (e.g., `my-app:a1b2c3d`) to prevent overwriting previous versions and ensure traceability.
* **Pushing:** The image is uploaded:
  ```bash
  docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/my-app:a1b2c3d
  ```

### Phase 7: Deployment Orchestration
The deployment stage instructs the hosting provider to replace old container instances with the new image.
* **Task Definition Update:** In AWS ECS, the configuration JSON file is updated with the new ECR image URL.
* **Deployment Strategies:**
  * **Rolling Update (Default):** Gradually spawns new containers while stopping old ones. (Zero downtime).
  * **Blue-Green:** Spawns a complete copy of the application (Green) alongside the old one (Blue), shifting traffic to Green once healthy. (Zero downtime, easy rollback).
  * **Canary:** Deploys changes to a small subset of users first, monitoring health before rolling out to the rest.

### Phase 8: Hosting Infrastructure (AWS)
The application runs on AWS cloud infrastructure.
* **ECS Fargate:** Runs the Docker containers as serverless tasks.
* **Application Load Balancer (ALB):** Distributes public HTTP/HTTPS traffic across all healthy running container tasks.
* **Security Group:** A virtual firewall restricting access so only the Load Balancer can communicate directly with the backend containers.

### Phase 9: Continuous Monitoring & Log Aggregation
Post-deployment, the application must be continuously monitored for performance and health.
* **AWS CloudWatch:** Collects system performance metrics (CPU, Memory) and application stdout/stderr logs.
* **Health Checks:** The ALB continuously sends ping requests to the container's `/health` endpoint. If a container stops responding, it is automatically terminated and replaced.
* **Alerting:** If error rates spike, alerts notify developers immediately via Slack or email.
