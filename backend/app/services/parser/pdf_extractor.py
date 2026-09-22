"""PDF Text Extractor with Column-Aware Spatial Sorting (Module 4 / T4.1, T4.2).

Extracts raw and structured text from PDF documents using PyMuPDF.
Implements column-boundary detection to prevent multi-column resumes
from interleaving adjacent columns into garbled text.
"""

import re

import fitz  # PyMuPDF


class PDFExtractor:
    """Extracts text from PDF bytes with column-aware geometry ordering."""

    @classmethod
    def extract_text(cls, pdf_bytes: bytes) -> str:
        """
        Extracts clean text from a PDF in correct visual reading order.

        Handles:
        - Single-column standard layouts (T4.1)
        - Multi-column and sidebar layouts (T4.2)
        - Sanitization of non-printable control characters
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_pages: list[str] = []

        try:
            for page in doc:
                page_text = cls._extract_page_blocks_column_aware(page)
                if page_text.strip():
                    extracted_pages.append(page_text.strip())
        finally:
            doc.close()

        full_text = "\n\n".join(extracted_pages)
        return cls._clean_text(full_text)

    @classmethod
    def _extract_page_blocks_column_aware(cls, page: fitz.Page) -> str:
        """
        Sorts PyMuPDF text blocks using column geometry awareness.
        Block tuple: (x0, y0, x1, y1, text, block_no, block_type)
        block_type == 0 is text.
        """
        raw_blocks = page.get_text("blocks")
        # Keep only text blocks with actual non-whitespace content
        text_blocks: list[tuple[float, float, float, float, str]] = []
        for b in raw_blocks:
            if len(b) >= 7 and b[6] == 0:  # block_type == 0
                txt = b[4].strip()
                if txt:
                    text_blocks.append((b[0], b[1], b[2], b[3], b[4]))

        if not text_blocks:
            return ""

        page_width = page.rect.width
        if page_width <= 0:
            page_width = max(b[2] for b in text_blocks) or 600.0

        # Detect whether the page exhibits multi-column structure
        mid_x = page_width * 0.5
        has_multi_column = False
        left_count = 0
        right_count = 0

        for b in text_blocks:
            x0, _, x1, _, _ = b
            width = x1 - x0
            if width > page_width * 0.65:
                # Spans most of the page (header, title, banner)
                continue
            elif x1 <= mid_x + (page_width * 0.08):
                left_count += 1
            elif x0 >= mid_x - (page_width * 0.08):
                right_count += 1

        # If both left and right columns have significant text blocks (>= 2 each),
        # treat layout as multi-column
        if left_count >= 2 and right_count >= 2:
            has_multi_column = True

        if not has_multi_column:
            # Single-column layout: sort purely by vertical position y0, then x0
            sorted_blocks = sorted(text_blocks, key=lambda b: (b[1], b[0]))
            return "\n\n".join(b[4].strip() for b in sorted_blocks)

        # Multi-column layout:
        # Separate into: Top Full-width Header, Left Column, Right Column, Bottom Full-width Footer
        # Determine average y position of left and right blocks to identify header threshold
        header_y_limit = min(
            (b[1] for b in text_blocks if (b[2] - b[0]) < page_width * 0.65), default=150.0
        )

        header_blocks: list[tuple[float, float, float, float, str]] = []
        footer_blocks: list[tuple[float, float, float, float, str]] = []
        left_col: list[tuple[float, float, float, float, str]] = []
        right_col: list[tuple[float, float, float, float, str]] = []

        # Identify maximum y of columns for footer detection
        max_col_y = max(b[3] for b in text_blocks)

        for b in text_blocks:
            x0, y0, x1, y1, text = b
            width = x1 - x0

            # Spanning header above columns
            if width > page_width * 0.60 and y1 <= header_y_limit + 30:
                header_blocks.append(b)
            # Spanning footer below columns
            elif width > page_width * 0.60 and y0 >= max_col_y - 40:
                footer_blocks.append(b)
            elif x1 <= mid_x + (page_width * 0.08):
                left_col.append(b)
            else:
                right_col.append(b)

        # Sort each section internally by vertical reading order (y0)
        header_blocks.sort(key=lambda b: (b[1], b[0]))
        left_col.sort(key=lambda b: (b[1], b[0]))
        right_col.sort(key=lambda b: (b[1], b[0]))
        footer_blocks.sort(key=lambda b: (b[1], b[0]))

        # Check if left column is a sidebar (e.g. narrower than right) or main content
        # Combine in natural reading order: Header -> Left Column -> Right Column -> Footer
        ordered_blocks = header_blocks + left_col + right_col + footer_blocks
        return "\n\n".join(b[4].strip() for b in ordered_blocks)

    @staticmethod
    def _clean_text(text: str) -> str:
        """Sanitizes control characters and standardizes whitespace."""
        if not text:
            return ""
        # Remove null bytes and non-printable control characters (except newline, tab, return)
        cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
        # Normalize carriage returns
        cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")
        # Collapse 3+ consecutive newlines to 2
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        # Clean trailing whitespaces per line
        lines = [line.strip() for line in cleaned.split("\n")]
        return "\n".join(lines).strip()
