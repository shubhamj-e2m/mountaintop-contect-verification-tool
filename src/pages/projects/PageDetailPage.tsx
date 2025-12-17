import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Tag, CheckCircle, XCircle, RotateCcw, MessageSquare, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ScoreDisplay from '../../components/ui/ScoreDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../stores/projectStore';

const PageDetailPage: React.FC = () => {
    const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
    const { user } = useAuth();
    const { projects, uploadSEOKeywords, uploadContent, approveContent, rejectContent, requestRevision } = useProjectStore();

    const [showSEOModal, setShowSEOModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Form state
    const [seoKeywordsInput, setSeoKeywordsInput] = useState('');
    const [contentMetaTitle, setContentMetaTitle] = useState('');
    const [contentMetaDesc, setContentMetaDesc] = useState('');
    const [contentH1, setContentH1] = useState('');
    const [contentH2s, setContentH2s] = useState('');
    const [contentH3s, setContentH3s] = useState('');
    const [contentParagraphs, setContentParagraphs] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');
    const [revisionSEO, setRevisionSEO] = useState(true);
    const [revisionContent, setRevisionContent] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const project = projects.find(p => p.id === projectId);
    const page = project?.pages.find(p => p.id === pageId);

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
    const isSEOAnalyst = user?.role === 'seo_analyst';
    const isContentWriter = user?.role === 'content_writer';

    // Helper function to highlight keywords for verifier
    const highlightKeywords = (text: string): React.ReactElement => {
        if (!isVerifier || !hasSEO || !page.seo_data?.keywords) {
            return <>{text}</>;
        }

        const keywords = page.seo_data.keywords;
        let highlightedText = text;

        // Create a regex pattern to match any keyword (case-insensitive)
        const pattern = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        if (!pattern) return <>{text}</>;

        const regex = new RegExp(`(${pattern})`, 'gi');
        const parts = highlightedText.split(regex);

        return (
            <>
                {parts.map((part, i) => {
                    const isKeyword = keywords.some(kw =>
                        part.toLowerCase() === kw.toLowerCase()
                    );
                    return isKeyword ? (
                        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
                    ) : (
                        <span key={i}>{part}</span>
                    );
                })}
            </>
        );
    };

    // Dynamic keyword analysis - calculate real metrics from content
    const calculateKeywordAnalysis = () => {
        if (!hasSEO || !hasContent || !page.seo_data || !page.content_data) {
            return [];
        }

        const keywords = page.seo_data.keywords;
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

        return keywords.map(keyword => {
            const keywordLower = keyword.toLowerCase();

            // Count occurrences (case-insensitive)
            const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
            const matches = allText.match(regex);
            const frequency = matches ? matches.length : 0;

            // Calculate density
            const density = totalWords > 0 ? ((frequency / totalWords) * 100).toFixed(2) + '%' : '0%';

            // Check placement
            const inTitle = (content.meta_title || '').toLowerCase().includes(keywordLower);
            const inH1 = (content.h1 || []).some(h => h.toLowerCase().includes(keywordLower));
            const inFirstParagraph = (content.paragraphs?.[0] || '').toLowerCase().includes(keywordLower);

            return {
                keyword,
                frequency,
                density,
                in_title: inTitle,
                in_h1: inH1,
                in_first_paragraph: inFirstParagraph
            };
        });
    };

    const keywordAnalysis = calculateKeywordAnalysis();


    // Handlers
    const handleSEOUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seoKeywordsInput.trim() || !projectId || !pageId || !user) return;

        const keywords = seoKeywordsInput.split('\n').map(k => k.trim()).filter(k => k);
        uploadSEOKeywords(projectId, pageId, keywords, user.id);

        setSeoKeywordsInput('');
        setShowSEOModal(false);

        if (hasContent) {
            setIsProcessing(true);
            setTimeout(() => setIsProcessing(false), 2500);
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

        uploadContent(projectId, pageId, parsedContent, user.id, sheetUrl || undefined);

        setContentMetaTitle('');
        setContentMetaDesc('');
        setContentH1('');
        setContentH2s('');
        setContentH3s('');
        setContentParagraphs('');
        setSheetUrl('');
        setShowContentModal(false);

        if (hasSEO) {
            setIsProcessing(true);
            setTimeout(() => setIsProcessing(false), 2500);
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

    // Processing State
    if (isProcessing || page.status === 'processing') {
        return (
            <div className="p-8">
                <Link
                    to={`/projects/${projectId}`}
                    className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to {project.name}
                </Link>

                <div className="bg-white border border-[var(--color-border)] rounded-lg p-12 text-center">
                    <Loader2 size={48} className="animate-spin text-[var(--color-accent)] mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Analyzing Content...</h2>
                    <p className="text-[var(--color-text-secondary)]">Our AI is processing your SEO keywords and content. This usually takes a few seconds.</p>
                </div>
            </div>
        );
    }

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
                <StatusBadge status={page.status} />
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
                            {isSEOAnalyst && (
                                <button
                                    onClick={() => {
                                        setSeoKeywordsInput(page.seo_data?.keywords.join('\n') || '');
                                        setShowSEOModal(true);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-md hover:opacity-90"
                                >
                                    {hasSEO ? 'Update' : 'Upload'} Keywords
                                </button>
                            )}
                        </div>

                        {hasSEO ? (
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {page.seo_data!.keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                    Version {page.seo_data!.version} • Updated {new Date(page.seo_data!.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-[var(--color-text-secondary)]">
                                <Tag size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="font-medium">No SEO keywords uploaded yet</p>
                                {!isSEOAnalyst && <p className="text-sm mt-1">Waiting for SEO Analyst</p>}
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
                            {isContentWriter && (
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
                                {!isContentWriter && <p className="text-sm mt-1">Waiting for Content Writer</p>}
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
                                    <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-medium">{kw.keyword}</span>
                                            <span className="text-sm text-gray-600">{kw.frequency}x ({kw.density})</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded ${kw.in_title ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>Title</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.in_h1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>H1</span>
                                            <span className={`px-2 py-0.5 rounded ${kw.in_first_paragraph ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1st Para</span>
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
                                            <span className="font-medium">{page.analysis?.readability_score ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${page.analysis?.readability_score ?? 0}%` }} />
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
                                {!hasContent && (
                                    <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                        <FileText size={20} className="text-purple-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-purple-800 text-sm">Waiting for Page Content</p>
                                            <p className="text-xs text-purple-600 mt-0.5">Content Writer needs to upload content</p>
                                        </div>
                                    </div>
                                )}
                                {hasSEO && hasContent && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <Loader2 size={20} className="text-gray-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Analysis Pending</p>
                                            <p className="text-xs text-gray-600 mt-0.5">Both data uploaded, waiting for processing</p>
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
                                    <label className="block text-sm font-medium mb-1">Keywords (one per line) *</label>
                                    <textarea
                                        rows={8}
                                        placeholder="industrial pumps&#10;high-pressure systems&#10;pump manufacturer"
                                        value={seoKeywordsInput}
                                        onChange={(e) => setSeoKeywordsInput(e.target.value)}
                                        required
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                            <h2 className="text-xl font-semibold mb-4">Upload Page Content</h2>
                            <form onSubmit={handleContentUpload} className="space-y-4">
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
                                                rows={2}
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
                                                rows={2}
                                                placeholder="Sub heading 1&#10;Sub heading 2"
                                                value={contentH3s}
                                                onChange={(e) => setContentH3s(e.target.value)}
                                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                            />
                                        </div>
                                        <div>
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
