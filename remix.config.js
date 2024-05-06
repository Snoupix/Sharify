const {
  createRoutesFromFolders,
} = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    ignoredRouteFiles: ["**/.*"],
    future: {
        v2_dev: true,
        v2_routeConvention: true,
        v2_meta: true,
        v2_errorBoundary: true,
        v2_normalizeFormMethod: true,
        v2_headers: true,
    },
    routes(defineRoutes) {
        return createRoutesFromFolders(defineRoutes)
    },
    // appDirectory: "app",
    // assetsBuildDirectory: "public/build",
    // serverBuildPath: "build/index.js",
    // publicPath: "/build/",
};
