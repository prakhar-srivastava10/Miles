document.addEventListener("DOMContentLoaded", function () {
  // (A) DARK MODE: Add dark-mode class to body if the theme is set to dark.
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // (B) LOAD REAL ACCOUNT DATA:
  // Assume the account data is stored in localStorage under the key "account".
  let account = JSON.parse(localStorage.getItem("account"));
  if (!account) {
    alert("No account information found. Please sign up first.");
    window.location.href = "signup.html";
    return;
  }
  document.getElementById("accName").value = account.name || "";

  // Populate the account information field with real data (username).
  document.getElementById("accUsername").value = account.username || "";
  
  // (C) SAVE UPDATED ACCOUNT INFO:
  // When the user clicks "Save Changes" update the account data.
  document.getElementById("saveAccountBtn").addEventListener("click", function () {
    const newUsername = document.getElementById("accUsername").value.trim();
    
    if (newUsername === "") {
      alert("Username cannot be empty.");
      return;
    }
    
    // Update the account object.
    account.username = newUsername;
    // Save the updated account object to localStorage.
    localStorage.setItem("account", JSON.stringify(account));
    alert("Account information updated successfully.");
  });
  
  // (D) CHANGE PASSWORD:
  // When the user clicks "Change Password", validate and update the password.
  document.getElementById("changePwdBtn").addEventListener("click", function () {
    const currentPwd = document.getElementById("currentPwd").value.trim();
    const newPwd = document.getElementById("newPwd").value;
    const confirmPwd = document.getElementById("confirmPwd").value;
    
    if (newPwd === "" || confirmPwd === "") {
      alert("New password fields cannot be empty.");
      return;
    }
    
    if (newPwd.length < 6) {
    alert("New password must be at least 6 characters long.");
    return;
  }
    // Compare the input current password (trimmed) with the stored password.
    if (currentPwd !== (account.password || "").trim()) {
      alert("Current password is incorrect.");
      return;
    }
    if (newPwd !== confirmPwd) {
      alert("New passwords do not match.");
      return;
    }
    
    // Update the account password.
    account.password = newPwd;
    localStorage.setItem("account", JSON.stringify(account));
    console.log("Updated account:", account);  // <- for debugging
    alert("Password changed successfully.");
    
    // Clear the password fields.
    document.getElementById("currentPwd").value = "";
    document.getElementById("newPwd").value = "";
    document.getElementById("confirmPwd").value = "";
  });
});
