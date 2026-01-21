import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Reports = () => {
  const { bookings, expenses, customers } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter by selected date
  const dailyBookings = bookings.filter(
    (b) => b.createdAt.split('T')[0] === selectedDate
  );
  const dailyExpenses = expenses.filter((e) => e.date === selectedDate);

  // Calculate totals
  const dailyIncome = dailyBookings.reduce(
    (acc, b) => acc + b.visaDeposit + (b.isPaid ? b.totalAmount - b.visaDeposit : 0),
    0
  );
  const dailyExpenseTotal = dailyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const dailyProfit = dailyIncome - dailyExpenseTotal;

  // Overall stats
  const totalIncome = bookings.reduce(
    (acc, b) => acc + b.visaDeposit + (b.isPaid ? b.totalAmount - b.visaDeposit : 0),
    0
  );
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remainingPayments = bookings
    .filter((b) => !b.isPaid)
    .reduce((acc, b) => acc + b.remainingAmount, 0);

  const handleExportReport = () => {
    const reportData = {
      date: selectedDate,
      dailyIncome,
      dailyExpenses: dailyExpenseTotal,
      dailyProfit,
      bookings: dailyBookings.map((b) => ({
        customer: customers.find((c) => c.id === b.customerId)?.fullName,
        program: b.programName,
        amount: b.totalAmount,
        deposit: b.visaDeposit,
        paid: b.isPaid,
      })),
      expenses: dailyExpenses,
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
              <p className="text-2xl font-bold">{totalExpenses.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div>
              <p className="text-sm opacity-90">المبالغ المتبقية</p>
              <p className="text-2xl font-bold">{remainingPayments.toLocaleString('ar-EG')} ج.م</p>
            </div>
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
                    const customer = customers.find((c) => c.id === booking.customerId);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{customer?.fullName}</p>
                          <p className="text-sm text-muted-foreground">{booking.programName}</p>
                        </div>
                        <p className="font-semibold">
                          {booking.visaDeposit.toLocaleString('ar-EG')} ج.م
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
                        {expense.amount.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
