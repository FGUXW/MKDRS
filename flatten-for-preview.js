// Turns the Eleventy build (clean URLs, absolute paths — correct for real
// hosting) into a flat folder of .html files with relative links, so it can
// be opened directly from disk with a double-click. Preview only.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "_site");
const OUT = path.join(__dirname, "mkdrs-website-preview");

const ROUTE_TO_FILE = {
  "/": "index.html",
  "/about-us/who-we-are/": "about-us-who-we-are.html",
  "/about-us/our-history/": "about-us-our-history.html",
  "/about-us/our-torah-scrolls/": "about-us-our-torah-scrolls.html",
  "/jewish-life/services-and-festivals/": "jewish-life-services-and-festivals.html",
  "/jewish-life/life-cycle-events/": "jewish-life-life-cycle-events.html",
  "/jewish-life/bereavement/": "jewish-life-bereavement.html",
  "/jewish-life/converting-to-judaism/": "jewish-life-converting-to-judaism.html",
  "/community/celebrations/": "community-celebrations.html",
  "/community/social-events/": "community-social-events.html",
  "/community/our-choir/": "community-our-choir.html",
  "/community/interfaith-and-outreach/": "community-interfaith-and-outreach.html",
  "/community/jewish-life-in-milton-keynes/": "community-jewish-life-in-milton-keynes.html",
  "/learning/cheder/": "learning-cheder.html",
  "/learning/adult-learning/": "learning-adult-learning.html",
  "/learning/school-and-group-visits/": "learning-school-and-group-visits.html",
  "/hall-hire/": "hall-hire.html",
  "/contact-us/": "contact-us.html",
  "/safeguarding/": "safeguarding.html",
  "/privacy-notice/": "privacy-notice.html",
  "/cookie-notice/": "cookie-notice.html",
  "/accessibility-statement/": "accessibility-statement.html",
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Copy CSS to the same flat folder
fs.copyFileSync(path.join(SRC, "css", "style.css"), path.join(OUT, "style.css"));

function rewriteHtml(html) {
  html = html.replace(/(href|src)="\/css\/style\.css"/g, '$1="style.css"');
  html = html.replace(/(href|src)="\/admin\/"/g, '$1="#" data-note="admin only works once the site is deployed online"');
  for (const [route, file] of Object.entries(ROUTE_TO_FILE)) {
    if (route === "/") continue;
    // handle anchors like /contact-us/#donate as well as plain /contact-us/
    const re = new RegExp(`(href)="${route.replace(/\//g, "\\/")}(#[^"]*)?"`, "g");
    html = html.replace(re, (m, attr, anchor) => `${attr}="${file}${anchor || ""}"`);
  }
  html = html.replace(/href="\/"/g, 'href="index.html"');
  return html;
}

for (const [route, file] of Object.entries(ROUTE_TO_FILE)) {
  const srcFile = route === "/" ? path.join(SRC, "index.html") : path.join(SRC, route.slice(1), "index.html");
  if (!fs.existsSync(srcFile)) {
    console.warn("Missing:", srcFile);
    continue;
  }
  const html = rewriteHtml(fs.readFileSync(srcFile, "utf8"));
  fs.writeFileSync(path.join(OUT, file), html);
}

console.log("Preview build written to", OUT);
