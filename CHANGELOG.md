# Ændringslog

## 2.3

- Kategorikortene på oversigten viser højst 6 genveje. Har en kategori flere, åbner **Vis alle** kategorien.
- Klik på kategoriens navn i kortet åbner kategorien, ligesom i venstremenuen.
- *Vælg alle viste* og Shift+klik under *Markér* omfatter kun de genveje, der kan ses.
- Ny **Endelse**-række under type-filteret: de filendelser (.xlsx, .pdf …), der findes blandt de viste filer, med antal. Vises under *Alle* og *📄 Filer*, når der er mindst to forskellige endelser. En endelse markerer også *Filer*; *Mapper*, *Weblinks* og *Ryd filtre* fjerner den.

## 2.2

- Nyt **Type-filter** over tag-filtrene: *Alle*, *📂 Mapper*, *📄 Filer* og *🌐 Weblinks*, med antal ud fra de øvrige filtre. Rækken vises kun, når der er mere end én slags genveje. En fil-sti uden filendelse regnes som en mappe; alt, der ikke er en fil-sti, er et weblink.
- Når der filtreres (kategori, favoritter, søgning, type eller tags), får hver genvej sit eget kort i gitteret i stedet for én lang liste i kategoriens kort. Under *Alle* og *Favoritter* står kategorien nederst på kortet.
- *Ryd filtre* nulstiller også typen.

## 2.1

- Ny **📖 Vejledning** i venstremenuen med 14 afsnit, indholdsfortegnelse og 8 illustrationer med nummererede forklaringer. Illustrationerne er tegnet med sidens egne elementer, så de følger tema og version.
- Søgning, *Tilføj genvej*, *Tilføj fra mappe* og *Markér* fører fra vejledningen tilbage til genvejene.
- Versionsnummeret vises i vejledningen.

## 2.0

- Kategorier er nu objekter med ikon, farve og rækkefølge (↑↓). De oprettes med **+** i venstremenuen eller med "+ Ny kategori…" i kategorilisten. Hvis en kategori slettes, flyttes dens genveje til "Uden kategori".
- Tag-felt med knapper: Enter eller komma efter hvert tag og forslag fra eksisterende tags. Har et tag allerede en stavemåde, bruges den.
- Tag-filtre over genvejene. Hvert tag viser antal genveje sammen med de øvrige filtre, og man kan vælge "alle valgte" eller "mindst ét". Tags på genvejene kan klikkes.
- **🎨 Tags og farver**: farve, omdøb (samme navn som et andet tag slår dem sammen) og slet.
- **☑ Markér**: klik og Shift+klik for at markere. Tilføj/fjern tags, flyt kategori, favorit og slet.
- Mappedialogen beder om at vælge mappen først. Stien spørges kun første gang, og der kan sættes kategori og tags på alle.
- "Åbn i Excel/Word/PowerPoint" for Office-filer på https-adresser.
- Backup-format version 2 (kategorier og tagfarver). Data fra 1.x flyttes over automatisk.
- Rettet fejl, hvor tomme værdier blev vist som teksten "null".

## 1.x

- Én fil (`Genveje.html`) med genvejene bygget ind. Ændringer gemmes i browseren.
- Dialog til at tilføje, redigere og slette genveje. Navn og ikon gættes ud fra adressen.
- Windows-stier omdannes til `file://`-links, og mellemrum, `#` og æøå kodes korrekt.
- Træk et link fra adresselinjen ind på siden.
- **Tilføj fra mappe** (filer og undermapper) med husket mappesti.
- **Gem kopi af siden**, **Eksportér genveje** (JSON) og **Importér genveje** med "Erstat alle" eller "Tilføj kun nye".
- Gult banner, hvis filens genveje afviger fra browserens.
- Ikon til browserfanen.

## 1.0

- Startside i to filer: `index.html` og `links.js`.
- Venstremenu med kategorier, søgning, favoritter (★) og lyst/mørkt tema.
- `links.js` blev brugt i stedet for `links.json`, fordi `fetch()` blokeres, når siden åbnes fra disken.
