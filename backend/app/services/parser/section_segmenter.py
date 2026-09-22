"""Section Segmentation Engine for Resume Parser (Module 4).

Identifies visual and semantic section headers in unstructured text
and partitions the resume into modular section blocks.
"""

import re

# Canonical section categories and matching regex patterns
SECTION_PATTERNS: dict[str, list[str]] = {
    "summary": [
        r"^(?:professional\s+)?summary(?:\s+statement)?$",
        r"^executive\s+summary$",
        r"^(?:career\s+)?objective$",
        r"^about\s+me$",
        r"^profile(?:\s+overview)?$",
        r"^personal\s+statement$",
    ],
    "experience": [
        r"^(?:work|professional|relevant|employment|career)\s+(?:experience|history)$",
        r"^experience$",
        r"^employment$",
        r"^work\s+history$",
        r"^internships?(?:\s+&\s+experience)?$",
    ],
    "education": [
        r"^education(?:al\s+background|\s+&\s+qualifications|\s+history)?$",
        r"^academic\s+(?:background|history|qualifications)$",
        r"^degrees?(?:\s+&\s+certifications)?$",
    ],
    "skills": [
        r"^(?:technical\s+|core\s+|key\s+)?skills(?:\s+&\s+(?:technologies|tools|competencies))?$",
        r"^core\s+competencies$",
        r"^technologies(?:\s+&\s+tools)?$",
        r"^areas\s+of\s+expertise$",
        r"^technical\s+proficiencies$",
        r"^programming\s+languages$",
    ],
    "projects": [
        r"^(?:key\s+|featured\s+|academic\s+|personal\s+|technical\s+)?projects$",
        r"^portfolio(?:\s+projects)?$",
        r"^selected\s+work$",
    ],
    "certifications": [
        r"^(?:licenses\s+&\s+)?certifications?$",
        r"^professional\s+credentials?$",
        r"^courses?\s+&\s+certifications?$",
    ],
    "achievements": [
        r"^(?:key\s+|notable\s+)?achievements?$",
        r"^honors?\s+(?:&|and)\s+awards?$",
        r"^accomplishments?$",
    ],
}


class SectionSegmenter:
    """Segments unstructured resume text into standardized section blocks."""

    @classmethod
    def segment_document(cls, text: str) -> tuple[dict[str, str], list[str]]:
        """
        Segments text into mapped section dictionaries.

        Returns:
            Tuple of:
            - Dict mapping section name -> section text
            - List of detected section header names in order
        """
        lines = [line.strip() for line in text.split("\n")]
        header_indices: list[tuple[int, str, str]] = []  # (line_index, canonical_name, raw_heading)

        for i, line in enumerate(lines):
            # Header heuristic: short line (< 50 chars), not empty, not a bullet or url
            if not line or len(line) > 50:
                continue
            if line.startswith(("-", "*", "•", "http://", "https://", "www.")):
                continue
            if "@" in line:  # Avoid matching email lines
                continue

            cleaned_heading = cls._normalize_heading_candidate(line)
            canonical = cls._match_section(cleaned_heading)
            if canonical:
                header_indices.append((i, canonical, line))

        sections: dict[str, str] = {}
        detected_names: list[str] = []

        if not header_indices:
            # Fallback: couldn't detect explicit section headers, store as full text
            sections["header"] = text[:300]
            sections["body"] = text
            return sections, ["body"]

        # 1. Header / contact section (everything before the first detected heading)
        first_heading_idx = header_indices[0][0]
        if first_heading_idx > 0:
            header_text = "\n".join(lines[:first_heading_idx]).strip()
            if header_text:
                sections["header"] = header_text

        # 2. Extract content for each detected section
        for j, (line_idx, canonical, _raw_heading) in enumerate(header_indices):
            detected_names.append(canonical)
            start_line = line_idx + 1
            end_line = header_indices[j + 1][0] if j + 1 < len(header_indices) else len(lines)

            section_content = "\n".join(lines[start_line:end_line]).strip()
            # If section already exists (e.g. repeated skills), append
            if canonical in sections:
                sections[canonical] = f"{sections[canonical]}\n\n{section_content}".strip()
            else:
                sections[canonical] = section_content

        return sections, detected_names

    @classmethod
    def _match_section(cls, text: str) -> str | None:
        """Matches a candidate line against section patterns."""
        for canonical, patterns in SECTION_PATTERNS.items():
            for pat in patterns:
                if re.match(pat, text, re.IGNORECASE):
                    return canonical
        return None

    @staticmethod
    def _normalize_heading_candidate(line: str) -> str:
        """Removes trailing colons, markdown symbols, or underline dashes."""
        cleaned = re.sub(r"^[#\-_*>\s]+", "", line)
        cleaned = re.sub(r"[:\-_*>\s]+$", "", cleaned)
        return cleaned.strip()
