document.addEventListener("DOMContentLoaded", function () {
  // Total duration: 3 seconds delay + 1.5 seconds fade out = 4.5 seconds
  setTimeout(function () {
    // Redirect to the login page after the splash screen animation completes
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const targetPage = isLoggedIn ? "dashboard.html" : "login.html";
window.location.href = targetPage;

  }, 4800);
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").then(() => {
      console.log("Service Worker registered!");
    });
  });
}
