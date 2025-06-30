#!/bin/bash

echo "🔧 環境変数を設定しています..."

# .envファイルが存在しない場合は作成
if [ ! -f .env ]; then
    echo "📝 .envファイルを作成しています..."
    cat > .env << 'EOF'
# 必須 - Gemini AI API Key (https://aistudio.google.com/app/apikey から取得)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# OpenAI API Key - TTS機能用 (https://platform.openai.com/api-keys から取得)
OPENAI_API_KEY=your_openai_api_key_here

# メール送信設定（SMTP使用の場合）
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
FROM_EMAIL=your_email@gmail.com
EMAIL_SERVICE=smtp

# SendGrid使用の場合（オプション）
# SENDGRID_API_KEY=your_sendgrid_api_key_here
# EMAIL_SERVICE=sendgrid

# その他
DEV_MODE=true
EOF
    echo "✅ .envファイルのテンプレートを作成しました。"
    echo "📝 .envファイルを編集して、必要なAPIキーを設定してください。"
    echo ""
    echo "必要なAPIキー："
    echo "  1. Gemini API Key: https://aistudio.google.com/app/apikey"
    echo "  2. OpenAI API Key: https://platform.openai.com/api-keys"
    echo "  3. Gmail App Password: https://myaccount.google.com/apppasswords"
    echo ""
else
    echo "✅ .envファイルが見つかりました。"
fi

# 環境変数を読み込み
if [ -f .env ]; then
    echo "📝 .envファイルから環境変数を読み込んでいます..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# 必須APIキーのチェック
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "⚠️  Gemini APIキーが設定されていません。"
    echo "    https://aistudio.google.com/app/apikey で取得し、.envファイルに設定してください。"
fi

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    echo "⚠️  OpenAI APIキーが設定されていません。"
    echo "    TTS（音声読み上げ）機能を使用する場合は、"
    echo "    https://platform.openai.com/api-keys で取得し、.envファイルに設定してください。"
fi

echo "🚀 環境設定を確認してください。"
echo "   必要に応じて .env ファイルを編集した後、サーバーを起動してください："
echo "   uvicorn main:app --reload --port 8000" 