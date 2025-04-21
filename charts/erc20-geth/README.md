# ERC-20 Geth Helm Chart

A Helm chart for deploying an Ethereum Geth node on Kubernetes to support ERC-20 token operations.

## Introduction

This chart deploys a full Ethereum Go client (Geth) that can be used for ERC-20 token operations. It can be configured to connect to various Ethereum networks, including Sepolia testnet or run in development mode.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (if persistence is enabled)

## Installing the Chart

To install the chart with the release name `my-geth`:

```bash
helm install my-geth ./charts/erc20-geth
```

The command deploys a Geth node on the Kubernetes cluster with default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `my-geth` deployment:

```bash
helm uninstall my-geth
```

## Parameters

### Global parameters

| Name                | Description                            | Value     |
|---------------------|----------------------------------------|-----------|
| `nameOverride`      | Override the name of the chart         | `""`      |
| `fullnameOverride`  | Override the full name of the chart    | `""`      |

### Geth Configuration Parameters

| Name                       | Description                                | Value                         |
|----------------------------|--------------------------------------------|-------------------------------|
| `geth.image.repository`    | Geth image repository                      | `gcr.io/your-gcp-project-id/geth` |
| `geth.image.tag`           | Geth image tag                             | `latest`                      |
| `geth.image.pullPolicy`    | Geth image pull policy                     | `Always`                      |
| `geth.network`             | Ethereum network to connect to             | `sepolia`                     |
| `geth.resources.requests.memory` | Memory request for the Geth container | `2Gi`                        |
| `geth.resources.requests.cpu`    | CPU request for the Geth container    | `1`                          |
| `geth.resources.limits.memory`   | Memory limit for the Geth container   | `4Gi`                        |
| `geth.resources.limits.cpu`      | CPU limit for the Geth container      | `2`                          |
| `geth.service.type`        | Kubernetes service type                    | `ClusterIP`                  |
| `geth.service.httpPort`    | HTTP-RPC port                              | `8545`                       |
| `geth.service.wsPort`      | WebSocket-RPC port                         | `8546`                       |

### Persistence Parameters

| Name                       | Description                                | Value         |
|----------------------------|--------------------------------------------|---------------|
| `persistence.enabled`      | Enable persistence using PVC               | `true`        |
| `persistence.storageClass` | PVC Storage Class                          | `standard`    |
| `persistence.size`         | PVC Storage Request size                   | `50Gi`        |

### Security Context Parameters

| Name                       | Description                                | Value         |
|----------------------------|--------------------------------------------|---------------|
| `securityContext.runAsUser`| User ID for the container                  | `1000`        |
| `securityContext.runAsGroup`| Group ID for the container                | `1000`        |
| `securityContext.fsGroup`  | Group ID for volume permission             | `1000`        |

## Usage

### Connecting to the Geth Node

Once the Geth node is deployed, you can connect to it from within the cluster at:

```
http://<release-name>-geth:8545
```

For external access, you can use port-forwarding:

```bash
kubectl port-forward service/<release-name>-geth 8545:8545
kubectl port-forward service/<release-name>-geth 8546:8546
```

Then connect to `http://localhost:8545` for HTTP-RPC or `ws://localhost:8546` for WebSocket-RPC.

### MetaMask Integration

To connect MetaMask:

1. Open MetaMask
2. Add a new network with:
   - Network Name: Geth (dev or sepolia)
   - RPC URL: http://localhost:8545
   - Chain ID: 1337 (for dev) or 11155111 (for Sepolia)
   - Currency Symbol: ETH 