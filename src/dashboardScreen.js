const vscode = require('vscode');
const { retrieveAllScreenTime } = require('./retrieveAllScreenTime');
const { formatTime, getCurrentElapsedTime } = require('./utils/timerUtils');
const { getTodayDate, getExtensionPath } = require('./utils/commonUtils');
const { saveScreenTime } = require('./saveScreenTime');
const path = require('path');
const fs = require('fs');

let currentPanel = undefined;

const getDashboardContent = () => {
    const allData = retrieveAllScreenTime();
    const today = getTodayDate();

    let totalTimeToday = 0;
    let totalTimeAll = 0;
    const uniqueWorkspaces = new Set();
    let dayCount = Object.keys(allData).length;

    const todayData = allData[today] || {};
    const workspacesToday = Object.keys(todayData);

    workspacesToday.forEach(workspace => {
        totalTimeToday += todayData[workspace] || 0;
    });

    Object.keys(allData).forEach(date => {
        const workspaces = allData[date];
        Object.keys(workspaces).forEach(workspace => {
            totalTimeAll += workspaces[workspace] || 0;
            uniqueWorkspaces.add(workspace);
        });
    });

    const workspaceCount = uniqueWorkspaces.size;

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

const saveScreenTimeHandler = () => {
    const currentTime = getCurrentElapsedTime();
    saveScreenTime(currentTime);
}

const loadTemplateFiles = () => {
    const extensionPath = getExtensionPath();
    if (!extensionPath) {
        console.error("Extension path is invalid - loadTemplateFiles. Exiting.");
        return null;
    }
    const dashboardPath = path.join(extensionPath, 'src', 'dashboard');
    
    const htmlPath = path.join(dashboardPath, 'dashboard.html');
    const cssPath = path.join(dashboardPath, 'dashboard.css');
    const jsPath = path.join(dashboardPath, 'dashboard.js');
    
    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const css = fs.readFileSync(cssPath, 'utf8');
        const js = fs.readFileSync(jsPath, 'utf8');
        
        return { html, css, js };
    } catch (error) {
        console.error('Error loading dashboard template files:', error);
        return null;
    }
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

const generateTodayWorkspacesHTML = (workspaces) => {
    if (workspaces.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">description</span>
                </div>
                <p>No screen time data for today yet.</p>
            </div>
        `;
    }
    
    return `
        <ul class="workspace-list">
            ${workspaces.map(ws => `
                <li class="workspace-item">
                    <div class="workspace-info">
                        <div class="workspace-name">${escapeHtml(ws.name)}</div>
                        <div class="workspace-path">${escapeHtml(ws.fullPath)}</div>
                    </div>
                    <div class="workspace-time">${ws.time}</div>
                </li>
            `).join('')}
        </ul>
    `;
};

const generateHistoricalDataHTML = (allData) => {
    if (allData.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">bar_chart</span>
                </div>
                <p>No historical data available.</p>
            </div>
        `;
    }
    
    return allData.map(day => `
        <div class="date-section">
            <div class="date-header">
                <span class="date-label">${day.date}</span>
                <span class="date-total">Total: ${day.totalTime}</span>
            </div>
            <ul class="workspace-list">
                ${day.workspaces.map(ws => `
                    <li class="workspace-item">
                        <div class="workspace-info">
                            <div class="workspace-name">${escapeHtml(ws.name)}</div>
                            <div class="workspace-path">${escapeHtml(ws.fullPath)}</div>
                        </div>
                        <div class="workspace-time">${ws.time}</div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
};

const getWebviewContent = (data) => {
    const templates = loadTemplateFiles();
    if (!templates) {
        return '<html><body><h1>Error loading dashboard</h1></body></html>';
    }
    
    let html = templates.html;
    const css = templates.css;
    const js = templates.js;
    
    html = html.replace('{{CSS_CONTENT}}', css);
    
    html = html.replace('{{JS_CONTENT}}', js);
    
    html = html.replace('{{TOTAL_TIME_TODAY}}', escapeHtml(data.totalTimeToday));
    html = html.replace('{{TOTAL_TIME_ALL}}', escapeHtml(data.totalTimeAll));
    html = html.replace('{{WORKSPACE_COUNT}}', escapeHtml(data.workspaceCount.toString()));
    html = html.replace('{{DAY_COUNT}}', escapeHtml(data.dayCount.toString()));
    html = html.replace('{{TODAY_DATE}}', escapeHtml(data.today));
    
    html = html.replace('{{TODAY_WORKSPACES}}', generateTodayWorkspacesHTML(data.todayWorkspaces));
    html = html.replace('{{HISTORICAL_DATA}}', generateHistoricalDataHTML(data.allData));
    
    return html;
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
        saveScreenTimeHandler();
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

const showDashboard = (context) => {
    createDashboardPanel(context);
};

module.exports = {
    showDashboard,
    createDashboardPanel
};
