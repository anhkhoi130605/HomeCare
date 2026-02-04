
import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Shield, ShieldOff, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import AdminHeader from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Assuming sonner or use standard alert

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

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
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));

            await adminApi.toggleUserStatus(userId, !currentStatus);
            // alert("User status updated"); 
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on error
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);

        const matchesRole = roleFilter === "all" || user.role?.toLowerCase() === roleFilter.toLowerCase();

        return matchesSearch && matchesRole;
    });

    return (
        <div>
            <AdminHeader breadcrumb="User Management" />

            <div className="p-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="caregiver">Caregiver</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.fullName || "N/A"}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-600">{user.email}</span>
                                                    <span className="text-xs text-muted-foreground">{user.phone || "No phone"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`capitalize ${user.role === 'Admin' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                        user.role === 'Caregiver' ? 'border-teal-200 bg-teal-50 text-teal-700' :
                                                            'border-blue-200 bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isActive ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 w-fit px-2.5 py-0.5 rounded-full border border-green-100">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-sm text-red-600 font-medium bg-red-50 w-fit px-2.5 py-0.5 rounded-full border border-red-100">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Blocked
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className={user.isActive ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"}
                                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        >
                                                            {user.isActive ? (
                                                                <>
                                                                    <ShieldOff className="w-4 h-4 mr-2" />
                                                                    Block User
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield className="w-4 h-4 mr-2" />
                                                                    Unblock User
                                                                </>
                                                            )}
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
        </div>
    );
};

export default Users;
