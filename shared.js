import path from "path";

// Simple extension -> mime map (no external deps)
export const MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
};

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


// --- Config ---

export const PORT = 3000
export const IMAGE_DIR = path.resolve("./images");
export const TEMPLATE_PATH = path.resolve("./base.html");
export const OUTPUT_DIR = path.resolve("./");
export const OUTPUT_PATH = path.join(OUTPUT_DIR, "index.html");
export const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif"]);
export const TIERS = ["S", "A", "B", "C", "D", "E", "F"];



// A single object to hold all priority keywords, keyed by tier
export const TIER_PRIORITIES = {
    S: ['gw'], // hardcode the OGs
    A: [],
    B: [],
    C: [],
    D: [],
    E: ['ori'],
    F: ['chris', 'eddy']
};


// Fisher–Yates shuffle
export function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export // Main function to distribute images
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

