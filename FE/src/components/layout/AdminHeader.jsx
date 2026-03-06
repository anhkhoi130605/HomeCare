import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/lib/api";

const AdminHeader = ({ breadcrumb, searchPlaceholder = "Search..." }) => {
  const user = authApi.getCurrentUser();
  const displayName = user?.fullName || user?.email?.split('@')[0] || "Admin";
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <nav className="text-sm text-muted-foreground">
          <span>Admin</span>
          <span className="mx-2">›</span>
          <span className="text-foreground font-medium">{breadcrumb}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={searchPlaceholder} 
            className="pl-10 bg-muted/50"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        
      </div>
    </header>
  );
};

export default AdminHeader;
