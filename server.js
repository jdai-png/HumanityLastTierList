// Bun.js Tier List Server
// - Reads ./images for .png/.jpg/.jpeg/.gif files using fs/promises
// - Avoids calling Bun.file() on directories
// - Randomly and evenly assigns images to S/A/B/C/D/E/F tiers
// - Injects <img> tags into base.html template and serves it
// - Serves image bytes with correct Content-Type via Bun.file()

import { readdir, stat } from "fs/promises";
import path from "path";

// --- Config ---
const PORT = 3000;
const IMAGE_DIR = path.resolve("./images");
const TEMPLATE_PATH = path.resolve("./base.html");
// const TEMPLATE_PATH = path.resolve("./index.original.html");
const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif"]);
const TIERS = ["S", "A", "B", "C", "D", "E", "F"];

// Simple extension -> mime map (no external deps)
const MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8"
};

// Read all allowed files from ./images and skip directories
async function listImages() {
    let entries = [];
    try {
        entries = await readdir(IMAGE_DIR, { withFileTypes: true });
    } catch (err) {
        // If images/ doesn't exist yet, return empty
        if (err && err.code === "ENOENT") return [];
        throw err;
    }

    const files = [];
    for (const entry of entries) {
        // Guard: avoid trying Bun.file() on directories
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
// A single object to hold all priority keywords, keyed by tier
const TIER_PRIORITIES = {
    S: ['gw', 'levi', 'afterviel', 'gist', 'computergabe','spoz', 'johnTitor'], // hardcode the OGs
    A: ['matt', 'kian' ],
    B:[],
    C: ['ori'],
    D: [],
    E:[],
    F: ['chris', 'eddy']
};

// // Distribute images as evenly as possible across tiers (round-robin)
// function assignToTiers(filenames) {
//     const buckets = Object.fromEntries(TIERS.map((t) => [t, []]));
//     let remaining_filenames = [...filenames];
//     for (const tier in TIER_PRIORITIES) {
//         const priorityKeywords = TIER_PRIORITIES[tier];
//         const assignedFilenames = remaining_filenames.filter((name) => {
//             return priorityKeywords.some((keyword) => name.includes(keyword));
//         });
//         buckets[tier].push(...assignedFilenames);
//         remaining_filenames = remaining_filenames.filter((name) => {
//             return !priorityKeywords.some((keyword) => name.includes(keyword));
//         });
//     }
//     const shuffled = shuffle(remaining_filenames);
//     const nonPriorityTiers = Object.keys(TIER_PRIORITIES).filter(
//         (tier) => TIER_PRIORITIES[tier].length === 0
//     );
//     let i = 0;
//     if (nonPriorityTiers.length > 0) {
//         for (const name of shuffled) {
//             const tier = nonPriorityTiers[i % nonPriorityTiers.length];
//             buckets[tier].push(name);
//             i++;
//         }
//     } else {
//         console.warn("No non-priority tiers available to distribute remaining images.");
//     }
//     return buckets;
// }
/**
 * Generates a random number from a normal distribution.
 * Uses the Box-Muller transform.
 * @param {number} mean - The mean (center) of the distribution.
 * @param {number} stdDev - The standard deviation (spread) of the distribution.
 * @returns {number} A normally distributed random number.
 */
function randomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    //Convert [0,1) to (0,1)
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // z0 is now a standard normal random number (mean 0, stdDev 1).
    // Scale and shift it to match the desired mean and stdDev.
    return z0 * stdDev + mean;
}

// Main function to distribute images
function assignToTiers(filenames) {
    const buckets = Object.fromEntries(TIERS.map((t) => [t, []]));
    let remaining_filenames = [...filenames];

    // --- PRIORITY ASSIGNMENT (Unchanged) ---
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

    // --- NORMAL DISTRIBUTION ASSIGNMENT (Replaces Round-Robin) ---
    const shuffled = shuffle(remaining_filenames);
    const nonPriorityTiers = Object.keys(TIER_PRIORITIES).filter(
        (tier) => TIER_PRIORITIES[tier].length === 0
    );

    if (nonPriorityTiers.length > 0) {
        // Define the parameters for our normal distribution
        const mean = (nonPriorityTiers.length - 1) / 2; // Center on the middle tier
        const stdDev = nonPriorityTiers.length / 4;      // Adjust spread as needed

        for (const name of shuffled) {
            // 1. Generate a normally distributed random value
            const rawIndex = randomNormal(mean, stdDev);

            // 2. Round to the nearest integer to get a tier index
            let targetIndex = Math.round(rawIndex);

            // 3. Clamp the index to ensure it's within the valid range [0, tiers.length - 1]
            targetIndex = Math.max(0, Math.min(targetIndex, nonPriorityTiers.length - 1));

            const tier = nonPriorityTiers[targetIndex];
            buckets[tier].push(name);
        }
    } else {
        console.warn("No non-priority tiers available to distribute remaining images.");
    }
    return buckets;
}
// Create HTML for image tags within a tier
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


// Basic HTML escaper for attributes/text nodes
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Inject <img> tags into the template markers <!--IMAGES_S-->, etc.
async function renderPage() {
    const templateFile = Bun.file(TEMPLATE_PATH);
    const template = await templateFile.text();

    const files = await listImages();
    const buckets = assignToTiers(files);

    let html = template;
    for (const tier of TIERS) {
        // ✅ This line is updated to generate the new placeholder format
        const marker = `{{IMAGES_${tier}}}`;

        const imgs = renderTierImages(buckets[tier]);

        // This will now correctly find and replace the marker
        html = html.replace(marker, imgs);
    }
    return html;
}

// Ensure requested image path resolves under IMAGE_DIR (prevents traversal)
function safeImagePath(filename) {
    const resolved = path.resolve(IMAGE_DIR, filename);
    if (!resolved.startsWith(IMAGE_DIR + path.sep)) {
        return null; // attempted traversal
    }
    return resolved;
}

// Serve image bytes with content-type and guard against directories
async function serveImage(urlPath) {
    const filename = decodeURIComponent(urlPath.replace(/^\/images\//, ""));
    const safePath = safeImagePath(filename);
    if (!safePath) {
        return new Response("Not Found", { status: 404 });
    }

    // Check it's a file (avoid the Bun.file() on directory pitfall)
    let st;
    try {
        st = await stat(safePath);
    } catch {
        return new Response("Not Found", { status: 404 });
    }
    if (!st.isFile()) {
        // Common mistake is calling Bun.file() on a dir; we explicitly block it
        return new Response("Not Found", { status: 404 });
    }

    const ext = path.extname(safePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const file = Bun.file(safePath);
    return new Response(file, { headers: { "Content-Type": type } });
}

// Root handler: render fresh random tiering on every request
async function serveIndex() {
    try {
        const html = await renderPage();
        return new Response(html, { headers: { "Content-Type": MIME[".html"] } });
    } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// Start server
const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") {
            return serveIndex();
        }
        if (url.pathname.startsWith("/images/")) {
            return serveImage(url.pathname);
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Tier list server running on http://localhost:${PORT}`);
