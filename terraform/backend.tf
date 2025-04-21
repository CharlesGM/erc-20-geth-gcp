terraform {
  backend "gcs" {
    bucket = "nevermindtfstate"
    prefix = "terraformstate"
  }
}