'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-hot-toast';

const CategorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().max(1000).optional().nullable(),
});

export default function CategoriesDashboardPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null); // full category object
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // id to delete (for AlertDialog)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
      else toast.error(data.error || 'Failed to fetch categories');
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setDialogOpen(true);
  }

  function openEdit(cat) {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description || '' });
    setDialogOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(values) {
    try {
      const endpoint = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include', // ensure cookies are sent
      });
      const data = await res.json();

      if (res.status === 403) {
        toast.error(
          'Forbidden — admin only. Please login with an admin account.'
        );
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || 'Operation failed');
        return;
      }

      toast.success(editingCategory ? 'Category updated' : 'Category created');
      setDialogOpen(false);
      setEditingCategory(null);
      reset();
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  }

  async function confirmDelete(id) {
    setDeleteTarget(id);
  }

  async function performDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/categories/${deleteTarget}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.status === 403) {
        toast.error(
          'Forbidden — admin only. Please login with an admin account.'
        );
        setDeleteTarget(null);
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || 'Delete failed');
      } else {
        toast.success('Category deleted');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-4">
      <Card className="max-w-4xl mx-auto mb-6">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage quiz categories
            </p>
          </div>

          <div>
            <Button onClick={openCreate}>Create Category</Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          {loading ? (
            // Please add an animation
            <div>Loading...</div>
          ) : categories.length === 0 ? (
            <div>No categories yet.</div>
          ) : (
            <Table>
              <TableCaption>All quiz categories</TableCaption>

              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Quizzes</TableHead>
                  <TableHead>Total Attempts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map(c => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {c.description}
                    </TableCell>
                    <TableCell>{c.totalQuizzes ?? 0}</TableCell>
                    <TableCell>{c.totalAttempts ?? 0}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(c._id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
                            <p>
                              Are you sure you want to delete{' '}
                              <strong>{c.name}</strong>? This cannot be undone.
                            </p>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteTarget(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={performDelete}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} className="mt-1" />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                className="mt-1"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingCategory(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingCategory
                    ? 'Updating...'
                    : 'Creating...'
                  : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
