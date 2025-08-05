// Update debug info display
function updateDebugInfo() {
    const debugEl = document.getElementById('debugInfo');
    if (debugEl) {
        debugEl.innerHTML = `
            🎭 Protardio Gallery Mode<br>
            Last View: ${lastViewTime ? lastViewTime.toLocaleTimeString() : 'Never'}<br>
            Collection: ${TOTAL_IMAGES} Protardios<br>
            Current: ${currentImageIndex ? `#${currentImageIndex}` : 'None'}
        `;
    }
}

// Update frame meta tag with current protardio
function updateFrameMetaTag(protardioIndex) {
    const imageUrl = `https://protardio-mini-app.vercel.app/protardios/protardios/${protardioIndex}.png`;
    
    // Update the fc:frame meta tag with new image
    let frameMetaTag = document.querySelector('meta[name="fc:frame"]');
    if (frameMetaTag) {
        // Parse existing content and update imageUrl
        try {
            const frameData = JSON.parse(frameMetaTag.content);
            frameData.imageUrl = imageUrl;
            frameMetaTag.content = JSON.stringify(frameData);
        } catch (error) {
            console.error('Failed to update frame meta tag:', error);
        }
    }
    
    // Also update Open Graph tags for better social sharing
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
        ogImageTag.content = imageUrl;
    }
    
    // Update Twitter Card image
    let twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageTag) {
        twitterImageTag.content = imageUrl;
    }
    
    console.log(`🖼️ Frame preview updated to Protardio #${protardioIndex}`);
    console.log(`📎 Image URL: ${imageUrl}`);
}

// Check if user is in cooldown period
function checkCooldownStatus() {
    if (!lastViewTime) return false;
    
    const now = new Date();
    const timeDiff = now - lastViewTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < COOLDOWN_HOURS) {
        showCooldownMessage(COOLDOWN_HOURS - hoursDiff);
        return true;
    }
    
    return false;
}

// Show cooldown message
function showCooldownMessage(hoursRemaining) {
    const minutes = Math.ceil(hoursRemaining * 60);
    const statusEl = document.getElementById('statusMessage');
    const viewBtn = document.getElementById('viewImageBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (!statusEl || !viewBtn || !shareBtn) return;
    
    statusEl.innerHTML = `
        <div class="cooldown-timer">⏱️ Cooldown Active</div>
        <p>You can view another Protardio in <strong>${minutes} minutes</strong></p>
        <p>Or share the app to reset your timer!</p>
    `;
    statusEl.style.display = 'block';
    
    viewBtn.disabled = true;
    viewBtn.textContent = '⏱️ Cooldown Active';
    shareBtn.style.display = 'inline-block';
}

// Reset timer function
function resetTimer() {
    localStorage.removeItem('lastProtardioView');
    lastViewTime = null;
    
    const statusEl = document.getElementById('statusMessage');
    const viewBtn = document.getElementById('viewImageBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (statusEl && viewBtn && shareBtn) {
        statusEl.innerHTML = `
            <div>🎉 <strong>Timer Reset!</strong></div>
            <p>You can now view another Protardio.</p>
        `;
        
        viewBtn.disabled = false;
        viewBtn.textContent = '🎲 View Random Protardio';
        shareBtn.style.display = 'none';
    }
    
    updateDebugInfo();
}