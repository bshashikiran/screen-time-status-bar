const { getDataFilePath } = require('./utils/storageUtils');
const fs = require('fs');

const deleteScreenTime = () => {
    const filePath = getDataFilePath();
    if (!filePath) {
        console.error("Data file path is invalid - deleteScreenTime. Exiting.");
        return false;
    }
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