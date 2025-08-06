// js/sdk.js - FIXED: Use modern @farcaster/miniapp-sdk

/**
 * Farcaster MiniApp SDK Loading System
 * 
 * CRITICAL FIXES:
 * 1. Use @farcaster/miniapp-sdk instead of deprecated frame-sdk
 * 2. Proper global window.sdk reference
 * 3. Correct SDK property detection
 */

// Mock Farcaster SDK for local testing
const mockSdk = {
    context: {
        user: { fid: 12345, username: "protardio_fan" },
        client: { clientFid: 9152, added: false }
    },
    actions: {
        ready: async (options = {}) => {
            debugLog("✅ Mock SDK: ready() called", options);
            return Promise.resolve();
        },
        composeCast: async (options) => {
            debugLog("Mock SDK: composeCast called", options);
            debugLog("✅ Mock cast composed successfully", {
                text: options.text,
                embeds: options.embeds
            });
            return Promise.resolve({ hash: "0x123456789" });
        }
    }
};

// Initialize global SDK variable
window.sdk = null;

/**
 * Enhanced SDK loading with modern MiniApp SDK
 */
async function loadSDK() {
    console.log('🔄 Starting MiniApp SDK initialization...');
    
    // Enhanced mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && window.innerHeight <= 1024);
    
    console.log('📱 Environment detection:', {
        isMobile: isMobile,
        userAgent: navigator.userAgent.substring(0, 100),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isFrame: typeof window !== 'undefined' && window.parent !== window
    });
    
    // Frame environment detection
    if (typeof window !== 'undefined' && window.parent !== window) {
        try {
            console.log('📡 Farcaster environment detected, loading MiniApp SDK...');
            
            if (isMobile) {
                console.log('📱 Mobile detected, using simplified loading...');
                await loadMiniAppSDKMobile();
            } else {
                console.log('🖥️ Desktop detected, using standard loading...');
                await loadMiniAppSDKDesktop();
            }
            
        } catch (error) {
            console.error('⚠️ Failed to load MiniApp SDK:', error);
            console.log('🔄 Falling back to mock SDK...');
            window.sdk = mockSdk;
            await initApp();
        }
    } else {
        console.log('🏠 Local environment detected, using mock SDK');
        window.sdk = mockSdk;
        await initApp();
    }
}

/**
 * Mobile MiniApp SDK loading - FIXED: Use correct SDK and detection
 */
async function loadMiniAppSDKMobile() {
    console.log('📱 Loading MiniApp SDK for mobile...');
    
    try {
        // Method 1: Try ESM import first (more reliable for MiniApp SDK)
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            try {
                console.log('📱 Attempting MiniApp SDK ESM import...');
                const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
                window.miniappSDK = sdk;
                window.miniappSDKLoaded = true;
                console.log('✅ MiniApp SDK imported via ESM');
                console.log('🔍 SDK object:', window.miniappSDK);
            } catch (error) {
                console.error('❌ MiniApp SDK ESM import failed:', error);
                window.miniappSDKLoaded = false;
            }
        `;
        document.head.appendChild(script);
        
        // Wait for SDK to load
        let attempts = 0;
        const maxAttempts = 30; // Give it more time
        
        while (attempts < maxAttempts) {
            if (window.miniappSDK && window.miniappSDKLoaded) {
                window.sdk = window.miniappSDK; // Store in global
                console.log('✅ MiniApp SDK loaded and stored in window.sdk');
                console.log('🔍 SDK verification:', {
                    sdkExists: !!window.sdk,
                    hasActions: !!(window.sdk?.actions),
                    hasReady: !!(window.sdk?.actions?.ready),
                    readyType: typeof window.sdk?.actions?.ready
                });
                await initApp();
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        // If ESM failed, try CDN fallback
        console.log('⚠️ ESM import timed out, trying CDN fallback...');
        await loadMiniAppSDKMobileFallback();
        
    } catch (error) {
        console.error('❌ Mobile MiniApp SDK loading failed:', error);
        await loadMiniAppSDKMobileFallback();
    }
}

/**
 * Mobile MiniApp SDK fallback - FIXED: Try alternative approach
 */
async function loadMiniAppSDKMobileFallback() {
    console.log('📱 Trying MiniApp SDK mobile fallback...');
    
    try {
        // Try unpkg CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@farcaster/miniapp-sdk@latest/dist/index.min.js';
        script.async = true;
        
        script.onload = async () => {
            console.log('✅ MiniApp SDK loaded via unpkg CDN');
            
            // Check multiple possible locations for the SDK
            const possibleSDKs = [
                window.farcasterMiniAppSDK,
                window.miniAppSDK,
                window.sdk,
                window.FarcasterSDK
            ];
            
            let foundSDK = null;
            for (const possibleSDK of possibleSDKs) {
                if (possibleSDK && possibleSDK.actions && possibleSDK.actions.ready) {
                    foundSDK = possibleSDK;
                    break;
                }
            }
            
            if (foundSDK) {
                window.sdk = foundSDK;
                console.log('✅ Found and stored MiniApp SDK in window.sdk');
                await initApp();
            } else {
                console.log('⚠️ MiniApp SDK loaded but not found in expected locations, using mock...');
                window.sdk = mockSdk;
                await initApp();
            }
        };
        
        script.onerror = async () => {
            console.log('⚠️ All MiniApp SDK loading failed, using mock...');
            window.sdk = mockSdk;
            await initApp();
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ MiniApp SDK mobile fallback failed:', error);
        window.sdk = mockSdk;
        await initApp();
    }
}

/**
 * Desktop MiniApp SDK loading - FIXED: Use modern SDK
 */
async function loadMiniAppSDKDesktop() {
    console.log('🖥️ Loading MiniApp SDK for desktop...');
    
    try {
        // Try ESM import first
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            try {
                console.log('🖥️ Attempting MiniApp SDK ESM import...');
                const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
                window.miniappSDK = sdk;
                window.miniappSDKLoaded = true;
                console.log('✅ MiniApp SDK imported via ESM (desktop)');
            } catch (error) {
                console.error('❌ MiniApp SDK ESM import failed (desktop):', error);
                window.miniappSDKLoaded = false;
            }
        `;
        document.head.appendChild(script);
        
        // Wait for SDK to load
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
            if (window.miniappSDK && window.miniappSDKLoaded) {
                window.sdk = window.miniappSDK;
                console.log('✅ MiniApp SDK loaded via ESM and stored in window.sdk (desktop)');
                await initApp();
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        // Fallback to CDN
        console.log('⚠️ ESM timed out, trying CDN fallback (desktop)...');
        await loadMiniAppSDKDesktopFallback();
        
    } catch (error) {
        console.error('⚠️ Failed to load MiniApp SDK (desktop):', error);
        await loadMiniAppSDKDesktopFallback();
    }
}

/**
 * Desktop MiniApp SDK fallback
 */
async function loadMiniAppSDKDesktopFallback() {
    console.log('🖥️ Trying MiniApp SDK desktop fallback...');
    
    try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@farcaster/miniapp-sdk@latest/dist/index.min.js';
        
        script.onload = async () => {
            console.log('✅ MiniApp SDK loaded via jsDelivr CDN (desktop)');
            
            // Check for SDK in various locations
            const possibleSDKs = [
                window.farcasterMiniAppSDK,
                window.miniAppSDK,
                window.sdk,
                window.FarcasterSDK
            ];
            
            let foundSDK = null;
            for (const possibleSDK of possibleSDKs) {
                if (possibleSDK && possibleSDK.actions && possibleSDK.actions.ready) {
                    foundSDK = possibleSDK;
                    break;
                }
            }
            
            if (foundSDK) {
                window.sdk = foundSDK;
                console.log('✅ Found and stored MiniApp SDK in window.sdk (desktop)');
                await initApp();
            } else {
                console.log('⚠️ MiniApp SDK loaded but not found, using mock...');
                window.sdk = mockSdk;
                await initApp();
            }
        };
        
        script.onerror = () => {
            console.log('⚠️ All MiniApp SDK loading failed (desktop), using mock...');
            window.sdk = mockSdk;
            initApp();
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('⚠️ MiniApp SDK desktop fallback failed:', error);
        window.sdk = mockSdk;
        await initApp();
    }
}