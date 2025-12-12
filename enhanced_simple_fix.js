// Enhanced Mode - Simplified UV marker detection and working calibration

document.addEventListener('DOMContentLoaded', function() {
    
    // Working calibration without blocking overlay
    window.startCalibration = function() {
        enhancedSettings.calibrating = true;
        
        // Show instruction without blocking
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
                <i class="fas fa-crosshairs" style="color: #0061ef; font-size: 24px;"></i>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">Calibration Mode Active</div>
                    <div style="font-size: 14px; color: #9ca3af;">Click on the glowing ink to calibrate</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Press ESC to cancel</div>
                </div>
            </div>
        `;
        document.body.appendChild(instruction);
        
        // Change canvas cursor
        const canvas = document.getElementById('enhancedCanvas');
        canvas.style.cursor = 'crosshair';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '10002';
        
        // Add click handler directly to canvas
        const calibrationHandler = function(e) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
            const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
            
            // Sample the clicked area
            const pixel = hiddenCtx.getImageData(x, y, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            // For UV markers, they're usually VERY bright in one channel
            // Set threshold to catch similar brightness
            const maxChannel = Math.max(r, g, b);
            enhancedSettings.luminanceThreshold = maxChannel * 0.7; // 70% of clicked brightness
            
            // Detect which color is dominant
            if (g > b * 1.2) {
                enhancedSettings.inkColor = 'green';
            } else if (b > g * 1.2) {
                enhancedSettings.inkColor = 'blue';
            } else {
                // Default based on which is higher
                enhancedSettings.inkColor = g > b ? 'green' : 'blue';
            }
            
            // Update UI
            if (document.getElementById('luminanceSlider')) {
                document.getElementById('luminanceSlider').value = enhancedSettings.luminanceThreshold;
                document.getElementById('luminanceValue').textContent = Math.round(enhancedSettings.luminanceThreshold);
            }
            updateColorUI(enhancedSettings.inkColor);
            
            // Clean up
            canvas.removeEventListener('click', calibrationHandler);
            canvas.style.cursor = 'default';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '';
            enhancedSettings.calibrating = false;
            
            // Update instruction to show success
            instruction.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 24px;"></i>
                    <div>
                        <div style="font-weight: bold; color: #10b981;">Calibration Complete!</div>
                        <div style="font-size: 14px; color: #9ca3af;">Detecting ${enhancedSettings.inkColor} ink (threshold: ${Math.round(enhancedSettings.luminanceThreshold)})</div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                if (instruction.parentNode) {
                    document.body.removeChild(instruction);
                }
            }, 3000);
        };
        
        canvas.addEventListener('click', calibrationHandler);
        
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
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };
    
    // Simplified UV marker detection
    window.processEnhancedFrame = function(canvas, ctx) {
        // Fix canvas positioning
        const videoRect = videoElement.getBoundingClientRect();
        canvas.style.position = 'fixed';
        canvas.style.left = videoRect.left + 'px';
        canvas.style.top = videoRect.top + 'px';
        canvas.style.width = videoRect.width + 'px';
        canvas.style.height = videoRect.height + 'px';
        
        // Don't change pointer events unless calibrating
        if (!enhancedSettings.calibrating) {
            canvas.style.pointerEvents = 'none';
        }
        
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
        
        // SIMPLIFIED DETECTION - UV markers are bright and distinct
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            let isInk = false;
            
            if (isGreen) {
                // UV Green: Very bright green channel
                // Simple check: green is bright AND dominant
                isInk = g > threshold && g > r * 1.3 && g > b * 1.1;
            } else {
                // UV Blue: Very bright blue channel
                // Simple check: blue is bright AND dominant
                isInk = b > threshold && b > r * 1.3 && b > g * 1.1;
            }
            
            if (isInk) {
                // Keep the UV marker color with enhancement
                const boost = enhancedSettings.brightness;
                
                if (isGreen) {
                    // Pure bright green for UV green
                    inkData[i] = 0;
                    inkData[i + 1] = Math.min(255, g * boost);
                    inkData[i + 2] = Math.min(255, b * 0.5);
                    inkData[i + 3] = Math.min(255, 200 + (g - threshold) * 0.5);
                } else {
                    // Pure bright blue for UV blue
                    inkData[i] = 0;
                    inkData[i + 1] = Math.min(255, g * 0.5);
                    inkData[i + 2] = Math.min(255, b * boost);
                    inkData[i + 3] = Math.min(255, 200 + (b - threshold) * 0.5);
                }
            } else {
                inkData[i + 3] = 0; // Transparent
            }
        }
        
        // Optional: Simple erosion to remove noise
        // This removes single isolated pixels
        if (enhancedSettings.removeNoise !== false) {
            for (let y = 1; y < hiddenCanvas.height - 1; y++) {
                for (let x = 1; x < hiddenCanvas.width - 1; x++) {
                    const idx = (y * hiddenCanvas.width + x) * 4 + 3;
                    
                    if (inkData[idx] > 0) {
                        // Check if this pixel is isolated
                        const neighbors = [
                            inkData[((y-1) * hiddenCanvas.width + x) * 4 + 3],     // top
                            inkData[((y+1) * hiddenCanvas.width + x) * 4 + 3],     // bottom
                            inkData[(y * hiddenCanvas.width + (x-1)) * 4 + 3],     // left
                            inkData[(y * hiddenCanvas.width + (x+1)) * 4 + 3]      // right
                        ];
                        
                        const filledNeighbors = neighbors.filter(n => n > 0).length;
                        if (filledNeighbors < 2) {
                            // Isolated pixel - remove it
                            inkData[idx] = 0;
                        }
                    }
                }
            }
        }
        
        // Put processed data
        inkCtx.putImageData(inkImageData, 0, 0);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply glow effect for UV look
        if (enhancedSettings.glow > 0) {
            ctx.shadowBlur = enhancedSettings.glow;
            ctx.shadowColor = isGreen ? '#00ff00' : '#00aaff';
            
            // Double draw for stronger glow
            ctx.globalAlpha = 0.5;
            const scale = canvas.width / hiddenCanvas.width;
            ctx.save();
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.scale(scale, canvas.height / hiddenCanvas.height);
            ctx.drawImage(inkCanvas, 0, 0);
            ctx.restore();
        }
        
        // Draw main image
        ctx.globalAlpha = 1;
        ctx.shadowBlur = enhancedSettings.glow * 0.5;
        
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
    
    // Add a simple preset button for UV markers
    setTimeout(() => {
        const settingsPanel = document.getElementById('enhancedSettings');
        if (settingsPanel && !document.getElementById('uvPresetBtn')) {
            const presetBtn = document.createElement('button');
            presetBtn.id = 'uvPresetBtn';
            presetBtn.className = 'w-full px-3 py-2 mb-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300';
            presetBtn.innerHTML = '<i class="fas fa-lightbulb mr-2"></i>UV Marker Preset';
            presetBtn.onclick = function() {
                // Optimal settings for UV markers
                enhancedSettings.luminanceThreshold = 120;
                enhancedSettings.brightness = 1.8;
                enhancedSettings.glow = 15;
                
                // Update UI
                if (document.getElementById('luminanceSlider')) {
                    document.getElementById('luminanceSlider').value = 120;
                    document.getElementById('luminanceValue').textContent = '120';
                }
                if (document.getElementById('brightnessSlider')) {
                    document.getElementById('brightnessSlider').value = 18;
                    document.getElementById('brightnessValue').textContent = '1.8x';
                }
                if (document.getElementById('glowSlider')) {
                    document.getElementById('glowSlider').value = 15;
                    document.getElementById('glowValue').textContent = '15px';
                }
                
                // Show confirmation
                const msg = document.createElement('div');
                msg.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); padding: 10px 20px; background: #7c3aed; color: white; border-radius: 8px; z-index: 10005;';
                msg.textContent = 'UV Marker settings applied!';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 2000);
            };
            
            // Find calibrate button and insert after it
            const calibrateBtn = settingsPanel.querySelector('button');
            if (calibrateBtn) {
                calibrateBtn.parentNode.insertBefore(presetBtn, calibrateBtn.nextSibling);
            }
        }
    }, 1500);
});
</script>