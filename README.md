# Ella — baflekcz

Osobní web kreativní značky **Ella / baflekcz**: správa sociálních sítí, tvorba
obsahu, videoeditace, natáčení a konzultace.

Web je postavený jako statické HTML + CSS + kousek JavaScriptu. Žádný WordPress,
žádný Mioweb, žádné pluginy, které je potřeba každý měsíc aktualizovat. Díky tomu
je rychlý, levný na provoz a jde nasadit prakticky kamkoliv.

---

## Rychlý start

Otevřít lokálně stačí dvojklikem na `index.html`. Kvůli absolutním cestám
(`/assets/...`) je ale lepší spustit malý server:

```bash
python3 -m http.server 8000
# a otevřít http://localhost:8000
```

---

## Struktura

```
index.html                    celý web – všechny sekce pod sebou (one-page)
ochrana-osobnich-udaju.html   ⚠️ vzor – je potřeba doplnit údaje
404.html                      stránka pro neexistující adresy
robots.txt / sitemap.xml      SEO
site.webmanifest              ikony a název na mobilu
assets/css/style.css          celý vizuální styl (barvy jsou na začátku souboru)
assets/css/motion.css         vrstva pohybu – vzhled efektů (viz níže)
assets/js/main.js             menu, animace, načítání videí
assets/js/motion.js           vrstva pohybu – chování efektů (viz níže)
assets/img/                   fotky a ikony (viz assets/img/README.md)
assets/video/                 video na pozadí hero sekce (viz níže)
scripts/nastav-domenu.sh      hromadná změna domény v celém webu
```

---

## Co je potřeba doplnit před spuštěním

Všechna místa jsou v kódu označená a dají se najít takto:

```bash
grep -rn "ZDE_VLOZ_ID\|doplnit\|Jméno klienta" --include='*.html' .
```

1. **Fotky** – hero a sekce „O mně“. Návod je v `assets/img/README.md`.
2. **Videa** – v sekci *Ukázky práce* nahradit `ZDE_VLOZ_ID` skutečnými ID
   (viz níže).
3. **Reference** – tři vzorové bloky v sekci *Reference* nahradit skutečnými.
4. **Tým** – tři karty v sekci *O mně*; jména jsou volitelná, stačí smazat
   `<span class="team__name">`.
5. **Formuláře** – nastavit `action` (viz níže).
6. **E-mail** – `ahoj@baflek.cz` nahradit skutečnou adresou.
7. **Ochrana osobních údajů** – doplnit údaje v hranatých závorkách.

---

## Formuláře

Statický web sám o sobě e-maily neodesílá, potřebuje službu. Nejjednodušší je
**Formspree** (zdarma do ~50 zpráv měsíčně):

1. Registrace na <https://formspree.io>, vytvoření formuláře.
2. Formspree vydá adresu `https://formspree.io/f/xxxxxxx`.
3. V `index.html` nahradit všechny tři výskyty `ZDE_VLOZ_ID` tím kódem:

```bash
grep -rl "formspree.io/f/ZDE_VLOZ_ID" . | xargs sed -i 's|ZDE_VLOZ_ID|xxxxxxx|g'
```

Alternativy: [Forms.app](https://forms.app), [Web3Forms](https://web3forms.com),
[Netlify Forms](https://docs.netlify.com/forms/setup/) (funguje automaticky, když
web běží na Netlify — stačí formuláři přidat atribut `netlify`).

Formuláře už mají skryté pole `_gotcha`, které odchytává většinu spamovacích
robotů.

---

## SEO — jak se web dostane do vyhledávání

Na „baflekcz“ se dnes zobrazují sociální sítě. Aby se k nim přidal i web, je
v kódu připravené tohle:

- **Titulek a popisek** obsahují zároveň *baflekcz*, *Ella* i *Ella Padevětová* —
  web tak může vyskočit na všechny tři dotazy, přestože se vizuálně prezentuje
  jen jako Ella.
- **Structured data (schema.org)** v `index.html` říkají Googlu, že
  `Ella Padevětová` = `Ella` = `baflekcz` (pole `alternateName`) a že jí patří
  uvedené profily (pole `sameAs`). Tohle je nejdůležitější věc pro propojení webu
  s existujícími profily.
- **`rel="me"`** u odkazů na sítě v patičce — potvrzuje stejné propojení.
- **Open Graph** – hezký náhled při sdílení odkazu.
- **`sitemap.xml` a `robots.txt`**.

### Co je potřeba udělat po nasazení

1. **Ověřit adresy profilů** v `index.html` — hledej `sameAs` a patičku.
   Momentálně jsou tam odhadnuté adresy (`@baflekcz` na TikToku, Instagramu
   a YouTube). Pokud je některá jiná, opravit — nefunkční odkaz v `sameAs`
   propojení spíš pokazí.
2. **Google Search Console** (<https://search.google.com/search-console>) —
   přidat doménu, ověřit vlastnictví (přes DNS TXT záznam u Forpsi) a poslat
   `sitemap.xml`. Bez tohoto kroku může Google web najít až za týdny.
3. **Doplnit odkaz na web** do bia na TikToku, Instagramu i YouTube. Zpětný odkaz
   z profilů je při vyhledávání jména podstatný signál.
4. Trpělivost — jméno „Ella Padevětová“ se obvykle chytne rychle, obecné „Ella“
   je hodně konkurenční dotaz a nemusí se povést nikdy.

Doplnit statistiky návštěvnosti se vyplatí přes
[Plausible](https://plausible.io) nebo [Simple Analytics](https://simpleanalytics.com) —
oproti Google Analytics nepotřebují cookie lištu.

---

## Nastavení domény (Forpsi)

### Jak to vypadá teď

Kontrola z 25. 8. 2026: doména **baflek.cz** má `A` záznam na IP
**87.236.196.161**, což je server **`nexthosting04.exon.io`** — tedy hosting
společnosti Exon, ne Forpsi. Odpovídá to popisu „hosting u člověka, který web
nastavoval“. Obsah stránky se mi ověřit nepodařilo (síť v tomto prostředí na
doménu nepustí), takže nevím, jestli tam ještě něco běží, nebo jen prázdný server.

Doporučuju si ověřit dvě věci:

1. **Kde je doména vedená** — přihlásit se do administrace Forpsi
   (<https://admin.forpsi.com>) a podívat se, jestli je u domény nastavené
   „DNS hosting u Forpsi“, nebo cizí nameservery.
2. **Jestli u domény visí e-mail** — pokud na `@baflek.cz` chodí pošta,
   je nutné při změně **zachovat `MX` záznamy**. Změna `A` záznamu na e-maily
   nesahá, ale kdyby se přenášela celá DNS zóna jinam, pošta by přestala chodit.

Rychlá kontrola aktuálního stavu odkudkoliv:

```bash
# kam vede doména
dig +short baflek.cz A
# kde je pošta
dig +short baflek.cz MX
# kdo spravuje DNS
dig +short baflek.cz NS
```

### Kam web nasadit

| Varianta | Cena | Poznámka |
|---|---|---|
| **Netlify** nebo **Vercel** | zdarma | Doporučuji. Napojí se na tento Git repozitář, po každé změně nasadí samo, HTTPS certifikát řeší automaticky. |
| **Cloudflare Pages** | zdarma | To samé, navíc rychlé i ze zahraničí. |
| **Webhosting u Forpsi** | ~50 Kč/měs. | Vše na jednom místě. Soubory se nahrají přes FTP do složky `www`. Nasazení je ale ruční. |

### Napojení domény — Netlify (doporučeno)

1. Nahrát repozitář na GitHub a v Netlify zvolit *Add new site → Import an
   existing project*. Build command žádný, publish directory `/` (kořen).
2. V Netlify *Domain settings → Add custom domain* → `www.baflek.cz`.
3. V administraci **Forpsi → DNS záznamy** nastavit:

   | Typ | Název | Hodnota |
   |---|---|---|
   | `CNAME` | `www` | `nazev-webu.netlify.app` |
   | `A` | `@` (kořen) | `75.2.60.5` |

   Hodnoty vždy vezmi z Netlify — ověř si je v jeho nastavení domény, mohou se
   lišit. Původní `A` záznam mířící na `87.236.196.161` se přepíše, `MX`
   záznamy nech být.
4. Počkat na propsání DNS (obvykle desítky minut, výjimečně až 48 hodin).
   Netlify pak samo vystaví HTTPS certifikát.

### Napojení domény — hosting u Forpsi

1. Objednat webhosting a nasměrovat na něj doménu (Forpsi to nabídne samo).
2. Přes FTP nahrát **obsah** tohoto repozitáře do složky `www` — tedy
   `index.html` přímo do `www/index.html`, ne do podsložky.
3. V administraci zapnout HTTPS certifikát (Let's Encrypt, zdarma).
4. Přidat do `www` soubor `.htaccess` s přesměrováním na `www` verzi a HTTPS:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.baflek.cz/$1 [R=301,L]
ErrorDocument 404 /404.html
```

### Po nasazení

Placeholder doména je v kódu na několika místech (canonical, Open Graph,
structured data, sitemap). Přepíšou se jedním příkazem:

```bash
./scripts/nastav-domenu.sh www.baflek.cz
```

---

## Vrstva pohybu (motion layer)

Web má nad běžným stylem ještě jednu vrstvu, která řeší **jen to, jak se věci
hýbou** — `assets/css/motion.css` + `assets/js/motion.js`. Na barvy, písma ani
text nesahá. Když obě dvojice řádků z `index.html` smažeš, web vypadá a funguje
přesně jako předtím, jen bez pohybu.

Co vrstva přidává:

| Efekt | Kde je vidět |
| --- | --- |
| Opona mezi stránkami | při načtení a při odchodu na jinou stránku webu |
| Otevírající se rámeček videa | hero – při scrollu se video rozevře do celé plochy |
| Nadpisy po slovech | všechny velké nadpisy vyjedou zpod masky |
| Postupné odkrývání | karty služeb, reference |
| Magnetická tlačítka | hlavní CTA se přitáhnou k myši |
| Vlastní kurzor | jen na počítači; nad videem ukáže „Přehrát" |
| Spodní běžící pás | jen na počítači, od první obrazovky dolů |
| Ukazatel průběhu čtení | tenká linka nahoře |

### Jak efekt vypnout

Na konci `assets/js/motion.js` je seznam `EFEKTY`. **Smazat jeden řádek =
vypnout jeden efekt**, ničeho jiného se to nedotkne. Například spodní běžící
pás vypneš smazáním řádku `blendBar,`.

### Na co je vrstva stavěná

- Animuje se jen `transform`, `opacity` a `clip-path` — nic, co nutí prohlížeč
  přepočítávat rozložení stránky.
- Výpočty při scrollu běží jen u prvků, které jsou zrovna vidět.
- `prefers-reduced-motion` (systémové nastavení „omezit pohyb") vypne úplně
  všechno pohyblivé. Obsah zůstane čitelný a proklikatelný.
- Na dotykových zařízeních se kurzor, magnety ani spodní pás vůbec nenačtou.
- Žádná externí knihovna, žádný další požadavek na server: ~11 kB po kompresi.

---

## Barvy a vizuální styl

Web má **tmavé pozadí** postavené na švestkové `#4B2348`. Není černé — ground je
hluboká švestka `#1E0B24`. Fialová a burgundy z Instagramu jsou v paletě jako
hloubka a záře (přechod v hero, dekorativní světla), nikdy jako dominantní plocha.
Modrá se nikde nepoužívá jako výplň, jen jako součást fialového přechodu.

Zvýraznění `#D98AAF` nese tlačítka a akcenty. Aby web nesklouzl do „cute",
používá se **úsporně** — pár tlačítek, kurzivní slovo v nadpisu, drobné detaily.
Zbytek nesou bílá, lila a švestková.

Celá paleta se mění na jednom místě, na začátku `assets/css/style.css`:

```css
--bg:       #1E0B24;   /* pozadí celého webu */
--surface:  #2B1233;   /* karty */
--plum:     #4B2348;   /* hlavní švestková */
--burgundy: #7A2445;   /* červeno-fialová – hloubka */
--violet:   #3D2A6E;   /* modro-fialová – jen v zářích */
--accent:   #D98AAF;   /* zvýraznění – tlačítka a akcenty */
--ink:      #FFFFFF;   /* nadpisy a hlavní text */
--ink-soft: #E8DDE7;   /* sekundární text */
```

Písma jsou **Fraunces** (nadpisy, výrazný kurzivní řez) a **Outfit** (text) —
kombinace, která drží dojem „kreativní a ženské, ale profesionální“.

---

## Rezervace konzultace

Sekce **Konzultace zdarma** teď funguje jako formulář: člověk vyplní všechna
povinná pole a tobě přijde e-mail, termín pak domluvíte v odpovědi. Funguje to
od první minuty, bez zakládání účtů.

Až budeš chtít, aby si termín vybíral sám, nastav **[Cal.com](https://cal.com)**
(zdarma). Zásadní věc: povinná pole se nedávají *před* kalendář, ale **přímo do
rezervačního formuláře** — návštěvník tak projde jedním krokem místo dvou
a tobě přistane rezervace v kalendáři i s údaji o firmě.

1. Založ účet na Cal.com a propoj ho se svým Google Kalendářem.
2. Vytvoř typ události, např. „Konzultace zdarma, 30 minut".
3. V nastavení události → **Advanced → Booking questions** přidej jako povinná:

   | Otázka | Typ |
   |---|---|
   | Příjmení | Text |
   | Název firmy | Text |
   | Telefon | Phone |
   | Instagram firmy | URL |
   | Další síť | URL, nepovinné |
   | Co bys mi chtěl/a říct předem? | Long text, nepovinné |

   Jméno a e-mail už Cal.com sbírá sám.
4. V *Embed* zkopíruj kód a vlož ho v `index.html` místo bloku
   `<div class="booking__slot">…</div>` (hledej komentář „Sem se vloží kalendář").
5. Formulář nad kalendářem pak smaž — data už sbírá kalendář sám.

Alternativy: [Calendly](https://calendly.com) (vlastní povinná pole až v placené
verzi), [Reservio](https://www.reservio.com) (české, s fakturací).

---

## Video na pozadí hero sekce

Video v repu **už je** — stejné, jaké běželo na předchozí verzi webu:

```
assets/video/hero.webm     1,0 MB   nabízí se první (menší)
assets/video/hero.mp4      1,4 MB   záloha pro prohlížeče bez WebM
assets/img/hero-poster.jpg  66 kB   první snímek, než se video načte
```

Je to 1280 × 720, smyčka 13,9 s, bez zvuku. Web **funguje i bez něj** — dokud
se video nenačte, drží pod textem fialovo-švestkový přechod a poster.

Při scrollu se video rozevře z rámečku do celé plochy (vrstva pohybu, efekt
`expandingMedia`). Vypnout jde smazáním jednoho řádku — viz *Vrstva pohybu*.

### Výměna za jiné video

1. Přepiš `assets/video/hero.mp4` (a ideálně i `hero.webm`).
2. Vyexportuj z něj jeden snímek jako `assets/img/hero-poster.jpg`.

Na co si dát pozor:

- **Bez zvuku.** Prohlížeče video se zvukem samy nespustí a stejně by rušil.
- **Krátká smyčka**, ideálně 8–15 vteřin. Delší video znamená větší soubor.
- **Do 6 MB.** Nad to se na mobilních datech načítá nepříjemně dlouho.
  Zmenšit jde třeba na [handbrake.fr](https://handbrake.fr) — rozlišení 1280 px
  na šířku úplně stačí, video je stejně ztlumené pod textem.
- **Klidný záběr** bez rychlých střihů. Video je pozadí, ne hlavní obsah —
  text nad ním musí zůstat čitelný.

Lidem, kteří mají v systému zapnuté omezení animací, se video nepřehraje
a uvidí jen přechod. To je záměr, ne chyba.

---

## Členství

Sekce **Členství** je na hlavní stránce a veřejně ukazuje, co členství obsahuje.
Samotné lekce zatím neexistují — teď sekce sbírá e-maily na čekací listinu.

Web je připravený na to, aby se přihlašování dalo přidat později bez přestavby:

- **Memberstack** nebo **Outseta** — přihlašování a platby se přidají vložením
  kousku kódu do stávajícího webu, není nutné nic přepisovat.
- **Mentor Tools** nebo **SimpleShop** — české služby, platby na fakturu i kartou.
- Lekce na podadrese `clenove.baflek.cz` (třeba na WordPressu), hlavní web
  zůstane statický a rychlý. Tohle je nejčistší cesta, pokud lekcí bude hodně.

Veřejná část sekce zůstane tak, jak je — mění se jen to, co je za přihlášením.
