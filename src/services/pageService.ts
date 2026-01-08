import { apiClient } from '../lib/apiClient';
import type { Database } from '../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];
// type PageInsert = Database['public']['Tables']['pages']['Insert'];
type PageUpdate = Database['public']['Tables']['pages']['Update'];
type PageStatus = Database['public']['Enums']['page_status'];

export interface PageWithData extends Page {
    seo_data?: SEODataBasic | null;
    content_data?: ContentDataBasic | null;
    analysis_results?: AnalysisBasic | null;
}

interface SEODataBasic {
    id: string;
    primary_keywords: string[];
    secondary_keywords: string[];
    uploaded_by: string;
    uploaded_at: string;
    version: number;
}

interface ContentDataBasic {
    id: string;
    google_sheet_url: string | null;
    uploaded_by: string;
    uploaded_at: string;
    version: number;
}

interface AnalysisBasic {
    id: string;
    overall_score: number;
    processed_at: string;
}

/**
 * Get all pages for a project
 */
export async function getPages(projectId: string): Promise<PageWithData[]> {
    try {
        const pages = await apiClient.get<Page[]>(`/pages/projects/${projectId}/pages`);

        // Fetch data for each page
        const pagesWithData = await Promise.all(pages.map(async (page) => {
            try {
                const pageData = await apiClient.get<{
                    page: Page;
                    seo_data?: SEODataBasic | null;
                    content_data?: ContentDataBasic | null;
                    analysis_results?: AnalysisBasic | null;
                }>(`/pages/${page.id}`);

                return {
                    ...pageData.page,
                    seo_data: pageData.seo_data || null,
                    content_data: pageData.content_data || null,
                    analysis_results: pageData.analysis_results || null,
                };
            } catch (error) {
                console.error(`Error fetching data for page ${page.id}:`, error);
                return {
                    ...page,
                    seo_data: null,
                    content_data: null,
                    analysis_results: null,
                };
            }
        }));

        return pagesWithData;
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }
}

/**
 * Get a single page by ID with all related data
 */
export async function getPageById(pageId: string): Promise<PageWithData | null> {
    try {
        const pageData = await apiClient.get<{
            page: Page;
            seo_data?: SEODataBasic | null;
            content_data?: ContentDataBasic | null;
            analysis_results?: AnalysisBasic | null;
        }>(`/pages/${pageId}`);

        return {
            ...pageData.page,
            seo_data: pageData.seo_data || null,
            content_data: pageData.content_data || null,
            analysis_results: pageData.analysis_results || null,
        };
    } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return null;
        }
        console.error('Error fetching page:', error);
        throw error;
    }
}

/**
 * Create a new page in a project
 */
export async function createPage(page: {
    project_id: string;
    name: string;
    slug: string;
}): Promise<Page> {
    try {
        const data = await apiClient.post<Page>(`/pages/projects/${page.project_id}/pages`, {
            name: page.name,
            slug: page.slug,
        });
        return data;
    } catch (error) {
        console.error('Error creating page:', error);
        throw error;
    }
}

/**
 * Update a page
 */
export async function updatePage(
    pageId: string,
    updates: PageUpdate
): Promise<Page> {
    try {
        const data = await apiClient.put<Page>(`/pages/${pageId}`, updates);
        return data;
    } catch (error) {
        console.error('Error updating page:', error);
        throw error;
    }
}

/**
 * Update page status
 */
export async function updatePageStatus(
    pageId: string,
    status: PageStatus
): Promise<Page> {
    try {
        const data = await apiClient.put<Page>(`/pages/${pageId}/status`, { status });
        return data;
    } catch (error) {
        console.error('Error updating page status:', error);
        throw error;
    }
}

/**
 * Delete a page
 */
export async function deletePage(pageId: string): Promise<void> {
    try {
        await apiClient.delete(`/pages/${pageId}`);
    } catch (error) {
        console.error('Error deleting page:', error);
        throw error;
    }
}

/**
 * Trigger content analysis for a page
 */
export async function triggerAnalysis(pageId: string): Promise<any> {
    try {
        const data = await apiClient.post<any>(`/pages/${pageId}/analysis/trigger`, {});
        return data;
    } catch (error) {
        console.error('Error triggering analysis:', error);
        throw error;
    }
}
