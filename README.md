# Screen Size Changer Chrome Extension

A browser extension that allows users to change the browser window size from a popup interface, built with React and Webpack.

## Features

- Preset screen sizes (Mobile, Tablet, Desktop, Large Desktop)
- Custom size input
- Automatic detection of current window size

## Development Setup

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

### Development

For production build (optimized, minified, CSP-compatible):
```
npm run build
```

For development build (with source maps, CSP-compatible):
```
npm run build:dev
```

To watch for changes and rebuild automatically:
```
npm run watch
```

To run with webpack dev server:
```
npm run dev
```

### Content Security Policy (CSP)

Chrome extensions have strict Content Security Policy (CSP) restrictions that prevent certain JavaScript patterns like `eval()` which are commonly used by development tools including webpack's development mode.

This project has been configured to:
- Use production mode for the main build (completely CSP compatible)
- Use a custom development configuration with appropriate source maps
- Include a proper CSP in the manifest.json

If you encounter any CSP-related errors, try using the production build with:
```
npm run build
```

### Loading the Extension in Chrome

1. Build the extension using `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the `dist` directory that was created by the build process

## Project Structure

- `src/popup/` - React components for the popup UI
  - `App.jsx` - Main React component
  - `index.js` - React entry point
  - `popup.html` - HTML template
  - `styles.css` - Styles
- `src/service-worker/` - Background scripts
- `src/content/` - Content scripts

## Technologies Used

- React
- Webpack
- Babel
- Chrome Extension API

## License

ISC

## Permissions

This extension requires the following permissions:
- `tabs` - To access browser tab information
- `activeTab` - To interact with the current tab

## Notes

- The icons in this project are placeholder files. Replace them with actual icons before distributing.
- Browser security policies may limit how this extension operates in certain contexts. 