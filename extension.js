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
		const activeTime = formatTime(totalActiveTime + (isActive ? Date.now() - startTime : 0));
		statusBarItem.text = `Screen Time: ${activeTime}`;
		// console.log(`Status Bar Updated: ${activeTime}`);
	}

	function formatTime(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
	}

	function startTracking() {
		startTime = Date.now();
		isActive = true;
	}

	function stopTracking() {
		if (isActive) {
			totalActiveTime += Date.now() - startTime;
			isActive = false;
		}
	}

	function onWindowFocus() {
		startTracking();
	}

	function onWindowBlur() {
		stopTracking();
	}

	vscode.window.onDidChangeWindowState((windowState) => {
		if (windowState.focused) {
			onWindowFocus();
		} else {
			onWindowBlur();
		}
	});

	if (vscode.window.state.focused) {
		startTracking();
	}
	
	vscode.workspace.onDidChangeTextDocument(() => {
		if (vscode.window.state.focused) {
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
  console.log('Extension "screen-time-status-bar" deactivated');
 }

module.exports = {
	activate,
	deactivate
};
