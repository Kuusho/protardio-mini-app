// Start loading SDK when page loads (with conflict protection)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        debugLog('📄 DOM loaded, starting SDK loading with conflict protection');
        
        // Protect against ethereum conflicts before loading SDK
        const originalEthereum = window.ethereum;
        debugLog('🛡️ Ethereum conflict protection active', {
            hasOriginalEthereum: !!originalEthereum,
            ethereumType: typeof originalEthereum
        });
        
        loadSDK();
    });
} else {
    debugLog('📄 DOM already loaded, starting SDK loading immediately');
    
    // Protect against ethereum conflicts
    const originalEthereum = window.ethereum;
    debugLog('🛡️ Ethereum conflict protection active', {
        hasOriginalEthereum: !!originalEthereum,
        ethereumType: typeof originalEthereum
    });
    
    loadSDK();
}

// Initialize the app and call ready (with comprehensive logging and conflict protection)
async function initApp() {
    debugLog('🎭 Protardio Gallery initializing...');
    
    // Initialize variables in proper scope
    let ethereumConflictDetected = false;
    const originalEthereum = window.ethereum;
    
    // Check for ethereum conflicts before proceeding
    debugLog('Pre-init environment check', {
        hasEthereum: !!window.ethereum,
        ethereumWritable: window.ethereum ? Object.getOwnPropertyDescriptor(window, 'ethereum')?.writable : 'N/A',
        hasSdk: !!sdk,
        sdkType: sdk === mockSdk ? 'Mock' : 'Real',
        sdkHasActions: !!(sdk?.actions),
        sdkHasReady: !!(sdk?.actions?.ready)
    });
    
    try {
        // Ensure we have a valid SDK
        if (!sdk || !sdk.actions || typeof sdk.actions.ready !== 'function') {
            debugLog('❌ SDK validation failed, using mock', {
                sdkExists: !!sdk,
                hasActions: !!(sdk?.actions),
                hasReady: !!(sdk?.actions?.ready),
                readyType: typeof sdk?.actions?.ready
            });
            sdk = mockSdk;
        }
        
        debugLog('📞 About to call sdk.actions.ready() with mobile optimizations...');
        
        try {
            // CRITICAL FIX #2: Call ready() with mobile optimizations
            const readyResult = await sdk.actions.ready({
                // CRITICAL: Disable native gestures to prevent accidental app closes on mobile
                disableNativeGestures: true
            });
            debugLog('✅ SDK ready() called successfully with mobile optimizations', readyResult);
            
        } catch (readyError) {
            debugLog('❌ Ready call failed, analyzing error', {
                errorName: readyError.name,
                errorMessage: readyError.message,
                errorStack: readyError.stack?.substring(0, 200)
            });
            
            // Check if this is an ethereum conflict
            if (readyError.message?.includes('ethereum') || readyError.message?.includes('redefine')) {
                ethereumConflictDetected = true;
                debugLog('🚨 Ethereum conflict detected during ready() call');
            }
            
            // Try calling ready again as fallback (mobile retry logic)
            try {
                debugLog('🔄 Retrying ready() call with basic options...');
                await sdk.actions.ready({
                    disableNativeGestures: true // Still try to disable gestures
                });
                debugLog('✅ Ready() retry successful');
            } catch (retryError) {
                debugLog('❌ Ready() retry also failed', {
                    errorName: retryError.name,
                    errorMessage: retryError.message
                });
                
                // Last resort - try without any options
                try {
                    debugLog('🆘 Last resort: calling ready() without options...');
                    await sdk.actions.ready();
                    debugLog('✅ Basic ready() call succeeded');
                } catch (finalError) {
                    debugLog('💀 All ready() attempts failed', {
                        errorName: finalError.name,
                        errorMessage: finalError.message,
                        stackTrace: finalError.stack?.substring(0, 300)
                    });
                    // App will still function with mock SDK, just warn user
                    debugLog('⚠️ App running without proper SDK connection');
                }
            }
        }
        
        // Small delay to ensure ready() is processed
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (ethereumConflictDetected) {
            debugLog('🔧 Attempting to resolve ethereum conflicts');
            // Try to restore original ethereum if it was modified
            if (originalEthereum && window.ethereum !== originalEthereum) {
                try {
                    Object.defineProperty(window, 'ethereum', {
                        value: originalEthereum,
                        writable: false,
                        configurable: true
                    });
                    debugLog('✅ Ethereum property restored');
                } catch (restoreError) {
                    debugLog('⚠️ Could not restore ethereum property', restoreError.message);
                }
            }
        }
        
    } catch (error) {
        debugLog('💥 Critical error in initApp', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
    }
    
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
    debugLog('🎉 Protardio Gallery initialization complete!');
    
    // MOBILE DEBUG: Final status report
    debugLog('📱 Final mobile optimization status', {
        sdkType: sdk !== mockSdk ? 'Real MiniApp SDK' : 'Mock SDK',
        nativeGestures: 'Disabled for mobile stability',
        readyCalled: 'Attempted (check logs above for success)',
        ethereumConflicts: ethereumConflictDetected ? 'Detected and handled' : 'None detected',
        appReady: 'Yes'
    });
}

// FIXED: View random protardio - now uses TOTAL_IMAGES instead of hardcoded 1000
window.viewRandomProtardio = async function() {
    if (checkCooldownStatus()) return;
    
    const container = document.getElementById('imageContainer');
    const viewBtn = document.getElementById('viewImageBtn');
    const statusEl = document.getElementById('statusMessage');
    
    container.classList.add('loading', 'shimmer');
    viewBtn.disabled = true;
    viewBtn.textContent = '🎲 Loading Protardio...';
    
    setTimeout(() => {
        try {
            // FIXED: Now uses TOTAL_IMAGES (2000) instead of hardcoded 1000
            currentImageIndex = Math.floor(Math.random() * TOTAL_IMAGES) + 1; // +1 because files are now 1-2000
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

// Share app function
window.shareApp = async function() {
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

// Reset for testing
window.resetForTesting = function() {
    resetTimer();
    const container = document.getElementById('imageContainer');
    const statusEl = document.getElementById('statusMessage');
    
    if (container) container.innerHTML = '<div class="placeholder">🎭</div>';
    if (statusEl) statusEl.style.display = 'none';
    
    currentImageIndex = null;
    updateDebugInfo();
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, waiting for SDK...');
});