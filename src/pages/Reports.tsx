import { useState } from 'react';
import { Download, Calendar, Plus, Edit, Trash2, Check } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useExpenses } from '@/hooks/useExpenses';
import { useCustomers } from '@/hooks/useCustomers';
import { useDebts, Debt } from '@/hooks/useDebts';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DebtFormDialog } from '@/components/debts/DebtFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Reports = () => {
  const { bookings, isLoading: loadingBookings } = useBookings();
  const { expenses, isLoading: loadingExpenses } = useExpenses();
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { debts, deleteDebt, toggleDebtPaid, isLoading: loadingDebts } = useDebts();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);

  const isLoading = loadingBookings || loadingExpenses || loadingCustomers || loadingDebts;

  // Filter by selected date
  const dailyBookings = bookings.filter(
    (b) => b.created_at.split('T')[0] === selectedDate
  );
  const dailyExpenses = expenses.filter((e) => e.date === selectedDate);

  // Calculate totals
  const dailyIncome = dailyBookings.reduce(
    (acc, b) => acc + Number(b.visa_deposit) + (b.is_paid ? Number(b.total_amount) - Number(b.visa_deposit) : 0),
    0
  );
  const dailyExpenseTotal = dailyExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const dailyProfit = dailyIncome - dailyExpenseTotal;

  // Overall stats
  const totalIncome = bookings.reduce(
    (acc, b) => acc + Number(b.visa_deposit) + (b.is_paid ? Number(b.total_amount) - Number(b.visa_deposit) : 0),
    0
  );
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const remainingPayments = bookings
    .filter((b) => !b.is_paid)
    .reduce((acc, b) => acc + Number(b.remaining_amount), 0);

  // Debt calculations
  const receivables = debts.filter((d) => d.type === 'receivable' && !d.is_paid);
  const payables = debts.filter((d) => d.type === 'payable' && !d.is_paid);
  const totalReceivables = receivables.reduce((acc, d) => acc + Number(d.amount), 0);
  const totalPayables = payables.reduce((acc, d) => acc + Number(d.amount), 0);

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsDebtDialogOpen(true);
  };

  const handleDeleteDebt = (id: string) => {
    setDebtToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDebt = () => {
    if (debtToDelete) {
      deleteDebt(debtToDelete);
      setDeleteDialogOpen(false);
      setDebtToDelete(null);
    }
  };

  const handleDebtDialogClose = () => {
    setIsDebtDialogOpen(false);
    setEditingDebt(null);
  };

  const handleExportReport = () => {
    const reportData = {
      date: selectedDate,
      dailyIncome,
      dailyExpenses: dailyExpenseTotal,
      dailyProfit,
      bookings: dailyBookings.map((b) => ({
        customer: customers.find((c) => c.id === b.customer_id)?.full_name,
        program: b.program_name,
        amount: b.total_amount,
        deposit: b.visa_deposit,
        paid: b.is_paid,
      })),
      expenses: dailyExpenses,
      debts: {
        receivables: receivables.map(d => ({ person: d.person_name, amount: d.amount })),
        payables: payables.map(d => ({ person: d.person_name, amount: d.amount })),
        totalReceivables,
        totalPayables,
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">التقارير اليومية</h1>
            <p className="text-muted-foreground mt-1">كشف الحساب والتقارير المالية</p>
          </div>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-5 w-5 ml-2" />
            تصدير التقرير
          </Button>
        </div>

        {/* Date Selector */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <label className="font-medium">اختر التاريخ:</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
              dir="ltr"
            />
          </div>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">إيرادات اليوم</p>
            <p className="text-2xl font-bold text-success">
              {dailyIncome.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">مصروفات اليوم</p>
            <p className="text-2xl font-bold text-accent">
              {dailyExpenseTotal.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <p className="text-sm text-muted-foreground mb-1">صافي الربح</p>
            <p className={`text-2xl font-bold ${dailyProfit >= 0 ? 'text-success' : 'text-accent'}`}>
              {dailyProfit.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-gradient-primary text-primary-foreground rounded-xl p-6 shadow-card animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">الملخص الإجمالي</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-90">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold">{totalIncome.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div>
              <p className="text-sm opacity-90">إجمالي المصروفات</p>
              <p className="text-2xl font-bold">{totalExpensesAmount.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div>
              <p className="text-sm opacity-90">المبالغ المتبقية</p>
              <p className="text-2xl font-bold">{remainingPayments.toLocaleString('ar-EG')} ج.م</p>
            </div>
          </div>
        </div>

        {/* Debts Section */}
        <div className="bg-card rounded-xl border border-border shadow-card animate-fade-in">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">المدين والدائن</h2>
            <Button onClick={() => setIsDebtDialogOpen(true)} size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 ml-2" />
              إضافة دين
            </Button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground mb-1">إجمالي المدين (فلوس ليا)</p>
                <p className="text-2xl font-bold text-success">
                  {totalReceivables.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">إجمالي الدائن (فلوس عليا)</p>
                <p className="text-2xl font-bold text-accent">
                  {totalPayables.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
            </div>

            {/* Receivables List */}
            {receivables.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-success">المدين (فلوس ليا)</h3>
                <div className="space-y-2">
                  {receivables.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{debt.person_name}</p>
                        {debt.description && (
                          <p className="text-sm text-muted-foreground">{debt.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-success">
                          {Number(debt.amount).toLocaleString('ar-EG')} ج.م
                        </p>
                        <button
                          onClick={() => toggleDebtPaid(debt.id)}
                          className="p-2 rounded-lg hover:bg-success/20 transition-colors"
                          title="تم السداد"
                        >
                          <Check className="h-4 w-4 text-success" />
                        </button>
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payables List */}
            {payables.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-accent">الدائن (فلوس عليا)</h3>
                <div className="space-y-2">
                  {payables.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{debt.person_name}</p>
                        {debt.description && (
                          <p className="text-sm text-muted-foreground">{debt.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-accent">
                          {Number(debt.amount).toLocaleString('ar-EG')} ج.م
                        </p>
                        <button
                          onClick={() => toggleDebtPaid(debt.id)}
                          className="p-2 rounded-lg hover:bg-success/20 transition-colors"
                          title="تم السداد"
                        >
                          <Check className="h-4 w-4 text-success" />
                        </button>
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {receivables.length === 0 && payables.length === 0 && (
              <p className="text-muted-foreground text-center py-4">لا توجد ديون مسجلة</p>
            )}
          </div>
        </div>

        {/* Daily Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Bookings */}
          <div className="bg-card rounded-xl border border-border shadow-card animate-fade-in">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">حجوزات اليوم</h2>
            </div>
            <div className="p-6">
              {dailyBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد حجوزات في هذا اليوم</p>
              ) : (
                <div className="space-y-3">
                  {dailyBookings.map((booking) => {
                    const customer = customers.find((c) => c.id === booking.customer_id);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{customer?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.program_name}</p>
                        </div>
                        <p className="font-semibold">
                          {Number(booking.visa_deposit).toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Daily Expenses */}
          <div className="bg-card rounded-xl border border-border shadow-card animate-fade-in">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">مصروفات اليوم</h2>
            </div>
            <div className="p-6">
              {dailyExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد مصروفات في هذا اليوم</p>
              ) : (
                <div className="space-y-3">
                  {dailyExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                      </div>
                      <p className="font-semibold text-accent">
                        {Number(expense.amount).toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DebtFormDialog
        open={isDebtDialogOpen}
        onOpenChange={handleDebtDialogClose}
        debt={editingDebt}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الدين نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDebt} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Reports;
