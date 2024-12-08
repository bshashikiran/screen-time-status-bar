const { getExtensionPath, getCurrentWorkSpace, getTodayDate } = require('./utility/commonUtility');
const { WORKSPACE_SCREEN_TIME_PATH, UNTITLED } = require("./constants/constant");
const fs = require('fs');
const path = require('path');

const retrieveScreenTime = () => {
    const extensionPath = getExtensionPath();
    if (!extensionPath) {
        console.error("Extension path is invalid - retrieveScreenTime. Exiting.");
        return 0;
    }

    const filePath = path.join(extensionPath, WORKSPACE_SCREEN_TIME_PATH);
    if (!fs.existsSync(filePath)) {
        console.log("No existing workspace screen time file found.");
        return 0;
    }

    let currentWorkspace = getCurrentWorkSpace();
    if (!currentWorkspace) {
        currentWorkspace = UNTITLED;
    }
    const today = getTodayDate();
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        if (data[today] && data[today][currentWorkspace]) {
            return data[today][currentWorkspace];
        } else {
            console.log(`No data found for today (${today}) or workspace (${currentWorkspace}).`);
            return 0;
        }
    } catch (error) {
        console.error("Error reading existing file update the time : ", error);
        return 0;
    }
}

module.exports = { retrieveScreenTime };
