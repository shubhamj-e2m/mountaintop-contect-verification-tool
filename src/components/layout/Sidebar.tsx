import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    FolderOpen,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../stores/projectStore';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const projects = useProjectStore(state => state.projects);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [projectsExpanded, setProjectsExpanded] = useState(true);

    // Fetch projects on mount if not already loaded (will use cache if available)
    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects(false); // false = use cache if available
        }
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/projects', icon: FolderOpen, label: 'Projects', expandable: true },
        { path: '/activity', icon: Bell, label: 'Activity' },
    ];

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'seo_analyst':
                return 'bg-info-light text-info';
            case 'content_writer':
                return 'bg-warning-light text-warning';
            case 'content_verifier':
                return 'bg-success-light text-success';
            default:
                return 'bg-bg-tertiary text-text-secondary';
        }
    };


    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'seo_analyst':
                return 'SEO Analyst';
            case 'content_writer':
                return 'Content Writer';
            case 'content_verifier':
                return 'Content Verifier';
            default:
                return role;
        }
    };


    return (
        <aside
            className={`bg-bg-secondary border-r border-border h-screen flex flex-col transition-smooth ${isCollapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
        >
            {/* Logo/Brand */}
            <div className="px-4 h-14 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <img src="/mountaintop-logo.png" alt="Mountaintop" className="h-7 object-contain" />
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-bg-tertiary rounded-md transition-smooth ml-auto"
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <div key={item.path}>
                        <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-smooth ${isActive(item.path)
                                ? 'bg-accent-light text-accent font-medium'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                }`}
                        >
                            <item.icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                            {!isCollapsed && item.expandable && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setProjectsExpanded(!projectsExpanded);
                                    }}
                                    className="ml-auto"
                                >
                                    {projectsExpanded ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>
                            )}
                        </Link>

                        {/* Projects Quick Access */}
                        {item.expandable && projectsExpanded && !isCollapsed && (
                            <div className="ml-8 mt-1 space-y-1">
                                {projects.length > 0 ? (
                                    projects.slice(0, 5).map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                            className="block px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-smooth truncate"
                                        >
                                            {project.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span className="block px-3 py-1.5 text-sm text-text-tertiary italic">
                                        No projects yet
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Admin-only Team Management Link */}
                {user?.role === 'admin' && (
                    <Link
                        to="/admin/team"
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-smooth ${isActive('/admin/team')
                            ? 'bg-accent-light text-accent font-medium'
                            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                            }`}
                    >
                        <Users size={20} />
                        {!isCollapsed && <span>Team Management</span>}
                    </Link>
                )}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
                {!isCollapsed && user && (
                    <div className="mb-3">
                        <div className="flex items-center gap-3 mb-2">
                            <img
                                src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {user.name}
                                </p>
                                <span
                                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(
                                        user.role
                                    )}`}
                                >
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary rounded-md transition-smooth"
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary rounded-md transition-smooth"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
