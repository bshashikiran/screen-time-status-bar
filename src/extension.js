const vscode = require('vscode');
const { startTimer, stopTimer, formatTime } = require('./utility/timer');
const { saveScreenTime } = require('./saveScreenTime')
const { retrieveScreenTime } = require('./retrieveScreenTime');
const { deleteScreenTime } = require('./deleteScreenTime');

const activate = (context) => {

	console.log('Extension "screen-time-status-bar" is now active!');
	let retrievedScreenTime = retrieveScreenTime();

	let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBar.show();
	context.subscriptions.push(statusBar);

	const updateStatusBar = (timeText) => {
		statusBar.text = `Screen Time: ${timeText}`;
	};

	if (vscode.window.state.focused) {
		startTimer(updateStatusBar, retrievedScreenTime);
	}

	vscode.window.onDidChangeWindowState((windowState) => {
		if (windowState.focused) {
			startTimer(updateStatusBar);
		} else {
			stopTimer(false);
		}
	});

	let disposable = vscode.commands.registerCommand('extension.showScreenTime', () => {
		vscode.window.showInformationMessage(`Current Screen Time: ${formatTime()}`);
	});
	context.subscriptions.push(disposable);

	let deleteScreenTimeData = vscode.commands.registerCommand('extension.deleteScreenTime', () => {
		let isDeleted = deleteScreenTime();
		if (isDeleted) {
			stopTimer(true);
			vscode.window.showInformationMessage('Deleted Screen Time');
			statusBar.text = "Screen Time: 0h 0m 0s";
			startTimer(updateStatusBar);
		} else {
			vscode.window.showErrorMessage('Failed to delete screen time');
		}
	});
	context.subscriptions.push(deleteScreenTimeData);

	context.subscriptions.push({
		dispose: () => {
			stopTimer(false);
		}
	});
}

const deactivate = () => {
	let elapsedTime = stopTimer(false);
	saveScreenTime(elapsedTime);
	console.log('Extension "screen-time-status-bar" deactivated');
}

module.exports = {
	activate,
	deactivate
};
