# Udviklingsnoter

Beslutninger og ting, der er undersøgt undervejs, så de ikke skal findes igen.

## Hvorfor én HTML-fil

Siden skal kunne bruges på en arbejds-pc uden installation og uden administratorrettigheder. Det giver disse valg:

- **Ingen eksterne filer.** Version 1.0 brugte `links.js` ved siden af `index.html`. `fetch("links.json")` blokeres nemlig, når siden åbnes fra disken (`file://`). Fra 1.x er data bygget ind i siden.
- **Data i `localStorage`.** En webside må ikke skrive i filer på disken. Ændringer gemmes derfor i browseren, og *Gem kopi af siden* henter en ny fil med data bygget ind. Den erstatter blokken `<script id="linksData">` i en kopi af sidens HTML, som tages, før siden tegner noget.
- **Backup uden sidens kode** (JSON), så data kan flyttes til nye versioner. `normalizeData()` læser alle kendte formater: v2-objekt, v1-liste, backup-fil, gemt side og `links.js`.

## localStorage-nøgler

| Nøgle | Indhold |
|---|---|
| `genveje.state` | `{ version: 2, links, categories, tagColors }` |
| `genveje.base` | Fingeraftryk af filens indbyggede data. Bruges til at opdage, at filen afviger fra browserens data (det gule banner) |
| `genveje.dirty` | Sat, når der er ændringer siden sidste kopi eller backup (gul prik) |
| `genveje.folders` | Mappenavn med små bogstaver → fuld sti, til mappedialogen |
| `genveje.theme` | `light` / `dark` |
| `genveje.links`, `genveje.favorites` | Fra 1.x. Flyttes til `genveje.state` og slettes ved første åbning af 2.x |

`localStorage` for `file://`-sider deles mellem filer i samme browser. Derfor kan en ny version med samme navn og placering overtage data automatisk. Hvordan det præcis afgrænses, er browserens afgørelse, så backup er sikkerhedsnettet.

## Browserbegrænsninger, der er undersøgt

- **Fuld sti til filer og mapper**: browsere giver aldrig en webside den fulde sti. Det gælder både filvælger, mappevælger (`webkitdirectory`) og træk-og-slip. Mappedialogen får kun stier *inden i* den valgte mappe (`webkitRelativePath`), og derfor indsætter brugeren mappens sti én gang. Ved træk-og-slip fra Stifinder bruger siden en `file://`-adresse, hvis browseren sender en med. Edge gør ikke, og Firefox er ikke afprøvet.
- **Tomme mapper** vises ikke i mappedialogen, fordi mapper kun kan findes via filerne i dem.
- **Mappedialogens startplacering** kan ikke styres af siden.
- **Stifinder og programmer** kan ikke startes fra en webside uden en hjælper (registreringsdatabase, script eller app). Office er undtagelsen via URI-skemaerne `ms-excel:ofe|u|<https-adresse>` (og `ms-word:`, `ms-powerpoint:`). De virker kun med en http(s)-adresse, ikke med lokale filer.
- **Lokale fillinks** fra en lokal side virker. PDF, billeder og tekst åbner i browseren, og mapper vises som en filoversigt. Office-filer hentes typisk som en kopi, så ændringer ikke kommer med i originalen.
- **Lokale filer i Excel** fra en browserside er ikke fundet mulige uden en hjælper.

## Illustrationer i vejledningen

Vejledningen bruger ikke billedfiler. Illustrationerne bygges med de samme CSS-klasser som den rigtige side (`.row`, `.card`, `.chip`, `.selbar` …) og har `pointer-events:none`. Så følger de tema og design og forældes ikke ved ændringer. De nummererede markører (`.co`) skal stemme med antallet af punkter i `.legend` lige under. En test kontrollerer det.

Vejledningen tegnes først, når den åbnes. Derfor indeholder *Gem kopi af siden* ikke en færdigtegnet vejledning (der er også en test for det).

## Idéer, der ikke er lavet

- Hjemmesiders egne ikoner (favicons) ved weblinks. Det kræver internetforbindelse ved visning.
- Engelsk sprogversion.
