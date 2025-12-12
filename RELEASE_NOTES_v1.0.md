# eGlass Fusion v1.0 - Release Notes

## 🎉 First Official Release - December 11, 2024

eGlass Fusion is a web-based interface for eGlass lightboards, providing real-time fluorescent ink detection and overlay capabilities.

## ✨ Core Features

### 📷 Camera Integration
- Full-screen USB camera display
- Auto-detection of eGlass cameras
- Mirror mode for lightboard use
- Fullscreen support

### 🎨 Enhanced Mode - Fluorescent Ink Detection
- **Dual Color Support**: Detects both green AND blue UV markers simultaneously
- **Real-time Processing**: 30fps client-side image processing
- **Calibration System**: Click-to-sample color calibration for each ink color
- **Top-layer Overlay**: Ink appears above all workspace elements
- **Adjustable Settings**:
  - Tolerance control for color matching
  - Brightness enhancement (1x-3x)
  - Glow effects for UV appearance
  - Independent calibration for each color

### 🖼️ Image Overlay System
- Drag and drop image support
- Resize with mouse wheel
- Transparency control
- Background removal
- Multiple images support
- Layer management

### 🌐 Webpage Embedding
- Embed live webpages in workspace
- Full navigation controls
- Opacity adjustment
- Multiple webviews support
- Draggable and resizable

### 🎮 User Interface
- iOS-style magnifying dock
- Auto-hide functionality
- Dark theme with eGlass blue accent (#0061ef)
- Keyboard shortcuts:
  - `E` - Toggle Enhanced Mode
  - `M` - Mirror
  - `F` - Fullscreen
  - `I` - Add Image
  - `W` - Add Webpage
  - `H` - Hide/Show Dock

## 🔧 Technical Details

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript
- **Image Processing**: Canvas API with optional OpenCV.js
- **Hosting**: AWS EC2 instance
- **Domain**: fusion.eglass.io
- **SSL**: Let's Encrypt with auto-renewal

### Performance
- Client-side processing (no server load)
- Optimized for real-time video processing
- Works on all modern browsers
- No installation required

### Security
- HTTPS only
- Content Security Policy
- Secure headers
- Auto-renewing SSL certificates

## 📋 System Requirements

### Browser Support
- Chrome/Edge 90+ (Recommended)
- Firefox 88+
- Safari 14+

### Hardware
- USB camera (eGlass lightboard camera preferred)
- Modern CPU for real-time processing
- 4GB+ RAM recommended

## 🚀 Getting Started

1. Visit https://fusion.eglass.io
2. Allow camera access when prompted
3. Press `E` to enable Enhanced Mode
4. Calibrate ink colors:
   - Click settings gear
   - Click "Calibrate Green" and click on green ink
   - Click "Calibrate Blue" and click on blue ink
5. Start writing with fluorescent markers!

## 🐛 Known Issues

- Some sites may not embed due to X-Frame-Options
- Very bright backgrounds may interfere with ink detection
- Calibration required when lighting changes significantly

## 🔮 Future Enhancements (v2.0)

- Recording capabilities
- Multi-color ink support (more than 2 colors)
- AI-powered handwriting recognition
- Virtual backgrounds
- Collaboration features
- Mobile app version

## 👥 Contributors

- Phil McCarthy (@philsmcc) - Project Lead
- eGlass Team - Hardware and concept

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- OpenCV.js community
- Tailwind CSS
- Font Awesome
- Let's Encrypt

## 📞 Support

- GitHub Issues: https://github.com/philsmcc/open-eGlass/issues
- Website: https://fusion.eglass.io
- Email: phil@eglass.io

---

**Version**: 1.0.0  
**Release Date**: December 11, 2024  
**Status**: Stable  
**Build**: Production