import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "@/api/budget.api";
import { categoryApi } from "@/api/category.api";
import { transactionApi } from "@/api/transaction.api";
import { formatCurrency } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Wallet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema } from "@/schemas/budget.schema";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: budgetApi.getAll,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  // Get all expense transactions to calculate spending per category
  const { data: txData } = useQuery({
    queryKey: ["transactions", { type: "expense", limit: 1000 }],
    queryFn: () => transactionApi.getAll({ type: "expense", limit: 1000 }),
  });

  const budgets = budgetsData?.data || [];
  const categories = (categoriesData?.categories || []).filter((c) => c.type === "expense");
  const transactions = txData?.data || [];

  // Calculate spending per category
  const spendingByCategory = transactions.reduce((acc, tx) => {
    const catId = tx.category?._id || tx.category;
    acc[catId] = (acc[catId] || 0) + tx.amount;
    return acc;
  }, {});

  // Categories that already have budgets
  const budgetedCategoryIds = budgets.map((b) => b.category?._id || b.category);
  const availableCategories = categories.filter((c) => !budgetedCategoryIds.includes(c._id));

  const createMutation = useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => budgetApi.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget updated");
      setDialogOpen(false);
      setEditingBudget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: budgetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set spending limits per category</p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setDialogOpen(true); }} className="gap-2" disabled={availableCategories.length === 0 && !editingBudget}>
          <Plus className="h-4 w-4" /> Add Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No budgets yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create a budget to start tracking your spending limits</p>
            <Button onClick={() => { setEditingBudget(null); setDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const catId = budget.category?._id || budget.category;
            const catName = budget.category?.name || "Unknown";
            const catIcon = budget.category?.icon || "";
            const spent = spendingByCategory[catId] || 0;
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const remaining = budget.limit - spent;
            const isOverBudget = spent > budget.limit;

            return (
              <motion.div key={budget._id} variants={item}>
                <Card className={isOverBudget ? "border-destructive/50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {catIcon && <span className="text-lg">{catIcon}</span>}
                        <CardTitle className="text-base">{catName}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingBudget(budget); setDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(budget._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>Limit: {formatCurrency(budget.limit)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={spent} max={budget.limit} className="mb-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Spent: <span className="font-medium text-foreground">{formatCurrency(spent)}</span>
                      </span>
                      <span className="text-muted-foreground">{Math.round(percentage)}%</span>
                    </div>
                    {isOverBudget ? (
                      <div className="flex items-center gap-1 mt-2 text-destructive text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Over budget by {formatCurrency(Math.abs(remaining))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatCurrency(remaining)} remaining
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingBudget(null); }}
        editingBudget={editingBudget}
        categories={editingBudget ? categories : availableCategories}
        onSubmit={(values) => {
          if (editingBudget) {
            updateMutation.mutate({ id: editingBudget._id, limit: values.limit });
          } else {
            createMutation.mutate(values);
          }
        }}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>Are you sure you want to remove this budget?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function BudgetDialog({ open, onOpenChange, editingBudget, categories, onSubmit, isPending }) {
  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { category: "", limit: "" },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editingBudget) {
      form.reset({
        category: editingBudget.category?._id || editingBudget.category,
        limit: editingBudget.limit,
      });
    } else {
      form.reset({ category: "", limit: "" });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>{editingBudget ? "Update budget limit" : "Set a spending limit for a category"}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!editingBudget}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.icon ? `${c.icon} ` : ""}{c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Limit (INR)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g. 5000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBudget ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
