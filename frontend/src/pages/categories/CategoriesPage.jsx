import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category.api";
import { formatDate } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Loader2, ArrowUpDown, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/schemas/category.schema";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  const categories = data?.categories || [];

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => categoryApi.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
      setDialogOpen(false);
      setEditingCat(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Category deleted");
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete"),
  });

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.icon && <span className="text-lg">{row.original.icon}</span>}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
          Created <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCat(row.original); setDialogOpen(true); }}>
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
    data: categories,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b last:border-0">
              <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent></Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button onClick={() => { setEditingCat(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 pb-0">
          <Input
            placeholder="Search categories..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm mb-4"
          />
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    <Tags className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingCat(null); }}
        editingCat={editingCat}
        onSubmit={(values) => {
          if (editingCat) {
            updateMutation.mutate({ id: editingCat._id, ...values });
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>This will also delete all transactions in this category. Are you sure?</DialogDescription>
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

function CategoryDialog({ open, onOpenChange, editingCat, onSubmit, isPending }) {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "", type: "expense" },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editingCat) {
      form.reset({ name: editingCat.name, icon: editingCat.icon || "", type: editingCat.type });
    } else {
      form.reset({ name: "", icon: "", type: "expense" });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>{editingCat ? "Update category details" : "Create a new category"}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Food & Dining" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (emoji)</FormLabel>
                  <FormControl><Input placeholder="e.g. 🍔" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCat ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
