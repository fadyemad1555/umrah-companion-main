import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';


const bookingSchema = z.object({
  customerId: z.string().min(1, 'يجب اختيار العميل'),
  programName: z.string().min(2, 'اسم البرنامج مطلوب'),
  totalAmount: z.number().min(1, 'المبلغ الإجمالي مطلوب'),
  visaDeposit: z.number().min(0, 'عربون التأشيرة مطلوب'),
  travelDirection: z.enum(['egypt-to-saudi', 'saudi-to-egypt']),
  fromLocation: z.string().min(1, 'مكان المغادرة مطلوب'),
  toLocation: z.string().min(1, 'مكان الوصول مطلوب'),
  departureDate: z.date({ required_error: 'تاريخ الذهاب مطلوب' }),
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
      travelDirection: 'egypt-to-saudi',
      fromLocation: '',
      toLocation: '',
    },
  });

  const travelDirection = form.watch('travelDirection');

  useEffect(() => {
    if (booking) {
      form.reset({
        customerId: booking.customerId,
        programName: booking.programName,
        totalAmount: booking.totalAmount,
        visaDeposit: booking.visaDeposit,
        travelDirection: booking.travelDirection,
        fromLocation: booking.fromLocation,
        toLocation: booking.toLocation,
        departureDate: new Date(booking.departureDate),
      });
    } else {
      form.reset({
        customerId: '',
        programName: '',
        totalAmount: 0,
        visaDeposit: 0,
        travelDirection: 'egypt-to-saudi',
        fromLocation: '',
        toLocation: '',
      });
    }
  }, [booking, form]);

  // Reset locations when direction changes
  useEffect(() => {
    if (!booking) {
      form.setValue('fromLocation', '');
      form.setValue('toLocation', '');
    }
  }, [travelDirection, form, booking]);

  const onSubmit = (data: BookingFormData) => {
    const remainingAmount = data.totalAmount - data.visaDeposit;
    
    if (booking) {
      updateBooking(booking.id, {
        ...data,
        remainingAmount,
        departureDate: data.departureDate.toISOString(),
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
        travelDirection: data.travelDirection,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        departureDate: data.departureDate.toISOString(),
      };
      addBooking(newBooking);
    }
    onOpenChange(false);
    form.reset();
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

            <FormField
              control={form.control}
              name="travelDirection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اتجاه السفر</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="egypt-to-saudi">من مصر إلى السعودية</SelectItem>
                      <SelectItem value="saudi-to-egypt">من السعودية إلى مصر</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>من</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: القاهرة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>إلى</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مكة المكرمة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ الذهاب</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pr-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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
