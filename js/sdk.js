/**
 * Farcaster Frame SDK Loading System
 * 
 * This file handles loading the Farcaster Frame SDK with enhanced mobile compatibility.
 * The system includes multiple fallback strategies to ensure the app works across
 * different devices and environments.
 */

// Mock Farcaster SDK for local testing (FIXED: Sandbox-compatible)
// This provides a fallback when the real SDK can't be loaded
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
            // FIXED: Don't use alert() in sandboxed environment
            // Instead, show a console message and resolve successfully
            debugLog("✅ Mock cast composed successfully", {
                text: options.text,
                embeds: options.embeds
            });
            return Promise.resolve({ hash: "0x123456789" });
        }
    }
};

/**
 * Enhanced mobile-compatible SDK loading
 * 
 * CHANGES MADE:
 * 1. Added enhanced mobile detection with multiple criteria
 * 2. Implemented separate loading strategies for mobile vs desktop
 * 3. Added comprehensive environment logging for debugging
 * 4. Created mobile-specific fallback mechanisms
 */
async function loadSDK() {
    console.log('🔄 Starting SDK initialization...');
    
    // ENHANCED MOBILE DETECTION:
    // Uses both user agent detection AND screen size detection
    // This catches mobile devices that might not be detected by user agent alone
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && window.innerHeight <= 1024);
    
    // COMPREHENSIVE ENVIRONMENT LOGGING:
    // Logs all relevant environment information for debugging mobile issues
    console.log('📱 Environment detection:', {
        isMobile: isMobile,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isFrame: typeof window !== 'undefined' && window.parent !== window
    });
    
    // FRAME ENVIRONMENT DETECTION:
    // Checks if we're running inside a Farcaster frame
    if (typeof window !== 'undefined' && window.parent !== window) {
        try {
            console.log('📡 Farcaster environment detected, loading frame SDK...');
            
            // MOBILE-SPECIFIC LOADING STRATEGY:
            // Different loading approaches for mobile vs desktop
            // Mobile devices often have stricter security policies and different JS execution environments
            if (isMobile) {
                console.log('📱 Mobile detected, using simplified loading...');
                await loadSDKMobile();
            } else {
                console.log('🖥️ Desktop detected, using standard loading...');
                await loadSDKDesktop();
            }
            
        } catch (error) {
            console.error('⚠️ Failed to load Frame SDK:', error);
            console.log('🔄 Falling back to mock SDK...');
            sdk = mockSdk;
            await initApp();
        }
    } else {
        console.log('🏠 Local environment detected, using mock SDK');
        sdk = mockSdk;
        await initApp();
    }
}

/**
 * Mobile-optimized SDK loading
 * 
 * NEW FUNCTION: Created specifically for mobile devices
 * 
 * CHANGES MADE:
 * 1. Uses unpkg CDN as primary source (more reliable on mobile)
 * 2. Adds async and defer attributes for better mobile performance
 * 3. Implements mobile-specific error handling
 * 4. Provides immediate fallback to alternative CDN
 */
async function loadSDKMobile() {
    console.log('📱 Loading SDK for mobile...');
    
    try {
        // MOBILE-OPTIMIZED LOADING:
        // Uses unpkg CDN which is more reliable on mobile devices
        // Adds async and defer for better mobile performance
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@farcaster/frame-sdk@latest/dist/index.min.js';
        script.async = true;  // Load asynchronously for better mobile performance
        script.defer = true;  // Defer execution until page is parsed
        
        script.onload = () => {
            console.log('✅ Mobile SDK loaded via unpkg');
            if (window.frameSDK) {
                sdk = window.frameSDK;
                initApp();
            } else {
                console.log('⚠️ frameSDK not found, trying alternative...');
                loadSDKMobileFallback();
            }
        };
        
        script.onerror = () => {
            console.log('⚠️ Unpkg failed, trying fallback...');
            loadSDKMobileFallback();
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Mobile SDK loading failed:', error);
        loadSDKMobileFallback();
    }
}

/**
 * Mobile fallback loading
 * 
 * NEW FUNCTION: Secondary fallback specifically for mobile devices
 * 
 * CHANGES MADE:
 * 1. Uses jsDelivr CDN as secondary source
 * 2. Implements mobile-specific error handling
 * 3. Provides graceful degradation to mock SDK
 * 4. Ensures app continues to function even if SDK fails
 */
async function loadSDKMobileFallback() {
    console.log('📱 Trying mobile fallback loading...');
    
    try {
        // MOBILE FALLBACK STRATEGY:
        // Uses jsDelivr CDN as secondary source for mobile
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk@latest/dist/index.min.js';
        script.async = true;  // Keep async for mobile performance
        
        script.onload = () => {
            console.log('✅ Mobile fallback SDK loaded via jsDelivr');
            if (window.frameSDK) {
                sdk = window.frameSDK;
                initApp();
            } else {
                console.log('⚠️ Still no SDK, using mock...');
                sdk = mockSdk;
                initApp();
            }
        };
        
        script.onerror = () => {
            console.log('⚠️ All mobile SDK loading failed, using mock...');
            sdk = mockSdk;
            initApp();
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Mobile fallback failed:', error);
        sdk = mockSdk;
        await initApp();
    }
}

/**
 * Desktop SDK loading (original method)
 * 
 * REFACTORED: Separated from mobile loading for better organization
 * 
 * CHANGES MADE:
 * 1. Extracted desktop loading into separate function
 * 2. Maintains original CDN + ESM fallback strategy
 * 3. Keeps desktop-specific error handling
 * 4. Provides clear separation between mobile and desktop approaches
 */
async function loadSDKDesktop() {
    console.log('🖥️ Loading SDK for desktop...');
    
    try {
        // DESKTOP LOADING STRATEGY:
        // Uses original CDN approach with ESM fallback
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js';
        script.onload = () => {
            if (window.frameSDK) {
                sdk = window.frameSDK;
                console.log('✅ Frame SDK loaded via CDN');
                initApp();
            } else {
                // Fallback to ESM import for desktop
                loadSDKESM();
            }
        };
        script.onerror = () => {
            console.log('⚠️ CDN failed, trying ESM import...');
            loadSDKESM();
        };
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('⚠️ Failed to load Frame SDK:', error);
        console.log('🔄 Falling back to mock SDK...');
        sdk = mockSdk;
        await initApp();
    }
}

/**
 * Fallback ESM loading
 * 
 * ORIGINAL FUNCTION: Maintained for desktop compatibility
 * 
 * PURPOSE:
 * - Provides ESM import fallback for desktop environments
 * - Handles module loading in environments that support ES modules
 * - Includes timeout mechanism to prevent infinite waiting
 */
async function loadSDKESM() {
    try {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            try {
                const { sdk } = await import('https://esm.sh/@farcaster/frame-sdk');
                window.farcasterSDK = sdk;
                window.sdkLoaded = true;
                console.log('✅ Frame SDK imported via ESM');
            } catch (error) {
                console.error('❌ Frame SDK ESM import failed:', error);
                window.sdkLoaded = false;
            }
        `;
        document.head.appendChild(script);
        
        // TIMEOUT MECHANISM:
        // Prevents infinite waiting if ESM import fails
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            if (window.farcasterSDK && window.sdkLoaded) {
                sdk = window.farcasterSDK;
                console.log('✅ Farcaster Frame SDK loaded via ESM');
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.farcasterSDK || !window.sdkLoaded) {
            throw new Error('ESM import failed');
        }
        
        await initApp();
        
    } catch (error) {
        console.error('⚠️ ESM fallback failed:', error);
        sdk = mockSdk;
        await initApp();
    }
}