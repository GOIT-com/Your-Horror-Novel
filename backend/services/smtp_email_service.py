import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional

logger = logging.getLogger(__name__)

class SMTPEmailService:
    """Gmail SMTP を使った代替メールサービス"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")  # Gmailアプリパスワード
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured. Email sending will be disabled.")
            logger.info("Gmail setup instructions:")
            logger.info("1. Enable 2-factor authentication on your Gmail account")
            logger.info("2. Generate an App Password: https://myaccount.google.com/apppasswords")
            logger.info("3. Use the App Password (not your regular password) in SMTP_PASSWORD")
    
    async def send_story_email(self, to_email: str, pdf_content: bytes) -> bool:
        """ストーリーPDFをメールで送信"""
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.error("SMTP credentials not configured")
                return False
            
            # メッセージ作成
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = '🎭 あなたの恐怖小説が完成しました - Your Horror Nobel'
            
            # HTMLメール本文
            html_body = self._create_email_html()
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))
            
            # PDF添付
            pdf_attachment = MIMEApplication(pdf_content, _subtype='pdf')
            pdf_attachment.add_header('Content-Disposition', 'attachment', filename='your_horror_novel.pdf')
            msg.attach(pdf_attachment)
            
            # SMTP送信
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email} via SMTP")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed: {str(e)}")
            logger.error("This usually means:")
            logger.error("1. 2-factor authentication is not enabled on the Gmail account")
            logger.error("2. Using regular password instead of App Password")
            logger.error("3. App Password is incorrect or expired")
            logger.error("Please generate a new App Password at: https://myaccount.google.com/apppasswords")
            return False
        except Exception as e:
            logger.error(f"Error sending email via SMTP: {str(e)}")
            return False
    
    def _create_email_html(self) -> str:
        """メール用HTML作成"""
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
                }
                .highlight {
                    background: rgba(139, 0, 0, 0.2);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #8B0000;
                    margin: 20px 0;
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
                    
                    <p>10回の対話を通じて紡がれたこの恐怖の物語を、ぜひお楽しみください。</p>
                    
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