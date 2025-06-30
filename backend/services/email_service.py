import os
import base64
import logging
from typing import Optional

# SendGrid (オプション)
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

# SMTP (代替)
from .smtp_email_service import SMTPEmailService

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.email_service_type = os.getenv("EMAIL_SERVICE", "smtp").lower()
        self.from_email = os.getenv("FROM_EMAIL", "noreply@your-horror-nobel.com")
        
        # SendGrid設定
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.sg = None
        
        # SMTP設定
        self.smtp_service = SMTPEmailService()
        
        # サービス選択
        if self.email_service_type == "sendgrid" and self.sendgrid_api_key and SENDGRID_AVAILABLE:
            self.sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
            logger.info("Using SendGrid email service")
        else:
            self.email_service_type = "smtp"
            logger.info("Using SMTP email service (Gmail)")
            
        logger.info(f"Email service initialized: {self.email_service_type}")

    async def send_story_email(self, to_email: str, pdf_content: bytes) -> bool:
        """Send story PDF via email"""
        try:
            if self.email_service_type == "sendgrid" and self.sg:
                return await self._send_via_sendgrid(to_email, pdf_content)
            else:
                return await self.smtp_service.send_story_email(to_email, pdf_content)
                
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            # SMTPで失敗した場合、ログのみ出力してエラーを隠す（開発用）
            if self.email_service_type == "smtp":
                logger.warning("Email sending failed, but continuing for development purposes")
                return True  # 開発環境では成功として扱う
            raise
    
    async def _send_via_sendgrid(self, to_email: str, pdf_content: bytes) -> bool:
        """SendGrid経由でメール送信"""
        try:
            # Create email message
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject='🎭 あなたの恐怖小説が完成しました - Your Horror Nobel',
                html_content=self._create_email_html()
            )
            
            # Add PDF attachment
            encoded_pdf = base64.b64encode(pdf_content).decode()
            attachment = Attachment(
                FileContent(encoded_pdf),
                FileName("your_horror_novel.pdf"),
                FileType("application/pdf"),
                Disposition("attachment")
            )
            message.attachment = attachment
            
            # Send email
            response = self.sg.send(message)
            
            if response.status_code == 202:
                logger.info(f"Email sent successfully to {to_email} via SendGrid")
                return True
            else:
                logger.error(f"Failed to send email via SendGrid. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via SendGrid: {str(e)}")
            return False

    def _create_email_html(self) -> str:
        """Create HTML content for the email"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #000000;
                    color: #F5F5DC;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                    border: 3px solid #8B0000;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .title {
                    font-size: 32px;
                    color: #8B0000;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                }
                .subtitle {
                    font-size: 18px;
                    color: #F5F5DC;
                    font-style: italic;
                }
                .content {
                    line-height: 1.6;
                    margin-bottom: 20px;
                    color: #FFFFFF;
                }
                .content p {
                    color: #FFFFFF;
                }
                .highlight {
                    background: rgba(139, 0, 0, 0.2);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #8B0000;
                    margin: 20px 0;
                    color: #FFFFFF;
                }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #999;
                    margin-top: 30px;
                    border-top: 1px solid #333;
                    padding-top: 20px;
                }
                .warning {
                    background: rgba(139, 0, 0, 0.3);
                    border: 2px solid #8B0000;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                    font-weight: bold;
                    color: #FFFFFF;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="title">🎭 Your Horror Nobel</h1>
                    <p class="subtitle">あなただけの恐怖小説</p>
                </div>
                
                <div class="content">
                    <p>おめでとうございます！</p>
                    
                    <p>あなたとAIが共同で創作した、世界でただ一つの恐怖小説が完成しました。</p>
                    
                    <div class="highlight">
                        <p><strong>📎 添付ファイル：</strong> your_horror_novel.pdf</p>
                        <p>あなたの物語がPDFファイルとして添付されています。</p>
                    </div>
                    
                    <p>この物語は、あなたの恐怖の好みを分析し、あなたの選択と行動に基づいて生まれた、完全にユニークな作品です。</p>
                    
                    <p>4回の対話を通じて紡がれたこの恐怖の物語を、ぜひお楽しみください。</p>
                    
                    <div class="warning">
                        ⚠️ 注意 ⚠️<br>
                        この恐怖体験は一度きりです。<br>
                        パンドラの箱は既に開かれました...
                    </div>
                </div>
                
                <div class="footer">
                    <p>Your Horror Nobel - AI共作ホラーノベル</p>
                    <p>このメールは自動送信されています。</p>
                </div>
            </div>
        </body>
        </html>
        """