
import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Lock, Unlock, MoreVertical } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminHeader from "@/components/layout/AdminHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Add User Dialog State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        phone: "",
        role: "Family"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        try {
            if (!newUser.email || !newUser.password) {
                toast.error("Email and password are required");
                return;
            }
            await adminApi.createUser(newUser);
            toast.success("User created successfully");
            setIsAddDialogOpen(false);
            setNewUser({ email: "", password: "", phone: "", role: "Family" });
            fetchUsers();
        } catch (error) {
            toast.error(error.message || "Failed to create user");
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await adminApi.toggleUserStatus(user.id, !user.isActive);
            toast.success(`User ${user.isActive ? "blocked" : "unblocked"} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await adminApi.deleteUser(userId);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const roleDisplay = (role) => {
        if (!role) return "N/A";
        const r = role.toString().toLowerCase();
        if (r === "operationadmin") return "Operation Admin";
        return r.charAt(0).toUpperCase() + r.slice(1);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone || "").includes(searchTerm);

        const matchesRole = roleFilter === "all" || (user.role || "").toLowerCase() === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "active" && user.isActive) || 
            (statusFilter === "blocked" && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50/50">
            <AdminHeader breadcrumb="User Management" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, phone..."
                                className="pl-9 bg-white border-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="operationadmin">Op Admin</SelectItem>
                                    <SelectItem value="caregiver">Caregiver</SelectItem>
                                    <SelectItem value="family">Family</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm">Loading users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                            <p className="text-sm">No users found matching your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{user.fullName || user.email?.split('@')[0] || "N/A"}</span>
                                                    <span className="text-xs text-gray-500">ID: #{user.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm text-gray-700">{user.email}</span>
                                                    <span className="text-xs text-gray-500">{user.phone || "No phone"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-700 hover:bg-gray-100">
                                                    {roleDisplay(user.role)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge 
                                                    className={cn(
                                                        "font-medium shadow-none px-2.5 py-0.5",
                                                        user.isActive 
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {user.isActive ? "Active" : "Blocked"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem 
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={cn("gap-2", user.isActive ? "text-amber-600" : "text-emerald-600")}
                                                        >
                                                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                            {user.isActive ? "Block User" : "Unblock User"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-rose-600 gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+84 ..."
                                value={newUser.phone}
                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">User Role</Label>
                            <Select 
                                value={newUser.role} 
                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="OperationAdmin">Operation Admin</SelectItem>
                                    <SelectItem value="Caregiver">Caregiver</SelectItem>
                                    <SelectItem value="Family">Family</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddUser}>Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Users;
