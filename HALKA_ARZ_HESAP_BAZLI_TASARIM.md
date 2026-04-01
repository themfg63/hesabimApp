# Halka Arz Hesap Bazli Takip Tasarimi

Bu dokumanin amaci, ekrandaki tablo mantigini uygulamaya saglam ve genisleyebilir bir sekilde eklemek icin backend ve frontend yapisini netlestirmektir.

## 1. Hedef

Asagidaki sorulara tek ekranda dogru cevap verebilen bir yapi kurulacak:

- Hangi halka arza hangi hesaptan kac lot girdim?
- Hesap bazli alis maliyetim nedir?
- Guncel fiyat ile guncel tutar nedir?
- Hesap bazli kar/zarar nedir?
- Tum hesaplarin toplam maliyeti ve toplam kar/zarari nedir?

Bu ozellik tek bir tablo gostermekten ibaret olmamali. Veri modeli, hesaplama kurallari ve API tasarimi birlikte kurulursa sonradan su ihtiyaclar da kolay eklenir:

- Ayni halka arza birden fazla hesaptan giris
- Farkli lot adetleri
- Farkli alim fiyatlari
- Guncel fiyat guncelleme
- Toplamlarin anlik hesaplanmasi
- Ileride satis islemi ekleme

## 2. Mevcut Projede Gozlenen Durum

Su an projede hesap ve transaction altyapisi temel seviyede var:

- `accounts` tablosunu temsil eden `Account` entity mevcut.
- `transactions` entity mevcut ancak borsa/halka arz odakli detay alanlari icermiyor.
- `stocks` adinda kullanici bazli bir tablo `schema.sql` icinde var, fakat hesap bazli lot dagilimini temsil etmek icin yeterli degil.
- Frontend tarafinda `halkaArzListesi` ve `hesaplarim` sayfalari olusturulmus ama icerik mantigi henuz bos.

Bu nedenle en temiz yol, mevcut genel transaction yapisini zorlamadan halka arz portfoyu icin ayri bir domain yapisi kurmaktir.

## 3. Onerilen Domain Yapisi

Bu ozellik icin 3 temel kavram olacak:

### 3.1 Halka Arz Kaydi

Bir halka arz tanimi.

Ornek alanlar:

- `id`
- `user_id`
- `code` : ornek `AAGYO`
- `company_name`
- `offering_price`
- `current_price`
- `currency` : varsayilan `TRY`
- `status` : `DRAFT`, `ACTIVE`, `CLOSED`
- `created_at`
- `updated_at`

Bu kayit, arz bazli ana veriyi tutar.

### 3.2 Hesap Bazli Halka Arz Pozisyonu

Bir kullanicinin belirli bir halka arza belirli bir hesaptan girdigi lot bilgisini tutar.

Ornek alanlar:

- `id`
- `user_id`
- `ipo_id`
- `account_id`
- `lot_count`
- `buy_price`
- `buy_date`
- `notes`
- `created_at`
- `updated_at`

Bu tablo asil isin omurgasidir. Ekrandaki her satir buna karsilik gelir.

### 3.3 Fiyat Gecmisi

Ilk fazda zorunlu degil. Ama sonradan grafik veya tarihsel rapor gerekirse eklenebilir.

Ornek alanlar:

- `id`
- `ipo_id`
- `price`
- `price_date`
- `source`

Ilk versiyonda sadece `ipo.current_price` tutmak yeterli.

## 4. Veritabani Tasarimi

## 4.1 Onerilen Tablolar

### `ipo_offerings`

Bir halka arz tanimi.

Alanlar:

- `id BIGSERIAL PRIMARY KEY`
- `user_id BIGINT NOT NULL`
- `code VARCHAR(30) NOT NULL`
- `company_name VARCHAR(255)`
- `offering_price NUMERIC(18,2) NOT NULL`
- `current_price NUMERIC(18,2) NOT NULL`
- `currency VARCHAR(10) NOT NULL DEFAULT 'TRY'`
- `status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`

Kisitlar:

- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `UNIQUE (user_id, code)`

### `ipo_positions`

Hesap bazli halka arz lot kayitlari.

Alanlar:

- `id BIGSERIAL PRIMARY KEY`
- `user_id BIGINT NOT NULL`
- `ipo_id BIGINT NOT NULL`
- `account_id BIGINT NOT NULL`
- `lot_count INTEGER NOT NULL CHECK (lot_count > 0)`
- `buy_price NUMERIC(18,2) NOT NULL CHECK (buy_price >= 0)`
- `buy_date TIMESTAMP`
- `notes VARCHAR(500)`
- `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`

Kisitlar:

- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (ipo_id) REFERENCES ipo_offerings(id) ON DELETE CASCADE`
- `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE`

Onemli not:

- Eger ayni halka arza ayni hesaptan tek satir tutulacaksa `UNIQUE (ipo_id, account_id)` eklenir.
- Eger ayni hesaptan bir halka arza farkli tarihlerde birden fazla alim yapmak istiyorsan bu unique kisiti eklenmez.

Ben ilk asamada `UNIQUE (ipo_id, account_id)` ile baslamayi oneriyorum. Cunku ekrandaki mantikta her hesap icin tek satir var.

## 4.2 Neden `stocks` tablosu yetmez?

Mevcut `stocks` tablosu kullanici bazli tekil hisse kaydi mantigina yakin. Senin ihtiyacin ise sunlar:

- ayni arz icin birden fazla hesap satiri
- hesap bazli lot adedi
- hesap bazli maliyet
- hesap bazli kar
- arz bazli ve genel toplamlar

Bu nedenle `stocks` tablosunu genisletmek yerine halka arz icin ayri tablolar daha temizdir.

## 5. Hesaplama Kurallari

Tablodaki her satir icin hesap:

- `toplam_maliyet = lot_count * buy_price`
- `guncel_tutar = lot_count * current_price`
- `kar_zarar = guncel_tutar - toplam_maliyet`

Tablonun en alt toplamlari icin:

- `toplam_lot = sum(lot_count)`
- `genel_toplam_maliyet = sum(toplam_maliyet)`
- `genel_guncel_tutar = sum(guncel_tutar)`
- `genel_kar_zarar = sum(kar_zarar)`

Ortalama maliyet gerekecekse:

- `ortalama_maliyet = genel_toplam_maliyet / toplam_lot`

Para hesaplarinda `BigDecimal` kullanilmali. Frontend sadece gosterim yapmali, asil hesap backend tarafinda da uretilmeli.

## 6. Backend Mimari

Backend tarafinda yeni bir halka arz modulu acilmasi gerekiyor.

Onerilen paket yapisi:

- `entity/IpoOffering.java`
- `entity/IpoPosition.java`
- `repository/IpoOfferingRepository.java`
- `repository/IpoPositionRepository.java`
- `dto/ipo/IpoCreateRequest.java`
- `dto/ipo/IpoUpdatePriceRequest.java`
- `dto/ipo/IpoPositionCreateRequest.java`
- `dto/ipo/IpoPortfolioRowDto.java`
- `dto/ipo/IpoPortfolioSummaryDto.java`
- `service/IpoService.java`
- `controller/IpoController.java`

## 6.1 Onerilen API Uclari

### Halka arz olustur

- `POST /api/ipos`

Body:

```json
{
  "code": "AAGYO",
  "companyName": "Agaoglu Gayrimenkul",
  "offeringPrice": 21.10,
  "currentPrice": 21.10,
  "currency": "TRY"
}
```

### Halka arzlari listele

- `GET /api/ipos`

Kullanicinin tum halka arzlarini doner.

### Tek halka arz detayi

- `GET /api/ipos/{ipoId}`

Arz bilgisi + hesap bazli satirlar + toplamlar donebilir.

### Halka arz guncel fiyati guncelle

- `PATCH /api/ipos/{ipoId}/price`

Body:

```json
{
  "currentPrice": 24.35
}
```

### Hesap bazli lot girisi ekle

- `POST /api/ipos/{ipoId}/positions`

Body:

```json
{
  "accountId": 3,
  "lotCount": 150,
  "buyPrice": 21.10,
  "buyDate": "2026-04-01T10:30:00",
  "notes": "Ana dagitim"
}
```

### Hesap bazli kaydi guncelle

- `PUT /api/ipos/positions/{positionId}`

### Hesap bazli kaydi sil

- `DELETE /api/ipos/positions/{positionId}`

### Tablodaki ozet veriyi getir

- `GET /api/ipos/{ipoId}/portfolio-table`

Onerilen response:

```json
{
  "ipo": {
    "id": 1,
    "code": "AAGYO",
    "companyName": "Agaoglu Gayrimenkul",
    "offeringPrice": 21.10,
    "currentPrice": 21.10,
    "currency": "TRY"
  },
  "rows": [
    {
      "positionId": 10,
      "accountId": 5,
      "accountName": "Garanti",
      "lotCount": 150,
      "buyPrice": 21.10,
      "currentPrice": 21.10,
      "totalCost": 3165.00,
      "currentValue": 3165.00,
      "profitLoss": 0.00,
      "currency": "TRY"
    }
  ],
  "summary": {
    "totalLot": 600,
    "totalCost": 12660.00,
    "totalCurrentValue": 12660.00,
    "totalProfitLoss": 0.00,
    "currency": "TRY"
  }
}
```

## 6.2 Service Katmani Mantigi

Servis katmani su kurallari uygulamali:

- Kullanici sadece kendi arz ve hesaplarina erisebilmeli.
- `account_id`, giris yapan kullaniciya ait degilse islem reddedilmeli.
- `buy_price` verilmezse varsayilan olarak `ipo.offering_price` kullanilabilir.
- `current_price` her satirda ayri tutulmamali, arz kaydindan okunmali.
- Tum toplamlar backend tarafinda hesaplanip response'a eklenmeli.

## 6.3 Validation Kurallari

- `code` bos olamaz.
- `code` ayni kullanici icin benzersiz olmali.
- `lotCount > 0` olmali.
- `buyPrice >= 0` olmali.
- `currentPrice >= 0` olmali.
- `accountId` kullaniciya ait olmali.

## 7. Frontend Mimari

Next.js tarafinda mevcut sayfalara yeni bir veri akis yapisi baglanmali.

## 7.1 Onerilen Sayfalar

### `src/app/halkaArzListesi/page.tsx`

Liste ekranı.

Icerik:

- kullanicinin halka arz listesi
- her kartta kod, sirket adi, arz fiyati, guncel fiyat, toplam lot, toplam kar
- detay sayfasina git butonu
- yeni arz ekle butonu

### `src/app/yeniArzEkle/page.tsx`

Yeni halka arz ve ilk hesap dagilimi ekleme formu.

Icerik:

- arz kodu
- sirket adi
- arz fiyati
- guncel fiyat
- hesap secimi
- lot adedi
- alim fiyati
- ayni ekranda birden fazla hesap satiri ekleme

### Yeni onerilen sayfa: `src/app/halkaArzListesi/[ipoId]/page.tsx`

Senin paylastigin tablo burada olmali.

Icerik:

- ustte arz ozeti
- altta hesap bazli tablo
- en altta toplam satiri
- fiyat guncelleme
- yeni hesap satiri ekleme
- satir duzenleme/silme

## 7.2 Onerilen Bilesenler

- `src/components/ipo/IpoSummaryCard.tsx`
- `src/components/ipo/IpoPortfolioTable.tsx`
- `src/components/ipo/IpoPositionForm.tsx`
- `src/components/ipo/IpoTotalsBar.tsx`

Bu ayirim sayesinde tablo mantigi ile form mantigi karismaz.

## 7.3 Frontend API Katmani

`src/services/api.ts` su an yalnizca login ve register islerini yapiyor. Buraya halka arz fonksiyonlari eklenmeli.

Onerilen fonksiyonlar:

- `getIpos()`
- `getIpoDetail(ipoId)`
- `createIpo(payload)`
- `updateIpoPrice(ipoId, payload)`
- `createIpoPosition(ipoId, payload)`
- `updateIpoPosition(positionId, payload)`
- `deleteIpoPosition(positionId)`

## 7.4 Tipler

`src/types` altinda yeni tipler acilmali:

- `src/types/ipo.ts`

Ornek tipler:

- `IpoOffering`
- `IpoPositionRow`
- `IpoPortfolioSummary`
- `IpoPortfolioResponse`

## 8. UI Mantigi

Senin paylastigin tabloyu temel alip su sutunlar olacak:

- `Hesap`
- `Lot Adedi`
- `Lot Fiyati`
- `Guncel Fiyat`
- `Toplam Tutar`
- `Guncel Tutar`
- `Kar`

Alt satir:

- `Toplamlar`
- toplam lot
- toplam maliyet
- toplam guncel tutar
- toplam kar

Ek olarak kullanici deneyimi icin sunlar faydali olur:

- Kar pozitifse yesil, negatifse kirmizi gosterim
- Para formatlama `Intl.NumberFormat('tr-TR', ...)` ile yapilmali
- Mobilde kart gorunumu veya yatay scroll gerekli

## 9. En Saglam Ilk Faz Kapsami

Kusursuz calisan bir mantik icin ilk fazi kucuk ama dogru kurmak lazim.

Benim onerim:

### Faz 1

- halka arz olusturma
- hesap bazli lot kaydi ekleme
- hesap bazli tablo gosterme
- toplamlari backendde hesaplama
- fiyat manuel guncelleme

### Faz 2

- satir guncelleme ve silme
- halka arz liste ekraninda toplam kar ozeti
- filtreleme ve siralama

### Faz 3

- fiyat gecmisi
- satis islemleri
- gerceklesen kar/zarar
- performans grafikleri

## 10. Tavsiye Edilen Uygulama Sirasi

Bu sirayla ilerlemek en dusuk riskli yol olur:

1. Veritabani tablolarini ekle.
2. Entity, repository ve DTO'lari olustur.
3. `GET /api/ipos/{ipoId}/portfolio-table` endpointini bitir.
4. Postman veya frontend olmadan backend response'unu dogrula.
5. Frontend tiplerini ve servis fonksiyonlarini ekle.
6. Detay sayfasinda tabloyu gercek veriyle bagla.
7. Yeni pozisyon ekleme formunu bagla.
8. Fiyat guncelleme aksiyonunu ekle.
9. Son olarak liste ekranina ozet kartlari ekle.

## 11. Teknik Kararlar

Benim net onerilerim:

- Para ve fiyat alanlarinda backend tarafinda `BigDecimal` kullan.
- Hesaplamalari sadece frontendde yapma; backend de hesaplayip response'a koysun.
- Halka arz domainini mevcut `transactions` yapisina zorla baglama.
- Her kullanici icin `code` benzersiz olsun.
- Ilk surumde ayni hesap + ayni arz icin tek satir mantigiyle basla.

## 12. Bu Dokumandan Sonra Ne Yapacagiz?

Bu dokumani inceleyip bana su seviyelerde geri donus verebilirsin:

- tablo sutunlari dogru mu
- ayni hesaptan ayni arza birden fazla satir ister misin
- arz bazli mi yoksa tum arzlari tek tabloda mi gormek istersin
- manuel fiyat guncelleme yeterli mi
- ilk fazda satis islemi olacak mi

Sen onay verdikten sonra ben bunu kod tarafinda sirasiyla kurarim:

1. sadece backend altyapisi
2. backend + tabloyu gosteren frontend
3. tum akisi form ve kaydetme ile birlikte uca uca

## 13. Kisa Sonuc

Bu ozellik icin en dogru mantik:

- `accounts` mevcut kalacak
- halka arz icin ayri `ipo_offerings` tablosu gelecek
- hesap bazli satirlar icin `ipo_positions` tablosu gelecek
- toplamlar sorgu veya servis katmaninda hesaplanacak
- frontend detay sayfasinda senin tablo tasarimin canlanacak

Bu yapi hem bugun istedigin tabloyu cozer hem de yarin portfoy modulu buyudugunde sorun cikarmaz.