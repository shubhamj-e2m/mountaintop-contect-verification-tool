import { apiClient } from '../lib/apiClient';
import type { Database } from '../lib/database.types';

type ContentData = Database['public']['Tables']['content_data']['Row'];

export interface ParsedContent {
    meta_title?: string;
    meta_description?: string;
    h1: string[];
    h2: string[];
    h3: string[];
    paragraphs: string[];
    alt_texts?: string[];
}

export interface ContentDataInput {
    page_id: string;
    parsed_content: ParsedContent;
    google_sheet_url?: string;
}

/**
 * Get content data for a page
 */
export async function getContentData(pageId: string): Promise<ContentData | null> {
    try {
        const data = await apiClient.get<ContentData>(`/pages/${pageId}/content`);
        return data;
    } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return null;
        }
        console.error('Error fetching content data:', error);
        throw error;
    }
}

/**
 * Upload/Create content data for a page (Content Writer only)
 */
export async function uploadContentData(input: ContentDataInput): Promise<ContentData> {
    try {
        const data = await apiClient.post<ContentData>(`/pages/${input.page_id}/content`, {
            parsed_content: input.parsed_content,
            google_sheet_url: input.google_sheet_url,
        });
        return data;
    } catch (error) {
        console.error('Error uploading content data:', error);
        throw error;
    }
}

/**
 * Update existing content data
 */
export async function updateContentData(
    pageId: string,
    updates: Partial<Pick<ContentDataInput, 'parsed_content' | 'google_sheet_url'>>
): Promise<ContentData> {
    try {
        const data = await apiClient.put<ContentData>(`/pages/${pageId}/content`, updates);
        return data;
    } catch (error) {
        console.error('Error updating content data:', error);
        throw error;
    }
}
