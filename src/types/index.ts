export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  address: string;
  umrahProgram: string;
  visaStatus: 'pending' | 'processing' | 'approved' | 'rejected';
  notes: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  programName: string;
  totalAmount: number;
  visaDeposit: number;
  remainingAmount: number;
  isPaid: boolean;
  createdAt: string;
}

export interface Visa {
  id: string;
  customerId: string;
  visaNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'issued' | 'expired';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  paidVisas: number;
  unpaidVisas: number;
  totalIncome: number;
  totalExpenses: number;
}
