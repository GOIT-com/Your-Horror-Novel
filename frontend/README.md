# 🎭 Frontend - Your Horror Nobel

React + TypeScript + Vite で構築されたフロントエンドアプリケーション

## 🚀 クイックスタート

### 開発環境

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# アクセス: http://localhost:3000
```

### 本番ビルド

```bash
# 本番用ビルド
npm run build:prod

# プレビュー
npm run preview
```

## 🔧 環境変数設定

### 開発環境

開発環境では、プロキシ設定により `/backend` パスがバックエンドサーバーに転送されます。

```bash
# .env.development (オプション)
VITE_API_BASE_URL=/backend
```

### 本番環境

```bash
# .env.production
VITE_API_BASE_URL=https://your-backend-url.run.app
```

または、`src/services/api.ts` で直接設定：

```typescript
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://your-backend-url.run.app'
  : '/backend'
```

## 🛠 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP クライアント
- **React Router** - ルーティング

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   └── FontSwitcher.tsx   # フォント切り替え
│   ├── pages/               # ページコンポーネント
│   │   ├── LandingPage.tsx     # ランディングページ
│   │   ├── QuizPage.tsx        # クイズページ
│   │   ├── ChatPage.tsx        # チャットページ
│   │   └── CompletionPage.tsx  # 完了ページ
│   ├── context/             # React Context
│   │   ├── StoryContext.tsx    # ストーリー状態管理
│   │   └── FontContext.tsx     # フォント状態管理
│   ├── services/            # API クライアント
│   │   └── api.ts              # バックエンドAPI
│   ├── data/                # 静的データ
│   │   └── quizQuestions.ts    # クイズ質問データ
│   ├── App.tsx              # メインアプリケーション
│   ├── main.tsx             # エントリーポイント
│   ├── index.css            # グローバルスタイル
│   └── vite-env.d.ts        # Vite型定義
├── public/                  # 静的ファイル
├── fonts/                   # フォントファイル
├── index.html               # HTMLテンプレート
├── package.json             # 依存関係
├── vite.config.ts           # Vite設定
└── tsconfig.json            # TypeScript設定
```

## 🎨 UI/UXカスタマイズ

### テーマカラーの変更

`src/index.css` のCSS変数を編集：

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #f0f0f0;
  --accent-color: #8b0000;
  --border-color: #333;
}
```

### フォントの変更

1. `public/fonts/` にフォントファイルを配置
2. `src/index.css` でフォントを定義
3. `src/context/FontContext.tsx` でフォント選択肢を更新

### コンポーネントのスタイル変更

各ページコンポーネント内のstyled-components を編集してカスタマイズできます。

## 🔌 API統合

### バックエンドとの連携

`src/services/api.ts` でAPI呼び出しを管理：

```typescript
// ストーリー開始
const response = await storyApi.startStory(quizAnswers)

// チャットメッセージ送信
const response = await storyApi.sendMessage(storyId, message)

// ストーリー完了・PDF送信
const response = await storyApi.finishStory(storyId, email)
```

### エラーハンドリング

APIエラーは自動的にキャッチされ、ユーザーに適切なメッセージが表示されます。

## 🚀 デプロイ

### Firebase Hosting

プロジェクトルートから：

```bash
# テンプレートからデプロイスクリプトをコピー
cp deploy-frontend.sh.example deploy-frontend.sh
chmod +x deploy-frontend.sh

# Firebase プロジェクト設定
firebase init hosting

# デプロイ実行
./deploy-frontend.sh
```

### 手動デプロイ

```bash
# 本番用ビルド
npm run build:prod

# Firebase Hostingにデプロイ
firebase deploy --only hosting
```

### その他のホスティングサービス

- **Vercel**: `dist/` ディレクトリを直接デプロイ
- **Netlify**: `dist/` ディレクトリを直接デプロイ
- **GitHub Pages**: `gh-pages` ブランチにデプロイ

## 🧪 開発とテスト

### コード品質

```bash
# リンター実行
npm run lint

# 型チェック
npm run type-check
```

### ホットリロード

開発サーバーはファイル変更を自動的に検知し、ブラウザをリロードします。

### プロキシ設定

`vite.config.ts` でバックエンドAPIへのプロキシを設定：

```typescript
server: {
  proxy: {
    '/backend': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/backend/, '')
    }
  }
}
```

## 📱 レスポンシブデザイン

- **モバイル**: 320px-767px
- **タブレット**: 768px-1023px
- **デスクトップ**: 1024px以上

メディアクエリは `src/index.css` で定義されています。

## ⚠️ 注意事項

### フォントライセンス

- `fonts/minamoji_1_4/` に含まれるフォントファイルは著作権保護されています
- 商用利用の際は適切なライセンスを取得するか、代替フォントを使用してください

### 環境変数

- 機密情報を含む環境変数は `.env` ファイルに保存し、リポジトリにコミットしないでください
- 本番環境では適切なシークレット管理サービスを使用してください

## 🤝 コントリビューション

1. 新しいページやコンポーネントを追加する際は、既存のコード スタイルに従ってください
2. TypeScriptの型定義を適切に設定してください
3. レスポンシブデザインを考慮してください
4. アクセシビリティガイドラインに準拠してください

## 📊 パフォーマンス最適化

- Viteによる高速ビルド
- コード分割による読み込み最適化
- 画像の最適化
- フォントの最適読み込み

詳細なパフォーマンス改善については、Viteの公式ドキュメントを参照してください。