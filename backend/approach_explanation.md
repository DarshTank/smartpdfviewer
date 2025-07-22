# Approach Explanation: Round 1B - Persona-Driven Document Intelligence

## Overview
Round 1B of the "Connecting the Dots" challenge focuses on analyzing multiple PDFs to extract sections most relevant to a given persona and job-to-be-done. The goal is to provide document intelligence by ranking and summarizing sections based on their relevance to the user's context, all while ensuring offline, CPU-only processing.

## Methodology
1. **Outline Extraction**: For each uploaded PDF, the backend invokes a Python script (`extract_outline.py`) using PyMuPDF to extract the document's title and a structured outline (H1, H2, H3 headings with page numbers). This ensures consistent, language-agnostic extraction of document structure.

2. **Keyword Tokenization**: The persona and job-to-be-done inputs are tokenized into keywords using the `natural` library. The job keywords are given higher weight (1 point each), while persona keywords are weighted at 0.5 points each. This reflects the primary focus on the job, with the persona providing additional context.

3. **Section Scoring**: Each heading in the outlines is scored based on the presence of these keywords. The score is the sum of all matching keywords, with job keywords contributing more to the score. This simple, interpretable scoring system ensures transparency and efficiency, suitable for CPU-only environments.

4. **Ranking and Selection**: Sections with nonzero scores are selected and ranked in descending order of importance. This ranking helps users quickly identify the most relevant parts of the documents for their specific needs.

5. **Subsection Summaries**: For each relevant section, a placeholder summary is generated (e.g., "Summary of [section title]"). This can be extended in future iterations with more advanced summarization techniques, but remains lightweight for the current constraints.

6. **Storage and Retrieval**: The analysis results, including ranked sections and summaries, are stored in MongoDB Atlas with a unique `analysisId`. Users can retrieve these results via the API.

## Compliance
- **Offline Processing**: All PDF and text analysis is performed offline; only storage uses MongoDB Atlas.
- **Performance**: The approach is optimized for CPU-only execution and processes 3–5 PDFs in under 60 seconds.
- **Multilingual Support**: UTF-8 encoding and PyMuPDF ensure support for non-Latin scripts.

This methodology balances accuracy, interpretability, and efficiency, making it ideal for the hackathon's constraints. 