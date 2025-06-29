# 🎭 Frontend - Your Horror Nobel

React + TypeScript + Vite で構築されたフロントエンドアプリケーション

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# または自動スクリプト
./start-frontend.sh
```

## 📦 利用可能なスクリプト

```bash
npm start            # 開発サーバー起動
npm run dev          # 開発サーバー起動（上記と同じ）
npm run build        # 本番用ビルド
npm run preview      # ビルド結果のプレビュー
npm run lint         # ESLintでコードチェック
npm run type-check   # TypeScriptの型チェック
```

## 🏗️ プロジェクト構造

```
frontend/
├── src/
│   ├── pages/           # ページコンポーネント
│   │   ├── LandingPage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── CompletionPage.tsx
│   ├── context/         # React Context
│   │   └── StoryContext.tsx
│   ├── services/        # API サービス
│   │   └── api.ts
│   ├── data/           # 静的データ
│   │   └── quizQuestions.ts
│   ├── App.tsx         # メインアプリコンポーネント
│   ├── main.tsx        # エントリーポイント
│   └── index.css       # グローバルスタイル
├── package.json        # 依存関係とスクリプト
├── vite.config.ts      # Vite設定
├── tsconfig.json       # TypeScript設定
└── index.html          # HTMLテンプレート
```

## 🎨 使用技術

- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **React Router** - ルーティング
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP クライアント

## 🌐 バックエンド接続設定

### 環境変数での設定

```bash
# 開発環境（デフォルト - プロキシ経由）
VITE_API_BASE_URL=/backend

# ローカル直接接続
VITE_API_BASE_URL=http://localhost:8000

# 本番環境
VITE_API_BASE_URL=https://your-backend-url.com
```

### 設定ファイル

- `.env` - ローカル開発用（プロキシ経由）
- `.env.local` - ローカル開発用（直接接続）
- `.env.production` - 本番環境用

### 設定変更方法

```bash
# 環境設定確認
./check-frontend-env.sh

# 設定ファイル編集
vim .env
```

## 🔧 開発ガイド

### 新しいページの追加
1. `src/pages/` に新しいコンポーネントを作成
2. `src/App.tsx` にルートを追加

### APIサービスの追加
1. `src/services/api.ts` に新しい関数を追加
2. 必要に応じて型定義を追加

### スタイルの変更
- グローバルスタイル: `src/index.css`
- CSS変数を活用してホラーテーマを維持

## 🎭 ホラーテーマ

アプリケーションは以下のデザイン要素を使用：
- **カラーパレット**: 黒、ダークレッド、ボーン色
- **フォント**: Creepster (タイトル), Crimson Text (本文)
- **エフェクト**: グロー、シャドウ、アニメーション