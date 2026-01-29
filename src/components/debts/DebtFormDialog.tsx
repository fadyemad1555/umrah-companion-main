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
import { useDebts, Debt } from '@/hooks/useDebts';

const debtSchema = z.object({
  personName: z.string().min(2, 'اسم الشخص مطلوب'),
  amount: z.number().min(1, 'المبلغ مطلوب'),
  type: z.enum(['receivable', 'payable']),
  description: z.string().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: Debt | null;
}

export const DebtFormDialog = ({
  open,
  onOpenChange,
  debt,
}: DebtFormDialogProps) => {
  const { addDebt, updateDebt } = useDebts();

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      personName: '',
      amount: 0,
      type: 'receivable',
      description: '',
    },
  });

  useEffect(() => {
    if (debt) {
      form.reset({
        personName: debt.person_name,
        amount: Number(debt.amount),
        type: debt.type,
        description: debt.description,
      });
    } else {
      form.reset({
        personName: '',
        amount: 0,
        type: 'receivable',
        description: '',
      });
    }
  }, [debt, form]);

  const onSubmit = (data: DebtFormData) => {
    if (debt) {
      updateDebt({
        id: debt.id,
        person_name: data.personName,
        amount: data.amount,
        type: data.type,
        description: data.description || '',
      });
    } else {
      addDebt({
        person_name: data.personName,
        amount: data.amount,
        type: data.type,
        description: data.description || '',
        date: new Date().toISOString().split('T')[0],
        is_paid: false,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {debt ? 'تعديل الدين' : 'إضافة دين جديد'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الشخص</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الشخص" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الدين</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="receivable">مدين (فلوس ليا)</SelectItem>
                      <SelectItem value="payable">دائن (فلوس عليا)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ج.م)</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary">
                {debt ? 'حفظ التغييرات' : 'إضافة الدين'}
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
