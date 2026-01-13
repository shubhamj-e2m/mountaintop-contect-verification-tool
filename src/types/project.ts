export type PageStatus =
    | 'draft'           // Just created, nothing uploaded
    | 'awaiting_seo'    // Content uploaded, waiting for keywords
    | 'awaiting_content' // Keywords uploaded, waiting for content
    | 'processing'      // Both uploaded, AI processing
    | 'pending_review'  // Processed, awaiting verifier
    | 'revision_requested' // Verifier requested changes
    | 'approved'        // Verifier approved
    | 'rejected';       // Verifier rejected

export interface SEOData {
    id: string;
    page_id: string;
    primaryKeywords: string[];   // High-priority target keywords (typically 1-3)
    secondaryKeywords: string[]; // Supporting/long-tail keywords
    uploaded_by: string;
    uploaded_at: string;
    version: number;
}

export interface ContentData {
    id: string;
    page_id: string;
    google_sheet_url?: string;
    parsed_content: {
        meta_title?: string;
        meta_description?: string;
        h1: string[];
        h2: string[];
        h3: string[];
        paragraphs: string[];
        alt_texts: string[];
        [key: string]: any;
    };
    uploaded_by: string;
    uploaded_at: string;
    version: number;
}

export interface Page {
    id: string;
    project_id: string;
    name: string; // e.g., "Home Page", "About Us"
    slug: string; // e.g., "home", "about"
    status: PageStatus;
    error_message?: string | null;
    seo_data?: SEOData;
    content_data?: ContentData;
    analysis?: AnalysisResult;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    website_url: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    pages: Page[];
    members: any[]; // ProjectMember[]
}

export interface KeywordAnalysis {
    keyword: string;
    type: 'primary' | 'secondary';
    frequency: number;
    density: string;
    in_title: boolean;
    in_h1: boolean;
    in_first_paragraph: boolean;
}

export interface Suggestion {
    type: 'info' | 'warning' | 'error';
    category: string;
    message: string;
}

export interface AnalysisResult {
    id: string;
    page_id: string;
    overall_score: number;
    seo_score: number;
    readability_score: number;
    keyword_density_score: number;
    grammar_score: number;
    content_intent_score: number;
    technical_health_score: number;
    keyword_analysis: KeywordAnalysis[];
    suggestions: Suggestion[];
    highlighted_content: string; // HTML with keywords highlighted
    processed_at: string;
    seo_score_breakdown?: {
        totalScore: number;
        breakdown: {
            metaTags: { score: number; maxScore: number; details: Record<string, { points: number; maxPoints: number; passed: boolean | number }> };
            contentQuality: { score: number; maxScore: number; details: Record<string, { points: number; maxPoints: number; passed: boolean | number }> };
            technical: { score: number; maxScore: number; details: Record<string, { points: number; maxPoints: number; passed: boolean | number }> };
        };
        grade: string;
    } | null;
}
