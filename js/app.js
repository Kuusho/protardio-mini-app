// js/app.js - AGGRESSIVE DEBUGGING VERSION

// Add this at the very top to catch everything
console.log('🚀 APP.JS LOADED - Starting aggressive debugging');

// Track if initApp has been called
window.initAppCalled = false;
window.readyCalled = false;

// Initialize the app and call ready() - WITH AGGRESSIVE DEBUGGING
async function initApp() {
    console.log('🎭 =================================');
    console.log('🎭 INITAPP() CALLED - STARTING DEBUG');
    console.log('🎭 =================================');
    
    window.initAppCalled = true;
    
    try {
        // STEP 1: Check what SDK we have
        console.log('🔍 SDK Investigation:', {
            sdkExists: !!sdk,
            sdkType: typeof sdk,
            hasActions: !!(sdk?.actions),
            hasReady: !!(sdk?.actions?.ready),
            readyType: typeof sdk?.actions?.ready,
            isMockSDK: sdk === mockSdk
        });
        
        // STEP 2: Validate SDK before proceeding
        if (!sdk || !sdk.actions || typeof sdk.actions.ready !== 'function') {
            console.log('❌ SDK validation failed, forcing mock SDK');
            sdk = mockSdk;
        }

        // STEP 3: AGGRESSIVE READY() CALLS
        console.log('📞 =================================');
        console.log('📞 ATTEMPTING TO CALL READY()');
        console.log('📞 =================================');
        
        console.log('📞 Ready function details:', {
            readyFunction: sdk.actions.ready.toString().substring(0, 200),
            isAsync: sdk.actions.ready.constructor.name === 'AsyncFunction'
        });
        
        // Try multiple ready() approaches
        const readyStrategies = [
            {
                name: 'With disableNativeGestures',
                call: () => sdk.actions.ready({ disableNativeGestures: true })
            },
            {
                name: 'With empty options',
                call: () => sdk.actions.ready({})
            },
            {
                name: 'Without options',
                call: () => sdk.actions.ready()
            },
            {
                name: 'Force ready call',
                call: () => {
                    console.log('🆘 FORCING READY CALL');
                    return sdk.actions.ready();
                }
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
                window.readyCalled = true;
                readySuccess = true;
                break;
            } catch (error) {
                console.log(`❌ Strategy ${i + 1} failed:`, {
                    strategyName: strategy.name,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack?.substring(0, 300)
                });
                
                // Continue to next strategy
                continue;
            }
        }
        
        if (!readySuccess) {
            console.log('💀 ALL READY() STRATEGIES FAILED');
            console.log('💀 But continuing with app initialization...');
        }
        
        // STEP 4: Initialize UI
        console.log('🎯 Initializing UI...');
        await initializeUI();
        
        console.log('🎉 =================================');
        console.log('🎉 INITAPP() COMPLETE');
        console.log('🎉 Ready called:', window.readyCalled);
        console.log('🎉 =================================');
        
    } catch (error) {
        console.log('💥 CRITICAL ERROR IN INITAPP:', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        
        // Force UI initialization even on error
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
    
    // Load saved state
    debugLog('📂 Loading saved state from localStorage');
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

// FORCE CHECK EVERY 2 SECONDS
setInterval(() => {
    console.log('⏰ Status Check:', {
        initAppCalled: window.initAppCalled,
        readyCalled: window.readyCalled,
        sdkExists: !!window.sdk,
        currentTime: new Date().toISOString()
    });
}, 2000);

// Start the app initialization when DOM is ready
console.log('📄 Setting up DOM load listeners...');

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

// Also force call after 3 seconds if nothing happened
setTimeout(() => {
    console.log('⏰ 3-second timeout check:', {
        initAppCalled: window.initAppCalled,
        readyCalled: window.readyCalled
    });
    
    if (!window.initAppCalled) {
        console.log('🚨 INITAPP NEVER CALLED - FORCING NOW');
        console.log('🚨 Current SDK:', window.sdk);
        
        if (!window.sdk) {
            console.log('🚨 NO SDK - SETTING MOCK');
            window.sdk = mockSdk;
        }
        
        initApp();
    }
    
    if (!window.readyCalled) {
        console.log('🚨 READY NEVER CALLED - FORCING DIRECT CALL');
        try {
            if (window.sdk && window.sdk.actions && window.sdk.actions.ready) {
                window.sdk.actions.ready().then(() => {
                    console.log('🚨 FORCED READY() SUCCESS');
                    window.readyCalled = true;
                }).catch(error => {
                    console.log('🚨 FORCED READY() FAILED:', error.message);
                });
            }
        } catch (error) {
            console.log('🚨 FORCED READY() ATTEMPT CRASHED:', error.message);
        }
    }
}, 3000);

// Rest of your functions remain the same...
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
                    <p style="font-size: 0.8rem; opacity: 0.7;">Make sure the protardios folder is accessible</p>
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
    console.log('📤 SHARE APP CALLED');
    try {
        const shareBtn = document.getElementById('shareBtn');
        shareBtn.disabled = true;
        shareBtn.textContent = '📤 Sharing...';
        
        await sdk.actions.composeCast({
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

console.log('✅ APP.JS SETUP COMPLETE');