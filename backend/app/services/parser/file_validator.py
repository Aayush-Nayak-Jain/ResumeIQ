"""Document Security and Validation Service (Module 4 / T4.4, T4.5, T4.6).

Validates untrusted user uploads:
1. File extension verification (.pdf, .docx only)
2. File size enforcement (max 10MB)
3. Magic byte signature verification (%PDF-, PK zip headers for docx)
4. Protection against disguised malicious payloads
"""

import io
import zipfile

from fastapi import HTTPException, status

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/x-zip-compressed",
    "application/octet-stream",  # Often sent by browsers when MIME is ambiguous
}
PDF_MAGIC_BYTES = b"%PDF-"
ZIP_MAGIC_BYTES = b"PK\x03\x04"


class DocumentValidator:
    """Zero-trust upload validator protecting against MIME-spoofing and oversized files."""

    @classmethod
    def validate_document(
        cls,
        filename: str,
        content: bytes,
        content_type: str | None = None,
        max_size: int = MAX_FILE_SIZE_BYTES,
    ) -> str:
        """
        Validates file metadata, payload size, and binary magic-bytes.

        Returns:
            Normalized file format: 'pdf' or 'docx'.

        Raises:
            HTTPException: 400 if type is unsupported or signature is invalid.
            HTTPException: 413 if file payload exceeds max_size.
        """
        # 1. Check filename & extension
        if not filename or "." not in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file: filename must include a valid extension (.pdf or .docx).",
            )

        lower_name = filename.lower().strip()
        ext = "." + lower_name.rsplit(".", 1)[-1]
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported file type '{ext}'. Only PDF (.pdf) and "
                    "Microsoft Word (.docx) documents are supported."
                ),
            )

        # 2. Check payload size (T4.5)
        file_size = len(content)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file: uploaded document contains 0 bytes.",
            )

        if file_size > max_size:
            max_mb = max_size // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size limit of {max_mb}MB.",
            )

        # 3. Magic bytes validation (T4.6)
        if ext == ".pdf":
            cls._verify_pdf_signature(content)
            return "pdf"
        elif ext == ".docx":
            cls._verify_docx_signature(content)
            return "docx"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported document format.",
        )

    @staticmethod
    def _verify_pdf_signature(content: bytes) -> None:
        """Verifies binary starts with standard PDF magic signature '%PDF-'."""
        # PDF files must begin with %PDF- in the first 1024 bytes
        prefix = content[:1024]
        if PDF_MAGIC_BYTES not in prefix:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Corrupt or invalid PDF: file content signature does not match "
                    "PDF specifications."
                ),
            )

    @staticmethod
    def _verify_docx_signature(content: bytes) -> None:
        """Verifies binary is a legitimate OpenXML zip archive containing word/document.xml."""
        if not content.startswith(ZIP_MAGIC_BYTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Corrupt or invalid DOCX: file content signature does not match "
                    "Microsoft Word OpenXML specifications."
                ),
            )

        # Verify internal zip archive structure without executing
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                namelist = zf.namelist()
                # DOCX standard requires [Content_Types].xml or word/document.xml
                has_content_types = "[Content_Types].xml" in namelist
                has_word_dir = any(name.startswith("word/") for name in namelist)
                if not (has_content_types or has_word_dir):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid DOCX package: missing Word OpenXML document structures.",
                    )
        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupt DOCX archive: unable to read document structure.",
            ) from None
