# eGlass Fusion v1.0.0

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/philsmcc/open-eGlass/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-fusion.eglass.io-orange.svg)](https://fusion.eglass.io)

A lightweight, web-based interface for the eGlass lightboard USB camera system with real-time fluorescent ink detection. No downloads required - works directly in your browser.

Part of the open-eGlass project - Fun projects that will help you make the most of your eGlass Lightboard!

🌐 **Live Demo**: [https://fusion.eglass.io](https://fusion.eglass.io)  
📦 **Latest Release**: [v1.0.0](https://github.com/philsmcc/open-eGlass/releases/tag/v1.0.0)

## Features

### 🎥 Camera Integration
- Auto-detects eGlass USB cameras
- Fallback support for any USB camera
- Hot-plug detection for camera connections
- Multiple camera switching

### 🖼️ Advanced Image Overlays
- Drag & drop images into workspace
- Resize with mouse wheel or corner handles
- Transparency control (0-100% opacity)
- AI-powered background removal
- Layer management

### 🌐 Webpage Embedding
- Embed any website as a floating window
- Full navigation controls (back/forward/refresh)
- Adjustable transparency
- Resizable and movable windows
- Multiple webviews supported

### 🎨 Interface
- Dark theme with eGlass blue accents (#0061ef)
- iOS-style magnifying dock with auto-hide
- Fullscreen mode
- Mirror mode for lightboard use
- Keyboard shortcuts for all major functions

## Quick Start

### For Users
Simply visit [https://fusion.eglass.io](https://fusion.eglass.io) and grant camera permissions when prompted.

### For Developers

1. Clone the repository:
```bash
git clone https://github.com/philsmcc/open-eGlass.git
cd open-eGlass
```

2. Serve the files with any web server (HTTPS required for camera access):
```bash
# Example with Python
python3 -m http.server 8000

# Or with Node.js
npx http-server -S
```

3. Access via HTTPS (camera permissions require secure context)

## Keyboard Shortcuts

- `M` - Toggle mirror mode
- `S` - Open/close settings
- `H` - Show/hide dock
- `F` - Toggle fullscreen
- `I` - Add image
- `W` - Add webpage
- `ESC` - Close panels/Exit fullscreen

## System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- USB camera (eGlass camera preferred)
- HTTPS connection (required for camera access)

## Technology Stack

- Pure HTML5/CSS3/JavaScript (no frameworks)
- Tailwind CSS (via CDN)
- WebRTC for camera access
- Canvas API for image processing
- Font Awesome icons

## Security

- All processing happens client-side
- No data collection or storage
- Sandboxed iframe embedding
- CSP headers configured
- SSL/TLS encryption enforced

## Deployment

The application is deployed on AWS EC2 with:
- Nginx web server
- Let's Encrypt SSL certificate
- Automatic HTTPS renewal
- HTTP/2 enabled

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is part of the eGlass ecosystem. Please contact for licensing information.

## Support

For issues or questions, please open an issue on GitHub or contact the eGlass team.

---

**Version**: 1.0.0  
**Created by**: eGlass Team  
**Website**: [fusion.eglass.io](https://fusion.eglass.io)