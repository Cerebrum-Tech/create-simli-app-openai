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
  openai_voice: "shimmer",
  openai_model: "gpt-4o-realtime-preview-2024-12-17", // Use "gpt-4o-mini-realtime-preview-2024-12-17" for cheaper and faster responses
  simli_faceid: "d80690a1-e554-4e25-9415-de6505f61e67",
  initialPrompt:
    `You are a helpful AI assistant named Cere. chat with me like a friend. give very short answers. You work for the Cerebrum Tech. Make tool calls if necessary.

    Here is the knowledge base:
    BES, SAĞLIK VE HAYAT SİGORTALARI PROSEDÜRÜ
Örnek Sorular :
Eşime ve çocuklarıma sağlık sigortası yaptırabilir miyim?
BES’e ne zaman başvurabilirim?
İşten ayrılırsam BES’im iptal olur mu?
Topluluk şirketleri arasında geçiş yaparsam sigortamı devam ettirebilir miyim?
Katkı payına nasıl karar veriliyor?
KAPSAM
Bu prosedür, toplu iş sözleşmesi kapsamı dışında kalan ve belirsiz süreli iş sözleşmesi ile görev yapan
beyaz yakalı çalışanları kapsar.
SORUMLULUK
Bu prosedürün güncellenmesinden Şirket İnsan Kaynakları Fonksiyonu sorumludur.
PERİYOD
Bu prosedür, Holding’den gelecek düzenlemeler çerçevesinde ve Şirket tarafından uygulanması sırasında
ortaya çıkan ihtiyaçlar dahilinde güncellenir.
Genel Esaslar
BES kurum katkısı, sağlık sigortası ve hayat sigortası uygulaması, prosedürün “Kapsam” bölümünde
belirtilen tüm çalışanlar için geçerlidir. Uzman ve üzeri pozisyonlarda çalışanlara tüm bu yan menfaatlerin
sağlanması zorunludur. Diğer pozisyonlarda çalışanlar için, kademe bazında olmak şartıyla seçici uygulama
yapılabilir.
Belirli süreli iş sözleşmesi ile görev yapan beyaz yakalı çalışanlara sağlık ve/veya hayat sigortası sağlanıp
sağlanmayacağı, bu prosedürdeki prensipler çerçevesinde, şirketin inisiyatifindedir.
Çalışanlar, ödenen BES katkı payları ile sağlık ve hayat sigortası primlerine ilişkin vergi matrahı indirim
hakkından öncelikle işverenin yararlanacağını kabul eder. Artan vergi indirim tutarı olması halinde, çalışan
bu tutardan kendisi için yararlanır.
Bireysel Emeklilik Sistemi
Çalışma Süresi
Çalışanların emeklilik dönemlerinde yaşam standartlarının korunması için Bireysel Emeklilik Sistemi’ne
katılımlarını teşvik amacıyla kurum katkısı yapılır. 6 aylık çalışma süresini dolduran çalışanlar sisteme dahil
olma hakkını kazanır. Bu sürenin hesabında Topluluk şirketlerinde geçen süreler de göz önündebulundurulur.
1 Ocak 2010 tarihinden sonra Toplulukta görev yapmaya başlayan çalışanların BES sözleşmeleri, detayları
hakediş (vesting) sistemine göre düzenlenir. Bu tarihten önce Topluluk’ ta görev yapmaya başlayan ve
halihazırda BES sisteminde olan çalışanların mevcut sözleşmeleri devam edecektir. Ayrıca bu tarihten
önce Topluluk’ ta görev yapmaya başlamakla birlikte 1 Ocak 2010’dan sonra ilk kez BES sistemine dahil
olan çalışanların BES sözleşmeleri de hakediş sistemi olmaksızın
düzenlenecektir.
Topluluk şirketlerinden askerlik nedeniyle ayrılan bir çalışan tekrar işe başladığında BES kurum katkısı işe
giriş tarihinden itibaren tekrar başlar. Askerlik harici bir nedenle iş sözleşmesi sona eren bir çalışan tekrar
işe başladığında ise, BES kurum katkısından yararlanması için ise yeniden 6 aylık çalışma süresini
doldurması gerekmektedir. Ayrıca askerlik harici bir nedenle iş sözleşmesi sona erip tekrar işe başlayan
çalışanların yeni BES sözleşmeleri, detayları hakediş sistemine göre
düzenlenecektir.
İşe giriş tarihinin ayın 5’inden sonra olması durumunda; çalışan, BES kurum katkısından, 6 aylık çalışma
süresini doldurduğu tarihi takip eden aydan itibaren yararlanabilecektir.
Kurum Katkısı
Bireysel emeklilik sistemi gönüllü katılıma dayalı olduğu için, işveren sadece sisteme dahil
olmak isteyen çalışanlar için kurum katkısı öder. Kurum katkısının başlayabilmesi için çalışanın İnsan
Kaynakları’ ndan talep ederek kendisinin doldurduğu bireysel emeklilik başvuru formunu ve kurum
excelini tekrar İnsan Kaynakları Fonksiyonu’ na iletmesi gereklidir.
Kurum katkısı aylık brüt ücretin %3'ü kadardır, ancak bu tutar devletin belirlediği vergi matrahından
indirim sınırını aşamaz (bu sınır şu anda aylık asgari ücret tutarı kadardır). Sisteme dahil olmak isteyen bir
çalışan, aylık brüt ücretin %3’ü kadar veya altında katkıda bulunmak istemesi halinde işveren de ilgili tutar
kadar katkıda bulunur.
Çalışan isterse taahhüt ettiği tutarın (%3) üzerinde de katkıda bulunabilir. Ancak her durumda kurum
katkısı %3 ile sınırlıdır.
İşveren, sadece aylık brüt ücret (yıllık 12 maaş) için katkı payı öder. Bunun dışında kalan ödemeler
(ikramiye vb.) için kurum katkısı ödenmez.
Çalışan, belirli koşulları sağlayarak Bireysel Emeklilik Sisteminden ayrılabilir. Bu durumda;
• Çalışanın, söz konusu talebini, bireysel emeklilik sözleşmesinin bulunduğu emeklilik
şirketine doğrudan iletmesi gereklidir.
• Çalışanın ayrılma talebi ilgili ayın sonu itibarıyla işleme alınır ve kurum katkısı sonlandırılır.Sistemden ayrılan bir çalışan, sisteme tekrar dahil olabilir ancak kurum katkısının tekrar
başlaması, sadece bir kereye mahsustur. Kurum katkısının tekrar başlaması için, sistemden çıkış tarihinden
itibaren 6 aylık çalışma süresinin yeniden tamamlanması gerekir. Ayrıca çalışanla yapılacak yeni BES
sözleşmesi, detayları 7.2.2.9 no.lu maddede yer alan hakediş sistemine göre düzenlenir. Çalışan, kurum
katkısından tekrar yararlanmaya başlama talebini de 6 aylık süre tamamlandığında kendisinin doldurduğu
bireysel emeklilik başvuru formu ve kurum exceli aracılığıyla İnsan Kaynakları Fonksiyonu’ na
bildirmelidir.
Ücretsiz izin alan bir çalışan için işveren, ücretsiz izinde olduğu süre boyunca kurum katkısına
ara verir. Ay içinde ücretsiz izne ayrılan ve/veya ücretsiz izinden dönen çalışan için işveren o ay çalışılan
gün kadar katkı payı öder.
Sistem dışında geçirilen süreler, emekliliğe hak kazanmak için gereken 10 yıllık sürenin hesaplanmasında
dikkate alınmayacaktır.
Hakediş (vesting) sistemi esasları aşağıdaki gibidir:
Sistemde Geçirilen Süre
1 yıldan az
1-2 yıl arası (1 yıl dahil)
2-3 yıl arası (2 yıl dahil)
3 yıl ve daha fazla
Hak Edilecek Kurum Katkısı Oranı
0%
25%
50%
100%
Hakediş süresini tamamlamadan Topluluk şirketlerinden askerlik nedeniyle ayrılan bir çalışan tekrar işe
başladığında, hakediş süresi kaldığı yerden devam eder.
Bireysel Emeklilik Şirketi
Kurum katkısı sadece Şirketin belirleyeceği bireysel emeklilik şirketi ile yapılan sözleşmeler için geçerlidir.
Çalışanın Bireysel Emeklilik hesabını başka bir Bireysel Emeklilik şirketine aktarması halinde kurum
katkısı sonlandırılır. Çalışanlardan Bireysel Emeklilik Sistemine giriş aidatı alınmaz ve yönetim gideri
kesintisi yapılmaz. Bu prosedür ve/veya şirket uygulaması kapsamında yer almadığı için kurum katkısı
yapılmayan ancak kendileri katkı payı ödemek isteyen çalışanlar da söz konusu avantajlardan
yararlanabilir.
Emekliliğe Hak Kazanma
Bireysel emeklilik sisteminde emekliliğe hak kazanma koşulları yasa ve yönetmeliklerce belirlenmiştir.
Mevcut durumda emekliliğe hak kazanmak için en az 10 yıl (120 ay) prim ödemek ve en az 56 yaşındaolmak gerekmektedir. Hak sahibine yapılacak ödemelerden gelir vergisi stopajı yapılacaktır. Stopaj nihai
vergilendirmedir. Stopaj oranları aşağıdaki tabloda belirtilmiştir:
Sistemden Çıkma Şekli
10 yıldan önce sistemden
çıkma
Vergi İstisnasıStopaj
Yok15%
10 yıl katkı payı ödemekle
birlikte, 56 yaşından önce
sistemden çıkmaYok10%
Emekliliğe Hak Kazanma (10
yıl + 56 Yaş / Ölüm ve25%5%
Personel Hareketleri
1 Ocak 2010 tarihinden önce Toplulukta görev yapmaya başlayan bir çalışan başka bir Topluluk şirketine
transfer olursa, yeni şirketindeki BES sözleşmesi hakediş sistemi olmaksızın düzenlenir. 1 Ocak 2010
tarihinden sonra toplulukta görev yapmaya başlayan bir çalışan, eski şirketinde hakediş süresini
tamamladıktan sonra başka bir Topluluk şirketine transfer olursa, yeni şirketindeki BES sözleşmesi hakediş
sistemi olmaksızın düzenlenir. Eski şirketinde hakediş süresini tamamlamadan transfer olması durumunda
ise, yeni şirketindeki BES sözleşmesi hakediş sistemine göre düzenlenir. Ancak yeni hakediş süresi, eski
şirketinde sistemde geçirdiği süre düşülerek hesaplanır. Yukarıda belirtilen durumların tamamında,
çalışanın eski şirketinde biriken kurum katkısının tamamı çalışanın BES hesabına aktarılır. Ay içerisinde
Topluluk şirketleri arasında transfer olan bir çalışanın o aya ait kurum katkısı eski ve yeni şirketlerinde
kıstelyevm olarak yatırılır. Belirli süreli iş sözleşmesi ile çalışırken, belirsiz süreli iş sözleşmesine geçen
çalışanların BES uygulamasında ilk işe giriş tarihleri dikkate alınır. Sistemdeki bir çalışanın Topluluk’ tan
ayrılması durumunda, kurum katkısı ayrılış tarihi itibarıyla sonlandırılır.Sağlık Sigortası
Planlar
Topluluk çalışanlarına sağlanacak sağlık sigortası planları aşağıdaki şekilde belirlenmiştir:
Pozisyon Grubu
Plan
Kapsam
Yurtiçi ve yurtdışında limitsiz yatarak ve
ayakta tedavi; yılda bir defa check-up hakkı
Yurtiçi ve yurtdışında limitsiz yatarak ve
ayakta tedavi; yılda bir defa check-up hakkı
Yurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
Yurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
Genel MüdürPlatinGenel Müdür YardımcısıPlatinFabrika Müdürü / DirektörPlatinGrup MüdürüAltınMüdür / MüşavirAltınYurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
Yönetici / ŞefGümüşYurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
Kıdemli Uzman / Mühendis / Uzman / Uzman Yardımcısı /
Müşteri Temsilcisi / Müşteri Sorumlusu / Sevkiyat
Sorumlusu / Liman Operasyon Amiri / Yönetici AsistanıGümüşYurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
EkoYurtiçinde belli limitler dahilinde yatarak ve
ayakta tedavi
Diğer Beyaz Yakalı Tüm Pozisyonlar
Çalışanlara sağlanan sağlık sigortası planından bağımlıları da (eş ve çocukları) yararlanabilir. Eşe ve çocuğa
yapılacak sağlık sigortasına ait prim ödemeleri çalışana aittir. Medeni durum değişikliklerinde, çalışan
evlenme tarihi itibarıyla eşini sağlık sigortası kapsamına dahil edebilir. Bu amaçla söz konusu talebini,
gerekli belgelerle birlikte, İnsan Kaynakları Fonksiyonu’ na iletmelidir.
Çalışanların yeni doğan bebekleri için sigorta taleplerini 15 gün içinde İnsan Kaynakları Fonksiyonu’ na
iletmeleri gerekmektedir. Yeni doğan bebekler doğumdan 15 gün sonra sigorta kapsamına
alınabilmektedir.
Platin grubu bağımlıları check-up hakkından faydalanamazlar.
Diğer sigorta şirketlerinden sigortası olan çalışan ve bağımlılarının Şirket’in sağladığı sağlık sigortasına
geçişinde kazanılmış hakları korunarak sigortalarının devamı sağlanacaktır.
Sağlık Sigortası Şirketi
Çalışanlara sağlanacak tüm sağlık sigortası poliçeleri Şirket’in belirleyeceği sigorta şirketinden yapılır.Sözleşmeler yıllık olarak düzenlenir ve her yıl yenilenir.
Personel Hareketleri
Bu prosedürün kapsamındaki işe yeni başlayan çalışanlara, işe giriş tarihi itibarıyla sağlık sigortası
yaptırılır.
Ancak sağlık sigortasının başlatılabilmesi için çalışanın kademe değişikliği nedeniyle farklı bir plana geçiş
yapan bir çalışan ve bağımlıları için atanma tarihi itibarıyla yeni planın şartları geçerli olur. Ay içerisinde
Topluluk şirketleri arasında transfer olan bir çalışanın o aya ait prim ödemesini eski şirketi yapar. Takip
eden aydan itibaren prim ödemelerini yeni şirketi yapmaya başlar. Topluluk’ tan ayrılan bir çalışanın (ve
varsa bağımlılarının) sağlık sigortası, ilgili ayın sonuna kadar geçerli olur. Kişi isterse, kendisi ve
bağımlılarına ait sağlık sigortasını, prim ödemelerini kendisi yapmak şartıyla, içinde bulunulan yılın
sonuna
kadar devam ettirebilir (4857 sayılı İş Kanunu’nun 25/II. maddesi uyarınca iş sözleşmesi feshedilmemiş
olmak kaydı ile).
Ücretsiz İzin
Çalışana ait sağlık sigortası, çalışanın ücretsiz izinde geçirdiği süreler boyunca da geçerlidir.
Ayrılan Grup Sağlık Sigortası
Topluluk şirketlerinden birinde çalışırken aşağıda belirtilen koşullara uygun olarak işten ayrılan veya
emekli olan ve sağlık sigortası kapsamında yer alan kişiler ve varsa bağımlıları, isterlerse
Emeklil Grup Sağlık Sigortası (Ayrılan Grup Sağlık Sigortası)” ndan faydalanabilir. Bu
haktan faydalanabilmek için;
• Topluluk şirketlerinde en az 5 yıllık kesintisiz çalışma süresini tamamlamış olmak,
• 4857 sayılı İş Kanunu’nun 25/II. maddesi uyarınca iş sözleşmesi feshedilmemiş olmak,
• Ayrıldığı tarih itibarıyla en az 1 yıl Holding Grup Sağlık Sigortası kapsamında yer
almak gerekir.
• Yukarıdaki koşulların tümünü yerine getirmek kaydıyla herhangi bir statü ve yaş sınırı
bulunmamaktadır.
Ayrılan Grup Sağlık Sigortası’nda standart bir plan söz konusudur ve tüm ayrılanlar bu plandan faydalanır.
Sadece çalışırken platin plan kapsamında olan kişilerin, Holding onayı ile, ayrıldıktan sonra da platin
planda devam etmesi mümkün olabilir.
Kişi talebini, sigortasına ara vermeksizin işten ayrılma tarihinden itibaren iki ay içerisinde Şirket’inanlaşmalı olduğu sigorta şirketine iletir. Bu şartlarla ve kesintisiz olarak bir önceki maddede belirtilen
Holding Grup Sağlık Sigortası’na eşdeğer planda devam etmesi koşulu ile kişinin kazanılmış
hakları devam edecektir.
Ayrılan Grup Sağlık Sigortası’nın yenileme tarihindeki prim hesabı, bu grubun kendi iç tazminat/prim
özelliklerine göre belirlenecektir. Bu çerçevede grubun hasar/prim ödemeleri göz önünde bulundurularak
Topluluk çalışanlarına uygulanan fiyattan farklı bir fiyat uygulanabilir. Prim ödemeleri %25 peşin+5 taksitte
bireysel olarak sağlık sigortası şirketine ödenir.
Hayat Sigortası
Planlar
Hayat sigortası teminatları maaşın katları olarak belirlenir. Şirketler, çalışanlarını kademe bazında
gruplayarak her kademe için hayat sigortası teminatına baz teşkil edecek bir maaş düzeyi belirler ve bu
düzeyleri her yıl gözden geçirir. Çalışanlara sağlanacak hayat sigortası planları pozisyonlar bazında
aşağıdaki şekilde belirlenmiştir:
Pozisyon Grubu
Plan
Kapsam
Genel MüdürPlatinVefat: 20 kat
Kazaen Vefat: +10 kat (toplam 30 kat)
Genel Müdür YardımcısıPlatinVefat: 20 kat
Kazaen Vefat: +10 kat (toplam 30 kat)
Fabrika Müdürü / DirektörPlatinKazaen maluliyet: 20 kat
Hastalık sonucu maluliyet: 20 kat
Tehlikeli hastalaıklar: 20 kat
AltınVefat: 20 kat
Kazaen vefat: +10 kat (toplam 30 kat)
Kazaen maluliyet: 20 kat
Hastalık sonucu maluliyet: 20 kat
AltınVefat: 20 kat
Kazaen vefat: +10 kat (toplam 30 kat)
Kazaen maluliyet: 20 kat
Hastalık sonucu maluliyet: 20 kat
Yönetici / ŞefGümüşVefat: 20 kat
Kazaen vefat: +10 kat (toplam 30 kat)
Kazaen maluliyet: 20 kat
Kıdemli Uzman / Uzman / Mühendis / Uzman
Yardımcısı / Sevkiyat Sorumlusu / Liman
Operasyon Amiri / Müşteri Temsilcisi / Müşteri
SorumlusuGümüşVefat: 20 kat
Kazaen vefat: +10 kat (toplam 30 kat)
Kazaen maluliyet: 20 kat
Grup Müdürü
Müdür / MüşavirDiğer Tüm Pozisyonlar*
•
Ferdi Kaza
Kazaen vefat: 30 kat
Kazaen maluliyet: 20 kat
Diğer tüm pozisyonlara Toplu İş Sözleşmesi kapsamı dışında kalan mavi yakalı pozisyonlar da
dahildir.
Hayat Sigortası Şirketi
Çalışanlara sağlanacak tüm hayat ve ferdi kaza sigortası poliçeleri Şirket’in belirleyeceği sigorta
şirketinden yapılır. Sözleşmeler yıllık olarak düzenlenir ve her yıl yenilenir.
Personel Hareketleri
İşe yeni başlayan çalışanlara, işe giriş tarihi itibarıyla hayat sigortası yaptırılır. Kademe değişikliği nedeniyle
farklı bir plana geçiş yapan bir çalışan için atanma tarihi itibarıyla yeni planın şartları geçerli olur. Ay
içerisinde Topluluk şirketleri arasında transfer olan bir çalışanın o aya ait prim ödemesini eski şirketi yapar.
Takip eden aydan itibaren prim ödemelerini yeni şirketi yapmaya başlar. Topluluk’ tan ayrılan bir çalışanın
hayat sigortası, ilgili ayın sonuna kadar geçerli olur.
Ücretsiz İzin
Çalışana ait hayat sigortası, çalışanın ücretsiz izinde geçirdiği süreler boyunca da geçerlidir.

Örnek Sorular:
•
•
•
•
•
•
•
Eğitim taleplerimi kime iletmeliyim?
Benim için bireysel eğitim talebi oluşturabilir misin? (burada task’i gerçekleştirmesini
bekliyoruz)
Eğitim sertifikamı ne yapmalıyım?
Bu yıl almam gereken eğitimleri nereden görebilirim?
Koçluk desteği alabilir miyim?
Bir üst pozisyona aday olabilmek için almam gereken eğitimleri öğrenebilir miyim?
Şirketimizde güncel olarak hangi eğitim fırsatları bulunmaktadır?
EĞİTİM PROSEDÜRÜ
KAPSAM
Bu prosedür, bu şirkette çalışan herkesi kapsar. Şirket öncelikli gelişim alanı olarak belirlenen yetkinliklere
göre planlanan “Şirket Genel Eğitimleri”; çalışanın uzmanlık alanındaki bilgi ve becerilerini geliştirmeye
yönelik işe özel eğitim, konferans, seminer vb. programlardan oluşan “Fonksiyon Eğitimleri”; çalışanın
spesifik gelişim ihtiyaçlarına yönelik gerçekleştirilen “Bireysel Gelişim” uygulama ve programları;
Oryantasyon, İş Sağlığı ve Güvenliği, Çevre ve Zorunlu İşbaşı Eğitimleri bu kapsam dahilindedir.
TANIMLAR
İnsan Kaynakları : İK İş Ortakları ve İK Uzmanları
Çalışan : Şirkette İş Sözleşmesi ile Görev Yapanlar
Eğitim : Çalışanların bilgi ve becerilerini arttıran, davranış ve tutumlarında
olumlu değişimler yapan, kişisel ve mesleki gelişimlerine katkıda bulunan sınıf içi, açık hava ya da e-
öğrenme yöntemiyle toplu veya bireysel olarak gerçekleştirilen her türlü kurs, seminer, konferans, zirve,
çalıştay, koçluk/mentorluk gibi çalışanların gelişimine yönelik eylemlerin tümü eğitim olarak adlandırılır.
SORUMLULUK
Çalışanlarımız ve bağlı oldukları yöneticileri gelişim sürecinin ilk sorumlularıdır. Sürecin planlama,
koordinasyon, yürütüm, kontrol/takip, etkinlik ölçümü ve bu prosedürün yürütme ve revizyonundan İK İş
Ortakları sorumludur.
İş sağlığı ve Güvenliği ile ilgili eğitimlerinin belirlenmesinden ve planlanmasından İş Sağlığı ve Güvenliği
Müdürlüğü sorumludur.
Çevre eğitimlerinin belirlenmesinden ve planlanmasından Hammaddeler ve Çevre Müdürlüğü
sorumludur.
Kalite Yönetim Sistemi ve Ürün Güvenliği eğitimlerinin yapılmasından Kalite Yönetim Temsilcileri
sorumludur.
Enerji Yönetim sistemi eğitimlerinin yapılmasından Enerji Yöneticileri sorumludur.Bu prosedür; İnsan Kaynakları Genel Müdür Yardımcısı tarafından onaylandığı tarih itibariyle yürürlüğe
girer.
PERİYOD
Eğitim programları yıllık hazırlanır. Bu prosedür, uygulanması sırasında ortaya çıkan ihtiyaçlar dahilinde
güncellenir.
İLGİLİ KAYNAK KAYITLAR
EN ISO 9001 Kalite Yönetim Sistemi
ISO 14001 Çevre Yönetim Sistemi
ISO 45001 İş Sağlığı ve Güvenliği Yönetim Sistemi
ISO 50001 Enerji Yönetim Sistemi
Kanuni ve Yasal Gereklilikler
Entegre Yönetim Sistemi Politikası
Prosedürler
Kalite, Çevre, İSG ve Enerji Yönetim Sistemi Dokümantasyonu
Özel İş Tanımları
İSG mevzuatı kapsamındaki kanun, yönetmelik vb.
6331 Sayılı İş Sağılığı ve Güvenliği Kanunu
Çalışanların İş Sağlığı ve Güvenliği Eğitimlerinin Usul ve Esasları Hakkındaki Yönetmelik
PROSEDÜR
Şirket Genel Eğitimleri, Bireysel Gelişim Uygulama ve Programları; Fonksiyon Eğitimleri
Eğitim ve gelişim programları;
• Organizasyonel Başarı Planı- Organizasyon ve Çalışan Gözden Geçirme Süreci bulguları ile belirlenen
şirket öncelikli gelişim alanları,
• Performans Değerlendirme çıktıları;
• Gelişim Görüşmeleri;
• Çalışan Bağlılığı Anketi,
• Kanuni Zorunluluklar,
• Teknik ve Mesleki Eğitim Matrisleri
vb. veriler ışığında, şirketin ve bireylerin gelişim ihtiyaçları göz önünde bulundurularak ihtiyaca göre
planlanır ve uygulanır. Eğitim, şirketi ve çalışanları hedeflerine ulaştıracak, çalışanın potansiyelini açığa
çıkartacak bir araç olarak değerlendirilir.Yönetim Sistemleri kapsamında eğitimler;
• Yönetim sistemlerinin performansını ve etkinliğini etkileyen kendi kontrolü altında çalışan kişi ve
kişilerin gerekli yeterliliğini belirlediği,
• Bu kişilerin eğitim, öğrenim ve tecrübelerini dikkate alarak yeterliliğini güvence altına alındığını,
• İhtiyaç duyulan yeterliliği kazanması için gerekli faaliyetleri yaptığını ve bu faaliyetlerin etkinliğinin
değerlendirildiğini tanımlar.
Mühendis, uzman ve üzeri pozisyonlarda çalışanlar için gelişim süreci Gelişim Prosedürü kapsamında
tanımlanmıştır.
Eğitim Faaliyetleri 3 farklı başlık altında gruplandırılmıştır:
Şirket Genel Eğitimleri: Şirket öncelikli gelişim alanı olarak belirlenen yetkinliklere göre planlanacak
aktivite ve eğitimler. Örneğin: Şirkete Özel Grup Eğitimleri ve Programları
Şirket Genel Eğitimleri eğitimden sorumlu İK İş Ortağı tarafından Yıllık Eğitim Planı ve Raporu planlanır,
yönetilir ve bütçelenir.
Fonksiyon Eğitimleri: Çalışanın uzmanlık alanındaki bilgi ve becerilerini geliştirmeye yönelik işe özel
aktivite ve eğitimler Örneğin: Teknik ve Uzmanlık bazlı eğitimler; Kongre ve Konferanslar Fonksiyon
Eğitimleri ilgili fonksiyon tarafından Yıllık Eğitim Planı ve Raporu üzerinde planlanır ve bütçelenir.
Koordinasyon ve takip İK tarafından yapılır.
Bireysel Gelişim Eğitimleri: Bireylerin gelişim alanlarına özel planlanan aktivite ve eğitimler
Örneğin: Bireysel Eğitimler; Koçluk Uygulamaları
Bireysel Gelişim Talepleri, ilgili fonksiyon tarafından yapılır. Talepler İK İş Ortakları tarafından
değerlendirilerek (uygunluğuna bağlı olarak) Yıllık Eğitim Planı ve Raporuna alınır.
Kapsam İçi Çalışanlar İçin Teknik Mesleki Eğitimlerin Uygulanması:
Kapsam İçi çalışanlarımızın mesleki ve teknik bilgi/beceri seviyelerinin arttırılması amacı ile Teknik Mesleki
Eğitimleri düzenlenmektedir.
Kasım-Aralık döneminde Teknik Mesleki Eğitim Koordinatörleri ile Fabrika Departmanları koordineli olarak
Kapsam İçi’ nin Kariyer yollarına göre bir sonraki yıl için Teknik Mesleki Eğitim ve Yetkinlik Matrisini
oluştururlar. Oluşturulan matris İK İş Ortakları ve eğitimi verecek çalışanlarla paylaşılır. İK İş Ortakları bir
sonraki yıl için Teknik Mesleki Eğitim ve Yetkinlik Matrisine göre departman yöneticileri ile görüşerek
Eğitim Planını oluşturur. Plan dahilinde şirket dışı firmalar ve eğitmenlerden talep edilen eğitimler olması
durumunda talep eden departman ve İK İş Ortakları ilgili eğitim organizasyonunu gerçekleştirir.
Eğitim matrislerinin belirlenmesi akabinde Teknik Mesleki Eğitim Koordinatörlerinin organizasyonunda
verilecek eğitimlerin dokümanları ve sınav soruları hazırlanır.
Eğitim tarihleri, katılımcı listeleri ve eğitimlerin sonunda yapılan sınavların puanları eğitimi veren
teknisyen/mühendis ve şefler tarafından İK İş Ortaklarına bağlı İK Uzmanı ’na iletilir. Teknik Mesleki
Eğitimler Departman yöneticileri tarafından takip edilir.Teknik Mesleki Eğitim ve Yetkinlik matrisinde mevcut pozisyon için belirlenmiş gerekli eğitimlerin her bir
kategori için an az 50 puan almış olmak şartı ile elde edilen puanların ortalaması her yıl Temmuz- Ağustos
aylarında Kapsam içi çalışanların terfileri değerlendirilirken kullanılan kriterlerden biridir.
Oryantasyon Eğitimi
İşe başlayacak yeni veya bölüm değiştiren çalışanların organizasyona ve görevlerine en kısa zamanda
uyumlarının sağlanması için Oryantasyon Prosedürü uygulanır.
İşbaşı ve İşe Başlama Eğitimi
İşbaşı Eğitimleri yeni göreve başlayan personele ya da görev değişikliği yapılan personele ilk amiri ya da
müdürü tarafından fiilen çalışmaya başlamadan önce işini yapabilmesi için gerekli temel bilgilerin verildiği
ve yönetim sistemleri hakkında genel bilgilendirme yapılan eğitimdir. İşbaşı eğitim süreleri görevin
niteliğine göre bölümler tarafından belirlenir. İşbaşı eğitimlerinin verilmesi, kayıtların İK İş ortaklarına
bağlı İK Uzmanı ‘na gönderilmesinden bölümler sorumludur. İş Başı Eğitim Katılım Formu bölüm amirleri
tarafından İK İş ortaklarına bağlı İK Uzmanı ’na verilmelidir.
İşe Başlama eğitimleri, İSG temel eğitimlerinin gerçekleştirilmesine kadar geçen sürede çalışanın tehlike
ve risklere karşı korunmasını sağlayacak nitelikte olmalı ve uygulamalı olarak verilmelidir. İşe başlama
eğitimi her çalışan için en az iki saat olarak uygulanacak olup, bu eğitimde geçen süreler temel İSG eğitim
sürelerinden sayılmayacaktır.
İş Sağlığı ve Güvenliği Eğitimleri
İş sağlığı ve güvenliği ile ilgili eğitimler “6331 sayılı İş Sağlığı ve Güvenliği Kanunu” ve aynı kanuna bağlı
“Çalışanların İş Sağlığı ve Güvenliği Eğitimlerinin Usul ve Esasları Hakkında Yönetmelik “gereklerine uygun
olarak yapılmaktadır.
Bu kapsamda eğitimler;
Yeni göreve başlayanlara işe başlarken Temel İş Sağlığı ve Güvenliği Eğitimi verilir. Eğitim talebi İSG
departmanına İK departmanı tarafından iletilir.
Sahaya çalışmak üzere gelen kişi/kişiler veya taşeron firma çalışanlarına yapılacak işlerde karşılaşılacak
sağlık ve güvenlik riskleri ile ilgili konuları ve sahadaki genel güvenlik kurallarımızı içeren
Temel İş Sağlığı ve Güvenliği Eğitimi verilir. Saatlik çalışma dahi olsa, sahamıza (Tüm Tesislerimiz) gelen kişi
/ kişiler veya taşeron firmalar, İK Departmanı tarafından İSG Departmanına yönlendirilir.
Sahaya giriş yapacak ziyaretçiler girişteki ziyaretçi kartlarını imzalayarak, mutlaka şirket Personeli
refakatinde (İSG Ziyaretçi Eğitimi aldıktan veya İSG Ziyaretçi Videosunu izledikten sonra) zorunlu kişisel
koruyucularını giyerek saha ziyaretinde bulunabileceklerdir. Üniversite veya Devlet, Kamu kuruluşları, vb.
gelen grup ziyaretçilerimizin Otobüs veya Minibüs ile yapılacak ziyaretçi saha turlarında, aynı şekilde
şirket personeli refakatinde ve araçtan inmeksizin saha turu yapılabilecektir. Ziyaretçi sahaya alınmadan
önce güvenlikteki ziyaretçi salonunda bulunan televizyondan İSG Ziyaretçi Eğitimi Videosunu izlemeden
sahaya giremez. Söz konusu video görevli güvenlik personeli tarafından izlettirilir.
İSG birimi tarafından hazırlanan İSG Ziyaretçi Eğitimi Videosunda acil durum uygulamalarımız, KKD
kullanımı ve önemi, saha içerisinde uyulması gereken İş Sağlığı ve Güvenliği kurallarımız hakkında bilgiverilmektedir. Güvenlik personeli tarafından video izlettirildikten sonra Eğitim Katılım Formu
imzalattırılarak’ İK İş Ortaklarına bağlı İK Uzmanı ’na bildirilir. Ziyaretçiler yabancı ise aynı videonun
İngilizce hali kendilerine güvenlik personeli tarafından izlettirilerek kayıt altına alınır. Teknik ziyaretçi
personele İSG birimi tarafından ihtiyaç duyulması halinde söz konusu eğitim konuları şirket İSG Kuralları
başlığı altından eğitim verilebilir. Ayrıca yabancılar için İSG biriminin uygun görmesi halinde video eğitime
ek olarak İngilizce Safety Brief for Visitors içerisindeki bilgiler ile sahaya giriş öncesi eğitim verilir.
İş kazası geçiren veya meslek hastalığına yakalanan çalışana işe başlamadan önce, söz konusu kazanın
veya meslek hastalığının sebepleri, korunma yolları ve güvenli çalışma yöntemleri ile ilgili ilave eğitim
verilir. Ayrıca, herhangi bir sebeple altı aydan fazla süreyle işten uzak kalanlara, tekrar işe başlatılmadan
önce bilgi yenileme eğitimi verilir. Eğitim talebi İSG Uzmanına İK departmanı tarafından yapılır.
Tüm çalışanlara düzenli olarak “6331 sayılı İş Sağlığı ve Güvenliği Kanunu” nda yer alan süre ve
periyotlarda ve aynı kanuna bağlı “Çalışanların İş Sağlığı ve Güvenliği Eğitimlerinin Usul ve Esasları
Hakkında Yönetmelik EK -1” konularını içeren eğitimler düzenlenmektedir. Bu eğitim süreleri ve periyotları
Yönetimin Gözden Geçirmesi toplantılarında yeniden belirlenerek min. yasal gereklilikleri sağlamak üzere
daha fazla olarak da belirlenebilir. Tüm eğitimlerini tamamlayan çalışanlara İSG Eğitim Katılım Belgesi İSG
departmanı tarafından verilir.
Haftalık olarak İSG Departmanı tarafından mail yolu ile yayınlanan konularla ilgili bölüm sorumluları
tarafından personellere Toolbox (İşbaşı eğitimleri), eğitim bültenleri verilir. Eğitim bültenleri hazırlanırken
son yaşanan kazalar, hastalıklar veya olaylar ile İSG departmanına raporlanan Tehlikeli Durum / Davranış
ve Ramakkala raporları değerlendirilir ve iyileştirmeye açık konular işlenir. Toolboxlar Bölüm
Müdürü/Yöneticisi/Mühendisi/Tekniker veya Teknisyeni katılımıyla yapılan bir sabah toplantısında bir
çalışan veya amir tarafından çalışanlara anlatılır ve imza + fotoğraf ile kayıt altına alınır. Bu kayıtlar ilgili
ayın sonuna kadar İş Ortaklarına bağlı İK Uzmanı ’na bildirilir. İhtiyaç duyulması halinde toolbox
eğitimlerine İSG Uzmanı/ ve İşyeri Hekimi de katılabilir. Eğitimler sahanın İSG Uzmanı ve İşyeri Hekimi
tarafından verilir.
Verilen eğitim ile ilgili bilgiler Eğitim Katılım Formuna işlenir. İhtiyaç duyulması halinde eğitim katılım
formunda eğitimlerin detayları verilebilir. İş sağlığı ve güvenliği eğitimi sonrası, katılımcı tarafından Eğitim
Katılım Formu EYS-ORT-07-P01-B imzalanır ve İK İş Ortaklarına bağlı İK Uzmanı ’na gönderilerek, eğitim
kayıtlarına işlenir.
Eğitimler sonrasında Ölçme Değerlendirme amacıyla sınav yapılır. İhtiyaç duyulması halinde Eğitim öncesi
de sınav yapılarak eğitim sonrası ayrıca bir değerlendirme yapılabilir. Sınavdan 70 puanın üzerinde alanlar
başarılı kabul edilir. Daha düşük not alanlar tekrar eğitimine alınır.
Verilen İSG eğitimlere ait bilgiler personellerin İSG eğitim pasaportlarına eğitimi veren kişi tarafından
işlenir. Personel kurum dışından İSG içerikli bir eğitim almışsa aldığı eğitimi de İSG eğitim pasaportuna
işletir.
İSG Uzmanları vermiş oldukları eğitimlerle ilgili verileri İSG Müdürlüğünce belirlenmiş formatta düzenli
periyotlarla raporlayarak eğitim performansının ölçülmesini sağlarlar.
Personellere verilen tüm İSG eğitimlerinin “Yıllık İSG Eğitim Planı” na uygunluğu İSG Uzmanı tarafından
İSG Yıllık Eğitim Matrisine işlenerek takip edilir. Eğitimler sonrasında katılımcılar “İSG Akademi Eğitici
Eğitim Değerlendirme Formu” nu kullanarak verilen eğitimi ve eğitimciyi değerlendirme imkânınasahiptirler. Gerekli görüldüğü takdirde eğitimlerin sonunda çalışanlara eğitimle ilgili broşür kitapçık vb.
bilgi bukletleri verilebilir.
Çevre Eğitimleri
Çevre ile ilgili eğitimler “5491 sayılı kanun ile güncel 2872 Sayılı Çevre Kanunu” ve aynı kanuna bağlı
“Çevre Görevlisi, Çevre Yönetim Birimi ve Çevre Danışmanlık Firmaları Hakkında Yönetmelik “Madde 10
gereklerine uygun olarak yapılmaktadır. 21.11.2013 tarihli ve 28828 sayılı Resmî Gazete’ de yayımlanan ve
01.01.2014 tarihinde yürürlüğe giren Çevre Görevlisi, Çevre Yönetim Birimi ve Çevre Danışmanlık
Firmaları Hakkında Yönetmelik gereğince işletmelerde çevre mevzuatı ve çevresel konularda yapılması
zorunlu eğitim programları aşağıdaki konu başlıkları dikkate alınarak hazırlanır ve düzenlenir.
1- “Çevre” kavramı,
2- Çevre kirliliği ve sonuçları,
2.1 Hava kirliliği ve kontrolü
2.2 İklim değişikliği,
2.3 Gürültü kirliliği ve kontrolü
2.4 Su kirliliği ve kontrolü,
2.6 Toprak kirliliği ve kontrolü
2.6 Atık yönetimi- Genel (tehlikeli, tehlikesiz, evsel, özel vb.)
2.6.1 Atık kodları
2.6.2 Kaynağında ayrı toplama
2.6.3 Geçici depolama
3- İşletme atık yönetimi (İşletmenin rutin faaliyetlerinden ve proseslerinden kaynaklanan atıklar üzerinde
işletmeye özel bilgiler verilir).
4- Çevre mevzuatı kapsamında yükümlülükler (İşletme yetkilileri için düzenlenecek eğitimlerde dikkate
alınır).
5- Çevre mevzuatı kapsamında idari yaptırımlar (İşletme yetkilileri için düzenlenecek eğitimlerde dikkate
alınır).
Çevre Eğitimleri Beyaz Yaka ve Mavi Yaka eğitimleri olarak gerçekleştirilir. Beyaz Yaka için hazırlanan
Eğitim formatında Çevre Bakanlığı tarafından belirlenmiş, Çevre Mevzuatı kapsamındaki konular da dahil
edilir.
Tüm Beyaz ve Mavi Yaka çalışanları yılda en az 1 defa olmak üzere Çevre Eğitimlerine katılmakla
mükelleftirler. Eğitimler işletmeden sorumlu Çevre Mühendisi/Çevre Görevlisi tarafından verilir.
7.5.3. Verilen eğitim ile ilgili bilgiler Çevre Bakanlığınca belirlenmiş formatta Çevre Eğitim Katılım Formuna
işlenir. Eğitim katılım formunda eğitimlerin detayları verilebilir. Çevre eğitimi sonrasında katılımcı
tarafından Eğitim Katılım Formu imzalanır ve İK İş Ortakları’ na bağlı İK Uzmanları’ na gönderilerek, eğitimkayıtlarına işlenir. Eğitimleri sonrasında Ölçme Değerlendirme amacıyla sınav yapılır. Sınavdan 70 puanın
üzerinde alanlar başarılı kabul edilir. Daha düşük not alanlar tekrar eğitimine alınır. Gerekli görüldüğü
takdirde eğitimlerin sonunda çalışanlara eğitimle ilgili broşür kitapçık vb. bilgi bukletleri verilebilir.
Personellere verilen tüm Çevre Eğitimlerinde katılımcılar Çevre Mühendisi tarafından Çevre Eğitim
Matrisine eğitim aldığı tarih girilerek takip edilir.
Çevre Mühendisi/Çevre Görevlisi ilave olarak özel ve ayrıntılı hususlarda Toolbox Eğitimleri hazırlayabilir
ve ilgili bölümlere elektronik ortamda iletir. Çevresel Konularda hazırlanacak Toolbox Eğitim konuları
işletmeye özel eğitim ihtiyaçları göz önünde bulundurularak Çevre Mühendisi tarafından hazırlanır.
Toolbox eğitimleri Çevre Mühendisi/Çevre Görevlisi veya ilgili departmanın amiri tarafından verilir.
Sürdürülebilirlik Eğitimi
Şirket vizyonu ve stratejisi ile uyumlu olarak sürdürülebilirliği bir iş modeli olarak almaktadır.
Sürdürülebilirlik hedeflerine ulaşmak ve sürdürülebilirlik yönetiminin etkin işlemesi amacı ile şirket içi
sürdürülebilirlik eğitimleri verilmektedir.
Eğitimlerin temel amacı şirket çalışanlarının sürdürülebilirlik konusunda farkındalıklarını artırmaktır.
Sürdürülebilirlik eğitimi "Sürdürülebilirlik ve Çevre Mühendisi” tarafından verilmektedir.
Eğitim hem beyaz yaka hem mavi yaka çalışanlara verilmektedir.
Eğitim içeriği;
• Sürdürülebilirlik temel kavramının anlatılması,
• Dünya ve Türkiye genelinde çevresel, sosyal ve ekonomik boyutların paylaşımı,
o İklim değişikliği,
o Doğal kaynak kullanımı,
o Sürdürülebilir Kalkınma Hedefleri,
o Uluslararası anlaşmalar
o Sürdürülebilirlik trendleri
o Yenilenebilir enerji
o Raporlamalar
• Şirket Sürdürülebilirlik yönetimi ve iyi uygulama paylaşımı
• Farkındalık artırıcı soru-cevap bölümü
Sürdürülebilirlik eğitimi sonrasında katılımcı tarafından Eğitim Katılım Formu imzalanır ve İK İş Ortakları’
na bağlı İK Uzmanı’ na gönderilerek, eğitim kayıtlarına işlenir.Rekabete Uyum Eğitimi
4054 sayılı Rekabetin korunması Hakkındaki Kanun’da şirketin rekabet hassas birimlerinin (finans, satış,
pazarlama, satın alma vb.) bilgilendirilmesi ve sürekli izlenmesi yıllık periyotlarla sağlanmaktadır. Bu
kapsamda belirlenen beyaz yaka çalışanlara her yıl ilgili eğitim verilir. Söz konusu eğitimlere katılması
gereken çalışanların kademelerini, seviyelerini ve birimlerini/departmanlarını eğitimi sağlayan Hukuk
departmanı belirler ve İK İş Ortakları bu kapsamda eğitim organizasyonunu gerçekleştirir.
Eğitim sonrası eğitimi sağlayan Hukuk departmanı Eğitim katılım Formunu eğitim sonunda ilgili İK İş
Ortağının eğitim kayıtlarından sorumlu İK Uzmanı ’na iletir.
Eğitim sonunda “Rekabet Kuralları Uyum Beyanı” ve “Rekabet Hukuku Uyum Kuralları” formları çalışan
tarafından imzalanır ve eğitimi gerçekleştiren Hukuk departman tarafından özlük dosyalarında saklanmak
üzere İK İş Ortakları ‘na iletilir.
Eğitim Organizasyonu
Yıllık eğitim planı ve şirket eğitim bütçesi, İK İş Ortakları tarafından hazırlanır.
Hazırlanan eğitim planı ve bütçesi Üst Yönetim onayına sunulur. Plan ve bütçe dışı eğitim talepleri İK İş
Ortakları tarafından ihtiyaç ve şirket genel eğitim bütçesinin durumu göz önüne alınarak onaylanır veya
reddedilir. Bölüm bütçesinde eğitim dışında yeterli kaynak varsa İK İş Ortakları ve fonksiyon yöneticisinin
onayı alınarak eğitim gerçekleştirilir.
Dış kuruluşlardan alınacak eğitim ile ilgili kişi / kuruluşlar ve eğiticilerin seçimi İK İş Ortakları ve ilgili
departman tarafından belirlenir. Eğitim yapılacak yer, grup büyüklüğüne ve amaca uygun olarak seçilir.
Eğitim yeri ve eğitici belirlendikten sonra, eğitimin içeriği ve diğer bilgiler katılımcılara bildirilir.
Sorumluluklar
Yönetici,
• Bölüm/Departman öncelikli gelişim alanlarının şirket hedefleri ve stratejisine paralel olarak çalışanlarla
birlikte belirlenmesinden ve bu öncelikler doğrultusunda çalışanların kişisel ve mesleki gelişimine yönelik
gelişim planlarının çalışanlar ile birlikte hazırlanmasından sorumludur.
• Eğitim öncesi çalışanın gelişimi ile ilgili beklentilerin çalışanla paylaşılması ve eğitim sonrasında da
çalışanın eğitimden kazanımlarının uygulamaya dönüşmesinin takibi yönetici tarafından gerçekleştirilir.
• Çalışanların katıldığı eğitimlerden edindiği bilgi ve tecrübeyi diğer çalışanlar ile paylaşacağı fırsat ve
ortamların yaratılması yönetici sorumluluğunda olup çalışanın eğitimden aldığı bilgi ve beceriyi
özümsemesi ve bilginin kurum içerisinde yayılması açısından bu konuda çalışanların teşvik edilmesi kritik
önem taşımaktadır.
• Çalışanın eğitime zamanında katılımının sağlanması ve eğitimde verimli bir süre geçirebilmesi için
çalışanın iş yükü ve sorumluluklarıyla ilgili geçici düzenlemelerin yapılması yönetici sorumluluğundadır.
• Departman içinde yapılacak herhangi bir eğitim faaliyetinin bağlı olduğu İK İş Ortağına bağlı İK
Uzmanı ’na planlama aşamasında bildirilmesi ve “Eğitim Katılım Formu” nu imzalatılarak İK İş Ortağına
bağlı İK Uzmanı ile paylaşılması gerekmektedir.Çalışan,
• Kişisel ve mesleki gelişimine yönelik eğitim ihtiyaçlarını yöneticisiyle birlikte belirlemekten ve gelişim
planını yıl boyunca takip ederek gerekli durumlarda yöneticiyle konuşarak revize etmekten sorumludur.
• Eğitimlere belirlenen gün ve saatte zamanında ve devamlı ve etkin olarak katılması beklenmektedir.
• Zorunlu teknik eğitimler alındığında sertifika, katılım belgesi, vb. evrakların bir kopyasının saklanmak
üzere İK İş Ortaklarına bağlı İK Uzmanlarına verilmesi öncelikle çalışanın sonrasında ilgili yöneticinin
sorumluluğundadır
• Katıldığı eğitimlerden edindiği bilgi ve tecrübenin diğer çalışanlar ile paylaşılması çalışanın ve kurumun
gelişimine önemli katlı sağlayacağından çalışanın gerekli paylaşımları yöneticisinin bilgisi dahilinde
gerçekleştirmesi beklenmektedir.
İnsan Kaynakları,
• Hazırlanan Yıllık Eğitim Planının İcra Komitesine sunulması İK İş Ortaklarının sorumluluğundadır.
• Onaylanan Yıllık Eğitim Planı Doğrultusunda, şirket eğitim bütçesinin yapılması ve takibi, eğitim
önceliklerinin tespiti, koordine edilmesi, yürütülmesi, kayıtların tutularak takip edilmesi, raporlanması,
eğitim firmalarının değerlendirilmesi ve eğitimlerin etkinliğinin ölçülmesi İK İş
Ortaklarına bağlı İK Uzmanlarının sorumluluğundadır.
• Eğitim planlarını yayınlanması ve taleplerin toplanması İK İş Ortakları tarafından gerçekleştirilir.
• Bölümlerden talep geldiğinde gereken danışmanlık ve destek hizmetlerinin verilmesi iş ortağı
yaklaşımının önemli bir göstergesi ve sorumluluğudur.
• Şirket stratejileri ve öncelikli hedefleri doğrultusunda özel eğitim programları tasarlanır ve hayata
geçirilir.
Tedarikçi Belirleme
• Kurum dışından alınacak şirket genel eğitimlerinde ve bireysel gelişim eğitimlerinde satın alma talebi İK
İş Ortakları tarafından fonksiyonel eğitimlerde satın alma talebi ilgili bölüm tarafından oluşturulur.
• Fonksiyonel eğitimlerde eğitim firması ve eğitmenin belirlenmesi İK İş Ortaklarını bağlı İK Uzmanıonayı
ve bilgisi dâhilinde gerçekleştirilir.
• Dış kuruluşlardan alınacak grup eğitimlerinde eğitim firmasının ve eğitmenin performansı hakkında
daha önce eğitim almış kişi ve kuruluşlardan referans istenir.
Eğitim ve Tedarikçinin Değerlendirilmesi
Şirket dışından alınan eğitim hizmetlerinde eğitimin verimliliği, malzeme ve gereçlerin yeterliliği, eğitmen
hakkında bilgiler, eğitimin yeri ve süresini kapsayan “Eğitim Değerlendirme Formu”, İK İş Ortağına bağlı İK
Uzmanı tarafından katılımcılarla paylaşılır. 6 saati geçen Mesleki, İSG ve Çevre eğitimlerinin etkinlik
değerlendirmesi gerekli görülürse bölümler tarafından yapılır ve saklanır. Eğitim Değerlendirme Formu
dışarıdan alınan 8 saat ve üzeri tüm eğitimlerde eğitim sahibi departman tarafından uygulanıp İK İş
Ortağına bağlı İK Uzmanı’ na iletilir.Sınavlı olarak gerçekleşen eğitimlerde (mesleki yeterlilik eğitimleri, ilk yardım eğitimleri vs.) ve
sertifikasyonu yapılan, fonksiyonel, kişisel gelişim ve liderler için alınan gelişim eğitimlerinde eğitim
etkinliği değerlendirme formunun doldurulmasına gerek yoktur.
Anketler 5 tavan puanı üzerinden değerlendirilir.
Eğitim & Eğitim Gereçleri Puanı
0 - 1,9
2 - 3,4
3,5 ve üzeri
Eğitim tekrar edilir.
Tekrarı olacak bir eğitim ise düzeltici faaliyet başlatılır.
Eğitim başarılı kabul edilir.
Eğitmen Puanı
0 - 1,9
2 - 3,4
3,5 ve üzeri
Eğitmen ile tekrar çalışılmaz.
Eğitmen gelişim sağladığında tekrar çalışılır.
Eğitmen başarılı kabul edilir.
Eğitim Etkinliğinin Değerlendirmesi
Kapsam içi personelin gerçekleşen eğitimlerinin etkinliğini değerlendirmek için, personelin yıl içerisinde
almış olduğu eğitimlerin listesi ve Eğitim Etkinliği Değerlendirme Formu İK İş Ortağına bağlı İK Uzmanı
tarafından bağlı olduğu yöneticisine ilgili yılın sonunda tüm eğitim kayıtları girildikten sonra gönderilir.
Ürün Kalitesini, İş güvenliğini etkileyen eğitimler ve dışarıdan alınan eğitimlerin sınavsız olanları için; iş
kazasının yaşanıp yaşanmadığı, saha kontrolleri sonucu (apek, davranış odaklı denetleme) uygunsuzluk
olup olmadığı, gibi durumlar göz önünde bulundurularak yönetici 6 aylık değerlendirme yapabilir.
Departman Yöneticisi bu form üzerinde her eğitim için gelişim durumunu belirler.
İmzalı bir şekilde formu İK İş Ortağına bağlı İK Uzmanı arşivlenmek üzere gönderir. Departman Yöneticisi,
Eğitim Etkinliği Değerlendirme Formunu bir sonraki senenin eğitim planlarını oluştururken kaynak olarak
kullanır.
Eğitimin hedeflenen bilgi, beceri ve yetkinlikleri geliştirdiğinin tespiti için Eğitim Etkinliği Değerlendirme
Formu dışında aşağıdaki araçlar kullanılmaktadır.
• Ön test ve son testler
• Sınavlar
• Sertifikasyon
• Eğitim Değerlendirme FormlarıEğitim Sertifikası
Zorunlu teknik eğitimler alındığında sertifika, katılım belgesi, vb. evrakların bir kopyasının saklanmak
üzere İK İş Ortağına bağlı İK Uzmanı ’na verilmesi ilk önce çalışanın ardından ilgili yöneticinin
sorumluluğundadır.
Eğitim Kaydı
Yönetim Sistemleri için uygun dokümante edilmiş bilginin yeterliliğinin kanıtı olarak muhafaza edilir.
Eğitim kayıtları İK İş Ortağına bağlı İK Uzmanı tarafından sisteme girilir.
Sorular
•
•
Seyahat emri nasıl oluşturabilirim?
Seyahat emri oluşturabilir misin?
SEYAHAT PROSEDÜRÜ
Bu prosedür çalışanların yurt dışında ve yurt içinde (şehir içinde ve şehirlerarası) yapacakları iş
seyahatlerinde uyulması gereken kuralları, seyahat harcamalarının kapsamını, harcamalar için
uygulanacak limitleri ve yapılacak ödemelerin esaslarını düzenlemek amacıyla hazırlanmıştır.
- İş Seyahati: İş amaçlı, esas iş yeri dışındaki lokasyonlara / bölgelere görevlendirme ile yapılan tüm
seyahatleri kapsar.
- Seyahat Limiti: yurt dışında konaklama ve yemek, yurt içinde ise yemek harcamalarını karşılamak üzere
belirtilmiş olan günlük harcama limitleridir.
- Diğer Görevler: Mavi yaka ve mavi yaka olmayıp idari görevde bulunan güvenlik görevlisi, teknisyen,
hizmet elemanı vb. pozisyonlarda görevli tüm çalışanlardır.
- Belge: Harcama tutarını gösteren resmi yazıdır.
- İK-Portal: http://futuriseprogram.com linki üzerinden ulaşılan çalışan bilgi yönetimi sistemidir.
PROSEDÜR
Seyahate Çıkmadan Önce Yapılacaklar:
Seyahate çıkacak çalışan, gidilecek yer, seyahat nedeni, muhtemel seyahat süresi ve seyahat avansını
belirtecek şekilde İK-Portal uygulaması üzerinden “Seyahat Emri” oluşturmalıdır. Yurt içi ve yurt dışı
seyahatlerde verilecek seyahat avansı miktarı, seyahat şartları da dikkate alınarak 7.8.1. ve 7.8.2.
maddelerinde yer alan yetkililerce belirlenerek onaylanır. Yurt dışı seyahat avansları, 7.8. maddesinde
belirtilen limitlerde Euro karşılığı Türk Lirası olarak, TCMB efektif satış kuru esas alınarak ya da limitler
dahilinde yabancı para birimi olarak ödenebilir.
7.2. Seyahat Yönetimi ve Planlama:
İş seyahati yapan astları olan yönetici;
• İş yolculuğu sırasında araç kullanıp kullanmamak gerektiğini sorgulamakla
• Riski makul seviyede azaltmak amacıyla ulaşım yöntemini ya da çeşidini (hava, kara, tren ya da deniz
yolu) sorgulamakla yükümlüdürler.
Seyahat süresince olası değişiklikler ilgili yöneticilere bildirilmelidir.
7.3. Seyahat İptal, Değişiklik ve Acil Seyahatler:
• Yapılan mevcut rezervasyonların iptal ve değişiklik durumlarında bağlı bulunan yönetici
bilgilendirilmelidir.
• Çalışma saatleri dışında ve hafta sonları oluşan acil talepler, değişiklikler için ilgili çalışan tarafından
anlaşmalı acente/otel ile direkt iletişime geçilmelidir.
7.4. Ulaşım Aracı:• Seyahat sırasında seyahat edilecek lokasyon göz önünde bulundurularak seyahat güvenliği açısından en
uygun ve en ekonomik olacak ulaşım araçları seçilir.
• Seyahat, iki mahal arasında en az masrafı gerektiren araç ve güzergâh ile yapılır. Diğer görevlerdeki
çalışanların ulaşım aracı, bağlı bulundukları yönetici tarafından belirlenir. Diğer tüm çalışanlar, işin gereği
seyahat edecekleri aracı kendileri seçerler.
• Ulaşım ile ilgili yapılacak her türlü uçak bileti alımı, araç kiralama ve hızlı tren işlemleri anlaşmalı
acenteler üzerinden yapılır. Uçak ile yapılacak yurtiçi / yurtdışı seyahatlerde aşağıda belirtilen uçuş
sınıfları geçerlidir:
Unvan
Genel Müdür
Genel Müdür Yardımcısı, Fabrika Müdürü, Grup
Müdürü, Müdür
Diğer tüm çalışanlar
Uçuş Sınıfı
Business
Eknomoi
(5 saat ve üzeri uçuşlarda
Business)
Ekonomi
Her durumda ilgili uçuş sınıfı için mevcut en ekonomik uçuş güzergahı seçilir. Uçuş sınıfı ile ilgili
yapılabilecek istisnai uygulamalar, Şirket Genel Müdür onayına tabidir.
• Alınacak riskler değerlendirilerek Fabrika Müdürü ve üzeri yöneticilerin uçak ile seyahatlerinde, aynı
uçakta en fazla 3 çalışanın birlikte seyahat etmesi tavsiye edilir.
• Seyahat süresi içindeki ulaşım aracı giderleri ayrıca ödenir. Bu giderlerin bilet veya makbuz ile
belgelendirilmesi esastır. Şirket araçları ile yapılan seyahatler için ulaşım aracı bedeli ödenmez.
• Kendi aracı ile seyahat edenlere her km için en fazla 1.80.-TL üzerinden ödeme yapılır. Seyahatin araçla
yapılmasına ilişkin olarak bağlı olduğu yöneticisinden önceden izin alması gerekir. Şirkette seyahate
uygun bir havuz aracı bulunması durumunda öncelikle bu seçenek değerlendirilir, özel araçla seyahat
edilmez.
• İlgili km birim tutarı gerektiği durumlarda Holding tarafından gözden geçirilerek güncellenir. •
Seyahatle ilgili otopark, paralı yol, arabalı yol ve/veya köprü geçiş ücretleri de Şirket tarafından ayrıca
ödenir.
• Seyahat süresince kullanılacak ulaşım araçlarına çalışanın ihmalinden kaynaklanan bir durum sonucu
yetişememesi, seyahatin iptali durumunda bilgi verilmemesi gibi hallerde çalışan her türlü cezai durumu
ödemekle sorumlu olacaktır. Çalışandan tahsil edilememesi durumunda bordrosuna yansıtılacaktır.
Satın alınan uçak biletinde saat / gün değişiklikleri yapılması durumunda çalışanın bağlı olduğu yönetici
onayı aranır. İş seyahatleri bitiminde veya başlangıcında, iş amaçlı yapılmayan gidiş veya dönüş ulaşım
masrafının arasındaki farkı çalışandan tahsil edilir.
7.5. Konaklama:
• Konaklamalar prensip olarak anlaşmalı turizm şirketi portföyünde yer alan otellerde gerçekleştirilir.
Tüm konaklamalarda standart oda seçeneği benimsenir. Konaklama harcamalarına kahvaltı dahil edilir. •
Seyahat edilecek yerde anlaşmalı otel bulunmaması ve/veya seyahat edecek çalışanın iş ihtiyacı gereği
farklı bir otelde kalmak istemesi halinde aşağıda yer alan limitler dahilinde ve turizm şirketinin önerdiği
oteller kapsamında olmak kaydı ile konaklama yapılabilir. • Eğitim için yapılan konaklamalarda, eğitiminyapıldığı otelde, yurt dışı seyahatlerde konaklama limitleri dahilinde, yurt içinde ise anlaşmalı oteller
listesindeki emsal otel fiyatına uygunsa konaklama yapılabilir. Ancak, eğitimin yapıldığı otel civarında
anlaşmalı daha uygun fiyatlı otel olması durumunda yol masrafı ve konaklama ücreti göz önünde
bulundurularak tercih yapılır. • Fabrika Müdürü ve üzeri ünvanlı çalışanların konaklama harcamaları 7.8.
kapsamındaki limitler dahilinde “full credit” olarak, diğer unvanlardaki çalışanların ise konaklama +
kahvaltı standart olmak üzere, yine 7.8. kapsamındaki limitler dahilinde Şirket tarafından karşılanır. • 2
gece ve üzeri konaklama gerektiren seyahatlerde ütü giderleri ve 3 gece ve üzeri konaklama gerektiren
seyahatlerde kuru temizleme giderleri Şirket tarafından karşılanır. Otelde yapılan kişisel harcamalar ayrı
fatura ile çalışan tarafından ödenir. • Şirket tarafından rezervasyon yapılan otelde, çalışanın ihmalinden
kaynaklanan bir durum sonucu otelin uyguladığı “no show” ücretini çalışan ödemekle sorumludur ve
çalışandan tahsil edilememesi durumunda bordrosuna yansıtılır.
7.6. Vize İşlemleri:
Çalışanın Şirket tarafından görevlendirilmesi durumunda; • Pasaport çıkartma / yenileme / uzatma
başvuru işlemleri yasal zorunluluk nedeniyle şahsen yapılmalıdır. Pasaport ücretleri, Şirket tarafından,
Şirket’in belirleyeceği limit dahilinde karşılanabilir. • Yurtdışı seyahat öncesinde gerekli vize işlemleri ve
yurtdışı çıkış harcı ile ilgili masraflar Şirket tarafından çalışanın yöneticisinin onayına istinaden karşılanır. •
Vize başvuruları çalışan tarafından yapılır. • Vize başvuruları için gerekli tüm evrak, belge ve formların
temini ve hazırlanması sorumluluğu çalışan üzerindedir. • Vize süreleri konusunda inisiyatif tamamen
konsolosluklarda olup, Schengen vizesi alınması durumunda, vizenin alındığı ülkeye öncelikle giriş
yapılması bir sonraki olası vize başvuruları için önem arz etmektedir.
7.7. Seyahatten Döndükten Sonra Yapılacaklar:
• Çalışan, seyahat dönüşünü izleyen 5 gün içinde; seyahat lokasyonu ve gidiş-dönüş tarihini içerecek
şekilde, seyahate ilişkin masraf belgelerini ekleyerek gider bildiriminde bulunur. Bu aşamada yöneticiler
kendilerine onaya gelen masraf belgelerinin doğruluğunu ve uygunluğunu kontrol etmekten
sorumludurlar. • Finans Fonksiyonu, yapılan gider bildirimine istinaden oluşturacağı tahakkuk sonrasında
çalışanın alacağı kalmışsa ilgili çalışana öder veya tahsil eder. • Beyan edilen harcama belgelerinin yasal
olarak Şirket adına düzenlenmiş olması gerekir. • Eğer çalışan borçlu ise bakiyesi bulunan avans tutarını
en geç 1 hafta içinde Şirket banka hesabına yatırmaktan sorumludur. Finans Fonksiyonu, kendisine gelen
bilgiler doğrultusunda avans hesabını kapatır. Borçlu olunan miktarın iade edilmemesi durumunda Finans
Fonksiyonu, İnsan Kaynakları Fonksiyonunu bilgilendirir ve bakiye tutar çalışanın ilgili ay sonundaki
ücretinden mahsup edilir. • Seyahat avansının kapanmasından çalışan ve seyahati onaylayan yöneticisi,
kapanmasının kontrolünden ise Finans Fonksiyonu sorumludur.
7.8. Seyahat Limitleri:
• İl sınırları içinde ve dışında görev amaçlı seyahat yapan veya geçici görev verilen, • Yurt içinde ve yurt
dışında görev amaçlı seyahat yapan, • Eğitim, kurs, seminer, vb. toplantılara katılan çalışanların yurtdışı
ve yurtiçi seyahatlerde konaklama ve yemek giderleri için ödenecek fiili harcama limitlerini
kapsamaktadır.
7.8.1. Yurtdışı Seyahatler: • Yurtdışı seyahat limitleri için aşağıda listelenen ülkeler ve ülkelerin yer aldığı
grup dikkate alınacaktır. • Söz konusu gruplama ve grup limitleri her yıl Holding tarafından gözden
geçirilerek gerekli hallerde güncelleme yapılacaktır.ÜlkeGrup
ABD, Kanada, Uzak Doğu (Kore, Hong Kong, Singapur, Japonya), İsrail, Avusturalya,
Yeni Zelanda, Birleşik KrallıkGrup 1
İsviçre, Güney Amerika, Avrupa1 (Almanya, Fransa, Hollanda, Danimarka, Norveç,
Monako, Finlandiya, İzlanda)Grup 2
Avrupa 2 (Avrupa 1 hariç AB üyesi ülkeler), Çin, Hindistan, Pakistan, Afganistan,
İran, Irak, Suriye, Rusya, Ukranya, Belarus, Afrika ÜlkeleriGrup 3
Konaklama ve Harcama Limitleri (EUR)
Uzman ve Diğer GörevlerMüdür / Grup Müdürü / Fabrika
Müdürü / GMYGenel Müdür
Grup 1300375500
Grup 2250350450
Grup 3225300350
Grup
Ülke grupları ve unvanlara göre düzenlenmiş olan limitler Euro para birimi ile tanımlanmış olup, çalışana
harcamaları karşılığı yapılacak ödemeler, ilgili tarihteki TCMB efektif satış kuru dikkate alınarak Türk Lirası
(TL) olarak yapılacaktır. • Ülke listesi dışında bir ülkeye ziyaret edildiğinde, gidilecek yerin coğrafi
konumuna bakılarak, listedeki en yakın ülkenin limitleri geçerli sayılacaktır. • Yurtdışı seyahatler, bütçe
sınırları içinde kalmak kaydıyla Genel Müdür tarafından onaylanır. • Konaklama yapılacak otellerde,
seyahat edilen şehirdeki yüksek turistik sezon, fuar vb. zorunlu nedenlerle fiili harcama limitinin aşılması
halinde aşağıdaki onay mekanizması işletilir:
o Genel Müdür → Holding Grup Başkanı
o GM altı pozisyonlar → Genel Müdür
Grup halinde yapılan seyahatlerde, grup içindeki en üst pozisyondaki kişinin tabi olduğu fiili harcama
limiti ve uçuş sınıfı, Genel Müdür’ün onayı ile refakat eden diğer kişilere de uygulanabilir. • Ulaşım
masrafları (taksi, tren, deniz otobüsü bileti vb.) belge karşılığı ayrıca ödenir. • Yurtdışına yapılan
seyahatlerin ülke sınırına kadar olan bölümü yurtiçi seyahati sayılır.
7.8.2. Yurtiçi Seyahatler: • Tüm çalışanların yurt içi seyahatleri bağlı bulundukları yönetici tarafından
onaylanır. • Önceden izin alınması mümkün olmayan acil hallerde yöneticilere seyahat dönüşü bilgi
verilir. • Tüm çalışanların anlaşmalı otellerde konaklaması esastır. Uzman ve üzeri pozisyonlar için gerçek
beyan usulüne göre masraf ödemesi yapılır. Yemek ve diğer oluşabilecek masraflar için masraflar belge
karşılığı ve beyan usulü ödenir. • Yurt içi seyahatlerde, diğer görevler için uygulanacak yemek vb. masraf
limiti günlük 120TL olarak belirlenmiştir. • Seyahat acentesi üzerinden rezervasyon yapılan otellerde,
seyahat edilen şehirdeki yüksek turistik sezon, fuar, vb. nedenlerle normal sezon üzerinde bir fiyatlama
uygulaması halinde ilgili Fonksiyon Yöneticisinden onay alınır.7.9. Seyahatlerde Gün Hesabı: • Seyahatin başlama zamanı, yolculuk amacıyla bulunulan yerden hareket
edilen andır. Seyahatin bitiş zamanı ise dönülen lokasyona varış anıdır (yerden kasıt, ev, otel, işyeri gibi
bulunulan yerdir). • Görev seyahatlerinde gidiş – dönüş gün ve saatlerinin, seyahat edilecek yerin uzaklığı
ile görevin özellikleri (çalışma saatleri vb.) dikkate alınarak yeterli olabilecek uygun değer süre içinde
planlanması esastır. • Seyahat süresine rastlayan hafta tatili, ulusal bayram ve genel tatil günleri de gün
hesabına dahil edilir. • Seyahat limitlerinin hesabında yolculuğun başlangıç ve bitiş zamanı arasında
geçen süre dikkate alınır. • Seyahat gün hesabında yolculuğun başlangıç ve bitiş zamanı arasında geçen
her 24 saat bir gün olarak kabul edilir. 24 saati geçen gün kesirlerinde ilk 8 saate kadar ½ oranında limit
hesaplanır. 8 saati geçen gün kesirleri bir tam gün sayılır ve tam gün seyahat limiti geçerlidir. 7.10.
Masrafların Şirketçe Karşılanması • Belge temini mümkün olmayan bahşiş, ulaşım giderleri, vb. ile
kaybedilmiş, tahrip olmuş giderler 7.8.1. ve 7.8.2. maddelerinde belirtilen limitler dahilinde yolculuğun
sebebi ve süresi ile uyumlu olmak üzere ilgili çalışanın yöneticisinin onayı ile beyana dayanarak ödenir.
Belgelendirilmeyen harcamaların toplamı, belgeli harcama tutarının 10%’undan fazla olamaz. • Belgesiz
harcamanın görevle ilişkilendirilmediği durumlarda ya da gerekliliği uygun bulunmadığı takdirde
harcama, çalışanın kendi sorumluluğunda olacaktır. • Grup halinde yapılan seyahatlerde refakat eden
çalışana kendi unvanına karşılık gelen seyahat limiti uygulanır. Birden fazla çalışanın yemek yediği
durumlarda teamül olarak, masrafı yemeğe katılan en üst düzey yönetici öder. • Görevle
ilişkilendirilmeyen ve/veya gider bildiriminde yeterli açıklama bulunmayan harcama belgeleri için ödeme
yapılmaz, çalışana iade edilir ve çalışanın ücretinden tahsil edilir. Holding’e bağlı şirketlerin öğle yemeği
hizmeti verdiği lokasyonlara yapılan ziyaretlerde öğle yemeği dışarıda yenilmek durumunda kalınırsa bu
durumun gerekçesi ve kişi sayısı, gider bildiriminde mutlaka belirtilir. • İş seyahatinde bulunan çalışanın
temsil amaçlı yaptığı harcamalar belge karşılığı ve yöneticisinin onayı ile ayrıca ödenir.
Seyahat eden çalışanın iletişim giderleri (telefon, internet, fax, vb.) iş amaçlı olması ve belgelendirilmesi
kaydıyla ödenir. 7.11. Şehir İçi Yolculuklar ve Günübirlik Seyahatler • Aynı il sınırları içinde; iş takibi, evrak
dağıtımı ve benzer hizmetler nedeniyle, günübirlik yapılacak iş seyahatlerinde, nakil vasıtaları ile
çalışanların, öğün (kahvaltı, öğle ve akşam yemeği) başına net 40TL’ye kadarki yemek giderleri (harcama
belgesini beyan etmeleri kaydıyla) şirket tarafından karşılanır. • Günübirlik şehir içi yolculuklar; Holding’e,
Holding’e bağlı şirketlere veya diğer resmi ve özel kurum ve kuruluşlara yapılan seyahatleri kapsayıp,
çalışanın evi ile işyeri arasındaki gidiş gelişleri kapsamaz. Ancak mesai bitiminden sonra tekrar göreve
çağırılanlarla ilgili mutat uygulamalar saklıdır.
`,
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
