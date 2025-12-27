const { getCurrentWorkSpace, getTodayDate } = require('./utils/commonUtils');
const { UNTITLED } = require('./constants/constant');
const { getDataFilePath } = require('./utils/storageUtils');
const fs = require('fs');

const saveScreenTime = (time) => {
    const filePath = getDataFilePath();
    if (!filePath) {
        console.error("Data file path is invalid - saveScreenTime. Exiting.");
        return;
    }

    let data = {};
    if (fs.existsSync(filePath)) {
        try {
            const rawData = fs.readFileSync(filePath, 'utf8');
            data = JSON.parse(rawData);
        } catch (error) {
            console.error("Error reading existing file, updating the time: ", error);
        }
    } else {
        console.log("File not found. Creating new file.");
    }

    let currentWorkspace = getCurrentWorkSpace();
    if (!currentWorkspace) {
        currentWorkspace = UNTITLED;
    }

    const today = getTodayDate();

    if (!data[today]) {
        data[today] = {};
    }

    data[today][currentWorkspace] = time;

    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf8');
    } catch (error) {
        console.error("Error while saving data:", error);
    }
}

module.exports = { saveScreenTime };
