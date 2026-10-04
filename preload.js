const { contextBridge } = require('electron');
const CONFIG = require('./config.js');

// Expose config (chỉ những gì cần thiết) cho renderer
contextBridge.exposeInMainWorld('APP_CONFIG', {
    DEBUG_BUILD: CONFIG.DEBUG_BUILD,
    APP_NAME: CONFIG.APP_NAME,
    APP_VERSION: CONFIG.APP_VERSION
});