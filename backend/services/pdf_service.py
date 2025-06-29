from fpdf import FPDF
from io import BytesIO
import logging
import os

logger = logging.getLogger(__name__)

class HorrorPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        
        # 日本語フォント設定
        self.font_family = 'Arial'  # デフォルトはArial
        
        # 日本語フォントを試す
        japanese_fonts = [
            ('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 'Noto'),
            ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'DejaVu'),
        ]
        
        for font_path, font_name in japanese_fonts:
            try:
                if os.path.exists(font_path):
                    self.add_font(font_name, '', font_path, uni=True)
                    if font_name == 'Noto':
                        # Notoフォント用の太字
                        bold_path = font_path.replace('Regular', 'Bold')
                        if os.path.exists(bold_path):
                            self.add_font(font_name, 'B', bold_path, uni=True)
                        else:
                            self.add_font(font_name, 'B', font_path, uni=True)
                    else:
                        # DejaVu用の太字
                        bold_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
                        if os.path.exists(bold_path):
                            self.add_font(font_name, 'B', bold_path, uni=True)
                        else:
                            self.add_font(font_name, 'B', font_path, uni=True)
                    
                    self.font_family = font_name
                    logger.info(f"{font_name} font loaded successfully")
                    break
            except Exception as e:
                logger.warning(f"Failed to load {font_name} font: {str(e)}")
                continue
        
        if self.font_family == 'Arial':
            logger.warning("Using Arial font - Japanese characters may not display correctly")
        
    def header(self):
        # Add horror-themed header
        self.set_font(self.font_family, 'B', 12)
        self.set_text_color(139, 0, 0)  # Dark red color
        self.cell(0, 10, 'Your Horror Nobel', 0, 1, 'C')
        self.set_text_color(0, 0, 0)  # Reset to black
        self.ln(5)
        
    def footer(self):
        # Add footer with page number
        self.set_y(-15)
        self.set_font(self.font_family, '', 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        self.set_text_color(0, 0, 0)  # Reset to black

class PDFService:
    def __init__(self):
        pass
    
    def generate_pdf(self, story_content: str) -> bytes:
        """Generate PDF from story content"""
        try:
            pdf = HorrorPDF()
            pdf.add_page()
            
            # Add title page styling
            pdf.set_font(pdf.font_family, 'B', 16)
            pdf.set_text_color(139, 0, 0)  # Dark red
            
            # Extract title if present (first line if it's a title)
            lines = story_content.split('\n')
            title = None
            content_start = 0
            
            # Check if first line looks like a title
            if lines and (lines[0].startswith('【') or len(lines[0]) < 50 and not lines[0].endswith('。')):
                title = lines[0].strip('【】')
                content_start = 1
            
            if title:
                try:
                    pdf.cell(0, 15, title, 0, 1, 'C')
                except:
                    pdf.cell(0, 15, 'Your Horror Story', 0, 1, 'C')
                pdf.ln(10)
            else:
                try:
                    pdf.cell(0, 15, 'あなたの恐怖小説', 0, 1, 'C')
                except:
                    pdf.cell(0, 15, 'Your Horror Story', 0, 1, 'C')
                pdf.ln(10)
            
            # Reset text color for content
            pdf.set_text_color(0, 0, 0)
            pdf.set_font(pdf.font_family, '', 11)
            
            # Process content
            content = '\n'.join(lines[content_start:]) if title else story_content
            
            # Split content into paragraphs and format
            paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
            
            for paragraph in paragraphs:
                # Handle chapter/section headers
                if paragraph.startswith('【') or paragraph.startswith('■'):
                    pdf.ln(5)
                    pdf.set_font(pdf.font_family, 'B', 12)
                    pdf.set_text_color(139, 0, 0)  # Dark red for headers
                    header_text = paragraph.strip('【】■')
                    try:
                        pdf.cell(0, 8, header_text, 0, 1, 'L')
                    except:
                        pdf.cell(0, 8, f"Chapter: {header_text.encode('ascii', 'ignore').decode('ascii')}", 0, 1, 'L')
                    pdf.set_text_color(0, 0, 0)
                    pdf.set_font(pdf.font_family, '', 11)
                    pdf.ln(3)
                    continue
                
                # Regular paragraph
                try:
                    # Try to add the paragraph directly
                    pdf.multi_cell(0, 6, paragraph, 0, 'L')
                except Exception as e:
                    logger.warning(f"Failed to add paragraph to PDF: {str(e)}")
                    # Try with ASCII-only alternative
                    try:
                        safe_text = paragraph.encode('ascii', 'ignore').decode('ascii')
                        if safe_text.strip():
                            pdf.multi_cell(0, 6, safe_text, 0, 'L')
                        else:
                            pdf.multi_cell(0, 6, "[Japanese text - unable to display]", 0, 'L')
                    except:
                        pdf.multi_cell(0, 6, "[Text content - encoding issue]", 0, 'L')
                
                pdf.ln(4)  # Add space between paragraphs
            
            # Add footer information
            pdf.ln(10)
            pdf.set_font(pdf.font_family, '', 9)
            pdf.set_text_color(100, 100, 100)
            try:
                pdf.multi_cell(0, 5, 'この物語は「Your Horror Nobel」であなたとAIが共同創作した、世界に一つだけのオリジナル作品です。', 0, 'C')
            except:
                pdf.multi_cell(0, 5, 'This story was co-created with AI via "Your Horror Nobel" - a unique original work.', 0, 'C')
            
            # Get PDF content as bytes
            try:
                pdf_content = pdf.output(dest='S')
                if isinstance(pdf_content, str):
                    return pdf_content.encode('latin1')
                else:
                    return pdf_content
            except Exception as e:
                logger.error(f"Error outputting PDF: {str(e)}")
                raise
            
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            # Create a simple fallback PDF
            return self._create_simple_english_pdf(story_content)
    
    def _create_fallback_pdf(self, story_content: str) -> bytes:
        """Create a simple fallback PDF if main generation fails"""
        try:
            pdf = HorrorPDF()
            pdf.add_page()
            pdf.set_font(pdf.font_family, 'B', 16)
            pdf.cell(0, 10, 'Your Horror Nobel', 0, 1, 'C')
            pdf.ln(10)
            
            pdf.set_font(pdf.font_family, '', 12)
            # Simple text output without advanced formatting
            try:
                # Try to add the content with Unicode support
                pdf.multi_cell(0, 6, story_content[:2000] + "..." if len(story_content) > 2000 else story_content)
            except:
                # If Unicode fails, create a minimal PDF
                pdf.multi_cell(0, 6, "Your Horror Novel - PDF generation encountered an encoding issue.")
                pdf.ln(5)
                pdf.multi_cell(0, 6, "Please check your email for the story content.")
            
            pdf_content = pdf.output(dest='S')
            if isinstance(pdf_content, str):
                return pdf_content.encode('latin1')
            else:
                return pdf_content
            
        except Exception as e:
            logger.error(f"Error creating fallback PDF: {str(e)}")
            # Create absolute minimal PDF
            simple_pdf = FPDF()
            simple_pdf.add_page()
            simple_pdf.set_font('Arial', 'B', 16)
            simple_pdf.cell(0, 10, 'Your Horror Nobel', 0, 1, 'C')
            simple_pdf.ln(10)
            simple_pdf.set_font('Arial', '', 12)
            simple_pdf.multi_cell(0, 6, "Your horror story is ready! Unfortunately, there was an issue generating the PDF with Japanese text.")
            pdf_content = simple_pdf.output(dest='S')
            if isinstance(pdf_content, str):
                return pdf_content.encode('latin1')
            else:
                return pdf_content
    
    def _create_simple_english_pdf(self, story_content: str) -> bytes:
        """Create a simple English-only PDF for maximum compatibility"""
        try:
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font('Arial', 'B', 16)
            pdf.cell(0, 10, 'Your Horror Nobel', 0, 1, 'C')
            pdf.ln(10)
            
            pdf.set_font('Arial', '', 12)
            pdf.multi_cell(0, 6, "Your personalized horror story has been generated!")
            pdf.ln(5)
            pdf.multi_cell(0, 6, "Unfortunately, there was an issue displaying Japanese characters in the PDF.")
            pdf.ln(5)
            pdf.multi_cell(0, 6, "The story content has been sent to your email and is available in your browser.")
            pdf.ln(10)
            
            # Try to add at least some ASCII content
            try:
                ascii_content = story_content.encode('ascii', 'ignore').decode('ascii')
                if ascii_content.strip():
                    pdf.multi_cell(0, 6, f"Story preview (ASCII only): {ascii_content[:500]}...")
            except:
                pass
            
            pdf_content = pdf.output(dest='S')
            if isinstance(pdf_content, str):
                return pdf_content.encode('latin1')
            else:
                return pdf_content
                
        except Exception as e:
            logger.error(f"Error creating simple English PDF: {str(e)}")
            # Absolute last resort
            return b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Your Horror Nobel PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF'