Absolutely. Since you **don't want to use `sudo` for now**, here is the complete setup assuming:

* GitHub branch: `main`
* Your project already exists on the VM
* You can run `git pull` on the VM
* You can run `systemctl restart YOUR_SERVICE` without sudo
* GitHub Actions will SSH into the VM

The final flow will be:

```text
git push
   ↓
GitHub Actions
   ↓
SSH to VM
   ↓
cd /path/to/project
   ↓
git pull origin main
   ↓
systemctl restart YOUR_SERVICE
```

## Step 1 — Find your VM username and project path

SSH into your VM.

Run:

```bash
whoami
```

Example:

```text
myuser
```

Find your project:

```bash
cd /path/to/your/project
pwd
```

Example:

```text
/home/myuser/myapp
```

Test Git:

```bash
git status
```

Then:

```bash
git pull origin main
```

Make sure this works.

---

## Step 2 — Find your service name

Run:

```bash
systemctl list-units --type=service
```

Find your application service.

For example:

```text
myapp.service
```

Test:

```bash
systemctl restart myapp
```

Then check:

```bash
systemctl status myapp
```

If it works **without sudo**, excellent. We don't need `visudo`.

---

# Step 3 — Create an SSH key for GitHub Actions

Do this on **your own computer**, not the VM.

Run:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

When asked where to save it, enter:

```text
github_actions
```

You will have:

```text
github_actions
github_actions.pub
```

Remember:

```text
github_actions      = PRIVATE KEY 🔴
github_actions.pub  = PUBLIC KEY 🟢
```

**Never commit or publicly share `github_actions`.**

---

# Step 4 — Add the public key to your VM

On your computer:

```bash
cat github_actions.pub
```

You'll get something like:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxx github-actions-deploy
```

Copy the **whole line**.

SSH into your VM:

```bash
ssh myuser@YOUR_VM_IP
```

Then:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

Open:

```bash
nano ~/.ssh/authorized_keys
```

Paste the public key:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxx github-actions-deploy
```

Save and exit.

Then:

```bash
chmod 600 ~/.ssh/authorized_keys
```

---

# Step 5 — Test SSH using the new key

From your **own computer**:

```bash
ssh -i github_actions myuser@YOUR_VM_IP
```

If you successfully enter the VM, the SSH key works. ✅

You can now exit:

```bash
exit
```

---

# Step 6 — Add secrets to GitHub

Go to your GitHub repository.

**Settings → Secrets and variables → Actions → New repository secret**

Create these three secrets:

### `VM_HOST`

Your VM IP:

```text
123.123.123.123
```

### `VM_USER`

Your VM username:

```text
myuser
```

### `VM_SSH_KEY`

On your computer:

```bash
cat github_actions
```

Copy the **entire private key**:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
...
-----END OPENSSH PRIVATE KEY-----
```

Paste that into `VM_SSH_KEY`.

So GitHub will have:

```text
VM_HOST
VM_USER
VM_SSH_KEY
```

---

# Step 7 — Create the deployment script on VM

SSH into your VM.

Create:

```bash
nano ~/deploy.sh
```

Put this inside:

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

cd /home/myuser/myapp

echo "Pulling latest code..."
git pull origin main

echo "Restarting service..."
systemctl restart myapp

echo "Deployment completed successfully!"
```

**Change these two things:**

```text
/home/myuser/myapp
```

to your actual project path.

And:

```text
myapp
```

to your actual service name.

Save it.

Then:

```bash
chmod +x ~/deploy.sh
```

---

# Step 8 — Test deployment manually

Before involving GitHub, test the complete script.

On VM:

```bash
~/deploy.sh
```

You should see:

```text
Starting deployment...
Pulling latest code...
Already up to date.
Restarting service...
Deployment completed successfully!
```

Then:

```bash
systemctl status myapp
```

Make sure your application is running.

**Don't continue until this works.**

---

# Step 9 — Create GitHub Actions workflow

Inside your GitHub repository, create:

```text
.github/workflows/deploy.yml
```

Put:

```yaml
name: Deploy to VM

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VM
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            ~/deploy.sh
```

Commit this file.

---

# Step 10 — Push a change

Now make a small change to your project:

```bash
git add .
git commit -m "test automatic deployment"
git push origin main
```

Go to GitHub:

**Repository → Actions**

You should see:

```text
Deploy to VM
```

Click it.

You should see:

```text
✓ Deploy to VM
```

---

# Step 11 — What happens automatically

From now on, whenever you do:

```bash
git push origin main
```

GitHub automatically executes:

```text
GitHub
   │
   │ push detected
   ↓
GitHub Actions
   │
   │ SSH
   ↓
VM
   │
   ├── cd /home/myuser/myapp
   │
   ├── git pull origin main
   │
   └── systemctl restart myapp
```

So you don't need to manually SSH into the VM anymore. 🚀

---

## One important thing about private repositories

Your VM itself must be able to run:

```bash
git pull origin main
```

If your repository is private and `git pull` currently asks for GitHub authentication, you'll need to configure a **GitHub Deploy Key** on the VM.

The SSH key we created above is **only for GitHub Actions → VM**.

There can be a second key for:

```text
VM → GitHub
```

Don't mix those two keys.

---

## Your final setup

```text
                    GitHub
                       │
                       │ git push
                       ▼
              ┌─────────────────┐
              │ GitHub Actions  │
              └────────┬────────┘
                       │
                       │ SSH
                       ▼
              ┌─────────────────┐
              │       VM        │
              │                 │
              │ ~/deploy.sh     │
              │       │         │
              │       ▼         │
              │   git pull      │
              │       │         │
              │       ▼         │
              │ systemctl       │
              │ restart myapp   │
              └─────────────────┘
```

### You do NOT need right now

❌ `sudo visudo`
❌ `sudo nano`
❌ Passwordless sudo
❌ A GitHub webhook server
❌ Jenkins

You only need:

✅ SSH access to VM
✅ `authorized_keys`
✅ GitHub Actions secrets
✅ `deploy.sh`
✅ GitHub Actions workflow
✅ Permission to run `systemctl restart` as your current VM user

**One thing I strongly recommend:** before setting this up, run these three commands on your VM and confirm they work:

```bash
cd /YOUR/PROJECT/PATH
git pull origin main
systemctl restart YOUR_SERVICE
```

If all three work without `sudo`, this setup is straightforward.        
