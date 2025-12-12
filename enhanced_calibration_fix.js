// Enhanced Mode Calibration Fix - Non-blocking UI and better color detection

document.addEventListener('DOMContentLoaded', function() {
    
    // Override calibration with non-blocking UI
    window.startCalibration = function() {
        enhancedSettings.calibrating = true;
        
        // Create calibration overlay instead of alert
        const overlay = document.createElement('div');
        overlay.id = 'calibrationOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10002;
            cursor: crosshair;
            background: rgba(0, 0, 0, 0.3);
        `;
        
        // Add instruction banner
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: rgba(17, 24, 39, 0.95);
            border: 2px solid #0061ef;
            border-radius: 10px;
            color: white;
            font-size: 16px;
            z-index: 10003;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-crosshairs" style="color: #0061ef; font-size: 24px;"></i>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Calibration Mode</div>
                    <div style="font-size: 14px; color: #9ca3af;">Click on the glowing ink to calibrate detection</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Press ESC to cancel</div>
                </div>
            </div>
        `;
        
        overlay.appendChild(banner);
        document.body.appendChild(overlay);
        
        // Add click handler to canvas through overlay
        overlay.addEventListener('click', function(e) {
            // Ignore clicks on the banner
            if (e.target === banner || banner.contains(e.target)) return;
            
            handleCalibrationClick(e);
            document.body.removeChild(overlay);
        });
        
        // Add escape key handler
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                enhancedSettings.calibrating = false;
                if (document.getElementById('calibrationOverlay')) {
                    document.body.removeChild(overlay);
                }
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };
    
    window.handleCalibrationClick = function(e) {
        const canvas = document.getElementById('enhancedCanvas');
        const rect = canvas.getBoundingClientRect();
        
        // Calculate click position relative to video
        const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
        
        // Sample a region around the click point for better averaging
        const sampleSize = 5;
        let rSum = 0, gSum = 0, bSum = 0;
        let samples = 0;
        let maxLuminance = 0;
        
        for (let dy = -sampleSize; dy <= sampleSize; dy++) {
            for (let dx = -sampleSize; dx <= sampleSize; dx++) {
                const sx = Math.max(0, Math.min(hiddenCanvas.width - 1, x + dx));
                const sy = Math.max(0, Math.min(hiddenCanvas.height - 1, y + dy));
                
                const pixel = hiddenCtx.getImageData(sx, sy, 1, 1).data;
                rSum += pixel[0];
                gSum += pixel[1];
                bSum += pixel[2];
                samples++;
                
                const luminance = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
                maxLuminance = Math.max(maxLuminance, luminance);
            }
        }
        
        // Average the sampled colors
        const avgR = rSum / samples;
        const avgG = gSum / samples;
        const avgB = bSum / samples;
        
        // Set threshold based on sampled luminance (set it lower to catch more)
        enhancedSettings.luminanceThreshold = Math.max(30, maxLuminance * 0.6);
        
        // Detect color based on channel dominance
        // Real fluorescent markers often have mixed colors
        if (avgG > avgB * 1.1) {
            enhancedSettings.inkColor = 'green';
        } else if (avgB > avgG * 1.1) {
            enhancedSettings.inkColor = 'blue';
        } else {
            // If unclear, check which channel is highest
            enhancedSettings.inkColor = avgG > avgB ? 'green' : 'blue';
        }
        
        // Update UI
        if (document.getElementById('luminanceSlider')) {
            document.getElementById('luminanceSlider').value = enhancedSettings.luminanceThreshold;
            document.getElementById('luminanceValue').textContent = Math.round(enhancedSettings.luminanceThreshold);
        }
        
        updateColorUI(enhancedSettings.inkColor);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: rgba(16, 185, 129, 0.9);
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10004;
            animation: fadeInOut 3s ease-in-out;
        `;
        successMsg.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Calibrated for ${enhancedSettings.inkColor} ink (threshold: ${Math.round(enhancedSettings.luminanceThreshold)})
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                document.body.removeChild(successMsg);
            }
        }, 3000);
        
        enhancedSettings.calibrating = false;
    };
    
    // Improved color detection for real fluorescent ink
    window.processEnhancedFrame = function(canvas, ctx) {
        // Fix canvas positioning
        const videoRect = videoElement.getBoundingClientRect();
        canvas.style.position = 'fixed';
        canvas.style.left = videoRect.left + 'px';
        canvas.style.top = videoRect.top + 'px';
        canvas.style.width = videoRect.width + 'px';
        canvas.style.height = videoRect.height + 'px';
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
        
        // Capture video frame
        hiddenCanvas.width = videoElement.videoWidth;
        hiddenCanvas.height = videoElement.videoHeight;
        hiddenCtx.drawImage(videoElement, 0, 0);
        
        // Process image data
        const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        const data = imageData.data;
        
        // Create output for ink
        const inkCanvas = document.createElement('canvas');
        inkCanvas.width = hiddenCanvas.width;
        inkCanvas.height = hiddenCanvas.height;
        const inkCtx = inkCanvas.getContext('2d');
        const inkImageData = inkCtx.createImageData(hiddenCanvas.width, hiddenCanvas.height);
        const inkData = inkImageData.data;
        
        const threshold = enhancedSettings.luminanceThreshold || 100;
        const isGreen = enhancedSettings.inkColor === 'green';
        
        // Process each pixel with better color detection
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate luminance and color properties
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
            
            let isInk = false;
            
            // Primary detection: luminance for dark rooms
            if (luminance > threshold) {
                // Secondary filter: check color tendency
                // Fluorescent ink often has mixed colors, not pure RGB
                if (isGreen) {
                    // Green fluorescent: green channel should be significant
                    // But may also have substantial blue (cyan-ish green)
                    isInk = g > threshold && g >= r;
                } else {
                    // Blue fluorescent: blue channel should be significant
                    // Often has green component too (cyan-ish blue)
                    isInk = b > threshold && b >= r;
                }
                
                // Additional check: reject pure white (all channels high and similar)
                if (r > threshold * 0.9 && g > threshold * 0.9 && b > threshold * 0.9) {
                    const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
                    if (variance < 30) {
                        isInk = false; // Likely white light, not colored ink
                    }
                }
            }
            
            if (isInk) {
                // Enhance the ink with its natural color
                const boost = enhancedSettings.brightness;
                
                if (isGreen) {
                    // Enhance green while preserving some blue (for cyan-green)
                    inkData[i] = Math.min(255, r * 0.3);
                    inkData[i + 1] = Math.min(255, g * boost);
                    inkData[i + 2] = Math.min(255, b * 0.7);
                } else {
                    // Enhance blue while preserving some green (for cyan-blue)
                    inkData[i] = Math.min(255, r * 0.3);
                    inkData[i + 1] = Math.min(255, g * 0.7);
                    inkData[i + 2] = Math.min(255, b * boost);
                }
                
                // Alpha based on luminance for smooth edges
                inkData[i + 3] = Math.min(255, 100 + luminance * 0.6);
            } else {
                inkData[i + 3] = 0; // Transparent
            }
        }
        
        // Apply noise reduction (simple median filter)
        // This helps remove isolated pixels
        for (let y = 1; y < hiddenCanvas.height - 1; y++) {
            for (let x = 1; x < hiddenCanvas.width - 1; x++) {
                const idx = (y * hiddenCanvas.width + x) * 4 + 3; // Alpha channel
                
                // Count transparent neighbors
                let transparentCount = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * hiddenCanvas.width + (x + dx)) * 4 + 3;
                        if (inkData[nIdx] === 0) transparentCount++;
                    }
                }
                
                // If mostly surrounded by transparent pixels, make this transparent too
                if (transparentCount >= 6 && inkData[idx] < 200) {
                    inkData[idx] = 0;
                }
            }
        }
        
        // Put processed data
        inkCtx.putImageData(inkImageData, 0, 0);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply glow effect
        if (enhancedSettings.glow > 0) {
            ctx.shadowBlur = enhancedSettings.glow;
            ctx.shadowColor = isGreen ? '#00ff88' : '#0088ff';
        }
        
        // Scale to match video display
        const scaleX = canvas.width / hiddenCanvas.width;
        const scaleY = canvas.height / hiddenCanvas.height;
        
        ctx.save();
        if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(inkCanvas, 0, 0);
        ctx.restore();
    };
    
    // Add CSS for fade animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
});
</script>