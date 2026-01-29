import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import { useVisas, Visa } from '@/hooks/useVisas';
import { useCustomers } from '@/hooks/useCustomers';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VisaFormDialog } from '@/components/visas/VisaFormDialog';
import { VisaPreviewDialog } from '@/components/visas/VisaPreviewDialog';
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

const Visas = () => {
  const { visas, deleteVisa, isLoading } = useVisas();
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
  const [previewVisa, setPreviewVisa] = useState<Visa | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visaToDelete, setVisaToDelete] = useState<string | null>(null);

  const filteredVisas = visas.filter((visa) => {
    const customer = customers.find((c) => c.id === visa.customer_id);
    return (
      customer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.visa_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEdit = (visa: Visa) => {
    setEditingVisa(visa);
    setIsDialogOpen(true);
  };

  const handlePreview = (visa: Visa) => {
    setPreviewVisa(visa);
  };

  const handleDelete = (id: string) => {
    setVisaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (visaToDelete) {
      deleteVisa(visaToDelete);
      setDeleteDialogOpen(false);
      setVisaToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingVisa(null);
  };

  const getStatusBadge = (status: Visa['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning text-warning-foreground',
      issued: 'bg-success text-success-foreground',
      expired: 'bg-destructive text-destructive-foreground',
    };
    const labels: Record<string, string> = {
      pending: 'قيد المعالجة',
      issued: 'صادرة',
      expired: 'منتهية',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  // Convert Visa to legacy format for VisaPreviewDialog
  const convertToLegacyVisa = (visa: Visa | null) => {
    if (!visa) return undefined;
    return {
      id: visa.id,
      customerId: visa.customer_id,
      visaNumber: visa.visa_number,
      issueDate: visa.issue_date || '',
      expiryDate: visa.expiry_date || '',
      status: visa.status as 'pending' | 'issued' | 'expired',
      travelDirection: visa.travel_direction,
      fromLocation: visa.from_location,
      toLocation: visa.to_location,
      departureDate: visa.departure_date || '',
      bookingDate: visa.booking_date || '',
    };
  };

  const convertToLegacyCustomer = (customerId: string | undefined) => {
    if (!customerId) return undefined;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return undefined;
    return {
      id: customer.id,
      fullName: customer.full_name,
      phoneNumber: customer.phone_number,
      nationalId: customer.national_id,
      address: customer.address,
      umrahProgram: customer.umrah_program,
      visaStatus: customer.visa_status as 'pending' | 'processing' | 'approved' | 'rejected',
      notes: customer.notes,
      createdAt: customer.created_at,
    };
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
            <h1 className="text-3xl font-bold text-foreground">التأشيرات</h1>
            <p className="text-muted-foreground mt-1">إدارة تأشيرات العملاء</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
            <Plus className="h-5 w-5 ml-2" />
            إضافة تأشيرة جديدة
          </Button>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="بحث بالعميل أو رقم التأشيرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Visas Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">رقم التأشيرة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الاتجاه</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الحجز</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الذهاب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVisas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      لا توجد تأشيرات
                    </td>
                  </tr>
                ) : (
                  filteredVisas.map((visa) => {
                    const customer = customers.find((c) => c.id === visa.customer_id);
                    return (
                      <tr key={visa.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium">{customer?.full_name || 'عميل غير معروف'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono" dir="ltr">{visa.visa_number}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-primary">
                            {visa.from_location} → {visa.to_location}
                          </span>
                        </td>
                        <td className="px-6 py-4">{formatDate(visa.booking_date)}</td>
                        <td className="px-6 py-4">{formatDate(visa.departure_date)}</td>
                        <td className="px-6 py-4">{getStatusBadge(visa.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreview(visa)}
                              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                              title="معاينة وطباعة"
                            >
                              <Printer className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleEdit(visa)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title="تعديل"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(visa.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VisaFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        visa={editingVisa}
      />

      <VisaPreviewDialog
        open={!!previewVisa}
        onOpenChange={() => setPreviewVisa(null)}
        visa={convertToLegacyVisa(previewVisa)}
        customer={convertToLegacyCustomer(previewVisa?.customer_id)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه التأشيرة نهائياً. لا يمكن التراجع عن هذا الإجراء.
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

export default Visas;
