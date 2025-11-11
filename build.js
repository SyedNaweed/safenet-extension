// build.js
import fs from "fs-extra";

// Paths
const popupDist = "./popup/dist";
const optionsDist = "./options/dist";
const finalDist = "./dist";

// Clean old dist
await fs.remove(finalDist);
await fs.ensureDir(finalDist);

// Copy popup
await fs.copy(popupDist, `${finalDist}/popup`);

// Copy options
await fs.copy(optionsDist, `${finalDist}/options`);

// Copy main extension files
const mainFiles = ["manifest.json", "background.js", "content.js"];
for (const file of mainFiles) {
  await fs.copy(file, `${finalDist}/${file}`);
}

// Copy icons
await fs.copy("icons", `${finalDist}/icons`);

console.log("✅ Extension build complete!");
