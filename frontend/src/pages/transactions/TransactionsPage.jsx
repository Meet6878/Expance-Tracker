import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "@/api/transaction.api";
import { categoryApi } from "@/api/category.api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender,
} from "@tanstack/react-table";
import {
  Plus, Search, ArrowUpDown, Pencil, Trash2, Loader2, Filter, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/schemas/transaction.schema";

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const queryFilters = useMemo(() => ({
    ...filters,
    search: searchInput || undefined,
    page,
    limit: 10,
  }), [filters, searchInput, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", queryFilters],
    queryFn: () => transactionApi.getAll(queryFilters),
    placeholderData: (prev) => prev,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  const categories = categoriesData?.categories || [];
  const transactions = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1 };

  const createMutation = useMutation({
    mutationFn: (d) => transactionApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction created");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => transactionApi.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction updated");
      setDialogOpen(false);
      setEditingTx(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction deleted");
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete"),
  });

  const columns = useMemo(() => [
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Description <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "income" ? "default" : "destructive"}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "—",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Amount <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className={cn("font-semibold", row.original.type === "income" ? "text-green-600" : "text-red-600")}>
          {row.original.type === "income" ? "+" : "-"}{formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.paymentMethod?.replace("_", " ") || "—"}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(row.original._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination.pages,
  });

  const handleEdit = useCallback((tx) => {
    setEditingTx(tx);
    setDialogOpen(true);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value && value !== "all") {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchInput("");
    setPage(1);
  }, []);

  const hasFilters = Object.keys(filters).length > 0 || searchInput;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">{pagination.total} total transactions</p>
        </div>
        <Button onClick={() => { setEditingTx(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={filters.type || "all"} onValueChange={(v) => handleFilterChange("type", v)}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.paymentMethod || "all"} onValueChange={(v) => handleFilterChange("paymentMethod", v)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingTx(null); }}
        editingTx={editingTx}
        categories={categories}
        onSubmit={(values) => {
          if (editingTx) {
            updateMutation.mutate({ id: editingTx._id, ...values });
          } else {
            createMutation.mutate(values);
          }
        }}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
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

function TransactionDialog({ open, onOpenChange, editingTx, categories, onSubmit, isPending }) {
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      category: "",
      type: "expense",
      paymentMethod: "cash",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editingTx) {
      form.reset({
        description: editingTx.description,
        category: editingTx.category?._id || editingTx.category,
        type: editingTx.type,
        paymentMethod: editingTx.paymentMethod,
        amount: editingTx.amount,
        date: editingTx.date ? new Date(editingTx.date).toISOString().split("T")[0] : "",
      });
    } else {
      form.reset({
        description: "",
        category: "",
        type: "expense",
        paymentMethod: "cash",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [open]);

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTx ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {editingTx ? "Update the transaction details" : "Fill in the details to create a new transaction"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("category", ""); }} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input placeholder="e.g. Grocery shopping" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No categories for this type</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTx ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
