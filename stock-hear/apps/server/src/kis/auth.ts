import { config, hasKisCredentials } from "../config.js";

export interface KisCredentialStatus {
  hasAppKey: boolean;
  hasAppSecret: boolean;
  environment: "real" | "virtual";
}

export const getKisCredentialStatus = (): KisCredentialStatus => ({
  hasAppKey: Boolean(config.KIS_APP_KEY),
  hasAppSecret: Boolean(config.KIS_APP_SECRET),
  environment: config.KIS_ENVIRONMENT
});

export const requestKisAccessToken = async (): Promise<string> => {
  if (!hasKisCredentials()) {
    throw new Error("KIS credentials are not configured.");
  }

  throw new Error("KIS access token request is not implemented yet.");
};

export const requestKisApprovalKey = async (): Promise<string> => {
  if (!hasKisCredentials()) {
    throw new Error("KIS credentials are not configured.");
  }

  throw new Error("KIS approval key request is not implemented yet.");
};

