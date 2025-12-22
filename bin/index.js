#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const projectName = process.argv[2];

if (!projectName) {
  console.error("Please provide a project name");
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);

if (!fs.existsSync(projectPath)) {
  fs.mkdirSync(projectPath);
}

// Get latest versions from npm
function getLatestVersion(pkg) {
  try {
    return execSync(`npm view ${pkg} version`).toString().trim();
  } catch {
    return "*";
  }
}

const typescriptVersion = getLatestVersion("typescript");
const tsNodeVersion = getLatestVersion("ts-node");

// Create package.json with axios dependency and scripts
fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify(
    {
      name: projectName,
      version: "1.0.0",
      main: "dist/index.js",
      type: "module",
      bin: {
        [projectName]: "dist/index.js"
      },
      scripts: {
        build: "tsc",
        start: "node --no-warnings --loader ts-node/esm src/index.ts",
      },
      dependencies: {
        axios: "^1.6.8",
      },
      devDependencies: {
        typescript: typescriptVersion,
        "ts-node": tsNodeVersion
      },
    },
    null,
    2
  )
);

// Create tsconfig.json for TypeScript compilation
fs.writeFileSync(
  path.join(projectPath, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        module: "ES2020",
        moduleResolution: "node",
        outDir: "dist",
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        skipLibCheck: true,
      },
      include: ["src"],
    },
    null,
    2
  )
);

// Create src directory and index.ts with the weather function
const srcDir = path.join(projectPath, "src");
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

fs.writeFileSync(
  path.join(srcDir, "index.ts"),
  `import axios from "axios";

export async function getLatestObservationFahrenheit() {
  const url = "https://api.weather.gov/stations/KOLM/observations/latest";
  const response = await axios.get(url);
  const c = response.data.properties.temperature.value;
  if (typeof c !== "number") {
    console.log("Temperature data unavailable.");
    return;
  }
  const f = (c * 9 / 5) + 32;
  console.log(\`Temperature: \${f.toFixed(1)}°F\`);
}

// Example usage:
getLatestObservationFahrenheit();
`
);

console.log(`Project created at ${projectName}`);
console.log(`Run:`);
console.log(`  cd ${projectName}`);
console.log(`  npm install`);
console.log(`  npm run build`);
console.log(`  npm start`);
