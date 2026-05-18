const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

const pnpmStore = path.resolve(workspaceRoot, "node_modules/.pnpm");

config.resolver.extraNodeModules = {
  "@supabase/auth-js": path.resolve(pnpmStore, "@supabase+auth-js@2.105.4/node_modules/@supabase/auth-js"),
  "@supabase/realtime-js": path.resolve(pnpmStore, "@supabase+realtime-js@2.105.4/node_modules/@supabase/realtime-js"),
  "@supabase/postgrest-js": path.resolve(pnpmStore, "@supabase+postgrest-js@2.105.4/node_modules/@supabase/postgrest-js"),
  "@supabase/storage-js": path.resolve(pnpmStore, "@supabase+storage-js@2.105.4/node_modules/@supabase/storage-js"),
  "@supabase/functions-js": path.resolve(pnpmStore, "@supabase+functions-js@2.105.4/node_modules/@supabase/functions-js"),
};

module.exports = config;
