# Startup Analysis API

Bu proje FastAPI kullanarak startup analizi yapan bir backend servisdir. Yapay zeka destekli olarak startup'ların risk analizi, pazar büyüklüğü ve özgünlük değerlendirmesi yapar.

## Özellikler

- **Risk Analizi** (`/riskcalc`): Kategori ve yatırım verilerine dayalı risk hesaplaması
- **Pazar Büyüklüğü** (`/marketsize`): Kategori fonlama verilerine dayalı pazar büyüklüğü analizi
- **Özgünlük Analizi** (`/originality`): Kategori sıklığı ve AI açıklama analizi ile özgünlük hesaplaması
- **Kategori Listesi** (`/categories`): Frontend için mevcut kategorileri döner

## Kurulum

### Gereksinimler

- Python 3.12
- OpenAI API anahtarı

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Çevre değişkenlerini ayarlayın:**
   `.env` dosyası oluşturun:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Uygulamayı çalıştırın:**
   ```bash
   python app.py
   ```

   Veya uvicorn ile:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

## API Kullanımı

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Kategori Listesi
**GET** `/categories`

**Response:**
```json
{
  "categories": [
    "Technology",
    "Healthcare", 
    "Finance",
    "E-commerce",
    "Education"
  ]
}
```

#### 2. Risk Analizi
**POST** `/riskcalc`

```json
{
  "startup_name": "AI Yazılım Şirketi",
  "category": "Technology",
  "description": "Yapay zeka destekli yazılım geliştirme platformu"
}
```

**Response:**
```json
{
  "percentage": 65.0,
  "confidence_score": 85.0,
  "factors": ["Moderate-risk category: technology", "Limited funding success in this category"],
  "recommendations": ["Focus on execution excellence", "Prepare strong funding strategy"],
  "analysis_date": "2024-01-15T10:30:00",
  "risk_level": "Medium",
  "risk_categories": {
    "category_risk": 45.0,
    "funding_risk": 70.0,
    "market_risk": 57.5,
    "overall": 65.0
  }
}
```

#### 3. Pazar Büyüklüğü Analizi
**POST** `/marketsize`

```json
{
  "startup_name": "AI Yazılım Şirketi",
  "category": "Technology",
  "description": "Yapay zeka destekli yazılım geliştirme platformu"
}
```

**Response:**
```json
{
  "percentage": 72.0,
  "confidence_score": 78.0,
  "factors": ["Category funding patterns indicate 65.0% market potential", "Investment trends show 85.0% growth momentum"],
  "recommendations": ["Good market potential - focus on market penetration"],
  "analysis_date": "2024-01-15T10:30:00",
  "market_potential": "High",
  "growth_rate": 25.5
}
```

#### 4. Özgünlük Analizi
**POST** `/originality`

```json
{
  "startup_name": "AI Yazılım Şirketi",
  "category": "Technology",
  "description": "Yapay zeka destekli yazılım geliştirme platformu"
}
```

**Response:**
```json
{
  "percentage": 78.0,
  "confidence_score": 82.0,
  "factors": ["Category frequency analysis: 45.0% uniqueness", "AI description analysis: 75.0% uniqueness"],
  "recommendations": ["Good uniqueness - focus on differentiation and market positioning"],
  "analysis_date": "2024-01-15T10:30:00",
  "originality_level": "High",
  "similar_projects": ["SimilarTech Inc - operating", "TechCorp - acquired"]
}
```

## Hesaplama Mantığı

### Risk Oranı
- **Kategori Risk**: Başarı oranlarının tersi (yüksek başarı = düşük risk)
- **Fonlama Risk**: Fonlama ile başarı arasındaki korelasyon
- **Genel Risk**: Kategori ve fonlama riskinin ortalaması

### Pazar Büyüklüğü
- **Kategori Fonlama**: Kategori fonlama verilerinin percentile analizi
- **Yatırım Trendi**: Son yıllardaki yatırım aktivitesi
- **Pazar Skoru**: %70 fonlama + %30 trend

### Özgünlük Hesaplaması
- **Kategori Sıklığı**: Kategori frekansının tersi (nadir = özgün)
- **AI Açıklama Skoru**: OpenAI ile açıklama analizi
- **Özgünlük Skoru**: %50 kategori + %50 AI analizi

## Yapay Zeka Entegrasyonu

- **OpenAI GPT-4o-mini**: Açıklama analizi için
- **Crunchbase Dataset**: Historik startup verileri
- **Fallback System**: AI servisi başarısız olursa otomatik geçiş

## Proje Yapısı

```
backend-ai/
├── app.py                    # Ana FastAPI uygulaması
├── ai_services.py           # AI analiz servisleri
├── startup_data_analyzer.py # Veri analizi sınıfı
├── config.py               # Yapılandırma ayarları
├── requirements.txt        # Python bağımlılıkları
└── README.md              # Dokümantasyon
```

## Test Etme

API'yi test etmek için:

1. **Swagger UI**: `http://localhost:8000/docs`
2. **ReDoc**: `http://localhost:8000/redoc`

## Curl Örneği

```bash
curl -X POST "http://localhost:8000/riskcalc" \
  -H "Content-Type: application/json" \
  -d '{
    "startup_name": "AI Yazılım Şirketi",
    "category": "Technology", 
    "description": "Yapay zeka destekli yazılım geliştirme platformu"
  }'
``` 