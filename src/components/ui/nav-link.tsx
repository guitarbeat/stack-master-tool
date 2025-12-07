import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
  matchSearch?: string;
}

export function NavLink({ 
  to, 
  icon: Icon, 
  children, 
  onClick,
  variant = "desktop",
  matchSearch
}: NavLinkProps) {
  const location = useLocation();
  
  const isActive = () => {
    const pathMatch = location.pathname === to || location.pathname.startsWith(`${to}/`);
    if (matchSearch) {
      return pathMatch && location.search.includes(matchSearch);
    }
    return pathMatch;
  };

  const baseStyles = "font-medium transition-colors flex items-center";
  
  const variantStyles = {
    desktop: cn(
      "px-4 py-2 rounded-lg text-sm",
      isActive()
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    ),
    mobile: cn(
      "w-full px-4 py-3 rounded-lg text-sm",
      isActive()
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    )
  };

  const iconMargin = variant === "mobile" ? "mr-2" : "mr-1.5";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(baseStyles, variantStyles[variant])}
    >
      {Icon && <Icon className={cn("w-4 h-4", iconMargin)} />}
      {children}
    </Link>
  );
}
