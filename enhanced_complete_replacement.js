// Complete Enhanced Mode Replacement - Dual Color with Working Calibration
// This script completely replaces the existing enhanced mode functionality

(function() {
    // Wait for DOM and video to be ready
    function initEnhancedMode() {
        if (!window.videoElement || !document.getElementById('enhancedCanvas')) {
            setTimeout(initEnhancedMode, 500);
            return;
        }
        
        console.log('Initializing dual-color enhanced mode...');
        
        // Initialize or update settings
        if (!window.enhancedSettings) {
            window.enhancedSettings = {};
        }
        
        // Dual color calibration data
        enhancedSettings.greenCalibration = { r: 0, g: 180, b: 50, active: true };
        enhancedSettings.blueCalibration = { r: 50, g: 50, b: 180, active: true };
        enhancedSettings.tolerance = 70;
        enhancedSettings.brightness = enhancedSettings.brightness || 1.5;
        enhancedSettings.glow = enhancedSettings.glow || 10;
        
        // Replace the processEnhancedFrame function
        window.processEnhancedFrame = function(canvas, ctx) {
            // Fix canvas positioning to match video
            const videoRect = videoElement.getBoundingClientRect();
            canvas.style.position = 'fixed';
            canvas.style.left = videoRect.left + 'px';
            canvas.style.top = videoRect.top + 'px';
            canvas.style.width = videoRect.width + 'px';
            canvas.style.height = videoRect.height + 'px';
            canvas.width = videoRect.width;
            canvas.height = videoRect.height;
            
            // Keep pointer-events only during calibration
            if (!enhancedSettings.calibrating) {
                canvas.style.pointerEvents = 'none';
            }
            
            // Capture video frame
            if (!window.hiddenCanvas) {
                window.hiddenCanvas = document.createElement('canvas');
                window.hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
            }
            
            hiddenCanvas.width = videoElement.videoWidth;
            hiddenCanvas.height = videoElement.videoHeight;
            hiddenCtx.drawImage(videoElement, 0, 0);
            
            // Process pixels
            const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            const data = imageData.data;
            
            // Output canvas
            const inkCanvas = document.createElement('canvas');
            inkCanvas.width = hiddenCanvas.width;
            inkCanvas.height = hiddenCanvas.height;
            const inkCtx = inkCanvas.getContext('2d');
            const inkImageData = inkCtx.createImageData(hiddenCanvas.width, hiddenCanvas.height);
            const inkData = inkImageData.data;
            
            const greenCal = enhancedSettings.greenCalibration;
            const blueCal = enhancedSettings.blueCalibration;
            const tolerance = enhancedSettings.tolerance;
            
            // Process each pixel for BOTH colors
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                let isGreen = false;
                let isBlue = false;
                
                // Check green if active
                if (greenCal.active) {
                    const greenDist = Math.sqrt(
                        Math.pow(r - greenCal.r, 2) +
                        Math.pow(g - greenCal.g, 2) +
                        Math.pow(b - greenCal.b, 2)
                    );
                    
                    if (greenDist < tolerance && g > r && g > b) {
                        isGreen = true;
                    }
                }
                
                // Check blue if active
                if (blueCal.active) {
                    const blueDist = Math.sqrt(
                        Math.pow(r - blueCal.r, 2) +
                        Math.pow(g - blueCal.g, 2) +
                        Math.pow(b - blueCal.b, 2)
                    );
                    
                    if (blueDist < tolerance && b > r && b > g * 0.8) {
                        isBlue = true;
                    }
                }
                
                // Render colors
                if (isGreen) {
                    inkData[i] = 0;
                    inkData[i + 1] = Math.min(255, g * enhancedSettings.brightness);
                    inkData[i + 2] = 0;
                    inkData[i + 3] = 220;
                } else if (isBlue) {
                    inkData[i] = 0;
                    inkData[i + 1] = 0;
                    inkData[i + 2] = Math.min(255, b * enhancedSettings.brightness);
                    inkData[i + 3] = 220;
                } else {
                    inkData[i + 3] = 0;
                }
            }
            
            // Apply to canvas
            inkCtx.putImageData(inkImageData, 0, 0);
            
            // Draw with effects
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (enhancedSettings.glow > 0) {
                ctx.shadowBlur = enhancedSettings.glow;
                ctx.shadowColor = '#00ffaa';
            }
            
            const scaleX = canvas.width / hiddenCanvas.width;
            const scaleY = canvas.height / hiddenCanvas.height;
            
            ctx.save();
            if (window.isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(inkCanvas, 0, 0);
            ctx.restore();
        };
        
        // Calibration function
        window.calibrateColor = function(colorName) {
            console.log('Starting calibration for', colorName);
            enhancedSettings.calibrating = true;
            enhancedSettings.calibratingColor = colorName;
            
            // Remove any existing banner
            const oldBanner = document.getElementById('calibrationBanner');
            if (oldBanner) oldBanner.remove();
            
            // Show instruction banner
            const banner = document.createElement('div');
            banner.id = 'calibrationBanner';
            banner.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: ${colorName === 'green' ? '#059669' : '#2563eb'};
                color: white;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10005;
                pointer-events: none;
            `;
            banner.textContent = `Click on ${colorName} ink to calibrate (ESC to cancel)`;
            document.body.appendChild(banner);
            
            // Enable canvas clicking
            const canvas = document.getElementById('enhancedCanvas');
            canvas.style.pointerEvents = 'auto';
            canvas.style.cursor = 'crosshair';
            canvas.style.zIndex = '10004';
            
            // Click handler
            function handleClick(e) {
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
                const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
                
                // Sample color
                const pixel = hiddenCtx.getImageData(x, y, 1, 1).data;
                
                // Store calibration
                if (colorName === 'green') {
                    enhancedSettings.greenCalibration = {
                        r: pixel[0],
                        g: pixel[1],
                        b: pixel[2],
                        active: true
                    };
                } else {
                    enhancedSettings.blueCalibration = {
                        r: pixel[0],
                        g: pixel[1],
                        b: pixel[2],
                        active: true
                    };
                }
                
                console.log(`Calibrated ${colorName}:`, pixel[0], pixel[1], pixel[2]);
                
                // Cleanup
                canvas.style.pointerEvents = 'none';
                canvas.style.cursor = 'default';
                canvas.style.zIndex = '';
                enhancedSettings.calibrating = false;
                
                // Success message
                banner.style.background = '#059669';
                banner.textContent = `✓ ${colorName} calibrated: RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                setTimeout(() => banner.remove(), 3000);
                
                // Update UI
                updateCalibrationDisplay();
            }
            
            canvas.addEventListener('click', handleClick, { once: true });
            
            // ESC handler
            function handleEsc(e) {
                if (e.key === 'Escape') {
                    canvas.removeEventListener('click', handleClick);
                    canvas.style.pointerEvents = 'none';
                    canvas.style.cursor = 'default';
                    canvas.style.zIndex = '';
                    enhancedSettings.calibrating = false;
                    banner.remove();
                }
            }
            document.addEventListener('keydown', handleEsc, { once: true });
        };
        
        // Update UI function
        function updateCalibrationDisplay() {
            const display = document.getElementById('calibrationDisplay');
            if (display) {
                const green = enhancedSettings.greenCalibration;
                const blue = enhancedSettings.blueCalibration;
                display.innerHTML = `
                    <div style="color: #10b981;">Green: RGB(${green.r}, ${green.g}, ${green.b})</div>
                    <div style="color: #3b82f6;">Blue: RGB(${blue.r}, ${blue.g}, ${blue.b})</div>
                `;
            }
        }
        
        // Add calibration UI to settings panel
        function addCalibrationUI() {
            const settings = document.getElementById('enhancedSettings');
            if (!settings || document.getElementById('dualColorControls')) return;
            
            const controls = document.createElement('div');
            controls.id = 'dualColorControls';
            controls.className = 'mb-4 p-3 bg-gray-800 rounded-lg';
            controls.innerHTML = `
                <div class="text-white font-bold mb-3">Dual Color Calibration</div>
                <div class="flex gap-2 mb-2">
                    <button onclick="calibrateColor('green')" 
                            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
                        Calibrate Green
                    </button>
                    <button onclick="calibrateColor('blue')"
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                        Calibrate Blue
                    </button>
                </div>
                <div id="calibrationDisplay" class="text-xs text-gray-400">
                    <div style="color: #10b981;">Green: Not calibrated</div>
                    <div style="color: #3b82f6;">Blue: Not calibrated</div>
                </div>
                <div class="mt-3">
                    <label class="text-gray-300 text-sm">Tolerance: <span id="toleranceVal">${enhancedSettings.tolerance}</span></label>
                    <input type="range" min="30" max="120" value="${enhancedSettings.tolerance}"
                           oninput="enhancedSettings.tolerance = this.value; document.getElementById('toleranceVal').textContent = this.value;"
                           class="w-full mt-1">
                </div>
            `;
            
            settings.insertBefore(controls, settings.firstChild.nextSibling);
            updateCalibrationDisplay();
        }
        
        // Initialize UI after delay
        setTimeout(addCalibrationUI, 2000);
        
        console.log('Dual-color enhanced mode ready!');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedMode);
    } else {
        initEnhancedMode();
    }
})();