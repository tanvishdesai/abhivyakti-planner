import type { AuthConfig } from "convex/server";

const authConfig: AuthConfig = {
  providers: [
    {
      domain: "https://trusty-adder-37.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;

