# GitHub Actions CI/CD Setup

This directory contains GitHub Actions workflows for automated CI/CD.

## Workflows

### 1. **ci.yml** - Main CI/CD Pipeline
Runs on: Push to `main`, `develop`, `feat/*` branches and PRs

**Jobs:**
- ✅ **Lint & Format**: Code quality checks
- ✅ **Test**: Run unit tests with coverage
- ✅ **Build**: Build Next.js application
- ✅ **Docker**: Build and push Docker image (main/develop only)
- ✅ **Deploy**: Deploy to production (main only)
- ✅ **Notify**: Send notifications on failure

### 2. **pr-check.yml** - Pull Request Checks
Runs on: Pull requests to `main` or `develop`

**Features:**
- Quick quality checks
- Auto-comment on PR with results
- Prevents merge if checks fail

### 3. **dependency-review.yml** - Security Check
Runs on: Pull requests

**Features:**
- Review dependency changes
- Check for vulnerabilities
- Block problematic licenses

## Required Secrets

Add these secrets in GitHub Settings > Secrets and variables > Actions:

### Optional (for Docker):
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

### Optional (for Codecov):
- `CODECOV_TOKEN` - Codecov token for coverage reports

### Optional (for Deployment):
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Environment Variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (optional, defaults to localhost:7002)

## Status Badge

Add to README.md:

```markdown
[![CI/CD](https://github.com/YOUR_USERNAME/dropbox-fe/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/dropbox-fe/actions/workflows/ci.yml)
```

## Local Testing

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow
act push

# Run PR check
act pull_request
```

## Workflow Triggers

- **Push to main/develop**: Full CI/CD with deployment
- **Push to feat/***: Build and test only
- **Pull Request**: PR checks and dependency review
- **Manual**: Can be triggered from Actions tab

## Performance

- Uses yarn cache for faster installs
- Parallel job execution
- Artifact caching between jobs
- Docker layer caching with GitHub cache

## Customization

Edit workflows to match your needs:
1. Add more test jobs (E2E, integration, etc.)
2. Configure deployment target
3. Add notification services (Slack, Discord, Email)
4. Adjust branch protection rules
