// Bun.js Tier List Server
// - Reads ./images for .png/.jpg/.jpeg/.gif files using fs/promises
// - Avoids calling Bun.file() on directories
// - Randomly and evenly assigns images to S/A/B/C/D/E/F tiers
// - Injects <img> tags into base.html template and serves it
// - Serves image bytes with correct Content-Type via Bun.file()

import { readdir, stat } from "fs/promises";
import path from "path";
import { ALLOWED_EXTS,PORT,MIME, shuffle, assignToTiers, IMAGE_DIR, OUTPUT_DIR, OUTPUT_PATH, TEMPLATE_PATH, TIER_PRIORITIES, TIERS } from "./shared";

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
