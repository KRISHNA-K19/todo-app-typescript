import { Task } from "./types";

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  const stored = localStorage.getItem("tasks");
  return stored ? JSON.parse(stored) : [];
}
