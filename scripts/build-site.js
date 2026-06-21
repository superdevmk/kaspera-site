const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const I18N_DIR = path.join(ROOT, "assets", "i18n");
const TEMPLATE_DIR = path.join(ROOT, "src", "pages");

const LOCALES = ["en", "mk", "sq"];
const LOCALE_HTML = { en: "en", mk: "mk", sq: "sq" };

const PAGES = {
  home: "index.html",
  services: "services.html",
  projects: "projects.html",
  social: "social.html",
  development: "development.html",
  contact: "contact.html",
};

const PAGE_KEYS = Object.keys(PAGES);

const FLAG_FILES = {
  en: "images/USA ICON.png",
  mk: "images/MKD ICON.png",
  sq: "images/ALB ICON.png",
};

function flagImg(prefix, locale) {
  const src = encodeURI(`${prefix}${FLAG_FILES[locale]}`);
  return `<img class="nav-lang-flag" src="${src}" alt="" width="20" height="14" loading="lazy" decoding="async">`;
}

function loadLocale(locale) {
  return JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), "utf8"));
}

function get(obj, dotPath) {
  return dotPath.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function flattenStrings(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      flattenStrings(value, next, out);
    } else if (typeof value === "string") {
      out[next] = value;
    }
  }
  return out;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function interpolate(template, flat) {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    if (!(key in flat)) {
      throw new Error(`Missing i18n key: ${key}`);
    }
    return flat[key];
  });
}

function assetPrefix(locale) {
  return locale === "en" ? "assets/" : "../assets/";
}

function pageHref(locale, pageKey) {
  const file = PAGES[pageKey];
  if (locale === "en") {
    return file;
  }
  return `${locale}/${file}`;
}

function langSwitchHref(fromLocale, toLocale, pageKey) {
  const file = PAGES[pageKey];
  if (fromLocale === toLocale) {
    return fromLocale === "en" ? file : file;
  }
  if (toLocale === "en") {
    return fromLocale === "en" ? file : `../${file}`;
  }
  if (fromLocale === "en") {
    return `${toLocale}/${file}`;
  }
  if (fromLocale === toLocale) {
    return file;
  }
  return `../${toLocale}/${file}`;
}

function hreflangHref(fromLocale, targetLocale, pageKey) {
  const file = PAGES[pageKey];
  if (targetLocale === "en") {
    if (fromLocale === "en") return file;
    return `../${file}`;
  }
  if (fromLocale === targetLocale) {
    return file;
  }
  if (fromLocale === "en") {
    return `${targetLocale}/${file}`;
  }
  if (targetLocale === "en") {
    return `../${file}`;
  }
  return `../${targetLocale}/${file}`;
}

function renderHreflang(fromLocale, pageKey) {
  const lines = LOCALES.map(
    (locale) =>
      `  <link rel="alternate" hreflang="${LOCALE_HTML[locale]}" href="${hreflangHref(fromLocale, locale, pageKey)}">`
  );
  lines.push(
    `  <link rel="alternate" hreflang="x-default" href="${hreflangHref(fromLocale, "en", pageKey)}">`
  );
  return lines.join("\n");
}

function renderLangSwitcher(fromLocale, pageKey, strings, prefix) {
  return LOCALES.map((locale) => {
    const href = langSwitchHref(fromLocale, locale, pageKey);
    const aria = strings[`lang.${locale}Aria`];
    const current = locale === fromLocale ? ' aria-current="true"' : "";
    return `    <a class="nav-lang-link${locale === fromLocale ? " is-active" : ""}" href="${href}" hreflang="${LOCALE_HTML[locale]}" lang="${LOCALE_HTML[locale]}" aria-label="${escapeAttr(aria)}"${current}>${flagImg(prefix, locale)}</a>`;
  }).join("\n");
}

function renderNav(fromLocale, pageKey, strings, prefix) {
  const links = PAGE_KEYS.filter((key) => key !== "development")
    .map((key) => {
      const href = fromLocale === "en" ? PAGES[key] : PAGES[key];
      const active = key === pageKey ? ' class="active"' : "";
      return `    <a href="${href}" data-nav="${key === "home" ? "home" : key}"${active}>${strings[`nav.${key === "home" ? "home" : key}`]}</a>`;
    })
    .join("\n");

  const brandHref = fromLocale === "en" ? "index.html" : "index.html";

  return `  <a class="skip-link" href="#main">${strings["common.skipLink"]}</a>

  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

  <header class="nav" id="nav">
    <div class="container nav-inner">
      <a class="brand" href="${brandHref}" aria-label="${escapeAttr(strings["common.brandHomeAria"])}">
        <img src="${prefix}images/kaspera-wordmark.png" alt="KASPERA" class="brand-logo" width="160" height="40">
      </a>

      <button class="nav-toggle" id="navToggle" data-open-label="${escapeAttr(strings["common.openMenu"])}" data-close-label="${escapeAttr(strings["common.closeMenu"])}" aria-label="${escapeAttr(strings["common.openMenu"])}" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>

  <nav class="nav-links" id="navLinks" aria-label="${escapeAttr(strings["common.navPrimaryAria"])}">
    <span class="nav-indicator" id="navIndicator" aria-hidden="true"></span>
${links}
    <div class="nav-lang nav-lang--drawer" role="group" aria-label="${escapeAttr(strings["lang.switchAria"])}">
      <span class="nav-lang-label">${strings["lang.switchAria"]}</span>
      <div class="nav-lang-flags">
${renderLangSwitcher(fromLocale, pageKey, strings, prefix)}
      </div>
    </div>
  </nav>`;
}

function renderFooter(fromLocale, strings, prefix) {
  const link = (file) => (fromLocale === "en" ? file : file);
  return `  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="${prefix}images/kaspera-wordmark.png" alt="KASPERA" class="footer-logo" width="140" height="36" loading="lazy">
        <p class="footer-tagline">${strings["common.footerTagline"]}</p>
      </div>
      <nav class="footer-links" aria-label="${escapeAttr(strings["common.footerNavAria"])}">
        <a href="${link("services.html")}">${strings["nav.services"]}</a>
        <a href="${link("projects.html")}">${strings["nav.projects"]}</a>
        <a href="${link("social.html")}">${strings["nav.social"]}</a>
        <a href="${link("development.html")}">${strings["nav.development"]}</a>
        <a href="https://www.recycle.mk/" target="_blank" rel="noopener noreferrer">Recycle.mk</a>
        <a href="https://chipper-mousse-08aae6.netlify.app/dashboard" target="_blank" rel="noopener noreferrer">${strings["common.tradeFlowDemo"]}</a>
      </nav>
      <p>${strings["common.copyright"]}</p>
    </div>
  </footer>

  <button type="button" class="back-to-top" id="backToTop" aria-label="${escapeAttr(strings["common.backToTop"])}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>`;
}

function renderHead(fromLocale, pageKey, strings, prefix) {
  const meta = {
    title: strings[`meta.${pageKey}.title`],
    description: strings[`meta.${pageKey}.description`],
    ogTitle: strings[`meta.${pageKey}.ogTitle`],
    ogDescription: strings[`meta.${pageKey}.ogDescription`],
  };

  return `<!DOCTYPE html>
<html lang="${LOCALE_HTML[fromLocale]}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeAttr(meta.description)}">
  <meta name="theme-color" content="#f6f7fc">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(meta.ogTitle)}">
  <meta property="og:description" content="${escapeAttr(meta.ogDescription)}">
  <meta property="og:image" content="${prefix}images/kaspera-full.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${escapeHtml(meta.title)}</title>
${renderHreflang(fromLocale, pageKey)}
  <link rel="icon" type="image/png" href="${prefix}images/kaspera-wordmark.png">
  <link rel="apple-touch-icon" href="${prefix}images/kaspera-full.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}css/style.css">
</head>`;
}

function renderPageScripts(pageKey, prefix, locale, localeData) {
  const scripts = [`  <script src="${prefix}js/main.js" defer></script>`];
  if (pageKey === "home") {
    const phrases = get(localeData, "home.hero.typewriterPhrases") || [];
    scripts.unshift(
      `  <script id="heroTypewriterPhrases" type="application/json">${JSON.stringify(phrases)}</script>`,
      `  <script src="${prefix}js/hero-bg.js" defer></script>`,
      `  <script src="${prefix}js/hero-typewriter.js" defer></script>`
    );
  }
  return scripts.join("\n");
}

function buildPage(pageKey, locale, localeData) {
  const templatePath = path.join(TEMPLATE_DIR, `${pageKey}.html`);
  const template = fs.readFileSync(templatePath, "utf8");
  const prefix = assetPrefix(locale);
  const flat = flattenStrings(localeData);
  flat.assetPrefix = prefix;

  const mainContent = interpolate(template, flat);
  const strings = flat;
  const dataPage = pageKey === "home" ? "home" : pageKey;

  const html = `${renderHead(locale, pageKey, strings, prefix)}
<body data-page="${dataPage}" data-lang="${locale}">
${renderNav(locale, pageKey, strings, prefix)}

${mainContent}

${renderFooter(locale, strings, prefix)}

${renderPageScripts(pageKey, prefix, locale, localeData)}
</body>
</html>
`;

  const outDir =
    locale === "en" ? ROOT : path.join(ROOT, locale);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, PAGES[pageKey]);
  fs.writeFileSync(outFile, html, "utf8");
  return outFile;
}

function countLeafStrings(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      count += countLeafStrings(value);
    } else if (typeof value === "string" || Array.isArray(value)) {
      count += 1;
    }
  }
  return count;
}

function main() {
  const locales = Object.fromEntries(LOCALES.map((l) => [l, loadLocale(l)]));

  for (const locale of LOCALES) {
    for (const pageKey of PAGE_KEYS) {
      const out = buildPage(pageKey, locale, locales[locale]);
      console.log(`Built ${path.relative(ROOT, out)}`);
    }
  }

  console.log("\nTranslation key counts (top-level groups + arrays):");
  for (const locale of LOCALES) {
    console.log(`  ${locale}: ${countLeafStrings(locales[locale])} keys`);
  }
}

main();
