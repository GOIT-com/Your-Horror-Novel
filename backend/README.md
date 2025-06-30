# 🎭 Backend - Your Horror Nobel

FastAPI + Python で構築されたバックエンドAPI

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
cp .env.example .env
# .envファイルを編集

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
│   ├── pdf_service.py         # PDF生成
│   ├── email_service.py       # メール送信（統合）
│   └── smtp_email_service.py  # SMTP専用
├── main.py                     # FastAPI アプリケーション
├── requirements.txt           # Python依存関係
├── Dockerfile                 # 本番用Dockerfile
├── docker-compose.yml         # Docker Compose設定
├── .env.example              # 環境変数テンプレート
├── deploy.sh.example         # デプロイスクリプトテンプレート
└── README.md                 # このファイル
```

## 🌐 API エンドポイント

### 基本
- `GET /` - API情報
- `GET /health` - ヘルスチェック
- `GET /docs` - API ドキュメント (Swagger UI)

### ストーリー関連
- `POST /stories` - 新しいストーリー開始
- `POST /stories/{story_id}/chat` - チャットメッセージ送信
- `POST /stories/{story_id}/finish` - ストーリー完了・PDF送信

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
```

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
# - SERVICE_ACCOUNT: サービスアカウントメールアドレス
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

## 🧪 テスト・開発

### APIテスト

```bash
# ローカル環境でのAPIテスト
curl http://localhost:8000/health

# 対話的ドキュメント
open http://localhost:8000/docs
```

### ログ確認

```bash
# Dockerログ確認
docker-compose logs -f

# Cloud Runログ確認（デプロイ後）
gcloud run services logs read your-service-name --region=asia-northeast1
```

### デバッグ

```bash
# コンテナ内シェル
docker-compose exec backend bash

# Python依存関係確認
pip list

# 環境変数確認
env | grep -E "(GEMINI|SMTP|DEV_MODE)"
```

## 🛠️ カスタマイズ

### ストーリー生成プロンプトの変更

`services/gemini_service.py` の以下のメソッドを編集：

- `_create_personality_prompt()`: ユーザー好み分析
- `generate_initial_story()`: 初期ストーリー生成
- `generate_response()`: チャット応答生成
- `generate_final_story()`: 最終ストーリー生成

### PDF デザインの変更

`services/pdf_service.py` を編集：

- フォント設定
- レイアウト調整
- スタイリング

### メール送信の設定

- SMTP設定: `services/smtp_email_service.py`
- SendGrid設定: `services/email_service.py`
- 統合ロジック: `services/email_service.py`

## 🛠️ トラブルシューティング

### よくある問題

#### 1. Gemini APIエラー

```bash
# APIキー確認
echo $GEMINI_API_KEY

# 有効なキーかテスト
curl -H "x-goog-api-key: $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

#### 2. Firestoreアクセスエラー

```bash
# サービスアカウント権限確認
gcloud projects get-iam-policy your-project-id

# 認証情報確認
echo $GOOGLE_APPLICATION_CREDENTIALS
```

#### 3. メール送信エラー

```bash
# SMTP設定確認（Gmail）
echo $SMTP_USERNAME
echo $SMTP_PASSWORD  # App Password（16文字）

# SMTP接続テスト
telnet smtp.gmail.com 587
```

#### 4. Cloud Runデプロイエラー

```bash
# コンテナログ確認
gcloud run services logs read your-service-name --region=asia-northeast1

# サービス状態確認
gcloud run services describe your-service-name --region=asia-northeast1
```

### デバッグのヒント

1. **ローカル環境でまずテスト**
2. **環境変数の確認**
3. **ログの詳細確認**
4. **段階的なデプロイ**

## 📊 監視・運用

- **ヘルスチェック**: `/health` エンドポイント
- **ログ**: Google Cloud Logging（本番環境）
- **メトリクス**: Cloud Monitoring
- **アラート**: Cloud Alerting Policy

## 🔐 セキュリティ

- HTTPS通信（本番環境）
- 入力値検証・サニタイズ
- APIキーの適切な管理
- Firestoreセキュリティルール
- サービスアカウントの最小権限

## 🤝 コントリビューション

1. 新しいサービスクラスは `services/` ディレクトリに配置
2. API エンドポイントは適切なHTTPメソッドを使用
3. エラーハンドリングを適切に実装
4. ログ出力を適切に設定
5. 型ヒント（Type Hints）を使用

## ⚠️ 注意事項

- APIキーなどの機密情報は環境変数で管理
- 本番環境では `DEV_MODE=false` に設定
- メール送信制限に注意（1日の送信上限など）
- Gemini API の利用制限に注意

## 📚 関連リンク

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini AI Documentation](https://developers.generativeai.google/)
- [Google Cloud Firestore](https://cloud.google.com/firestore)
- [Google Cloud Run](https://cloud.google.com/run)