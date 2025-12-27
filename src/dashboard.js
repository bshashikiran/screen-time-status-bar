const vscode = require('vscode');
const { retrieveAllScreenTime } = require('./retrieveAllScreenTime');
const { formatTime } = require('./utils/timerUtils');
const { getTodayDate } = require('./utils/commonUtils')
const path = require('path');

let currentPanel = undefined;

const getDashboardContent = () => {
    const allData = retrieveAllScreenTime();
    const today = getTodayDate();
    console.log("Log ~ getDashboardContent ~ today:", today);

    let totalTimeToday = 0;
    let totalTimeAll = 0;
    let workspaceCount = 0;
    let dayCount = Object.keys(allData).length;

    const todayData = allData[today] || {};
    console.log("Log ~ getDashboardContent ~ todayData:", todayData);
    const workspacesToday = Object.keys(todayData);
    console.log("Log ~ getDashboardContent ~ workspacesToday:", workspacesToday);

    workspacesToday.forEach(workspace => {
        totalTimeToday += todayData[workspace] || 0;
    });

    Object.keys(allData).forEach(date => {
        const workspaces = allData[date];
        Object.keys(workspaces).forEach(workspace => {
            totalTimeAll += workspaces[workspace] || 0;
            workspaceCount++;
        });
    });

    const sortedDates = Object.keys(allData).sort((a, b) => new Date(b) - new Date(a));

    return {
        today: today,
        totalTimeToday: formatTime(totalTimeToday),
        totalTimeAll: formatTime(totalTimeAll),
        workspaceCount: workspaceCount,
        dayCount: dayCount,
        todayWorkspaces: workspacesToday.map(ws => ({
            name: path.basename(ws) || ws,
            fullPath: ws,
            time: formatTime(todayData[ws] || 0)
        })),
        allData: sortedDates.map(date => ({
            date: date,
            workspaces: Object.keys(allData[date]).map(ws => ({
                name: path.basename(ws) || ws,
                fullPath: ws,
                time: formatTime(allData[date][ws] || 0)
            })),
            totalTime: formatTime(
                Object.values(allData[date]).reduce((sum, time) => sum + (time || 0), 0)
            )
        }))
    };
};

const createDashboardPanel = (context) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.ViewColumn.Active
        : vscode.ViewColumn.One;

    if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        return currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
        'screenTimeDashboard',
        'Screen Time Dashboard',
        columnToShowIn,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        }
    );

    const updateWebview = () => {
        const data = getDashboardContent();
        panel.webview.html = getWebviewContent(data);
    };

    panel.onDidDispose(
        () => {
            currentPanel = undefined;
        },
        null,
        context.subscriptions
    );

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'refresh':
                    updateWebview();
                    break;
            }
        },
        null,
        context.subscriptions
    );

    updateWebview();
    currentPanel = panel;
    return panel;
};

const getWebviewContent = (data) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screen Time Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }
        
        .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--vscode-panel-border);
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card .label {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 20px;
            margin-bottom: 15px;
            color: var(--vscode-textLink-foreground);
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .workspace-list {
            list-style: none;
        }
        
        .workspace-item {
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }
        
        .workspace-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        
        .workspace-name {
            font-weight: 500;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 15px;
        }
        
        .workspace-time {
            font-size: 18px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            white-space: nowrap;
        }
        
        .date-section {
            margin-bottom: 30px;
        }
        
        .date-header {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .date-total {
            font-size: 16px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .refresh-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        .refresh-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .workspace-path {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Screen Time Dashboard</h1>
        <p>Track your coding activity across workspaces</p>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="label">Today's Total</div>
            <div class="value">${data.totalTimeToday}</div>
        </div>
        <div class="stat-card">
            <div class="label">All-Time Total</div>
            <div class="value">${data.totalTimeAll}</div>
        </div>
        <div class="stat-card">
            <div class="label">Workspaces Tracked</div>
            <div class="value">${data.workspaceCount}</div>
        </div>
        <div class="stat-card">
            <div class="label">Days Active</div>
            <div class="value">${data.dayCount}</div>
        </div>
    </div>
    
    <div class="section">
        <h2 class="section-title">Today's Workspaces (${data.today})</h2>
        ${data.todayWorkspaces.length > 0 ? `
            <ul class="workspace-list">
                ${data.todayWorkspaces.map(ws => `
                    <li class="workspace-item">
                        <div style="flex: 1; min-width: 0;">
                            <div class="workspace-name">${escapeHtml(ws.name)}</div>
                            <div class="workspace-path">${escapeHtml(ws.fullPath)}</div>
                        </div>
                        <div class="workspace-time">${ws.time}</div>
                    </li>
                `).join('')}
            </ul>
        ` : `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No screen time data for today yet.</p>
            </div>
        `}
    </div>
    
    <div class="section">
        <h2 class="section-title">Historical Data</h2>
        ${data.allData.length > 0 ? data.allData.map(day => `
            <div class="date-section">
                <div class="date-header">
                    <span>${day.date}</span>
                    <span class="date-total">Total: ${day.totalTime}</span>
                </div>
                <ul class="workspace-list">
                    ${day.workspaces.map(ws => `
                        <li class="workspace-item">
                            <div style="flex: 1; min-width: 0;">
                                <div class="workspace-name">${escapeHtml(ws.name)}</div>
                                <div class="workspace-path">${escapeHtml(ws.fullPath)}</div>
                            </div>
                            <div class="workspace-time">${ws.time}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('') : `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No historical data available.</p>
            </div>
        `}
    </div>
    
    <button class="refresh-btn" onclick="refresh()">🔄 Refresh</button>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh() {
            vscode.postMessage({
                command: 'refresh'
            });
        }
    </script>
</body>
</html>`;
};

const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

const showDashboard = (context) => {
    createDashboardPanel(context);
};

module.exports = {
    showDashboard,
    createDashboardPanel
};

