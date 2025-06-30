# 🎭 Backend - Your Horror Nobel

FastAPI + Python で構築されたバックエンドAPI

AI生成ホラー小説、音声読み上げ（TTS）、PDF生成、メール送信機能を提供します。

## 🚀 クイックスタート

### Docker使用（推奨）

```bash
# 環境変数設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# バックエンド起動
docker-compose up --build

# アクセス: http://localhost:8000
```

### ローカル環境

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
./setup_env.sh
# または手動で .env ファイルを編集

# サーバー起動
uvicorn main:app --reload --port 8000
```

## 🔧 必要な設定

### 1. 環境変数設定 (.env)

```bash
# 必須 - Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# OpenAI API Key - TTS機能用
OPENAI_API_KEY=your_openai_api_key_here

# メール送信設定（SMTP使用の場合）
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
FROM_EMAIL=your_email@gmail.com
EMAIL_SERVICE=smtp

# SendGrid使用の場合（オプション）
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_SERVICE=sendgrid

# その他
DEV_MODE=true
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
```

### 2. Google Cloud サービスアカウント

1. Google Cloud Consoleでプロジェクトを作成
2. Firestoreを有効化
3. サービスアカウントを作成
4. サービスアカウントキー（JSON）をダウンロード
5. `service-account-key.json` として保存

```bash
# 必要な権限
- roles/datastore.user (Firestore アクセス)
- roles/aiplatform.user (Gemini AI アクセス)
```

### 3. 外部サービス設定

#### Gemini API
1. [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキー取得
2. `.env` ファイルに設定

#### OpenAI API（TTS機能用）
1. [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキー取得
2. `.env` ファイルに設定
3. TTS機能を使用しない場合は設定不要（機能は無効化されます）

#### Gmail SMTP（推奨）
1. Gmailで2段階認証を有効化
2. [App Passwords](https://myaccount.google.com/apppasswords) で16文字のパスワード生成
3. `.env` ファイルに設定

#### SendGrid（オプション）
1. [SendGrid](https://sendgrid.com/) でアカウント作成
2. API Key作成
3. 送信元メールアドレス認証
4. `.env` ファイルに設定

## 📁 プロジェクト構造

```
backend/
├── services/                   # ビジネスロジック
│   ├── __init__.py
│   ├── firestore_service.py   # Firestore操作
│   ├── gemini_service.py      # AI生成処理
│   ├── tts_service.py         # 音声読み上げ（OpenAI TTS）
│   ├── pdf_service.py         # PDF生成
│   ├── email_service.py       # メール送信（統合）
│   └── smtp_email_service.py  # SMTP専用
├── static/
│   └── audio/                  # 生成された音声ファイル
├── main.py                     # FastAPI アプリケーション
├── requirements.txt           # Python依存関係
├── Dockerfile                 # 本番用Dockerfile
├── docker-compose.yml         # Docker Compose設定
├── .env.example              # 環境変数テンプレート
├── setup_env.sh              # 環境設定スクリプト
├── deploy.sh.example         # デプロイスクリプトテンプレート
├── FIRESTORE_SETUP.md        # Firestore設定ガイド
├── GMAIL_SETUP.md            # Gmail設定ガイド
└── README.md                 # このファイル
```

## 🌐 API エンドポイント

### 基本
- `GET /` - API情報
- `GET /health` - ヘルスチェック（TTS機能の状態も含む）
- `GET /docs` - API ドキュメント (Swagger UI)

### ストーリー関連
- `POST /stories` - 新しいストーリー開始
- `POST /stories/{story_id}/chat` - チャットメッセージ送信
- `POST /stories/{story_id}/complete` - ストーリー完了・小説生成
- `POST /stories/{story_id}/send-email` - 完成作品をPDF化してメール送信

### TTS（音声読み上げ）関連
- `POST /stories/{story_id}/generate-audio` - 全文音声生成
- `GET /stories/{story_id}/audio-chunks-info` - 音声チャンク情報取得
- `POST /stories/{story_id}/generate-audio-chunk/{chunk_id}` - 特定チャンクの音声生成

### API使用例

```bash
# ヘルスチェック
curl http://localhost:8000/health

# ストーリー開始
curl -X POST http://localhost:8000/stories \
  -H "Content-Type: application/json" \
  -d '{"quizAnswers": {"q1": "a", "q2": "b"}}'

# チャット送信
curl -X POST http://localhost:8000/stories/{story_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "扉を開ける"}'

# 音声生成
curl -X POST http://localhost:8000/stories/{story_id}/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"voice": "onyx", "speed": 0.8}'
```

## 🎵 TTS（音声読み上げ）機能

### 概要
OpenAI TTSを使用して、完成したホラー小説を迫力ある音声で読み上げます。

### 特徴
- **ホラー最適化**: 深く不気味な声での読み上げ
- **日本語対応**: 日本語テキストの自然な音声生成
- **チャンク分割**: 長文を適切に分割して高品質な音声生成
- **音声キャッシュ**: 生成済み音声の効率的な管理
- **エラーハンドリング**: OpenAI APIが利用できない場合の適切な処理

### 使用方法

1. **全文音声生成**:
   ```bash
   POST /stories/{story_id}/generate-audio
   {
     "voice": "onyx",    # 利用可能: alloy, echo, fable, onyx, nova, shimmer
     "speed": 0.8        # 0.25-4.0, ホラーには0.7-0.9が最適
   }
   ```

2. **チャンク別生成**:
   ```bash
   # まず音声チャンク情報を取得
   GET /stories/{story_id}/audio-chunks-info
   
   # 特定チャンクの音声生成
   POST /stories/{story_id}/generate-audio-chunk/0
   ```

### 技術仕様

- **使用モデル**: `gpt-4o-mini-tts` （フォールバック: `tts-1`）
- **音声フォーマット**: MP3
- **文字数制限**: チャンクあたり2,300文字（日本語最適化）
- **ホラー指示**: 専用プロンプトで恐怖演出を強化

## 🌩️ 本番デプロイ（Cloud Run）

### 前提条件

1. **Google Cloud CLI** がインストールされていること
2. **Docker** がインストールされて実行されていること
3. **必要なAPIキー** を取得していること

### デプロイ手順

#### 1. デプロイスクリプトの準備

```bash
# テンプレートからコピー
cp deploy.sh.example deploy.sh
chmod +x deploy.sh

# deploy.shを編集して以下を設定:
# - PROJECT_ID: あなたのGCPプロジェクトID
# - SERVICE_NAME: Cloud Runサービス名
```

#### 2. Google Cloud 認証

```bash
# Google Cloud にログイン
gcloud auth login

# プロジェクト設定
gcloud config set project your-gcp-project-id
```

#### 3. デプロイ実行

```bash
# デプロイ実行（環境変数は.envから自動読み込み）
./deploy.sh
```

### デプロイされるリソース

- **Cloud Runサービス**: カスタマイズ可能
- **リージョン**: asia-northeast1（変更可能）
- **メモリ**: 1GB、CPU: 1vCPU
- **自動スケーリング**: 0-10インスタンス
- **タイムアウト**: 3600秒（音声生成用）

## 🧪 テスト・開発

### APIテスト

```bash
# ローカル環境でのAPIテスト
curl http://localhost:8000/health

# TTS機能テスト
curl -X POST http://localhost:8000/stories/{story_id}/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"voice": "onyx", "speed": 0.8}'
```

### ログ確認

```bash
# 開発環境でのログ確認
docker-compose logs -f

# Cloud Run でのログ確認
gcloud logs read --service=your-service-name --limit=50
```

## 🔧 トラブルシューティング

### TTS機能が動作しない

1. OpenAI APIキーが正しく設定されているか確認
2. OpenAI APIの利用制限を確認
3. ログでエラーメッセージを確認

### Firestore接続エラー

詳細は `FIRESTORE_SETUP.md` を参照してください。

### メール送信エラー

詳細は `GMAIL_SETUP.md` を参照してください。

## 💰 コスト注意事項

### OpenAI TTS料金
- $15.00 / 1M文字
- 日本語小説（約2000文字）≈ $0.03
- 月間利用料を監視することを推奨

### Google Cloud料金
- Cloud Run: リクエスト数とCPU時間に基づく従量課金
- Firestore: 読み書き回数に基づく従量課金
- 詳細は [Google Cloud Pricing](https://cloud.google.com/pricing) を参照