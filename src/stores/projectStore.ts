import { create } from 'zustand';
import type { Project, Page, PageStatus } from '../types/project';
import {
    getProjects,
    getProjectById,
    createProject as createProjectAPI,
    updateProject as updateProjectAPI,
    deleteProject as deleteProjectAPI,
} from '../services/projectService';
import {
    getPages,
    getPageById,
    createPage as createPageAPI,
    // updatePage as updatePageAPI,
    updatePageStatus as updatePageStatusAPI,
    deletePage as deletePageAPI,
} from '../services/pageService';
import {
    uploadSEOData as uploadSEODataAPI,
    // getSEOData,
} from '../services/seoService';
import {
    uploadContentData as uploadContentDataAPI,
    type ParsedContent,
} from '../services/contentService';
import {
    approvePage as approvePageAPI,
    rejectPage as rejectPageAPI,
    requestRevision as requestRevisionAPI,
} from '../services/reviewService';

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    fetchingPromise: Promise<void> | null;

    // Fetch operations
    fetchProjects: (shouldRefetch?: boolean) => Promise<void>;
    fetchProjectById: (projectId: string) => Promise<Project | null>;

    // Project operations
    addProject: (name: string, websiteUrl: string, description: string | undefined, userId: string) => Promise<Project | null>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;

    // Page operations
    addPage: (projectId: string, name: string, slug: string) => Promise<Page | null>;
    updatePageStatus: (projectId: string, pageId: string, status: PageStatus) => Promise<void>;
    deletePage: (projectId: string, pageId: string) => Promise<void>;

    // SEO operations
    uploadSEOKeywords: (
        projectId: string,
        pageId: string,
        primaryKeywords: string[],
        secondaryKeywords: string[]
    ) => Promise<void>;

    // Content operations
    uploadContent: (
        projectId: string,
        pageId: string,
        parsedContent: ParsedContent,
        sheetUrl?: string
    ) => Promise<void>;

    // Verifier operations
    approveContent: (projectId: string, pageId: string) => Promise<void>;
    rejectContent: (projectId: string, pageId: string) => Promise<void>;
    requestRevision: (projectId: string, pageId: string, reviseSEO: boolean, reviseContent: boolean) => Promise<void>;

    // Getters (sync, from cached data)
    getProject: (projectId: string) => Project | undefined;
    getPage: (projectId: string, pageId: string) => Page | undefined;

    // Clear error
    clearError: () => void;
}

// Helper to convert DB format to app format
function convertDbProjectToApp(dbProject: any): Project {
    return {
        id: dbProject.id,
        name: dbProject.name,
        website_url: dbProject.website_url,
        description: dbProject.description || undefined,
        google_drive_url: dbProject.google_drive_url || undefined,
        created_by: dbProject.created_by,
        created_at: dbProject.created_at,
        updated_at: dbProject.updated_at,
        pages: (dbProject.pages || []).map((p: any) => convertDbPageToApp(p, dbProject.id)),
        members: dbProject.members || [],
    };
}

// Helper to convert a single page from DB format to app format
function convertDbPageToApp(p: any, projectId: string): Page {
    return {
        id: p.id,
        project_id: projectId || p.project_id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        error_message: p.error_message,
        created_at: p.created_at,
        updated_at: p.updated_at,
        seo_data: p.seo_data ? {
            id: p.seo_data.id,
            page_id: p.id,
            primaryKeywords: p.seo_data.primary_keywords || [],
            secondaryKeywords: p.seo_data.secondary_keywords || [],
            uploaded_by: p.seo_data.uploaded_by,
            uploaded_at: p.seo_data.uploaded_at,
            version: p.seo_data.version,
        } : undefined,
        content_data: p.content_data ? {
            id: p.content_data.id,
            page_id: p.id,
            google_sheet_url: p.content_data.google_sheet_url || undefined,
            parsed_content: p.content_data.parsed_content || {},
            uploaded_by: p.content_data.uploaded_by,
            uploaded_at: p.content_data.uploaded_at,
            version: p.content_data.version,
        } : undefined,
        analysis: p.analysis_results ? {
            id: p.analysis_results.id,
            page_id: p.id,
            overall_score: p.analysis_results.overall_score,
            seo_score: p.analysis_results.seo_score,
            readability_score: p.analysis_results.readability_score,
            keyword_density_score: p.analysis_results.keyword_density_score,
            grammar_score: p.analysis_results.grammar_score,
            content_intent_score: p.analysis_results.content_intent_score,
            technical_health_score: p.analysis_results.technical_health_score,
            strategic_analysis_score: p.analysis_results.strategic_analysis_score,
            brand_intent_score: p.analysis_results.brand_intent_score,
            keyword_analysis: p.analysis_results.keyword_analysis || [],
            suggestions: p.analysis_results.suggestions || [],
            highlighted_content: p.analysis_results.highlighted_content || '',
            processed_at: p.analysis_results.processed_at,
            seo_score_breakdown: p.analysis_results.seo_score_breakdown || null,
            // New fields
            strengths: p.analysis_results.strengths || [],
            critical_issues: p.analysis_results.critical_issues || [],
            quick_wins: p.analysis_results.quick_wins || [],
            missing_elements: p.analysis_results.missing_elements || [],
            customer_persona: p.analysis_results.customer_persona || null,
        } : undefined,
    };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,
    lastFetched: null,
    fetchingPromise: null,

    fetchProjects: async (shouldRefetch = false) => {
        const state = get();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        // Check cache - return cached data if fresh and not forcing refetch
        if (!shouldRefetch && state.lastFetched && (now - state.lastFetched) < CACHE_DURATION && state.projects.length > 0) {
            console.log('fetchProjects: Using cached data');
            return;
        }

        // Prevent duplicate simultaneous requests
        if (state.fetchingPromise) {
            console.log('fetchProjects: Already fetching, waiting for existing request...');
            await state.fetchingPromise;
            return;
        }

        console.log('fetchProjects: starting...');
        const fetchPromise = (async () => {
            set({ isLoading: true, error: null });
            try {
                console.log('fetchProjects: calling getProjects()...');
                const dbProjects = await getProjects();
                console.log('fetchProjects: got projects:', dbProjects);
                const projects = dbProjects.map(convertDbProjectToApp);
                console.log('fetchProjects: converted projects:', projects);
                set({ 
                    projects, 
                    isLoading: false, 
                    lastFetched: Date.now(),
                    fetchingPromise: null,
                });
            } catch (error: any) {
                console.error('fetchProjects: Error:', error);
                set({ 
                    error: error.message, 
                    isLoading: false,
                    fetchingPromise: null,
                });
            }
        })();

        set({ fetchingPromise: fetchPromise });
        await fetchPromise;
    },

    fetchProjectById: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const dbProject = await getProjectById(projectId);
            if (!dbProject) {
                set({ isLoading: false });
                return null;
            }

            // Also fetch pages with full details
            const pages = await getPages(projectId);
            const project = convertDbProjectToApp({ ...dbProject, pages });

            // Update the project in the store
            set((state) => ({
                projects: state.projects.some(p => p.id === projectId)
                    ? state.projects.map(p => p.id === projectId ? project : p)
                    : [...state.projects, project],
                isLoading: false,
            }));

            return project;
        } catch (error: any) {
            console.error('Error fetching project:', error);
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    addProject: async (name, websiteUrl, description, userId) => {
        console.log('addProject: starting...', { name, websiteUrl, description, userId });
        set({ isLoading: true, error: null });
        try {
            console.log('addProject: calling createProjectAPI...');
            const dbProject = await createProjectAPI({
                name,
                website_url: websiteUrl,
                description,
                created_by: userId,
            });
            console.log('addProject: got dbProject:', dbProject);

            const project = convertDbProjectToApp(dbProject);
            console.log('addProject: converted project:', project);
            set((state) => ({
                projects: [...state.projects, project],
                isLoading: false,
            }));

            return project;
        } catch (error: any) {
            console.error('addProject: Error:', error);
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    updateProject: async (projectId, updates) => {
        set({ isLoading: true, error: null });
        try {
            await updateProjectAPI(projectId, {
                name: updates.name,
                website_url: updates.website_url,
                description: updates.description,
                google_drive_url: updates.google_drive_url,
            });

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId ? { ...p, ...updates } : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error updating project:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    deleteProject: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            await deleteProjectAPI(projectId);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== projectId),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error deleting project:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    addPage: async (projectId, name, slug) => {
        set({ isLoading: true, error: null });
        try {
            const dbPage = await createPageAPI({
                project_id: projectId,
                name,
                slug,
            });

            const newPage: Page = {
                id: dbPage.id,
                project_id: projectId,
                name: dbPage.name,
                slug: dbPage.slug,
                status: dbPage.status,
                created_at: dbPage.created_at,
                updated_at: dbPage.updated_at,
            };

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? { ...p, pages: [...(p.pages || []), newPage] }
                        : p
                ),
                isLoading: false,
            }));

            return newPage;
        } catch (error: any) {
            console.error('Error creating page:', error);
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    updatePageStatus: async (projectId, pageId, status) => {
        set({ isLoading: true, error: null });
        try {
            await updatePageStatusAPI(pageId, status);

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            pages: p.pages?.map((page) =>
                                page.id === pageId ? { ...page, status } : page
                            ),
                        }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error updating page status:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    deletePage: async (projectId, pageId) => {
        set({ isLoading: true, error: null });
        try {
            await deletePageAPI(pageId);

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? { ...p, pages: p.pages?.filter((page) => page.id !== pageId) }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error deleting page:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    uploadSEOKeywords: async (projectId, pageId, primaryKeywords, secondaryKeywords) => {
        set({ isLoading: true, error: null });
        try {
            await uploadSEODataAPI({
                page_id: pageId,
                primary_keywords: primaryKeywords,
                secondary_keywords: secondaryKeywords,
            });

            // Fetch only the updated page (more efficient than refetching entire project)
            const updatedPageData = await getPageById(pageId);
            if (updatedPageData) {
                const updatedPage = convertDbPageToApp(updatedPageData, projectId);

                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? {
                                ...p,
                                pages: p.pages?.map((page) =>
                                    page.id === pageId ? updatedPage : page
                                ) || [updatedPage],
                            }
                            : p
                    ),
                    isLoading: false,
                }));
            } else {
                set({ isLoading: false });
            }
        } catch (error: any) {
            console.error('Error uploading SEO keywords:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    uploadContent: async (projectId, pageId, parsedContent, sheetUrl) => {
        set({ isLoading: true, error: null });
        try {
            await uploadContentDataAPI({
                page_id: pageId,
                parsed_content: parsedContent,
                google_sheet_url: sheetUrl,
            });

            // Fetch only the updated page (more efficient than refetching entire project)
            const updatedPageData = await getPageById(pageId);
            if (updatedPageData) {
                const updatedPage = convertDbPageToApp(updatedPageData, projectId);

                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? {
                                ...p,
                                pages: p.pages?.map((page) =>
                                    page.id === pageId ? updatedPage : page
                                ) || [updatedPage],
                            }
                            : p
                    ),
                    isLoading: false,
                }));
            } else {
                set({ isLoading: false });
            }
        } catch (error: any) {
            console.error('Error uploading content:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    approveContent: async (projectId, pageId) => {
        set({ isLoading: true, error: null });
        try {
            await approvePageAPI(pageId);

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            pages: p.pages?.map((pg) =>
                                pg.id === pageId ? { ...pg, status: 'approved' as PageStatus } : pg
                            ),
                        }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error approving content:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    rejectContent: async (projectId, pageId) => {
        set({ isLoading: true, error: null });
        try {
            await rejectPageAPI(pageId);

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            pages: p.pages?.map((pg) =>
                                pg.id === pageId ? { ...pg, status: 'rejected' as PageStatus } : pg
                            ),
                        }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error rejecting content:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    requestRevision: async (projectId, pageId, reviseSEO, reviseContent) => {
        set({ isLoading: true, error: null });
        try {
            await requestRevisionAPI(pageId, reviseSEO, reviseContent);

            // Determine the appropriate status based on what needs revision
            let newStatus: PageStatus;
            if (reviseSEO && reviseContent) {
                newStatus = 'revision_requested';
            } else if (reviseSEO) {
                newStatus = 'awaiting_seo';
            } else {
                newStatus = 'awaiting_content';
            }

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId
                        ? {
                            ...p,
                            pages: p.pages?.map((pg) =>
                                pg.id === pageId ? { ...pg, status: newStatus } : pg
                            ),
                        }
                        : p
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error requesting revision:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    getProject: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    getPage: (projectId, pageId) => {
        const project = get().projects.find((p) => p.id === projectId);
        return project?.pages?.find((page) => page.id === pageId);
    },

    clearError: () => {
        set({ error: null });
    },
}));
