import { Link, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
import { authApi } from "@/api/auth.api";
import { toast } from "sonner";
import { LayoutDashboard, ArrowLeftRight, Tags, Wallet, LogOut, Menu, X, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/budgets", label: "Budgets", icon: Wallet },
];

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(clearUser());
      toast.success("Logged out successfully");
    } catch {
      dispatch(clearUser());
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IndianRupee className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">ExpenseTracker</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-2", location.pathname === to && "font-semibold")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden mr-auto ml-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                <Button variant={location.pathname === to ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            <Separator className="my-2" />
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
