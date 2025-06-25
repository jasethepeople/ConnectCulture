import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Rocket, 
  Home, 
  User, 
  FileText, 
  MessageSquare, 
  Palette,
  Settings,
  LogOut,
  Menu,
  Plus,
  Store
} from "lucide-react";

export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/files", label: "Files", icon: FileText },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/apps", label: "Apps", icon: Store },
    { path: "/customize", label: "Customize", icon: Palette },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const NavLink = ({ path, label, icon: Icon, mobile = false }: { 
    path: string; 
    label: string; 
    icon: any; 
    mobile?: boolean 
  }) => {
    const isActive = location === path || (path !== "/" && location.startsWith(path));
    
    return (
      <Link href={path}>
        <Button
          variant="ghost"
          className={`${mobile ? 'w-full justify-start' : ''} transition-colors ${
            isActive 
              ? 'text-[hsl(151,100%,50%)] bg-[hsl(151,100%,50%)]/10' 
              : 'text-gray-300 hover:text-[hsl(151,100%,50%)] hover:bg-white/10'
          }`}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <Icon className={`h-4 w-4 ${mobile ? 'mr-2' : ''}`} />
          {mobile && label}
        </Button>
      </Link>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-lg flex items-center justify-center">
                <Rocket className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-bold gradient-text font-mono">SpaceLink</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Create Button */}
            <Button className="hidden sm:flex bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(217,91%,60%)] hover:scale-105 transition-transform">
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-[hsl(151,100%,50%)]/50">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-[hsl(0,79%,70%)] to-[hsl(151,100%,50%)] text-white">
                      {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-[hsl(240,29%,11%)] border-gray-700" 
                align="end" 
                forceMount
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-white">
                      {user?.displayName || user?.username || 'Space Explorer'}
                    </p>
                    <p className="w-[200px] truncate text-sm text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  <Link href="/customize" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] bg-[hsl(240,29%,11%)] border-gray-700"
              >
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] rounded-lg flex items-center justify-center">
                      <Rocket className="text-white text-sm" />
                    </div>
                    <h2 className="text-lg font-bold gradient-text font-mono">SpaceLink</h2>
                  </div>
                  
                  {navItems.map((item) => (
                    <NavLink key={item.path} {...item} mobile />
                  ))}
                  
                  <div className="pt-4 border-t border-gray-700">
                    <Button 
                      className="w-full bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(217,91%,60%)]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
