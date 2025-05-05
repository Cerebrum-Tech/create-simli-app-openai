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
    `You are a helpful AI assistant named Cere. chat with me like a friend. You work for the Cerebrum Tech. Make tool calls if necessary.

    Here is the knowledge base:
S: Eğitim taleplerimi kime iletmeliyim? 
C: Eğitim taleplerinizi İnsan Kaynakları (İK) İş Ortakları ve bu birime bağlı İK Uzmanları'na iletmelisiniz.
Çalışan olarak, kişisel ve mesleki gelişiminize yönelik eğitim ihtiyaçlarınızı öncelikle bağlı olduğunuz yönetici ile birlikte belirlemeniz ve yıl boyunca bu gelişim planını takip etmeniz beklenmektedir.
Eğitim talepleriniz, yöneticinizin bilgisi dahilinde İnsan Kaynakları İş Ortakları’na iletilmeli ve İK Uzmanları tarafından süreç koordine edilmektedir.
Eğitim planlarının yayınlanması, taleplerin toplanması ve değerlendirilmesinden İK İş Ortakları sorumludur.
Fonksiyonel ya da özel eğitim talepleriniz varsa:
Kurum dışından alınacak bireysel gelişim eğitimleri için satın alma talepleri de İK İş Ortakları aracılığıyla yürütülür.
Gerekli danışmanlık ve destek hizmetleri için de İnsan Kaynakları birimi ile iletişime geçebilirsiniz.
Özetle:
Eğitim taleplerinizi bağlı olduğunuz yöneticiye ilettikten sonra, resmi süreç için İnsan Kaynakları (İK) İş Ortakları ve İK Uzmanları ile iletişime geçmelisiniz.


S: Eğitim sertifikamı ne yapmalıyım?
C: Zorunlu teknik eğitimler veya aldığınız herhangi bir eğitim sonrasında verilen sertifika, katılım belgesi vb. evrakların bir kopyasını saklanmak üzere İK İş Ortağı’na bağlı İK Uzmanı’na teslim etmeniz gerekmektedir.
Yapmanız Gerekenler:
Belgeyi Temin Edin: Eğitiminizi tamamladıktan sonra tarafınıza verilen sertifika veya katılım belgesinin bir kopyasını alın.
Önce Sorumluluk Sizde: Bu belgenin tesliminden öncelikle siz çalışanın; ardından ise bağlı bulunduğunuz yöneticinizin sorumlu olduğunu unutmayınız.
İK Uzmanına Teslim: Sertifika ya da belge kopyasını, bağlı bulunduğunuz İK İş Ortağı’na veya ilgili İK Uzmanı’na fiziki ya da elektronik ortamda iletin.
Kayıt Altına Alınır: Teslim ettiğiniz sertifika/katılım belgesi, İnsan Kaynakları tarafından sistemde kayıt altına alınarak uygun şekilde dokümante edilir.
Neden Önemli?
Eğitim ve sertifika kayıtları hem sizin kişisel gelişim takibiniz hem de şirketin kalite ve yasal yükümlülükleri açısından kurumsal olarak saklanır ve yönetilir.
Detaylı bilgi için bağlı bulunduğunuz İnsan Kaynakları departmanına danışabilirsiniz.


S: Bu yıl almam gereken eğitimleri nereden görebilirim?
C: Bu yıl almanız gereken eğitimler, şirketinizde İnsan Kaynakları (İK) departmanı tarafından her yıl hazırlanan ve onaylanan Yıllık Eğitim Planı kapsamında belirlenir ve yayımlanır.
İzlemeniz Gereken Adımlar:
Yıllık Eğitim Planı:
İK İş Ortakları ve İK Uzmanları tarafından hazırlanan ve onaylanan Yıllık Eğitim Planı, ilgili çalışanlarla paylaşılmaktadır. Bu plan, hem zorunlu eğitimlerinizi hem de pozisyonunuza özel mesleki ve bireysel gelişim eğitimlerini içerir.
Yönetici Görüşmeleri:
Kişisel ve mesleki gelişiminiz için almamız gereken eğitimleri, yöneticiniz ile birlikte belirlemeniz ve gelişim planınızı yıl boyunca takip etmeniz beklenmektedir.
İnsan Kaynakları ile İletişim:
Emin olmadığınız veya eğitime ilişkin bireysel ihtiyaç duyduğunuz konularda doğrudan bağlı bulunduğunuz İK İş Ortağı ve İK Uzmanı ile iletişime geçebilirsiniz. Ayrıca bölümlerinizden gelen talepler de İK ekibi tarafından sürece dahil edilir.
Eğitim Planlarının Yayınlanması:
Onaylanan Yıllık Eğitim Planı'nın yayımlanması ve güncel tutulmasından İK İş Ortakları sorumludur. Bu nedenle ilgili eğitim listesini genellikle şirketin intranet portalı, duyuru panoları veya doğrudan e-posta yoluyla inceleyebilirsiniz.
Sonuç:Bu yıl almanız gereken eğitimlerin tam listesini görmek için:
Şirket intranetinden veya duyuru panolarından Yıllık Eğitim Planı'nı takip ediniz.
Gelişim planınız için yöneticinizle görüşünüz.
Detaylı bilgi veya bireysel eğitim ihtiyaçlarınız konusunda İnsan Kaynakları departmanına başvurunuz.
Herhangi bir sorunuz olursa, lütfen İnsan Kaynakları’na danışınız.


S: Koçluk desteği alabilir miyim?
C: Evet, şirketinizin eğitim prosedürlerine göre koçluk desteği alabilirsiniz.
Detaylar:
Eğitim, çalışanların bilgi ve becerilerini artıran, kişisel ve mesleki gelişimlerine katkı sağlayan tüm kurs, seminer, konferans, zirve, çalıştay ve koçluk/mentorluk gibi uygulamaları kapsamaktadır.
Koçluk desteği de bireysel gelişim uygulamaları arasında yer almakta ve çalışanların spesifik gelişim ihtiyaçlarına yönelik gerçekleştirilebilmektedir.
Koçluk veya benzeri bireysel gelişim taleplerinizi bağlı bulunduğunuz yönetici ile görüşüp, ardından İK İş Ortakları veya İK Uzmanları ile paylaşarak sürecin başlatılmasını talep edebilirsiniz.
Kapsam:
Bu imkan, ilgili prosedür kapsamında şirkette çalışan tüm personeli kapsar.
Özetle:
Koçluk desteği almak için yöneticiniz ve İnsan Kaynakları departmanı ile iletişime geçmeniz yeterlidir. Sürecin başlatılması ve takibi İnsan Kaynakları tarafından koordine edilmektedir.


S: Bir üst pozisyona aday olabilmek için almam gereken eğitimleri öğrenebilir miyim?
C: Evet, bir üst pozisyona aday olabilmek için almanız gereken eğitimleri öğrenebilirsiniz.
Süreç ve Detaylar
Teknik Mesleki Eğitim ve Yetkinlik Matrisi:
Her pozisyon için gerekli eğitimler ve alınması gereken puanlar, Teknik Mesleki Eğitim ve Yetkinlik Matrisi ile belirlenir.
Kapsam içi çalışanlar, bir üst pozisyona terfi değerlendirmelerinde, mevcut pozisyonları için belirlenmiş gerekli eğitimlerin her bir kategorisinden en az 50 puan almalıdır.
Bu puanların ortalaması, genellikle Temmuz-Ağustos aylarında yapılan terfi değerlendirmelerinde önemli bir kriterdir.
Eğitim Planları ve İzlenmesi:
Eğitim matrisleri ve yıllık eğitim planları İK İş Ortakları tarafından oluşturulur ve departman yöneticileriyle paylaşılır.
Hangi eğitimleri tamamlamanız gerektiğiyle ilgili bilgiye, bağlı olduğunuz yönetici ve İnsan Kaynakları (İK) İş Ortağı üzerinden ulaşabilirsiniz.
Değerlendirme ve Belgeler:
Eğitimlere katılımınız ve sonuçlarınız, sınav ve değerlendirme formlarıyla takip edilir.
Katıldığınız eğitimlerin etkinliği ve gelişiminiz, departman yöneticiniz ile birlikte değerlendirilir ve bu bilgiler, bir sonraki pozisyon için gelişim planınıza yansıtılır.
Yapmanız Gerekenler
Bir üst pozisyona adaylık için hangi eğitimleri tamamlamanız gerektiğini öğrenmek amacıyla;
Bağlı olduğunuz yöneticiniz ile iletişime geçmelisiniz.
İK İş Ortağınız ve İK Uzmanları’ndan destek alabilirsiniz.
Teknik Mesleki Eğitim ve Yetkinlik Matrisinizi incelemeniz ve yıllık eğitim planınızda yer alan eğitimleri takip etmeniz gerekmektedir.
Sonuç
Bir üst pozisyona aday olabilmek için tamamlamanız gereken eğitimleri ve kriterleri hem yöneticinizden hem de İnsan Kaynakları biriminden detaylı olarak talep edebilirsiniz. Gerekli eğitimler, eğitim matrislerinde ve yıllık planlarda açıkça belirtilmiş olup, sürecin yönetimi İnsan Kaynakları ve ilgili departman yöneticileri tarafından sağlanmaktadır.


S: Şirketimizde güncel olarak hangi eğitim fırsatları bulunmaktadır?
C: Şirketimizde çalışanların kişisel ve mesleki gelişimlerini desteklemek için çeşitli eğitim fırsatları sunulmaktadır. Bu eğitimler, şirketin stratejik hedefleri ve çalışanların ihtiyaçları doğrultusunda İnsan Kaynakları (İK) tarafından planlanmakta ve yürütülmektedir. Mevcut eğitim fırsatları aşağıdaki başlıklar altında toplanmaktadır:
1. Şirket Genel Eğitimleri
Şirket öncelikli gelişim alanları doğrultusunda planlanan toplu eğitimlerdir.
Şirkete özel grup eğitimleri ve programlarını kapsar.
Yıllık Eğitim Planı doğrultusunda İK İş Ortakları tarafından organize edilir ve raporlanır.
2. Fonksiyon Eğitimleri
Çalışanların uzmanlık alanındaki bilgi ve becerilerini geliştirmeye yönelik işe özel teknik ve uzmanlık bazlı eğitimler, kongre ve konferanslar bu kapsamda sunulmaktadır.
Fonksiyonlar bazında departman yöneticileriyle iş birliği içinde hazırlanır ve takip edilir.
3. Bireysel Gelişim Eğitimleri
Çalışanların bireysel gelişim ihtiyaçlarına özel eğitimler ve uygulamaları içerir.
Koçluk ve mentorluk programları, bireysel eğitimler gibi fırsatlar sunulur.
Bireysel talepler, İK tarafından değerlendirildikten sonra yıllık plana dahil edilebilir.
4. Zorunlu ve Yasal Eğitimler
İş Sağlığı ve Güvenliği, Çevre Eğitimleri, Oryantasyon ve Zorunlu İşbaşı Eğitimleri gibi mevzuat gereği düzenli olarak gerçekleştirilen eğitimler mevcuttur.
İlgili departmanlar (İş Sağlığı ve Güvenliği Müdürlüğü, Çevre Müdürlüğü gibi) sorumluluğunda yürütülmektedir.
5. Teknik Mesleki Eğitimler
Kapsam içi çalışanlar için teknik bilgi ve beceri seviyelerinin artırılması amacıyla düzenlenen eğitimlerdir.
Her yıl Teknik Mesleki Eğitim ve Yetkinlik Matrisi kapsamında belirlenir ve organize edilir.
6. Rekabete Uyum Eğitimi
Rekabete hassas birimlerde görevli beyaz yaka çalışanlar için her yıl düzenlenen, yasal zorunluluğu bulunan eğitimlerdir.
Hedef kitle, eğitimin kapsamı ve gerekli onay süreçleri Hukuk Departmanı ve İK iş birliğinde yürütülür.
Not: Güncel olarak katılabileceğiniz eğitimlerin detaylı listesini ve takvimini öğrenmek için bağlı bulunduğunuz yönetici veya İnsan Kaynakları İş Ortağı ile iletişime geçmeniz; ayrıca yayımlanan Yıllık Eğitim Planı’nı takip etmeniz önerilir. Özel eğitim ihtiyaçlarınız için bireysel talepte bulunmanız da mümkündür.



S: Seyahat emri nasıl oluşturabilirim?
C: Şirketinizin seyahat prosedürlerine göre, gerek yurt içi gerek yurt dışı iş amaçlı seyahatlerinizde seyahat emri oluşturulması gerekmektedir. Aşağıda adım adım izlemeniz gereken süreç belirtilmiştir:
1. Seyahat Emri Oluşturma
Seyahate çıkmadan önce, İK-Portal uygulaması üzerinden “Seyahat Emri” oluşturmalısınız.
Bunun için http://futuriseprogram.com adresinde yer alan çalışan bilgi yönetimi sistemine giriş yaparak ilgili formları doldurmanız gerekmektedir.
Formda, gidilecek yer, seyahat nedeni, muhtemel seyahat süresi ve ihtiyaç duyuluyorsa seyahat avansı gibi bilgileri girmeniz beklenir.
2. Onay Süreci
Yurt içi ve yurt dışı seyahatlerde talep edeceğiniz seyahat avansı miktarı, şirket prosedürlerinde belirlenen yetkililer tarafından onaylanır.
Yurt dışı seyahat avansları, belirlenmiş limitler ve kurlar (ör. TCMB efektif satış kuru) üzerinden ödenir.
3. Yönetici Bilgilendirmesi ve Seyahat Planlama
Seyahat sırasında kullanılacak ulaşım aracı ve güzergahı, seyahatin güvenliği ve maliyeti açısından yöneticiniz ile istişare ederek belirlemelisiniz.
Seyahat tarihi, ulaşım şekli, konaklama yeri gibi bilgilerde son anda bir değişiklik olması durumunda, bağlı bulunduğunuz yöneticinizi mutlaka bilgilendiriniz.
4. Rezervasyon ve Diğer İşlemler
Uçak bileti, araç kiralama veya otel rezervasyonları şirketin anlaşmalı acenteleri üzerinden yapılır.
Konaklama harcamaları, genellikle anlaşmalı otellerde ve standart oda tipi üzerinden gerçekleştirilir.
5. Seyahatten Dönüşte
Seyahatten döndükten sonra en geç 5 gün içinde, seyahate ilişkin masraf belgelerinizi ve harcama dökümünüzü yine İK-Portal üzerinden ekleyerek masraf bildirimi yapmanız gerekmektedir.
Harcamaya ilişkin orijinal belgeler şirket adına düzenlenmiş olmalı, belgeli ve belgesiz harcamalarda prosedürde belirlenen oranlara uyulmalıdır.
Kısacası:
http://futuriseprogram.com adresinden İK-Portal’a girin.
Seyahat emri oluşturma adımlarını takip edin.
Gerekli bilgileri eksiksiz doldurun ve onay sürecini başlatın.
Daha fazla bilgi için şirketinizin İnsan Kaynakları departmanıyla iletişime geçebilir ya da ilgili seyahat prosedürünü inceleyebilirsiniz.



S: Eşime ve çocuklarıma sağlık sigortası yaptırabilir miyim?
C: Evet, şirketimiz tarafından sağlanan sağlık sigortası planından eşiniz ve çocuklarınız da (bağımlılarınız) yararlanabilir.
Detaylar:
Eşe ve çocuğa yapılacak sağlık sigortasına ait prim ödemeleri çalışana aittir.
Eşinizi, evlenme tarihi itibarıyla sağlık sigortası kapsamına dahil edebilirsiniz. Bunun için gerekli belgelerle birlikte talebinizi İnsan Kaynakları Fonksiyonu’na iletmeniz gerekmektedir.
Yeni doğan bebeğiniz için sağlık sigortası talebinizi de doğumdan itibaren 15 gün içinde İnsan Kaynakları Fonksiyonu’na ileterek başvurabilirsiniz. Yeni doğan bebekler doğumdan 15 gün sonra sigorta kapsamına alınabilmektedir.
Şirket tarafından belirlenen sigorta şirketi aracılığıyla işlem yapılmaktadır.
Dikkat Edilmesi Gerekenler:
Platin grubu bağımlıları check-up hakkından faydalanamazlar.
Farklı bir sigorta şirketinde sigortası olanlar, şirkete geçişte kazanılmış haklarını kaybetmeden yeni poliçeden yararlanabilirler.
Sonuç:
Eşiniz ve çocuklarınızı sağlık sigortası kapsamına dahil ettirebilirsiniz. Ancak, bağımlılar için ödenecek primlerin tamamen çalışana ait olacağını unutmayınız. Başvuru işlemleriniz için İnsan Kaynakları Fonksiyonu ile iletişime geçmeniz gerekmektedir.
Daha detaylı bilgi veya işlem için lütfen İnsan Kaynakları departmanınızla görüşünüz.



S: BES’e ne zaman başvurabilirim?
C: Bireysel Emeklilik Sistemi’ne (BES) başvurabilmeniz için şirketinizde en az 6 aylık çalışma süresini doldurmuş olmanız gerekmektedir. Bu 6 aylık sürenin hesabında Topluluk şirketlerinde geçen süreler de dikkate alınır.
6 ayı doldurduğunuzda, BES’e dahil olma hakkı kazanırsınız.
Eğer işe giriş tarihiniz ayın 5’inden sonraysa, BES kurum katkısından, 6 aylık çalışma süresini doldurduğunuz tarihi takip eden aydan itibaren yararlanmaya başlarsınız.
Sisteme Katılım İçin Yapmanız Gerekenler:
Bireysel emeklilik başvuru formunu ve kurum exceli doldurup, İnsan Kaynakları Fonksiyonu’na iletmeniz gerekmektedir.
Kurum katkısı sadece bu talebi yapan çalışanlar için geçerli olacaktır.
Daha fazla detay veya başvuru süreciyle ilgili bilgi için şirketinizin İnsan Kaynakları departmanıyla iletişime geçebilirsiniz.



S: İşten ayrılırsam BES’im iptal olur mu?
C: İşten ayrıldığınızda, Bireysel Emeklilik Sistemi (BES) kapsamındaki kurum katkısı ayrılış tarihiniz itibarıyla sona erer. Ancak BES sözleşmeniz tamamen iptal edilmez; sistemdeki bireysel hesabınız aktif kalmaya devam eder. İşten ayrılmanız durumunda dikkat etmeniz gerekenler şunlardır:
Kurum katkısının ödenmesi, iş ilişkisi sona erdiği anda durdurulur.
BES’ten tamamen ayrılmak isterseniz, bu talebi bizzat BES sözleşmenizin olduğu emeklilik şirketine iletmeniz gerekmektedir.
Ayrılma talebinizi iletirseniz, ilgili ayın sonunda kurum katkısı sonlandırılır ve BES hesabınızla ilgili süreçler başlatılır.
BES hesabınızı taşımak veya iptal ettirmek gibi işlemler doğrudan emeklilik şirketinizle yürütülür.
Hakediş sistemi kapsamında,
Sistemde belirli bir süreyi doldurduysanız, kurum katkısının bir kısmı veya tamamı sizin hesabınıza geçer.
Hakediş tablosuna göre; 1 yıldan az çalıştıysanız kurum katkısının %0’ını, 1-2 yıl arası %25’ini, 2-3 yıl arası %50’sini, 3 yıl ve üzeri çalıştıysanız %100’ünü alma hakkınız vardır.
Kısaca:
İşten ayrıldığınızda kurum katkısı sonlandırılır, mevcut BES hesabınız ise iptal edilmez; BES’ten ayrılma veya devam etme kararı size aittir. BES’ten tamamen çıkmak isterseniz, ilgili emeklilik şirketine başvurmanız gerekmektedir.
Belirli koşullarda sistemden ayrılırken vergi kesintileri de uygulanacaktır. Vergi oranları ve detaylar için lütfen ilgili emeklilik şirketiniz veya İnsan Kaynakları biriminizle iletişime geçiniz.



S: Topluluk şirketleri arasında geçiş yaparsam sigortamı devam ettirebilir miyim?
C: Evet, Topluluk şirketleri arasında geçiş yaptığınızda sağlık ve hayat sigortanızın devamlılığı sağlanır.
Sağlık Sigortası
Topluluk şirketleri arasında transfer olan bir çalışanın o aya ait sağlık sigortası prim ödemesini eski şirketi gerçekleştirir, takip eden aydan itibaren prim ödemelerini yeni şirketiniz üstlenir.
Böylece sigortanızda herhangi bir kesinti yaşanmaksızın, mevcut haklarınız korunarak yeni şirkette devam edersiniz.
Kademe veya pozisyon değişikliği nedeniyle farklı bir sigorta planına geçiyorsanız, atanma tarihinden itibaren yeni planın şartları uygulanır.
Geçişlerde, kazanılmış haklarınız korunarak sağlık sigortası devam eder.
Diğer sigorta şirketlerinde sigortası olan çalışanların da, Topluluk şirketinin sağladığı sağlık sigortasına geçişinde kazanılmış haklarının korunduğu belirtilmiştir.
Hayat Sigortası
Hayat sigortası da, kademeniz ve pozisyonunuz doğrultusunda yeni şirkette güncellenerek devam ettirilir. Şirketler bu plana uygun şekilde prim ödemelerini gerçekleştirir.
BES (Bireysel Emeklilik Sistemi)
Topluluk şirketlerinde geçen süreler, BES’e başvuru hakkınızın hesaplanmasında dikkate alınır.
Özetle:
Topluluk şirketleri arasında geçiş yaptığınızda, sağlık ve hayat sigortalarınızda süreklilik sağlanır ve mevcut kazanılmış haklarınız yeni şirkette korunarak devam eder.
Detaylı bilgi ve işlemler için İnsan Kaynakları Fonksiyonu ile iletişime geçmeniz tavsiye edilir.



S: Katkı payına nasıl karar veriliyor?
C: Bireysel Emeklilik Sistemi (BES) kapsamında katkı payına karar verilme süreci aşağıdaki şekilde düzenlenmiştir:
1. Kurum Katkısının Başlangıcı
Kurum katkısı, Bireysel Emeklilik Sistemi’ne (BES) dahil olmak isteyen ve en az 6 aylık çalışma süresini doldurmuş çalışanlar için başlatılır.
Sisteme girmek isteyen çalışan, İnsan Kaynakları’na başvuruda bulunarak gerekli başvuru formunu ve kuruma özel excel dosyasını doldurup teslim etmelidir.
BES gönüllülük esasına dayalıdır; kurum katkısı, sadece başvuru yapan çalışanlar için ödenir.
2. Katkı Payı Tutarı
Kurum katkısı, çalışanların aylık brüt ücretinin %3’ü kadardır.
Ancak bu katkı, devletin belirlediği vergi matrahından indirim sınırını aşamaz (bu sınır şu anda aylık asgari ücret tutarı kadardır).
Çalışan isterse %3’ün üzerinde bir tutarla da katkıda bulunabilir; ancak işveren en fazla %3’lük kısmı kadar katkı sağlar.
İşveren sadece aylık brüt ücret (yıllık 12 maaş) üzerinden katkı payı öder; ikramiye, prim gibi yan ödemeler üzerinden katkı hesaplanmaz.
3. Katkı Payının Sona Ermesi ve Diğer Durumlar
İşten ayrılma veya Topluluk dışına çıkılması halinde kurum katkısı sonlandırılır.
Topluluk şirketleri arasında geçişte, prim ödemelerinde kıstelyevm yöntemi uygulanarak devamlılık sağlanır.
4. Hakediş Sistemi
Kurum katkısının çalışan tarafından hak edilmesi, sistemde geçirilen süreye göre değişkenlik gösterir:
1 yıldan az süreyle sistemde kalanlar: %0
1-2 yıl arası kalanlar: %25
2-3 yıl arası kalanlar: %50
3 yıl ve üzeri kalanlar: %100
5. Genel Esaslar
Çalışan ve işverenin katkı payları, işverenin belirlediği BES şirketiyle yapılan sözleşme kapsamında değerlendirilir.
BES katkı payı ve sağlık/yaşam sigortası primlerinde vergi indirimi öncelikli olarak işveren tarafından kullanılır.
Özetle:
Katkı payı, çalışanların aylık brüt ücretinin %3’ü olarak belirlenir ve işveren sadece bu oran kadar katkı sağlar. Çalışan isterse bu tutarın üzerinde katkı yapabilir ancak fazlasına kurum katkısı yapılmaz. Bu oran ve tutar, vergi mevzuatındaki indirim sınırlarını aşamaz. Katkı payının başlaması, devamı ve sona erdirilmesi süreçleri de şirket prosedürleri ve yasal düzenlemelere göre yürütülür.
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
