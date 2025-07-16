import type { NextConfig } from "next";
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["gateway.irys.xyz", "cdn.jsdelivr.net"],
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pino-pretty": false,
    };
    if (!isServer) {
      config.plugins = (config.plugins || []).concat([
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          process: "process/browser.js",
        }),
      ]);

      const fallback = config.resolve.fallback || {};
      Object.assign(fallback, {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify"),
        url: require.resolve("url"),
        zlib: require.resolve("browserify-zlib"),
        buffer: require.resolve("buffer"),
        path: require.resolve("path-browserify"),
      });

      config.resolve.fallback = fallback;
      config.resolve.extensions = [
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".json",
        ".mjs",
        ".wasm",
        ".css",
      ];
    }

    return config;
  },

  env: {
    JAAS_API_KEY: process.env.JAAS_API_KEY,
  },
};

export default nextConfig;
