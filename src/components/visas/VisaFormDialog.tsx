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
import { useVisas, Visa } from '@/hooks/useVisas';
import { useCustomers } from '@/hooks/useCustomers';
import { cn } from '@/lib/utils';

const egyptianGovernorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج'
];

const saudiCities = [
  'مكة المكرمة', 'المدينة المنورة', 'جدة', 'الرياض', 'الدمام', 'الطائف'
];

const visaSchema = z.object({
  customerId: z.string().min(1, 'يجب اختيار العميل'),
  visaNumber: z.string().min(1, 'رقم التأشيرة مطلوب'),
  issueDate: z.date({ required_error: 'تاريخ الإصدار مطلوب' }),
  expiryDate: z.date({ required_error: 'تاريخ الانتهاء مطلوب' }),
  departureDate: z.date({ required_error: 'تاريخ الذهاب مطلوب' }),
  status: z.enum(['pending', 'issued', 'expired']),
  travelDirection: z.enum(['egypt-to-saudi', 'saudi-to-egypt']),
  fromLocation: z.string().min(1, 'مكان المغادرة مطلوب'),
  toLocation: z.string().min(1, 'مكان الوصول مطلوب'),
});

type VisaFormData = z.infer<typeof visaSchema>;

interface VisaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visa?: Visa | null;
}

export const VisaFormDialog = ({
  open,
  onOpenChange,
  visa,
}: VisaFormDialogProps) => {
  const { customers } = useCustomers();
  const { addVisa, updateVisa } = useVisas();

  const form = useForm<VisaFormData>({
    resolver: zodResolver(visaSchema),
    defaultValues: {
      customerId: '',
      visaNumber: '',
      status: 'pending',
      travelDirection: 'egypt-to-saudi',
      fromLocation: '',
      toLocation: '',
    },
  });

  const travelDirection = form.watch('travelDirection');

  useEffect(() => {
    if (visa) {
      form.reset({
        customerId: visa.customer_id,
        visaNumber: visa.visa_number,
        issueDate: visa.issue_date ? new Date(visa.issue_date) : undefined,
        expiryDate: visa.expiry_date ? new Date(visa.expiry_date) : undefined,
        departureDate: visa.departure_date ? new Date(visa.departure_date) : undefined,
        status: visa.status as 'pending' | 'issued' | 'expired',
        travelDirection: visa.travel_direction,
        fromLocation: visa.from_location,
        toLocation: visa.to_location,
      });
    } else {
      form.reset({
        customerId: '',
        visaNumber: '',
        status: 'pending',
        travelDirection: 'egypt-to-saudi',
        fromLocation: '',
        toLocation: '',
      });
    }
  }, [visa, form]);

  // Reset locations when direction changes
  useEffect(() => {
    form.setValue('fromLocation', '');
    form.setValue('toLocation', '');
  }, [travelDirection, form]);

  const onSubmit = (data: VisaFormData) => {
    const visaData = {
      customer_id: data.customerId,
      visa_number: data.visaNumber,
      issue_date: data.issueDate.toISOString().split('T')[0],
      expiry_date: data.expiryDate.toISOString().split('T')[0],
      departure_date: data.departureDate.toISOString().split('T')[0],
      status: data.status,
      travel_direction: data.travelDirection,
      from_location: data.fromLocation,
      to_location: data.toLocation,
      booking_date: visa?.booking_date || new Date().toISOString().split('T')[0],
    };

    if (visa) {
      updateVisa({ id: visa.id, ...visaData });
    } else {
      addVisa(visaData);
    }
    onOpenChange(false);
    form.reset();
  };

  const fromLocations = travelDirection === 'egypt-to-saudi' ? egyptianGovernorates : saudiCities;
  const toLocations = travelDirection === 'egypt-to-saudi' ? saudiCities : egyptianGovernorates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {visa ? 'تعديل التأشيرة' : 'إضافة تأشيرة جديدة'}
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
                          {customer.full_name}
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
              name="visaNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم التأشيرة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل رقم التأشيرة" dir="ltr" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المكان" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fromLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
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
                name="toLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>إلى</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المكان" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ الإصدار</FormLabel>
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
                              <span>اختر</span>
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

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ الانتهاء</FormLabel>
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
                              <span>اختر</span>
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
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">قيد المعالجة</SelectItem>
                      <SelectItem value="issued">صادرة</SelectItem>
                      <SelectItem value="expired">منتهية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary">
                {visa ? 'حفظ التغييرات' : 'إضافة التأشيرة'}
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
