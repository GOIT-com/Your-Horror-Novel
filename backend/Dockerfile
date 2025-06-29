FROM python:3.11-slim

WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    fonts-dejavu \
    fonts-noto-cjk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# デフォルトは本番環境用、開発時はdocker-compose.ymlでオーバーライド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
