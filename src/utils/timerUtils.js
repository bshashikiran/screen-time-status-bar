let startTime = null;
let accumulatedTime = 0;
let timerInterval = null;

const startTimer = (updateCallback, retrievedScreenTime = 0) => {
    if (accumulatedTime == 0 && retrievedScreenTime) {
        accumulatedTime = retrievedScreenTime;
    }

    if (!timerInterval) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            updateCallback(calculateCurrentScreenTime());
        }, 1000);
    }
};

const stopTimer = (isResetTime) => {
    if (isResetTime) {
        accumulatedTime = 0;
        startTime = Date.now();
        return accumulatedTime;
    }

    if (timerInterval) {
        accumulatedTime += Date.now() - startTime;
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = null;
    }
    return accumulatedTime;
};

const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const days = totalDays % 30; // approximate month as 30 days
    const totalMonths = Math.floor(totalDays / 30);
    const months = totalMonths % 12;
    const years = Math.floor(totalMonths / 12);

    const parts = [];
    if (years) parts.push(`${years}y`);
    if (months) parts.push(`${months}mo`);
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
};

const calculateCurrentScreenTime = () => {
    const timeElapsed = (Date.now() - startTime) + accumulatedTime;
    return formatTime(timeElapsed);
}

const getCurrentElapsedTime = () => {
    if (startTime === null) {
        return accumulatedTime;
    }
    return (Date.now() - startTime) + accumulatedTime;
}

module.exports = { startTimer, stopTimer, formatTime, calculateCurrentScreenTime, getCurrentElapsedTime };
