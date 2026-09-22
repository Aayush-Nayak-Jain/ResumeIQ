"""DOCX Document Text and Structure Extractor (Module 4 / T4.3).

Extracts text from Microsoft Word (.docx) files preserving paragraph order,
bullet points, and table structures in reading sequence.
"""

import io
import re

import docx
from docx.table import Table
from docx.text.paragraph import Paragraph


class DOCXExtractor:
    """Extracts text from DOCX binaries traversing paragraphs and tables."""

    @classmethod
    def extract_text(cls, docx_bytes: bytes) -> str:
        """
        Reads all paragraphs, list items, and table elements from a DOCX stream.
        """
        doc = docx.Document(io.BytesIO(docx_bytes))
        extracted_elements: list[str] = []

        # Iterate over child elements of the document body in true document order
        for child in doc.element.body:
            tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
            if tag == "p":
                p = Paragraph(child, doc)
                text = p.text.strip()
                if text:
                    # Check if paragraph has bullet formatting
                    p_style = getattr(p.style, "name", "").lower()
                    if "list" in p_style or "bullet" in p_style:
                        if not text.startswith(("-", "•", "*")):
                            text = f"• {text}"
                    extracted_elements.append(text)
            elif tag == "tbl":
                t = Table(child, doc)
                table_text = cls._extract_table_text(t)
                if table_text:
                    extracted_elements.append(table_text)

        full_text = "\n\n".join(extracted_elements)
        return cls._clean_text(full_text)

    @classmethod
    def _extract_table_text(cls, table: Table) -> str:
        """
        Extracts structured text from Word tables.
        Handles both data tables and multi-column layout tables.
        """
        rows_text: list[str] = []
        for row in table.rows:
            # Collect unique cell text across cells in row (avoid merged cell duplicates)
            cell_texts = []
            seen_cells = set()
            for cell in row.cells:
                cell_id = id(cell._tc)
                if cell_id in seen_cells:
                    continue
                seen_cells.add(cell_id)
                txt = cell.text.strip()
                if txt:
                    cell_texts.append(txt)
            if cell_texts:
                rows_text.append(" | ".join(cell_texts))
        return "\n".join(rows_text)

    @staticmethod
    def _clean_text(text: str) -> str:
        """Sanitizes control characters and standardizes whitespace."""
        if not text:
            return ""
        cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
        cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        lines = [line.strip() for line in cleaned.split("\n")]
        return "\n".join(lines).strip()
