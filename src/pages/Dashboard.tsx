import { Users, CreditCard, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { Layout } from '@/components/layout/Layout';

const Dashboard = () => {
  const { customers, bookings, expenses } = useStore();

  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.isPaid).length;
  const unpaidBookings = bookings.filter((b) => !b.isPaid).length;
  const totalIncome = bookings.reduce((acc, b) => acc + b.visaDeposit + (b.isPaid ? b.totalAmount - b.visaDeposit : 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const recentBookings = bookings.slice(-5).reverse();

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
            value={`${totalExpenses.toLocaleString('ar-EG')} ج.م`}
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
                  const customer = customers.find((c) => c.id === booking.customerId);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{customer?.fullName || 'عميل غير معروف'}</p>
                        <p className="text-sm text-muted-foreground">{booking.programName}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{booking.totalAmount.toLocaleString('ar-EG')} ج.م</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.isPaid
                              ? 'bg-success/10 text-success'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {booking.isPaid ? 'تم الدفع' : 'لم يتم الدفع'}
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
