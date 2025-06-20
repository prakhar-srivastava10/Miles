function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  // --- Check login status ---
  
  if (!localStorage.getItem("loggedInUser")) {
    window.location.href = "login.html";
    return;
  }

  // --- Theme Toggle Initialization ---
  const toggleCheckbox = document.getElementById("toggleThemeCheckbox");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (toggleCheckbox) toggleCheckbox.checked = true;
  }

  if (toggleCheckbox) {
    toggleCheckbox.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // --- Add Habit Button ---
  document.getElementById("addHabitBtn").addEventListener("click", function () {
    window.location.href = "addHabitType.html";
  });

  // --- Logout Functionality ---
  document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
});


  // --- Function to Load and Render Habits ---
 function loadHabits() {
  // Load habits from localStorage (or an empty array if none)
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const container = document.getElementById("habit-container");
  container.innerHTML = "";

  // If there are no habits stored at all, show a "create habit" message and stop.
  if (habits.length === 0) {
    container.innerHTML = `
      <div class="no-habits">
        No active habits. Click the + button to add one!
      </div>`;
    document.getElementById("trophy-container").innerHTML = "";
    return;
  }

  const todayDate = getLocalDateString();
  let activeCount = 0; // count active (not completed) habits

  // Loop through each habit
  habits.forEach((habit, index) => {
    // If habit.completed is not set, default it to false.
    if (typeof habit.completed === "undefined") {
      habit.completed = false;
    }
    
    // If the habit is not completed, generate and add the card
    if (!habit.completed) {
      activeCount++; // Found one active habit
      
      // Recalculate progress information
      habit.progress = habit.progress || {};
      habit.progress.dailyHistory = habit.progress.dailyHistory || [];

      if (habit.type === "binary") {
        habit.progress.today = habit.progress.dailyHistory.some(
          e => e.date === todayDate && e.value === 1
        );
        habit.progress.completedDays = habit.progress.dailyHistory.filter(
          e => e.value === 1
        ).length;
      } else if (habit.type === "measurable") {
        let todayEntry = habit.progress.dailyHistory.find(
          e => e.date === todayDate
        );
        habit.progress.todayProgress = todayEntry ? todayEntry.value : 0;
        habit.progress.totalProgress = habit.progress.dailyHistory.reduce(
          (sum, entry) => sum + entry.value,
          0
        );
      }

      // Build card HTML depending on habit type
      let cardHTML = "";
      let indicatorHTML = "";

      if (habit.type === "binary") {
        indicatorHTML = `
          <div class="indicator ${habit.progress.today ? 'completed' : 'not-completed'}"></div>`;
        let progressBarHTML = "";
        if (habit.totalTarget) {
          let percent = (habit.progress.completedDays / habit.totalTarget) * 100;
          percent = Math.min(percent, 100);
          progressBarHTML = `
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percent}%"></div>
            </div>`;
        }
        cardHTML = `
          <div class="habit-card" data-index="${index}">
            <h3>${habit.name}</h3>
            <p>Type: Binary</p>
            <p>${indicatorHTML}</p>
            <button class="toggleBinaryBtn" data-index="${index}">
              ${habit.progress.today ? 'Unmark Today' : 'Mark Today'}
            </button>
            ${progressBarHTML}
            <button class="deleteHabitBtn" data-index="${index}">
              <img src="images/deleteIcon.png" alt="Delete" class="icons"/>
            </button>
            <button class="expandBtn" data-index="${index}">
              <img src="images/downArrow.png" alt="Expand" class="icons"/>
            </button>
            <div class="expand-section" style="display: none;">
              <div class="habit-details">
                ${habit.totalTarget ? `<p>Target: ${habit.totalTarget} days</p>` : ''}
                ${habit.extraNotes ? `<p>Extra Notes: ${habit.extraNotes}</p>` : ''}
              </div>
              <button class="editHabitBtn" data-index="${index}">Edit Habit</button>
              <button class="statsHabitBtn" data-index="${index}">View Stats</button>
            </div>
          </div>`;
      } else if (habit.type === "measurable") {
        if (habit.dailyTarget && Number(habit.dailyTarget) > 0) {
          indicatorHTML = `
            <div class="indicator ${habit.progress.todayProgress >= Number(habit.dailyTarget) ? 'completed' : 'not-completed'}"></div>`;
        } else {
          indicatorHTML = `
            <div class="indicator ${habit.progress.todayProgress > 0 ? 'completed' : 'not-completed'}"></div>`;
        }
        let dailyProgressHTML = "";
        if (habit.dailyTarget && Number(habit.dailyTarget) > 0) {
          let percentDaily = (habit.progress.todayProgress / habit.dailyTarget) * 100;
          percentDaily = Math.min(percentDaily, 100);
          dailyProgressHTML = `
            <p class="progress-label">Daily:</p>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percentDaily}%"></div>
            </div>`;
        }
        let totalProgressHTML = "";
        if (habit.totalTarget && Number(habit.totalTarget) > 0) {
          let percentTotal = (habit.progress.totalProgress / habit.totalTarget) * 100;
          percentTotal = Math.min(percentTotal, 100);
          totalProgressHTML = `
            <p class="progress-label">Total:</p>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percentTotal}%"></div>
            </div>`;
        }
        let unitsTodayDisplay = `
          <p class="units-today">Today's Progress: ${habit.progress.todayProgress} ${habit.unitMeasurement || ''}</p>`;
        cardHTML = `
          <div class="habit-card" data-index="${index}">
            <h3>${habit.name}</h3>
            <p>Type: Measurable</p>
            ${unitsTodayDisplay}
            <p>${indicatorHTML}</p>
            ${dailyProgressHTML}
            ${totalProgressHTML}
            <button class="plusBtn" data-index="${index}">+</button>
            <button class="minusBtn" data-index="${index}">-</button>
            <button class="deleteHabitBtn" data-index="${index}">
              <img src="images/deleteIcon.png" alt="Delete" class="icons"/>
            </button>
            <button class="expandBtn" data-index="${index}">
              <img src="images/downArrow.png" alt="Expand" class="icons"/>
            </button>
            <div class="expand-section" style="display: none;">
              <div class="habit-details">
                ${habit.dailyTarget && Number(habit.dailyTarget) > 0 ? `<p>Daily Target: ${habit.dailyTarget}</p>` : ''}
                ${habit.totalTarget && Number(habit.totalTarget) > 0 ? `<p>Total Target: ${habit.totalTarget}</p>` : ''}
                ${habit.extraNotes ? `<p>Extra Notes: ${habit.extraNotes}</p>` : ''}
              </div>
              <button class="editHabitBtn" data-index="${index}">Edit Habit</button>
              <button class="statsHabitBtn" data-index="${index}">View Stats</button>
            </div>
          </div>`;
      }
      container.innerHTML += cardHTML;
    }
  });

  // If no active habit was added, show the default message
  if (activeCount === 0) {
    container.innerHTML = `
      <div class="no-habits">
        No active habits. Click the + button to add one!
      </div>`;
  }

  // Save any changes (e.g., setting defaults) back to localStorage:
  localStorage.setItem("habits", JSON.stringify(habits));

  // Update the Trophy Shelf: For each completed habit, add a trophy image.
  // Update the Trophy Shelf: For each completed habit, create a trophy wrapper that includes a tooltip.
const trophyContainer = document.getElementById("trophy-container");
trophyContainer.innerHTML = "";
const completedHabits = habits.filter(h => h.completed);
completedHabits.forEach((habit, index) => {
  const trophyWrapper = document.createElement("div");
  trophyWrapper.className = "trophy-wrapper";
  trophyWrapper.setAttribute("data-name", habit.name);
  trophyWrapper.setAttribute("data-index", index);  // ✅ Add this line

  const img = document.createElement("img");
  img.src = "images/trophy.png";
  img.alt = `Trophy for ${habit.name}`;
  img.className = "trophy-image";
  trophyWrapper.appendChild(img);

  const tooltip = document.createElement("span");
  tooltip.className = "trophy-tooltip";
  tooltip.innerText = habit.name;
  trophyWrapper.appendChild(tooltip);

  trophyContainer.appendChild(trophyWrapper);
});


}


  loadHabits();

  // --- Card Button Event Delegation ---
  document.getElementById("habit-container").addEventListener("click", function (e) {
    const target = e.target.closest("button");
    if (!target) return;

    const index = target.dataset.index;
    const habits = JSON.parse(localStorage.getItem("habits")) || [];
    const todayDate = getLocalDateString();


    if (target.classList.contains("expandBtn")) {
      let card = target.closest(".habit-card");
      let expandSection = card.querySelector(".expand-section");
      if (expandSection.style.display === "none" || expandSection.style.display === "") {
        expandSection.style.display = "block";
        target.innerHTML =
          '<img src="images/upArrow.png" alt="Collapse" class="icons"/>';
      } else {
        expandSection.style.display = "none";
        target.innerHTML =
          '<img src="images/downArrow.png" alt="Expand" class="icons"/>';
      }
    } else if (target.classList.contains("toggleBinaryBtn")) {
  let habit = habits[index];
  if (habit && habit.type === "binary") {
    habit.progress = habit.progress || {};
    habit.progress.dailyHistory = habit.progress.dailyHistory || [];
    habit.progress.today = !habit.progress.today;

    const historyEntry = habit.progress.dailyHistory.find(e => e.date === todayDate);

    if (habit.progress.today) {
      if (historyEntry) {
        historyEntry.value = 1;
      } else {
        habit.progress.dailyHistory.push({ date: todayDate, value: 1 });
      }
    } else {
      if (historyEntry) {
        habit.progress.dailyHistory = habit.progress.dailyHistory.filter(e => e.date !== todayDate);
      }
    }

    // ✅ Recalculate completedDays BEFORE checking goal
    habit.progress.completedDays = habit.progress.dailyHistory.filter(e => e.value === 1).length;

    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("habitsLastUpdated", Date.now());

    // ✅ Check goal AFTER completedDays is recalculated
    if (
  habit.totalTarget &&
  habit.progress.completedDays >= habit.totalTarget
) {
  // Mark the habit as completed so it disappears from the dashboard.
  habit.completed = true;
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitsLastUpdated", Date.now());
  
//   loadHabits(); // Update the dashboard immediately
  
  const query = new URLSearchParams({ habitName: habit.name }).toString();
window.location.href = `congrats.html?${query}`;
return;

}


    loadHabits(); // Only reload if not redirecting
  }
}
 else if (target.classList.contains("plusBtn")) {
      // For measurable habits: increment today's progress and update dailyHistory.
      let habit = habits[index];
      if (habit && habit.type === "measurable") {
        habit.progress = habit.progress || {};
        habit.progress.dailyHistory = habit.progress.dailyHistory || [];
        habit.progress.todayProgress += 1;
        habit.progress.totalProgress = (habit.progress.totalProgress || 0) + 1;
        let historyEntry = habit.progress.dailyHistory.find(e => e.date === todayDate);
        if (historyEntry) {
          historyEntry.value = habit.progress.todayProgress;
        } else {
          habit.progress.dailyHistory.push({ date: todayDate, value: habit.progress.todayProgress });
        }
        localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("habitsLastUpdated", Date.now());
    
    // Check for goal completion for measurable habits
    if (habit.totalTarget && habit.progress.totalProgress >= habit.totalTarget) {
      habit.completed = true;
      localStorage.setItem("habits", JSON.stringify(habits));
      localStorage.setItem("habitsLastUpdated", Date.now());
      
      const query = new URLSearchParams({ habitName: habit.name }).toString();
      window.location.href = `congrats.html?${query}`;
      return;
  }
        loadHabits();
        // Check for goal completion
if (
  habit.totalTarget &&
  habit.progress.totalProgress >= habit.totalTarget
) {
  const query = new URLSearchParams({
    habitName: habit.name
  }).toString();
  window.location.href = `congrats.html?${query}`;
}

      }
    } else if (target.classList.contains("minusBtn")) {
      // For measurable habits: decrement today's progress and update dailyHistory.
      let habit = habits[index];
      if (habit && habit.type === "measurable") {
        habit.progress = habit.progress || {};
        habit.progress.dailyHistory = habit.progress.dailyHistory || [];
        habit.progress.todayProgress = Math.max(0, habit.progress.todayProgress - 1);
        habit.progress.totalProgress = Math.max(0, (habit.progress.totalProgress || 0) - 1);
        let historyEntry = habit.progress.dailyHistory.find(e => e.date === todayDate);
        if (historyEntry) {
          historyEntry.value = habit.progress.todayProgress;
          if (historyEntry.value === 0) {
            habit.progress.dailyHistory = habit.progress.dailyHistory.filter(e => e.date !== todayDate);
          }
        } else if (habit.progress.todayProgress > 0) {
          habit.progress.dailyHistory.push({ date: todayDate, value: habit.progress.todayProgress });
        }
        localStorage.setItem("habits", JSON.stringify(habits));
        localStorage.setItem("habitsLastUpdated", Date.now());
        // Check for goal completion for measurable habits
  if (habit.totalTarget && habit.progress.totalProgress >= habit.totalTarget) {
    // Mark habit as complete immediately:
    habit.completed = true;
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("habitsLastUpdated", Date.now());

    const query = new URLSearchParams({ habitName: habit.name }).toString();
    window.location.href = `congrats.html?${query}`;
    return;
  }
        loadHabits();
        // Check for goal completion
if (
  habit.totalTarget &&
  habit.progress.totalProgress >= habit.totalTarget
) {
  const query = new URLSearchParams({
    habitName: habit.name
  }).toString();
  window.location.href = `congrats.html?${query}`;
}

      }
    } else if (target.classList.contains("editHabitBtn")) {
      window.location.href = `editHabit.html?index=${index}`;
    } else if (target.classList.contains("statsHabitBtn")) {
      window.location.href = `stat.html?index=${index}`;
    } else if (target.classList.contains("deleteHabitBtn")) {
      habits.splice(index, 1);
      localStorage.setItem("habits", JSON.stringify(habits));
      localStorage.setItem("habitsLastUpdated", Date.now());
      loadHabits();
    }
  });

  // --- Listen for Storage Events to Sync Updates ---
  window.addEventListener("storage", function (e) {
    if (e.key === "habitsLastUpdated") {
      loadHabits();
    }
  });
  document.getElementById("trophy-container").addEventListener("click", function(e) {
    const trophyWrapper = e.target.closest(".trophy-wrapper");
    if (!trophyWrapper) return;
    
    // Toggle the options panel: If it exists, remove it.
    let options = trophyWrapper.querySelector(".trophy-options");
    if (options) {
      options.remove();
      return;
    }
    
    // Create the options panel with two buttons.
    options = document.createElement("div");
    options.className = "trophy-options";
    options.innerHTML = `
      <button class="statsBtn">Stats</button>
      <button class="deleteTrophyBtn">Delete Trophy</button>
    `;
    trophyWrapper.appendChild(options);
    
    // Trigger the animation (CSS transition will take care of the rest)
    setTimeout(() => {
      options.classList.add("active");
    }, 10);
    
    // When "Stats" is clicked, redirect to the stats page for that habit.
    options.querySelector(".statsBtn").addEventListener("click", function(e) {
  e.stopPropagation();
  const habitName = trophyWrapper.getAttribute("data-name");
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const index = habits.findIndex(h => h.name === habitName);
  if (index !== -1) {
    window.location.href = `stat.html?index=${index}`;
  } else {
    alert("Habit not found.");
  }
});

    
    // When "Delete Trophy" is clicked, delete that (completed) habit.
    options.querySelector(".deleteTrophyBtn").addEventListener("click", function(e) {
      e.stopPropagation();
      const confirmed = confirm("Warning: Deleting this trophy will permanently remove the habit and you will never be able to access it again. Are you sure?");
  
  if (!confirmed) {
    // User cancelled deletion, so do nothing
    return;
  }
      const index = parseInt(trophyWrapper.getAttribute("data-index"));
let habits = JSON.parse(localStorage.getItem("habits")) || [];
if (!isNaN(index) && habits[index]) {
  habits.splice(index, 1);
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitsLastUpdated", Date.now());
  loadHabits(); // Refresh the dashboard
} else {
  alert("Could not delete habit. Please try again.");
}

      localStorage.setItem("habits", JSON.stringify(updatedHabits));
      localStorage.setItem("habitsLastUpdated", Date.now());
      loadHabits(); // Refresh the dashboard (trophy shelf will update)
    });
  });

document.addEventListener("click", function(event) {
  // Find any trophy-wrapper that currently has options open
  const openOptions = document.querySelectorAll(".trophy-wrapper .trophy-options.active");

  openOptions.forEach(optionsPanel => {
    // If the click target is NOT inside the trophy-wrapper containing these options, close them
    if (!optionsPanel.parentElement.contains(event.target)) {
      optionsPanel.remove();
    }
  });
});


});
