const fs = require("fs");
const { execSync } = require("child_process");

const source = execSync("git show HEAD:index.html", { encoding: "utf8" });
const lines = source.split(/\r?\n/);

const slice = (start, end) => lines.slice(start - 1, end).join("\n");

const nav = `  <a class="skip-link" href="#main">Skip to content</a>

  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

  <header class="nav" id="nav">
    <div class="container nav-inner">
      <a class="brand" href="index.html" aria-label="KASPERA home">
        <img src="assets/images/kaspera-wordmark.png" alt="KASPERA" class="brand-logo" width="160" height="40">
      </a>

      <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>

  <nav class="nav-links" id="navLinks" aria-label="Primary">
    <span class="nav-indicator" id="navIndicator" aria-hidden="true"></span>
    <a href="index.html" data-nav="home">Home</a>
    <a href="services.html" data-nav="services">Services</a>
    <a href="projects.html" data-nav="projects">Projects</a>
    <a href="social.html" data-nav="social">Social Media</a>
    <a href="contact.html" data-nav="contact">Contact</a>
  </nav>`;

const footer = `  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="assets/images/kaspera-wordmark.png" alt="KASPERA" class="footer-logo" width="140" height="36" loading="lazy">
        <p class="footer-tagline">Marketing &amp; software from Skopje.</p>
      </div>
      <nav class="footer-links" aria-label="Footer">
        <a href="services.html">Services</a>
        <a href="projects.html">Projects</a>
        <a href="social.html">Social Media</a>
        <a href="development.html">Development</a>
        <a href="https://www.recycle.mk/" target="_blank" rel="noopener noreferrer">Recycle.mk</a>
        <a href="https://chipper-mousse-08aae6.netlify.app/dashboard" target="_blank" rel="noopener noreferrer">TradeFlow Demo</a>
      </nav>
      <p>&copy; 2026 KASPERA · Skopje, North Macedonia</p>
    </div>
  </footer>

  <button type="button" class="back-to-top" id="backToTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>`;

const pageHeader = (label, title, intro) => `    <header class="page-header section">
      <div class="container">
        <span class="section-label reveal">${label}</span>
        <h1 class="page-title title-reveal reveal">${title}</h1>
        <p class="section-intro reveal">${intro}</p>
      </div>
    </header>`;

const head = (title, description) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#f6f7fc">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="assets/images/kaspera-full.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="assets/images/kaspera-wordmark.png">
  <link rel="apple-touch-icon" href="assets/images/kaspera-full.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>`;

const buildPage = ({ file, page, title, description, header, body, wrapSection }) => {
  const sectionOpen = wrapSection
    ? `    <section class="section ${wrapSection.className || ""}"${wrapSection.id ? ` id="${wrapSection.id}"` : ""} data-section>`
    : "";
  const sectionClose = wrapSection ? "    </section>" : "";

  const html = `${head(title, description)}
<body data-page="${page}">
${nav}

  <main id="main">
${pageHeader(header.label, header.title, header.intro)}
${sectionOpen ? sectionOpen + "\n      <div class=\"container\">" : ""}
${body}
${sectionOpen ? "      </div>\n" + sectionClose : ""}
  </main>

${footer}

  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;

  fs.writeFileSync(file, html, "utf8");
  console.log("Wrote", file);
};

const servicesBody = slice(195, 227);
const projectsBody = slice(242, 468);
const socialBody = slice(483, 538);
let developmentBody = slice(554, 624).replace('href="#contact"', 'href="contact.html"');
let contactBody = slice(677, 724).replace(
  'href="#partnership">development partner section</a>',
  'href="development.html">development partner page</a>'
);

buildPage({
  file: "services.html",
  page: "services",
  title: "Services — KASPERA",
  description: "Digital marketing, social media management, website and software development from KASPERA in Skopje.",
  header: {
    label: "Capabilities",
    title: "What we run and what we build",
    intro: "Two focused teams — marketing operations and software delivery — under one roof in Skopje.",
  },
  wrapSection: { className: "section--surface" },
  body: servicesBody,
});

buildPage({
  file: "projects.html",
  page: "projects",
  title: "Projects — KASPERA",
  description: "Recycle.mk, TradeFlow and client websites built by KASPERA and Alimi Digital.",
  header: {
    label: "Selected work",
    title: "Platforms and products",
    intro: "National-scale systems and production software — not mockups.",
  },
  wrapSection: { className: "showcase", id: "projects" },
  body: projectsBody,
});

buildPage({
  file: "social.html",
  page: "social",
  title: "Social Media — KASPERA",
  description: "Facebook accounts and social media management for brands across North Macedonia.",
  header: {
    label: "Social operations",
    title: "Accounts we manage",
    intro: "Daily content, community and brand presence on Facebook.",
  },
  wrapSection: { className: "section--surface", id: "social" },
  body: socialBody,
});

buildPage({
  file: "development.html",
  page: "development",
  title: "Development — KASPERA",
  description: "Software and web development through Alimi Digital, KASPERA's engineering partner.",
  header: {
    label: "Development partner",
    title: "Built by Alimi Digital",
    intro: "KASPERA leads marketing. Alimi Digital handles design, engineering and production delivery.",
  },
  wrapSection: { className: "partnership section--elevated", id: "development" },
  body: `        <div class="partnership-inner reveal">\n${developmentBody}\n        </div>`,
});

buildPage({
  file: "contact.html",
  page: "contact",
  title: "Contact — KASPERA",
  description: "Get in touch with KASPERA for marketing, social media or software projects.",
  header: {
    label: "Contact",
    title: "Tell us about your project",
    intro: "Marketing, social media or a new website — we'll point you to the right team.",
  },
  wrapSection: { className: "section--cta", id: "contact" },
  body: contactBody,
});
