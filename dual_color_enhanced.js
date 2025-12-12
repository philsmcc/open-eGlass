// Dual Color Enhanced Mode - Detect both green AND blue simultaneously with working calibration

document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced settings for dual color support
    if (!window.enhancedSettings) {
        window.enhancedSettings = {};
    }
    
    // Dual color thresholds
    enhancedSettings.greenThreshold = { r: 0, g: 150, b: 0, tolerance: 50 };
    enhancedSettings.blueThreshold = { r: 0, g: 0, b: 150, tolerance: 50 };
    enhancedSettings.calibratingColor = null; // 'green' or 'blue' during calibration
    
    // Override calibration to actually work
    window.startCalibration = function(colorToCalibrate) {
        // Default to green if not specified
        colorToCalibrate = colorToCalibrate || 'green';
        enhancedSettings.calibratingColor = colorToCalibrate;
        enhancedSettings.calibrating = true;
        
        console.log('Starting calibration for', colorToCalibrate);
        
        // Remove any existing instruction
        const existingInstruction = document.getElementById('calibrationInstruction');
        if (existingInstruction) {
            existingInstruction.remove();
        }
        
        // Show instruction
        const instruction = document.createElement('div');
        instruction.id = 'calibrationInstruction';
        instruction.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: rgba(17, 24, 39, 0.95);
            border: 2px solid ${colorToCalibrate === 'green' ? '#10b981' : '#0096ff'};
            border-radius: 10px;
            color: white;
            font-size: 16px;
            z-index: 10003;
            pointer-events: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        instruction.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-crosshairs" style="color: ${colorToCalibrate === 'green' ? '#10b981' : '#0096ff'}; font-size: 24px;"></i>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Calibrating ${colorToCalibrate.toUpperCase()} ink</div>
                    <div style="font-size: 14px; color: #9ca3af;">Click on ${colorToCalibrate} glowing ink</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">ESC to cancel</div>
                </div>
            </div>
        `;
        document.body.appendChild(instruction);
        
        // Make canvas clickable
        const canvas = document.getElementById('enhancedCanvas');
        const oldPointerEvents = canvas.style.pointerEvents;
        const oldZIndex = canvas.style.zIndex;
        const oldCursor = canvas.style.cursor;
        
        canvas.style.cursor = 'crosshair';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '10002';
        
        // Calibration click handler
        function handleCalibrationClick(e) {
            console.log('Calibration click detected');
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = hiddenCanvas.width / rect.width;
            const scaleY = hiddenCanvas.height / rect.height;
            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);
            
            console.log('Sampling at', x, y);
            
            // Sample a region for better accuracy
            let rSum = 0, gSum = 0, bSum = 0;
            let rMax = 0, gMax = 0, bMax = 0;
            let samples = 0;
            
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    const sx = Math.max(0, Math.min(hiddenCanvas.width - 1, x + dx));
                    const sy = Math.max(0, Math.min(hiddenCanvas.height - 1, y + dy));
                    const pixel = hiddenCtx.getImageData(sx, sy, 1, 1).data;
                    
                    rSum += pixel[0];
                    gSum += pixel[1];
                    bSum += pixel[2];
                    rMax = Math.max(rMax, pixel[0]);
                    gMax = Math.max(gMax, pixel[1]);
                    bMax = Math.max(bMax, pixel[2]);
                    samples++;
                }
            }
            
            const avgR = Math.floor(rSum / samples);
            const avgG = Math.floor(gSum / samples);
            const avgB = Math.floor(bSum / samples);
            
            console.log('Sampled color (avg):', avgR, avgG, avgB);
            console.log('Sampled color (max):', rMax, gMax, bMax);
            
            // Set threshold for the calibrated color
            if (enhancedSettings.calibratingColor === 'green') {
                enhancedSettings.greenThreshold = {
                    r: avgR,
                    g: avgG,
                    b: avgB,
                    tolerance: 60
                };
                console.log('Set green threshold:', enhancedSettings.greenThreshold);
            } else {
                enhancedSettings.blueThreshold = {
                    r: avgR,
                    g: avgG,
                    b: avgB,
                    tolerance: 60
                };
                console.log('Set blue threshold:', enhancedSettings.blueThreshold);
            }
            
            // Cleanup
            canvas.style.cursor = oldCursor;
            canvas.style.pointerEvents = oldPointerEvents;
            canvas.style.zIndex = oldZIndex;
            enhancedSettings.calibrating = false;
            enhancedSettings.calibratingColor = null;
            
            // Success message
            instruction.style.background = 'rgba(5, 150, 105, 0.95)';
            instruction.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-check-circle" style="color: white; font-size: 24px;"></i>
                    <div>
                        <div style="font-weight: bold;">Calibration Complete!</div>
                        <div style="font-size: 14px;">RGB: (${avgR}, ${avgG}, ${avgB})</div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                if (instruction.parentNode) {
                    instruction.remove();
                }
            }, 3000);
            
            // Update any UI elements
            updateCalibrationUI();
        }
        
        // Add click listener
        canvas.addEventListener('click', handleCalibrationClick, { once: true });
        
        // ESC handler
        function handleEscape(e) {
            if (e.key === 'Escape') {
                canvas.removeEventListener('click', handleCalibrationClick);
                canvas.style.cursor = oldCursor;
                canvas.style.pointerEvents = oldPointerEvents;
                canvas.style.zIndex = oldZIndex;
                enhancedSettings.calibrating = false;
                enhancedSettings.calibratingColor = null;
                if (instruction.parentNode) {
                    instruction.remove();
                }
            }
        }
        document.addEventListener('keydown', handleEscape, { once: true });
    };
    
    // Process frame with DUAL color detection
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
        
        // Get thresholds
        const greenT = enhancedSettings.greenThreshold;
        const blueT = enhancedSettings.blueThreshold;
        
        // Process each pixel for BOTH colors
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if pixel matches GREEN threshold
            const greenDist = Math.sqrt(
                Math.pow(r - greenT.r, 2) +
                Math.pow(g - greenT.g, 2) +
                Math.pow(b - greenT.b, 2)
            );
            
            // Check if pixel matches BLUE threshold
            const blueDist = Math.sqrt(
                Math.pow(r - blueT.r, 2) +
                Math.pow(g - blueT.g, 2) +
                Math.pow(b - blueT.b, 2)
            );
            
            let isGreenInk = false;
            let isBlueInk = false;
            
            // Check green with additional constraints
            if (greenDist < greenT.tolerance) {
                // Must be greenish
                if (g > r && g > b) {
                    isGreenInk = true;
                }
            }
            
            // Check blue with additional constraints
            if (blueDist < blueT.tolerance) {
                // Must be blueish
                if (b > r && b > g * 0.9) {
                    isBlueInk = true;
                }
            }
            
            // Reject white/gray (both would match)
            if (isGreenInk && isBlueInk) {
                const maxChannel = Math.max(r, g, b);
                const minChannel = Math.min(r, g, b);
                const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;
                
                if (saturation < 0.3) {
                    isGreenInk = false;
                    isBlueInk = false;
                }
            }
            
            // Render the appropriate color
            if (isGreenInk) {
                // Pure green
                inkData[i] = 0;
                inkData[i + 1] = Math.min(255, g * enhancedSettings.brightness);
                inkData[i + 2] = 0;
                inkData[i + 3] = 220;
            } else if (isBlueInk) {
                // Pure blue
                inkData[i] = 0;
                inkData[i + 1] = 0;
                inkData[i + 2] = Math.min(255, b * enhancedSettings.brightness);
                inkData[i + 3] = 220;
            } else {
                inkData[i + 3] = 0; // Transparent
            }
        }
        
        // Put processed data
        inkCtx.putImageData(inkImageData, 0, 0);
        
        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dual glow effect (green and blue)
        if (enhancedSettings.glow > 0) {
            // Draw with green glow
            ctx.shadowBlur = enhancedSettings.glow;
            ctx.shadowColor = '#00ff00';
            ctx.globalAlpha = 0.5;
            
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
            
            // Draw with blue glow
            ctx.shadowColor = '#0099ff';
            ctx.globalAlpha = 1;
            
            ctx.save();
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(inkCanvas, 0, 0);
            ctx.restore();
        } else {
            // No glow
            ctx.shadowBlur = 0;
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
        }
    };
    
    // Add UI for dual color calibration
    function updateCalibrationUI() {
        const settingsPanel = document.getElementById('enhancedSettings');
        if (!settingsPanel) return;
        
        // Check if dual calibration buttons exist
        if (!document.getElementById('calibrateGreenBtn')) {
            // Create container for calibration buttons
            const calibrationDiv = document.createElement('div');
            calibrationDiv.className = 'mb-4';
            calibrationDiv.innerHTML = `
                <div class="text-gray-300 text-sm mb-2">Calibrate Colors:</div>
                <div class="flex gap-2">
                    <button id="calibrateGreenBtn" onclick="startCalibration('green')" 
                            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300">
                        <i class="fas fa-crosshairs mr-1"></i>
                        Green
                    </button>
                    <button id="calibrateBlueBtn" onclick="startCalibration('blue')"
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300">
                        <i class="fas fa-crosshairs mr-1"></i>
                        Blue
                    </button>
                </div>
                <div id="calibrationStatus" class="mt-2 text-xs text-gray-400">
                    <div>Green: RGB(${enhancedSettings.greenThreshold.r}, ${enhancedSettings.greenThreshold.g}, ${enhancedSettings.greenThreshold.b})</div>
                    <div>Blue: RGB(${enhancedSettings.blueThreshold.r}, ${enhancedSettings.blueThreshold.g}, ${enhancedSettings.blueThreshold.b})</div>
                </div>
            `;
            
            // Insert at the beginning of settings
            settingsPanel.insertBefore(calibrationDiv, settingsPanel.firstChild.nextSibling);
        } else {
            // Update status display
            const status = document.getElementById('calibrationStatus');
            if (status) {
                status.innerHTML = `
                    <div>Green: RGB(${enhancedSettings.greenThreshold.r}, ${enhancedSettings.greenThreshold.g}, ${enhancedSettings.greenThreshold.b})</div>
                    <div>Blue: RGB(${enhancedSettings.blueThreshold.r}, ${enhancedSettings.blueThreshold.g}, ${enhancedSettings.blueThreshold.b})</div>
                `;
            }
        }
    }
    
    // Initialize UI after a delay
    setTimeout(updateCalibrationUI, 1500);
    
    console.log('Dual color enhanced mode loaded');
});
</script>