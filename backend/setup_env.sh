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

# OpenAI APIキーを設定してください（https://platform.openai.com/api-keys から取得）
read -p "OpenAI APIキー（TTS機能用）を入力してください: " -s OPENAI_API_KEY
echo

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OpenAI APIキーが入力されていません。TTS機能は無効になります。"
    echo "⚠️  音声朗読機能を使用したい場合は、OpenAI APIキーを設定してください。"
else
    echo "✅ OpenAI APIキーが設定されました。"
fi

# 環境変数をエクスポート
export GEMINI_API_KEY="$GEMINI_API_KEY"
export OPENAI_API_KEY="$OPENAI_API_KEY"

echo "🚀 デプロイを開始します..."
./deploy.sh 