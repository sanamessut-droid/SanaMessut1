# Yeni Bolt Hesabına Taşıma Rehberi

Projeyi başka bir Bolt hesabına yüklediğinizde Bolt, `supabase/migrations/` klasöründeki migration dosyalarını sırayla çalıştırır.

## Otomatik Olanlar

- Kullanıcıların kelimeleri ve kelime listeleri oluşturulabilir.
- E-posta onayı olmadan kayıt ve giriş yapılabilir.
- Kelime görselleri için depolama alanı hazırlanır.
- Geri dönüşüm kutusu için silinen kelimeler korunur.
- Öğrenme durumu, doğru-yanlış sayıları ve tamamlanan oyunlar kaydedilir.

## AI Görsel Üretimi

AI görsel üretimi için Supabase Edge Functions bölümündeki mevcut proje secret ayarları kullanılır. Bu ayarlar bulunmuyorsa kullanıcılar görselleri elle yükleyebilir veya görsel adresi ekleyebilir.

## Doğrulama

Yeni hesapta önizlemeyi açtığınızda:

1. Kayıt olun ve tekrar giriş yapın.
2. Bir kelime listesi oluşturup kelime ekleyin.
3. Kelimeye görsel ekleyin.
4. Tüm oyunları ve iki dinleme modunu açıp deneyin.
5. Bir kelimenin tüm 12 oyunu tamamlanmadan otomatik olarak “Öğrenildi” durumuna geçmediğini kontrol edin.
6. Öğrenme durumunu kelime kartından manuel olarak değiştirebildiğinizi kontrol edin.
