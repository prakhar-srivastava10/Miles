document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get entered credentials
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Retrieve stored account data (from the signup process)
  const userData = JSON.parse(localStorage.getItem('account'));

  // Simple simulation: Check if user exists and (optionally) if passwords match
  if (userData && userData.username === username) {
    // Since no complex authentication is needed,
    // we assume the password check passes if the account exists.
    // Save login state in localStorage so the user remains logged in across sessions.
    localStorage.setItem('loggedInUser', username);
    localStorage.setItem('isLoggedIn', 'true');

    // Redirect to dashboard (update the filename as you develop the dashboard page)
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid credentials or user does not exist. Please sign up.');
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode'); // Adds to <html>
    document.body.classList.add('dark-mode');              // Adds to <body>
  }
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").then(() => {
      console.log("Service Worker registered!");
    });
  });
}
