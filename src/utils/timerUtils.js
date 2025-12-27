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
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
};

const calculateCurrentScreenTime = () => {
    const timeElapsed = (Date.now() - startTime) + accumulatedTime;
    return formatTime(timeElapsed);
}

module.exports = { startTimer, stopTimer, formatTime, calculateCurrentScreenTime };
