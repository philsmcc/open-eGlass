// Enhanced Mode Fix - Improved detection for dark rooms with glowing ink

function startCalibration() {
    enhancedSettings.calibrating = true;
    const status = document.getElementById('calibrationStatus');
    status.classList.remove('hidden');
    status.textContent = 'Click on the glowing ink to sample color';
    
    // Add click handler to canvas
    const canvas = document.getElementById('enhancedCanvas');
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', handleCalibrationClick, { once: true });
}

function handleCalibrationClick(e) {
    const canvas = document.getElementById('enhancedCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
    
    // Sample the color at click point
    const pixel = hiddenCtx.getImageData(x, y, 1, 1).data;
    const luminance = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
    
    // Set threshold based on sampled luminance
    enhancedSettings.luminanceThreshold = Math.max(50, luminance - 30);
    document.getElementById('luminanceSlider').value = enhancedSettings.luminanceThreshold;
    document.getElementById('luminanceValue').textContent = Math.round(enhancedSettings.luminanceThreshold);
    
    // Detect if green or blue
    if (pixel[1] > pixel[2]) {
        enhancedSettings.inkColor = 'green';
    } else {
        enhancedSettings.inkColor = 'blue';
    }
    updateColorUI(enhancedSettings.inkColor);
    
    // Finish calibration
    enhancedSettings.calibrating = false;
    canvas.style.cursor = 'default';
    const status = document.getElementById('calibrationStatus');
    status.textContent = `Calibrated for ${enhancedSettings.inkColor} ink (threshold: ${Math.round(enhancedSettings.luminanceThreshold)})`;
    setTimeout(() => status.classList.add('hidden'), 3000);
}

function updateDetectionMode() {
    const mode = document.getElementById('detectionMode').value;
    enhancedSettings.detectionMode = mode;
    
    // Show/hide appropriate controls
    const luminanceControl = document.getElementById('luminanceControl');
    const sensitivityControl = document.getElementById('sensitivityControl');
    
    if (mode === 'luminance') {
        luminanceControl.style.display = 'block';
        sensitivityControl.style.display = 'none';
    } else {
        luminanceControl.style.display = 'none';
        sensitivityControl.style.display = 'block';
    }
}

function updateLuminance(value) {
    enhancedSettings.luminanceThreshold = parseInt(value);
    document.getElementById('luminanceValue').textContent = value;
}

function processEnhancedFrameFixed(canvas, ctx) {
    // Get video element's actual display dimensions and position
    const videoRect = videoElement.getBoundingClientRect();
    
    // Update canvas position and size to match video exactly
    canvas.style.position = 'fixed';
    canvas.style.left = videoRect.left + 'px';
    canvas.style.top = videoRect.top + 'px';
    canvas.style.width = videoRect.width + 'px';
    canvas.style.height = videoRect.height + 'px';
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    
    // Capture current video frame
    hiddenCanvas.width = videoElement.videoWidth;
    hiddenCanvas.height = videoElement.videoHeight;
    hiddenCtx.drawImage(videoElement, 0, 0);
    
    // Get image data
    const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const data = imageData.data;
    
    // Create output canvas for processed ink
    const inkCanvas = document.createElement('canvas');
    inkCanvas.width = hiddenCanvas.width;
    inkCanvas.height = hiddenCanvas.height;
    const inkCtx = inkCanvas.getContext('2d');
    const inkImageData = inkCtx.createImageData(hiddenCanvas.width, hiddenCanvas.height);
    const inkData = inkImageData.data;
    
    // Process each pixel - detect glowing ink in dark room
    const threshold = enhancedSettings.luminanceThreshold;
    const isGreen = enhancedSettings.inkColor === 'green';
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
        
        let isInk = false;
        
        if (enhancedSettings.detectionMode === 'luminance') {
            // For dark rooms - detect bright pixels
            isInk = luminance > threshold;
            
            // Additional color filtering if needed
            if (isInk && saturation > 0.2) {
                if (isGreen) {
                    // Green should be dominant for green ink
                    isInk = g > r * 1.2 && g > b * 1.1;
                } else {
                    // Blue should be dominant for blue ink
                    isInk = b > r * 1.2 && b > g * 1.1;
                }
            }
        } else {
            // Color-based detection for lit rooms
            if (isGreen) {
                isInk = g > 140 && g > r * 1.5 && g > b * 1.3 && saturation > 0.4;
            } else {
                isInk = b > 140 && b > r * 1.5 && b > g * 1.2 && saturation > 0.4;
            }
        }
        
        if (isInk) {
            // Keep the glowing ink with enhancement
            const boost = enhancedSettings.brightness;
            if (isGreen) {
                inkData[i] = Math.min(255, r * 0.3);
                inkData[i + 1] = Math.min(255, g * boost);
                inkData[i + 2] = Math.min(255, b * 0.4);
                inkData[i + 3] = Math.min(255, 200 + saturation * 55);
            } else {
                inkData[i] = Math.min(255, r * 0.3);
                inkData[i + 1] = Math.min(255, g * 0.7);
                inkData[i + 2] = Math.min(255, b * boost);
                inkData[i + 3] = Math.min(255, 200 + saturation * 55);
            }
        } else {
            // Make dark areas transparent
            inkData[i + 3] = 0;
        }
    }
    
    // Put the processed ink data
    inkCtx.putImageData(inkImageData, 0, 0);
    
    // Clear and draw on main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply glow effect
    if (enhancedSettings.glow > 0) {
        ctx.shadowBlur = enhancedSettings.glow;
        ctx.shadowColor = isGreen ? '#00ff00' : '#0096ff';
    }
    
    // Calculate proper scaling to match video display
    const scaleX = canvas.width / hiddenCanvas.width;
    const scaleY = canvas.height / hiddenCanvas.height;
    
    // Draw the processed ink overlay
    ctx.save();
    
    // Apply mirror if needed
    if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(inkCanvas, 0, 0);
    ctx.restore();
}

// Export functions
window.startCalibration = startCalibration;
window.updateDetectionMode = updateDetectionMode;
window.updateLuminance = updateLuminance;
window.processEnhancedFrameFixed = processEnhancedFrameFixed;