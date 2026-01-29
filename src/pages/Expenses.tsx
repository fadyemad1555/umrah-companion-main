import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';
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

const expenseCategories: Record<string, string> = {
  office: 'مصاريف مكتبية',
  transport: 'مواصلات',
  marketing: 'تسويق',
  salaries: 'رواتب',
  utilities: 'مرافق',
  other: 'أخرى',
};

const Expenses = () => {
  const { expenses, deleteExpense, isLoading } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expenseCategories[expense.category]?.includes(searchQuery)
  );

  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
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
            <h1 className="text-3xl font-bold text-foreground">المصروفات</h1>
            <p className="text-muted-foreground mt-1">إدارة مصروفات الشركة</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
            <Plus className="h-5 w-5 ml-2" />
            إضافة مصروف جديد
          </Button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-accent text-accent-foreground rounded-xl p-6 shadow-card animate-fade-in">
          <p className="text-sm opacity-90">إجمالي المصروفات</p>
          <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString('ar-EG')} ج.م</p>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="بحث في المصروفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الفئة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الوصف</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      لا توجد مصروفات
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        {new Date(expense.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">
                          {expenseCategories[expense.category] || expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{expense.description}</td>
                      <td className="px-6 py-4 font-semibold text-accent">
                        {Number(expense.amount).toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        expense={editingExpense}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا المصروف نهائياً. لا يمكن التراجع عن هذا الإجراء.
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

export default Expenses;
