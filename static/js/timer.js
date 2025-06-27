// Timer logic for study session
let timer;
let remainingSeconds = 1800;
let totalSeconds = 1800;
let isPaused = false;
let isRunning = false;

function updateDisplay() {
  const min = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (remainingSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${min}:${sec}`;

  // Update circular progress bar
  const progressCircle = document.getElementById("progressCircle");
  const circumference = 2 * Math.PI * 90; // r=90
  const progress =
    ((totalSeconds - remainingSeconds) / totalSeconds) * circumference;
  progressCircle.style.strokeDashoffset = circumference - progress;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  document.getElementById("pauseTimer").disabled = false;
  document.getElementById("resetTimer").disabled = false;
  document.getElementById("startTimer").disabled = true;
  timer = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateDisplay();
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        isRunning = false;
        completeSession();
      }
    }
  }, 1000);
}

function completeSession() {
  const sessionDuration = totalSeconds;

  fetch("/api/session_complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      duration: sessionDuration,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.unlocked) {
        // Get the creature details
        fetch("/api/collection")
          .then((response) => response.json())
          .then((collectionData) => {
            const unlockedCreature = collectionData.creatures.find(
              (c) => c.id === data.creature_id
            );
            if (unlockedCreature) {
              document.getElementById("sessionResult").innerHTML = `
              <div class="alert alert-success text-center">
                <h5>🎉 Session Complete!</h5>
                <div class="mt-3 mb-3">
                  <img src="${unlockedCreature.image}" alt="${unlockedCreature.name}" style="width: 80px; height: 80px; object-fit: contain;">
                </div>
                <p><strong>You unlocked: ${unlockedCreature.name}!</strong></p>
                <p class="small">${unlockedCreature.description}</p>
                <a href="/collection" class="btn btn-primary btn-sm">View Full Beastiary</a>
              </div>`;
            }
          });
      } else {
        document.getElementById("sessionResult").innerHTML = `
        <div class="alert alert-info text-center">
          <h5>✅ Session Complete!</h5>
          <p>Amazing work! You've unlocked all available creatures.</p>
          <a href="/collection" class="btn btn-primary btn-sm">View Beastiary</a>
        </div>`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("sessionResult").innerHTML =
        '<div class="alert alert-warning">Session completed, but there was an error connecting to the server.</div>';
    });
}

function pauseTimer() {
  isPaused = !isPaused;
  document.getElementById("pauseTimer").textContent = isPaused
    ? "Resume"
    : "Pause";
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  document.getElementById("pauseTimer").textContent = "Pause";
  document.getElementById("pauseTimer").disabled = true;
  document.getElementById("resetTimer").disabled = true;
  document.getElementById("startTimer").disabled = false;
  totalSeconds =
    Math.max(1, parseInt(document.getElementById("sessionTime").value, 10)) *
    60;
  remainingSeconds = totalSeconds;
  updateDisplay();
  document.getElementById("sessionResult").innerHTML = "";
}

function setPomodoro() {
  if (!isRunning) {
    document.getElementById("sessionTime").value = 25;
    totalSeconds = 25 * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }
}

function setBreak() {
  if (!isRunning) {
    document.getElementById("sessionTime").value = 5;
    totalSeconds = 5 * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }
}

document.getElementById("startTimer").onclick = () => {
  totalSeconds =
    Math.max(1, parseInt(document.getElementById("sessionTime").value, 10)) *
    60;
  remainingSeconds = totalSeconds;
  updateDisplay();
  startTimer();
};
document.getElementById("pauseTimer").onclick = pauseTimer;
document.getElementById("resetTimer").onclick = resetTimer;
document.getElementById("pomodoroBtn").onclick = setPomodoro;
document.getElementById("breakBtn").onclick = setBreak;
document.getElementById("sessionTime").oninput = function () {
  if (!isRunning) {
    totalSeconds = Math.max(1, parseInt(this.value, 10)) * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }
};

// Pause timer if tab is hidden
window.onblur = () => {
  if (isRunning && !isPaused) pauseTimer();
};
window.onfocus = () => {
  if (isRunning && isPaused) pauseTimer();
};

updateDisplay();
