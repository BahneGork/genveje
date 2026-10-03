// ============================================================
//  GENVEJE  –  rediger kun denne fil for at tilføje/ændre links
// ============================================================
//  Felter pr. link:
//    name      (påkrævet)  Visningsnavn
//    url       (påkrævet)  Webadresse eller lokal fil (se eksempler nederst)
//    category  (påkrævet)  Gruppe i venstremenuen – nye kategorier oprettes automatisk
//    icon      (valgfri)   Emoji eller et tegn, fx "📊"
//    favorite  (valgfri)   true = favorit ved første åbning (derefter styres
//                          favoritter med stjernen og huskes i browseren)
//    tags      (valgfri)   Ekstra søgeord, fx ["fragt", "rapport"]
//    note      (valgfri)   Kort beskrivelse vist under navnet
//
//  Husk komma mellem hvert link { ... },
// ============================================================

window.LINKS = [

  // ---------- Power Platform ----------
  { category: "Power Platform", name: "Power BI",       url: "https://app.powerbi.com",        icon: "📊", favorite: true },
  { category: "Power Platform", name: "Power Automate", url: "https://make.powerautomate.com", icon: "⚙️", favorite: true },

  // ---------- Microsoft 365 ----------
  { category: "Microsoft 365", name: "Outlook",      url: "https://outlook.cloud.microsoft/mail/", icon: "📧" },
  { category: "Microsoft 365", name: "Excel Online", url: "https://excel.cloud.microsoft/",        icon: "📗" },
  { category: "Microsoft 365", name: "To Do",        url: "https://to-do.office.com/",             icon: "📋" },

  // ---------- SharePoint ----------
  { category: "SharePoint", name: "United DK", url: "https://ragnsells1.sharepoint.com/sites/UnitedDK", icon: "📁", favorite: true },
  { category: "SharePoint", name: "WEEE DK",   url: "https://ragnsells1.sharepoint.com/sites/WEEE_DK",  icon: "♻️", favorite: true, tags: ["weee", "rapportering"] },

  // ---------- Lokale filer (eksempler – ret eller slet) ----------
  // Fil på C-drevet:   "file:///C:/Mappe/Undermappe/fil.xlsx"
  // Netværksdrev (UNC \\server\share\fil.xlsx):   "file://///server/share/fil.xlsx"
  // Mellemrum i stien skrives som %20
  { category: "Lokale filer", name: "Eksempel: lokal fil", url: "file:///C:/Users/Public/Documents/eksempel.xlsx", icon: "📄", note: "Ret stien til en rigtig fil" },

];
