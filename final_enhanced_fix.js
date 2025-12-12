// Final Enhanced Mode Fix - No alerts, better color filtering

document.addEventListener('DOMContentLoaded', function() {
    
    // Override ALL calibration functions to remove alerts
    window.startCalibration = function() {
        enhancedSettings.calibrating = true;
        
        // Visual instruction only - no alert!
        const instruction = document.createElement('div');
        instruction.id = 'calibrationInstruction';
        instruction.style.cssText = `
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
            pointer-events: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        instruction.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-crosshairs" style="color: #0061ef; font-size: 24px; animation: pulse 2s infinite;"></i>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Click on the glowing ink to calibrate</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Press ESC to cancel</div>
                </div>
            </div>
        `;
        document.body.appendChild(instruction);
        
        // Make canvas clickable
        const canvas = document.getElementById('enhancedCanvas');
        canvas.style.cursor = 'crosshair';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '10002';
        
        // Click handler for calibration
        const calibrationHandler = function(e) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
            const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
            
            // Sample a 5x5 region for better average
            let totalR = 0, totalG = 0, totalB = 0, samples = 0;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const sx = Math.max(0, Math.min(hiddenCanvas.width - 1, x + dx));
                    const sy = Math.max(0, Math.min(hiddenCanvas.height - 1, y + dy));
                    const pixel = hiddenCtx.getImageData(sx, sy, 1, 1).data;
                    totalR += pixel[0];
                    totalG += pixel[1];
                    totalB += pixel[2];
                    samples++;
                }
            }
            
            const avgR = totalR / samples;
            const avgG = totalG / samples;
            const avgB = totalB / samples;
            
            // Determine color and set threshold
            const maxChannel = Math.max(avgR, avgG, avgB);
            enhancedSettings.luminanceThreshold = maxChannel * 0.7;
            
            // Detect dominant color
            if (avgG > avgB * 1.2 && avgG > avgR) {
                enhancedSettings.inkColor = 'green';
            } else if (avgB > avgG * 1.2 && avgB > avgR) {
                enhancedSettings.inkColor = 'blue';
            } else {
                enhancedSettings.inkColor = avgG > avgB ? 'green' : 'blue';
            }
            
            // Update UI
            if (document.getElementById('luminanceSlider')) {
                document.getElementById('luminanceSlider').value = enhancedSettings.luminanceThreshold;
                document.getElementById('luminanceValue').textContent = Math.round(enhancedSettings.luminanceThreshold);
            }
            updateColorUI(enhancedSettings.inkColor);
            
            // Cleanup
            canvas.style.cursor = 'default';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '';
            enhancedSettings.calibrating = false;
            
            // Success message
            instruction.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 24px;"></i>
                    <div>Calibrated for ${enhancedSettings.inkColor} ink (threshold: ${Math.round(enhancedSettings.luminanceThreshold)})</div>
                </div>
            `;
            
            setTimeout(() => {
                if (instruction.parentNode) {
                    document.body.removeChild(instruction);
                }
            }, 3000);
        };
        
        canvas.addEventListener('click', calibrationHandler, { once: true });
        
        // ESC to cancel
        const escHandler = function(e) {
            if (e.key === 'Escape' && enhancedSettings.calibrating) {
                canvas.removeEventListener('click', calibrationHandler);
                canvas.style.cursor = 'default';
                canvas.style.pointerEvents = 'none';
                canvas.style.zIndex = '';
                enhancedSettings.calibrating = false;
                if (instruction.parentNode) {
                    document.body.removeChild(instruction);
                }
            }
        };
        document.addEventListener('keydown', escHandler, { once: true });
    };
    
    // Better color detection that excludes white/gray
    window.processEnhancedFrame = function(canvas, ctx) {
        // Fix canvas positioning
        const videoRect = videoElement.getBoundingClientRect();
        canvas.style.position = 'fixed';
        canvas.style.left = videoRect.left + 'px';
        canvas.style.top = videoRect.top + 'px';
        canvas.style.width = videoRect.width + 'px';
        canvas.style.height = videoRect.height + 'px';
        
        if (!enhancedSettings.calibrating) {
            canvas.style.pointerEvents = 'none';
        }
        
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
        
        // Capture video frame
        hiddenCanvas.width = videoElement.videoWidth;
        hiddenCanvas.height = videoElement.videoHeight;
        hiddenCtx.drawImage(videoElement, 0, 0);
        
        // Process image
        const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        const data = imageData.data;
        
        // Create output
        const inkCanvas = document.createElement('canvas');
        inkCanvas.width = hiddenCanvas.width;
        inkCanvas.height = hiddenCanvas.height;
        const inkCtx = inkCanvas.getContext('2d');
        const inkImageData = inkCtx.createImageData(hiddenCanvas.width, hiddenCanvas.height);
        const inkData = inkImageData.data;
        
        const threshold = enhancedSettings.luminanceThreshold || 100;
        const isGreen = enhancedSettings.inkColor === 'green';
        
        // Process each pixel with better color discrimination
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate color properties
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Saturation: how much color vs gray
            const saturation = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;
            
            // Color difference: how different are the channels
            const colorDiff = maxVal - minVal;
            
            let isInk = false;
            
            // CRITICAL: Reject white/gray pixels
            // White/gray has low saturation and small color differences
            if (saturation < 0.3 || colorDiff < 40) {
                isInk = false; // Definitely not colored ink
            } else if (isGreen) {
                // Green UV ink detection
                // Must be bright, saturated, and green-dominant
                isInk = g > threshold && 
                       g > r * 1.4 && 
                       g > b * 1.2 &&
                       saturation > 0.3 &&
                       colorDiff > 40;
            } else {
                // Blue UV ink detection  
                // Must be bright, saturated, and blue-dominant
                isInk = b > threshold && 
                       b > r * 1.4 && 
                       b > g * 1.2 &&
                       saturation > 0.3 &&
                       colorDiff > 40;
            }
            
            // Additional white rejection
            // If all channels are too similar, it's white/gray
            if (isInk) {
                const channelVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
                if (channelVariance < 60) {
                    isInk = false; // Too close to white/gray
                }
            }
            
            if (isInk) {
                // Render the colored ink
                const boost = enhancedSettings.brightness;
                
                if (isGreen) {
                    inkData[i] = 0;
                    inkData[i + 1] = Math.min(255, g * boost);
                    inkData[i + 2] = 0;
                    inkData[i + 3] = Math.min(255, 180 + saturation * 75);
                } else {
                    inkData[i] = 0;
                    inkData[i + 1] = 0;
                    inkData[i + 2] = Math.min(255, b * boost);
                    inkData[i + 3] = Math.min(255, 180 + saturation * 75);
                }
            } else {
                inkData[i + 3] = 0; // Transparent
            }
        }
        
        // Simple noise removal
        for (let y = 1; y < hiddenCanvas.height - 1; y++) {
            for (let x = 1; x < hiddenCanvas.width - 1; x++) {
                const idx = (y * hiddenCanvas.width + x) * 4 + 3;
                
                if (inkData[idx] > 0) {
                    // Count non-transparent neighbors
                    let neighbors = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nIdx = ((y + dy) * hiddenCanvas.width + (x + dx)) * 4 + 3;
                            if (inkData[nIdx] > 0) neighbors++;
                        }
                    }
                    
                    // Remove isolated pixels
                    if (neighbors < 2) {
                        inkData[idx] = 0;
                    }
                }
            }
        }
        
        // Put processed data
        inkCtx.putImageData(inkImageData, 0, 0);
        
        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Glow effect
        if (enhancedSettings.glow > 0) {
            ctx.shadowBlur = enhancedSettings.glow;
            ctx.shadowColor = isGreen ? '#00ff00' : '#0099ff';
        }
        
        // Scale and draw
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
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
});
</script>