# Analyse: hubs, tags og kategorier i File Command Center

Analysen er lavet ud fra `index.html` i [BahneGork/file-command-center](https://github.com/BahneGork/file-command-center) (ca. 3.200 linjer). Den blev brugt til at vælge, hvilke funktioner Genveje skulle have. Linjenumrene passer til den version af filen, der blev analyseret, og kan have flyttet sig siden.

## Datamodel

- `S.categories`: liste over hubs, hver med `{ id, name, icon, color, description, notes }`.
- `S.files`: hver fil har `category` (hub-id eller tom), `tags` (liste), `pinned`, `status` (`aktiv`/`arkiv`) m.m.
- `S.settings.tagColors`: tagnavn med små bogstaver → farve.

**Hubs og kategorier er det samme.** `migrate()` sætter `hub: true` på alle kategorier, og ruten `#/cat/…` sender videre til `#/hub/…`. Hver fil hører til én hub eller ingen.

## Hubs

- Oprettes og redigeres i `catDialog()` med navn, emoji-ikon, farve og beskrivelse. Rækkefølgen ændres med ↑↓. Sletter man en hub, beholdes filerne under "Uden hub".
- I venstremenuen har hver hub ikon, farve, antal filer og ✎.
- På oversigten vises en flise pr. hub med antal filer, manglende filer, beskrivelse og hubbens **3 mest brugte tags**.
- Hub-siden (`hubView`) har:
  - statistik
  - "Genveje" (favoritter i hubben som startknapper, op til 14)
  - kommende frister
  - et **notefelt**
  - filerne i hubben
- Hubbens farve bruges på kortkanter, chips og statusstrip.

## Tags

- `tagInput`: chips med Enter/komma og forslag fra en `<datalist>`. `canonTag()` genbruger en eksisterende stavemåde.
- `matches()`: flere tags samtidig med **AND/OR** (`UI.tagMode`). Skifteknappen vises først ved 2+ valgte tags.
- Tag-rækken:
  - viser antal pr. tag ud fra de *øvrige* filtre (`skipTags`)
  - sorterer valgte tags først, derefter efter antal
  - viser 18 tags plus "vis flere" og "Ryd filtre"
- Klik på et tag på et kort slår filteret til og fra. Fra oversigten hoppes til "Alle filer" med tagget valgt.
- `tagManager()`: farve, omdøb (samme navn slår tags sammen) og slet.
- Markér-tilstand (Shift-klik for et område):
  - tilføj og fjern tags (fjern viser "x af n har tagget")
  - flyt hub
  - favorit
  - arkiv
- Importdialogen kan give alle filer samme hub og tags.

## Hub-filter i listerne

Hub-chips fungerer som tag-chips: "Alle" plus én chip pr. hub, med antal ud fra de øvrige filtre (`skipCat`). På en hubs egen side er de skjult.

## Hvad der kræver skrivebordsappen

Filstatus (findes filen?), forhåndsvisning, åbning i det tilknyttede program, Stifinder-integration og daglige backups kører gennem appens C#-del (`api(...)`). Det kan ikke laves i en ren HTML-fil.

## Beslutning: hybrid

Genveje fik idéerne, ikke koden. Funktionerne er skrevet på ny inden for Genvejes egen struktur. FCC's kode afhænger af egne byggeklodser (`h()`, `STR`-sprogtabeller, `S`/`UI`, `dialog()`), og mange af funktionerne kræver skrivebordsappen.

**Overtaget i Genveje 2.0**

- tag-filtre med antal og AND/OR
- kategorier som objekter (ikon, farve, rækkefølge)
- tag-felt med chips og kanonisk stavemåde
- tag-manager
- markér flere og redigér samlet
- tags og kategori til alle ved tilføjelse fra mappe

**Fravalgt**

- frister og gentagelser
- arkiv
- forhåndsvisning
- filstatus
- hub-noter
- oversigtsside med hub-fliser

De kræver enten skrivebordsappen eller gør en genvejsside mere kompliceret uden at gøre den bedre.
