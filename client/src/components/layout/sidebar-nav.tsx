import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  BarChart3,
  LogOut,
} from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/stock-movements", label: "Stock Movements", icon: ArrowRightLeft },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function SidebarNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-sidebar border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Inventory System
        </h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  location === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
