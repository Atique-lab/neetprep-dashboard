import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dateRange, setDateRange] = useState("all");

  // 1. Fetch Core Revenue Data
  const { 
    data: rawPayments = [], 
    isLoading: loading, 
    error, 
    refetch: refreshData,
    isRefetching: isRefreshing 
  } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch Comparison Stats (from the view)
  const { data: stats } = useQuery({
    queryKey: ['session_comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_comparison')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // 3. Filtered Data (Mainly for Manager Role-based access)
  const filteredData = useMemo(() => {
    if (!rawPayments) return [];

    const userStr = sessionStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    let filtered = rawPayments;

    // Role-based filtering
    if (user && user.role === 'manager') {
      filtered = filtered.filter(row => 
        row.manager_name?.toLowerCase() === user.name.toLowerCase()
      );
    }

    // Date range filtering
    if (dateRange !== "all") {
      filtered = filtered.filter(row => {
        const monthMap = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const rowMonth = new Date(row.payment_date).getMonth();
        return rowMonth === monthMap[dateRange];
      });
    }

    return filtered;
  }, [rawPayments, dateRange]);

  const lastSynced = rawPayments.length > 0 ? rawPayments[0].last_synced_at : null;

  return (
    <DashboardContext.Provider value={{
      rawData: rawPayments,
      filteredData,
      stats,
      loading,
      isRefreshing,
      error: error?.message,
      dateRange,
      setDateRange,
      lastSynced,
      refreshData
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(DashboardContext);
}
