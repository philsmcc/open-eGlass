# eGlass Fusion - Web Application

## Overview
eGlass Fusion is a lightweight web-based interface for the eGlass lightboard USB camera. It provides a full-screen camera view with essential controls, designed for ease of use across all operating systems without requiring any downloads.

## Current Features

### 🌐 Webview Embedding System
- **Add Webpages**: Click the globe button or press 'W' to embed websites
- **URL Dialog**: Enter any website URL with quick suggestions
- **Navigation Controls**: Back, forward, refresh buttons in hover toolbar
- **URL Bar**: Edit URL directly to navigate to new sites
- **Browser History**: Maintains history for each embedded webpage
- **Transparency Control**: Adjust webpage opacity from 0-100%
- **Resizable Windows**: Three ways to resize:
  - Drag corner handle
  - Scroll mouse wheel
  - Maintains aspect ratio
- **Layer Management**: Bring webpages to front
- **Multiple Webviews**: Embed unlimited webpages
- **Sandboxed iFrames**: Secure embedding with sandbox attributes

### 🖼️ Advanced Image Overlay System
- **Add Images**: Click the image button or press 'I' to select files
- **Drag & Drop**: Drag image files directly into the browser window
- **Image Menu**: Click the ⋮ button on any image for advanced options
- **Transparency Control**: Adjust image opacity from 0-100% with live preview
- **Background Removal**: AI-powered background removal using OpenCV.js
- **Restore Original**: One-click restore to original image with background
- **Movable Images**: Click and drag images to position them anywhere
- **Resizable**: Three ways to resize:
  - Drag corner handle
  - Scroll mouse wheel over image (up = larger, down = smaller)
  - Maintains aspect ratio automatically
- **Layer Control**: Bring images to front through the menu
- **Delete Images**: Remove images via the menu
- **Multiple Images**: Support for unlimited overlay images
- **File Support**: PNG, JPG, GIF formats

## Core Features

### 🎥 Camera Integration
- **Auto-detection**: Automatically finds and connects to eGlass USB cameras
- **Fallback Support**: Works with any available USB camera if eGlass device not found
- **Hot-plug Support**: Automatically detects when cameras are connected/disconnected
- **Multiple Camera Support**: Switch between multiple connected cameras

### 🎨 User Interface
- **Full-Screen Video**: Edge-to-edge camera view for maximum visibility
- **Dark Theme**: Sleek, modern dark interface with purple accent colors
- **Flashy Design**: Glowing effects, smooth animations, and glassmorphism styling
- **Responsive**: Works on all screen sizes

### 🎛️ Enhanced Auto-Hide Dock Interface
- **Intelligent Auto-Hide**: Dock automatically minimizes after 2 seconds of inactivity
- **Instant Response**: Dock appears immediately when mouse approaches bottom 50px
- **Settings on Right**: Settings button positioned at far right for logical layout
- **Image Overlay**: Add images to workspace via button or drag-and-drop
- **Visual Indicator**: Subtle blue strip shows when dock is minimized
- **Magnifying Icons**: 44px icons that grow to 140% on hover with adjacent scaling
- **Glass Morphism Design**: Beautiful blur effects with eGlass blue (#0061ef) accents
- **Smart Behavior**: Stays visible when settings panel is open
- **Fullscreen Mode**: One-click fullscreen with keyboard shortcut (F key)
- **Mirror Mode**: Instant horizontal flip for lightboard use
- **Status Indicator**: Live connection status with animated glow

### ⚙️ Settings Options
- **Camera Selection**: Dropdown to choose specific camera device
- **Video Quality**: 1080p (Full HD), 720p (HD), or 480p (SD) options
- **Device Information**: Shows current camera name and resolution
- **Live Updates**: All settings apply immediately without page reload

### ⌨️ Keyboard Shortcuts
- `M` - Toggle mirror mode (shows dock if hidden)
- `S` - Open/close settings panel (shows dock if hidden)
- `H` - Manually show/hide dock
- `F` - Toggle fullscreen (shows dock if hidden)
- `I` - Add image to workspace (shows dock if hidden)
- `W` - Add webpage to workspace (shows dock if hidden)
- `ESC` - Close settings panel / Exit fullscreen

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and video elements
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **WebRTC**: getUserMedia API for camera access
- **Font Awesome**: Icon library for UI elements

### Browser Requirements
- Modern browser with WebRTC support
- HTTPS connection (required for camera access)
- Camera permissions must be granted

### Security Features
- Served over HTTPS with Let's Encrypt SSL
- No data collection or storage
- All processing happens locally in the browser
- No external API calls or tracking

## File Structure
```
/home/ec2-user/webapp/
├── index.html           # Main application file
├── PROJECT_INFO.md      # This documentation
└── SSL_SETUP_SUMMARY.md # SSL configuration details
```

## Future Enhancements (Planned)
- Recording capabilities
- Screenshot functionality
- Background effects/virtual backgrounds
- Color correction controls
- Audio input monitoring
- Stream broadcasting options
- Multiple layout presets
- Custom branding options

## Deployment
The application is deployed on AWS EC2 at:
- **URL**: https://fusion.eglass.io
- **Server**: Nginx with HTTP/2
- **SSL**: Let's Encrypt with auto-renewal
- **Location**: US West 2 (Oregon)

## Usage Notes
1. **First Visit**: Browser will request camera permissions
2. **eGlass Priority**: System automatically selects eGlass camera if available
3. **Mirror Mode**: Essential for lightboard use to correct text orientation
4. **Quality Settings**: Adjust based on bandwidth and performance needs
5. **Privacy**: No video data leaves your browser

## Troubleshooting

### Camera Not Detected
- Ensure USB camera is properly connected
- Grant camera permissions when prompted
- Try the "Retry Connection" button
- Check if camera works in other applications

### Poor Performance
- Lower video quality in settings (720p or 480p)
- Close other camera-using applications
- Ensure stable internet connection for page load
- Use a modern browser (Chrome, Firefox, Edge, Safari)

### Mirror Mode Issues
- Toggle with 'M' key or mirror button
- Mirroring is client-side only (doesn't affect actual camera)

## Development Notes
- Keep the codebase simple and dependency-free
- Prioritize performance and user experience
- Maintain dark theme consistency
- Test across multiple browsers and devices
- Ensure all features work without page reload

---

*Version 1.0.0 - December 2024*
*Created for eGlass lightboard camera systems*