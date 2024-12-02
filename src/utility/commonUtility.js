const vscode  = require('vscode');
const { MY_EXTENSION_ID } = require("../constants/constant");

const getExtensionPath = () => {
    getCurrentWorkSpace();
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

    if (workspaceFolders && workspaceFolders.length > 0) {
        const currentWorkspace = workspaceFolders[0].uri.fsPath;
        console.log("current workspace path:", currentWorkspace);
        return currentWorkspace;
    } else {
        console.log("no workspace or folder is currently open.");
        return null;
    }
    
}

module.exports = { getExtensionPath };