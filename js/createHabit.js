document.addEventListener("DOMContentLoaded", function() {
  // Get the query parameter to determine the type of habit
  const params = new URLSearchParams(window.location.search);
  const habitType = params.get("type");

  // Display the appropriate fields based on habit type
  if (habitType === "binary") {
    document.getElementById("binary-fields").style.display = "block";
  } else if (habitType === "measurable") {
    document.getElementById("measurable-fields").style.display = "block";
  } else {
    alert("No habit type specified. Redirecting to habit type selection.");
    window.location.href = "addHabitType.html";
  }

  // Handle form submission
  document.getElementById("habitForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const habitName = document.getElementById("habitName").value.trim();
    const extraNotes = document.getElementById("extraNotes").value.trim();

    // Create a basic habit object
    const habit = {
      name: habitName,
      type: habitType,
      extraNotes: extraNotes,
      progress: {}  // For future expansion: you can track daily progress here.
    };

    // Depending on the habit type, add specific fields
    if (habitType === "binary") {
      const totalTargetBinary = document.getElementById("totalTargetBinary").value.trim();
      if (totalTargetBinary) {
        habit.totalTarget = Number(totalTargetBinary);
      }
    } else if (habitType === "measurable") {
      const unitMeasurement = document.getElementById("unitMeasurement").value.trim();
      const dailyTarget = document.getElementById("dailyTarget").value.trim();
      const totalTargetMeasurable = document.getElementById("totalTargetMeasurable").value.trim();
      habit.unitMeasurement = unitMeasurement;
      if (dailyTarget) {
        habit.dailyTarget = Number(dailyTarget);
      }
      if (totalTargetMeasurable) {
        habit.totalTarget = Number(totalTargetMeasurable);
      }
    }

    // Retrieve existing habits from localStorage, if any
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    habits.push(habit);
    localStorage.setItem("habits", JSON.stringify(habits));

    // Redirect back to the dashboard
    window.location.href = "dashboard.html";
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

