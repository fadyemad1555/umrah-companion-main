import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  type: 'receivable' | 'payable';
  description: string;
  date: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export type DebtInsert = Omit<Debt, 'id' | 'created_at' | 'updated_at'>;
export type DebtUpdate = Partial<Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export const useDebts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading, error } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user,
  });

  const addDebt = useMutation({
    mutationFn: async (debt: Omit<DebtInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('debts')
        .insert({
          ...debt,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم إضافة الدين بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة الدين');
    },
  });

  const updateDebt = useMutation({
    mutationFn: async ({ id, ...updates }: DebtUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم تحديث الدين');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الدين');
    },
  });

  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('تم حذف الدين');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف الدين');
    },
  });

  const toggleDebtPaid = useMutation({
    mutationFn: async (id: string) => {
      const debt = debts.find(d => d.id === id);
      if (!debt) throw new Error('Debt not found');
      
      const { data, error } = await supabase
        .from('debts')
        .update({ is_paid: !debt.is_paid })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  return {
    debts,
    isLoading,
    error,
    addDebt: addDebt.mutate,
    updateDebt: updateDebt.mutate,
    deleteDebt: deleteDebt.mutate,
    toggleDebtPaid: toggleDebtPaid.mutate,
  };
};
