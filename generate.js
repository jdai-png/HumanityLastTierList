// Static Site Generator for Tier List
// - Reads ./images for .png/.jpg/.jpeg/.gif files using fs/promises
// - Randomly and evenly assigns images to S/A/B/C/D/E/F tiers
// - Injects <img> tags into a template and saves the result to a new file.

import { readdir, stat, writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { ALLOWED_EXTS, shuffle, assignToTiers, IMAGE_DIR, OUTPUT_DIR, OUTPUT_PATH, TEMPLATE_PATH, TIER_PRIORITIES, TIERS } from "./shared";




// Read all allowed files from ./images and skip directories
async function listImages() {
    let entries = [];
    try {
        entries = await readdir(IMAGE_DIR, { withFileTypes: true });
    } catch (err) {
        if (err && err.code === "ENOENT") return [];
        throw err;
    }
    const files = [];
    for (const entry of entries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!ALLOWED_EXTS.has(ext)) continue;
        files.push(entry.name);
    }
    return files;
}




function renderTierImages(names) {
    return names
        .map(
            (fname) =>
                `<img class="tier-img" src="./images/${encodeURIComponent(
                    fname
                )}" alt="${escapeHtml(fname)}">`
        )
        .join("\n");
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function renderAndSavePage() {
    const template = await readFile(TEMPLATE_PATH, "utf-8");
    const files = await listImages();

    if (files.length === 0) {
        console.warn("No images found in the 'images' directory.");
    }

    const buckets = assignToTiers(files);
    let html = template;

    for (const tier of TIERS) {
        // ✅ This line is updated to generate the new placeholder format
        const marker = `{{IMAGES_${tier}}}`;

        const imgs = renderTierImages(buckets[tier]);

        // This will now correctly find and replace the marker
        html = html.replace(marker, imgs);
    }

    try {
        await mkdir(OUTPUT_DIR, { recursive: true });
        await writeFile(OUTPUT_PATH, html);
        console.log(`✅ Successfully generated site at ${OUTPUT_PATH}`);
    } catch (err) {
        console.error("❌ Failed to write output file:", err);
    }
}
// Execute the main function
renderAndSavePage();