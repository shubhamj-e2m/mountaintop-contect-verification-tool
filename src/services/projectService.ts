import { apiClient } from '../lib/apiClient';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
// type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Partial<Pick<Project, 'name' | 'website_url' | 'description' | 'google_drive_url'>>;

export interface ProjectWithDetails extends Project {
    pages?: PageBasic[];
    members?: MemberBasic[];
}

interface PageBasic {
    id: string;
    name: string;
    slug: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    seo_data?: {
        id: string;
        primary_keywords: string[];
        secondary_keywords: string[];
        uploaded_by: string;
        uploaded_at: string;
        version: number;
    } | null;
    content_data?: {
        id: string;
        parsed_content: any;
        google_sheet_url: string | null;
        uploaded_by: string;
        uploaded_at: string;
        version: number;
    } | null;
    analysis_results?: {
        id: string;
        overall_score: number;
        seo_score: number;
        readability_score: number;
        keyword_density_score: number;
        grammar_score: number;
        content_intent_score: number;
        technical_health_score: number;
        detailed_feedback: any;
    } | null;
}

interface MemberBasic {
    user_id: string;
    role: string;
}

/**
 * Get all projects accessible to the current user
 */
export async function getProjects(): Promise<ProjectWithDetails[]> {
    try {
        const projects = await apiClient.get<Project[]>('/projects');

        // For each project, fetch pages with data in bulk (optimized to avoid N+1)
        const projectsWithData = await Promise.all(projects.map(async (project) => {
            try {
                // Use ?withData=true to get all page data in one request
                const pagesWithData = await apiClient.get<Array<{
                    page: PageBasic;
                    seo_data?: any;
                    content_data?: any;
                    analysis_results?: any;
                }>>(`/pages/projects/${project.id}/pages?withData=true`);

                // Transform the response to match expected format
                const pages = pagesWithData.map(item => ({
                    ...item.page,
                    seo_data: item.seo_data || null,
                    content_data: item.content_data || null,
                    analysis_results: item.analysis_results || null,
                }));

                return {
                    ...project,
                    pages: pages,
                    members: [], // Will be fetched separately if needed
                };
            } catch (error) {
                console.error(`Error fetching pages for project ${project.id}:`, error);
                return {
                    ...project,
                    pages: [],
                    members: [],
                };
            }
        }));

        return projectsWithData;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
}

/**
 * Get a single project by ID with all details
 */
export async function getProjectById(projectId: string): Promise<ProjectWithDetails | null> {
    try {
        const project = await apiClient.get<Project>(`/projects/${projectId}`);

        if (!project) return null;

        // Fetch pages with data in bulk (optimized to avoid N+1)
        const pagesWithDataResponse = await apiClient.get<Array<{
            page: PageBasic;
            seo_data?: any;
            content_data?: any;
            analysis_results?: any;
        }>>(`/pages/projects/${projectId}/pages?withData=true`);

        // Transform the response to match expected format
        const pages = pagesWithDataResponse.map(item => ({
            ...item.page,
            seo_data: item.seo_data || null,
            content_data: item.content_data || null,
            analysis_results: item.analysis_results || null,
        }));

        // Fetch members
        const members = await apiClient.get<MemberBasic[]>(`/projects/${projectId}/members`);

        return {
            ...project,
            pages: pages,
            members: members || [],
        };
    } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return null;
        }
        console.error('Error fetching project:', error);
        throw error;
    }
}

/**
 * Create a new project
 */
export async function createProject(project: {
    name: string;
    website_url: string;
    description?: string;
    google_drive_url?: string;
    created_by: string;
}): Promise<Project> {
    try {
        const data = await apiClient.post<Project>('/projects', {
            name: project.name,
            website_url: project.website_url,
            description: project.description,
            google_drive_url: project.google_drive_url,
        });
        return data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

/**
 * Update an existing project
 */
export async function updateProject(
    projectId: string,
    updates: ProjectUpdate
): Promise<Project> {
    try {
        const data = await apiClient.put<Project>(`/projects/${projectId}`, {
            name: updates.name,
            website_url: updates.website_url,
            description: updates.description,
            google_drive_url: updates.google_drive_url,
        });
        return data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

/**
 * Delete a project (admin only)
 */
export async function deleteProject(projectId: string): Promise<void> {
    try {
        await apiClient.delete(`/projects/${projectId}`);
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
    projectId: string,
    userId: string,
    role: 'seo_analyst' | 'content_writer' | 'content_verifier'
): Promise<void> {
    try {
        await apiClient.post(`/projects/${projectId}/members`, {
            user_id: userId,
            role,
        });
    } catch (error) {
        console.error('Error adding project member:', error);
        throw error;
    }
}
