FROM python:3.11-slim

WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    fonts-dejavu \
    fonts-noto-cjk \
    fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# フォント用ディレクトリを作成
RUN mkdir -p /usr/share/fonts/truetype/minamoji_1_4

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルをコピー
COPY . .

EXPOSE 8080

# デフォルトは本番環境用、開発時はdocker-compose.ymlでオーバーライド
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
