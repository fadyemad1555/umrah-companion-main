import { forwardRef } from 'react';
import { Visa, Customer } from '@/types';
import logo from '@/assets/logo.png';

interface VisaCardProps {
  visa: Visa;
  customer: Customer | undefined;
}

export const VisaCard = forwardRef<HTMLDivElement, VisaCardProps>(
  ({ visa, customer }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const getDirectionText = () => {
      if (visa.travelDirection === 'egypt-to-saudi') {
        return `من ${visa.fromLocation} إلى ${visa.toLocation}`;
      }
      return `من ${visa.fromLocation} إلى ${visa.toLocation}`;
    };

    return (
      <div
        ref={ref}
        className="bg-white p-6 rounded-xl border-2 border-primary/20 max-w-2xl mx-auto"
        style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ELSINDBAD TOURS" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-primary">السندباد للسياحة</h1>
              <p className="text-sm text-muted-foreground">ELSINDBAD TOURS</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">رقم التأشيرة</p>
            <p className="text-lg font-bold text-foreground">{visa.visaNumber}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">بيانات العميل</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">الاسم الكامل:</span>
              <span className="font-medium mr-2">{customer?.fullName || 'غير معروف'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">رقم الهاتف:</span>
              <span className="font-medium mr-2" dir="ltr">{customer?.phoneNumber || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">رقم الهوية:</span>
              <span className="font-medium mr-2" dir="ltr">{customer?.nationalId || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">البرنامج:</span>
              <span className="font-medium mr-2">{customer?.umrahProgram || '-'}</span>
            </div>
          </div>
        </div>

        {/* Travel Info */}
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">بيانات الرحلة</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <span className="text-muted-foreground">الاتجاه:</span>
              <span className="font-medium mr-2 text-primary">{getDirectionText()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">تاريخ الحجز:</span>
              <span className="font-medium mr-2">{formatDate(visa.bookingDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">تاريخ الذهاب:</span>
              <span className="font-medium mr-2">{formatDate(visa.departureDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">تاريخ الإصدار:</span>
              <span className="font-medium mr-2">{formatDate(visa.issueDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">تاريخ الانتهاء:</span>
              <span className="font-medium mr-2">{formatDate(visa.expiryDate)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          <span
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              visa.status === 'issued'
                ? 'bg-success text-success-foreground'
                : visa.status === 'pending'
                ? 'bg-warning text-warning-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {visa.status === 'issued' ? 'صادرة' : visa.status === 'pending' ? 'قيد المعالجة' : 'منتهية'}
          </span>
        </div>

        {/* Contact Info Footer */}
        <div className="border-t-2 border-primary/20 pt-4 text-center">
          <p className="text-sm font-semibold text-foreground mb-2">للتواصل معنا</p>
          <div className="flex justify-center gap-6 text-sm" dir="ltr">
            <span className="text-primary font-medium">01119452522</span>
            <span className="text-primary font-medium">01061662279</span>
            <span className="text-primary font-medium">01055779948</span>
          </div>
        </div>
      </div>
    );
  }
);

VisaCard.displayName = 'VisaCard';
