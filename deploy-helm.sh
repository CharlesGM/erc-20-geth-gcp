#!/bin/bash
set -e

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo "Helm is not installed. Please install Helm first."
    exit 1
fi

# Check if kubectl context is set
if ! kubectl config current-context &> /dev/null; then
    echo "No Kubernetes context is set. Please configure kubectl first."
    exit 1
fi

# Parse command line arguments
RELEASE_NAME="erc20-geth"
NAMESPACE="default"
VALUES_FILE=""

print_usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -r, --release-name  Release name for the Helm deployment (default: erc20-geth)"
    echo "  -n, --namespace     Kubernetes namespace to deploy to (default: default)"
    echo "  -f, --values        Custom values file to use"
    echo "  -h, --help          Show this help message"
}

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -r|--release-name)
            RELEASE_NAME="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -f|--values)
            VALUES_FILE="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Confirm deployment
echo "Deploying Helm chart with the following settings:"
echo "  Release name: $RELEASE_NAME"
echo "  Namespace: $NAMESPACE"
if [[ -n "$VALUES_FILE" ]]; then
    echo "  Custom values: $VALUES_FILE"
fi

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
fi

# Deploy Helm chart
echo "Deploying Helm chart..."
if [[ -n "$VALUES_FILE" ]]; then
    helm upgrade --install "$RELEASE_NAME" ./charts/erc20-geth \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE"
else
    helm upgrade --install "$RELEASE_NAME" ./charts/erc20-geth \
        --namespace "$NAMESPACE"
fi

# Check deployment status
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/"$RELEASE_NAME"-erc20-geth --namespace "$NAMESPACE"

echo "Deployment completed successfully!"
echo "To access your Geth node, run:"
echo "  kubectl port-forward service/$RELEASE_NAME-erc20-geth 8545:8545 --namespace $NAMESPACE"
echo "  kubectl port-forward service/$RELEASE_NAME-erc20-geth 8546:8546 --namespace $NAMESPACE" 