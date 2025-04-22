# VPC Configuration
vpc_name     = "geth-vpc"
subnet_name  = "geth-subnet"
subnet_cidr  = "10.0.0.0/20"
pod_cidr     = "10.16.0.0/16"
service_cidr = "10.32.0.0/16"

# GKE Configuration
cluster_name                  = "erc-20"
environment                   = "dev"
workload_identity_pool_id     = "erc-20-geth-gm-gh-pool"
workload_identity_provider_id = "erc-20-geth-gh-provider"

# Node Pool
node_count     = 1
max_node_count = 3
machine_type   = "e2-standard-2"
disk_size_gb   = 30

# Artifact Registry
repository_name = "erc20-geth"
# namespace       = "erc-20"

authorized_networks = [
  {
    cidr_block   = "0.0.0.0/0"
    display_name = "All IPs"
  }
]

github_repo         = "https://github.com/CharlesGM/erc-20-geth-gcp"
project_id          = "play-project-325908"
project_owner_email = "gachangocmbugua@gmail.com"
region              = "europe-west1"