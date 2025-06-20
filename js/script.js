document.addEventListener("DOMContentLoaded", function () {
  // Total duration: 3 seconds delay + 1.5 seconds fade out = 4.5 seconds
  setTimeout(function () {
    // Redirect to the login page after the splash screen animation completes
    window.location.href = 'login.html';
  }, 4800);
});
