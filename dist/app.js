"use strict";
// ----------------------------
// DOM Elements
// ----------------------------
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const priorityInput = document.getElementById("priorityInput");
const categoryInput = document.getElementById("categoryInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const taskCount = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filterBtn");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
const timerModeSelect = document.getElementById("timerMode");
const quoteBox = document.getElementById("quoteBox");
// ----------------------------
// State
// ----------------------------
let tasks = [];
let timer = null;
let timeLeft = 25 * 60; // seconds
let currentMode = "work";
let currentFilter = "all";
// ----------------------------
// Motivational Quotes
// ----------------------------
const quotes = [
    "Believe you can and you're halfway there.",
    "Stay focused and never give up.",
    "Small steps every day lead to big results.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else will do it for you.",
    "Success is the sum of small efforts repeated daily.",
    "Do something today that your future self will thank you for.",
    "Don't watch the clock; do what it does. Keep going.",
    "Dream it. Wish it. Do it.",
    "Great things never come from comfort zones."
];
function showRandomQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    quoteBox.textContent = quotes[index];
}
// ----------------------------
// Local Storage
// ----------------------------
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
    const saved = localStorage.getItem("tasks");
    if (saved)
        tasks = JSON.parse(saved);
}
// ----------------------------
// Task Functions
// ----------------------------
function addTask() {
    if (!taskInput.value.trim())
        return;
    const newTask = {
        id: Date.now().toString(),
        name: taskInput.value,
        deadline: deadlineInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        completed: false
    };
    tasks.push(newTask);
    taskInput.value = "";
    deadlineInput.value = "";
    categoryInput.value = "";
    saveTasks();
    renderTasks();
}
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task)
        task.completed = !task.completed;
    saveTasks();
    renderTasks();
}
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task)
        return;
    const newName = prompt("Edit task name:", task.name);
    if (newName !== null) {
        task.name = newName;
        saveTasks();
        renderTasks();
    }
}
// ----------------------------
// Filters & Search
// ----------------------------
function filterTasks(filter) {
    const now = new Date();
    return tasks.filter(task => {
        switch (filter) {
            case "all": return true;
            case "active": return !task.completed;
            case "done": return task.completed;
            case "today":
                if (!task.deadline)
                    return false;
                const taskDate = new Date(task.deadline);
                return taskDate.toDateString() === now.toDateString();
            case "overdue":
                if (!task.deadline)
                    return false;
                const deadline = new Date(task.deadline);
                return !task.completed && deadline < now;
            default: return true;
        }
    }).filter(task => {
        const search = searchInput.value.trim().toLowerCase();
        if (!search)
            return true;
        return task.name.toLowerCase().includes(search) || task.category.toLowerCase().includes(search);
    });
}
function renderTasks() {
    taskList.innerHTML = "";
    const filteredTasks = filterTasks(currentFilter);
    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "bg-white p-3 rounded-lg shadow flex justify-between items-center animate-fade-in dark:bg-gray-700";
        const textSpan = document.createElement("span");
        textSpan.textContent = `${task.name} [${task.category}] (${task.priority})`;
        if (task.completed)
            textSpan.style.textDecoration = "line-through";
        if (task.deadline && !task.completed && new Date(task.deadline) < new Date()) {
            textSpan.classList.add("overdue");
        }
        textSpan.addEventListener("click", () => toggleComplete(task.id));
        li.appendChild(textSpan);
        const btnContainer = document.createElement("div");
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.className = "mx-1";
        editBtn.addEventListener("click", () => editTask(task.id));
        btnContainer.appendChild(editBtn);
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.className = "mx-1";
        delBtn.addEventListener("click", () => deleteTask(task.id));
        btnContainer.appendChild(delBtn);
        li.appendChild(btnContainer);
        taskList.appendChild(li);
    });
    updateProgress();
}
function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% completed`;
    taskCount.textContent = `${total} tasks`;
}
// ----------------------------
// Dark Mode
// ----------------------------
darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
});
// ----------------------------
// Pomodoro Timer
// ----------------------------
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}
function startTimer() {
    if (timer)
        return;
    timer = window.setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        }
        else {
            clearInterval(timer);
            timer = null;
            alert("Time's up!");
        }
    }, 1000);
}
function pauseTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
function resetTimer() {
    switch (currentMode) {
        case "work":
            timeLeft = 25 * 60;
            break;
        case "shortBreak":
            timeLeft = 5 * 60;
            break;
        case "longBreak":
            timeLeft = 15 * 60;
            break;
    }
    updateTimerDisplay();
}
timerModeSelect.addEventListener("change", () => {
    currentMode = timerModeSelect.value;
    resetTimer();
});
startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);
// ----------------------------
// Event Listeners
// ----------------------------
addTaskBtn.addEventListener("click", addTask);
filterBtns.forEach(btn => btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    renderTasks();
}));
searchInput.addEventListener("input", renderTasks);
// ----------------------------
// Initialize
// ----------------------------
window.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    renderTasks();
    updateTimerDisplay();
    showRandomQuote();
    // Optional: change quote every 30 seconds
    setInterval(showRandomQuote, 30000);
});
