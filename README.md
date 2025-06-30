# 🎭 Your Horror Nobel

インタラクティブなホラー小説生成アプリケーション

クイズに答えることで、あなた好みの恐怖を分析し、AI（Gemini）が生成するオリジナルホラー小説をチャット形式で体験できます。完成した小説はPDFとして作成され、メールで送信されます。さらに、OpenAI TTSを使用した音声読み上げ機能で、ホラー小説を迫力ある音声で楽しむことができます。

## ✨ 特徴

- **パーソナライズ**: 10問のクイズでユーザーの恐怖の嗜好を分析
- **AI生成**: Google Gemini APIを活用したインタラクティブなストーリー生成
- **チャット体験**: リアルタイムでAIと対話しながら物語が展開
- **音声読み上げ**: OpenAI TTSによる迫力あるホラー音声体験
- **PDF生成**: 完成した小説を美しいPDFとして作成
- **メール配信**: 完成作品をメールで受け取り可能
- **レスポンシブ**: モバイル・タブレット・PC対応

## 🛠 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP クライアント

### バックエンド
- **FastAPI** - Python Web フレームワーク
- **Google Gemini AI** - ストーリー生成
- **OpenAI TTS** - 音声読み上げ
- **Google Cloud Firestore** - NoSQL データベース
- **FPDF2** - PDF生成
- **SMTP/SendGrid** - メール送信

### インフラ・デプロイ
- **Firebase Hosting** - フロントエンドホスティング
- **Google Cloud Run** - バックエンドコンテナ実行
- **Docker** - コンテナ化
- **Google Cloud Build** - CI/CD

## 🚀 クイックスタート

### 前提条件

- Node.js 16+
- Python 3.11+
- Docker
- Google Cloud アカウント
- Firebase プロジェクト

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/Your-Horror-Nobel.git
cd Your-Horror-Nobel
```

### 2. フロントエンド設定

```bash
cd frontend
npm install
npm run dev
```

### 3. バックエンド設定

```bash
cd backend

# 環境変数設定（対話式）
./setup_env.sh

# または手動で設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# サーバー起動
uvicorn main:app --reload --port 8000
```

### 4. 必要なAPIキーの取得

1. **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **OpenAI API**: [OpenAI Platform](https://platform.openai.com/api-keys) ※TTS機能用
3. **Google Cloud**: [Google Cloud Console](https://console.cloud.google.com/)
4. **Gmail App Password**: [Google Account Settings](https://myaccount.google.com/apppasswords)

## 📋 設定方法

### バックエンド環境変数 (.env)

```bash
# 必須
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT=your_project_id

# TTS機能（音声読み上げ）
OPENAI_API_KEY=your_openai_api_key

# メール設定（Gmail SMTPの場合）
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
EMAIL_SERVICE=smtp

# オプション
DEV_MODE=true
```

### フロントエンド環境変数

```bash
# 本番環境のみ
VITE_API_BASE_URL=https://your-backend-url.run.app
```

## 🌐 デプロイ

### フロントエンド（Firebase Hosting）

```bash
# テンプレートからコピー
cp deploy-frontend.sh.example deploy-frontend.sh
chmod +x deploy-frontend.sh

# スクリプト内のプロジェクトIDを編集
# デプロイ実行
./deploy-frontend.sh
```

### バックエンド（Google Cloud Run）

```bash
cd backend

# テンプレートからコピー
cp deploy.sh.example deploy.sh
chmod +x deploy.sh

# deploy.shを編集してプロジェクト情報を設定
# デプロイ実行
./deploy.sh
```

詳細な設定方法は各ディレクトリのREADME.mdを参照してください。

## 📁 プロジェクト構造

```
Your-Horror-Nobel/
├── frontend/                    # フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── components/         # UIコンポーネント
│   │   ├── pages/             # ページコンポーネント
│   │   ├── context/           # React Context
│   │   ├── services/          # API クライアント
│   │   └── data/              # 静的データ
│   ├── public/                # 静的ファイル
│   └── README.md              # フロントエンド設定ガイド
├── backend/                    # バックエンド (FastAPI + Python)
│   ├── services/              # ビジネスロジック
│   │   ├── gemini_service.py  # AI生成処理
│   │   ├── tts_service.py     # 音声読み上げ
│   │   ├── pdf_service.py     # PDF生成
│   │   ├── email_service.py   # メール送信
│   │   └── firestore_service.py # データベース
│   ├── main.py                # FastAPI アプリケーション
│   ├── requirements.txt       # Python 依存関係
│   ├── Dockerfile            # Docker 設定
│   └── README.md             # バックエンド設定ガイド
├── firebase.json              # Firebase 設定
├── firestore.rules           # Firestore セキュリティルール
├── .env.example              # 環境変数テンプレート
└── README.md                 # プロジェクト概要
```

## 🎵 新機能: 音声読み上げ (TTS)

OpenAI TTSを使用したホラー小説の音声読み上げ機能：

- **ホラー最適化**: 深く不気味な声での読み上げ
- **チャンク分割**: 長文を適切に分割して高品質な音声生成
- **音声キャッシュ**: 生成済み音声の効率的な管理
- **ダウンロード対応**: 生成された音声ファイルのダウンロード

### TTS API エンドポイント

```bash
# 全文音声生成
POST /stories/{story_id}/generate-audio

# チャンク別音声生成
POST /stories/{story_id}/generate-audio-chunk/{chunk_id}

# 音声情報取得
GET /stories/{story_id}/audio-chunks-info
```

## 🔧 カスタマイズ

### クイズ質問の変更

`frontend/src/data/quizQuestions.ts` でクイズの内容をカスタマイズできます。

### AIプロンプトの調整

`backend/services/gemini_service.py` でストーリー生成プロンプトを調整できます。

### TTS音声の調整

`backend/services/tts_service.py` で音声設定（声質、速度、ホラー特化指示など）をカスタマイズできます。

### UI/UXデザイン

`frontend/src/components/` と `frontend/src/index.css` でデザインをカスタマイズできます。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## ⚠️ 注意事項

- 本アプリケーションはデモンストレーション目的で作成されています
- APIキーなどの機密情報は適切に管理してください
- OpenAI TTS機能を使用する場合は、OpenAI APIの利用料金が発生します