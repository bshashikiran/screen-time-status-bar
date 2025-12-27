const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { MY_EXTENSION_ID, WORKSPACE_SCREEN_TIME_PATH } = require('../constants/constant');

let globalContext = null;

const initializeStorage = (context) => {
    globalContext = context;
};

const getGlobalStoragePath = () => {
    if (!globalContext || !globalContext.globalStorageUri) {
        console.error("Context or globalStorageUri is not available");
        return null;
    }

    const storagePath = globalContext.globalStorageUri.fsPath;

    if (!fs.existsSync(storagePath)) {
        try {
            fs.mkdirSync(storagePath, { recursive: true });
        } catch (error) {
            console.error("Error creating global storage directory:", error);
            return null;
        }
    }

    return storagePath;
};

const getDataFilePath = () => {
    const storagePath = getGlobalStoragePath();
    if (!storagePath) {
        return null;
    }
    return path.join(storagePath, WORKSPACE_SCREEN_TIME_PATH);
};

const migrateDataFromOldVersions = () => {
    const globalFilePath = getDataFilePath();
    if (!globalFilePath) {
        return;
    }

    // Skip migration if data already exists in global storage
    if (fs.existsSync(globalFilePath)) {
        console.log("Data already exists in global storage, skipping migration.");
        return;
    }

    // TODO: Remove this migration function after version 0.0.8 or later
    // This migration is only needed for users upgrading from 0.0.5 or earlier
    // Once all users have migrated to 0.0.6+, this function can be safely removed.

    const extensions = vscode.extensions.all;
    const extensionBaseName = MY_EXTENSION_ID;
    let latestData = null;
    let latestVersion = null;

    extensions.forEach(ext => {
        if (ext.id === MY_EXTENSION_ID) {
            console.log("old version data getting...")
            const extPath = ext.extensionPath;
            const oldDataPath = path.join(extPath, WORKSPACE_SCREEN_TIME_PATH);

            if (fs.existsSync(oldDataPath)) {
                try {
                    const data = fs.readFileSync(oldDataPath, 'utf8');
                    const parsedData = JSON.parse(data);

                    // Check if this data is newer (has more entries or later dates)
                    if (!latestData || Object.keys(parsedData).length > Object.keys(latestData).length) {
                        latestData = parsedData;
                        latestVersion = ext.packageJSON.version;
                    }
                } catch (error) {
                    console.error(`Error reading data from ${extPath}:`, error);
                }
            }
        }
    });

    // Also check the extensions directory for old versions
    const extensionPath = vscode.extensions.getExtension(MY_EXTENSION_ID)?.extensionPath;
    if (extensionPath) {
        const extensionsDir = path.dirname(extensionPath);

        // Look for old version folders
        if (fs.existsSync(extensionsDir)) {
            try {
                const entries = fs.readdirSync(extensionsDir, { withFileTypes: true });
                entries.forEach(entry => {
                    if (entry.isDirectory() && entry.name.startsWith(`${extensionBaseName}-`)) {
                        const oldVersionPath = path.join(extensionsDir, entry.name, WORKSPACE_SCREEN_TIME_PATH);
                        if (fs.existsSync(oldVersionPath)) {
                            try {
                                const data = fs.readFileSync(oldVersionPath, 'utf8');
                                const parsedData = JSON.parse(data);

                                if (!latestData || Object.keys(parsedData).length > Object.keys(latestData).length) {
                                    latestData = parsedData;
                                    latestVersion = entry.name;
                                }
                            } catch (error) {
                                console.error(`Error reading data from ${oldVersionPath}:`, error);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error("Error reading extensions directory:", error);
            }
        }
    }

    if (latestData) {

        try {
            const jsonData = JSON.stringify(latestData, null, 2);
            fs.writeFileSync(globalFilePath, jsonData, 'utf8');
            console.log(`Migrated screen time data from version ${latestVersion} to global storage.`);
        } catch (error) {
            console.error("Error migrating data to global storage:", error);
        }
    }
};

module.exports = {
    initializeStorage,
    getGlobalStoragePath,
    getDataFilePath,
    migrateDataFromOldVersions
};

