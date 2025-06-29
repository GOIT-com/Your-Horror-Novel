# 🎭 Backend - Your Horror Nobel

FastAPI + Python で構築されたバックエンドAPI

## 🚀 クイックスタート

### Docker使用（推奨）

```bash
# 環境設定確認
./check-backend-env.sh

# バックエンド起動
./start-backend.sh

# または直接実行
docker-compose up --build
```

### ローカル環境

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
vim .env

# サーバー起動
uvicorn main:app --reload --port 8000
```

## 🔧 必要な設定

### 1. 環境変数設定 (.env)

```bash
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# SendGrid API Key
SENDGRID_API_KEY=your_sendgrid_api_key_here

# メール送信元アドレス
FROM_EMAIL=your_verified_email@domain.com

# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=your-horror-nobel
```

### 2. Google Cloud サービスアカウント

```bash
# service-account-key.json を配置
# Google Cloud Console からダウンロード
```

### 3. 外部サービス設定

#### Gemini API
- [Google AI Studio](https://makersuite.google.com/app/apikey) でAPIキー取得

#### SendGrid
- [SendGrid](https://sendgrid.com/) でアカウント作成
- API Key作成
- 送信元メールアドレスの認証

#### Google Cloud Firestore
- プロジェクト作成
- Firestore有効化
- サービスアカウント作成

## 📁 プロジェクト構造

```
backend/
├── services/               # ビジネスロジック
│   ├── firestore_service.py   # Firestore操作
│   ├── gemini_service.py       # AI生成処理
│   ├── pdf_service.py          # PDF生成
│   └── email_service.py        # メール送信
├── main.py                 # FastAPI アプリケーション
├── requirements.txt        # Python依存関係
├── Dockerfile             # 本番用Dockerfile
├── Dockerfile.dev         # 開発用Dockerfile
├── docker-compose.yml     # Docker Compose設定
└── .env.example           # 環境変数テンプレート
```

## 🌐 API エンドポイント

### 基本
- `GET /` - ルート
- `GET /health` - ヘルスチェック
- `GET /docs` - API ドキュメント

### ストーリー関連
- `POST /stories` - 新しいストーリー開始
- `POST /stories/{story_id}/chat` - チャットメッセージ送信
- `POST /stories/{story_id}/finish` - ストーリー完了・PDF送信

## 🧪 テスト

```bash
# APIテスト
curl http://localhost:8000/health

# 対話的ドキュメント
open http://localhost:8000/docs
```

## 🔍 ログとデバッグ

```bash
# Dockerログ確認
docker-compose logs -f

# コンテナ内シェル
docker-compose exec backend bash
```

## 📊 監視

- **ヘルスチェック**: `/health` エンドポイント
- **ログ**: Google Cloud Logging
- **メトリクス**: Docker healthcheck

## 🔐 セキュリティ

- HTTPS通信（本番環境）
- 入力値検証
- メールアドレス重複チェック
- Firestoreセキュリティルール