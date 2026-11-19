// Bundled into a single browser-native ESM module (react-runtime.mjs).
// Provides the same shape the standalone runner expects from the CDN React pair.
import React from 'react'
import * as ReactDOM from 'react-dom'
import { createRoot, hydrateRoot } from 'react-dom/client'

export { React, ReactDOM, createRoot, hydrateRoot }
export default { React, ReactDOM, createRoot, hydrateRoot }
