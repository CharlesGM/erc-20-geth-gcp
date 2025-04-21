# GCP Infrastructure

This Terraform configuration provisions a complete Google Cloud Platform (GCP) infrastructure for running this project's Nethermind services on Google Kubernetes Engine (GKE).

## Infrastructure Components

The Terraform configuration creates the following resources:

### VPC Network
- Custom VPC with dedicated subnet
- IP ranges for pods and services
- Firewall rules for GKE master access

### Google Kubernetes Engine (GKE) Cluster
- Regional GKE cluster with private nodes
- Configurable node pool with autoscaling
- Workload identity for secure authentication
- Network policy enabled (Calico)
- Private cluster configuration

### CI/CD Integration
- GitHub Actions integration via Workload Identity Federation
- Service accounts with appropriate IAM permissions
- RBAC roles for Kubernetes access
- Secure authentication between GitHub and GCP

### Container Registry
- Artifact Registry repository for Docker images
- Configured for secure image storage and retrieval

## Usage

### Prerequisites
- Google Cloud Platform account
- GCP project with billing enabled
- Terraform v1.5.0 or later
- `gcloud` CLI tool installed and configured

### Configuration

1. Update the `terraform.tfvars` file with your specific values
2. Configure GCP credentials using:
   ```
   gcloud auth application-default login
   ```

### Deployment

Initialize the Terraform configuration:
```
terraform init
```

Review the planned changes:
```
terraform plan
```

Apply the configuration:
```
terraform apply
```

### Connecting to the Cluster

After deployment, connect to the GKE cluster:
```
gcloud container clusters get-credentials <your-cluster-name> --region [REGION] --project [PROJECT_ID]
```

## Configuration Variables

Key variables include:

- `project_id`: Your GCP project ID
- `region`: GCP region for deployment
- `cluster_name`: Name of the GKE cluster
- `environment`: Environment type (prod, staging, dev)
- `github_repo`: GitHub repository in format owner/repository
- `repository_name`: Name for the Artifact Registry repository

See `variables.tf` for all available configuration options.

## Security Features

- Private GKE cluster with controlled access
- Workload Identity Federation for secure GitHub integration
- Detailed IAM permissions following principle of least privilege
- Network policies enabled for pod-to-pod traffic control

## Outputs

After successful deployment, Terraform will output:
- GKE cluster endpoint and credentials
- Artifact Registry repository URL
- Workload Identity Provider information
- Service account details for CI/CD integration 