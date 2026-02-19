"""Stub module for PDF generation and email delivery."""


def generate_report_pdf(_: dict) -> bytes:
    """Return empty bytes until real PDF logic is implemented."""
    return b""


def send_report_email(_: str, __: bytes) -> None:
    """No-op email sender stub."""
    return None
