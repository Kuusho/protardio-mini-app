// js/app.js - UPDATED with proper ready() call

// Initialize the app and call ready()
async function initApp() {
    debugLog('🎭 Protardio Gallery initializing...');
    
    try {
        // STEP 1: Validate SDK before proceeding
        if (!sdk || !sdk.actions || typeof sdk.actions.ready !== 'function') {
            debugLog('❌ SDK validation failed, using mock', {
                sdkExists: !!sdk,
                hasActions: !!(sdk?.actions),
                hasReady: !!(sdk?.actions?.ready),
                readyType: typeof sdk?.actions?.ready
            });
            sdk = mockSdk;
        }

        // STEP 2: CRITICAL - Call ready() to hide splash screen
        debugLog('📞 Calling sdk.actions.ready() to hide splash screen...');
        
        try {
            await sdk.actions.ready({
                disableNativeGestures: true // Prevent accidental app closes on mobile
            });
            debugLog('✅ SDK ready() called successfully - splash screen should be hidden');
            
        } catch (readyError) {
            debugLog('❌ Ready call failed, trying without options...', readyError.message);
            
            try {
                // Fallback: try without options
                await sdk.actions.ready();
                debugLog('✅ Ready() fallback successful');
            } catch (fallbackError) {
                debugLog('❌ All ready() attempts failed:', fallbackError.message);
                // Continue anyway - app will still work, just might show splash longer
            }
        }
        
        // STEP 3: Initialize UI after SDK is ready
        await initializeUI();
        
        debugLog('🎉 Protardio Gallery initialization complete!');
        
    } catch (error) {
        debugLog('💥 Critical error in initApp', {
            errorName: error.name,
            errorMessage: error.message
        });
        
        // Ensure UI still works even if SDK fails
        await initializeUI();
    }
}

// Initialize UI components and load saved state
async function initializeUI() {
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
    debugLog('🎯 UI initialization complete');
}

// Start the app initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        debugLog('📄 DOM loaded, starting SDK loading');
        loadSDK(); // This will eventually call initApp() which calls ready()
    });
} else {
    debugLog('📄 DOM already loaded, starting SDK loading');
    loadSDK(); // This will eventually call initApp() which calls ready()
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