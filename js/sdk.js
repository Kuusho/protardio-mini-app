// Mock Farcaster SDK for local testing (FIXED: Sandbox-compatible)
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

// ALTERNATIVE: Try CDN approach if ESM fails on mobile
async function loadSDK() {
    console.log('🔄 Starting SDK initialization...');
    
    if (typeof window !== 'undefined' && window.parent !== window) {
        try {
            console.log('📡 Farcaster environment detected, loading frame SDK...');
            
            // Try CDN approach first
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js';
            script.onload = () => {
                if (window.frameSDK) {
                    sdk = window.frameSDK;
                    console.log('✅ Frame SDK loaded via CDN');
                    initApp();
                } else {
                    // Fallback to ESM import
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
    } else {
        console.log('🏠 Local environment detected, using mock SDK');
        sdk = mockSdk;
        await initApp();
    }
}

// Fallback ESM loading
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
        
        // Wait for SDK to load
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