// Electron/main/appEnv/appEnv.js
const path = require('path');
const fs = require('fs');
const { app, shell } = require('electron'); // Import Electron's app and shell modules

const PathData = require('./pathData'); // Import the PathData class
const PathFunc = require('./pathFunc'); // Import the PathFunc class directly
const configData = require('./configData'); // Import the configData module
const ConfigFunc = require('./configFunc'); // Import the ConfigFunc class
const FilePath = require('./filePath'); // Add this

class AppEnv {
    constructor() {
        if (AppEnv._instance) {
            return AppEnv._instance;
        }
        AppEnv._instance = this;
        // Initialize environment variables or settings here
        this.env = {}; // Example: an object to hold environment variables

        // 1. FilePath 초기화 (설정 폴더 및 파일명 관리)
        this.filePath = new FilePath();

        // 2. PathData 초기화 (FilePath의 파일명 데이터를 전달)
        this.pathData = new PathData(this.filePath.data); 

        this.pathFunc = new PathFunc(this); // Pass the appEnv instance itself
        this.pathFuncUtils = PathFunc; // To keep access to utility functions via appEnv if needed
        this.configData = configData; // Assign the imported configData module
        this.configFunc = new ConfigFunc(this); // Instantiate ConfigFunc and pass the appEnv instance
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
