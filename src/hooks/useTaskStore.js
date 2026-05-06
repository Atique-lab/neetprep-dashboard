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

  // Reload from storage when user changes or when another tab/script updates it
  const refreshTasks = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      setTasks(stored);
    } catch {
      setTasks([]);
    }
  }, [key]);

  useEffect(() => {
    refreshTasks();
    
    // Listen for changes from other tabs/processes
    const handleStorageChange = (e) => {
      if (e.key === key) refreshTasks();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, refreshTasks]);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, key]);

  const addTask = useCallback((taskData, context = null) => {
    // taskData: { text, type, priority, relatedTo, dueDate }
    if (!taskData.text?.trim()) return;
    
    setTasks(prev => [
      {
        id: Date.now(),
        ...taskData,
        text: taskData.text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        context, // page path this task belongs to, or null for global
      },
      ...prev,
    ]);
  }, []);

  const sendTaskToUser = useCallback((toUsername, taskData, fromName) => {
    if (!toUsername || !taskData.text?.trim()) return;
    const targetKey = getKey(toUsername);
    let targetTasks = [];
    try {
      targetTasks = JSON.parse(localStorage.getItem(targetKey) || "[]");
    } catch {
      targetTasks = [];
    }

    const newTask = {
      id: Date.now(),
      ...taskData,
      text: `${taskData.text.trim()}`,
      assignedBy: fromName,
      completed: false,
      createdAt: new Date().toISOString(),
      context: "assigned",
    };

    localStorage.setItem(targetKey, JSON.stringify([newTask, ...targetTasks]));
    
    // Trigger storage event manually for the current window if testing in same tab
    window.dispatchEvent(new StorageEvent('storage', { key: targetKey }));
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
  const unusedSuggestions = suggestions.filter(
    s => !tasks.some(t => t.text === s)
  );

  const pendingCount = tasks.filter(t => !t.completed).length;

  return { 
    tasks, 
    addTask, 
    sendTaskToUser, 
    toggleTask, 
    deleteTask, 
    clearCompleted, 
    suggestions: unusedSuggestions, 
    pendingCount 
  };
}
