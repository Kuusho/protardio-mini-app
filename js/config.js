// Global variables (extracted from original)
let lastViewTime = null;
let currentImageIndex = null;
const COOLDOWN_HOURS = 1;
const TOTAL_IMAGES = 2000;
let sdk;

// Add debug logging function (GLOBAL SCOPE)
function debugLog(message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] 🔧 PROTARDIO DEBUG: ${message}`);
    if (data) console.log(`[${timestamp}] 📊 Data:`, data);
}

// Generate protardio image path - simplified for sequential numbering
function generateProtardioPath(index) {
    return `./protardios/protardios/${index}.png`;
}