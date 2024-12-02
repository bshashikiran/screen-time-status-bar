const { getExtensionPath } = require('./utility/commonUtility')
const fs = require('fs');
const path = require('path');

function retrieveData() {
    const extensionPath = getExtensionPath();
    console.log("screen time status bar extension path: ", extensionPath);
    if (extensionPath == null) {
        return;
    }
    const filePath = path.join(extensionPath, 'screenTime.json');

    if (!fs.existsSync(filePath)) {
        console.log("no existing screen time data file found.");
        return 0;
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log("retrieved screen time from file: ", data.screenTime);
        
        return data.screenTime;
    } catch (err) {
        console.error("error while reading data from file:", err);
        return 0;
    }
}

module.exports = { retrieveData };
