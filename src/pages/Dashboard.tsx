import { Users, CreditCard, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBookings } from '@/hooks/useBookings';
import { useExpenses } from '@/hooks/useExpenses';
import { StatCard } from '@/components/dashboard/StatCard';
import { Layout } from '@/components/layout/Layout';

const Dashboard = () => {
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { bookings, isLoading: loadingBookings } = useBookings();
  const { expenses, isLoading: loadingExpenses } = useExpenses();

  const isLoading = loadingCustomers || loadingBookings || loadingExpenses;

  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.is_paid).length;
  const unpaidBookings = bookings.filter((b) => !b.is_paid).length;
  const totalIncome = bookings.reduce((acc, b) => acc + Number(b.visa_deposit) + (b.is_paid ? Number(b.total_amount) - Number(b.visa_deposit) : 0), 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpensesAmount;

  const recentBookings = bookings.slice(0, 5);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك في نظام إدارة السندباد للعمرة</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي العملاء"
            value={totalCustomers}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="إجمالي الحجوزات"
            value={totalBookings}
            icon={CreditCard}
            variant="default"
          />
          <StatCard
            title="تم الدفع بالكامل"
            value={paidBookings}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="لم يتم الدفع"
            value={unpaidBookings}
            icon={XCircle}
            variant="accent"
          />
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title="إجمالي الإيرادات"
            value={`${totalIncome.toLocaleString('ar-EG')} ج.م`}
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="إجمالي المصروفات"
            value={`${totalExpensesAmount.toLocaleString('ar-EG')} ج.م`}
            icon={TrendingDown}
            variant="default"
          />
          <StatCard
            title="صافي الربح"
            value={`${netProfit.toLocaleString('ar-EG')} ج.م`}
            icon={netProfit >= 0 ? TrendingUp : TrendingDown}
            variant={netProfit >= 0 ? 'success' : 'accent'}
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-card rounded-xl border border-border shadow-card animate-fade-in">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">آخر الحجوزات</h2>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                لا توجد حجوزات حتى الآن
              </p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const customer = customers.find((c) => c.id === booking.customer_id);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{customer?.full_name || 'عميل غير معروف'}</p>
                        <p className="text-sm text-muted-foreground">{booking.program_name}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{Number(booking.total_amount).toLocaleString('ar-EG')} ج.م</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.is_paid
                              ? 'bg-success/10 text-success'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {booking.is_paid ? 'تم الدفع' : 'لم يتم الدفع'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
