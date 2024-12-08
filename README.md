# Screen Time

**Screen Time** is a Visual Studio Code extension that displays your active screen time in the status bar. It helps you keep track of how much time you've spent working in VS Code, updating live in the status bar and saving time data for individual workspaces.

## Features
- Displays live screen time in the VS Code status bar.
- Tracks screen time for each workspace separately and resumes automatically for the current day.
- Provides a command to delete all saved screen time data effortlessly.
- Automatically starts and stops tracking based on the window's focus state.
- Displays the total screen time in a human-readable format.

## Usage
Once the extension is installed, the screen time will automatically start tracking when you open VS Code.
The timer updates every second and automatically pauses when you minimize or unfocus the VS Code window. When you return, it resumes tracking.

## How It Works
### 1. Live Tracking
- The extension tracks your active VS Code usage and updates the timer every second.
- Screen time is paused when you minimize or unfocus the editor and resumes when you return.

### 2. Workspace-Specific Tracking
- Each workspace's screen time is tracked independently and saved for the current day.
- You can close VS Code and reopen it later to see the total screen time for the same workspace automatically resumed.

### 3. Easy Data Reset
- The Delete Screen Time command clears all saved time data for the day and resets the timer to 0.

## Commands
- `Show Screen Time`: Displays the current screen time in a popup message.
- `Delete Screen Time`: Deletes all saved screen time data and resets the displayed time.