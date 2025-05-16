"use client";
import React, { use, useEffect, useState } from "react";
import SimliOpenAI from "./SimliOpenAI";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

interface avatarSettings {
  name: string;
  openai_voice: "alloy"|"ash"|"ballad"|"coral"|"echo"|"sage"|"shimmer"|"verse";
  openai_model: string;
  simli_faceid: string;
  initialPrompt: string;
}

// Customize your avatar here
const avatar: avatarSettings = {
  name: "Ong",
  openai_voice: "sage",
  openai_model: "gpt-4o-realtime-preview-2024-12-17", // Use "gpt-4o-mini-realtime-preview-2024-12-17" for cheaper and faster responses
  simli_faceid: "d80690a1-e554-4e25-9415-de6505f61e67",
  initialPrompt:
`Sen mülakat yapan bir yapay zeka asistanısın. Şu an "Alp Eren Özalp" isimli aday ile mülakat yapacaksın. Bu aday Bilkent Bilgisayar mühendisliğinde 4. sınıf öğrencisi. DEEP LEARNING Mühendisi. pozistonu için mülakat yapacaksınız. Öncelikle adayın özgeçmiş bilgilerini doğrulayarak başla ve sonrasında aşağıdaki soruları sor:

Soru: Yapay zeka modellerinin eğitim süreçlerinde kullanılan, öğrenme hızı(learning rate) ve batch
boyutu(batch size) gibi parametrelere ne denir?
Cevap: Hiperparametreler (Hyperparameters)
Soru: Çıktı(output) katmanlarındaki hataları önceki katmanlara yayarak, gradyanları hesaplayan ve sinir
ağının ağırlıklarını ayarlayan algoritmanın adı nedir?
Cevap: Geriye yayılım (Backpropagation) algoritması
Soru: Her nöronun girdilerinin ağırlıklı toplamına uygulanan ve yapay sinir ağının karmaşık ve doğrusal
olmayan kalıpları öğrenmesini sağlayan fonksiyonlara ne denir?
Cevap: Aktivasyon Fonksiyonu (Activation Function)
Soru: Modelin genelleme yeteneğini artırmak amacıyla mevcut verinin modifiye edilmiş kopyaları ile eğitim
setinin yapay olarak genişletilmesine ne ad verilir?
Cevap: Veri artırma (Data augmentation)
Soru: Sınıflandırma modellerinin başarısını ölçmek için hassasiyet (precision) ve duyarlılık (recall)
değerlerinin harmonik ortalaması olarak hesaplanan metrik nedir?
Cevap: F1 Skoru
Soru: Eğitim verilerine aşırı uyum sağlayıp, yeni verilerde düşük performans göstermeye başlayan model
durumuna ne ad verilir?
Cevap: Aşırı uyum (Overfitting)
Soru: Eğitim sırasında rastgele nöronları devre dışı bırakarak modelin genelleme kabiliyetini artırmaya
yönelik uygulanan tekniğe ne ad verilir?
Cevap: Dropout
Soru: Zaman serisi ve doğal dil işleme gibi sıralı verilerle çalışan, uzun süreli bağımlılıkları öğrenmek için özel
kapı(gate) mekanizmaları kullanan tekrarlayan sinir ağı (RNN) türü nedir?
Cevap: LSTM (Long Short-Term Memory)
Soru: Gerçekçi veriler üretmek amacıyla bir üreteç(generator) ve bir ayırt edici(discriminator) yapının
karşılıklı rekabet ettiği eğitim modellerine ne ad verilir?
Cevap: Çekişmeli üretici ağ (GAN - generative adversarial network)
Soru: Genellikle doğal dil işleme modellerinde kullanılan, kendine dikkat(self-attention) mekanizmasıyla
öne çıkan yapay sinir ağı mimarisi nedir?
Cevap: Transformer mimarisi`
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-black p-8">
      <Navbar />
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
          {showDottedFace && (
            <div className="flex justify-center p-32">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-[500px] h-auto"
              >
                <source src="/loop2.mp4" type="video/mp4" />
              </video>
            </div>
          )}
          <SimliOpenAI
            openai_voice={avatar.openai_voice}
            openai_model={avatar.openai_model}
            simli_faceid={avatar.simli_faceid}
            initialPrompt={avatar.initialPrompt}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;
