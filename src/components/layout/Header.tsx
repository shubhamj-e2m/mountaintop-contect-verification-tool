import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, HelpCircle, X, FolderOpen, FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { getUnreadCount } from '../../services/notificationService';

interface SearchResult {
    type: 'project' | 'page';
    id: string;
    projectId?: string;
    name: string;
    description?: string;
    path: string;
}

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const projects = useProjectStore(state => state.projects);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);

    // Generate breadcrumbs from current path with intelligent name lookup
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Home', path: '/' }];

        paths.forEach((path, index) => {
            const fullPath = '/' + paths.slice(0, index + 1).join('/');
            let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

            // Check if this looks like a UUID (project or page ID)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path);

            if (isUUID) {
                // Look up project name
                const project = projects.find(p => p.id === path);
                if (project) {
                    label = project.name;
                } else {
                    // Look up page name
                    for (const proj of projects) {
                        const page = proj.pages.find(pg => pg.id === path);
                        if (page) {
                            label = page.name;
                            break;
                        }
                    }
                }
            }

            breadcrumbs.push({
                label,
                path: fullPath,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Fetch unread count on mount
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
    }, []);

    // Search results
    const searchResults = useMemo<SearchResult[]>(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            return [];
        }

        const query = searchQuery.toLowerCase().trim();
        const results: SearchResult[] = [];

        // Search projects
        projects.forEach(project => {
            const matchesName = project.name.toLowerCase().includes(query);
            const matchesUrl = project.website_url.toLowerCase().includes(query);
            const matchesDesc = project.description?.toLowerCase().includes(query);

            if (matchesName || matchesUrl || matchesDesc) {
                results.push({
                    type: 'project',
                    id: project.id,
                    name: project.name,
                    description: project.description || project.website_url,
                    path: `/projects/${project.id}`,
                });
            }

            // Search pages within this project
            project.pages?.forEach(page => {
                const matchesPageName = page.name.toLowerCase().includes(query);
                const matchesPageSlug = page.slug.toLowerCase().includes(query);

                if (matchesPageName || matchesPageSlug) {
                    results.push({
                        type: 'page',
                        id: page.id,
                        projectId: project.id,
                        name: page.name,
                        description: `Page in ${project.name}`,
                        path: `/projects/${project.id}/pages/${page.id}`,
                    });
                }
            });
        });

        // Limit results to 10
        return results.slice(0, 10);
    }, [searchQuery, projects]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSearchFocused || searchResults.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const result = searchResults[selectedIndex];
                navigate(result.path);
                setSearchQuery('');
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
            } else if (e.key === 'Escape') {
                setSearchQuery('');
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
            }
        };

        if (isSearchFocused) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isSearchFocused, searchResults, selectedIndex, navigate]);

    // Reset selected index when search results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchQuery]);

    // Close search on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(e.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target as Node)
            ) {
                setIsSearchFocused(false);
            }
        };

        if (isSearchFocused) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSearchFocused]);

    const handleResultClick = (result: SearchResult) => {
        navigate(result.path);
        setSearchQuery('');
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
    };

    return (
        <>
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
                        <div className="relative" style={{ width: '300px' }}>
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search projects, pages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth"
                            />
                            
                            {/* Search Results Dropdown */}
                            {isSearchFocused && searchQuery.trim().length >= 2 && (
                                <div
                                    ref={searchResultsRef}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
                                >
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result, index) => (
                                                <button
                                                    key={`${result.type}-${result.id}`}
                                                    onClick={() => handleResultClick(result)}
                                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-smooth flex items-start gap-3 ${
                                                        index === selectedIndex ? 'bg-gray-50' : ''
                                                    }`}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {result.type === 'project' ? (
                                                            <FolderOpen size={18} className="text-accent" />
                                                        ) : (
                                                            <FileText size={18} className="text-text-secondary" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-text-primary truncate">
                                                            {result.name}
                                                        </div>
                                                        <div className="text-xs text-text-secondary truncate mt-0.5">
                                                            {result.description}
                                                        </div>
                                                        {result.type === 'page' && (
                                                            <div className="text-xs text-text-tertiary mt-0.5">
                                                                Page
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-text-secondary text-sm">
                                            No results found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Help Button */}
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="p-2 hover:bg-bg-tertiary rounded-md transition-smooth"
                            title="Help & Guide"
                        >
                            <HelpCircle size={20} className="text-text-secondary" />
                        </button>

                        {/* Notifications */}
                        <NotificationDropdown
                            unreadCount={unreadCount}
                            onUnreadCountChange={setUnreadCount}
                        />

                        {/* User Dropdown - Placeholder */}
                        <div className="w-8 h-8 bg-accent rounded-full"></div>
                    </div>
                </div>
            </header>

            {/* Help Modal */}
            {showHelpModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowHelpModal(false)}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold">How to Use Content Verify</h2>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* App Overview */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">📋 Overview</h3>
                                <p className="text-gray-600">
                                    Content Verify is a collaborative content management and SEO optimization tool.
                                    It helps teams create, review, and approve website content with built-in SEO analysis.
                                </p>
                            </section>

                            {/* Workflow */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">🔄 Workflow</h3>
                                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                    <li><strong>Create Project</strong> - Admin/Manager creates a project for a website</li>
                                    <li><strong>Add Pages</strong> - Define pages that need content</li>
                                    <li><strong>SEO Keywords</strong> - SEO Analyst adds primary & secondary keywords</li>
                                    <li><strong>Write Content</strong> - Content Writer creates content using keywords</li>
                                    <li><strong>Review & Approve</strong> - Content Verifier reviews and approves content</li>
                                </ol>
                            </section>

                            {/* Who to Contact */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-600 mb-3">👥 Who to Contact</h3>
                                <div className="grid gap-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <p className="font-medium text-blue-800">🔍 SEO Analyst</p>
                                        <p className="text-sm text-blue-600">For SEO keywords, keyword research, and optimization queries</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <p className="font-medium text-green-800">✍️ Content Writer</p>
                                        <p className="text-sm text-green-600">For content creation, updates, and copy-related questions</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <p className="font-medium text-purple-800">✅ Content Verifier</p>
                                        <p className="text-sm text-purple-600">For content review, approval status, and revision requests</p>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <p className="font-medium text-orange-800">⚙️ Admin</p>
                                        <p className="text-sm text-orange-600">For project setup, team access, and technical issues</p>
                                    </div>
                                </div>
                            </section>

                            {/* Keyword Tooltip Info */}
                            <section>
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">💡 Tips</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Hover over keywords to see SEO metrics (volume, CPC, competition)</li>
                                    <li>Content Verifiers can see keyword highlighting in content</li>
                                    <li>Track progress with status badges on each page</li>
                                    <li>Use the analysis scores to improve content quality</li>
                                </ul>
                            </section>
                        </div>

                        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
