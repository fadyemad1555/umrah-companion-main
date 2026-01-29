import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  user_id: string;
  customer_id: string;
  program_name: string;
  total_amount: number;
  visa_deposit: number;
  remaining_amount: number;
  is_paid: boolean;
  travel_direction: 'egypt-to-saudi' | 'saudi-to-egypt';
  from_location: string;
  to_location: string;
  departure_date: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export const useBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const addBooking = useMutation({
    mutationFn: async (booking: Omit<BookingInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('تم إضافة الحجز بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة الحجز');
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, ...updates }: BookingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('تم تحديث الحجز');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الحجز');
    },
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('تم حذف الحجز');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف الحجز');
    },
  });

  const togglePaymentStatus = useMutation({
    mutationFn: async (id: string) => {
      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');
      
      const { data, error } = await supabase
        .from('bookings')
        .update({
          is_paid: !booking.is_paid,
          remaining_amount: booking.is_paid ? booking.remaining_amount : 0,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    addBooking: addBooking.mutate,
    updateBooking: updateBooking.mutate,
    deleteBooking: deleteBooking.mutate,
    togglePaymentStatus: togglePaymentStatus.mutate,
  };
};
