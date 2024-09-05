let isRunning = false;
let frameCount = 0;
let intervalId = null;
let fps = 24;
let filmLength = 16;
let takes = [];
let showAverage = false;
let recordingCount = 0;
let isDarkMode = false;

const frameCounter = () => {
    frameCount++;

    const seconds = (frameCount / fps).toFixed(2);
    const feet = formatFeet(frameCount, filmLength);

    document.getElementById('frameCount').innerText = `Frames: ${frameCount}`;
    document.getElementById('timeInfo').innerText = `Seconds: ${seconds}\nFps: ${fps}\nFt: ${feet}`;

    if (showAverage) {
        updateAverage();
    }
};

const formatFeet = (frames, framesPerFoot) => {
    const wholeFeet = Math.floor(frames / framesPerFoot);
    const remainingFrames = frames % framesPerFoot;
    const fraction = remainingFrames === 0 ? "" : ` ${simplifyFraction(remainingFrames, framesPerFoot)}`;
    return `${wholeFeet}${fraction}`;
};

const simplifyFraction = (numerator, denominator) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const commonDivisor = gcd(numerator, denominator);
    const simplifiedNumerator = numerator / commonDivisor;
    const simplifiedDenominator = denominator / commonDivisor;

    if (simplifiedDenominator === 1) {
        return simplifiedNumerator;
    }

    return `${simplifiedNumerator}/${simplifiedDenominator}`;
};

const updateAverage = () => {
    if (takes.length === 0) return;

    const avgFrames = Math.round(takes.reduce((sum, take) => sum + take, 0) / takes.length);
    const avgSeconds = (avgFrames / fps).toFixed(2);
    const avgFeet = formatFeet(avgFrames, filmLength);

    document.getElementById('averageFrames').innerText = `Frames: ${avgFrames}`;
    document.getElementById('averageSeconds').innerText = `Seconds: ${avgSeconds}`;
    document.getElementById('averageFeet').innerText = `Ft: ${avgFeet}`;
    document.getElementById('recordingCount').innerText = `Recording ${recordingCount}/3`;
};

const resetAverage = () => {
    takes = [];
    recordingCount = 0;
    document.getElementById('averageFrames').innerText = 'Frames: 0';
    document.getElementById('averageSeconds').innerText = 'Seconds: 0';
    document.getElementById('averageFeet').innerText = 'Ft: 0';
    document.getElementById('recordingCount').innerText = 'Recording 0/3';
};

const resetCounter = () => {
    frameCount = 0;
    document.getElementById('frameCount').innerText = "Frames: 0";
    document.getElementById('timeInfo').innerText = `Seconds: 0\nFps: ${fps}\nFt: 0`;
};

document.getElementById('startStopButton').addEventListener('click', function () {
    if (isRunning) {
        this.innerText = "Start";
        this.style.backgroundColor = "#42f55d";
        clearInterval(intervalId);
        if (frameCount > 0) {
            takes.push(frameCount);
            recordingCount++;
            if (recordingCount > 3) {
                resetAverage();
            }
            if (showAverage) {
                updateAverage();
                resetCounter(); // Reset counter when stopping if average is shown
            }
        }
    } else {
        this.innerText = "Stop";
        this.style.backgroundColor = "#f54257";
        intervalId = setInterval(frameCounter, 1000 / fps);
    }
    isRunning = !isRunning;
});

document.getElementById('resetButton').addEventListener('click', function () {
    resetCounter();
    clearInterval(intervalId);
    const startStopButton = document.getElementById('startStopButton');
    startStopButton.innerText = "Start";
    startStopButton.style.backgroundColor = "#42f55d";
    isRunning = false;
});

// Popup logic
const buttons = ['settings', 'diamond', 'donate', 'info'];
buttons.forEach(button => {
    document.getElementById(`${button}Button`).addEventListener("click", function (event) {
        event.stopPropagation();
        document.getElementById(`${button}Popup`).classList.toggle("show");
        buttons.filter(b => b !== button).forEach(b => {
            document.getElementById(`${b}Popup`).classList.remove("show");
        });
    });
});

// Close popup when clicking outside
document.addEventListener('click', function (event) {
    buttons.forEach(button => {
        const popup = document.getElementById(`${button}Popup`);
        if (popup.classList.contains('show') && !popup.contains(event.target)) {
            popup.classList.remove('show');
            if (button === 'settings') {
                saveSettings();
            }
        }
    });
});

// Prevent closing when clicking inside popup
buttons.forEach(button => {
    document.getElementById(`${button}Popup`).addEventListener('click', function (event) {
        event.stopPropagation();
    });
});

// Settings logic
const saveSettings = () => {
    fps = parseInt(document.getElementById('fpsInput').value) || 24;
    filmLength = parseInt(document.getElementById('filmLengthInput').value) || 16;
    document.getElementById('infoFps').innerText = `FPS: ${fps}`;
    document.getElementById('infoFilmLength').innerText = `${filmLength} frames of film equals 1 foot (ft)`;
    if (isRunning) {
        clearInterval(intervalId);
        intervalId = setInterval(frameCounter, 1000 / fps);
    }
};

// Toggle average display
document.getElementById('averageToggle').addEventListener('change', function () {
    showAverage = this.checked;
    document.getElementById('averageInfo').classList.toggle('hidden', !showAverage);
    resetAverage(); // Reset the average when toggling
    if (showAverage) updateAverage();
});

// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('change', function () {
    isDarkMode = this.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
});

// Set initial button color
document.getElementById('startStopButton').style.backgroundColor = "#42f55d";

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.getElementById('darkModeToggle').checked = true;
    document.body.classList.add('dark-mode');
    isDarkMode = true;
}