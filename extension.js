const vscode = require('vscode');

let startTime = 0;
let totalActiveTime = 0;
let isActive = false;
let interval = null;

function activate(context) {
	console.log('Extension "screen-time-status-bar" is now active!');

	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = `00:00:00`;
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	function updateStatusBar() {
		// console.log("Inside updateStatusBar()");
		const activeTime = formatTime(totalActiveTime + (isActive ? Date.now() - startTime : 0));
		statusBarItem.text = `Screen Time: ${activeTime}`;
		// console.log(`Status Bar Updated: ${activeTime}`);
	}

	function formatTime(ms) {
		// console.log("Inside formatTime()");
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
	}

	function startTracking() {
		console.log("Inside startTracking()");
		startTime = Date.now();
		isActive = true;
	}

	function stopTracking() {
		console.log("Inside stopTracking()");
		if (isActive) {
			console.log("Inside stopTracking()- Active : true");
			totalActiveTime += Date.now() - startTime;
			isActive = false;
		}
	}

	function onWindowFocus() {
		console.log("Inside onWindowFocus()");
		startTracking();
	}

	function onWindowBlur() {
		console.log("Inside onWindowBlur()");
		stopTracking();
	}

	vscode.window.onDidChangeWindowState((windowState) => {
		console.log("Inside onDidChangeWindowState()");
		if (windowState.focused) {
			console.log("Inside onDidChangeWindowState() - if");
			onWindowFocus();
		} else {
			console.log("Inside onDidChangeWindowState() - else");
			onWindowBlur();
		}
	});

	vscode.workspace.onDidChangeTextDocument(() => {
		console.log("Inside onDidChangeTextDocument()");
		if (vscode.window.state.focused) {
			console.log("Inside onDidChangeTextDocument()- - focused");
			startTracking();
		}
	});

	updateStatusBar(); // Initial update
	interval = setInterval(updateStatusBar, 1000); // Update every 1 second
	context.subscriptions.push({
		dispose: () => clearInterval(interval)
	});

	let disposable = vscode.commands.registerCommand('extension.showScreenTime', () => {
		console.log("Inside dispoable");
		vscode.window.showInformationMessage(`Current Screen Time: ${formatTime(totalActiveTime + (isActive ? Date.now() - startTime : 0))}`);
	});
	context.subscriptions.push(disposable);
}

function deactivate() {
  console.log("Inside deactive()");
 }

module.exports = {
	activate,
	deactivate
};
