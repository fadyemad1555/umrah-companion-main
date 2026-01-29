import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Visa {
  id: string;
  user_id: string;
  customer_id: string;
  visa_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'issued' | 'expired';
  travel_direction: 'egypt-to-saudi' | 'saudi-to-egypt';
  from_location: string;
  to_location: string;
  departure_date: string | null;
  booking_date: string | null;
  created_at: string;
  updated_at: string;
}

export type VisaInsert = Omit<Visa, 'id' | 'created_at' | 'updated_at'>;
export type VisaUpdate = Partial<Omit<Visa, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export const useVisas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: visas = [], isLoading, error } = useQuery({
    queryKey: ['visas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Visa[];
    },
    enabled: !!user,
  });

  const addVisa = useMutation({
    mutationFn: async (visa: Omit<VisaInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('visas')
        .insert({
          ...visa,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visas'] });
      toast.success('تم إضافة التأشيرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة التأشيرة');
    },
  });

  const updateVisa = useMutation({
    mutationFn: async ({ id, ...updates }: VisaUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('visas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visas'] });
      toast.success('تم تحديث التأشيرة');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث التأشيرة');
    },
  });

  const deleteVisa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visas'] });
      toast.success('تم حذف التأشيرة');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف التأشيرة');
    },
  });

  return {
    visas,
    isLoading,
    error,
    addVisa: addVisa.mutate,
    updateVisa: updateVisa.mutate,
    deleteVisa: deleteVisa.mutate,
  };
};
