# GKE Cluster Configuration
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region  # Ensure this is region, not zone, for high availability

  # Optionally specify node locations to avoid the problematic zone
  node_locations = ["europe-west1-b", "europe-west1-c"]  # Exclude europe-west1-d

  network    = var.network_name
  subnetwork = var.subnet_name

  remove_default_node_pool = true
  initial_node_count       = 1

  # Uncomment for production to prevent accidental deletion
  # deletion_protection = true
  deletion_protection = false  # For development/testing only

  # Enable network policy for better pod security
  network_policy {
    enabled = true
    provider = "CALICO"
  }

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Pod and service IP ranges
  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-range"
    services_secondary_range_name = "service-range"
  }

  # Enable master authorized networks
  master_authorized_networks_config {
    dynamic "cidr_blocks" {
      for_each = var.authorized_networks
      content {
        cidr_block   = cidr_blocks.value.cidr_block
        display_name = cidr_blocks.value.display_name
      }
    }
  }

  # Enable private cluster
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block = var.master_ipv4_cidr_block

  }  
}

# Node Pool Configuration
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.node_count

  node_config {
    machine_type = var.machine_type
    disk_size_gb = var.disk_size_gb

    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # OAuth scopes
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = var.environment
    }

    tags = ["gke-node", var.environment]
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  autoscaling {
    min_node_count = var.node_count
    max_node_count = var.max_node_count
  }
}

resource "null_resource" "wait_for_gke" {
  depends_on = [google_container_cluster.primary]

  provisioner "local-exec" {
    command = "gcloud container clusters get-credentials ${var.cluster_name} --region ${var.region} --project ${var.project_id}"
  }
}

# Create Workload Identity Pool for GitHub
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = var.workload_identity_pool_id
  display_name             = "GitHub Actions Pool"
  description             = "Identity pool for GitHub Actions"
  project                   = var.project_id
}

# Create Workload Identity Provider with strict attribute mapping
resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = var.workload_identity_provider_id
  display_name                       = "GitHub Actions Provider"

  # Enhanced attribute mapping for better security
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.ref"        = "assertion.ref"
    "attribute.repository_owner" = "assertion.repository_owner"
  }
  attribute_condition = "attribute.repository == 'CharlesGM/erc-20-geth-gcp' && attribute.repository_owner == 'CharlesGM'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
    allowed_audiences = ["https://token.actions.githubusercontent.com"]
  }
}

# Create Kubernetes Service Account with limited scope
resource "kubernetes_service_account" "github_actions" {
  metadata {
    name      = "github-actions"
    namespace = var.namespace
    annotations = {
      "iam.gke.io/gcp-service-account" = google_service_account.github_actions.email
      "description" = "Service account for GitHub Actions CI/CD"
    }
  }
  depends_on = [kubernetes_namespace.geth]
}

# Create GCP Service Account with minimal privileges
# Grant necessary roles to GitHub Actions service account
resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset([
    "roles/container.developer",            # Access to GKE
    "roles/container.admin",                # Admin to GKE
    "roles/iam.serviceAccountTokenCreator", # Token creation
    "roles/artifactregistry.writer",        # Push to Artifact Registry
    "roles/storage.objectViewer",           # Read access to GCS
    "roles/iam.serviceAccountUser",         # Use service account
    "roles/iam.serviceAccountTokenCreator",  # Create tokens
    "roles/iam.workloadIdentityUser"       # For Workload Identity
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Add Workload Identity Federation binding for GitHub Actions
resource "google_service_account_iam_binding" "workload_identity_binding" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/CharlesGM/erc-20-geth-gcp"
  ]
  depends_on = [
    google_service_account.github_actions,
    google_iam_workload_identity_pool.github,
    google_iam_workload_identity_pool_provider.github
  ]
}

# Service account definition
resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions Service Account"
  description  = "Service account for GitHub Actions CI/CD pipeline"
}

# Create geth application namespace
resource "kubernetes_namespace" "geth" {
  metadata {
    name = var.namespace
    labels = {
      environment = var.environment
      managed-by = "terraform"
    }
  }
  depends_on = [null_resource.wait_for_gke]
}

# Limited GKE admin access
resource "google_project_iam_binding" "gke_admin" {
  project = var.project_id
  role    = "roles/container.admin"
  members = [
    # "user:xxxxxxxx@gmail.com"
    "user:gachangocmbugua@gmail.com"
  ]
}