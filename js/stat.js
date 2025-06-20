function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  // ----------------------------
  // Apply dark mode from localStorage.
  // ----------------------------
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // ----------------------------
  // Load the habit based on the URL parameter.
  // ----------------------------
  const params = new URLSearchParams(window.location.search);
  const index = params.get("index");
  let habits = JSON.parse(localStorage.getItem("habits")) || [];
  if (index === null || !habits[index]) {
    alert("Habit not found.");
    window.location.href = "dashboard.html";
    return;
  }

  let habit = habits[index];
  habit.progress = habit.progress || {};
  habit.progress.dailyHistory = habit.progress.dailyHistory || [];
  const isBinary = habit.type === "binary";

  // Recalculate progress fields from dailyHistory.
  const todayDate = getLocalDateString();

  if (isBinary) {
    habit.progress.today = habit.progress.dailyHistory.some(
      (e) => e.date === todayDate && e.value === 1
    );
  } else if (habit.type === "measurable") {
    let todayEntry = habit.progress.dailyHistory.find(
      (e) => e.date === todayDate
    );
    habit.progress.todayProgress = todayEntry ? todayEntry.value : 0;
    habit.progress.totalProgress = habit.progress.dailyHistory.reduce(
      (sum, entry) => sum + entry.value,
      0
    );
    // Check if habit became INCOMPLETE again
if (
  habit.completed && habit.totalTarget && (
    (habit.type === "binary" && habit.progress.completedDays < habit.totalTarget) ||
    (habit.type === "measurable" && habit.progress.totalProgress < habit.totalTarget)
  )
) {
  habit.completed = false;
  habits[index] = habit;
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitsLastUpdated", Date.now());
}

  }

  // ----------------------------
  // Function to render the stats view.
  // ----------------------------
  function renderStats() {
    let filteredHistory = habit.progress.dailyHistory.filter((e) => e.value > 0);
    let totalDone = isBinary
      ? filteredHistory.filter((e) => e.value === 1).length
      : filteredHistory.reduce((sum, e) => sum + e.value, 0);

    const totalTarget = habit.totalTarget ? Number(habit.totalTarget) : 0;
    const percent =
      totalTarget > 0 ? Math.min(100, (totalDone / totalTarget) * 100) : 0;

    if (totalTarget > 0) {
      document.getElementById("totalScore").textContent = percent.toFixed(0) + "%";
      document.getElementById("streak").textContent = totalTarget;
      document.getElementById("progressBar").style.width = percent + "%";
      document.getElementById("progressText").textContent = isBinary
        ? `${totalDone} days / ${totalTarget} days`
        : `${totalDone} units / ${totalTarget} units`;
    } else {
      document.querySelector(".progress-bars").style.display = "none";
      document.getElementById("totalTargetStats").style.display = "none";
    }

    const dayCount = filteredHistory.length;
    const dailyAverage = dayCount > 0 ? (totalDone / dayCount).toFixed(1) : "0";
    document.getElementById("dailyAverage").textContent = dailyAverage;

    const totalDaysCompleted = isBinary
      ? filteredHistory.filter((e) => e.value === 1).length
      : filteredHistory.length;
    document.getElementById("totalDaysCompleted").textContent = totalDaysCompleted;

    const sortedHistory = filteredHistory
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedHistory.map((entry) => {
      const dateObj = new Date(entry.date);
      return dateObj.toLocaleDateString();
    });

    const dataPoints = sortedHistory.map((entry) => entry.value);

    const ctx = document.getElementById("progressChart").getContext("2d");
    if (window.myChart) {
      window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: isBinary ? "Daily Mark" : "Daily Units",
            data: dataPoints,
            backgroundColor: "rgba(99,142,203,0.2)",
            borderColor: "rgba(99,142,203,1)",
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });

    calendar.removeAllEvents();
    filteredHistory.forEach((entry) => {
      calendar.addEvent({
        title: isBinary ? "Done" : `${entry.value} units`,
        start: entry.date,
        color: "#638ECB",
      });
    });
  }

  // Display habit name.
  document.getElementById("habitName").textContent =
    habit.name || "Unnamed Habit";

  // ----------------------------
  // Initialize FullCalendar instance.
  // ----------------------------
  const calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {customButtons: {
  customToday: {
    text: new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
    click: function () {
      calendar.today();
    }
  }
},

      initialView: "dayGridMonth",
      headerToolbar: { left: "prev,next customToday", center: "title", right: "" },
      dateClick: function (info) {
        const date = info.dateStr;
        let entry = habit.progress.dailyHistory.find((e) => e.date === date);
        let newValue = 0;

        if (isBinary) {
            
          const confirmText =
            entry && entry.value === 1
              ? `Unmark "${habit.name}" for ${date}?`
              : `Mark "${habit.name}" as completed on ${date}?`;
          const confirmed = confirm(confirmText);
          if (!confirmed) return;
          newValue = entry && entry.value === 1 ? 0 : 1;
        } else {
          const currentVal = entry ? ` (current: ${entry.value})` : "";
          const input = prompt(`Enter progress for ${date}${currentVal}:`);
          newValue = parseFloat(input);
          if (isNaN(newValue)) {
            alert("Invalid number.");
            return;
          }
        }

        if (entry) {
          if (newValue > 0) {
            entry.value = newValue;
          } else {
            habit.progress.dailyHistory = habit.progress.dailyHistory.filter(
              (e) => e.date !== date
            );

            
          }
        } else if (newValue > 0) {
          habit.progress.dailyHistory.push({ date: date, value: newValue });
        }

        // Save updated habit list
habits[index] = habit;
localStorage.setItem("habits", JSON.stringify(habits));
localStorage.setItem("habitsLastUpdated", Date.now());

// ✅ Recalculate progress values before checking goal
if (habit.type === "measurable") {
  habit.progress.totalProgress = habit.progress.dailyHistory.reduce(
    (sum, entry) => sum + entry.value,
    0
  );
  // Check if habit became INCOMPLETE again
if (
  habit.completed && habit.totalTarget && (
    (habit.type === "binary" && habit.progress.completedDays < habit.totalTarget) ||
    (habit.type === "measurable" && habit.progress.totalProgress < habit.totalTarget)
  )
) {
  habit.completed = false;
  habits[index] = habit;
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitsLastUpdated", Date.now());
}

} else if (habit.type === "binary") {
  habit.progress.completedDays = habit.progress.dailyHistory.filter(
    (e) => e.value === 1
  ).length;
}
// 👇 Check if binary habit became incomplete again
if (
  habit.completed && habit.totalTarget && (
    (habit.type === "binary" && habit.progress.completedDays < habit.totalTarget) ||
    (habit.type === "measurable" && habit.progress.totalProgress < habit.totalTarget)
  )
) {
  habit.completed = false;
  habits[index] = habit;
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitsLastUpdated", Date.now());
}


// ✅ Now check if goal is met and redirect
if (
  habit.totalTarget &&
  (
    (habit.type === "binary" && habit.progress.completedDays >= habit.totalTarget) ||
    (habit.type === "measurable" && habit.progress.totalProgress >= habit.totalTarget)
  )
) {
  habit.completed = true; // 🟢 Mark it completed
  habits[index] = habit;  // 🟢 Save back into habits list
  localStorage.setItem("habits", JSON.stringify(habits)); // 🟢 Save habits
  localStorage.setItem("habitsLastUpdated", Date.now());  // 🟢 Trigger dashboard sync

  const query = new URLSearchParams({ habitName: habit.name }).toString();
  window.location.href = `congrats.html?${query}`;
  return;
}


renderStats();

      },
    }
  );

  calendar.render();

  // Back button returns to dashboard.
  document.getElementById("backBtn").addEventListener("click", function () {
    window.location.href = "dashboard.html";
  });

  let localHabitsUpdated = localStorage.getItem("habitsLastUpdated") || "0";
  setInterval(() => {
    const storedTimestamp = localStorage.getItem("habitsLastUpdated");
    if (storedTimestamp !== localHabitsUpdated) {
      localHabitsUpdated = storedTimestamp;
      habits = JSON.parse(localStorage.getItem("habits")) || [];
      habit = habits[index];
      habit.progress = habit.progress || {};
      habit.progress.dailyHistory = habit.progress.dailyHistory || [];
      renderStats();
    }
  }, 2000);

  window.addEventListener("storage", () => {
    renderStats();
  });

  renderStats();

  
});
