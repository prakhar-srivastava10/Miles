document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Retrieve form values
  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Simple password strength check
  if (password.length < 6) {
    alert("Please choose a stronger password (minimum 6 characters).");
    return;
  }

  // Create a user object
  const user = {
    name: name,
    username: username,
    password: password  // Note: In production, NEVER store passwords in plain text!
  };

  // Save user data to localStorage (using key "account")
  localStorage.setItem("account", JSON.stringify(user));

  // Mark the user as logged in so that the session persists across browser sessions
  localStorage.setItem("loggedInUser", username);

  // Redirect to the dashboard page
  window.location.href = "dashboard.html";
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
