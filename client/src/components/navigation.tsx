import { useLocation } from "wouter";
import { Link } from "wouter";

interface NavigationProps {
  user?: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const [location] = useLocation();

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

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
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
      </div>
    </nav>
  );
};

export default Navigation;
