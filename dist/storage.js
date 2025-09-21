export function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
export function loadTasks() {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
}
