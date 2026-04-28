document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get('domain');
  const unblockTime = parseInt(urlParams.get('unblockTime'), 10);

  if (domain) {
    document.getElementById('domain-name').textContent = domain;
  }

  const timeDisplay = document.getElementById('time-left');

  function updateTimer() {
    const now = Date.now();
    const diff = unblockTime - now;

    if (diff <= 0) {
      timeDisplay.textContent = "00:00:00";
      document.querySelector('h1').textContent = "Focus Time Over!";
      document.querySelector('p').textContent = "You can now access the site.";
      document.querySelector('.icon').textContent = "✅";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => num.toString().padStart(2, '0');
    timeDisplay.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  updateTimer();
  const interval = setInterval(() => {
    const diff = unblockTime - Date.now();
    if (diff <= 0) {
      clearInterval(interval);
    }
    updateTimer();
  }, 1000);

  document.getElementById('close-btn').addEventListener('click', () => {
    window.close();
  });
});
