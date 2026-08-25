# Complete AWS (Amazon Web Services) Learning & Reference Guide

Amazon Web Services (AWS) is a comprehensive, evolving cloud computing platform provided by Amazon. It offers a mix of Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS) offerings.

---

## 1. Core Cloud Concepts

* **IaaS (Infrastructure as a Service):** Renting raw virtual hardware (e.g., EC2 virtual servers, EBS storage). You manage the OS and runtime.
* **PaaS (Platform as a Service):** Managed environments to deploy code directly without configuring virtual hardware (e.g., Elastic Beanstalk, ECS Fargate). AWS manages the OS and runtime.
* **SaaS (Software as a Service):** Complete end-user software managed by AWS (e.g., Amazon WorkDocs, Amazon Connect).

---

## 2. Core AWS Services & Terminology

### Compute
* **EC2 (Elastic Compute Cloud):** Resizable virtual servers (VMs) in the cloud.
* **Lambda:** Serverless function service. Runs code only in response to events (e.g., HTTP request, database change) and scales automatically.
* **ECS (Elastic Container Service):** Container orchestration service that supports running Docker containers.
* **Fargate:** Serverless compute engine for ECS (no need to manage underlying EC2 hosts for containers).

### Storage & Databases
* **S3 (Simple Storage Service):** Scalable, high-speed object storage. Ideal for static files (images, backups, frontend builds).
* **EBS (Elastic Block Store):** Virtual hard disks attached directly to EC2 instances.
* **RDS (Relational Database Service):** Managed SQL database engine (supports PostgreSQL, MySQL, MariaDB, etc.).
* **DynamoDB:** Fully managed, serverless, high-performance NoSQL database.

### Networking & Content Delivery
* **VPC (Virtual Private Cloud):** Your isolated private network space inside AWS.
* **Route 53:** Highly available, scalable Domain Name System (DNS) web service.
* **CloudFront:** Content Delivery Network (CDN) that caches static assets globally at "edge locations" for fast access.
* **ALB (Application Load Balancer):** Distributes incoming web traffic across multiple targets (like EC2 instances or containers).

### Security
* **IAM (Identity and Access Management):** Controls access to AWS services.
  * **Users:** Individuals with long-term credentials.
  * **Groups:** Collections of users sharing permissions.
  * **Roles:** Temporary permissions assumed by users, apps, or services (e.g., giving an EC2 instance access to S3).
  * **Policies:** JSON documents defining allowed/denied actions.

---

## 3. AWS CLI Commands Cheat Sheet

To interact with AWS using your terminal, you configure the **AWS CLI** tool.

### Setup and Authentication
```bash
# Configure the CLI (Enter AWS Access Key, Secret Key, Region, and Output format)
aws configure

# Test connection and view current user identity
aws sts get-caller-identity
```

### Simple Storage Service (S3) Management
```bash
# Create an S3 Bucket (bucket names must be globally unique)
aws s3 mb s3://my-unique-bucket-name-2026

# List all S3 buckets
aws s3 ls

# Copy a local file to S3
aws s3 cp document.pdf s3://my-unique-bucket-name-2026/

# Sync a local directory to an S3 bucket (perfect for static site deployments)
aws s3 sync ./dist s3://my-unique-bucket-name-2026/

# Delete a file from S3
aws s3 rm s3://my-unique-bucket-name-2026/document.pdf
```

### Elastic Compute Cloud (EC2) Control
```bash
# List running EC2 instances
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"

# Start an EC2 instance
aws ec2 start-instances --instance-ids i-0123456789abcdef0

# Stop an EC2 instance
aws ec2 stop-instances --instance-ids i-0123456789abcdef0
```

---

## 4. End-to-End Tutorial: Deploying a Containerized Web App to AWS

Follow these steps to deploy a containerized application to the cloud using AWS Elastic Container Registry (ECR) and Elastic Container Service (ECS) with Fargate.

```
  [ Local Machine ]          [ AWS Cloud ]
 ┌─────────────────┐       ┌───────────────────────────────┐
 │ Dockerfile      │       │  ┌─────────────────────────┐  │
 │  └── Build      │       │  │ ECR (Docker Registry)   │  │
 │        └── Push ├───────┼─►│   └── node-app:latest   │  │
 └─────────────────┘       │  └───────────┬─────────────┘  │
                           │              │ (Pulls Image)  │
                           │              ▼                │
                           │  ┌─────────────────────────┐  │
                           │  │ ECS Fargate (Serverless)│  │
                           │  │   └── Running Container │  │
                           │  └─────────────────────────┘  │
                           └───────────────────────────────┘
```

### Step 1: Publish Image to AWS ECR
Before ECS can run your app, your Docker image must reside in AWS ECR.

1. **Create an ECR Repository:**
   ```bash
   aws ecr create-repository --repository-name node-app --region us-east-1
   ```
2. **Authenticate Docker to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```
3. **Tag & Push Image:**
   ```bash
   docker tag node-app:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/node-app:latest
   docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/node-app:latest
   ```

### Step 2: Create ECS Fargate Cluster
1. Search **Elastic Container Service (ECS)** in the AWS Management Console.
2. Click **Create Cluster**, name it `my-production-cluster`, choose **AWS Fargate (serverless)** as your infrastructure, and click create.

### Step 3: Define and Run Task (Your Application)
1. **Create Task Definition:**
   Create a Task Definition specifying **Fargate** compatibility, sizing (e.g., 0.5 vCPU and 1 GB memory), and add your ECR Image URL (`<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/node-app:latest`) under container definitions. Expose port `3000` (or whichever port your app runs on).
2. **Deploy as a Service:**
   In your cluster, create a **Service** pointing to the Task Definition. Set target tasks to `1`.
3. **Configure Network / Load Balancer:**
   Ensure public IP assignment is enabled and that your container's security group allows traffic on port `3000`. You can now access the app via the public IP assigned by ECS!

---

## 5. Security & Cost Best Practices

> [!WARNING]
> **Never upload AWS access keys to public GitHub repositories!** 
> Bots constantly scan public repos and will steal keys within seconds to spawn massive crypto-mining servers, resulting in thousands of dollars in charges. Use a `.gitignore` to block credential files.

### 1. The Rule of Least Privilege
Always use **IAM Roles** to delegate access instead of long-term IAM user access keys. For example, if your web application running on ECS needs to write to an S3 bucket, configure an IAM Role with permissions to S3 and attach it to the ECS Task Definition.

### 2. Multi-Factor Authentication (MFA)
Enable MFA on the AWS Root Account immediately. Root access has full access to billing and destruction of resource stacks.

### 3. Set Up Billing Budgets
Always set up a zero-dollar or low-threshold budget alert under **AWS Budgets** to receive email notifications when charges forecast above your threshold. This catches runaway resources early.
