import { apiClient } from '../lib/apiClient';
import type { Database } from '../lib/database.types';

type SEOData = Database['public']['Tables']['seo_data']['Row'];

export interface SEODataInput {
    page_id: string;
    primary_keywords: string[];
    secondary_keywords: string[];
}

/**
 * Get SEO data for a page
 */
export async function getSEOData(pageId: string): Promise<SEOData | null> {
    try {
        const data = await apiClient.get<SEOData>(`/pages/${pageId}/seo`);
        return data;
    } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return null;
        }
        console.error('Error fetching SEO data:', error);
        throw error;
    }
}

/**
 * Upload/Create SEO data for a page (SEO Analyst only)
 */
export async function uploadSEOData(input: SEODataInput): Promise<SEOData> {
    try {
        const data = await apiClient.post<SEOData>(`/pages/${input.page_id}/seo`, {
            primary_keywords: input.primary_keywords,
            secondary_keywords: input.secondary_keywords,
        });
        return data;
    } catch (error) {
        console.error('Error uploading SEO data:', error);
        throw error;
    }
}

/**
 * Update existing SEO data
 */
export async function updateSEOData(
    pageId: string,
    updates: Partial<Pick<SEODataInput, 'primary_keywords' | 'secondary_keywords'>>
): Promise<SEOData> {
    try {
        const data = await apiClient.put<SEOData>(`/pages/${pageId}/seo`, updates);
        return data;
    } catch (error) {
        console.error('Error updating SEO data:', error);
        throw error;
    }
}

/**
 * Get keyword metrics for a specific page
 */
export async function getKeywordMetrics(pageId: string): Promise<any[]> {
    try {
        const data = await apiClient.get<any[]>(`/pages/${pageId}/seo/metrics`);
        return data || [];
    } catch (error) {
        console.error('Error fetching keyword metrics:', error);
        return [];
    }
}

/**
 * Get all SEO data versions for a page
 */
export async function getSEODataHistory(pageId: string): Promise<SEOData[]> {
    try {
        const data = await apiClient.get<SEOData[]>(`/pages/${pageId}/seo/history`);
        return data || [];
    } catch (error) {
        console.error('Error fetching SEO data history:', error);
        throw error;
    }
}
