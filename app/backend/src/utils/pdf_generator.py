from fpdf import FPDF
from io import BytesIO

def generate_transcription_pdf(title, transcription_text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.multi_cell(0, 10, title, align="C")
    pdf.ln(10)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, transcription_text)

    buffer = BytesIO()
    pdf.output(buffer, "S")
    buffer.seek(0)
    return buffer

