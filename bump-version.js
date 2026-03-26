import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "package.json");
const gradlePath = path.join(__dirname, "android/app/build.gradle");
const settingsPagePath = path.join(__dirname, "src/pages/Settings.jsx");

try {
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const newVersionName = packageData.version;

  let gradleContent = fs.readFileSync(gradlePath, "utf8");
  let settingsPageContent = fs.readFileSync(settingsPagePath, "utf8");

  settingsPageContent = settingsPageContent.replace(
    /VERSION\s*=\s*.*/,
    `VERSION = "${newVersionName}";`,
  );

  gradleContent = gradleContent.replace(
    /versionCode\s+(\d+)/,
    (_, currentCode) => {
      const newCode = parseInt(currentCode, 10) + 1;
      console.log(`[🚀] versionCode: ${currentCode} -> ${newCode}`);
      return `versionCode ${newCode}`;
    },
  );

  gradleContent = gradleContent.replace(
    /versionName\s+".+"/,
    `versionName "${newVersionName}"`,
  );
  console.log(`[✨] versionName: "${newVersionName}"`);

  fs.writeFileSync(settingsPagePath, settingsPageContent, "utf8");
  fs.writeFileSync(gradlePath, gradleContent, "utf8");
  console.log("[✅] Bump Success!");
} catch (error) {
  console.error("[❌] Bump Failure:", error);
}
