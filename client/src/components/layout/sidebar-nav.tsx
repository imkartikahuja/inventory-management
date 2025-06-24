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
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/stock-movements", label: "Stock Movements", icon: ArrowRightLeft },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/summary-report", label: "Summary Report", icon: BarChart3 },
];

export function SidebarNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-6 w-6" />
          ) : (
            <X className="h-6 w-6" />
          )}
        </Button>
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r transition-transform duration-300",
          isMobile && isCollapsed && "-translate-x-full",
          isMobile ? "w-64" : "w-64"
        )}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-sidebar-foreground">
            Dagcros
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Inventory Management
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
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

      {/* Content Margin when sidebar is expanded */}
      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && "ml-64",
          isMobile && !isCollapsed && "ml-64"
        )}
      >
        {/* This div pushes the content to the right when sidebar is expanded */}
      </div>
    </>
  );
}