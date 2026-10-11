# Destek Talep Yönetim Sistemi

Spring Boot ve Next.js kullanılarak geliştirilen, kullanıcıların destek talepleri oluşturmasını ve takip etmesini, yöneticilerin ise talepleri yönetmesini sağlayan web uygulaması.

## Proje Hakkında

Bu proje, kullanıcıların destek taleplerini dijital ortamda oluşturup takip edebilmelerini ve yöneticilerin bu talepleri merkezi bir arayüz üzerinden yönetebilmelerini amaçlamaktadır.

Backend tarafında REST API mimarisi ve Spring Boot, frontend tarafında ise Next.js, React ve TypeScript kullanılmıştır.

## Özellikler

- Kullanıcı kayıt ve giriş işlemleri
- JWT tabanlı kimlik doğrulama
- Access token ve refresh token yönetimi
- USER ve ADMIN rolleriyle yetkilendirme
- Destek talebi oluşturma ve takip etme
- Destek taleplerinin yönetilmesi
- İstek verilerinin doğrulanması
- Merkezi hata yönetimi ve standart API hata yanıtları
- H2 veritabanı ile geliştirme ve demo ortamı
- Kullanıcı ve yönetici arayüzleri

## Kullanılan Teknolojiler

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- H2 Database
- JWT
- Jakarta Validation

### Frontend

- Next.js
- React
- TypeScript

## Proje Yapısı

```text
destek-talep/
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/xmid/destek_talep/
│           │       ├── controller/
│           │       ├── service/
│           │       ├── repository/
│           │       ├── entity/
│           │       ├── dtos/
│           │       ├── security/
│           │       ├── config/
│           │       └── exception/
│           └── resources/
│               └── application.yaml
├── frontend/
├── screenshot/
│   └── maven.png
├── .gitignore
└── README.md
```

*Not: Proje yapısı, temel bileşenleri göstermek amacıyla sadeleştirilmiştir.*

## Maven Yapılandırması
<span style="color: red;">Eğer projeyi ilk açtığınızda hata alırsanız, IntelliJ IDEA içinden ekran görüntüsündeki ayarı yapıp Apply → OK diyerek sorunu çözebilirsiniz.</span>

Backend projesinin Maven yapılandırması `pom.xml` dosyası üzerinden yönetilmektedir. Maven, bağımlılıkların yönetilmesini, projenin derlenmesini ve testlerin çalıştırılmasını sağlar.



![Maven Yapılandırması](screenshot/maven.png)

## Kurulum ve Çalıştırma

### Gereksinimler

- Java 17 veya uyumlu bir JDK
- Node.js ve npm
- Maven veya projeyle birlikte gelen Maven Wrapper dosyaları

### 1. Projeyi Klonlama

```bash
git clone https://github.com/ramzndmrr/destek-talep.git
cd destek-talep
```

### 2. Backend'i Çalıştırma

Backend dizinine geçin:

```bash
cd backend
```

Uygulama, yapılandırmada belirtilen port üzerinden çalışır. Varsayılan olarak `9090` portu kullanılmaktadır.

H2 profili etkinleştirilecek şekilde yapılandırılmışsa uygulamayı şu komutla başlatabilirsiniz:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
```

H2 profilinin etkin olduğunu ve başlangıç verilerini oluşturan yapılandırmanın çalıştığını kontrol edin.

### 3. Frontend'i Çalıştırma

Yeni bir terminal açın ve frontend dizinine geçin:

```bash
cd frontend
npm install
```

Frontend ortam değişkenlerinde backend API adresinin doğru yapılandırıldığından emin olun. Örnek:

```env
NEXT_PUBLIC_API_URL=http://localhost:9090
```

Projenin kullandığı ortam değişkeni farklıysa mevcut yapılandırmadaki değişken adını kullanın.

Frontend'i başlatın:

```bash
npm run dev
```

Web arayüzüne şu adres üzerinden erişebilirsiniz:

http://localhost:3000

## Demo Kullanıcıları

H2 profilindeki başlangıç verileri yapılandırması etkin olduğunda aşağıdaki örnek hesaplar kullanılabilir:

| Rol | E-posta | Şifre |
|---|---|---|
| USER | `user@example.com` | `User123!` |
| ADMIN | `admin@example.com` | `Admin123!` |

**Not:** Bu hesaplar yalnızca geliştirme ve demo ortamı içindir. Gerçek ortamda kullanılmamalıdır.

## Mimari Tasarım ve Teknik Kararlar

### Katmanların Sorumlulukları

Proje, sorumlulukların birbirinden ayrılması ve kodun bakımının kolaylaştırılması amacıyla katmanlı mimari yaklaşımıyla geliştirilmiştir.

**1. Controller Katmanı**

HTTP isteklerini karşılar, gelen verileri ilgili servis katmanına iletir ve istemciye uygun HTTP yanıtlarını döndürür.

**2. Service Katmanı**

Uygulamanın iş kurallarını ve temel işlem akışlarını yönetir. Kullanıcı kimlik doğrulama ve destek talebi işlemleri bu katmanda gerçekleştirilir.

**3. Repository Katmanı**

Veritabanı işlemlerini yürütür. Spring Data JPA aracılığıyla uygulamanın verilerine erişim sağlar.

**4. Entity Katmanı**

Veritabanında tutulan verilerin uygulamadaki nesne karşılıklarını tanımlar.

**5. DTO Katmanı**

İstemci ile backend arasındaki veri alışverişini düzenler. İstek ve yanıt modellerini birbirinden ayırarak verilerin kontrollü biçimde aktarılmasını sağlar.

**6. Security ve Config Katmanları**

Kimlik doğrulama, yetkilendirme, JWT yapılandırması, CORS ayarları ve uygulamanın ortak yapılandırmalarını yönetir.

**7. Exception Katmanı**

Uygulama genelinde oluşan hataları merkezi olarak ele alır ve uygun HTTP durum kodlarıyla standart hata yanıtları oluşturur.

**8. Frontend Katmanı**

Next.js ve React kullanılarak geliştirilen web arayüzüdür. Kullanıcıların giriş yapmasını, destek talebi oluşturmasını, taleplerini takip etmesini ve yönetim panelini kullanmasını sağlar.

### Önemli Teknik Kararlar

#### 1. H2 Veritabanının Tercih Edilmesi

Projenin geliştirme ve demo ortamında veritabanı olarak H2 tercih edilmiştir. H2, uygulama içerisinde bellekte çalışan bir veritabanı olarak yapılandırılmıştır. Bu sayede uygulama çalıştırıldığında gerekli tablolar oluşturulabilmekte ve örnek kullanıcılar başlangıç verisi olarak eklenebilmektedir.

**Tercih edilme nedeni:** Harici bir veritabanı sunucusu kurma ve yapılandırma ihtiyacını azaltarak projenin kolayca çalıştırılmasını ve test edilmesini sağlamak amaçlanmıştır. Ayrıca örnek kullanıcılarla uygulamanın temel işlevleri hızlıca test edilebilmektedir. H2'nin bellek tabanlı yapılandırmasında uygulama kapatıldığında veriler kalıcı olarak saklanmaz; bu nedenle yaklaşım geliştirme ve demo ortamı için uygundur.

#### 2. Merkezi Hata Yönetiminin Kullanılması

Backend tarafında Spring Boot'un `@RestControllerAdvice` ve `@ExceptionHandler` mekanizmaları kullanılarak merkezi hata yönetimi uygulanmıştır. Doğrulama hataları, bulunamayan kaynaklar, yetki hataları ve beklenmeyen hatalar merkezi bir noktada ele alınarak standart bir hata yanıtı oluşturulmaktadır.

**Tercih edilme nedeni:** Hata yanıtlarının bütün API uç noktalarında tutarlı olmasını sağlamak, controller sınıflarındaki tekrar eden hata yönetimi kodlarını azaltmak ve istemcinin hataları daha kolay işlemesine yardımcı olmak amaçlanmıştır.

## Güvenlik

- Kimlik doğrulama ve erişim kontrolü backend tarafında gerçekleştirilir.
- Kullanıcı ve yönetici işlemleri roller üzerinden sınırlandırılır.
- İstemciden gelen veriler doğrulanır.
- Hassas hata ayrıntılarının istemciye gönderilmemesine dikkat edilir.
- JWT secret ve diğer hassas yapılandırmalar güvenli biçimde yönetilmelidir.
- Demo hesapları ve geliştirme yapılandırmaları gerçek ortamda kullanılmamalıdır.

## Test

Backend testlerini çalıştırmak için backend dizininde:

```bash
mvn test
```

Maven Wrapper kullanılıyorsa Windows üzerinde:

```powershell
.\mvnw.cmd test
```

## Geliştirici

GitHub: https://github.com/ramzndmrr