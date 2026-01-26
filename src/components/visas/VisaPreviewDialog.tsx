import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Printer, Share2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VisaCard } from './VisaCard';
import { Visa, Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface VisaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visa: Visa | null;
  customer: Customer | undefined;
}

export const VisaPreviewDialog = ({
  open,
  onOpenChange,
  visa,
  customer,
}: VisaPreviewDialogProps) => {
  const visaCardRef = useRef<HTMLDivElement>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!visa) return null;

  const handlePrintPDF = async () => {
    if (!visaCardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(visaCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`visa-${visa.visaNumber}.pdf`);
      
      toast({
        title: 'تم التصدير',
        description: 'تم تصدير التأشيرة كملف PDF بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تصدير التأشيرة',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!visaCardRef.current) return;
    
    if (!whatsappNumber) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال رقم الواتساب',
        variant: 'destructive',
      });
      return;
    }

    // Clean the phone number
    let cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '2' + cleanNumber; // Egypt country code
    }
    if (!cleanNumber.startsWith('2')) {
      cleanNumber = '2' + cleanNumber;
    }
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(visaCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 1.0);
      });

      // Try Web Share API first
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `visa-${visa.visaNumber}.png`, { type: 'image/png' });
        const shareData = {
          files: [file],
          title: `تأشيرة رقم ${visa.visaNumber}`,
          text: `تأشيرة العميل: ${customer?.fullName || 'غير معروف'}\nرقم التأشيرة: ${visa.visaNumber}\n\nالسندباد للسياحة\n01119452522 - 01061662279 - 01055779948`,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast({
            title: 'تم المشاركة',
            description: 'تم مشاركة التأشيرة بنجاح',
          });
          setIsExporting(false);
          return;
        }
      }

      // Fallback: Open WhatsApp with text message
      const message = encodeURIComponent(
        `تأشيرة العميل: ${customer?.fullName || 'غير معروف'}\n` +
        `رقم التأشيرة: ${visa.visaNumber}\n` +
        `الاتجاه: من ${visa.fromLocation} إلى ${visa.toLocation}\n` +
        `تاريخ الذهاب: ${new Date(visa.departureDate).toLocaleDateString('ar-EG')}\n\n` +
        `السندباد للسياحة\n` +
        `للتواصل: 01119452522 - 01061662279 - 01055779948`
      );
      
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
      
      toast({
        title: 'تم فتح واتساب',
        description: 'تم فتح واتساب مع رسالة التأشيرة',
      });
    } catch (error) {
      // Fallback for any error
      const message = encodeURIComponent(
        `تأشيرة العميل: ${customer?.fullName || 'غير معروف'}\n` +
        `رقم التأشيرة: ${visa.visaNumber}\n\n` +
        `السندباد للسياحة\n` +
        `للتواصل: 01119452522 - 01061662279 - 01055779948`
      );
      
      let cleanNumber = whatsappNumber.replace(/\D/g, '');
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '2' + cleanNumber;
      }
      
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>معاينة التأشيرة</span>
          </DialogTitle>
        </DialogHeader>

        {/* Visa Card Preview */}
        <div className="my-4">
          <VisaCard ref={visaCardRef} visa={visa} customer={customer} />
        </div>

        {/* Actions */}
        <div className="space-y-4 border-t pt-4">
          {/* Print PDF */}
          <Button
            onClick={handlePrintPDF}
            disabled={isExporting}
            className="w-full bg-gradient-primary"
          >
            <Printer className="h-5 w-5 ml-2" />
            {isExporting ? 'جاري التصدير...' : 'طباعة PDF'}
          </Button>

          {/* WhatsApp Share */}
          <div className="space-y-2">
            <Label>إرسال عبر واتساب</Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="رقم الواتساب (مثال: 01119452522)"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                dir="ltr"
                className="flex-1"
              />
              <Button
                onClick={handleShareWhatsApp}
                disabled={isExporting || !whatsappNumber}
                variant="outline"
                className="bg-success/10 hover:bg-success/20 text-success border-success/30"
              >
                <Share2 className="h-5 w-5 ml-2" />
                إرسال
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            <X className="h-4 w-4 ml-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
