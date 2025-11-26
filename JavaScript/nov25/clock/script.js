const clockDisplay = document.getElementById("clock");
const startClockBtn = document.getElementById("startClockBtn");
const stopClockBtn = document.getElementById("stopClockBtn");
const startAlarmBtn = document.getElementById("startAlarmBtn");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");

let clockInterval = null;

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`
}

function startClock() {
    clockDisplay.classList.remove("hidden");
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    startClockBtn.disabled = true;
    stopClockBtn.disabled = false;
}

function stopClock() {
    clearInterval(clockInterval);
    clockInterval = null;
    // clockDisplay.classList.add("hidden");

    startClockBtn.disabled = false;
    stopClockBtn.disabled = true;
}

const alarmAudio = new Audio("alarm.mp3");

function startAlarm() {
    alarmAudio.loop = true;
    alarmAudio.play();

    startAlarmBtn.disabled = true;
    stopAlarmBtn.disabled = false;
}

function stopAlarm() {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;

    startAlarmBtn.disabled = false;
    stopAlarmBtn.disabled = true;
}

startClockBtn.addEventListener("click", startClock);
stopClockBtn.addEventListener("click", stopClock);
startAlarmBtn.addEventListener("click", startAlarm);
stopAlarmBtn.addEventListener("click", stopAlarm);
