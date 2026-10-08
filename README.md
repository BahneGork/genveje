# Genveje

En lokal startside, der samler links til hjemmesider, SharePoint, Power BI, filer og mapper ét sted.

Det er **én HTML-fil** uden installation, server eller hjælpefiler. Dobbeltklik på `Genveje.html`, så åbner den i Edge eller Firefox.

## Funktioner

- Genveje til webadresser, SharePoint/OneDrive, lokale filer, netværksdrev og mapper. Windows-stier (`C:\…`, `\\server\…`) laves automatisk om til fillinks.
- Kategorier med ikon, farve og rækkefølge, vist i venstremenuen og som farvede kort. Et kort viser højst 6 genveje; klik på navnet eller "Vis alle" for at åbne kategorien.
- Type-filter: vis kun mapper, filer eller weblinks. Når der filtreres, får hver genvej sit eget kort.
- Tags med tag-filtre. Hvert tag viser antal genveje, og filtrene kan matche **alle valgte** eller **mindst ét**. Tags kan farves, omdøbes, slås sammen og slettes.
- Favoritter, søgning (`/`, `Enter` åbner første resultat) og lyst/mørkt tema.
- **Tilføj fra mappe**: vælg en mappe og sæt flueben ved de filer og undermapper, du vil have med. Mappens sti huskes.
- **Markér flere**: tilføj eller fjern tags, flyt til kategori, gør til favorit eller slet mange genveje på én gang.
- Office-filer på SharePoint/OneDrive kan åbnes direkte i Excel, Word eller PowerPoint (`ms-excel:ofe|u|…`).
- Træk et link fra browserens adresselinje ind på siden for at tilføje det.
- Indbygget **📖 Vejledning** med illustrationer.

## Sådan gemmes data

| Hvad | Hvornår | Indhold |
|---|---|---|
| Browseren (`localStorage`) | Automatisk, ved hver ændring | Alt – men kun i den browser |
| **💾 Gem kopi af siden** | Når du klikker | En ny `Genveje.html` med alle genveje bygget ind |
| **⬇️ Eksportér genveje** | Når du klikker | `Genveje-backup-ÅÅÅÅ-MM-DD.json` med genveje, kategorier, tagfarver og mappestier |

**⬆️ Importér genveje** læser en backup-fil, en gemt `Genveje.html` eller en gammel `links.js`. Du kan vælge mellem *Erstat alle* og *Tilføj kun nye*.

### Skift til en ny version

1. Klik **⬇️ Eksportér genveje** i den gamle version.
2. Åbn den nye `Genveje.html`.
3. Klik **⬆️ Importér genveje…**, vælg backup-filen og klik **Erstat alle**.

Data fra tidligere versioner bliver også flyttet over automatisk, hvis den nye fil ligger med samme navn i samme mappe.

## Begrænsninger

Siden kører i browseren uden installation. Derfor kan den ikke:

- se den fulde sti til filer og mapper, som du vælger eller trækker ind. Stien skal indsættes (Stifinder → `Ctrl+Shift+C`).
- åbne Stifinder eller starte programmer, bortset fra Office via `ms-excel:`/`ms-word:`/`ms-powerpoint:`.
- skrive i sin egen fil. Brug i stedet *Gem kopi af siden*.
- tjekke, om en fil stadig findes.

Lokale Office-filer, der åbnes via et fillink, bliver typisk hentet som en kopi. Ændringer i kopien kommer ikke med i originalen.

## Udvikling

Al kode ligger i `Genveje.html`: HTML, CSS og JavaScript uden eksterne biblioteker. Startdata ligger i `<script id="linksData">` som `window.GENVEJE`. *Gem kopi af siden* erstatter netop den blok.

Testene kører siden i en simuleret browser (jsdom):

```bash
npm install
npm test
```

| Fil | Dækker |
|---|---|
| `tests/app.test.js` | Indlæsning, vejledning, tilføj/redigér, tags og filtre, kategorier, markér flere, tag-manager, backup, gem kopi, import (erstat/flet), overgang fra ældre data |
| `tests/folder.test.js` | Mappedialogen: liste over filer og mapper, sti-kontrol, husket sti, kodning af stier, mappelinks |

Testene kører også automatisk på GitHub ved hvert push (`.github/workflows/test.yml`).

jsdom er ikke en rigtig browser. Layout og browserdialoger (mappevalg, `ms-excel:`-links) skal derfor afprøves i Edge og Firefox.

## Filer

| Sti | Indhold |
|---|---|
| `Genveje.html` | Selve siden |
| `tests/` | Automatiske test |
| `docs/udviklingsnoter.md` | Beslutninger, browserbegrænsninger og ting der er undersøgt |
| `docs/analyse-file-command-center.md` | Analyse af hubs, tags og kategorier i [File Command Center](https://github.com/BahneGork/file-command-center) |
| `CHANGELOG.md` | Versionshistorik |
