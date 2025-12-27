const { getCurrentWorkSpace, getTodayDate } = require('./utils/commonUtils');
const { UNTITLED } = require("./constants/constant");
const { getDataFilePath } = require('./utils/storageUtils');
const fs = require('fs');

const retrieveScreenTime = () => {
    const filePath = getDataFilePath();
    if (!filePath) {
        console.error("Data file path is invalid - retrieveScreenTime. Exiting.");
        return 0;
    }
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
