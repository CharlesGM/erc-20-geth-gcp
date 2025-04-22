FROM ethereum/client-go:stable

WORKDIR /root

# We'll use a ConfigMap for the entrypoint script, so we don't need to create it here

EXPOSE 8545 8546 30303 30303/udp

# We're using the command in the deployment.yaml to run the script from the ConfigMap
CMD ["geth", "--help"] 