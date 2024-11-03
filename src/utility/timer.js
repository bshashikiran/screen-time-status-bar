let startTime = null;
let accumulatedTime = 0;
let timerInterval = null;

const startTimer = (updateCallback) => {
    if (!timerInterval) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            updateCallback(formatTime());
        }, 1000);
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

module.exports = { startTimer, stopTimer, formatTime };
