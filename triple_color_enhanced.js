// Triple Color Enhanced Mode - Green, Blue, AND Pink detection with fixed z-index

(function() {
    // Wait for DOM and video to be ready
    function initTripleColorMode() {
        if (!window.videoElement || !document.getElementById('enhancedCanvas')) {
            setTimeout(initTripleColorMode, 500);
            return;
        }
        
        console.log('Initializing triple-color enhanced mode (Green, Blue, Pink)...');
        
        // Initialize or update settings
        if (!window.enhancedSettings) {
            window.enhancedSettings = {};
        }
        
        // Triple color calibration data
        enhancedSettings.greenCalibration = { r: 0, g: 180, b: 50, active: true };
        enhancedSettings.blueCalibration = { r: 50, g: 50, b: 180, active: true };
        enhancedSettings.pinkCalibration = { r: 180, g: 50, b: 120, active: true }; // New pink
        enhancedSettings.tolerance = 70;
        enhancedSettings.pinkTolerance = 90; // Higher tolerance for pink since it's dimmer
        enhancedSettings.brightness = enhancedSettings.brightness || 1.5;
        enhancedSettings.glow = enhancedSettings.glow || 10;
        
        // Fix z-index for UI elements to be supreme
        function fixUIZIndex() {
            // Dock should be highest
            const dock = document.getElementById('dockContainer');
            if (dock) dock.style.zIndex = '10010';
            
            // Settings panel
            const settings = document.getElementById('settingsPanel');
            if (settings) settings.style.zIndex = '10011';
            
            // Enhanced settings
            const enhancedSettings = document.getElementById('enhancedSettings');
            if (enhancedSettings) enhancedSettings.style.zIndex = '10012';
            
            // Any calibration UI
            const calibrationBanner = document.getElementById('calibrationBanner');
            if (calibrationBanner) calibrationBanner.style.zIndex = '10013';
            
            // Enhanced overlay should be below UI but above content
            const enhancedOverlay = document.getElementById('enhancedOverlay');
            if (enhancedOverlay) enhancedOverlay.style.zIndex = '9999';
        }
        
        // Call on init and whenever UI changes
        fixUIZIndex();
        setInterval(fixUIZIndex, 1000); // Keep checking
        
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
            
            // Ensure canvas z-index is below UI
            canvas.style.zIndex = '9999';
            
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
            const pinkCal = enhancedSettings.pinkCalibration;
            const tolerance = enhancedSettings.tolerance;
            const pinkTolerance = enhancedSettings.pinkTolerance;
            
            // Process each pixel for THREE colors
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                let isGreen = false;
                let isBlue = false;
                let isPink = false;
                
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
                
                // Check pink if active (more lenient since pink is dimmer)
                if (pinkCal.active) {
                    const pinkDist = Math.sqrt(
                        Math.pow(r - pinkCal.r, 2) +
                        Math.pow(g - pinkCal.g, 2) +
                        Math.pow(b - pinkCal.b, 2)
                    );
                    
                    // Pink is red + blue, so check for that combination
                    // More lenient checks for pink
                    if (pinkDist < pinkTolerance) {
                        // Pink should have significant red
                        if (r > 100 && r > g * 1.2) {
                            // And some blue component
                            if (b > g) {
                                isPink = true;
                                // Make sure it's not pure red or pure blue
                                if (r > b * 2 || b > r * 2) {
                                    isPink = false;
                                }
                            }
                        }
                    }
                }
                
                // Render colors (pink takes precedence if detected since it's hardest)
                if (isPink) {
                    // Pink/Magenta color
                    inkData[i] = Math.min(255, r * enhancedSettings.brightness);
                    inkData[i + 1] = Math.min(255, g * 0.3);
                    inkData[i + 2] = Math.min(255, b * enhancedSettings.brightness);
                    inkData[i + 3] = 200;
                } else if (isGreen) {
                    // Pure green
                    inkData[i] = 0;
                    inkData[i + 1] = Math.min(255, g * enhancedSettings.brightness);
                    inkData[i + 2] = 0;
                    inkData[i + 3] = 220;
                } else if (isBlue) {
                    // Pure blue
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
                // Cycle through colors for multi-color glow
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
        
        // Calibration function for all three colors
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
            
            let bgColor = '#059669'; // green
            if (colorName === 'blue') bgColor = '#2563eb';
            if (colorName === 'pink') bgColor = '#ec4899';
            
            banner.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: ${bgColor};
                color: white;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10015;
                pointer-events: none;
            `;
            banner.textContent = `Click on ${colorName} ink to calibrate (ESC to cancel)`;
            document.body.appendChild(banner);
            
            // Enable canvas clicking
            const canvas = document.getElementById('enhancedCanvas');
            canvas.style.pointerEvents = 'auto';
            canvas.style.cursor = 'crosshair';
            canvas.style.zIndex = '10014';
            
            // Click handler
            function handleClick(e) {
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) * (hiddenCanvas.width / rect.width));
                const y = Math.floor((e.clientY - rect.top) * (hiddenCanvas.height / rect.height));
                
                // Sample a small region for better accuracy
                let rSum = 0, gSum = 0, bSum = 0, samples = 0;
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        const sx = Math.max(0, Math.min(hiddenCanvas.width - 1, x + dx));
                        const sy = Math.max(0, Math.min(hiddenCanvas.height - 1, y + dy));
                        const pixel = hiddenCtx.getImageData(sx, sy, 1, 1).data;
                        rSum += pixel[0];
                        gSum += pixel[1];
                        bSum += pixel[2];
                        samples++;
                    }
                }
                
                const avgR = Math.floor(rSum / samples);
                const avgG = Math.floor(gSum / samples);
                const avgB = Math.floor(bSum / samples);
                
                // Store calibration
                if (colorName === 'green') {
                    enhancedSettings.greenCalibration = {
                        r: avgR, g: avgG, b: avgB, active: true
                    };
                } else if (colorName === 'blue') {
                    enhancedSettings.blueCalibration = {
                        r: avgR, g: avgG, b: avgB, active: true
                    };
                } else if (colorName === 'pink') {
                    enhancedSettings.pinkCalibration = {
                        r: avgR, g: avgG, b: avgB, active: true
                    };
                }
                
                console.log(`Calibrated ${colorName}:`, avgR, avgG, avgB);
                
                // Cleanup
                canvas.style.pointerEvents = 'none';
                canvas.style.cursor = 'default';
                canvas.style.zIndex = '9999';
                enhancedSettings.calibrating = false;
                
                // Success message
                banner.style.background = '#059669';
                banner.textContent = `✓ ${colorName} calibrated: RGB(${avgR}, ${avgG}, ${avgB})`;
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
                    canvas.style.zIndex = '9999';
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
                const pink = enhancedSettings.pinkCalibration;
                display.innerHTML = `
                    <div style="color: #10b981;">Green: RGB(${green.r}, ${green.g}, ${green.b})</div>
                    <div style="color: #3b82f6;">Blue: RGB(${blue.r}, ${blue.g}, ${blue.b})</div>
                    <div style="color: #ec4899;">Pink: RGB(${pink.r}, ${pink.g}, ${pink.b})</div>
                `;
            }
        }
        
        // Add calibration UI to settings panel with THREE colors
        function addTripleColorUI() {
            const settings = document.getElementById('enhancedSettings');
            if (!settings || document.getElementById('tripleColorControls')) return;
            
            const controls = document.createElement('div');
            controls.id = 'tripleColorControls';
            controls.className = 'mb-4 p-3 bg-gray-800 rounded-lg';
            controls.style.zIndex = '10012';
            controls.innerHTML = `
                <div class="text-white font-bold mb-3">Triple Color Calibration</div>
                <div class="flex gap-2 mb-2">
                    <button onclick="calibrateColor('green')" 
                            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
                        Green
                    </button>
                    <button onclick="calibrateColor('blue')"
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                        Blue
                    </button>
                    <button onclick="calibrateColor('pink')"
                            class="flex-1 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded transition">
                        Pink
                    </button>
                </div>
                <div id="calibrationDisplay" class="text-xs text-gray-400">
                    <div style="color: #10b981;">Green: Not calibrated</div>
                    <div style="color: #3b82f6;">Blue: Not calibrated</div>
                    <div style="color: #ec4899;">Pink: Not calibrated</div>
                </div>
                <div class="mt-3">
                    <label class="text-gray-300 text-sm">Tolerance: <span id="toleranceVal">${enhancedSettings.tolerance}</span></label>
                    <input type="range" min="30" max="120" value="${enhancedSettings.tolerance}"
                           oninput="enhancedSettings.tolerance = this.value; document.getElementById('toleranceVal').textContent = this.value;"
                           class="w-full mt-1">
                </div>
                <div class="mt-2">
                    <label class="text-gray-300 text-sm">Pink Tolerance: <span id="pinkToleranceVal">${enhancedSettings.pinkTolerance}</span></label>
                    <input type="range" min="50" max="150" value="${enhancedSettings.pinkTolerance}"
                           oninput="enhancedSettings.pinkTolerance = this.value; document.getElementById('pinkToleranceVal').textContent = this.value;"
                           class="w-full mt-1">
                </div>
            `;
            
            // Remove old dual controls if they exist
            const oldControls = document.getElementById('dualColorControls');
            if (oldControls) oldControls.remove();
            
            settings.insertBefore(controls, settings.firstChild.nextSibling);
            updateCalibrationDisplay();
        }
        
        // Initialize UI after delay
        setTimeout(addTripleColorUI, 2000);
        
        console.log('Triple-color enhanced mode ready! (Green, Blue, Pink)');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTripleColorMode);
    } else {
        initTripleColorMode();
    }
})();