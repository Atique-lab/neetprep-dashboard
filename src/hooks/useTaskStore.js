import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async (showLoading = true) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.name)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Task Fetch Error:", error);
        throw error;
      }
      const mappedTasks = (data || []).map(t => ({
        ...t,
        assignedBy: t.assigned_by,
        relatedTo: t.related_to,
        dueDate: t.due_date
      }));
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Critical Task Store Error:", err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time changes
    if (user?.name) {
      const channel = supabase
        .channel(`tasks_sync_${user.name}`)
        .on('postgres_changes', { 
          event: '*', 
          table: 'tasks', 
          filter: `assigned_to=eq.${user.name}` 
        }, () => {
          // Re-fetch in background without showing the loading spinner
          fetchTasks(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.name, fetchTasks]);

  useEffect(() => {
    const handleManualRefresh = () => fetchTasks();
    window.addEventListener('refresh-tasks', handleManualRefresh);
    return () => window.removeEventListener('refresh-tasks', handleManualRefresh);
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData) => {
    if (!user || !taskData.text?.trim()) return;
    
    // Optimistic update
    const tempId = Math.random().toString(36).substring(7);
    const optimisticTask = {
      id: tempId,
      text: taskData.text.trim(),
      type: taskData.type || 'General',
      priority: taskData.priority || 'Medium',
      relatedTo: taskData.relatedTo || 'Global',
      dueDate: taskData.dueDate || '',
      assigned_to: user.name,
      assignedBy: user.name,
      completed: false,
      isOptimistic: true
    };
    
    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          text: taskData.text.trim(),
          type: optimisticTask.type,
          priority: optimisticTask.priority,
          related_to: optimisticTask.relatedTo,
          due_date: optimisticTask.dueDate,
          assigned_to: user.name,
          assigned_by: user.name,
          completed: false
        }]);

      if (error) throw error;
      fetchTasks(false);
    } catch (err) {
      console.error("Error adding task:", err);
      // Revert on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  }, [user, fetchTasks]);

  const sendTaskToUser = useCallback(async (toUsername, taskData, fromName) => {
    if (!toUsername || !taskData.text?.trim()) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          text: taskData.text.trim(),
          type: taskData.type,
          priority: taskData.priority,
          related_to: taskData.relatedTo,
          assigned_to: toUsername,
          assigned_by: fromName,
          completed: false
        }]);

      if (error) throw error;
      if (toUsername === user?.name) fetchTasks(false);
    } catch (err) {
      console.error("Error sending task:", err);
    }
  }, [user, fetchTasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Error toggling task:", err);
      // Revert on error
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t));
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    const originalTasks = [...tasks];
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting task:", err);
      setTasks(originalTasks);
    }
  }, [tasks]);

  const clearCompleted = useCallback(async () => {
    if (!user) return;
    const originalTasks = [...tasks];
    // Optimistic update
    setTasks(prev => prev.filter(t => !t.completed));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('assigned_to', user.name)
        .eq('completed', true);

      if (error) throw error;
    } catch (err) {
      console.error("Error clearing completed tasks:", err);
      setTasks(originalTasks);
    }
  }, [user, tasks]);

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
    pendingCount,
    loading
  };
}
