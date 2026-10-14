import { fileURLToPath } from "node:url";
import path from "node:path";

/** @type {import('next').NextConfig} */
export default {
  turbopack: { root: path.resolve(fileURLToPath(new URL("../../", import.meta.url))) },
  poweredByHeader: false,
  devIndicators: false,
};
