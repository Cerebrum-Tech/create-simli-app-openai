# URL Parameters Documentation

## Overview

The Simli Interview Application supports dynamic configuration through URL parameters, allowing you to customize interviews for different candidates, positions, and protocols without modifying the code.

## Parameter Types

### 1. Standard Interview Parameters

These parameters are used for the structured interview format:

| Parameter | Description | Default Value | Example |
|-----------|-------------|---------------|---------|
| `name` | Candidate's full name | `Alp Eren Özalp` | `Mehmet Yılmaz` |
| `position` | Position applying for | `DEEP LEARNING Mühendisi` | `Frontend Developer` |
| `department` | Department name | `Yazılım Geliştirme` | `AI Research` |
| `company` | Company name | `HAVELSAN` | `TechCorp` |
| `cvSummary` | Brief CV summary | `Bilkent Üniversitesi Bilgisayar Mühendisliği bölümü öğrencisi` | `5 yıllık deneyimli yazılım uzmanı` |
| `university` | University name | `Bilkent Üniversitesi` | `ODTÜ` |
| `uniDepartment` | University department | `Bilgisayar Mühendisliği` | `Elektrik Elektronik Mühendisliği` |
| `grade` | Current grade/year | `4. sınıf` | `Mezun` |
| `questions` | Technical questions pool (JSON) | Computer Vision questions | Custom JSON array |

### 2. Custom Protocol Parameters

These parameters override all standard parameters when both are provided:

| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| `protocolName` | Name of custom interview protocol | None |
| `protocolText` | Custom protocol instructions | None |

## Examples

### Basic Examples

#### 1. Simple Name Change
```
http://localhost:3000/?name=Ayşe%20Demir
```

#### 2. Position and Department
```
http://localhost:3000/?position=Backend%20Developer&department=Cloud%20Services
```

#### 3. University Student
```
http://localhost:3000/?name=Zeynep%20Kaya&university=İTÜ&uniDepartment=Yazılım%20Mühendisliği&grade=3.%20sınıf
```

### Complete Profile Examples

#### 1. Junior Developer Interview
```
http://localhost:3000/?name=Ali%20Veli&position=Junior%20Developer&department=Web%20Development&company=StartupTech&cvSummary=Yeni%20mezun,%20React%20ve%20Node.js%20deneyimli&university=Boğaziçi%20Üniversitesi&uniDepartment=Bilgisayar%20Mühendisliği&grade=Mezun
```

#### 2. Data Scientist Interview
```
http://localhost:3000/?name=Fatma%20Yılmaz&position=Data%20Scientist&department=Veri%20Analitiği&company=DataCorp&cvSummary=Machine%20Learning%20ve%20Python%20uzmanı&university=ODTÜ&uniDepartment=İstatistik&grade=Yüksek%20Lisans
```

#### 3. Senior Engineer Interview
```
http://localhost:3000/?name=Mustafa%20Özkan&position=Senior%20Software%20Engineer&department=Platform%20Engineering&company=TechGiant&cvSummary=10%20yıl%20deneyimli,%20mikroservis%20mimarisi%20uzmanı&university=Hacettepe%20Üniversitesi&uniDepartment=Bilgisayar%20Mühendisliği&grade=Mezun
```

#### 4. AI/ML Engineer Interview
```
http://localhost:3000/?name=Elif%20Şahin&position=Machine%20Learning%20Engineer&department=AI%20Research&company=InnovateLab&cvSummary=Deep%20Learning%20ve%20Computer%20Vision%20uzmanı&university=Koç%20Üniversitesi&uniDepartment=Bilgisayar%20Mühendisliği&grade=Doktora
```

### Custom Questions Examples

#### 1. Web Development Questions
```javascript
const webQuestions = [
  { question: "React Hook'ları nedir?", answer: "Fonksiyonel componentlerde state ve lifecycle kullanmayı sağlayan özellikler" },
  { question: "REST API nedir?", answer: "Representational State Transfer, HTTP protokolü üzerinden veri alışverişi standardı" },
  { question: "CSS Grid ve Flexbox arasındaki fark nedir?", answer: "Grid 2 boyutlu, Flexbox tek boyutlu layout sistemi" },
  { question: "JWT nedir?", answer: "JSON Web Token, güvenli bilgi aktarımı için kullanılan standard" },
  { question: "Webpack ne işe yarar?", answer: "JavaScript modül paketleyici ve build tool" }
];

const url = `http://localhost:3000/?name=Can%20Demir&position=Frontend%20Developer&questions=${encodeURIComponent(JSON.stringify(webQuestions))}`;
```

#### 2. Database Questions
```javascript
const dbQuestions = [
  { question: "ACID özellikleri nelerdir?", answer: "Atomicity, Consistency, Isolation, Durability" },
  { question: "NoSQL ve SQL farkı nedir?", answer: "SQL ilişkisel, NoSQL ilişkisel olmayan veritabanı sistemleri" },
  { question: "Indexleme nedir?", answer: "Veritabanı sorgularını hızlandıran veri yapısı" },
  { question: "Normalizasyon nedir?", answer: "Veri tekrarını azaltmak için tabloları organize etme" },
  { question: "Transaction nedir?", answer: "Atomik olarak işlenen veritabanı işlemleri grubu" }
];

const url = `http://localhost:3000/?name=Deniz%20Ak&position=Database%20Administrator&questions=${encodeURIComponent(JSON.stringify(dbQuestions))}`;
```

#### 3. DevOps Questions
```javascript
const devopsQuestions = [
  { question: "CI/CD nedir?", answer: "Continuous Integration/Continuous Deployment" },
  { question: "Docker nedir?", answer: "Container teknolojisi platformu" },
  { question: "Kubernetes ne işe yarar?", answer: "Container orchestration platformu" },
  { question: "Infrastructure as Code nedir?", answer: "Altyapıyı kod ile yönetme yaklaşımı" },
  { question: "Blue-Green Deployment nedir?", answer: "Sıfır kesinti ile deployment stratejisi" }
];

const url = `http://localhost:3000/?position=DevOps%20Engineer&questions=${encodeURIComponent(JSON.stringify(devopsQuestions))}`;
```

### Custom Protocol Examples

#### 1. Behavioral Interview Protocol
```
http://localhost:3000/?protocolName=Davranışsal%20Mülakat&protocolText=1.%20Kendinizi%20tanıtın%0A2.%20En%20büyük%20başarınızı%20anlatın%0A3.%20Bir%20çatışma%20durumunu%20nasıl%20çözdünüz%0A4.%20Takım%20çalışması%20deneyimleriniz%0A5.%20Kariyerinizde%20nereyi%20hedefliyorsunuz
```

#### 2. Technical Assessment Protocol
```javascript
const protocolName = "Teknik Değerlendirme";
const protocolText = `
AŞAMA 1: Teknik Bilgi (10 dakika)
- Kullandığınız programlama dilleri
- En iyi bildiğiniz teknolojiler
- Sistem tasarımı deneyiminiz

AŞAMA 2: Problem Çözme (15 dakika)
- Bir algoritma problemi çözümünüzü anlatın
- Performans optimizasyonu yaklaşımınız
- Debugging stratejileriniz

AŞAMA 3: Proje Deneyimi (10 dakika)
- En zorlu projeniz
- Karşılaştığınız teknik zorluklar
- Öğrendiğiniz dersler

AŞAMA 4: Kod Kalitesi (5 dakika)
- Clean code prensipleri
- Test stratejiniz
- Code review süreci

Değerlendirme sonunda özet yapın.
`;

const url = `http://localhost:3000/?protocolName=${encodeURIComponent(protocolName)}&protocolText=${encodeURIComponent(protocolText)}`;
```

#### 3. Leadership Assessment Protocol
```javascript
const protocolName = "Liderlik Değerlendirmesi";
const protocolText = `
GİRİŞ:
Merhaba, bugün liderlik becerilerinizi değerlendireceğiz.

SORULAR:
1. Bir ekibi yönetme deneyiminizi anlatın
2. Zor bir ekip üyesi ile nasıl başa çıktınız?
3. Ekip motivasyonunu nasıl sağlarsınız?
4. Çatışma yönetimi yaklaşımınız nedir?
5. Delegasyon stratejiniz nasıl?
6. Performans değerlendirme süreciniz
7. Mentorluk deneyimleriniz
8. Değişim yönetimi tecrübeleriniz

KAPANIŞ:
Liderlik vizyonunuzu özetleyin.
`;

const url = `http://localhost:3000/?protocolName=${encodeURIComponent(protocolName)}&protocolText=${encodeURIComponent(protocolText)}`;
```

#### 4. Stress Interview Protocol
```javascript
const protocolName = "Stres Mülakatı";
const protocolText = `
UYARI: Bu bir stres mülakatıdır. Adayın baskı altındaki performansını değerlendir.

YAKLAŞIM:
- Hızlı sorular sor
- Cevapları sorgula
- Detay iste
- Çelişkileri yakala
- Baskıyı artır

SORULAR:
1. Neden bu işi istiyorsunuz? (Cevabı sorgula)
2. En büyük zayıflığınız nedir? (Daha fazla zayıflık iste)
3. Neden önceki işinizden ayrıldınız? (Detaylı incele)
4. Bu pozisyon için fazla deneyimli değil misiniz?
5. Başarısız olduğunuz bir projeyi anlatın (Sorumluluğu sorgula)
6. Maaş beklentiniz nedir? (Pazarlık yap)
7. 5 dakikada kendinizi satın

DEĞERLENDİRME:
- Stres yönetimi
- Tutarlılık
- Özgüven
- Problem çözme
`;

const url = `http://localhost:3000/?protocolName=${encodeURIComponent(protocolName)}&protocolText=${encodeURIComponent(protocolText)}`;
```

#### 5. Culture Fit Interview
```
http://localhost:3000/?protocolName=Kültür%20Uyumu%20Mülakatı&protocolText=1.%20Ideal%20çalışma%20ortamınız%20nasıl%20olurdu%3F%0A2.%20Hangi%20tip%20yönetim%20tarzı%20sizi%20motive%20eder%3F%0A3.%20Takım%20çalışması%20mı%20bireysel%20çalışma%20mı%3F%0A4.%20İş-yaşam%20dengesi%20sizin%20için%20ne%20anlama%20geliyor%3F%0A5.%20Şirket%20değerlerimiz%20hakkında%20ne%20düşünüyorsunuz%3F
```

## Advanced Usage

### Combining Parameters

#### Full Custom Interview with All Parameters
```javascript
// Complete configuration
const params = new URLSearchParams({
  name: "Ahmet Yıldız",
  position: "Full Stack Developer",
  department: "Product Development",
  company: "InnovateTech",
  cvSummary: "5 yıl deneyimli, React ve Python uzmanı",
  university: "Sabancı Üniversitesi",
  uniDepartment: "Bilgisayar Bilimleri",
  grade: "2015 Mezunu",
  questions: JSON.stringify([
    { question: "Microservices nedir?", answer: "Bağımsız servislerden oluşan mimari" },
    { question: "Docker Compose nedir?", answer: "Multi-container Docker uygulamaları için tool" },
    { question: "GraphQL nedir?", answer: "API query dili ve runtime" }
  ])
});

const url = `http://localhost:3000/?${params.toString()}`;
```

### Programmatic URL Generation

#### JavaScript Function to Generate Interview URL
```javascript
function generateInterviewURL(config) {
  const baseURL = "http://localhost:3000/";
  const params = new URLSearchParams();
  
  // Add all non-null parameters
  Object.keys(config).forEach(key => {
    if (config[key] !== null && config[key] !== undefined) {
      if (key === 'questions' && typeof config[key] === 'object') {
        params.append(key, JSON.stringify(config[key]));
      } else {
        params.append(key, config[key]);
      }
    }
  });
  
  return `${baseURL}?${params.toString()}`;
}

// Usage
const interviewURL = generateInterviewURL({
  name: "Selin Kara",
  position: "QA Engineer",
  department: "Quality Assurance",
  questions: [
    { question: "Test automation nedir?", answer: "Otomatik test yazma ve çalıştırma" },
    { question: "Regression testing nedir?", answer: "Değişikliklerden sonra yapılan test" }
  ]
});
```

### Special Characters Handling

When using Turkish characters or special symbols:

```javascript
// Turkish characters example
const name = "Çağrı Öztürk";
const encoded = encodeURIComponent(name);
// Result: %C3%87a%C4%9Fr%C4%B1%20%C3%96zt%C3%BCrk

const url = `http://localhost:3000/?name=${encoded}`;
```

## Testing Different Scenarios

### 1. Fresh Graduate
```
http://localhost:3000/?name=Yeni%20Mezun&position=Junior%20Developer&cvSummary=Stajyer%20olarak%20deneyim&grade=4.%20sınıf
```

### 2. Senior Professional
```
http://localhost:3000/?name=Kıdemli%20Uzman&position=Tech%20Lead&cvSummary=15%20yıl%20deneyim&grade=2008%20Mezunu
```

### 3. Career Changer
```
http://localhost:3000/?name=Kariyer%20Değiştiren&position=Data%20Analyst&cvSummary=Finanstan%20teknolojiye%20geçiş&department=Analytics
```

### 4. Internship Application
```
http://localhost:3000/?name=Stajyer%20Aday&position=Summer%20Intern&grade=2.%20sınıf&cvSummary=Yazılım%20kulübü%20başkanı
```

## Tips and Best Practices

### 1. URL Encoding
Always encode parameter values:
```javascript
const value = "C++ Developer & Team Lead";
const encoded = encodeURIComponent(value);
// Use: ?position=${encoded}
```

### 2. Parameter Priority
- Custom protocol parameters (`protocolName` + `protocolText`) override all standard parameters
- If both are provided, only the custom protocol is used

### 3. Default Values
Parameters not provided will use defaults:
- Missing `name` → "Alp Eren Özalp"
- Missing `position` → "DEEP LEARNING Mühendisi"
- Missing `company` → "HAVELSAN"

### 4. Question Format
Questions must be valid JSON:
```javascript
// Correct
[{"question": "Q1", "answer": "A1"}]

// Incorrect
{question: "Q1", answer: "A1"}
```

### 5. Maximum URL Length
- Keep URLs under 2000 characters
- For long protocols, consider using a URL shortener

## Environment Variables

Don't forget to set:
```bash
NEXT_PUBLIC_REDIRECT_URL=https://your-company.com
```

This determines where users are redirected after the interview completes (default: Google.com).

## Troubleshooting

### Common Issues

1. **Turkish Characters Not Displaying**
   - Ensure proper URL encoding
   - Use `encodeURIComponent()` for all values

2. **Questions Not Loading**
   - Check JSON format is valid
   - Ensure proper escaping of quotes

3. **Protocol Not Working**
   - Both `protocolName` AND `protocolText` must be provided
   - Check encoding of multiline text

4. **Parameters Ignored**
   - Check parameter names are exact (case-sensitive)
   - Verify no typos in parameter names

## Support

For more examples or custom configurations, refer to the main documentation or create an issue in the repository.
