import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Tag, CheckCircle, XCircle, RotateCcw, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ScoreDisplay from '../../components/ui/ScoreDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../stores/projectStore';
import { getKeywordMetrics } from '../../services/seoService';
import { parseContentFile, validateContentFile } from '../../utils/csvParser';

const PageDetailPage: React.FC = () => {
    const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, uploadSEOKeywords, uploadContent, approveContent, rejectContent, requestRevision, fetchProjectById, deletePage } = useProjectStore();

    const [showSEOModal, setShowSEOModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Form state
    const [primaryKeywordsInput, setPrimaryKeywordsInput] = useState('');
    const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState('');
    const [contentMetaTitle, setContentMetaTitle] = useState('');
    const [contentMetaDesc, setContentMetaDesc] = useState('');
    const [contentH1, setContentH1] = useState('');
    const [contentH2s, setContentH2s] = useState('');
    const [contentH3s, setContentH3s] = useState('');
    const [contentParagraphs, setContentParagraphs] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');
    const [revisionSEO, setRevisionSEO] = useState(true);
    const [revisionContent, setRevisionContent] = useState(true);
    const [keywordMetrics, setKeywordMetrics] = useState<Record<string, any>>({});
    const [csvError, setCsvError] = useState<string>('');
    const [analysisProgress, setAnalysisProgress] = useState<{
        step: number;
        message: string;
        progress: number;
    }>({ step: 0, message: 'Starting analysis...', progress: 0 });

    const project = projects.find(p => p.id === projectId);
    const page = project?.pages.find(p => p.id === pageId);

    // Fetch keyword metrics when seo_data exists - MUST be before any early return
    useEffect(() => {
        const fetchMetrics = async () => {
            if (page?.seo_data?.id) {
                try {
                    const metrics = await getKeywordMetrics(page.seo_data.id);
                    const metricsMap: Record<string, any> = {};
                    metrics.forEach(m => {
                        metricsMap[m.keyword.toLowerCase()] = m;
                    });
                    setKeywordMetrics(metricsMap);
                } catch (error) {
                    console.error('Error fetching keyword metrics:', error);
                }
            }
        };
        fetchMetrics();
    }, [page?.seo_data?.id]);

    // Poll for analysis completion when status is processing or pending_review but analysis not loaded
    // Also poll if analysis exists but status is still 'processing' (edge case)
    useEffect(() => {
        const isProcessing = page?.status === 'processing';
        const hasAnalysisButStillProcessing = isProcessing && page?.analysis;
        const needsPolling = isProcessing && !page?.analysis;
        const isPendingReviewWithoutAnalysis = page?.status === 'pending_review' && !page.analysis;

        if (needsPolling || isPendingReviewWithoutAnalysis || hasAnalysisButStillProcessing) {
            // If analysis exists but status is stuck at processing, just poll to refresh
            if (hasAnalysisButStillProcessing) {
                const pollInterval = setInterval(async () => {
                    try {
                        if (projectId) {
                            await fetchProjectById(projectId);
                        }
                    } catch (error) {
                        console.error('Error polling for status update:', error);
                    }
                }, 2000);
                return () => clearInterval(pollInterval);
            }

            // Simulate progress steps (only for processing status)
            if (isProcessing) {
                const progressSteps = [
                    { step: 1, message: 'Preparing content data...', progress: 10 },
                    { step: 2, message: 'Analyzing SEO keywords...', progress: 30 },
                    { step: 3, message: 'Running AI analysis...', progress: 50 },
                    { step: 4, message: 'Calculating scores...', progress: 70 },
                    { step: 5, message: 'Generating suggestions...', progress: 85 },
                    { step: 6, message: 'Finalizing results...', progress: 95 },
                ];

                let currentStep = 0;
                const progressInterval = setInterval(() => {
                    if (currentStep < progressSteps.length) {
                        setAnalysisProgress(progressSteps[currentStep]);
                        currentStep++;
                    }
                }, 2000); // Update every 2 seconds

                // Poll for actual analysis completion
                const pollInterval = setInterval(async () => {
                    try {
                        // Refresh project data to check if analysis is complete
                        if (projectId) {
                            await fetchProjectById(projectId);
                        }
                    } catch (error) {
                        console.error('Error polling for analysis:', error);
                    }
                }, 3000); // Poll every 3 seconds

                return () => {
                    clearInterval(progressInterval);
                    clearInterval(pollInterval);
                };
            } else {
                // Status is pending_review but analysis not loaded - just poll to refresh
                const pollInterval = setInterval(async () => {
                    try {
                        if (projectId) {
                            await fetchProjectById(projectId);
                        }
                    } catch (error) {
                        console.error('Error polling for analysis:', error);
                    }
                }, 2000); // Poll more frequently when waiting for results

                return () => {
                    clearInterval(pollInterval);
                };
            }
        } else if (page?.analysis) {
            // Analysis complete, reset progress
            setAnalysisProgress({ step: 6, message: 'Analysis complete!', progress: 100 });
        }
    }, [page?.status, page?.analysis, projectId, fetchProjectById]);

    if (!project || !page) {
        return (
            <div className="p-8">
                <p className="text-[var(--color-text-secondary)]">Page not found</p>
            </div>
        );
    }

    const hasAnalysis = !!page.analysis;
    const hasSEO = !!page.seo_data;
    const hasContent = !!page.content_data;
    const isVerifier = user?.role === 'content_verifier';
    const isContentWriter = user?.role === 'content_writer';
    const isSEOAnalyst = user?.role === 'seo_analyst';
    const isAdmin = user?.role === 'admin';

    // Check which content fields are missing
    const getMissingContentFields = () => {
        if (!hasContent || !page.content_data) return [];

        const content = page.content_data.parsed_content;
        const missing: string[] = [];

        if (!content.meta_title || !content.meta_title.trim()) {
            missing.push('Meta Title');
        }
        if (!content.meta_description || !content.meta_description.trim()) {
            missing.push('Meta Description');
        }
        if (!content.h1 || !Array.isArray(content.h1) || content.h1.length === 0 || !content.h1.some(h => h && h.trim())) {
            missing.push('H1 Heading');
        }
        if (!content.h2 || !Array.isArray(content.h2) || content.h2.length === 0 || !content.h2.some(h => h && h.trim())) {
            missing.push('H2 Headings');
        }
        if (!content.h3 || !Array.isArray(content.h3) || content.h3.length === 0 || !content.h3.some(h => h && h.trim())) {
            missing.push('H3 Headings');
        }
        if (!content.paragraphs || !Array.isArray(content.paragraphs) || content.paragraphs.length === 0 || !content.paragraphs.some(p => p && p.trim())) {
            missing.push('Paragraphs');
        }

        return missing;
    };

    const missingContentFields = getMissingContentFields();

    // Helper function to convert percentage to letter grade
    const getLetterGrade = (score: number): { grade: string; color: string } => {
        if (score >= 90) return { grade: 'A', color: 'text-green-600' };
        if (score >= 80) return { grade: 'B', color: 'text-blue-600' };
        if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
        if (score >= 60) return { grade: 'D', color: 'text-orange-600' };
        return { grade: 'F', color: 'text-red-600' };
    };

    // Get keyword stats - only return real data, null if not available
    const getKeywordStats = (keyword: string) => {
        const realMetrics = keywordMetrics[keyword.toLowerCase()];

        if (realMetrics) {
            return {
                searchVolume: realMetrics.search_volume || 0,
                difficulty: realMetrics.competition_index || 0,
                cpc: realMetrics.cpc?.toFixed(2) || '0.00',
                competition: realMetrics.competition || 'N/A',
                lowBid: realMetrics.low_top_of_page_bid?.toFixed(2) || '0.00',
                highBid: realMetrics.high_top_of_page_bid?.toFixed(2) || '0.00',
            };
        }

        // No real metrics available
        return null;
    };


    // Helper function to highlight keywords for verifier
    const highlightKeywords = (text: string): React.ReactElement => {
        if (!isVerifier || !hasSEO || !page.seo_data) {
            return <>{text}</>;
        }

        const primaryKeywords = page.seo_data.primaryKeywords || [];
        const secondaryKeywords = page.seo_data.secondaryKeywords || [];
        const allKeywords = [...primaryKeywords, ...secondaryKeywords];

        if (allKeywords.length === 0) return <>{text}</>;

        // Create a regex pattern to match any keyword (case-insensitive)
        const pattern = allKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        if (!pattern) return <>{text}</>;

        const regex = new RegExp(`(${pattern})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, i) => {
                    const isPrimary = primaryKeywords.some(kw =>
                        part.toLowerCase() === kw.toLowerCase()
                    );
                    const isSecondary = secondaryKeywords.some(kw =>
                        part.toLowerCase() === kw.toLowerCase()
                    );
                    if (isPrimary) {
                        return <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>;
                    } else if (isSecondary) {
                        return <mark key={i} className="bg-cyan-100 px-0.5 rounded">{part}</mark>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </>
        );
    };

    // Dynamic keyword analysis - calculate real metrics from content
    const calculateKeywordAnalysis = () => {
        if (!hasSEO || !hasContent || !page.seo_data || !page.content_data) {
            return [];
        }

        const primaryKeywords = page.seo_data.primaryKeywords || [];
        const secondaryKeywords = page.seo_data.secondaryKeywords || [];
        const content = page.content_data.parsed_content;

        // Combine all text content for total word count
        const allText = [
            content.meta_title || '',
            content.meta_description || '',
            ...(content.h1 || []),
            ...(content.h2 || []),
            ...(content.h3 || []),
            ...(content.paragraphs || [])
        ].join(' ').toLowerCase();

        const totalWords = allText.split(/\s+/).filter(w => w.length > 0).length;

        // Helper to count keyword occurrences in text
        const countOccurrences = (text: string, keywordLower: string): number => {
            const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
            const matches = text.toLowerCase().match(regex);
            return matches ? matches.length : 0;
        };

        const analyzeKeyword = (keyword: string, type: 'primary' | 'secondary') => {
            const keywordLower = keyword.toLowerCase();

            // Count occurrences in each section
            const titleCount = countOccurrences(content.meta_title || '', keywordLower);
            const h1Count = (content.h1 || []).reduce((sum, h) => sum + countOccurrences(h, keywordLower), 0);
            const h2Count = (content.h2 || []).reduce((sum, h) => sum + countOccurrences(h, keywordLower), 0);
            const h3Count = (content.h3 || []).reduce((sum, h) => sum + countOccurrences(h, keywordLower), 0);
            const paraCount = (content.paragraphs || []).reduce((sum, p) => sum + countOccurrences(p, keywordLower), 0);

            const totalCount = titleCount + h1Count + h2Count + h3Count + paraCount;

            // Calculate density
            const density = totalWords > 0 ? ((totalCount / totalWords) * 100).toFixed(2) + '%' : '0%';

            return {
                keyword,
                type,
                frequency: totalCount,
                density,
                titleCount,
                h1Count,
                h2Count,
                h3Count,
                paraCount
            };
        };

        return [
            ...primaryKeywords.map(kw => analyzeKeyword(kw, 'primary')),
            ...secondaryKeywords.map(kw => analyzeKeyword(kw, 'secondary'))
        ];
    };

    const keywordAnalysis = calculateKeywordAnalysis();


    // Handlers
    const handleSEOUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!primaryKeywordsInput.trim() || !projectId || !pageId || !user) return;

        const primaryKeywords = primaryKeywordsInput.split('\n').map(k => k.trim()).filter(k => k);
        const secondaryKeywords = secondaryKeywordsInput.split('\n').map(k => k.trim()).filter(k => k);
        uploadSEOKeywords(projectId, pageId, primaryKeywords, secondaryKeywords);

        setPrimaryKeywordsInput('');
        setSecondaryKeywordsInput('');
        setShowSEOModal(false);

        if (hasContent) {
        }
    };

    const handleContentUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contentH1.trim() || !projectId || !pageId || !user) return;

        const parsedContent = {
            meta_title: contentMetaTitle,
            meta_description: contentMetaDesc,
            h1: [contentH1],
            h2: contentH2s.split('\n').map(h => h.trim()).filter(h => h),
            h3: contentH3s.split('\n').map(h => h.trim()).filter(h => h),
            paragraphs: contentParagraphs.split('\n\n').map(p => p.trim()).filter(p => p),
            alt_texts: [] as string[],
        };

        uploadContent(projectId, pageId, parsedContent, sheetUrl || undefined);

        setContentMetaTitle('');
        setContentMetaDesc('');
        setContentH1('');
        setContentH2s('');
        setContentH3s('');
        setContentParagraphs('');
        setSheetUrl('');
        setShowContentModal(false);

        if (hasSEO) {
        }
    };

    const handleApprove = () => {
        if (!projectId || !pageId) return;
        approveContent(projectId, pageId);
    };

    const handleReject = () => {
        if (!projectId || !pageId) return;
        rejectContent(projectId, pageId);
    };

    const handleRevisionRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !pageId) return;
        requestRevision(projectId, pageId, revisionSEO, revisionContent);
        setShowRevisionModal(false);
    };

    // Handle CSV/XLSX file upload
    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvError('');

        // Validate file
        const validation = validateContentFile(file);
        if (!validation.valid) {
            setCsvError(validation.error || 'Invalid file');
            return;
        }

        try {
            const parsed = await parseContentFile(file);

            // Populate form fields
            setContentMetaTitle(parsed.meta_title);
            setContentMetaDesc(parsed.meta_description);
            setContentH1(parsed.h1[0] || '');
            setContentH2s(parsed.h2.join('\n'));
            setContentH3s(parsed.h3.join('\n'));
            setContentParagraphs(parsed.paragraphs.join('\n\n'));

            console.log('File parsed successfully:', parsed);
        } catch (error) {
            console.error('File parsing error:', error);
            setCsvError(error instanceof Error ? error.message : 'Failed to parse file');
        }
    };

    // Handle page deletion
    const handleDeletePage = async () => {
        if (!projectId || !pageId) return;
        try {
            await deletePage(projectId, pageId);
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    return (
        <div className="p-8">
            {/* Back Link */}
            <Link
                to={`/projects/${projectId}`}
                className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4"
            >
                <ArrowLeft size={16} />
                Back to {project.name}
            </Link>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{page.name}</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={page.status} />
                    {isAdmin && (
                        <>
                            {showDeleteConfirm ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-red-600">Delete page?</span>
                                    <button
                                        onClick={handleDeletePage}
                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete page"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Data Display */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SEO Keywords Section */}
                    <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Tag size={20} className="text-[var(--color-accent)]" />
                                <h2 className="text-lg font-semibold">SEO Keywords</h2>
                            </div>
                            {(isSEOAnalyst || isAdmin) && (
                                <button
                                    onClick={() => {
                                        setPrimaryKeywordsInput(page.seo_data?.primaryKeywords?.join('\n') || '');
                                        setSecondaryKeywordsInput(page.seo_data?.secondaryKeywords?.join('\n') || '');
                                        setShowSEOModal(true);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-md hover:opacity-90"
                                >
                                    {hasSEO ? 'Update' : 'Upload'} Keywords
                                </button>
                            )}
                        </div>

                        {hasSEO ? (
                            <div className="space-y-4">
                                {/* Primary Keywords */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Keywords</p>
                                        {(!page.seo_data!.primaryKeywords || page.seo_data!.primaryKeywords.length === 0) && (isSEOAnalyst || isAdmin) && (
                                            <span className="text-xs text-orange-600 font-medium">⚠️ Pending</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(page.seo_data!.primaryKeywords || []).map((kw: string, i: number) => {
                                            const stats = getKeywordStats(kw);
                                            return (
                                                <div key={i} className="relative group">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-help">
                                                        {kw}
                                                    </span>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-[180px]">
                                                            {stats ? (
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between"><span className="text-gray-400">Volume:</span> <span className="font-medium">{stats.searchVolume.toLocaleString()}/mo</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Difficulty:</span> <span className={`font-medium ${stats.difficulty > 70 ? 'text-red-400' : stats.difficulty > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{stats.difficulty}%</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">CPC:</span> <span className="font-medium">${stats.cpc}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Competition:</span> <span className={`font-medium ${stats.competition === 'HIGH' ? 'text-red-400' : stats.competition === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{stats.competition}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Bid Range:</span> <span className="font-medium">${stats.lowBid} - ${stats.highBid}</span></div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-2">
                                                                    <div className="text-yellow-400 font-medium">⏳ Analysis Pending</div>
                                                                    <div className="text-gray-400 text-xs mt-1">Keyword metrics will be available soon</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!page.seo_data!.primaryKeywords || page.seo_data!.primaryKeywords.length === 0) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400 italic">None specified</span>
                                                {(isSEOAnalyst || isAdmin) && (
                                                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                                                        Primary Keywords Pending
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Secondary Keywords */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary Keywords</p>
                                        {(!page.seo_data!.secondaryKeywords || page.seo_data!.secondaryKeywords.length === 0) && (isSEOAnalyst || isAdmin) && (
                                            <span className="text-xs text-orange-600 font-medium">⚠️ Pending</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(page.seo_data!.secondaryKeywords || []).map((kw: string, i: number) => {
                                            const stats = getKeywordStats(kw);
                                            return (
                                                <div key={i} className="relative group">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium cursor-help">
                                                        {kw}
                                                    </span>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-[180px]">
                                                            {stats ? (
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between"><span className="text-gray-400">Volume:</span> <span className="font-medium">{stats.searchVolume.toLocaleString()}/mo</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Difficulty:</span> <span className={`font-medium ${stats.difficulty > 70 ? 'text-red-400' : stats.difficulty > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{stats.difficulty}%</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">CPC:</span> <span className="font-medium">${stats.cpc}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Competition:</span> <span className={`font-medium ${stats.competition === 'HIGH' ? 'text-red-400' : stats.competition === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{stats.competition}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Bid Range:</span> <span className="font-medium">${stats.lowBid} - ${stats.highBid}</span></div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-2">
                                                                    <div className="text-yellow-400 font-medium">⏳ Analysis Pending</div>
                                                                    <div className="text-gray-400 text-xs mt-1">Keyword metrics will be available soon</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!page.seo_data!.secondaryKeywords || page.seo_data!.secondaryKeywords.length === 0) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400 italic">None specified</span>
                                                {(isSEOAnalyst || isAdmin) && (
                                                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                                                        Secondary Keywords Pending
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                    Version {page.seo_data!.version} • Updated {new Date(page.seo_data!.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-[var(--color-text-secondary)]">
                                <Tag size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="font-medium">No SEO keywords uploaded yet</p>
                                {!(isSEOAnalyst || isAdmin) && <p className="text-sm mt-1">Waiting for SEO Analyst</p>}
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText size={20} className="text-[var(--color-accent)]" />
                                <h2 className="text-lg font-semibold">Page Content</h2>
                            </div>
                            {(isContentWriter || isAdmin) && (
                                <button
                                    onClick={() => {
                                        if (page.content_data) {
                                            setContentMetaTitle(page.content_data.parsed_content.meta_title || '');
                                            setContentMetaDesc(page.content_data.parsed_content.meta_description || '');
                                            setContentH1(page.content_data.parsed_content.h1?.[0] || '');
                                            setContentH2s(page.content_data.parsed_content.h2?.join('\n') || '');
                                            setContentH3s(page.content_data.parsed_content.h3?.join('\n') || '');
                                            setContentParagraphs(page.content_data.parsed_content.paragraphs?.join('\n\n') || '');
                                        }
                                        setShowContentModal(true);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-md hover:opacity-90"
                                >
                                    {hasContent ? 'Update' : 'Upload'} Content
                                </button>
                            )}
                        </div>

                        {hasContent ? (
                            <div className="space-y-4">
                                {/* Tag-wise content breakdown - shown to all roles */}
                                {/* META Title */}
                                <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                    <div className="bg-blue-100 text-blue-800 px-4 py-2 font-medium text-sm flex items-center gap-2">
                                        <span className="bg-blue-200 px-2 py-0.5 rounded text-xs">META</span>
                                        Title
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[var(--color-text-primary)]">
                                            {highlightKeywords(page.content_data!.parsed_content.meta_title || 'Not set')}
                                        </p>
                                    </div>
                                </div>

                                {/* META Description */}
                                {page.content_data!.parsed_content.meta_description && (
                                    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                        <div className="bg-blue-50 text-blue-700 px-4 py-2 font-medium text-sm flex items-center gap-2">
                                            <span className="bg-blue-100 px-2 py-0.5 rounded text-xs">META</span>
                                            Description
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[var(--color-text-secondary)]">
                                                {highlightKeywords(page.content_data!.parsed_content.meta_description)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* H1 */}
                                {page.content_data?.parsed_content?.h1 && page.content_data.parsed_content.h1.length > 0 && (
                                    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                        <div className="bg-purple-100 text-purple-800 px-4 py-2 font-medium text-sm">
                                            H1 - Main Heading
                                        </div>
                                        <div className="p-4">
                                            {page.content_data.parsed_content.h1.map((h1, i) => (
                                                <p key={i} className="text-xl font-bold text-[var(--color-text-primary)]">{highlightKeywords(h1)}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* H2 */}
                                {page.content_data?.parsed_content?.h2 && page.content_data.parsed_content.h2.length > 0 && (
                                    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                        <div className="bg-green-100 text-green-800 px-4 py-2 font-medium text-sm flex items-center justify-between">
                                            <span>H2 - Section Headings</span>
                                            <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs">{page.content_data.parsed_content.h2.length} items</span>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {page.content_data.parsed_content.h2.map((h2, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-green-100 text-green-600 text-xs rounded flex items-center justify-center font-medium">{i + 1}</span>
                                                    <p className="text-lg font-semibold text-[var(--color-text-primary)]">{highlightKeywords(h2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* H3 */}
                                {page.content_data?.parsed_content?.h3 && page.content_data.parsed_content.h3.length > 0 && (
                                    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                        <div className="bg-orange-100 text-orange-800 px-4 py-2 font-medium text-sm flex items-center justify-between">
                                            <span>H3 - Sub Headings</span>
                                            <span className="bg-orange-200 text-orange-700 px-2 py-0.5 rounded text-xs">{page.content_data.parsed_content.h3.length} items</span>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {page.content_data.parsed_content.h3.map((h3, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 text-xs rounded flex items-center justify-center font-medium">{i + 1}</span>
                                                    <p className="text-lg font-semibold text-[var(--color-text-primary)]">{highlightKeywords(h3)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Paragraphs */}
                                {page.content_data?.parsed_content?.paragraphs && page.content_data.parsed_content.paragraphs.length > 0 && (
                                    <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 text-gray-700 px-4 py-2 font-medium text-sm flex items-center justify-between">
                                            <span>Paragraphs - Body Content</span>
                                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{page.content_data.parsed_content.paragraphs.length} paragraphs</span>
                                        </div>
                                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                                            {page.content_data.parsed_content.paragraphs.map((para, i) => (
                                                <div key={i} className="border-l-4 border-gray-200 pl-4">
                                                    <span className="text-xs text-[var(--color-text-tertiary)] block mb-1">Paragraph {i + 1}</span>
                                                    <p className="text-[var(--color-text-secondary)]">{highlightKeywords(para)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                    Version {page.content_data!.version} • Updated {new Date(page.content_data!.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-[var(--color-text-secondary)]">
                                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="font-medium">No page content uploaded yet</p>
                                {!(isContentWriter || isAdmin) && <p className="text-sm mt-1">Waiting for Content Writer</p>}
                            </div>
                        )}
                    </div>

                    {/* Keyword Analysis (only show to verifier when both data exist) */}
                    {isVerifier && hasSEO && hasContent && keywordAnalysis.length > 0 && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 font-medium text-sm">
                                🔑 Keywords Analysis
                            </div>
                            <div className="p-4 space-y-2">
                                {keywordAnalysis.map((kw, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-md ${kw.type === 'primary' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${kw.type === 'primary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {kw.type}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-sm font-medium ${kw.type === 'primary' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{kw.keyword}</span>
                                            <span className="text-sm text-gray-600">{kw.frequency}x ({kw.density})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded ${kw.titleCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{kw.titleCount} Title</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.h1Count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{kw.h1Count} H1</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.h2Count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{kw.h2Count} H2</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.h3Count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{kw.h3Count} H3</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.paraCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{kw.paraCount} Para</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Scores or Pending Indicator */}
                <div className="space-y-4">
                    {hasAnalysis ? (
                        <>
                            {/* Scores Panel */}
                            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                                <h2 className="text-lg font-semibold mb-4 text-center">Overall Score</h2>
                                <div className="flex justify-center mb-6">
                                    <ScoreDisplay score={page.analysis?.overall_score ?? 0} size="lg" />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>SEO Score</span>
                                            <span className="font-medium">{page.analysis?.seo_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${page.analysis?.seo_score ?? 0}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Readability</span>
                                            <span className={`font-bold ${getLetterGrade(page.analysis?.readability_score ?? 0).color}`}>
                                                Grade {getLetterGrade(page.analysis?.readability_score ?? 0).grade} ({page.analysis?.readability_score ?? 0}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Keyword Density</span>
                                            <span className="font-medium">{page.analysis?.keyword_density_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${page.analysis?.keyword_density_score ?? 0}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Grammar</span>
                                            <span className="font-medium">{page.analysis?.grammar_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${page.analysis?.grammar_score ?? 0}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Content Intent</span>
                                            <span className="font-medium">{page.analysis?.content_intent_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${page.analysis?.content_intent_score ?? 0}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Technical Health</span>
                                            <span className="font-medium">{page.analysis?.technical_health_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${page.analysis?.technical_health_score ?? 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verifier Actions */}
                            {isVerifier && page.status === 'pending_review' && (
                                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">Review Actions</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleApprove}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-smooth"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setShowRevisionModal(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-smooth"
                                        >
                                            <RotateCcw size={18} />
                                            Request Revision
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-smooth"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Status indicators */}
                            {page.status === 'approved' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                    <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold text-green-800">Content Approved</h3>
                                    <p className="text-sm text-green-600">Ready to publish</p>
                                </div>
                            )}
                            {page.status === 'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <XCircle size={32} className="text-red-600 mx-auto mb-2" />
                                    <h3 className="font-semibold text-red-800">Content Rejected</h3>
                                    <p className="text-sm text-red-600">Requires significant changes</p>
                                </div>
                            )}
                        </>
                    ) : (
                        // Pending Data Indicator
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Pending Data</h3>
                            <div className="space-y-3">
                                {!hasSEO && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <Tag size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800 text-sm">Waiting for SEO Keywords</p>
                                            <p className="text-xs text-blue-600 mt-0.5">SEO Analyst needs to upload keywords</p>
                                        </div>
                                    </div>
                                )}
                                {hasSEO && (isSEOAnalyst || isAdmin) && (
                                    <>
                                        {(!page.seo_data!.primaryKeywords || page.seo_data!.primaryKeywords.length === 0) && (
                                            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                                <Tag size={20} className="text-orange-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-orange-800 text-sm">Primary Keywords Pending</p>
                                                    <p className="text-xs text-orange-600 mt-0.5">SEO Analyst needs to add primary keywords</p>
                                                </div>
                                            </div>
                                        )}
                                        {(!page.seo_data!.secondaryKeywords || page.seo_data!.secondaryKeywords.length === 0) && (
                                            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                                <Tag size={20} className="text-orange-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-orange-800 text-sm">Secondary Keywords Pending</p>
                                                    <p className="text-xs text-orange-600 mt-0.5">SEO Analyst needs to add secondary keywords</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                {!hasContent && (
                                    <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                        <FileText size={20} className="text-purple-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-purple-800 text-sm">Waiting for Page Content</p>
                                            <p className="text-xs text-purple-600 mt-0.5">Content Writer needs to upload content</p>
                                        </div>
                                    </div>
                                )}
                                {hasContent && (isContentWriter || isAdmin) && missingContentFields.length > 0 && (
                                    <>
                                        {missingContentFields.map((field) => (
                                            <div key={field} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                                <FileText size={20} className="text-orange-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-orange-800 text-sm">{field} Pending</p>
                                                    <p className="text-xs text-orange-600 mt-0.5">Content Writer needs to add {field.toLowerCase()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {(page.status as string) === 'processing' && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Loader2 size={20} className="text-blue-600 shrink-0 animate-spin" />
                                            <div className="flex-1">
                                                <p className="font-medium text-blue-800 text-sm">Analyzing Content...</p>
                                                <p className="text-xs text-blue-600 mt-0.5">{analysisProgress.message}</p>
                                            </div>
                                            <span className="text-xs font-medium text-blue-700">{analysisProgress.progress}%</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-blue-100 rounded-full h-2 mb-3">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${analysisProgress.progress}%` }}
                                            />
                                        </div>

                                        {/* Progress Steps */}
                                        <div className="space-y-2">
                                            {[
                                                { step: 1, label: 'Preparing content data', icon: FileText },
                                                { step: 2, label: 'Analyzing SEO keywords', icon: Tag },
                                                { step: 3, label: 'Running AI analysis', icon: Loader2 },
                                                { step: 4, label: 'Calculating scores', icon: CheckCircle },
                                                { step: 5, label: 'Generating suggestions', icon: MessageSquare },
                                                { step: 6, label: 'Finalizing results', icon: CheckCircle },
                                            ].map((stepInfo) => {
                                                const isActive = analysisProgress.step >= stepInfo.step;
                                                const isCurrent = analysisProgress.step === stepInfo.step;

                                                return (
                                                    <div
                                                        key={stepInfo.step}
                                                        className={`flex items-center gap-2 text-xs ${isActive ? 'text-blue-800' : 'text-blue-400'
                                                            }`}
                                                    >
                                                        {isCurrent ? (
                                                            <Loader2 size={14} className="animate-spin shrink-0" />
                                                        ) : isActive ? (
                                                            <CheckCircle size={14} className="shrink-0" />
                                                        ) : (
                                                            <stepInfo.icon size={14} className="shrink-0" />
                                                        )}
                                                        <span className={isActive ? 'font-medium' : ''}>{stepInfo.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {hasSEO && hasContent && !hasAnalysis && (page.status as string) !== 'processing' && (page.status as string) !== 'pending_review' && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <Loader2 size={20} className="text-gray-600 shrink-0 mt-0.5 animate-spin" />
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Analysis Starting...</p>
                                            <p className="text-xs text-gray-600 mt-0.5">Both data uploaded, analysis will begin shortly</p>
                                        </div>
                                    </div>
                                )}
                                {hasSEO && hasContent && !hasAnalysis && (page.status as string) === 'pending_review' && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <Loader2 size={20} className="text-blue-600 shrink-0 mt-0.5 animate-spin" />
                                        <div>
                                            <p className="font-medium text-blue-800 text-sm">Analysis Complete - Refreshing...</p>
                                            <p className="text-xs text-blue-600 mt-0.5">Analysis finished, loading results...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Section - Verifier Only */}
            {
                isVerifier && (
                    <div className="mt-6 bg-white border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare size={20} className="text-[var(--color-accent)]" />
                            <h2 className="text-lg font-semibold">Comments</h2>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                            <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth">
                                Send
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">No comments yet</p>
                        </div>
                    </div>
                )
            }

            {/* SEO Upload Modal */}
            {
                showSEOModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-xl font-semibold mb-4">Upload SEO Keywords</h2>
                            <form onSubmit={handleSEOUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Primary Keywords (one per line) *</label>
                                    <p className="text-xs text-gray-500 mb-2">High-priority target keywords (1-3 recommended)</p>
                                    <textarea
                                        rows={4}
                                        placeholder="industrial pumps&#10;velocity pumps"
                                        value={primaryKeywordsInput}
                                        onChange={(e) => setPrimaryKeywordsInput(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Secondary Keywords (one per line)</label>
                                    <p className="text-xs text-gray-500 mb-2">Supporting/long-tail keywords</p>
                                    <textarea
                                        rows={4}
                                        placeholder="high-pressure systems&#10;pump manufacturer"
                                        value={secondaryKeywordsInput}
                                        onChange={(e) => setSecondaryKeywordsInput(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowSEOModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90">
                                        Upload Keywords
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Content Upload Modal */}
            {
                showContentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-7xl mx-4 my-4">
                            <h2 className="text-xl font-semibold mb-4">Upload Page Content</h2>
                            <form onSubmit={handleContentUpload} className="space-y-4">
                                {/* File Upload Section */}
                                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-800 mb-2">📄 Upload CSV or Excel File</p>
                                    <div className="flex gap-4 items-end">
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleCSVUpload}
                                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                                        />
                                        <a
                                            href="/sample_content_template.csv"
                                            download
                                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                                        >
                                            ⬇️ Download CSV template
                                        </a>
                                    </div>
                                    {csvError && <p className="text-xs text-red-600 mt-1">{csvError}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Google Sheet URL (optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        value={sheetUrl}
                                        onChange={(e) => setSheetUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>

                                <div className="border-t border-[var(--color-border)] pt-4">
                                    <p className="text-sm font-medium mb-3">Or enter content manually:</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Left Column */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Meta Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Page title for search engines"
                                                    value={contentMetaTitle}
                                                    onChange={(e) => setContentMetaTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Meta Description</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Brief description for search results"
                                                    value={contentMetaDesc}
                                                    onChange={(e) => setContentMetaDesc(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">H1 Heading *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Main page heading"
                                                    value={contentH1}
                                                    onChange={(e) => setContentH1(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">H2 Headings (one per line)</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Section heading 1&#10;Section heading 2"
                                                    value={contentH2s}
                                                    onChange={(e) => setContentH2s(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">H3 Headings (one per line)</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Sub heading 1&#10;Sub heading 2"
                                                    value={contentH3s}
                                                    onChange={(e) => setContentH3s(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Content - Full Width */}
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium mb-1">Body Content (paragraphs separated by blank line)</label>
                                        <textarea
                                            rows={4}
                                            placeholder="First paragraph...&#10;&#10;Second paragraph..."
                                            value={contentParagraphs}
                                            onChange={(e) => setContentParagraphs(e.target.value)}
                                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowContentModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90">
                                        Upload Content
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Revision Request Modal */}
            {
                showRevisionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-xl font-semibold mb-4">Request Revision</h2>
                            <form onSubmit={handleRevisionRequest} className="space-y-4">
                                <p className="text-[var(--color-text-secondary)]">Select what needs to be revised:</p>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={revisionSEO}
                                            onChange={(e) => setRevisionSEO(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <div>
                                            <p className="font-medium">SEO Keywords</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Request updated keywords</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={revisionContent}
                                            onChange={(e) => setRevisionContent(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <div>
                                            <p className="font-medium">Content</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Request updated content</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowRevisionModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                                        Request Revision
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PageDetailPage;
