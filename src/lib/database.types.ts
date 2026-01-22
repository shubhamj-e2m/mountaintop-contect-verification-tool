export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type UserRole = 'admin' | 'seo_analyst' | 'content_writer' | 'content_verifier';

export type PageStatus =
    | 'draft'
    | 'awaiting_seo'
    | 'awaiting_content'
    | 'processing'
    | 'pending_review'
    | 'revision_requested'
    | 'approved'
    | 'rejected';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: UserRole;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role?: UserRole;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: UserRole;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            projects: {
                Row: {
                    id: string;
                    name: string;
                    website_url: string;
                    description: string | null;
                    google_drive_url: string | null;
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    website_url: string;
                    description?: string | null;
                    google_drive_url?: string | null;
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    website_url?: string;
                    description?: string | null;
                    google_drive_url?: string | null;
                    created_by?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            project_members: {
                Row: {
                    id: string;
                    project_id: string;
                    user_id: string;
                    role: UserRole;
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    user_id: string;
                    role: UserRole;
                    joined_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    user_id?: string;
                    role?: UserRole;
                    joined_at?: string;
                };
            };
            pages: {
                Row: {
                    id: string;
                    project_id: string;
                    name: string;
                    slug: string;
                    status: PageStatus;
                    error_message: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    name: string;
                    slug: string;
                    status?: PageStatus;
                    error_message?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    name?: string;
                    slug?: string;
                    status?: PageStatus;
                    error_message?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            seo_data: {
                Row: {
                    id: string;
                    page_id: string;
                    primary_keywords: string[];
                    secondary_keywords: string[];
                    uploaded_by: string;
                    uploaded_at: string;
                    version: number;
                };
                Insert: {
                    id?: string;
                    page_id: string;
                    primary_keywords?: string[];
                    secondary_keywords?: string[];
                    uploaded_by: string;
                    uploaded_at?: string;
                    version?: number;
                };
                Update: {
                    id?: string;
                    page_id?: string;
                    primary_keywords?: string[];
                    secondary_keywords?: string[];
                    uploaded_by?: string;
                    uploaded_at?: string;
                    version?: number;
                };
            };
            content_data: {
                Row: {
                    id: string;
                    page_id: string;
                    google_sheet_url: string | null;
                    parsed_content: Json;
                    uploaded_by: string;
                    uploaded_at: string;
                    version: number;
                };
                Insert: {
                    id?: string;
                    page_id: string;
                    google_sheet_url?: string | null;
                    parsed_content?: Json;
                    uploaded_by: string;
                    uploaded_at?: string;
                    version?: number;
                };
                Update: {
                    id?: string;
                    page_id?: string;
                    google_sheet_url?: string | null;
                    parsed_content?: Json;
                    uploaded_by?: string;
                    uploaded_at?: string;
                    version?: number;
                };
            };
            analysis_results: {
                Row: {
                    id: string;
                    page_id: string;
                    overall_score: number;
                    seo_score: number;
                    readability_score: number;
                    keyword_density_score: number;
                    grammar_score: number;
                    content_intent_score: number;
                    technical_health_score: number;
                    strategic_analysis_score: number;
                    brand_intent_score: number;
                    keyword_analysis: Json;
                    suggestions: Json;
                    highlighted_content: string | null;
                    processed_at: string;
                };
                Insert: {
                    id?: string;
                    page_id: string;
                    overall_score: number;
                    seo_score: number;
                    readability_score: number;
                    keyword_density_score: number;
                    grammar_score: number;
                    content_intent_score: number;
                    technical_health_score: number;
                    strategic_analysis_score: number;
                    brand_intent_score: number;
                    keyword_analysis?: Json;
                    suggestions?: Json;
                    highlighted_content?: string | null;
                    processed_at?: string;
                };
                Update: {
                    id?: string;
                    page_id?: string;
                    overall_score?: number;
                    seo_score?: number;
                    readability_score?: number;
                    keyword_density_score?: number;
                    grammar_score?: number;
                    content_intent_score?: number;
                    technical_health_score?: number;
                    strategic_analysis_score?: number;
                    brand_intent_score?: number;
                    keyword_analysis?: Json;
                    suggestions?: Json;
                    highlighted_content?: string | null;
                    processed_at?: string;
                };
            };
            review_comments: {
                Row: {
                    id: string;
                    page_id: string;
                    user_id: string;
                    comment: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    page_id: string;
                    user_id: string;
                    comment: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    page_id?: string;
                    user_id?: string;
                    comment?: string;
                    created_at?: string;
                };
            };
            audit_log: {
                Row: {
                    id: string;
                    user_id: string | null;
                    action: string;
                    table_name: string;
                    record_id: string | null;
                    old_values: Json | null;
                    new_values: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    action: string;
                    table_name: string;
                    record_id?: string | null;
                    old_values?: Json | null;
                    new_values?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    action?: string;
                    table_name?: string;
                    record_id?: string | null;
                    old_values?: Json | null;
                    new_values?: Json | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_user_role: {
                Args: Record<PropertyKey, never>;
                Returns: UserRole;
            };
            is_admin: {
                Args: Record<PropertyKey, never>;
                Returns: boolean;
            };
            is_project_member: {
                Args: { project_uuid: string };
                Returns: boolean;
            };
            has_role: {
                Args: { required_role: UserRole };
                Returns: boolean;
            };
            update_page_status: {
                Args: { page_uuid: string; new_status: PageStatus };
                Returns: boolean;
            };
        };
        Enums: {
            user_role: UserRole;
            page_status: PageStatus;
        };
    };
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

// Commonly used types
export type DbUser = Tables<'users'>;
export type DbProject = Tables<'projects'>;
export type DbProjectMember = Tables<'project_members'>;
export type DbPage = Tables<'pages'>;
export type DbSeoData = Tables<'seo_data'>;
export type DbContentData = Tables<'content_data'>;
export type DbAnalysisResult = Tables<'analysis_results'>;
export type DbReviewComment = Tables<'review_comments'>;
