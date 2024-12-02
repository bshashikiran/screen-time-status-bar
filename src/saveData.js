const { getExtensionPath } = require('./utility/commonUtility');
const fs = require('fs');
const path = require('path');

function saveData(time) {
    console.log("time inside save data : ", time);
    const extensionPath = getExtensionPath();
    if (extensionPath == null) {
        return;
    }
    const filePath = path.join(extensionPath, "screenTime.json");
    const data = { screenTime: time };

    fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            console.error("error saving screen time data to file:", err);
        } else {
            console.log("screen time data saved to file successfully.");
        }
    });
}

module.exports = { saveData };