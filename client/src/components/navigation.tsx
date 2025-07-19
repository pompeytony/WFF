import { useLocation } from "wouter";
import { Link } from "wouter";

const Navigation = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/league-table", label: "League Table", icon: "fas fa-table" },
    { path: "/results", label: "Results", icon: "fas fa-history" },
    { path: "/admin", label: "Admin", icon: "fas fa-cog" },
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
                    ? "border-football-green text-football-green"
                    : "border-transparent text-gray-500 hover:text-football-green"
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
