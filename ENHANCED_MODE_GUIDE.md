# eGlass Fusion - Enhanced Mode Guide

## Overview
Enhanced Mode is a powerful feature designed specifically for eGlass lightboards that captures and isolates fluorescent writing in real-time, overlaying it on top of all workspace elements (images, webpages, etc.).

## Key Features

### 🎯 Fluorescent Ink Detection
- **Auto-Detection**: Automatically identifies green or blue neon ink colors
- **Manual Selection**: Choose between green and blue ink manually if needed
- **Real-time Processing**: 30fps client-side processing using OpenCV.js
- **Top Layer Rendering**: Ink always appears above all other elements

### ⚡ Performance
- **Client-Side Processing**: All processing happens in the browser
- **Low Server Load**: No server resources required for image processing
- **OpenCV.js Integration**: Hardware-accelerated when available
- **JavaScript Fallback**: Works even without OpenCV support

### 🎨 Visual Enhancements
- **Adjustable Sensitivity**: Fine-tune color detection (10-60 range)
- **Brightness Control**: Enhance ink visibility (1.0x - 3.0x)
- **Glow Effects**: Add neon glow to detected ink (0-30px)
- **Mirror Support**: Works seamlessly with mirror mode

## How to Use

### Activation
1. **Button**: Click the magic wand icon (✨) in the dock
2. **Keyboard**: Press 'E' to toggle Enhanced Mode
3. **Indicator**: Green/Blue indicator appears at top when active

### Settings
Click the gear icon next to the indicator to access:
- **Auto-Detect**: Toggle automatic ink color detection
- **Color Selection**: Manually choose green or blue
- **Sensitivity**: Adjust detection threshold
- **Brightness**: Control ink intensity
- **Glow Effect**: Add/adjust neon glow

### Best Practices
1. **Lighting**: Works best with consistent lighting
2. **Ink Quality**: Use bright fluorescent markers for best results
3. **Camera Position**: Ensure camera captures full writing area
4. **Background**: Dark backgrounds improve detection

## Technical Details

### Color Detection Ranges
- **Green Fluorescent**: HSV(40-80, 50-255, 50-255)
- **Blue Fluorescent**: HSV(85-125, 50-255, 50-255)

### Processing Pipeline
1. Capture video frame from camera
2. Convert to HSV color space (if OpenCV available)
3. Apply color range filtering
4. Morphological operations for noise reduction
5. Apply brightness and glow enhancements
6. Render to top-layer canvas

### Browser Compatibility
- Chrome/Edge: Full OpenCV.js support
- Firefox: Full OpenCV.js support
- Safari: JavaScript fallback mode

## Keyboard Shortcuts
- `E` - Toggle Enhanced Mode
- `M` - Toggle Mirror
- `F` - Fullscreen
- `H` - Hide/Show Dock
- `I` - Add Image
- `W` - Add Webpage

## Troubleshooting

### Ink Not Detected
- Increase sensitivity in settings
- Ensure proper lighting conditions
- Check if correct color is selected
- Try manual color selection instead of auto-detect

### Performance Issues
- Reduce glow effect setting
- Lower sensitivity value
- Close other browser tabs
- Check if OpenCV.js loaded properly

### OpenCV Not Loading
- Refresh the page
- Check browser console for errors
- JavaScript fallback will engage automatically

## Use Cases
- **Teaching**: Overlay explanations on diagrams/webpages
- **Presentations**: Annotate live content
- **Demonstrations**: Highlight key points over reference material
- **Collaboration**: Layer writing over shared content

## Future Enhancements
- Multi-color detection simultaneously
- Ink persistence/recording
- Export annotated frames
- Custom color calibration