import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dateRange, setDateRange] = useState("all");

  // 1. Fetch Core Revenue Data
  const { 
    data: rawPayments = [], 
    isLoading: paymentsLoading, 
    error: paymentsError,
    refetch: refreshPayments 
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

  // 2. Fetch Comparison Stats
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

  // 3. Fetch Centre Shares (Reference Data)
  const { data: centreShares = [] } = useQuery({
    queryKey: ['centre_shares'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centre_shares')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const refreshData = () => {
    refreshPayments();
  };

  const filteredData = useMemo(() => {
    if (!rawPayments) return [];
    const userStr = sessionStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    let filtered = rawPayments;

    if (user && user.role === 'manager') {
      filtered = filtered.filter(row => row.manager_name?.toLowerCase() === user.name.toLowerCase());
    }

    if (dateRange !== "all") {
      filtered = filtered.filter(row => {
        const rowMonth = new Date(row.payment_date).toLocaleString('default', { month: 'short' });
        return rowMonth === dateRange;
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
      centreShares,
      loading: paymentsLoading,
      error: paymentsError?.message,
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
