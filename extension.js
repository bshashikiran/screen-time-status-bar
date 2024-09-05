const vscode = require('vscode');

function activate(context) {

	console.log('Extension "screen-time-status-bar" is now active!');

	let startTime = null;
	let accumulatedTime = 0;
	let timerInterval = null;
	let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar.show();
	context.subscriptions.push(statusBar);

	const updateStatusBar = () => {
		statusBar.text = `Screen Time: ${formatTime()}`;
	};

	const startTimer = () => {
		console.log('inside starttimer');
		if (!timerInterval) {
			startTime = Date.now();
			timerInterval = setInterval(updateStatusBar, 1000);
		}
	};

	const stopTimer = () => {
		if (timerInterval) {
			accumulatedTime += Date.now() - startTime;
			clearInterval(timerInterval);
			timerInterval = null;
		}
	};

	const formatTime = () => {
		const timeElapsed = Date.now() - startTime + accumulatedTime;
		const seconds = Math.floor((timeElapsed / 1000) % 60);
		const minutes = Math.floor((timeElapsed / 1000 / 60) % 60);
		const hours = Math.floor(timeElapsed / 1000 / 60 / 60);
		return `${hours}h ${minutes}m ${seconds}s`;
	};

	if (vscode.window.state.focused) {
		startTimer();
	}

	vscode.window.onDidChangeWindowState((windowState) => {
		if (windowState.focused) {
			startTimer();
		} else {
			stopTimer();
		}
	});

	context.subscriptions.push({
		dispose: () => clearInterval(timerInterval)
	});

	let disposable = vscode.commands.registerCommand('extension.showScreenTime', () => {
		vscode.window.showInformationMessage(`Current Screen Time: ${formatTime()}`);
	});
	context.subscriptions.push(disposable);

}

function deactivate() {
	console.log('Extension "screen-time-status-bar" deactivated');
}

module.exports = {
	activate,
	deactivate
};
