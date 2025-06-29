#!/bin/bash

echo "🔧 環境変数を設定しています..."

# Gemini APIキーを設定してください（https://aistudio.google.com/app/apikey から取得）
read -p "Gemini APIキーを入力してください: " -s GEMINI_API_KEY
echo

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Gemini APIキーが入力されていません。"
    exit 1
fi

echo "✅ Gemini APIキーが設定されました。"

# 環境変数をエクスポート
export GEMINI_API_KEY="$GEMINI_API_KEY"

echo "🚀 デプロイを開始します..."
./deploy.sh 