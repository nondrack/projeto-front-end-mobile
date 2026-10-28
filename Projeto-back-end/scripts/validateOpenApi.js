const fs = require("fs");
const path = require("path");
const SwaggerParser = require("@apidevtools/swagger-parser");

const specPath = path.resolve(__dirname, "../openapi.yaml");
const routesPath = path.resolve(__dirname, "../src/app.ts");
const methods = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

function toExpressPath(openApiPath) {
  return openApiPath.replace(/\{([^}]+)\}/g, ":$1");
}

async function validateOpenApi() {
  const api = await SwaggerParser.validate(specPath);
  const routeSource = fs.readFileSync(routesPath, "utf8");
  const missingRoutes = [];

  for (const [openApiPath, pathItem] of Object.entries(api.paths || {})) {
    const expressPath = toExpressPath(openApiPath);
    for (const method of Object.keys(pathItem)) {
      if (!methods.has(method.toLowerCase())) continue;
      const routePattern = new RegExp(
        `router\\.${method.toLowerCase()}\\(['"]${expressPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
      );
      if (!routePattern.test(routeSource)) {
        missingRoutes.push(`${method.toUpperCase()} ${openApiPath}`);
      }
    }
  }

  if (missingRoutes.length > 0) {
    throw new Error(`OpenAPI operations not found in src/app.ts:\n${missingRoutes.join("\n")}`);
  }

  console.log(`OpenAPI valid: ${Object.keys(api.paths || {}).length} documented paths match src/app.ts.`);
}

validateOpenApi().catch((error) => {
  console.error("OpenAPI validation failed:", error.message);
  process.exitCode = 1;
});
