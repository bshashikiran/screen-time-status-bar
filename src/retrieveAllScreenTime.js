const { getDataFilePath } = require('./utils/storageUtils');
const fs = require('fs');

const retrieveAllScreenTime = () => {
    const filePath = getDataFilePath();
    if (!filePath) {
        console.error("Data file path is invalid - retrieveAllScreenTime. Exiting.");
        return {};
    }
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