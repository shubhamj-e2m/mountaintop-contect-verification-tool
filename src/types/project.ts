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
    google_drive_url?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    pages: Page[];
    members: any[]; // ProjectMember[]
    target_personas?: TargetPersonaAnalysis;
}

export interface KeywordAnalysis {
    keyword: string;
    type: 'primary' | 'secondary';
    keyword_type?: 'primary' | 'secondary' | 'tertiary';
    frequency: number;
    total_count?: number;
    density: string;
    in_title: boolean;
    title_count?: number;
    in_h1: boolean;
    h1_count?: number;
    h2_count?: number;
    h3_count?: number;
    para_count?: number;
    in_first_paragraph: boolean;
    first_paragraph?: boolean;
    url_present?: boolean;
    placement_score?: number;
    weighted_score?: number;
    status?: 'optimal' | 'underused' | 'overused';
}

export interface Suggestion {
    type?: 'info' | 'warning' | 'error';
    priority?: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    current_issue?: string;
    recommended_action?: string;
    seo_impact?: string;
    expected_impact?: string;
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
    strategic_analysis_score: number;
    brand_intent_score: number;
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
    // New fields from enhanced prompts
    detected_intent?: 'informational' | 'navigational' | 'commercial' | 'transactional';
    content_metrics?: {
        word_count: number;
        heading_count: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
        paragraph_count: number;
        internal_links: number;
        external_links: number;
        images_detected: number;
    };
    strengths?: string[];
    critical_issues?: string[];
    quick_wins?: string[];
    missing_elements?: string[];
    journey_stage_detected?: 'awareness' | 'consideration' | 'decision' | 'retention' | 'unclear';
    primary_user_intent?: string;
    friction_points?: string[];
    critical_gaps?: string[];
    customer_persona?: EnhancedTargetMarketPersona;
}

/**
 * Target Market Persona - inferred from page content (new structure)
 */
export interface TargetMarketPersona {
    name: string;
    age: number;
    location: string;
    description: string;
    communication_preferences: string;
    influencers: string[];
    goals: string[];
    transformation: string;
    pain_points: string[];
    hesitations: string[];
}

/**
 * Trailmap Customer Persona - extracted from Google Slides trailmap (new structure)
 */
export interface TrailmapCustomerPersona {
    name: string;
    age: number;
    location: string;
    description: string;
    communication_preferences: string;
    influencers: string[];
    goals: string[];
    transformation: string;
    pain_points: string[];
    hesitations: string[];
}

/**
 * Legacy Customer Persona structure (for SME/Enterprise personas - backward compatibility)
 */
export interface CustomerPersona {
    summary: string;
    demographics: {
        age_range: string;
        gender: string;
        location: string;
        income_level: string;
    };
    psychographics: {
        interests: string[];
        values: string[];
        pain_points: string[];
        goals: string[];
    };
    behavior: {
        online_behavior: string[];
        buying_patterns: string[];
        decision_factors: string[];
    };
}

/**
 * Persona Relevance Item for individual persona comparison
 */
export interface PersonaRelevanceItem {
    persona_id: string;
    persona_name: string;
    relevance_score: number; // 0-100
    match_points: string[]; // What matches
    mismatch_points: string[]; // What doesn't match
    confidence_level: 'high' | 'medium' | 'low';
}

/**
 * Enhanced Target Market Persona with relevance scoring
 */
export interface EnhancedTargetMarketPersona extends TargetMarketPersona {
    target_relevance?: {
        // SME/Enterprise relevance (for backward compatibility)
        sme_score?: number;        // 0-100
        enterprise_score?: number; // 0-100
        primary_target?: 'SME' | 'ENTERPRISE' | 'MIXED';
        confidence_level?: 'high' | 'medium' | 'low';
        // Trailmap persona relevance
        persona_relevance?: PersonaRelevanceItem[];
    };
}

/**
 * Target Persona Analysis for a project
 */
export interface TargetPersonaAnalysis {
    sme_persona: CustomerPersona;
    enterprise_persona: CustomerPersona;
    generated_at: string;
    source_documents: string[]; // ['trailmap', 'brand_strategy']
}

/**
 * Trailmap Personas extracted from Google Slides trailmap
 */
export interface TrailmapPersonas {
    personas: Array<{
        id: string;
        name: string;
        persona: TrailmapCustomerPersona;
    }>;
    extracted_at: string;
    source_document: string;
}
