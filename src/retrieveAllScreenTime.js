const { getExtensionPath } = require('./utils/commonUtils');
const { WORKSPACE_SCREEN_TIME_PATH } = require("./constants/constant");
const fs = require('fs');
const path = require('path');

const retrieveAllScreenTime = () => {
    const extensionPath = getExtensionPath();
    if (!extensionPath) {
        console.error("Extension path is invalid - retrieveAllScreenTime. Exiting.");
        return {};
    }

    const filePath = path.join(extensionPath, WORKSPACE_SCREEN_TIME_PATH);
    if (!fs.existsSync(filePath)) {
        console.log("No existing workspace screen time file found while retrieving all screen times.");
        return {};
    }

    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        return data || {};
    } catch (error) {
        console.error("Error reading existing file: ", error);
        return {};
    }
}

module.exports = { retrieveAllScreenTime };