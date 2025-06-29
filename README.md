# 🎭 Your Horror Nobel - AI共作ホラーノベル

ユーザー参加型のインタラクティブなホラー小説生成Webアプリケーション。ユーザーの好みを診断し、AIと対話しながら10ターンでオリジナルのホラー小説を共作します。

## 🌟 特徴

- **パーソナライズされた恐怖診断**: 10の質問でユーザーの恐怖の好みを分析
- **AI共同創作**: Gemini AIとの対話で物語を進行
- **ユニークな体験**: 一人一つのメールアドレスで一度だけの体験
- **美しいホラーデザイン**: ダークテーマとホラー要素を組み合わせたUI
- **PDF配信**: 完成した小説をメールでPDF配信

## 🏗️ アーキテクチャ

```
[React Frontend] ←→ [FastAPI Backend] ←→ [Gemini AI]
                            ↓
                     [Cloud Firestore]
                            ↓
                    [PDF生成 & メール送信]
```

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- Python 3.11+
- Google Cloud Project (`your-horror-nobel`)
- Gemini API Key
- SendGrid API Key

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd Your-Horror-Nobel
```

### 2. バックエンドのセットアップ

```bash
cd backend


  1. 環境変数ファイル作成
  vim backend/.env  

  2. 必要なAPIキー設定
  # backend/.env ファイル内で設定
  GEMINI_API_KEY=your_actual_gemini_api_key
  SENDGRID_API_KEY=your_actual_sendgrid_api_key
  FROM_EMAIL=your_verified_email@domain.com
  GOOGLE_CLOUD_PROJECT=your-horror-nobel

  3. Google Cloud サービスアカウントキー
  - Google Cloud Console でサービスアカウント作成
  - JSONキーをダウンロード
  - backend/service-account-key.json として保存
### 3. Google Cloud Firestore の設定

```bash
# Google Cloud SDK をインストール
# https://cloud.google.com/sdk/docs/install

# 認証
gcloud auth login
gcloud config set project your-horror-nobel

# Firestore を有効化
gcloud firestore databases create --region=asia-northeast1

# サービスアカウントキーの作成
gcloud iam service-accounts create horror-nobel-service \\
    --display-name="Horror Nobel Service Account"

gcloud projects add-iam-policy-binding your-horror-nobel \\
    --member="serviceAccount:horror-nobel-service@your-horror-nobel.iam.gserviceaccount.com" \\
    --role="roles/datastore.user"

gcloud iam service-accounts keys create service-account-key.json \\
    --iam-account=horror-nobel-service@your-horror-nobel.iam.gserviceaccount.com
```

### 4. フロントエンドのセットアップ

```bash
cd ..  # プロジェクトルートに戻る

# 依存関係のインストール
npm install
```

### 5. 開発サーバーの起動

#### 🚀 簡単起動（推奨）

```bash
# プロジェクトルートで
./start-app.sh
```

#### 📋 手動起動

```bash
# ターミナル1: バックエンド（Docker）
cd backend
./start-backend.sh

# ターミナル2: フロントエンド（Node.js）
cd frontend
./start-frontend.sh
```

#### 🌐 アクセスURL
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🐳 Docker での実行

```bash
# 環境変数を設定
cp backend/.env.example backend/.env
# .envファイルを編集

# Docker Compose で起動
docker-compose up --build
```

## 📦 本番デプロイ

### Cloud Run へのデプロイ

```bash
# Cloud Build の設定
gcloud builds submit --config=deploy/cloudbuild.yaml

# または手動デプロイ
cd backend
gcloud run deploy your-horror-nobel-backend \\
    --source . \\
    --region asia-northeast1 \\
    --allow-unauthenticated \\
    --set-env-vars GOOGLE_CLOUD_PROJECT=your-horror-nobel
```

### Firebase Hosting へのフロントエンドデプロイ

```bash
# Firebase CLI のインストール
npm install -g firebase-tools

# Firebase プロジェクトの初期化
firebase login
firebase init hosting

# ビルドとデプロイ
npm run build
firebase deploy
```

## 📁 プロジェクト構造

```
Your-Horror-Nobel/
├── frontend/              # React フロントエンド
│   ├── src/
│   │   ├── pages/         # ページコンポーネント
│   │   ├── context/       # React Context
│   │   ├── services/      # API サービス
│   │   └── data/          # 静的データ
│   ├── package.json       # フロントエンド依存関係
│   └── start-frontend.sh  # フロントエンド起動スクリプト
├── backend/               # FastAPI バックエンド
│   ├── services/          # ビジネスロジック
│   ├── main.py           # FastAPI アプリケーション
│   ├── requirements.txt   # Python 依存関係
│   ├── docker-compose.yml # バックエンド用Docker設定
│   └── start-backend.sh   # バックエンド起動スクリプト
├── deploy/               # デプロイ設定
└── start-app.sh          # 全体起動ガイド
```

## 🎮 使用方法

1. **トップページ**: アプリの紹介とR15+警告
2. **診断クイズ**: 10の質問で恐怖の好みを診断
3. **物語共作**: AIと10ターンの対話で物語を作成
4. **完成・配信**: メールアドレスを入力してPDF受信

## 🔧 開発

### コードフォーマット

```bash
# Python (バックエンド)
cd backend
black .
flake8 .

# TypeScript/React (フロントエンド)
npm run lint
npm run type-check
```

### テスト

```bash
# バックエンドテスト
cd backend
pytest

# フロントエンドテスト
npm test
```

## 📊 監視とログ

- Google Cloud Logging でアプリケーションログを確認
- Cloud Monitoring でメトリクスを監視
- Firestore コンソールでデータを確認

## 🔐 セキュリティ

- HTTPS通信の暗号化
- Firestore セキュリティルール
- メールアドレス重複チェック
- 入力値の検証とサニタイズ

## ⚠️ 注意事項

- 一つのメールアドレスで作成できる小説は1つのみ
- R15+相当のホラーコンテンツを含む
- AIが生成するコンテンツの品質は完全に保証されない

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、GitHub Issues でお気軽にお知らせください。

---

🎭 **恐怖の扉を開く準備はできていますか？**