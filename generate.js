// Static Site Generator for Tier List
// - Reads ./images for .png/.jpg/.jpeg/.gif files using fs/promises
// - Randomly and evenly assigns images to S/A/B/C/D/E/F tiers
// - Injects <img> tags into a template and saves the result to a new file.

import { readdir, stat, writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

// --- Config ---
const IMAGE_DIR = path.resolve("./images");
const TEMPLATE_PATH = path.resolve("./base.html");
const OUTPUT_DIR = path.resolve("./");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "index.html");
const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif"]);
const TIERS = ["S", "A", "B", "C", "D", "E", "F"];

// Simple extension -> mime map (no external deps)
const MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
};

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

// Fisher–Yates shuffle
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const TIER_PRIORITIES = {
    S: ["gw", "matt", "afterviel", "kian", "computergabe", "johnTitor"],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: ["chris", "eddy"],
};

function assignToTiers(filenames) {
    const buckets = Object.fromEntries(TIERS.map((t) => [t, []]));
    let remaining_filenames = [...filenames];
    for (const tier in TIER_PRIORITIES) {
        const priorityKeywords = TIER_PRIORITIES[tier];
        const assignedFilenames = remaining_filenames.filter((name) => {
            return priorityKeywords.some((keyword) => name.includes(keyword));
        });
        buckets[tier].push(...assignedFilenames);
        remaining_filenames = remaining_filenames.filter((name) => {
            return !priorityKeywords.some((keyword) => name.includes(keyword));
        });
    }
    const shuffled = shuffle(remaining_filenames);
    const nonPriorityTiers = Object.keys(TIER_PRIORITIES).filter(
        (tier) => TIER_PRIORITIES[tier].length === 0
    );
    let i = 0;
    if (nonPriorityTiers.length > 0) {
        for (const name of shuffled) {
            const tier = nonPriorityTiers[i % nonPriorityTiers.length];
            buckets[tier].push(name);
            i++;
        }
    } else {
        console.warn("No non-priority tiers available to distribute remaining images.");
    }
    return buckets;
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
    console.log("🚀 Starting static site generation...");

    const template = await readFile(TEMPLATE_PATH, "utf-8");
    const files = await listImages();

    if (files.length === 0) {
        console.warn("⚠️ No images found in the 'images' directory.");
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