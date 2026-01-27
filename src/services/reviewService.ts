import { apiClient } from '../lib/apiClient';

export interface ReviewComment {
    id: string;
    page_id: string;
    user_id: string;
    comment: string;
    created_at: string;
}

/**
 * Get review comments for a page
 */
export async function getReviewComments(pageId: string): Promise<ReviewComment[]> {
    try {
        const data = await apiClient.get<ReviewComment[]>(`/pages/${pageId}/comments`);
        return data || [];
    } catch (error) {
        console.error('Error fetching review comments:', error);
        throw error;
    }
}

/**
 * Add a review comment
 */
export async function addReviewComment(pageId: string, comment: string): Promise<ReviewComment> {
    try {
        const data = await apiClient.post<ReviewComment>(`/pages/${pageId}/comments`, {
            comment,
        });
        return data;
    } catch (error) {
        console.error('Error adding review comment:', error);
        throw error;
    }
}

/**
 * Approve a page
 */
export async function approvePage(pageId: string): Promise<void> {
    try {
        await apiClient.post(`/pages/${pageId}/approve`, {});
    } catch (error) {
        console.error('Error approving page:', error);
        throw error;
    }
}

/**
 * Reject a page
 */
export async function rejectPage(pageId: string): Promise<void> {
    try {
        await apiClient.post(`/pages/${pageId}/reject`, {});
    } catch (error) {
        console.error('Error rejecting page:', error);
        throw error;
    }
}

/**
 * Request revision for a page
 */
export async function requestRevision(
    pageId: string,
    reviseSEO: boolean = false,
    reviseContent: boolean = false
): Promise<void> {
    try {
        await apiClient.post(`/pages/${pageId}/request-revision`, {
            reviseSEO,
            reviseContent,
        });
    } catch (error) {
        console.error('Error requesting revision:', error);
        throw error;
    }
}

