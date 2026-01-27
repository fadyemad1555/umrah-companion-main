import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Booking, Expense, Visa, Debt } from '@/types';

interface AppState {
  customers: Customer[];
  bookings: Booking[];
  expenses: Expense[];
  visas: Visa[];
  debts: Debt[];
  
  // Customer actions
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Booking actions
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  togglePaymentStatus: (id: string) => void;
  
  // Expense actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Visa actions
  addVisa: (visa: Visa) => void;
  updateVisa: (id: string, visa: Partial<Visa>) => void;
  deleteVisa: (id: string) => void;

  // Debt actions
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  toggleDebtPaid: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      customers: [],
      bookings: [],
      expenses: [],
      visas: [],
      debts: [],
      
      addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),
      
      updateCustomer: (id, updatedCustomer) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updatedCustomer } : c
          ),
        })),
      
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
          bookings: state.bookings.filter((b) => b.customerId !== id),
          visas: state.visas.filter((v) => v.customerId !== id),
        })),
      
      addBooking: (booking) =>
        set((state) => ({ bookings: [...state.bookings, booking] })),
      
      updateBooking: (id, updatedBooking) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, ...updatedBooking } : b
          ),
        })),
      
      deleteBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        })),
      
      togglePaymentStatus: (id) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, isPaid: !b.isPaid, remainingAmount: b.isPaid ? b.remainingAmount : 0 } : b
          ),
        })),
      
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      
      updateExpense: (id, updatedExpense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updatedExpense } : e
          ),
        })),
      
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addVisa: (visa) =>
        set((state) => ({ visas: [...state.visas, visa] })),
      
      updateVisa: (id, updatedVisa) =>
        set((state) => ({
          visas: state.visas.map((v) =>
            v.id === id ? { ...v, ...updatedVisa } : v
          ),
        })),
      
      deleteVisa: (id) =>
        set((state) => ({
          visas: state.visas.filter((v) => v.id !== id),
        })),

      addDebt: (debt) =>
        set((state) => ({ debts: [...state.debts, debt] })),
      
      updateDebt: (id, updatedDebt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...updatedDebt } : d
          ),
        })),
      
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),

      toggleDebtPaid: (id) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, isPaid: !d.isPaid } : d
          ),
        })),
    }),
    {
      name: 'elsindbad-storage',
    }
  )
);
