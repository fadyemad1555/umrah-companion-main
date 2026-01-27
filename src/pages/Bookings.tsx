import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingFormDialog } from '@/components/bookings/BookingFormDialog';
import { Booking } from '@/types';
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

const Bookings = () => {
  const { bookings, customers, deleteBooking, togglePaymentStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const filteredBookings = bookings.filter((booking) => {
    const customer = customers.find((c) => c.id === booking.customerId);
    return (
      customer?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.programName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete);
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الحجوزات</h1>
            <p className="text-muted-foreground mt-1">إدارة حجوزات العملاء والمدفوعات</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
            <Plus className="h-5 w-5 ml-2" />
            إضافة حجز جديد
          </Button>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="بحث بالعميل أو البرنامج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">البرنامج</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">من - إلى</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الذهاب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المبلغ الإجمالي</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">عربون التأشيرة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المتبقي</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">حالة الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      لا توجد حجوزات
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const customer = customers.find((c) => c.id === booking.customerId);
                    return (
                      <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium">{customer?.fullName || 'عميل غير معروف'}</span>
                        </td>
                        <td className="px-6 py-4">{booking.programName}</td>
                        <td className="px-6 py-4 text-sm">
                          {booking.fromLocation && booking.toLocation ? (
                            <span>{booking.fromLocation} → {booking.toLocation}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {booking.departureDate ? (
                            format(new Date(booking.departureDate), "dd/MM/yyyy", { locale: ar })
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {booking.totalAmount.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="px-6 py-4">
                          {booking.visaDeposit.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="px-6 py-4">
                          {booking.remainingAmount.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePaymentStatus(booking.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              booking.isPaid
                                ? 'bg-success text-success-foreground hover:bg-success/90'
                                : 'bg-accent text-accent-foreground hover:bg-accent/90'
                            }`}
                          >
                            {booking.isPaid ? 'تم الدفع بالكامل' : 'تم دفع الباقي'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookingFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        booking={editingBooking}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الحجز نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Bookings;
