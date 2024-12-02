const vscode = require('vscode');
const { startTimer, stopTimer, formatTime } = require('./utility/timer');
const {saveData} = require('./saveData')
const { retrieveData } = require('./retrieveData')

function activate(context) {

	console.log('Extension "screen-time-status-bar" is now active!');
	let retrievedScreenTime = retrieveData();

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

	context.subscriptions.push({
		dispose: () => {
			stopTimer();
		}
	});
}

function deactivate(context) {
	let elapsedTime = stopTimer();
	saveData(elapsedTime);
	console.log('Extension "screen-time-status-bar" deactivated');
}

module.exports = {
	activate,
	deactivate
};
