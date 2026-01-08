# Content Verification Tool - Implementation Checklist

> **Document Purpose:** Track changes required from December 17 & 29, 2025 meetings  
> **Last Updated:** January 6, 2026  
> **Legend:** ✅ Done | 🔄 Partial | ❌ Not Started

---

## Overview

This document tracks the implementation status of features discussed in the **December 17, 2025** and **December 29, 2025** sync calls with Mountaintop Web Design.

---

## December 17, 2025 Meeting - Changes

### 1. Primary/Secondary Keyword Separation

| Item | Status | Notes |
|------|--------|-------|
| Separate `primaryKeywords` and `secondaryKeywords` fields in data model | ✅ Done | `src/types/project.ts` - SEOData interface has both fields |
| Store primary/secondary keywords separately in database | ✅ Done | `seoService.ts` stores `primary_keywords` and `secondary_keywords` |
| Display primary keywords distinctly (blue badge) | ✅ Done | `PageDetailPage.tsx` lines 386-418 - blue badges |
| Display secondary keywords distinctly (gray badge) | ✅ Done | `PageDetailPage.tsx` lines 420-452 - gray badges |

**Code References:**
- [SEOData interface](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/types/project.ts#L11-L19)
- [PageDetailPage.tsx - keyword display](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/pages/projects/PageDetailPage.tsx#L386-L452)

---

### 2. Enhanced SEO Checks for Primary Keywords

| Item | Status | Notes |
|------|--------|-------|
| Check primary keyword in Title Tag | ❌ Not Started | Need to add validation logic |
| Check primary keyword in H1 | ❌ Not Started | Need to add validation logic |
| Check primary keyword in H2 | ❌ Not Started | Need to add validation logic |
| Check primary keyword in First Paragraph | ❌ Not Started | Need to add validation logic |
| Check primary keyword density < 2% | ❌ Not Started | Need to add validation logic |
| Display pass/fail indicators for each check | ❌ Not Started | UI component needed |

---

### 3. Detailed Keyword Placement Breakdown

| Item | Status | Notes |
|------|--------|-------|
| Count keyword occurrences in Title | ✅ Done | `calculateKeywordAnalysis()` function includes `titleCount` |
| Count keyword occurrences in H1 | ✅ Done | `calculateKeywordAnalysis()` includes `h1Count` |
| Count keyword occurrences in H2 | ✅ Done | `calculateKeywordAnalysis()` includes `h2Count` |
| Count keyword occurrences in H3 | ✅ Done | `calculateKeywordAnalysis()` includes `h3Count` |
| Count keyword occurrences in Paragraphs | ✅ Done | `calculateKeywordAnalysis()` includes `paraCount` |
| Display breakdown per keyword | ✅ Done | Keyword Analysis section shows per-keyword breakdown |

**Code Reference:**
- [calculateKeywordAnalysis function](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/pages/projects/PageDetailPage.tsx#L153-L214)

---

### 4. 90% Auto-Routing Threshold

| Item | Status | Notes |
|------|--------|-------|
| Check if ALL scores are ≥ 90% | ❌ Not Started | No threshold logic implemented |
| Auto-route to Content Verifier only if threshold met | ❌ Not Started | Current flow sends to verifier regardless of score |
| Keep content with Writer/SEO if below threshold | ❌ Not Started | AI gatekeeper logic not implemented |
| Display clear message when below threshold | ❌ Not Started | UI feedback needed |

---

### 5. Review Comments on Rejection/Revision

| Item | Status | Notes |
|------|--------|-------|
| Comments input for Content Verifier | ✅ Done | `PageDetailPage.tsx` has comment input UI |
| Store comments in database | 🔄 Partial | `review_comments` table exists, basic storage implemented |
| Display comments to Writer/SEO Analyst | ❌ Not Started | Comments only visible to Verifier role |
| Comments visible on revision requests | ❌ Not Started | Need to show why revision was requested |

---

### 6. Remove "My Tasks" Section

| Item | Status | Notes |
|------|--------|-------|
| Remove dedicated "My Tasks" navigation | ✅ Done | No "My Tasks" page in codebase |
| Show consolidated page list with status | ✅ Done | Dashboard shows pages by status |

---

### 7. Keyword Highlighting for Writers

| Item | Status | Notes |
|------|--------|-------|
| Highlight keywords in content view | 🔄 Partial | `highlightKeywords()` exists but only for Verifier role |
| Enable highlighting for Content Writer role | ❌ Not Started | Line 115: `if (!isVerifier || ...)` blocks non-verifiers |
| Primary keywords: yellow highlight | ✅ Done | Yellow highlight implemented |
| Secondary keywords: cyan highlight | ✅ Done | Cyan highlight implemented |

**Code Reference:**
- [highlightKeywords function](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/pages/projects/PageDetailPage.tsx#L114-L150)

---

### 8. Version/Revision History

| Item | Status | Notes |
|------|--------|-------|
| Store version number for SEO data | ✅ Done | `version` field in `seo_data` table |
| Store version number for content data | ✅ Done | `version` field in `content_data` table |
| Display version info | ✅ Done | "Version X • Updated DATE" shown |
| View previous versions | ❌ Not Started | `getSEODataHistory()` exists but no UI |
| Compare versions side-by-side | ❌ Not Started | Feature not implemented |

---

### 9. ClickUp Integration (Future)

| Item | Status | Notes |
|------|--------|-------|
| Create ClickUp task on status change | ❌ Not Started | Future feature |
| Update ClickUp task on approval/rejection | ❌ Not Started | Future feature |
| Sync revision requests to ClickUp | ❌ Not Started | Future feature |

---

### 10. Multiple Content Entry Points (Future)

| Item | Status | Notes |
|------|--------|-------|
| Upload content via manual form | ✅ Done | Form input in Content Modal |
| Upload content via Google Sheet URL | ✅ Done | Sheet URL field available |
| Upload content via CSV/XLSX file | ✅ Done | `parseContentFile()` implemented |
| Generate content via AI | ❌ Not Started | Future feature |

---

## December 29, 2025 Meeting - Changes

### 11. Process Guidelines UI (? Icon)

| Item | Status | Notes |
|------|--------|-------|
| Add question mark (?) icon in header | ❌ Not Started | UI component needed |
| Show complete workflow on click | ❌ Not Started | Modal/drawer with process steps |
| Visible to all user roles | ❌ Not Started | Access control logic needed |

---

### 12. DataForSEO Integration - Enhanced Metrics

| Item | Status | Notes |
|------|--------|-------|
| Fetch CPC from DataForSEO | ✅ Done | `dataForSEOService.ts` fetches CPC |
| Fetch Search Volume | ✅ Done | `search_volume` field retrieved |
| Fetch Difficulty (competition_index) | ✅ Done | `competition_index` used as difficulty |
| Fetch Bid Range (low/high) | ✅ Done | `low_top_of_page_bid`, `high_top_of_page_bid` |
| Display metrics in keyword tooltips | ✅ Done | Hover tooltips show all metrics |

**Code Reference:**
- [getKeywordStats function](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/pages/projects/PageDetailPage.tsx#L85-L111)

---

### 13. AI Keyword Ranking/Ordering

| Item | Status | Notes |
|------|--------|-------|
| Fetch metrics for all keywords | ✅ Done | Metrics fetched on keyword upload |
| Calculate composite ranking score | ❌ Not Started | Algorithm not implemented |
| Sort keywords by ranking score | ❌ Not Started | No auto-sorting in UI |
| Display high-value keywords at top | ❌ Not Started | Current display is in upload order |

---

### 14. Weighted Keyword Scoring Formula

| Item | Status | Notes |
|------|--------|-------|
| Implement formula: `Score = CPC × Usage Count` | ❌ Not Started | Calculation logic needed |
| Display weighted score per keyword | ❌ Not Started | UI field needed |
| Motivate writers to use high-value keywords | ❌ Not Started | Guidance/tooltip needed |

---

### 15. Project Dashboard Overview Stats

| Item | Status | Notes |
|------|--------|-------|
| Show Total Pages count | ✅ Done | `ProjectDetailPage.tsx` shows total |
| Show Pending Reviews count | ✅ Done | Stats card shows pending count |
| Show Approved count | ✅ Done | Stats card shows approved count |
| Show Average Score | ✅ Done | `stats.avgScore` calculated and displayed |

**Code Reference:**
- [Stats calculation](file:///Users/dhruvsaija/Desktop/Cursor/mountaintop-contect-verification-tool/src/pages/projects/ProjectDetailPage.tsx#L36-L42)

---

## Summary

### Implementation Progress by Category

| Category | Done | Partial | Not Started | Total |
|----------|------|---------|-------------|-------|
| Primary/Secondary Keywords | 4 | 0 | 1 | 5 |
| Enhanced SEO Checks | 0 | 0 | 6 | 6 |
| Keyword Placement Breakdown | 6 | 0 | 0 | 6 |
| 90% Auto-Routing | 0 | 0 | 4 | 4 |
| Review Comments | 1 | 1 | 2 | 4 |
| My Tasks Removal | 2 | 0 | 0 | 2 |
| Keyword Highlighting | 2 | 1 | 1 | 4 |
| Version History | 3 | 0 | 2 | 5 |
| ClickUp Integration | 0 | 0 | 3 | 3 |
| Content Entry Points | 3 | 0 | 1 | 4 |
| Process Guidelines UI | 0 | 0 | 3 | 3 |
| DataForSEO Metrics | 5 | 0 | 0 | 5 |
| AI Keyword Ranking | 1 | 0 | 3 | 4 |
| Weighted Scoring | 0 | 0 | 3 | 3 |
| Dashboard Stats | 4 | 0 | 0 | 4 |
| **TOTAL** | **31** | **2** | **29** | **62** |

### Overall Progress: **53%** (31 Done + 2 Partial out of 62 items)

---

## Priority Implementation Order

### High Priority (Should implement next)

1. **Enhanced SEO Checks for Primary Keywords** (6 items)
   - Critical for content quality gating

2. **90% Auto-Routing Threshold** (4 items)
   - Core workflow requirement from client

3. **Keyword Highlighting for Writers** (1 remaining item)
   - Quick fix: change line 115 condition

4. **AI Keyword Ranking/Ordering** (3 items)
   - Discussed in Dec 29 meeting

5. **Weighted Keyword Scoring** (3 items)
   - Motivates proper keyword usage

### Medium Priority

6. **Process Guidelines UI** (3 items)
7. **Review Comments visibility** (2 items)
8. **Version History UI** (2 items)

### Low Priority (Future)

9. **ClickUp Integration** (3 items)
10. **AI Content Generation** (1 item)

---

## Quick Wins

These can be implemented in under 1 hour:

1. ✅ **Enable keyword highlighting for Content Writers**
   - Change line 115 in `PageDetailPage.tsx`
   - From: `if (!isVerifier || ...)`
   - To: `if ((!isVerifier && !isContentWriter) || ...)`

2. ✅ **Add primary keyword limit validation (1-3)**
   - Add UI warning when > 3 primary keywords entered

3. ✅ **Display comments to Writers/SEO Analysts**
   - Remove role restriction on comments section visibility

---

> **Next Steps:** Review this checklist and prioritize which items to implement first. The High Priority items are recommended based on client feedback importance.
