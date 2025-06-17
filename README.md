# Link Preview & Safety Chrome Extension

This Chrome extension shows a preview popup when hovering over any link and checks the link for safety, warning users if the link is malicious.

## Features
- Preview any link on hover in a popup window
- Warn users if a link is potentially malicious (using a public API)
- Works on any website

## Setup
1. Load the extension in Chrome:
   - Go to chrome://extensions
   - Enable Developer mode
   - Click 'Load unpacked' and select this folder
2. Hover over any link to see the preview and safety status.

## Development
- Edit content scripts in `src/content.js`
- Edit background logic in `src/background.js`
- Edit popup UI in `src/popup.html`, `src/popup.js`, `src/popup.css`
- Update `manifest.json` as needed
