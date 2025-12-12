// To enable OpenCV.js processing instead of pure JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Wait for OpenCV to load
    function checkOpenCV() {
        if (typeof cv !== 'undefined') {
            console.log('OpenCV.js loaded, enabling OpenCV processing');
            
            // Override with OpenCV version
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
                
                // Use OpenCV for processing
                let src = cv.imread(hiddenCanvas);
                let hsv = new cv.Mat();
                let mask = new cv.Mat();
                let result = new cv.Mat();
                
                try {
                    // Convert to HSV
                    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
                    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
                    
                    // Define color ranges for UV ink
                    const isGreen = enhancedSettings.inkColor === 'green';
                    const threshold = enhancedSettings.luminanceThreshold || 100;
                    
                    let lower, upper;
                    if (isGreen) {
                        // Green UV: H:40-80, S:30-255, V:threshold-255
                        lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [40, 30, threshold, 0]);
                        upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [80, 255, 255, 255]);
                    } else {
                        // Blue UV: H:90-130, S:30-255, V:threshold-255
                        lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [90, 30, threshold, 0]);
                        upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [130, 255, 255, 255]);
                    }
                    
                    // Create mask
                    cv.inRange(hsv, lower, upper, mask);
                    
                    // Morphological operations to clean up
                    let kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
                    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
                    cv.dilate(mask, mask, kernel);
                    
                    // Apply mask
                    src.copyTo(result, mask);
                    
                    // Draw result
                    const tempCanvas = document.createElement('canvas');
                    cv.imshow(tempCanvas, result);
                    
                    // Clear and draw with glow
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    if (enhancedSettings.glow > 0) {
                        ctx.shadowBlur = enhancedSettings.glow;
                        ctx.shadowColor = isGreen ? '#00ff00' : '#0088ff';
                    }
                    
                    const scaleX = canvas.width / tempCanvas.width;
                    const scaleY = canvas.height / tempCanvas.height;
                    
                    ctx.save();
                    if (isMirrored) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    ctx.scale(scaleX, scaleY);
                    ctx.globalAlpha = enhancedSettings.brightness / 1.5;
                    ctx.drawImage(tempCanvas, 0, 0);
                    ctx.restore();
                    
                    // Cleanup
                    lower.delete();
                    upper.delete();
                    kernel.delete();
                    
                } catch (e) {
                    console.error('OpenCV processing error:', e);
                } finally {
                    src.delete();
                    hsv.delete();
                    mask.delete();
                    result.delete();
                }
            };
            
            // Show OpenCV status
            const status = document.createElement('div');
            status.style.cssText = 'position: fixed; top: 60px; right: 20px; padding: 8px 12px; background: #065f46; color: #10b981; border-radius: 6px; font-size: 12px; z-index: 10000;';
            status.textContent = '✓ OpenCV.js Active';
            document.body.appendChild(status);
            setTimeout(() => status.remove(), 3000);
            
        } else {
            // OpenCV not loaded yet, check again
            setTimeout(checkOpenCV, 500);
        }
    }
    
    // Start checking for OpenCV
    checkOpenCV();
});
</script>