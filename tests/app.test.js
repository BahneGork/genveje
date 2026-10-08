// Afprøver Genveje.html i en simuleret browser (jsdom). Kør med: npm test
const fs = require("fs");
const { JSDOM } = require("jsdom");
const HTML = fs.readFileSync(require("path").join(__dirname, "..", "Genveje.html"), "utf8");

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "  ✔ " : "  ✘ ") + msg); if (!cond) failures++; };

function load(storage = {}, html = HTML) {
  const errors = [];
  const downloads = [];
  const dom = new JSDOM(html, {
    url: "http://localhost/Genveje.html",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
      w.HTMLDialogElement.prototype.close = function () { if (!this.open) return; this.open = false; this.dispatchEvent(new w.Event("close")); };
      w.confirm = () => true;
      w.prompt = () => w.__promptAnswer;
      w.matchMedia = () => ({ matches: false });
      w.open = () => {};
      let blobs = new Map(), n = 0;
      w.URL.createObjectURL = b => { const id = "blob:" + (++n); blobs.set(id, b); return id; };
      w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { const b = blobs.get(this.href); if (b) downloads.push({ name: this.download, blob: b }); };
      w.addEventListener("error", e => errors.push(e.message));
      if (!w.Blob.prototype.text) w.Blob.prototype.text = function () { return new Promise(r => { const fr = new w.FileReader(); fr.onload = () => r(fr.result); fr.readAsText(this); }); };
    }
  });
  dom.window.__downloads = downloads;
  dom.window.__errors = errors;
  return dom;
}
const $ = (w, s) => w.document.querySelector(s);
const $$ = (w, s) => [...w.document.querySelectorAll(s)];
const click = (w, elm, opts = {}) => elm.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true, ...opts }));
const key = (w, elm, k) => elm.dispatchEvent(new w.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const submit = (w, form) => form.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
const state = w => JSON.parse(w.localStorage.getItem("genveje.state"));
const blobText = b => b.text();

(async () => {
  console.log("1. Første åbning");
  let dom = load(); let w = dom.window;
  ok(!w.__errors.length, "ingen fejl ved indlæsning " + w.__errors.join(" | "));
  ok($$(w, "#grid .card").length === 3, "3 kategorikort vises");
  ok($$(w, "#navItems [data-view]").length === 6, "menu: Alle, Favoritter, Vejledning + 3 kategorier");
  ok(!$(w, "#tagRow").hidden && $$(w, "#tagRow [data-tag]").length === 2, "tag-rækken viser 2 tags");
  ok($(w, "#typeRow").hidden, "type-rækken er skjult, når alle genveje er weblinks");

  console.log("1b. Vejledning");
  click(w, $(w, '#navItems [data-view="__docs"]'));
  ok(!$(w, "#docs").hidden && $(w, "#grid").hidden && $(w, "#tagRow").hidden && $(w, "#hintBar").hidden, "vejledningen vises, genvejene skjules");
  ok($$(w, "#docs .dsec").length === 14, "14 afsnit: " + $$(w, "#docs .dsec").length);
  ok($$(w, "#docs .toc a").length === 14 && $$(w, "#docs .toc a").every(a => $(w, "#doc-" + a.dataset.doc)), "indholdsfortegnelsen peger på alle afsnit");
  const dtext = $(w, "#docs").textContent;
  ok(!/\bnull\b|\bundefined\b|\[object/.test(dtext), "ingen tomme værdier i teksten");
  ok($$(w, "#docs .shot").length === 8, "illustrationer: " + $$(w, "#docs .shot").length);
  const shotsOk = $$(w, "#docs .shot").every(s => { const n = s.querySelectorAll(".shotbox .co").length; const lg = s.nextElementSibling; return !n || (lg && lg.classList.contains("legend") && lg.children.length === n); });
  ok(shotsOk, "hver illustration har lige så mange forklaringer som numre");
  ok($(w, '#navItems [data-view="__docs"]').classList.contains("active"), "menupunktet er markeret");
  $(w, "#search").value = "power"; $(w, "#search").dispatchEvent(new w.Event("input"));
  ok($(w, "#docs").hidden && !$(w, "#grid").hidden && $$(w, "#grid .row").length === 2, "søgning fører tilbage til genvejene");
  $(w, "#search").value = ""; $(w, "#search").dispatchEvent(new w.Event("input"));
  click(w, $(w, '#navItems [data-view="__docs"]'));
  click(w, $(w, "#selBtn"));
  ok($(w, "#docs").hidden && !$(w, "#selbar").hidden, "☑ Markér fra vejledningen skifter til genvejene");
  click(w, $(w, "#selBtn"));

  console.log("2. Tag-filter og AND/OR");
  click(w, $(w, '#tagRow [data-tag="weee"]'));
  ok($$(w, "#grid .row").length === 1, "filter på WEEE viser 1 genvej");
  ok($(w, '#tagRow [data-tag="weee"]').classList.contains("on"), "chip er markeret");
  click(w, $(w, '#tagRow [data-clear]'));
  ok($$(w, "#grid .row").length === 7, "Ryd filtre viser alle 7");

  console.log("3. Tilføj genvej med tags via dialog");
  click(w, $(w, "#addBtn"));
  ok($(w, "#dlg").open, "dialogen åbner");
  $(w, "#fUrl").value = "\"C:\\Users\\Michael\\Rapporter\\Budget 2026.xlsx\"";
  $(w, "#fUrl").dispatchEvent(new w.Event("change"));
  ok($(w, "#fUrl").value === "file:///C:/Users/Michael/Rapporter/Budget%202026.xlsx", "sti konverteres: " + $(w, "#fUrl").value);
  ok($(w, "#fName").value === "Budget 2026", "navn gættes");
  ok($(w, "#fIcon").value === "📗", "ikon gættes");
  ok($(w, "#fDeskRow").hidden, "skrivebordsvalg skjult for lokal fil");
  const ti = $(w, "#fTagsBox input");
  ti.value = "rapportering"; key(w, ti, "Enter");
  ti.value = "Økonomi, budget"; key(w, ti, "Enter");
  ok($$(w, "#fTagsBox .chip").map(c => c.firstChild.textContent).join("|") === "Rapportering|Økonomi|budget", "tags: eksisterende stavemåde genbruges, komma deler: " + $$(w, "#fTagsBox .chip").map(c => c.firstChild.textContent).join("|"));
  const sel = $(w, "#fCat"); sel.value = "c-power";
  submit(w, $(w, "#form"));
  ok(!$(w, "#dlg").open, "dialogen lukker");
  let st = state(w);
  const nl = st.links.find(l => l.name === "Budget 2026");
  ok(nl && nl.category === "c-power" && nl.tags.length === 3, "genvejen er gemt med kategori og tags");
  ok($$(w, "#tagRow [data-tag]").length === 4, "tag-rækken har nu 4 tags");
  const rapChip = $(w, '#tagRow [data-tag="rapportering"] .ct');
  ok(rapChip && rapChip.textContent === "2", "Rapportering tælles 2");

  console.log("4. Skrivebordsprogram for SharePoint-fil");
  click(w, $(w, "#addBtn"));
  $(w, "#fUrl").value = "https://contoso.sharepoint.com/sites/Genbrug/Shared%20Documents/WEEE%202026.xlsx";
  $(w, "#fUrl").dispatchEvent(new w.Event("input"));
  ok(!$(w, "#fDeskRow").hidden && $(w, "#fDeskLabel").textContent.includes("Excel"), "valget vises for SharePoint-xlsx");
  $(w, "#fUrl").dispatchEvent(new w.Event("change"));
  $(w, "#fDesk").checked = true;
  submit(w, $(w, "#form"));
  const spRow = $$(w, "#grid .row a").find(a => a.getAttribute("href").startsWith("ms-excel:ofe|u|https://"));
  ok(!!spRow && !spRow.hasAttribute("target"), "linket bliver ms-excel:ofe|u|… uden ny fane");

  console.log("5. AND/OR med to tags");
  click(w, $(w, '#tagRow [data-tag="rapportering"]'));
  click(w, $(w, '#tagRow [data-tag="weee"]'));
  ok($$(w, "#grid .row").length === 1, "AND: kun Genbrug har begge");
  click(w, $(w, '#tagRow [data-andor]'));
  ok($$(w, "#grid .row").length === 2, "OR: 2 genveje");
  click(w, $(w, '#tagRow [data-clear]'));

  console.log("6. Kategori: opret, flyt, slet");
  click(w, $(w, "#navItems [data-newcat]"));
  let d = $$(w, "dialog").find(x => x.open && x.id === "");
  d.querySelector("input").value = "WEEE";
  submit(w, d.querySelector("form"));
  st = state(w);
  const weeeCat = st.categories.find(c => c.name === "WEEE");
  ok(!!weeeCat && weeeCat.color, "kategori WEEE oprettet med farve");
  click(w, $(w, `#navItems [data-catedit="${weeeCat.id}"]`));
  d = $$(w, "dialog").find(x => x.open && x.id === "");
  click(w, [...d.querySelectorAll("button")].find(b => b.textContent === "↑"));
  ok(state(w).categories.findIndex(c => c.id === weeeCat.id) === 2, "flyttet op i rækkefølgen");
  d.close();

  console.log("7. Markér flere: tilføj tag, flyt, favorit");
  click(w, $(w, "#selBtn"));
  ok(!$(w, "#selbar").hidden, "markér-bjælken vises");
  click(w, $$(w, "#grid .row")[0]); click(w, $$(w, "#grid .row")[3], { shiftKey: true });
  ok(/^4 valgt/.test($(w, "#selbar b").textContent), "shift-klik markerer et område: " + $(w, "#selbar b").textContent);
  click(w, [...$$(w, "#selbar button")].find(b => b.textContent.includes("Tilføj tag")));
  d = $$(w, "dialog").find(x => x.open && x.id === "");
  const bi = d.querySelector(".taginput input"); bi.value = "daglig"; key(w, bi, "Enter");
  submit(w, d.querySelector("form"));
  ok(state(w).links.filter(l => (l.tags || []).includes("daglig")).length === 4, "4 genveje fik tagget daglig");
  click(w, [...$$(w, "#selbar button")].find(b => b.textContent.includes("Flyt til kategori")));
  d = $$(w, "dialog").find(x => x.open && x.id === "");
  d.querySelector("select").value = weeeCat.id;
  submit(w, d.querySelector("form"));
  ok(state(w).links.filter(l => l.category === weeeCat.id).length === 4, "4 genveje flyttet til WEEE");
  click(w, [...$$(w, "#selbar button")].find(b => b.textContent === "Færdig"));
  ok($(w, "#selbar").hidden, "markering afsluttet");

  console.log("8. Tag-manager: farve, omdøb/sammenlæg, slet");
  click(w, $(w, "#tagMgrBtn"));
  d = $$(w, "dialog").find(x => x.open && x.id === "");
  const rowFor = name => [...d.querySelectorAll(".tm-r")].find(r => r.querySelector(".nm").textContent === name);
  click(w, rowFor("daglig").querySelectorAll(".sw")[2]);
  ok(state(w).tagColors["daglig"] === "#107c10", "farve gemt for daglig");
  w.__promptAnswer = "rapportering";
  click(w, [...rowFor("budget").querySelectorAll("button")].find(b => b.textContent === "✎"));
  const tagsNow = new Set(state(w).links.flatMap(l => l.tags || []));
  ok(!tagsNow.has("budget") && tagsNow.has("Rapportering"), "budget slået sammen med Rapportering");
  click(w, [...rowFor("Økonomi").querySelectorAll("button")].find(b => b.textContent === "🗑"));
  ok(!state(w).links.some(l => (l.tags || []).includes("Økonomi")), "Økonomi slettet");
  d.close();

  console.log("9. Backup og gem kopi");
  click(w, $(w, "#backupBtn"));
  const bk = w.__downloads.find(x => x.name.startsWith("Genveje-backup-"));
  const bkData = JSON.parse(await blobText(bk.blob));
  ok(bkData.format === "genveje-backup" && bkData.version === 2 && bkData.links.length === 9 && bkData.categories.length === 4, "backup indeholder 9 genveje og 4 kategorier");
  click(w, $(w, "#exportBtn"));
  const pg = w.__downloads.find(x => x.name === "Genveje.html");
  const pageCopy = await blobText(pg.blob);
  const storageNow = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); storageNow[k] = w.localStorage.getItem(k); }

  console.log("10. Den gemte kopi åbnes med samme browserdata → intet banner");
  let dom2 = load(storageNow, pageCopy); let w2 = dom2.window;
  ok(!w2.__errors.length, "ingen fejl " + w2.__errors.join(" | "));
  ok(!$(w2, "#banner").classList.contains("on"), "intet banner");
  ok($$(w2, "#grid .row").length === 9, "9 genveje");
  ok($(w2, "#linksData").textContent.includes("WEEE 2026"), "data er bygget ind i kopien");
  ok(pageCopy.includes('<div id="docs" hidden=""></div>') || pageCopy.includes('<div id="docs" hidden></div>'), "kopien indeholder ikke en færdigtegnet vejledning");

  console.log("11. Kopien åbnes i en ren browser → bruger de indbyggede data");
  let dom3 = load({}, pageCopy); let w3 = dom3.window;
  ok($$(w3, "#grid .row").length === 9 && $$(w3, "#grid .card").length === 4, "9 genveje i 4 kort");
  ok(!$(w3, "#banner").classList.contains("on"), "intet banner");

  console.log("12. Import: tilføj kun nye + erstat");
  let dom4 = load(); let w4 = dom4.window;
  const imp = $(w4, "#importFile");
  const file = new w4.File([JSON.stringify(bkData)], "Genveje-backup.json", { type: "application/json" });
  Object.defineProperty(imp, "files", { value: [file], configurable: true });
  imp.dispatchEvent(new w4.Event("change"));
  await new Promise(r => setTimeout(r, 50));
  d = $$(w4, "dialog").find(x => x.open && x.id === "");
  ok(d && d.textContent.includes("heraf 2 genveje du ikke har"), "dialog viser 2 nye");
  click(w4, [...d.querySelectorAll("button")].find(b => b.textContent.startsWith("Tilføj kun nye")));
  let s4 = state(w4);
  ok(s4.links.length === 9, "fletning giver 9 genveje");
  ok(s4.categories.length === 4 && s4.categories.filter(c => c.name === "Power Platform").length === 1, "kategorier slået sammen på navn");
  ok(s4.tagColors["daglig"] === "#107c10", "tagfarver flettet ind");
  Object.defineProperty(imp, "files", { value: [new w4.File([pageCopy], "Genveje.html")], configurable: true });
  imp.dispatchEvent(new w4.Event("change"));
  await new Promise(r => setTimeout(r, 50));
  d = $$(w4, "dialog").find(x => x.open && x.id === "");
  submit(w4, d.querySelector("form"));
  ok(state(w4).links.length === 9, "import fra gemt Genveje.html (erstat) virker");

  console.log("13. Overgang fra den tidligere version (gamle browserdata)");
  const legacyLinks = [
    { category: "Power BI", name: "Fragtpriser", url: "https://app.powerbi.com/x", icon: "📊", tags: ["fragt"] },
    { category: "SharePoint", name: "Salg", url: "https://contoso.sharepoint.com/sites/Salg", icon: "📁" },
    { category: "Power BI", name: "Produktion", url: "https://app.powerbi.com/y" }
  ];
  let dom5 = load({ "genveje.links": JSON.stringify(legacyLinks), "genveje.favorites": JSON.stringify(["https://app.powerbi.com/y"]) });
  let w5 = dom5.window, s5 = state(w5);
  ok(!w5.__errors.length, "ingen fejl " + w5.__errors.join(" | "));
  ok(s5 && s5.categories.map(c => c.name).join("|") === "Power BI|SharePoint", "kategorier oprettet fra de gamle navne");
  ok(s5.links.find(l => l.name === "Produktion").favorite === true && !s5.links.find(l => l.name === "Fragtpriser").favorite, "favoritter overført");
  ok(!w5.localStorage.getItem("genveje.links"), "gamle nøgler ryddet op");
  ok(!$(w5, "#banner").classList.contains("on"), "intet banner efter overgang");

  console.log("14. Importér gammel links.js (v1)");
  const v1js = "window.LINKS = [\n  { category: \"Lokale filer\", name: \"Test\", url: \"file:///C:/x.pdf\", favorite: true },\n];";
  Object.defineProperty(imp, "files", { value: [new w4.File([v1js], "links.js")], configurable: true });
  imp.dispatchEvent(new w4.Event("change"));
  await new Promise(r => setTimeout(r, 50));
  d = $$(w4, "dialog").find(x => x.open && x.id === "");
  click(w4, [...d.querySelectorAll("button")].find(b => b.textContent.startsWith("Tilføj kun nye")));
  ok(state(w4).categories.some(c => c.name === "Lokale filer") && state(w4).links.some(l => l.name === "Test" && l.favorite), "v1-fil importeret med kategori og favorit");

  console.log("15. Type-filter og ét kort pr. genvej");
  const cats15 = [{ id: "c-x", name: "WEEE", icon: "♻️", color: "#107c10" }, { id: "c-y", name: "BI", icon: "📊", color: "#0078d4" }];
  const links15 = [
    { id: "a", name: "Rapporter", url: "file:///C:/Data/Rapporter/", category: "c-x", tags: ["WEEE"] },
    { id: "b", name: "Arkiv", url: "file://///srv/arkiv", category: "c-x", tags: ["WEEE"] },
    { id: "c", name: "Budget", url: "file:///C:/Data/Budget%202026.xlsx", category: "c-x", tags: ["WEEE"] },
    { id: "d", name: "Q1", url: "file:///C:/Data/Q1.pdf", category: "c-x" },
    { id: "e", name: "Power BI", url: "https://app.powerbi.com", category: "c-y", tags: ["WEEE"] }
  ];
  const w6 = load({ "genveje.state": JSON.stringify({ version: 2, links: links15, categories: cats15, tagColors: {} }) }).window;
  const ct = k => $(w6, `#typeRow [data-kind="${k}"] .ct`).textContent;
  const ids = () => $$(w6, "#grid .row").map(r => r.dataset.id).join("");
  ok(!w6.__errors.length, "ingen fejl " + w6.__errors.join(" | "));
  ok(!$(w6, "#typeRow").hidden && ct("") === "5" && ct("folder") === "2" && ct("file") === "2" && ct("web") === "1",
    "type-rækken tæller 2 mapper (med og uden /), 2 filer og 1 weblink");
  ok($$(w6, "#grid .card").length === 2 && !$(w6, "#grid .card.item"), "uden filter: ét kort pr. kategori");
  click(w6, $(w6, '#typeRow [data-kind="folder"]'));
  ok($$(w6, "#grid .card.item").length === 2 && ids() === "ab", "Mapper: hver mappe sit eget kort");
  ok($$(w6, "#grid .ccat").every(c => c.textContent === "♻️ WEEE"), "kortet viser kategorien under Alle");
  click(w6, $(w6, '#typeRow [data-kind="folder"]'));
  ok(ids() === "abcde" && $(w6, '#typeRow [data-kind=""]').classList.contains("on"), "klik igen fjerner type-filteret");
  click(w6, $(w6, '#navItems [data-view="c-x"]'));
  ok($$(w6, "#grid .card.item").length === 4 && !$(w6, "#grid .ccat"), "kategori: hver genvej sit eget kort, uden kategorinavn");
  ok(ct("web") === "0" && ct("file") === "2", "typetallene følger den valgte kategori");
  click(w6, $(w6, '#tagRow [data-tag="weee"]'));
  ok(ct("file") === "1", "typetallene følger tag-filteret");
  click(w6, $(w6, '#typeRow [data-kind="file"]'));
  ok(ids() === "c", "kategori + tag + type: kun Budget");
  ok($$(w6, "#tagRow [data-tag]").length === 1 && $(w6, '#tagRow [data-tag="weee"] .ct').textContent === "1", "tag-tallet følger type-filteret");
  click(w6, $(w6, '#tagRow [data-clear]'));
  ok(ids() === "abcde" && !$(w6, "#grid .card.item") && $(w6, '#typeRow [data-kind=""]').classList.contains("on"), "Ryd filtre nulstiller også typen");
  click(w6, $(w6, '#navItems [data-view="__docs"]'));
  ok($(w6, "#typeRow").hidden, "type-rækken skjules i vejledningen");

  console.log("16. Store kategorier foldes sammen på oversigten");
  const links16 = [];
  for (let i = 1; i <= 9; i++) links16.push({ id: "s" + i, name: "Stor " + i, url: `https://example.com/${i}`, category: "c-big" });
  links16.push({ id: "k1", name: "Lille 1", url: "https://example.com/a", category: "c-small" }, { id: "k2", name: "Lille 2", url: "https://example.com/b", category: "c-small" },
    { id: "u1", name: "Løs", url: "https://example.com/u" });
  const cats16 = [{ id: "c-big", name: "Stor", icon: "📦", color: "#107c10" }, { id: "c-small", name: "Lille", icon: "📎", color: "#0078d4" }];
  const w7 = load({ "genveje.state": JSON.stringify({ version: 2, links: links16, categories: cats16, tagColors: {} }) }).window;
  const cardOf = name => $$(w7, "#grid .card").find(c => c.querySelector(".copen").textContent === name);
  ok(!w7.__errors.length, "ingen fejl " + w7.__errors.join(" | "));
  ok(cardOf("Stor").querySelectorAll(".row").length === 6 && cardOf("Stor").querySelector(".ccount").textContent === "9", "kategori med 9: viser 6, tæller 9");
  ok(cardOf("Stor").querySelector(".more").textContent === "Vis alle 9 →", "“Vis alle 9 →” vises");
  ok(cardOf("Lille").querySelectorAll(".row").length === 2 && !cardOf("Lille").querySelector(".more"), "lille kategori: alle vises, ingen “Vis alle”");
  click(w7, $(w7, "#selBtn"));
  click(w7, [...$$(w7, "#selbar button")].find(b => b.textContent.startsWith("Vælg alle viste")));
  ok($(w7, "#selbar b").textContent === "9 valgt" && !$$(w7, "#grid .row:not(.picked)").length, "Vælg alle viste tager kun de 9 synlige (6 + 2 + 1)");
  click(w7, $(w7, "#selBtn"));
  click(w7, cardOf("Stor").querySelector(".more"));
  ok($(w7, '#navItems [data-view="c-big"]').classList.contains("active") && $$(w7, "#grid .row").length === 9, "“Vis alle” åbner kategorien med alle 9");
  click(w7, $(w7, '#navItems [data-view="__all"]'));
  click(w7, cardOf("Lille").querySelector(".copen"));
  ok($(w7, '#navItems [data-view="c-small"]').classList.contains("active") && $$(w7, "#grid .row").length === 2, "klik på kategoriens navn åbner kategorien");
  click(w7, $(w7, '#navItems [data-view="__all"]'));
  click(w7, cardOf("Uden kategori").querySelector(".copen"));
  ok($(w7, '#navItems [data-view="__none"]').classList.contains("active") && $$(w7, "#grid .row").length === 1, "“Uden kategori” åbner også");

  console.log("17. Filter på filendelse");
  const links17 = [
    { id: "a", name: "Mappe", url: "file:///C:/Data/", category: "c-x" },
    { id: "b", name: "Budget", url: "file:///C:/Data/Budget.xlsx", category: "c-x", tags: ["T"] },
    { id: "c", name: "Salg", url: "file:///C:/Data/Salg.XLSX", category: "c-y" },
    { id: "d", name: "Notat", url: "file:///C:/Data/Notat.pdf", category: "c-x", tags: ["T"] },
    { id: "e", name: "Web", url: "https://example.com/rapport.pdf", category: "c-x" }
  ];
  const w8 = load({ "genveje.state": JSON.stringify({ version: 2, links: links17, categories: cats15, tagColors: {} }) }).window;
  const exts = () => $$(w8, "#extRow [data-ext]").map(b => b.dataset.ext + b.querySelector(".ct").textContent).join(" ");
  const ids8 = () => $$(w8, "#grid .row").map(r => r.dataset.id).join("");
  ok(!w8.__errors.length, "ingen fejl " + w8.__errors.join(" | "));
  ok(!$(w8, "#extRow").hidden && exts() === ".xlsx2 .pdf1", "endelser læses fra filerne (store/små bogstaver ens, weblinks tæller ikke)");
  click(w8, $(w8, '#extRow [data-ext=".xlsx"]'));
  ok(ids8() === "bc" && $(w8, '#typeRow [data-kind="file"]').classList.contains("on"), ".xlsx: kun regneark, og Filer markeres");
  ok($(w8, '#typeRow [data-kind="file"] .ct').textContent === "3", "Filer-tallet tæller alle filer");
  click(w8, $(w8, '#extRow [data-ext=".xlsx"]'));
  ok(ids8() === "bdc" && $(w8, '#typeRow [data-kind="file"]').classList.contains("on"), "klik igen fjerner endelsen, Filer bliver");
  click(w8, $(w8, '#extRow [data-ext=".pdf"]'));
  click(w8, $(w8, '#typeRow [data-kind="folder"]'));
  ok(ids8() === "a" && $(w8, "#extRow").hidden, "Mapper fjerner endelsen og skjuler rækken");
  click(w8, $(w8, '#typeRow [data-kind="folder"]'));
  click(w8, $(w8, '#tagRow [data-tag="t"]'));
  ok(exts() === ".pdf1 .xlsx1", "endelserne følger tag-filteret");
  click(w8, $(w8, '#navItems [data-view="c-y"]'));
  ok($(w8, "#extRow").hidden, "kun én endelse i det viste: rækken skjules");
  click(w8, $(w8, '#tagRow [data-clear]'));
  click(w8, $(w8, '#extRow [data-ext=".pdf"]'));
  click(w8, $(w8, '#tagRow [data-clear]'));
  ok(ids8() === "abdec" && !$(w8, "#extRow .chip.on"), "Ryd filtre nulstiller også endelsen");

  console.log(failures ? `\n${failures} FEJL` : "\nAlle test bestået");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
