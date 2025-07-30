import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  user?: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/league-table", label: "League Table", icon: "fas fa-table" },
    { path: "/results", label: "Results", icon: "fas fa-history" },

    ...(user?.isAdmin ? [
      { path: "/admin", label: "Admin", icon: "fas fa-cog" },
      { path: "/players", label: "Players", icon: "fas fa-users" },
      { path: "/predictions-overview", label: "Predictions", icon: "fas fa-clipboard-list" },
    ] : []),
  ];

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b relative">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`py-4 px-2 border-b-2 font-medium transition-colors cursor-pointer ${
                  location === item.path
                    ? "border-red-accent text-red-accent"
                    : "border-transparent text-gray-500 hover:text-red-accent"
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden relative">
          <div className="flex items-center justify-between py-4">
            <div className="text-lg font-semibold text-football-navy">
              Williams F&F League
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuClick}
              className="text-football-navy hover:bg-gray-100"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
            </Button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
              <div className="py-2">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`px-4 py-3 font-medium transition-colors cursor-pointer hover:bg-gray-50 ${
                        location === item.path
                          ? "text-red-accent bg-red-50 border-l-4 border-red-accent"
                          : "text-gray-700"
                      }`}
                      onClick={handleMobileLinkClick}
                    >
                      <i className={`${item.icon} mr-3 w-5`}></i>
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
