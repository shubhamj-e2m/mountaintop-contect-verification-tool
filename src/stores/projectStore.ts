import { create } from 'zustand';
import type { Project, Page, SEOData, ContentData, PageStatus } from '../types/project';
import { mockProjects, mockUsers } from '../mocks/data';

interface ProjectStore {
    projects: Project[];

    // Project operations
    addProject: (name: string, websiteUrl: string, description?: string) => Project;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (projectId: string) => void;

    // Page operations
    addPage: (projectId: string, name: string, slug: string) => Page | null;
    updatePage: (projectId: string, pageId: string, updates: Partial<Page>) => void;
    deletePage: (projectId: string, pageId: string) => void;

    // Data upload operations
    uploadSEOKeywords: (projectId: string, pageId: string, primaryKeywords: string[], secondaryKeywords: string[], userId: string) => void;
    uploadContent: (projectId: string, pageId: string, content: ContentData['parsed_content'], userId: string, sheetUrl?: string) => void;

    // Status operations
    updatePageStatus: (projectId: string, pageId: string, status: PageStatus) => void;
    triggerAnalysis: (projectId: string, pageId: string) => void;

    // Review operations
    approveContent: (projectId: string, pageId: string) => void;
    rejectContent: (projectId: string, pageId: string) => void;
    requestRevision: (projectId: string, pageId: string, reviseSEO: boolean, reviseContent: boolean) => void;

    // Comments
    addComment: (projectId: string, pageId: string, userId: string, text: string) => void;

    // Getters
    getProject: (projectId: string) => Project | undefined;
    getPage: (projectId: string, pageId: string) => Page | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [...mockProjects],

    addProject: (name, websiteUrl, description) => {
        const newProject: Project = {
            id: `project-${Date.now()}`,
            name,
            website_url: websiteUrl,
            description,
            created_by: mockUsers[0].id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pages: [],
            members: [],
        };

        set((state) => ({
            projects: [...state.projects, newProject],
        }));

        return newProject;
    },

    updateProject: (projectId, updates) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? { ...p, ...updates, updated_at: new Date().toISOString() }
                    : p
            ),
        }));
    },

    deleteProject: (projectId) => {
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
        }));
    },

    addPage: (projectId, name, slug) => {
        const newPage: Page = {
            id: `page-${Date.now()}`,
            project_id: projectId,
            name,
            slug,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        pages: [...p.pages, newPage],
                        updated_at: new Date().toISOString(),
                    }
                    : p
            ),
        }));

        return newPage;
    },

    updatePage: (projectId, pageId, updates) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        pages: p.pages.map((page) =>
                            page.id === pageId
                                ? { ...page, ...updates, updated_at: new Date().toISOString() }
                                : page
                        ),
                        updated_at: new Date().toISOString(),
                    }
                    : p
            ),
        }));
    },

    deletePage: (projectId, pageId) => {
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        pages: p.pages.filter((page) => page.id !== pageId),
                        updated_at: new Date().toISOString(),
                    }
                    : p
            ),
        }));
    },

    uploadSEOKeywords: (projectId, pageId, primaryKeywords, secondaryKeywords, userId) => {
        const page = get().getPage(projectId, pageId);
        const currentVersion = page?.seo_data?.version || 0;

        const seoData: SEOData = {
            id: `seo-${Date.now()}`,
            page_id: pageId,
            primaryKeywords,
            secondaryKeywords,
            uploaded_by: userId,
            uploaded_at: new Date().toISOString(),
            version: currentVersion + 1,
        };

        // Determine new status
        const hasContent = !!page?.content_data;
        let newStatus: PageStatus = hasContent ? 'processing' : 'awaiting_content';

        get().updatePage(projectId, pageId, {
            seo_data: seoData,
            status: newStatus
        });

        // If both SEO and Content are uploaded, trigger analysis
        if (hasContent) {
            setTimeout(() => get().triggerAnalysis(projectId, pageId), 2000);
        }
    },

    uploadContent: (projectId, pageId, content, userId, sheetUrl) => {
        const page = get().getPage(projectId, pageId);
        const currentVersion = page?.content_data?.version || 0;

        const contentData: ContentData = {
            id: `content-${Date.now()}`,
            page_id: pageId,
            google_sheet_url: sheetUrl,
            parsed_content: content,
            uploaded_by: userId,
            uploaded_at: new Date().toISOString(),
            version: currentVersion + 1,
        };

        // Determine new status
        const hasSEO = !!page?.seo_data;
        let newStatus: PageStatus = hasSEO ? 'processing' : 'awaiting_seo';

        get().updatePage(projectId, pageId, {
            content_data: contentData,
            status: newStatus
        });

        // If both SEO and Content are uploaded, trigger analysis
        if (hasSEO) {
            setTimeout(() => get().triggerAnalysis(projectId, pageId), 2000);
        }
    },

    updatePageStatus: (projectId, pageId, status) => {
        get().updatePage(projectId, pageId, { status });
    },

    triggerAnalysis: (projectId, pageId) => {
        const page = get().getPage(projectId, pageId);
        if (!page || !page.seo_data || !page.content_data) return;

        // Simulate AI analysis (in real app, this would call n8n webhook)
        const seoScore = Math.floor(Math.random() * 25) + 75;
        const readabilityScore = Math.floor(Math.random() * 25) + 75;
        const keywordDensityScore = Math.floor(Math.random() * 25) + 70;
        const grammarScore = Math.floor(Math.random() * 20) + 80;
        const contentIntentScore = Math.floor(Math.random() * 25) + 75;
        const technicalHealthScore = Math.floor(Math.random() * 20) + 80;

        // Calculate overall as weighted average
        const overallScore = Math.round(
            (seoScore * 0.2) +
            (readabilityScore * 0.15) +
            (keywordDensityScore * 0.15) +
            (grammarScore * 0.15) +
            (contentIntentScore * 0.2) +
            (technicalHealthScore * 0.15)
        );

        const mockAnalysis = {
            id: `analysis-${Date.now()}`,
            page_id: pageId,
            overall_score: overallScore,
            seo_score: seoScore,
            readability_score: readabilityScore,
            keyword_density_score: keywordDensityScore,
            grammar_score: grammarScore,
            content_intent_score: contentIntentScore,
            technical_health_score: technicalHealthScore,
            keyword_analysis: [
                ...page.seo_data.primaryKeywords.map((kw) => ({
                    keyword: kw,
                    type: 'primary' as const,
                    frequency: Math.floor(Math.random() * 15) + 5,
                    density: `${(Math.random() * 2 + 1).toFixed(1)}%`,
                    in_title: Math.random() > 0.2,
                    in_h1: Math.random() > 0.3,
                    in_first_paragraph: Math.random() > 0.2,
                })),
                ...page.seo_data.secondaryKeywords.map((kw) => ({
                    keyword: kw,
                    type: 'secondary' as const,
                    frequency: Math.floor(Math.random() * 10) + 1,
                    density: `${(Math.random() * 1.5 + 0.3).toFixed(1)}%`,
                    in_title: Math.random() > 0.5,
                    in_h1: Math.random() > 0.6,
                    in_first_paragraph: Math.random() > 0.4,
                })),
            ],
            suggestions: [
                {
                    type: 'info' as const,
                    category: 'SEO',
                    message: 'Good keyword usage throughout the content',
                },
                {
                    type: 'warning' as const,
                    category: 'Readability',
                    message: 'Consider breaking up longer paragraphs for better readability',
                },
                {
                    type: grammarScore >= 90 ? 'info' as const : 'warning' as const,
                    category: 'Grammar',
                    message: grammarScore >= 90 ? 'Excellent grammar and writing quality' : 'Minor grammatical improvements suggested',
                },
                {
                    type: technicalHealthScore >= 85 ? 'info' as const : 'warning' as const,
                    category: 'Technical',
                    message: technicalHealthScore >= 85 ? 'Meta tags and structure are well optimized' : 'Consider adding missing meta description',
                },
            ],
            highlighted_content: `<h1>${page.content_data.parsed_content.h1?.[0] || 'Page Title'}</h1>
        <p>${page.content_data.parsed_content.paragraphs?.[0] || 'Content paragraph...'}</p>`,
            processed_at: new Date().toISOString(),
        };

        get().updatePage(projectId, pageId, {
            analysis: mockAnalysis,
            status: 'pending_review',
        });
    },

    approveContent: (projectId, pageId) => {
        get().updatePage(projectId, pageId, { status: 'approved' });
    },

    rejectContent: (projectId, pageId) => {
        get().updatePage(projectId, pageId, { status: 'rejected' });
    },

    requestRevision: (projectId, pageId, _reviseSEO, _reviseContent) => {
        get().updatePage(projectId, pageId, { status: 'revision_requested' });
    },

    addComment: (_projectId, _pageId, _userId, _text) => {
        // Comments would be stored in a separate array on the page
        // For now, this is a placeholder
        console.log('Comment added');
    },

    getProject: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    getPage: (projectId, pageId) => {
        const project = get().getProject(projectId);
        return project?.pages.find((p) => p.id === pageId);
    },
}));
