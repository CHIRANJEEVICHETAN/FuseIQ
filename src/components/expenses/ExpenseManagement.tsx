import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Receipt, 
  Plus, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  category: 'travel' | 'meals' | 'accommodation' | 'office_supplies' | 'client_entertainment' | 'other';
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
  receipt_url: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  project_id: string | null;
  created_at: string;
}

export const ExpenseManagement = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  
  // Form state
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date>();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }

    setExpenses(data || []);
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading receipt:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !category || !amount || !description || !expenseDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let receiptUrl = null;
      
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
        if (!receiptUrl) {
          throw new Error('Failed to upload receipt');
        }
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          category: category as any,
          amount: amountNum,
          currency,
          description,
          expense_date: format(expenseDate, 'yyyy-MM-dd'),
          receipt_url: receiptUrl,
          status: 'submitted'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense submitted successfully",
      });

      // Reset form
      setCategory("");
      setAmount("");
      setCurrency("USD");
      setDescription("");
      setExpenseDate(undefined);
      setReceiptFile(null);
      setShowNewExpense(false);
      
      fetchExpenses();
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast({
        title: "Error",
        description: "Failed to submit expense",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-destructive';
      case 'submitted': return 'bg-info';
      case 'reimbursed': return 'bg-primary';
      case 'draft': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reimbursed': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'bg-primary';
      case 'meals': return 'bg-success';
      case 'accommodation': return 'bg-info';
      case 'office_supplies': return 'bg-warning';
      case 'client_entertainment': return 'bg-destructive';
      case 'other': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByStatus = (status: string) => {
    return expenses.filter(expense => expense.status === status);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Expense Management
          </h2>
          <p className="text-muted-foreground mt-1">Track and manage your business expenses</p>
        </div>
        <Button 
          onClick={() => setShowNewExpense(!showNewExpense)}
          className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold">${getTotalExpenses().toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{getExpensesByStatus('submitted').length}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{getExpensesByStatus('approved').length}</p>
                <p className="text-xs text-muted-foreground">Ready for reimbursement</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reimbursed</p>
                <p className="text-2xl font-bold">{getExpensesByStatus('reimbursed').length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Expense Form */}
      {showNewExpense && (
        <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="office_supplies">Office Supplies</SelectItem>
                      <SelectItem value="client_entertainment">Client Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-date">Expense Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gradient-glass backdrop-blur-glass-sm border-white/20",
                          !expenseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expenseDate ? format(expenseDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gradient-glass backdrop-blur-glass border-white/20">
                      <Calendar
                        mode="single"
                        selected={expenseDate}
                        onSelect={setExpenseDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-gradient-glass backdrop-blur-glass-sm border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-glass backdrop-blur-glass border-white/20">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the expense..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewExpense(false)}
                  className="bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
                >
                  {isLoading ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses History */}
      <Card className="bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Expense History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 bg-gradient-glass backdrop-blur-glass-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`${getCategoryColor(expense.category)} text-white border-white/20 text-xs`}
                      >
                        {expense.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(expense.status)} text-white border-white/20 text-xs flex items-center`}
                      >
                        {getStatusIcon(expense.status)}
                        <span className="ml-1">{expense.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {expense.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(expense.expense_date), 'MMM d, yyyy')} • 
                      Submitted {format(new Date(expense.created_at), 'MMM d, yyyy')}
                    </div>
                    {expense.rejection_reason && (
                      <div className="text-sm text-destructive mt-1">
                        Rejection reason: {expense.rejection_reason}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </div>
                    {expense.receipt_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-gradient-glass backdrop-blur-glass-sm border-white/20 hover:bg-white/20"
                        onClick={() => window.open(expense.receipt_url!, '_blank')}
                      >
                        View Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {expenses.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No expenses found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};