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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCustomers, Customer } from '@/hooks/useCustomers';

const customerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
  nationalId: z.string().min(5, 'رقم الهوية غير صحيح'),
  address: z.string().optional(),
  umrahProgram: z.string().optional(),
  visaStatus: z.enum(['pending', 'processing', 'approved', 'rejected']),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export const CustomerFormDialog = ({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) => {
  const { addCustomer, updateCustomer } = useCustomers();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      nationalId: '',
      address: '',
      umrahProgram: '',
      visaStatus: 'pending',
      notes: '',
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        fullName: customer.full_name,
        phoneNumber: customer.phone_number,
        nationalId: customer.national_id,
        address: customer.address || '',
        umrahProgram: customer.umrah_program || '',
        visaStatus: customer.visa_status as 'pending' | 'processing' | 'approved' | 'rejected',
        notes: customer.notes || '',
      });
    } else {
      form.reset({
        fullName: '',
        phoneNumber: '',
        nationalId: '',
        address: '',
        umrahProgram: '',
        visaStatus: 'pending',
        notes: '',
      });
    }
  }, [customer, form]);

  const onSubmit = (data: CustomerFormData) => {
    if (customer) {
      updateCustomer({
        id: customer.id,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        national_id: data.nationalId,
        address: data.address || '',
        umrah_program: data.umrahProgram || '',
        visa_status: data.visaStatus,
        notes: data.notes || '',
      });
    } else {
      addCustomer({
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        national_id: data.nationalId,
        address: data.address || '',
        umrah_program: data.umrahProgram || '',
        visa_status: data.visaStatus,
        notes: data.notes || '',
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل الاسم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="01xxxxxxxxx" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية / جواز السفر</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الهوية" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل العنوان" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="umrahProgram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>برنامج العمرة</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم البرنامج" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visaStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة التأشيرة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="processing">جاري المعالجة</SelectItem>
                        <SelectItem value="approved">تمت الموافقة</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف أي ملاحظات..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary">
                {customer ? 'حفظ التغييرات' : 'إضافة العميل'}
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
