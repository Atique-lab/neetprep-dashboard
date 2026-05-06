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

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', table: 'tasks', filter: `assigned_to=eq.${user?.name}` }, () => {
        fetchTasks();
      })
      .subscribe();

    // Listen for manual refresh events from Header
    const handleManualRefresh = () => fetchTasks();
    window.addEventListener('refresh-tasks', handleManualRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('refresh-tasks', handleManualRefresh);
    };
  }, [user, fetchTasks]);

  const addTask = useCallback(async (taskData) => {
    if (!user || !taskData.text?.trim()) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          text: taskData.text.trim(),
          type: taskData.type,
          priority: taskData.priority,
          related_to: taskData.relatedTo,
          due_date: taskData.dueDate,
          assigned_to: user.name,
          assigned_by: user.name,
          completed: false
        }]);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
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
      // If we assigned to ourselves, refresh. Otherwise, it doesn't affect our list.
      if (toUsername === user?.name) fetchTasks();
    } catch (err) {
      console.error("Error sending task:", err);
    }
  }, [user, fetchTasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  }, [tasks, fetchTasks]);

  const deleteTask = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }, [fetchTasks]);

  const clearCompleted = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('assigned_to', user.name)
        .eq('completed', true);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("Error clearing completed tasks:", err);
    }
  }, [user, fetchTasks]);

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
