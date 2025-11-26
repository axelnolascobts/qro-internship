//-----------------------------------------------------
// DOM elements
const clock = document.getElementById("clock");

const startClock = document.getElementById("startClock");
const stopClock = document.getElementById("stopClock");
const startAlarm = document.getElementById("startAlarm");
const stopAlarm = document.getElementById("stopAlarm");

const alarmSound = document.getElementById("alarmSound");

// Variable defaults
let clockInterval = null; // internal clock ticks per second
stopClock.disabled = true;
stopAlarm.disabled = true;

//-----------------------------------------------------
// Clock function, events, and logic

// Updates the clock to current time irl
function updateClock() {
    const now = new Date(); // Get today's date to use time functions

    // Grab time irl
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Set the live time on screen
    clock.textContent = `${hours}:${minutes}:${seconds}`;
};

// Start Clock
startClock.addEventListener("click", () => {
    // Make the clock appear and add the clock with current time
    clock.classList.remove("hidden");
    updateClock();

    // Set the clock to tick
    clockInterval = setInterval(updateClock, 1000);

    // Disable start, enable stop
    startClock.disabled = true;
    stopClock.disabled = false;
});

// Stop Clock
stopClock.addEventListener("click", () => {
    // Stop and reset the interval to stop the clock
    clearInterval(clockInterval);
    clockInterval = null;

    // Enable start, disable stop
    startClock.disabled = false;
    stopClock.disabled = true;
});

//-----------------------------------------------------
// Alarm events, and logic

// Start Alarm
startAlarm.addEventListener("click", () => {
    // Play the alarm
    alarmSound.play();

    // Disable start, enable stop
    startAlarm.disabled = true;
    stopAlarm.disabled = false;
});

// Stop Alarm
stopAlarm.addEventListener("click", () => {
    // Pause and reset the alarm sound
    alarmSound.pause();
    alarmSound.currentTime = 0;

    // Enable start, disable stop
    startAlarm.disabled = false;
    stopAlarm.disabled = true;
});