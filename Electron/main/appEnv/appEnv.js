// Electron/main/appEnv/appEnv.js
const path = require('path');
const fs = require('fs');
const { app, shell } = require('electron'); // Import Electron's app and shell modules

const PathData = require('./pathData'); // Import the PathData class
const PathFunc = require('./pathFunc'); // Import the PathFunc class directly

class AppEnv {
    constructor() {
        if (AppEnv._instance) {
            return AppEnv._instance;
        }
        AppEnv._instance = this;
        // Initialize environment variables or settings here
        this.env = {}; // Example: an object to hold environment variables
        this.pathData = new PathData(); // Instantiate PathData here
        this.pathFunc = new PathFunc(this.pathData); // Instantiate PathFunc directly
        this.pathFuncUtils = PathFunc; // To keep access to utility functions via appEnv if needed
        console.log('AppEnv instance created.');
    }

    getEnv(key) {
        return this.env[key];
    }

    setEnv(key, value) {
        this.env[key] = value;
    }

    // Add other methods as needed for your application environment
}

module.exports = new AppEnv();
