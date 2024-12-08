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
			stopTimer();
		}
	});

	let disposable = vscode.commands.registerCommand('extension.showScreenTime', () => {
		vscode.window.showInformationMessage(`Current Screen Time: ${formatTime()}`);
	});
	context.subscriptions.push(disposable);

	let deleteScreenTimeData = vscode.commands.registerCommand('extension.deleteScreenTime', () => {
		let isDeleted = deleteScreenTime();
		if (isDeleted) {
			vscode.window.showInformationMessage('Deleted Screen Time');
		} else {
			vscode.window.showErrorMessage('Failed to delete screen time');
		}
	});
	context.subscriptions.push(deleteScreenTimeData);

	context.subscriptions.push({
		dispose: () => {
			stopTimer();
		}
	});
}

const deactivate = () => {
	let elapsedTime = stopTimer();
	saveScreenTime(elapsedTime);
	console.log('Extension "screen-time-status-bar" deactivated');
}

module.exports = {
	activate,
	deactivate
};
