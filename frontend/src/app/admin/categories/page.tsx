"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus, Search, ArrowUp, ArrowDown } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  value: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category");
      }

      const savedCategory = await response.json();

      if (editingCategory) {
        setCategories(
          categories.map((cat) =>
            cat._id === editingCategory._id ? savedCategory : cat
          )
        );
      } else {
        setCategories([...categories, savedCategory]);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error instanceof Error ? error.message : "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      value: category.value,
      description: category.description || "",
      isActive: category.isActive,
      order: category.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const toggleCategoryStatus = async (
    categoryId: string,
    currentStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category status");
      }

      setCategories(
        categories.map((category) =>
          category._id === categoryId
            ? { ...category, isActive: !currentStatus }
            : category
        )
      );
    } catch (error) {
      console.error("Error updating category status:", error);
      alert("Failed to update category status");
    }
  };

  const moveCategory = async (categoryId: string, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex((cat) => cat._id === categoryId);
    if (categoryIndex === -1) return;

    const newIndex = direction === "up" ? categoryIndex - 1 : categoryIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(categoryIndex, 1);
    newCategories.splice(newIndex, 0, movedCategory);

    // Update order values
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index,
    }));

    setCategories(updatedCategories);

    // Update order in backend
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order: newIndex }),
        }
      );
    } catch (error) {
      console.error("Error updating category order:", error);
      // Revert on error
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      description: "",
      isActive: true,
      order: categories.length,
    });
    setEditingCategory(null);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      value: name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    });
  };

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600 mt-2">Manage your product categories</p>
        </div>
        <Button
          className="bg-[#8B7355] hover:bg-[#7A6449]"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Dialog outside of button area */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the category details below."
                  : "Create a new category for your products."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Active
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#8B7355] hover:bg-[#7A6449]">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories by name or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
          <CardDescription>A list of all product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {category.order}
                        </span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCategory(category._id, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveCategory(category._id, "down")}
                            disabled={index === filteredCategories.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {category.value}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                        className={
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                        onClick={() =>
                          toggleCategoryStatus(category._id, category.isActive)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
