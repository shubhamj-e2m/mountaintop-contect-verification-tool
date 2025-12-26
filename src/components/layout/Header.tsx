import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Bell, Search } from 'lucide-react';

const Header: React.FC = () => {
    const location = useLocation();

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Home', path: '/' }];

        paths.forEach((path, index) => {
            const fullPath = '/' + paths.slice(0, index + 1).join('/');
            breadcrumbs.push({
                label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
                path: fullPath,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <header className="bg-bg-secondary border-b border-border px-6 h-14 flex items-center">
            <div className="flex items-center justify-between w-full">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path}>
                            {index > 0 && <ChevronRight size={16} className="text-text-tertiary" />}
                            <Link
                                to={crumb.path}
                                className={`${index === breadcrumbs.length - 1
                                    ? 'text-text-primary font-medium'
                                    : 'text-text-secondary hover:text-text-primary'
                                    } transition-smooth`}
                            >
                                {crumb.label}
                            </Link>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-bg-tertiary rounded-md transition-smooth">
                        <Bell size={20} className="text-text-secondary" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                    </button>

                    {/* User Dropdown - Placeholder */}
                    <div className="w-8 h-8 bg-accent rounded-full"></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
