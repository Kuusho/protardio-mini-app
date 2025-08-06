// js/app.js - FIXED: Better SDK validation

console.log('🚀 APP.JS LOADED - Using real MiniApp SDK');

// Track initialization
window.initAppCalled = false;
window.readyCalled = false;

// Initialize the app and call ready() - FIXED: Better validation
async function initApp() {
    console.log('🎭 =================================');
    console.log('🎭 INITAPP() CALLED - CHECKING REAL SDK');
    console.log('🎭 =================================');
    
    window.initAppCalled = true;
    
    try {
        // STEP 1: Detailed SDK investigation
        console.log('🔍 Detailed SDK Investigation:', {
            windowSdkExists: !!window.sdk,
            sdkType: typeof window.sdk,
            sdkConstructor: window.sdk?.constructor?.name,
            hasActions: !!(window.sdk?.actions),
            actionsType: typeof window.sdk?.actions,
            hasReady: !!(window.sdk?.actions?.ready),
            readyType: typeof window.sdk?.actions?.ready,
            readyIsFunction: typeof window.sdk?.actions?.ready === 'function',
            isMockSDK: window.sdk === mockSdk,
            // Let's see what the SDK actually contains
            sdkKeys: window.sdk ? Object.keys(window.sdk) : [],
            actionsKeys: window.sdk?.actions ? Object.keys(window.sdk.actions) : []
        });
        
        // STEP 2: More flexible SDK validation
        let sdkIsValid = false;
        let sdkValidationReason = '';
        
        if (!window.sdk) {
            sdkValidationReason = 'No window.sdk';
        } else if (typeof window.sdk !== 'object') {
            sdkValidationReason = 'window.sdk is not an object';
        } else if (!window.sdk.actions) {
            sdkValidationReason = 'No actions property';
        } else if (typeof window.sdk.actions !== 'object') {
            sdkValidationReason = 'actions is not an object';
        } else if (!window.sdk.actions.ready) {
            sdkValidationReason = 'No ready property';
        } else if (typeof window.sdk.actions.ready !== 'function') {
            sdkValidationReason = `ready is not a function (it's ${typeof window.sdk.actions.ready})`;
        } else {
            sdkIsValid = true;
            sdkValidationReason = 'SDK is valid';
        }
        
        console.log('🔍 SDK Validation Result:', {
            isValid: sdkIsValid,
            reason: sdkValidationReason
        });
        
        // STEP 3: Use the SDK we have or force mock
        if (!sdkIsValid) {
            console.log('❌ SDK validation failed:', sdkValidationReason);
            console.log('🔧 Forcing mock SDK...');
            window.sdk = mockSdk;
        } else {
            console.log('✅ Using real MiniApp SDK!');
        }

        // STEP 4: Call ready() with detailed logging
        console.log('📞 =================================');
        console.log('📞 CALLING READY() ON', sdkIsValid ? 'REAL SDK' : 'MOCK SDK');
        console.log('📞 =================================');
        
        console.log('📞 Final ready() function check:', {
            readyExists: !!(window.sdk?.actions?.ready),
            readyType: typeof window.sdk?.actions?.ready,
            readyToString: window.sdk?.actions?.ready?.toString?.()?.substring(0, 100)
        });
        
        const readyStrategies = [
            {
                name: 'With disableNativeGestures',
                call: () => window.sdk.actions.ready({ disableNativeGestures: true })
            },
            {
                name: 'With empty options',
                call: () => window.sdk.actions.ready({})
            },
            {
                name: 'Without options',
                call: () => window.sdk.actions.ready()
            }
        ];

        let readySuccess = false;
        
        for (let i = 0; i < readyStrategies.length; i++) {
            const strategy = readyStrategies[i];
            console.log(`📞 Trying strategy ${i + 1}: ${strategy.name}`);
            
            try {
                const result = await strategy.call();
                console.log(`✅ READY() SUCCESS with strategy: ${strategy.name}`);
                console.log('✅ Ready result:', result);
                console.log('✅ Called on:', sdkIsValid ? 'REAL MiniApp SDK' : 'Mock SDK');
                window.readyCalled = true;
                readySuccess = true;
                break;
            } catch (error) {
                console.log(`❌ Strategy ${i + 1} failed:`, {
                    strategyName: strategy.name,
                    errorName: error.name,
                    errorMessage: error.message
                });
                continue;
            }
        }
        
        if (!readySuccess) {
            console.log('💀 ALL READY() STRATEGIES FAILED');
        }
        
        // STEP 5: Initialize UI
        console.log('🎯 Initializing UI...');
        await initializeUI();
        
        console.log('🎉 =================================');
        console.log('🎉 INITAPP() COMPLETE');
        console.log('🎉 Ready called:', window.readyCalled);
        console.log('🎉 Using SDK:', sdkIsValid ? 'REAL MiniApp SDK' : 'Mock SDK');
        console.log('🎉 Window.sdk exists:', !!window.sdk);
        console.log('🎉 =================================');
        
    } catch (error) {
        console.log('💥 CRITICAL ERROR IN INITAPP:', {
            errorName: error.name,
            errorMessage: error.message
        });
        
        try {
            await initializeUI();
        } catch (uiError) {
            console.log('💥 UI INIT ALSO FAILED:', uiError.message);
        }
    }
}

// Initialize UI components and load saved state
async function initializeUI() {
    console.log('🎯 UI INITIALIZATION STARTING...');
    
    const stored = localStorage.getItem('lastProtardioView');
    if (stored) {
        lastViewTime = new Date(stored);
        debugLog('✅ Restored last view time', lastViewTime.toISOString());
        checkCooldownStatus();
    } else {
        debugLog('ℹ️ No saved state found');
    }
    
    updateDebugInfo();
    console.log('✅ UI INITIALIZATION COMPLETE');
}

// Status check with more detail
setInterval(() => {
    const status = {
        initAppCalled: window.initAppCalled,
        readyCalled: window.readyCalled,
        sdkExists: !!window.sdk,
        sdkType: typeof window.sdk,
        isMockSDK: window.sdk === mockSdk,
        hasActions: !!(window.sdk?.actions),
        hasReady: !!(window.sdk?.actions?.ready),
        currentTime: new Date().toISOString()
    };
    
    console.log('⏰ Enhanced Status Check:', status);
}, 3000); // Reduced frequency

// DOM load handling
if (document.readyState === 'loading') {
    console.log('📄 DOM still loading, adding event listener');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM LOADED EVENT FIRED - calling loadSDK()');
        loadSDK();
    });
} else {
    console.log('📄 DOM already loaded, calling loadSDK() immediately');
    loadSDK();
}

// Force check after 5 seconds if needed
setTimeout(() => {
    console.log('⏰ 5-second timeout check:', {
        initAppCalled: window.initAppCalled,
        readyCalled: window.readyCalled,
        sdkExists: !!window.sdk,
        isMockSDK: window.sdk === mockSdk
    });
    
    if (!window.initAppCalled) {
        console.log('🚨 INITAPP NEVER CALLED - FORCING NOW');
        if (!window.sdk) {
            console.log('🚨 NO SDK - SETTING MOCK');
            window.sdk = mockSdk;
        }
        initApp();
    }
}, 5000);

// App functions - Use window.sdk
window.viewRandomProtardio = async function() {
    console.log('🎲 VIEW RANDOM PROTARDIO CALLED');
    
    if (checkCooldownStatus()) return;
    
    const container = document.getElementById('imageContainer');
    const viewBtn = document.getElementById('viewImageBtn');
    const statusEl = document.getElementById('statusMessage');
    
    container.classList.add('loading', 'shimmer');
    viewBtn.disabled = true;
    viewBtn.textContent = '🎲 Loading Protardio...';
    
    setTimeout(() => {
        try {
            currentImageIndex = Math.floor(Math.random() * TOTAL_IMAGES) + 1;
            const imagePath = generateProtardioPath(currentImageIndex);
            
            console.log(`Loading Protardio #${currentImageIndex}: ${imagePath}`);
            
            const img = new Image();
            img.onload = function() {
                container.innerHTML = '';
                img.className = 'protardio-image';
                container.appendChild(img);
                
                lastViewTime = new Date();
                localStorage.setItem('lastProtardioView', lastViewTime.toISOString());
                
                updateFrameMetaTag(currentImageIndex);
                
                statusEl.innerHTML = `
                    <div>🎉 <strong>Protardio #${currentImageIndex}</strong> revealed!</div>
                    <p>A unique member of the Protardio collection! 🎭</p>
                    <p>Come back in 1 hour for another random Protardio, or share to reset!</p>
                `;
                statusEl.style.display = 'block';
                
                checkCooldownStatus();
                
                container.classList.remove('loading', 'shimmer');
                updateDebugInfo();
            };
            
            img.onerror = function() {
                console.error(`Failed to load Protardio image: ${imagePath}`);
                container.classList.remove('loading', 'shimmer');
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #8B4513;">
                        <div style="font-size: 3rem;">🚫</div>
                        <div>Failed to load Protardio #${currentImageIndex}</div>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">Check file path and permissions</div>
                    </div>
                `;
                
                statusEl.innerHTML = `
                    <div>❌ <strong>Load Failed</strong></div>
                    <p>Could not load Protardio #${currentImageIndex}. Try again?</p>
                `;
                statusEl.style.display = 'block';
                
                viewBtn.disabled = false;
                viewBtn.textContent = '🎲 Try Again';
            };
            
            img.src = imagePath;
            
        } catch (error) {
            console.error('Failed to generate Protardio:', error);
            container.classList.remove('loading', 'shimmer');
            container.innerHTML = '<div class="placeholder">❌</div>';
            
            statusEl.textContent = 'Failed to generate Protardio. Please try again.';
            statusEl.style.display = 'block';
            
            viewBtn.disabled = false;
            viewBtn.textContent = '🎲 Try Again';
        }
    }, 800);
};

window.shareApp = async function() {
    console.log('📤 SHARE APP CALLED - SDK type:', window.sdk === mockSdk ? 'Mock' : 'Real');
    try {
        const shareBtn = document.getElementById('shareBtn');
        shareBtn.disabled = true;
        shareBtn.textContent = '📤 Sharing...';
        
        await window.sdk.actions.composeCast({
            text: `Pushing 🅿 with preview protardio ${currentImageIndex || '???'}, check it out (or not)\n\nprotardio.`,
            embeds: [window.location.href]
        });
        
        resetTimer();
        
    } catch (error) {
        console.error('Failed to share:', error);
        const shareBtn = document.getElementById('shareBtn');
        shareBtn.disabled = false;
        shareBtn.textContent = '📤 Share to Reset Timer';
    }
};

window.resetForTesting = function() {
    console.log('🔄 RESET FOR TESTING CALLED');
    resetTimer();
    const container = document.getElementById('imageContainer');
    const statusEl = document.getElementById('statusMessage');
    
    if (container) container.innerHTML = '<div class="placeholder">🎭</div>';
    if (statusEl) statusEl.style.display = 'none';
    
    currentImageIndex = null;
    updateDebugInfo();
};

console.log('✅ APP.JS SETUP COMPLETE - ENHANCED SDK VALIDATION');