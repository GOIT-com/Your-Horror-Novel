from fpdf import FPDF
from io import BytesIO
import logging
import os
from PyPDF2 import PdfReader, PdfWriter
import tempfile
import re
from PIL import Image, ImageDraw, ImageFont
import textwrap

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        # 背景PNG画像ファイルの候補パス
        possible_png_paths = [
            "pdf用紙.png",  # 現在のディレクトリ
            os.path.join("..", "pdf用紙.png"),  # 一つ上のディレクトリ
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "pdf用紙.png"),  # プロジェクトルート
            os.path.join("/app", "pdf用紙.png"),  # Docker内のルート
        ]
        
        self.background_png_path = None
        for path in possible_png_paths:
            if os.path.exists(path):
                self.background_png_path = path
                logger.info(f"Found background PNG at: {path}")
                break
        
        if not self.background_png_path:
            logger.warning("Background PNG not found, will generate PDF without background")
        
        # フォントファイルの候補パス
        self.font_paths = self._get_font_paths()
        
    def _get_font_paths(self):
        """利用可能なフォントパスを取得"""
        font_candidates = []
        
        # minamoji_1_4フォント
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        minamoji_font_dir = os.path.join(project_root, "frontend", "fonts", "minamoji_1_4")
        
        minamoji_fonts = [
            ("minamoji04.ttf", "regular"),
            ("minamoji04.ttf", "bold"),    # 同じファイルを太字としても使用
            ("minamoji04.ttf", "light"),   # 同じファイルを細字としても使用
            ("minamoji04.ttf", "medium"),  # 同じファイルを中字としても使用
        ]
        
        for font_file, weight in minamoji_fonts:
            # フロントエンドフォントディレクトリから
            frontend_path = os.path.join(minamoji_font_dir, font_file)
            # Docker環境のフォントディレクトリから
            docker_path = f"/usr/share/fonts/truetype/minamoji_1_4/{font_file}"
            
            # logger.info(f"Checking font paths for {font_file} ({weight}):")
            # logger.info(f"  Frontend path: {frontend_path} (exists: {os.path.exists(frontend_path)})")
            # logger.info(f"  Docker path: {docker_path} (exists: {os.path.exists(docker_path)})")
            
            if os.path.exists(frontend_path):
                font_candidates.append((frontend_path, weight, "minamoji_1_4"))
                # logger.info(f"  ✅ Added frontend font: {frontend_path}")
            elif os.path.exists(docker_path):
                font_candidates.append((docker_path, weight, "minamoji_1_4"))
                # logger.info(f"  ✅ Added docker font: {docker_path}")
            # else:
            #     logger.warning(f"  ❌ Font not found: {font_file}")
        
        # システムフォント
        system_fonts = [
            ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "regular", "dejavu"),
            ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "bold", "dejavu"),
            ("/System/Library/Fonts/Hiragino Sans GB.ttc", "regular", "hiragino"),
            ("/System/Library/Fonts/Arial.ttf", "regular", "arial"),
        ]
        
        for font_path, weight, family in system_fonts:
            if os.path.exists(font_path):
                font_candidates.append((font_path, weight, family))
        
        return font_candidates
    
    def _get_font(self, size, weight="regular"):
        """指定されたサイズとウェイトのフォントを取得"""
        # logger.info(f"Trying to get font: size={size}, weight={weight}")
        # logger.info(f"Available font paths: {len(self.font_paths)}")
        
        # 優先順: minamoji_1_4 > システムフォント
        for font_path, font_weight, family in self.font_paths:
            # logger.info(f"  Checking: {family} ({font_weight}) at {font_path}")
            if weight == font_weight or (weight == "regular" and font_weight in ["medium", "regular"]):
                try:
                    font = ImageFont.truetype(font_path, size)
                    # logger.info(f"  ✅ Successfully loaded: {font_path}")
                    return font
                except Exception as e:
                    logger.warning(f"Failed to load font {font_path}: {str(e)}")
                    continue
        
        # フォールバック: デフォルトフォント
        logger.warning("All fonts failed, using default font")
        try:
            return ImageFont.load_default()
        except:
            return None
    
    def generate_pdf(self, story_content: str) -> bytes:
        """Generate PDF from story content using image-based approach"""
        try:
            logger.info("Starting image-based PDF generation")
            logger.info(f"Story content length: {len(story_content)} characters")
            
            # 入力検証
            if not story_content or not story_content.strip():
                logger.warning("Empty story content provided")
                story_content = "【テストストーリー】\n\nコンテンツが提供されませんでした。"
            
            # UTF-8エンコーディングを確認
            try:
                story_content = str(story_content).encode('utf-8').decode('utf-8')
            except Exception as encoding_error:
                logger.error(f"Encoding error: {encoding_error}")
                story_content = "【エンコーディングエラー】\n\nテキストのエンコーディングに問題があります。"
            
            if self.background_png_path and os.path.exists(self.background_png_path):
                return self._generate_pdf_with_image(story_content)
            else:
                logger.warning("Background PNG not found, using fallback method")
                return self._generate_fallback_pdf(story_content)
                
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return self._create_minimal_pdf(story_content)
    
    def _generate_pdf_with_image(self, story_content: str) -> bytes:
        """画像ベースでPDFを生成"""
        try:
            # 背景画像を読み込み
            background = Image.open(self.background_png_path)
            logger.info(f"Background image size: {background.size}")
            
            # 画像サイズ（幅1024px、高さ1536px）
            img_width, img_height = background.size
            
            # コンテンツをクリーンアップ
            clean_content = self._clean_content(story_content)
            title, sections = self._extract_title_and_sections(clean_content)
            
            # 描画可能領域を設定（マージンを考慮）
            margin_x = int(img_width * 0.20)  # 左右15%のマージン
            margin_top = int(img_height * 0.15)  # 上部15%のマージン
            margin_bottom = int(img_height * 0.14)  # 下部10%のマージン
            
            text_width = img_width - (margin_x * 2)
            text_height = img_height - margin_top - margin_bottom
            
            # 安全マージンを追加（フォントサイズを考慮して少し余裕を持たせる）
            safe_text_width = int(text_width * 0.95)  # テキスト幅の95%を使用して安全マージンを確保
            
            # フォントサイズを設定
            title_font = self._get_font(36, "bold")  # タイトル用
            header_font = self._get_font(24, "bold")  # 見出し用
            text_font = self._get_font(18, "regular")  # 本文用
            
            if not title_font:
                title_font = self._get_font(36)
            if not header_font:
                header_font = self._get_font(24)
            if not text_font:
                text_font = self._get_font(18)
            
            # 複数ページに対応
            pages = []
            current_page = background.copy()
            draw = ImageDraw.Draw(current_page)
            
            current_y = margin_top
            
            # タイトルを描画
            if title:
                title_lines = self._wrap_text(title, title_font, safe_text_width)
                for line in title_lines:
                    if current_y + 50 > img_height - margin_bottom:
                        # 新しいページを作成
                        pages.append(current_page)
                        current_page = background.copy()
                        draw = ImageDraw.Draw(current_page)
                        current_y = margin_top
                    
                    # タイトルを中央に配置
                    text_bbox = draw.textbbox((0, 0), line, font=title_font)
                    text_width_actual = text_bbox[2] - text_bbox[0]
                    x_centered = (img_width - text_width_actual) // 2
                    
                    draw.text((x_centered, current_y), line, font=title_font, fill=(139, 0, 0))  # ダークレッド
                    current_y += 50
                
                current_y += 30  # タイトル後の余白
            
            # セクションを描画
            for section_type, section_content in sections:
                if section_type == 'header':
                    # 見出しを描画
                    current_y += 20  # 見出し前の余白
                    
                    header_lines = self._wrap_text(section_content, header_font, safe_text_width)
                    for line in header_lines:
                        if current_y + 35 > img_height - margin_bottom:
                            pages.append(current_page)
                            current_page = background.copy()
                            draw = ImageDraw.Draw(current_page)
                            current_y = margin_top
                        
                        draw.text((margin_x, current_y), line, font=header_font, fill=(139, 0, 0))
                        current_y += 35
                    
                    current_y += 15  # 見出し後の余白
                    
                else:
                    # 本文を描画
                    paragraphs = [p.strip() for p in section_content.split('\n') if p.strip()]
                    
                    for paragraph in paragraphs:
                        if len(paragraph) > 10:  # 短すぎる行は除外
                            text_lines = self._wrap_text(paragraph, text_font, safe_text_width)
                            
                            for line in text_lines:
                                if current_y + 25 > img_height - margin_bottom:
                                    pages.append(current_page)
                                    current_page = background.copy()
                                    draw = ImageDraw.Draw(current_page)
                                    current_y = margin_top
                                
                                draw.text((margin_x, current_y), line, font=text_font, fill=(0, 0, 0))
                                current_y += 25
                            
                            current_y += 15  # 段落後の余白
            
            # 最後のページを追加
            if current_page:
                pages.append(current_page)
            
            # フッターを最後のページに追加
            if pages:
                last_page = pages[-1]
                draw = ImageDraw.Draw(last_page)
                footer_font = self._get_font(12)
                if footer_font:
                    footer_text = 'この物語は「Your Horror Nobel」で生成されました'
                    footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
                    footer_width = footer_bbox[2] - footer_bbox[0]
                    footer_x = (img_width - footer_width) // 2
                    footer_y = img_height - 40
                    
                    draw.text((footer_x, footer_y), footer_text, font=footer_font, fill=(100, 100, 100))
            
            # 画像をPDFに変換
            return self._images_to_pdf(pages)
            
        except Exception as e:
            logger.error(f"Error in _generate_pdf_with_image: {str(e)}")
            raise
    
    def _wrap_text(self, text, font, max_width):
        """テキストを指定幅で折り返し（日本語対応）"""
        if not font:
            # フォントが利用できない場合は文字数で分割
            return textwrap.wrap(text, width=25)  # さらに安全な文字数に調整
        
        lines = []
        current_line = ""
        
        # 日本語と英語の混在テキストに対応
        # 句読点や区切り文字で分割可能な位置を特定
        break_chars = ['。', '、', '！', '？', '.', ',', '!', '?', ' ', '　']
        
        i = 0
        while i < len(text):
            char = text[i]
            test_line = current_line + char
            
            try:
                # 実際の幅を測定
                bbox = font.getbbox(test_line)
                line_width = bbox[2] - bbox[0]
                
                if line_width <= max_width:
                    current_line = test_line
                    i += 1
                else:
                    # 幅を超えた場合の処理
                    if current_line:
                        # 可能であれば適切な位置で改行
                        break_pos = -1
                        for j in range(len(current_line) - 1, -1, -1):
                            if current_line[j] in break_chars:
                                break_pos = j + 1
                                break
                        
                        if break_pos > 0 and break_pos < len(current_line):
                            # 適切な位置で分割
                            lines.append(current_line[:break_pos].strip())
                            current_line = current_line[break_pos:].strip() + char
                        else:
                            # 分割位置が見つからない場合は現在の行で分割
                            lines.append(current_line.strip())
                            current_line = char
                        i += 1
                    else:
                        # 単一文字でも幅を超える場合（通常は発生しない）
                        current_line = char
                        i += 1
            except:
                # フォント測定に失敗した場合は文字数で判定
                if len(test_line) <= 25:  # 安全な文字数制限
                    current_line = test_line
                    i += 1
                else:
                    if current_line:
                        lines.append(current_line.strip())
                        current_line = char
                    else:
                        current_line = char
                    i += 1
        
        # 最後の行を追加
        if current_line.strip():
            lines.append(current_line.strip())
        
        # 空行を除去
        lines = [line for line in lines if line]
        
        return lines
    
    def _images_to_pdf(self, images):
        """画像リストをPDFに変換"""
        try:
            # 最初の画像をPDFとして保存
            if not images:
                raise Exception("No images to convert")
            
            # RGBモードに変換（PDFに保存するため）
            rgb_images = []
            for img in images:
                if img.mode != 'RGB':
                    rgb_images.append(img.convert('RGB'))
                else:
                    rgb_images.append(img)
            
            # PDFとして保存
            output_buffer = BytesIO()
            if len(rgb_images) == 1:
                rgb_images[0].save(output_buffer, format='PDF', quality=95)
            else:
                rgb_images[0].save(
                    output_buffer, 
                    format='PDF', 
                    save_all=True, 
                    append_images=rgb_images[1:],
                    quality=95
                )
            
            output_buffer.seek(0)
            result = output_buffer.getvalue()
            output_buffer.close()
            
            logger.info(f"Successfully converted {len(images)} images to PDF")
            return result
            
        except Exception as e:
            logger.error(f"Error converting images to PDF: {str(e)}")
            raise
    
    def _clean_content(self, content: str) -> str:
        """コンテンツをクリーンアップ"""
        if not content:
            return ""
        
        # マークダウンの見出し記法を除去
        content = re.sub(r'^#{1,6}\s*', '', content, flags=re.MULTILINE)
        
        # 太字記法を除去
        content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
        content = re.sub(r'__(.*?)__', r'\1', content)
        
        # イタリック記法を除去
        content = re.sub(r'\*(.*?)\*', r'\1', content)
        content = re.sub(r'_(.*?)_', r'\1', content)
        
        # その他のマークダウン記法を除去
        content = re.sub(r'`(.*?)`', r'\1', content)  # インラインコード
        content = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', content)  # リンク
        
        return content
    
    def _extract_title_and_sections(self, content: str):
        """タイトルとセクションを抽出"""
        lines = content.split('\n')
        title = None
        sections = []
        current_section = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # タイトルを検出（最初の短い行、または【】で囲まれた行）
            if not title and (line.startswith('【') and line.endswith('】') or 
                             (len(line) < 50 and not line.endswith('。') and not line.endswith('！') and not line.endswith('？'))):
                title = line.strip('【】')
                continue
            
            # セクション区切りを検出
            if (line.startswith('【') or line.startswith('■') or 
                line.startswith('##') or line.startswith('第') and '章' in line):
                # 前のセクションを保存
                if current_section.strip():
                    sections.append(('section', current_section.strip()))
                # 新しいセクション開始
                header_text = line.strip('【】■#')
                sections.append(('header', header_text))
                current_section = ""
            else:
                current_section += line + "\n"
        
        # 最後のセクションを追加
        if current_section.strip():
            sections.append(('section', current_section.strip()))
        
        return title, sections
    
    def _generate_fallback_pdf(self, story_content: str) -> bytes:
        """フォールバック: 背景なしでPDF生成"""
        try:
            # 白い背景で1024x1536の画像を作成
            img = Image.new('RGB', (1024, 1536), color='white')
            
            # 簡単なテキストを配置
            draw = ImageDraw.Draw(img)
            font = self._get_font(24)
            
            if font:
                draw.text((100, 100), "Your Horror Nobel", font=font, fill=(0, 0, 0))
                draw.text((100, 150), "Story generated successfully!", font=font, fill=(0, 0, 0))
            
            return self._images_to_pdf([img])
            
        except Exception as e:
            logger.error(f"Error in fallback PDF generation: {str(e)}")
            return self._create_minimal_pdf(story_content)
    
    def _create_minimal_pdf(self, story_content: str) -> bytes:
        """最小限のPDFを生成（最後の手段）"""
        try:
            logger.warning("Using minimal PDF generation as last resort")
            
            # 簡単なPDFバイナリを直接生成（日本語は含めない）
            minimal_pdf = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 58 >>
stream
BT
/F1 12 Tf
100 700 Td
(Your Horror Nobel - PDF Generation Error) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
338
%%EOF"""
            
            return minimal_pdf
                
        except Exception as e:
            logger.error(f"Error creating minimal PDF: {str(e)}")
            # 絶対的な最後の手段
            return b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Your Horror Nobel PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF'