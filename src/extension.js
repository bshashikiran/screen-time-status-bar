const vscode = require('vscode');
const { startTimer, stopTimer, calculateCurrentScreenTime, getCurrentElapsedTime } = require('./utils/timerUtils');
const { saveScreenTime } = require('./saveScreenTime');
const { retrieveScreenTime } = require('./retrieveScreenTime');
const { deleteScreenTime } = require('./deleteScreenTime');
const { showDashboard } = require('./dashboardScreen');
const { SAVE_INTERVAL_MS } = require('./constants/constant');
const { initializeStorage, migrateDataFromOldVersions } = require('./utils/storageUtils');

const activate = (context) => {

	console.log('Extension "screen-time-status-bar" is now active!');
	
	initializeStorage(context);
	migrateDataFromOldVersions();
	
	let retrievedScreenTime = retrieveScreenTime();

	let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBar.command = 'extension.showScreenTimeDashboard';
	statusBar.tooltip = 'Show Screen Time Dashboard';
	statusBar.show();
	context.subscriptions.push(statusBar);

	let saveInterval = null;

	const updateStatusBar = (timeText) => {
		statusBar.text = `Screen Time: ${timeText}`;
	};

	const startSaveInterval = () => {
		if (saveInterval) {
			clearInterval(saveInterval);
		}
		saveInterval = setInterval(() => {
			const currentTime = getCurrentElapsedTime();
			saveScreenTime(currentTime);
		}, SAVE_INTERVAL_MS);
	};

	const stopSaveInterval = () => {
		if (saveInterval) {
			clearInterval(saveInterval);
			saveInterval = null;
		}
	};

	if (vscode.window.state.focused) {
		startTimer(updateStatusBar, retrievedScreenTime);
		startSaveInterval();
	}

	vscode.window.onDidChangeWindowState((windowState) => {
		if (windowState.focused) {
			startTimer(updateStatusBar);
			startSaveInterval();
		} else {
			stopTimer(false);
			stopSaveInterval();
			const currentTime = getCurrentElapsedTime();
			saveScreenTime(currentTime);
		}
	});

	let disposable = vscode.commands.registerCommand('extension.showScreenTime', () => {
		vscode.window.showInformationMessage(`Current Screen Time: ${calculateCurrentScreenTime()}`);
	});
	context.subscriptions.push(disposable);

	let deleteScreenTimeData = vscode.commands.registerCommand('extension.deleteScreenTime', () => {
		let isDeleted = deleteScreenTime();
		if (isDeleted) {
			stopTimer(true);
			stopSaveInterval();
			vscode.window.showInformationMessage('Deleted Screen Time');
			statusBar.text = "Screen Time: 0h 0m 0s";
			startTimer(updateStatusBar);
			startSaveInterval();
		} else {
			vscode.window.showErrorMessage('Failed to delete screen time');
		}
	});
	context.subscriptions.push(deleteScreenTimeData);

	let showDashboardCommand = vscode.commands.registerCommand('extension.showScreenTimeDashboard', () => {
		showDashboard(context);
	});
	context.subscriptions.push(showDashboardCommand);

	context.subscriptions.push({
		dispose: () => {
			stopTimer(false);
			stopSaveInterval();
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
