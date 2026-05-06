import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const getKey = (username) => `tasks_${username || "guest"}`;

const PAGE_SUGGESTIONS = {
  "/": [
    "Review today's enrolment numbers",
    "Check zero-revenue alerts",
    "Compare this month vs last month growth",
  ],
  "/revenue": [
    "Verify Neetprep share percentage is accurate",
    "Review centre share split",
    "Cross-check GST entries",
  ],
  "/managers": [
    "Review manager-wise growth vs last session",
    "Follow up with low-performing managers",
    "Update manager targets for this month",
  ],
  "/centres": [
    "Check new centre enrolment status",
    "Review centres with 0 students",
    "Update centre share percentages if needed",
  ],
  "/payments": [
    "Reconcile Razorpay payments",
    "Check cash-at-centre entries",
    "Review payment method trend vs last session",
  ],
};

export function useTaskStore(currentPath) {
  const { user } = useAuth();
  const key = getKey(user?.username);

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });

  // Reload from storage when user changes
  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      setTasks([]);
    }
  }, [key]);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, key]);

  const addTask = useCallback((text, context = null) => {
    if (!text.trim()) return;
    setTasks(prev => [
      {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        context, // page path this task belongs to, or null for global
      },
      ...prev,
    ]);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, []);

  const suggestions = PAGE_SUGGESTIONS[currentPath] || [];
  // Only show suggestions not already added as tasks
  const unusedSuggestions = suggestions.filter(
    s => !tasks.some(t => t.text === s)
  );

  const pendingCount = tasks.filter(t => !t.completed).length;

  return { tasks, addTask, toggleTask, deleteTask, clearCompleted, suggestions: unusedSuggestions, pendingCount };
}
