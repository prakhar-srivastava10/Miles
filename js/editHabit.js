document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const index = params.get("index");
  let habits = JSON.parse(localStorage.getItem("habits")) || [];
  
  // Validate that the habit exists
  if (index === null || !habits[index]) {
    alert("Habit not found.");
    window.location.href = "dashboard.html";
    return;
  }
  
  const habit = habits[index];
  
  // Populate fields
  document.getElementById("habitName").value = habit.name || "";
  document.getElementById("extraNotes").value = habit.extraNotes || "";
  
  if (habit.type === "binary") {
    document.getElementById("binaryFields").style.display = "block";
    if (habit.totalTarget) {
      document.getElementById("totalTarget").value = habit.totalTarget;
    }
  } else if (habit.type === "measurable") {
    document.getElementById("measurableFields").style.display = "block";
    if (habit.unitMeasurement) document.getElementById("unitMeasurement").value = habit.unitMeasurement;
    if (habit.dailyTarget) document.getElementById("dailyTarget").value = habit.dailyTarget;
    if (habit.totalTarget) document.getElementById("totalTargetMeasure").value = habit.totalTarget;
  }
  
  // Handle form submit
  document.getElementById("editHabitForm").addEventListener("submit", function (e) {
    e.preventDefault();
    habit.name = document.getElementById("habitName").value.trim();
    habit.extraNotes = document.getElementById("extraNotes").value.trim();
  
    if (habit.type === "binary") {
      const totalTarget = document.getElementById("totalTarget").value;
      habit.totalTarget = totalTarget ? Number(totalTarget) : undefined;
    } else if (habit.type === "measurable") {
      const unitMeasurement = document.getElementById("unitMeasurement").value.trim();
      const dailyTarget = document.getElementById("dailyTarget").value;
      const totalTargetMeasure = document.getElementById("totalTargetMeasure").value;
      habit.unitMeasurement = unitMeasurement;
      habit.dailyTarget = dailyTarget ? Number(dailyTarget) : undefined;
      habit.totalTarget = totalTargetMeasure ? Number(totalTargetMeasure) : undefined;
    }
  
    // Update habit in localStorage
    habits[index] = habit;
    localStorage.setItem("habits", JSON.stringify(habits));
    window.location.href = "dashboard.html";
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});
