"use client";
import React, { use, useEffect, useState, Suspense } from "react";
import SimliOpenAI from "./SimliOpenAI";
import Navbar from "./Components/Navbar";
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';


// Default configuration values
const DEFAULT_CONFIG = {
  openai_voice: "sage" as const,
  openai_model: "gpt-4o-realtime-preview-2024-12-17", // Use "gpt-4o-mini-realtime-preview-2024-12-17" for cheaper and faster responses
  simli_faceid: "b2ca517e-187c-4d39-9b65-d24cea8df4dd"
};

const InterviewContent: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);
  const searchParams = useSearchParams();

  // Check for custom protocol parameters first
  const protocolName = searchParams.get('protocolName');
  const protocolText = searchParams.get('protocolText');

  // Get standard parameters from URL with defaults
  const name = searchParams.get('name') || 'Alp Eren Özalp';
  const position = searchParams.get('position') || 'DEEP LEARNING Mühendisi';
  const department = searchParams.get('department') || 'Yazılım Geliştirme';
  const company = searchParams.get('company') || 'HAVELSAN';
  const cvSummary = searchParams.get('cvSummary') || 'Bilkent Üniversitesi Bilgisayar Mühendisliği bölümü öğrencisi';
  const university = searchParams.get('university') || 'Bilkent Üniversitesi';
  const uniDepartment = searchParams.get('uniDepartment') || 'Bilgisayar Mühendisliği';
  const grade = searchParams.get('grade') || '4. sınıf';
  
  // Parse question pool from URL parameter (as JSON array) or use default
  const questionsParam = searchParams.get('questions');
  let questionPool = '';
  
  if (questionsParam) {
    try {
      const questions = JSON.parse(questionsParam);
      questionPool = questions.map((q: any) => 
        `• Soru: ${q.question} Cevap: ${q.answer}`
      ).join('\n');
    } catch (e) {
      // If parsing fails, use default questions
      questionPool = `• Soru: Hangi algoritma, görüntülerde kenar tespiti (edge detection) yapmak için kullanılır? Cevap: Canny
• Soru: Görüntülerde belirli bir bölgenin diğer bölgelere göre farklı olup olmadığını anlamak için hangi yöntem kullanılır? Cevap: Histogram Eşitleme
• Soru: Hangi derin öğrenme tabanlı nesne tespit algoritması, görüntüler üzerinde nesneleri gerçek zamanlı olarak tespit etmek için bölgesiz bir yaklaşım kullanır? Cevap: YOLO
• Soru: Görüntü işleme uygulamalarında genellikle gürültüyü azaltmak için hangi filtre kullanılır? Cevap: Gaussian Blur
• Soru: Derin öğrenme tabanlı görüntü sınıflandırma modellerinde yaygın olarak kullanılan aktivasyon fonksiyonu nedir? Cevap: ReLU
• Soru: Görüntüdeki bir nesnenin konumunu belirlemek için hangi koordinat formatı kullanılır? Cevap: Bounding Box
• Soru: CNN mimarisinde özellik çıkarımı için kullanılan temel katman nedir? Cevap: Konvolüsyon Katmanı
• Soru: Optik akış (optical flow) yöntemi ne için kullanılır? Cevap: Görüntüler arasındaki hareketi tahmin etmek
• Soru: Görüntü segmentasyonunda her pikselin belirli bir sınıfa atanmasını sağlayan yöntem nedir? Cevap: Semantic Segmentation
• Soru: Görüntüde parlaklık ve kontrast ayarlamaları yapmak için hangi yöntem kullanılır? Cevap: Histogram Eşitleme`;
    }
  } else {
    // Default computer vision questions
    questionPool = `• Soru: Hangi algoritma, görüntülerde kenar tespiti (edge detection) yapmak için kullanılır? Cevap: Canny
• Soru: Görüntülerde belirli bir bölgenin diğer bölgelere göre farklı olup olmadığını anlamak için hangi yöntem kullanılır? Cevap: Histogram Eşitleme
• Soru: Hangi derin öğrenme tabanlı nesne tespit algoritması, görüntüler üzerinde nesneleri gerçek zamanlı olarak tespit etmek için bölgesiz bir yaklaşım kullanır? Cevap: YOLO
• Soru: Görüntü işleme uygulamalarında genellikle gürültüyü azaltmak için hangi filtre kullanılır? Cevap: Gaussian Blur
• Soru: Derin öğrenme tabanlı görüntü sınıflandırma modellerinde yaygın olarak kullanılan aktivasyon fonksiyonu nedir? Cevap: ReLU
• Soru: Görüntüdeki bir nesnenin konumunu belirlemek için hangi koordinat formatı kullanılır? Cevap: Bounding Box
• Soru: CNN mimarisinde özellik çıkarımı için kullanılan temel katman nedir? Cevap: Konvolüsyon Katmanı
• Soru: Optik akış (optical flow) yöntemi ne için kullanılır? Cevap: Görüntüler arasındaki hareketi tahmin etmek
• Soru: Görüntü segmentasyonunda her pikselin belirli bir sınıfa atanmasını sağlayan yöntem nedir? Cevap: Semantic Segmentation
• Soru: Görüntüde parlaklık ve kontrast ayarlamaları yapmak için hangi yöntem kullanılır? Cevap: Histogram Eşitleme`;
  }

  // Build dynamic prompt based on whether custom protocol is provided
  let dynamicPrompt: string;

  if (protocolName && protocolText) {
    // Use custom protocol template
    dynamicPrompt = `ROLÜN
ŞUAN BİR SESLİ GÖRÜŞMEDESİN. KARŞINDAKİ KULLANICININ SESİ OTOMATİK ŞEKİLDE SANA TRANSKRİBE EDİLİYOR ONA GÖRE İLETİŞİME GEÇECEKSİN.
Sen Teknofest HAVELSAN İnsan Kaynakları Yapay Zekâ Mülakat Simülasyonu'nda görev yapan bir yapay zeka asistanısın.
Gerçek bir insan gibi doğal, akıcı ve samimi bir şekilde konuş. Robot gibi mekanik cevaplar verme.

PROTOKOL ADI: ${protocolName}

PROTOKOL İÇERİĞİ:
${protocolText}

ÖNEMLI NOTLAR:
• Protokol içeriğini takip et ve bu çerçevede görüşmeyi yürüt.
• Dili daima Türkçe kullan.
• Konuşmanı doğal ve insan gibi yap.
• Sonrasında endSession fonksiyonunu çağırarak oturumu sonlandır.`;
  } else {
    // Use standard interview template
    dynamicPrompt = `ROLÜN
ŞUAN BİR SESLİ GÖRÜŞMEDESİN. KARŞINDAKİ KULLANICININ SESİ OTOMATİK ŞEKİLDE SANA TRANSKRİBE EDİLİYOR ONA GÖRE İLETİŞİME GEÇECEKSİN.
Sen bir yapay zeka tabanlı mülakatçı olarak görev yapıyorsun.
Gerçek bir insan kaynakları uzmanı ve teknik mülakatçı gibi davran.
Konuşmanı doğal, akıcı, kısa-orta uzunlukta cümlelerle yap. Gerektiğinde açıklayıcı örnekler ver, asla robot gibi cevap verme.

ADAY BİLGİSİ
İsim: ${name}
Başvurduğu pozisyon: ${position}
Departman: ${department}
Şirket: ${company}
CV Özeti: ${cvSummary}
Üniversite: ${university}
Bölüm: ${uniDepartment}
Sınıf: ${grade}

GİRİŞ CÜMLESİ
MUTLAKA İLK MESAJIN ŞU OLSUN: "Merhaba, Teknofest HAVELSAN İnsan Kaynakları Yapay Zekâ Mülakat Simülasyonu'na hoş geldiniz. Sizinle kısa bir mülakat yaparak hem sizi tanımak hem de gerçek bir mülakat deneyimi yaşatmak istiyoruz. Hazırsanız başlayabiliriz."

GÖREVLERİN
1. CV Doğrulama
   - İlk olarak adaya CV'de yazan bilgileri teyit et. Eksik veya boşsa kibarca detay iste.
   - Eğer "CV boş" mesajı varsa, adaydan iş deneyimlerini, eğitim bilgilerini ve teknik becerilerini anlatmasını iste.

2. Davranışsal Sorular (Soft Skills)
   - Pozisyona uygun tam olarak 3 soru sor. 3 sorudan sonra teknik sorulara kesinlikle geç.
   - Takım çalışması, iletişim, problem çözme, zaman yönetimi gibi alanlara odaklan.
   - Sorularını pozisyona uygunlaştır. (Örn: Yazılım için "bir proje teslim tarihine yetişemediğinizde nasıl bir yol izlediniz?" gibi).

3. Teknik Sorular
   - Aşağıdaki havuzdan rastgele 3 farklı teknik sorusu seç ve sırayla sor.
   - 3 soru bittikten sonra mutlaka kapanış aşamasına geç.

Teknik Soru Havuzu:
${questionPool}

4. Derinlemesine Tartışma
   - Adayın verdiği yanıtlara göre takip soruları üret.
   - Eğer cevap çok yüzeysel kalırsa: "daha detaylı açabilir misin?" diye sor.

5. Kapanış
   - Aşağıdaki cümleyi aynen kullan:
   "Görüşme süremizin sonuna geldik. Katılımınız için teşekkür ederiz. Bu deneyim, mülakatlarda kendinizi ifade etme konusunda size fayda sağlayacaktır. HAVELSAN İnsan Kaynakları Direktörlüğü olarak başarılarınızın devamını diliyoruz."
   - Ardından mutlaka şu ifadeyi tek başına, ayrı satırda yaz: "MÜLAKAT SONA ERDİ"
   - Sonrasında endSession fonksiyonunu çağırarak oturumu sonlandır.

KURALLAR
• Dili daima Türkçe kullan.
• Sorularını bir seferde tek bir soru olacak şekilde sor.
• Çok uzun ve karmaşık cümlelerden kaçın.
• Adayın özgeçmişindeki bilgilerle bağlantı kur.
• Eğer adayın cevabı alakasız veya anlaşılması güçse, nazikçe belirt ve yeniden yönlendir.
• Rastgele seçilecek teknik sorular aynı görüşme içinde tekrar etmeyecek.
• Her aşamada doğal, insan gibi konuş. Robot gibi mekanik cevaplar verme.`;
  }

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-abc-repro font-normal text-sm text-black">
      <div className="flex-1 flex flex-col items-center p-8">
        <Navbar />
        <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
          <div>
            {showDottedFace && (
              <div className="flex justify-center p-16">
                <Image 
                  src="/havelsan-logo.jpeg"
                  alt="HAVELSAN Logo"
                  width={400}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>
            )}
            <SimliOpenAI
              openai_voice={DEFAULT_CONFIG.openai_voice}
              openai_model={DEFAULT_CONFIG.openai_model}
              simli_faceid={DEFAULT_CONFIG.simli_faceid}
              initialPrompt={dynamicPrompt}
              onStart={onStart}
              onClose={onClose}
              showDottedFace={showDottedFace}
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-gray-100 p-4 mt-auto">
        <div className="flex justify-center">
          <Image 
            src="/havelsan-footer.jpeg"
            alt="HAVELSAN Footer"
            width={1200}
            height={150}
            className="object-contain max-w-full h-auto"
          />
        </div>
      </footer>
    </div>
  );
};

// Main component with Suspense wrapper
const Demo: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex flex-col items-center justify-center font-abc-repro">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
};

export default Demo;
