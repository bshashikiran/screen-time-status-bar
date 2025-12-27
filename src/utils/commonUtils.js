const vscode  = require('vscode');
const { MY_EXTENSION_ID } = require("../constants/constant");

const getExtensionPath = () => {
    const myExtension =  vscode.extensions.getExtension(MY_EXTENSION_ID);
    if (myExtension) {
        return myExtension.extensionPath;
    } else {
        console.error("unable to find screen time status bar extension");
        return null;
    }
}

const getCurrentWorkSpace = () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    console.log("Log ~ getCurrentWorkSpace ~ workspaceFolders:", workspaceFolders);

    if (workspaceFolders && workspaceFolders.length > 0) {
        const currentWorkspace = workspaceFolders[0].uri.fsPath;
        console.log("current workspace path:", currentWorkspace);
        return currentWorkspace;
    } else {
        return null;
    }
}

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

module.exports = { getExtensionPath,  getCurrentWorkSpace, getTodayDate };