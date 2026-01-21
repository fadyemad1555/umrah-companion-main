import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Booking } from '@/types';

const bookingSchema = z.object({
  customerId: z.string().min(1, 'يجب اختيار العميل'),
  programName: z.string().min(2, 'اسم البرنامج مطلوب'),
  totalAmount: z.number().min(1, 'المبلغ الإجمالي مطلوب'),
  visaDeposit: z.number().min(0, 'عربون التأشيرة مطلوب'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
}

export const BookingFormDialog = ({
  open,
  onOpenChange,
  booking,
}: BookingFormDialogProps) => {
  const { customers, addBooking, updateBooking } = useStore();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: '',
      programName: '',
      totalAmount: 0,
      visaDeposit: 0,
    },
  });

  useEffect(() => {
    if (booking) {
      form.reset({
        customerId: booking.customerId,
        programName: booking.programName,
        totalAmount: booking.totalAmount,
        visaDeposit: booking.visaDeposit,
      });
    } else {
      form.reset({
        customerId: '',
        programName: '',
        totalAmount: 0,
        visaDeposit: 0,
      });
    }
  }, [booking, form]);

  const onSubmit = (data: BookingFormData) => {
    const remainingAmount = data.totalAmount - data.visaDeposit;
    
    if (booking) {
      updateBooking(booking.id, {
        ...data,
        remainingAmount,
      });
    } else {
      const newBooking: Booking = {
        id: crypto.randomUUID(),
        customerId: data.customerId,
        programName: data.programName,
        totalAmount: data.totalAmount,
        visaDeposit: data.visaDeposit,
        remainingAmount,
        isPaid: false,
        createdAt: new Date().toISOString(),
      };
      addBooking(newBooking);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {booking ? 'تعديل الحجز' : 'إضافة حجز جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العميل</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم البرنامج</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: عمرة رمضان 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ الإجمالي (ج.م)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        dir="ltr"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visaDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عربون التأشيرة (ج.م)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        dir="ltr"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                المبلغ المتبقي:{' '}
                <span className="font-semibold text-foreground">
                  {(form.watch('totalAmount') - form.watch('visaDeposit')).toLocaleString('ar-EG')} ج.م
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary">
                {booking ? 'حفظ التغييرات' : 'إضافة الحجز'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
