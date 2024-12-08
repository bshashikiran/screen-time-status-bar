const { getExtensionPath } = require('./utility/commonUtility');
const { WORKSPACE_SCREEN_TIME_PATH } = require("./constants/constant");
const fs = require('fs');
const path = require('path');

const deleteScreenTime = () => {
    const extensionPath = getExtensionPath();
    if (!extensionPath) {
        console.error("Extension path is invalid - deleteScreenTime. Exiting.");
        return false;
    }

    const filePath = path.join(extensionPath, WORKSPACE_SCREEN_TIME_PATH);
    if (!fs.existsSync(filePath)) {
        console.error("Workspace file path does not exist:", filePath);
        return false;
    }

    try {
        fs.unlinkSync(filePath);
        return true;
    } catch (err) {
        console.error("Error while deleting complete data :", err);
        return false;
    }
};

module.exports = { deleteScreenTime };