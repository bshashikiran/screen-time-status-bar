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
    
    // Filter out today's date from historical data
    const historicalDates = sortedDates.filter(date => date !== today);

    const historicalByYear = {};

    historicalDates.forEach(date => {
        const [year, month] = date.split('-');
        if (!historicalByYear[year]) {
            historicalByYear[year] = {};
        }
        if (!historicalByYear[year][month]) {
            historicalByYear[year][month] = [];
        }

        const workspaces = Object.keys(allData[date]).map(ws => ({
            name: path.basename(ws) || ws,
            fullPath: ws,
            time: formatTime(allData[date][ws] || 0)
        }));
        const totalDayTime = Object.values(allData[date]).reduce((sum, time) => sum + (time || 0), 0);

        historicalByYear[year][month].push({
            date: date,
            workspaces: workspaces,
            totalTimeSeconds: totalDayTime
        });
    });

    const groupedHistoricalData = Object.keys(historicalByYear)
        .sort((a, b) => Number(b) - Number(a))
        .map(year => {
            const monthMap = historicalByYear[year];
            const months = Object.keys(monthMap)
                .sort((a, b) => Number(b) - Number(a))
                .map(month => {
                    const days = monthMap[month]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(day => ({
                            date: day.date,
                            workspaces: day.workspaces,
                            totalTime: formatTime(day.totalTimeSeconds)
                        }));

                    const monthTotal = monthMap[month].reduce((sum, day) => sum + day.totalTimeSeconds, 0);
                    return {
                        month: `${year}-${month}`,
                        days: days,
                        totalTime: formatTime(monthTotal),
                        totalTimeSeconds: monthTotal
                    };
                });

            const yearTotal = months.reduce((sum, month) => sum + month.totalTimeSeconds, 0);
            return {
                year: year,
                months: months.map(({ totalTimeSeconds, ...month }) => month),
                totalTime: formatTime(yearTotal)
            };
        });

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
        allData: groupedHistoricalData
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

const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    if (!year || !month) {
        return monthKey;
    }
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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
    
    return allData.map((yearGroup, yearIndex) => {
        const yearSectionId = `year-section-${yearIndex}`;
        return `
        <div class="year-section">
            <div class="year-header" onclick="toggleDateSection('${yearSectionId}')">
                <div class="date-header-left">
                    <span class="material-icons toggle-icon">expand_more</span>
                    <span class="date-label">${yearGroup.year}</span>
                </div>
                <span class="date-total">Total: ${yearGroup.totalTime}</span>
            </div>
            <div class="year-content" id="${yearSectionId}" style="display: none;">
                ${yearGroup.months.map((monthGroup, monthIndex) => {
                    const monthSectionId = `month-section-${yearIndex}-${monthIndex}`;
                    return `
                    <div class="month-section">
                        <div class="month-header" onclick="toggleDateSection('${monthSectionId}')">
                            <div class="date-header-left">
                                <span class="material-icons toggle-icon">expand_more</span>
                                <span class="date-label">${escapeHtml(formatMonthLabel(monthGroup.month))}</span>
                            </div>
                            <span class="date-total">Total: ${monthGroup.totalTime}</span>
                        </div>
                        <div class="month-content" id="${monthSectionId}" style="display: none;">
                            ${monthGroup.days.map((day, dayIndex) => {
                                const daySectionId = `date-section-${yearIndex}-${monthIndex}-${dayIndex}`;
                                return `
                                <div class="date-section">
                                    <div class="date-header" onclick="toggleDateSection('${daySectionId}')">
                                        <div class="date-header-left">
                                            <span class="material-icons toggle-icon">expand_more</span>
                                            <span class="date-label">${day.date}</span>
                                        </div>
                                        <span class="date-total">Total: ${day.totalTime}</span>
                                    </div>
                                    <div class="date-content" id="${daySectionId}" style="display: none;">
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
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    }).join('');
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
