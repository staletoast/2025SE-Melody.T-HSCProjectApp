// Timer logic for study session
let timer;
let remainingSeconds = 1800;
let isPaused = false;
let isRunning = false;

function updateDisplay() {
  const min = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const sec = (remainingSeconds % 60).toString().padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${min}:${sec}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  document.getElementById('pauseTimer').disabled = false;
  document.getElementById('resetTimer').disabled = false;
  document.getElementById('startTimer').disabled = true;
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

function pauseTimer() {
  isPaused = !isPaused;
  document.getElementById('pauseTimer').textContent = isPaused ? 'Resume' : 'Pause';
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  document.getElementById('pauseTimer').textContent = 'Pause';
  document.getElementById('pauseTimer').disabled = true;
  document.getElementById('resetTimer').disabled = true;
  document.getElementById('startTimer').disabled = false;
  remainingSeconds = Math.max(30, parseInt(document.getElementById('sessionTime').value, 10)) * 60;
  updateDisplay();
  document.getElementById('sessionResult').innerHTML = '';
}

function completeSession() {
  const sessionDuration = Math.max(30, parseInt(document.getElementById('sessionTime').value, 10)) * 60;
  
  fetch('/api/session_complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      duration: sessionDuration
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.unlocked) {
      document.getElementById('sessionResult').innerHTML = 
        '<div class="alert alert-success">' +
        '<h5>🎉 Session Complete!</h5>' +
        '<p>You unlocked a new creature! <a href="/collection" class="btn btn-primary btn-sm">View Collection</a></p>' +
        '</div>';
    } else {
      document.getElementById('sessionResult').innerHTML = 
        '<div class="alert alert-info">' +
        '<h5>✅ Session Complete!</h5>' +
        '<p>Great work! You\'ve unlocked all available creatures. <a href="/collection" class="btn btn-primary btn-sm">View Collection</a></p>' +
        '</div>';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('sessionResult').innerHTML = 
      '<div class="alert alert-warning">Session completed, but there was an error connecting to the server.</div>';
  });
}

document.getElementById('startTimer').onclick = () => {
  remainingSeconds = Math.max(30, parseInt(document.getElementById('sessionTime').value, 10)) * 60;
  updateDisplay();
  startTimer();
};
document.getElementById('pauseTimer').onclick = pauseTimer;
document.getElementById('resetTimer').onclick = resetTimer;
document.getElementById('sessionTime').oninput = function() {
  if (!isRunning) {
    remainingSeconds = Math.max(30, parseInt(this.value, 10)) * 60;
    updateDisplay();
  }
};

// Pause timer if tab is hidden
window.onblur = () => { if (isRunning && !isPaused) pauseTimer(); };
window.onfocus = () => { if (isRunning && isPaused) pauseTimer(); };

updateDisplay();
