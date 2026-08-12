import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // A stray package-lock.json in the parent tree makes Next infer the wrong
  // workspace root; pin it to this project so env loading and tracing are correct.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url))
  }
};

export default withNextIntl(nextConfig);
