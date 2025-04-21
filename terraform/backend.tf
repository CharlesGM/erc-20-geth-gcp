terraform {
  backend "gcs" {
    bucket = "erc20tfstate"
    prefix = "terraformstate"
  }
}