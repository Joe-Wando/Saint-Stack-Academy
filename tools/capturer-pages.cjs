// Captures d'écran du site LOCAL avec un navigateur de test piloté par puppeteer-core.
// Usage (via tools/capturer.sh --pages) : node capturer-pages.cjs <dossier> <travaux.json>
//   <dossier> contient node_modules/puppeteer-core et navigateurs/ (chrome-headless-shell, installé par
//   « npx @puppeteer/browsers install chrome-headless-shell@stable --path ./navigateurs »).
//   Edge n'est pas utilisé : il refuse le pilotage sur ce poste.
// travaux.json : [{ "url": "http://localhost:3000/...", "sortie": "x.png", "largeur": 1366, "hauteur": 900,
//                   "pleinePage": false, "defiler": 0, "session": { ... facultatif, copié dans localStorage ssa-session } }]
const path = require('path');
const fs = require('fs');
const os = require('os');
const [dossier, fichier] = process.argv.slice(2);
const puppeteer = require(path.join(dossier, 'node_modules', 'puppeteer-core'));

function trouver(rep) {
  for (const nom of fs.readdirSync(rep, { withFileTypes: true })) {
    const p = path.join(rep, nom.name);
    if (nom.isDirectory()) { const r = trouver(p); if (r) return r; }
    else if (nom.name === 'chrome-headless-shell.exe') return p;
  }
  return null;
}

(async () => {
  const navigateur = trouver(path.join(dossier, 'navigateurs'));
  if (!navigateur) throw new Error('chrome-headless-shell.exe introuvable dans ' + dossier);
  const travaux = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'ssa-pptr-'));
  const nav = await puppeteer.launch({ executablePath: navigateur, headless: 'shell', userDataDir: profil, args: ['--hide-scrollbars'] });
  try {
    for (const t of travaux) {
      if (!/^http:\/\/localhost:3000(\/|$)/.test(t.url)) { console.error('Adresse refusée :', t.url); continue; }
      const page = await nav.newPage();
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.setViewport({ width: t.largeur || 1366, height: t.hauteur || 900, deviceScaleFactor: 1 });
      if (t.session) {
        await page.goto('http://localhost:3000/confidentialite', { waitUntil: 'domcontentloaded' });
        await page.evaluate((s) => localStorage.setItem('ssa-session', JSON.stringify(s)), t.session);
      }
      if (t.stockageSession) {
        if (!t.session) await page.goto('http://localhost:3000/confidentialite', { waitUntil: 'domcontentloaded' });
        await page.evaluate((o) => { for (const [k, v] of Object.entries(o)) sessionStorage.setItem(k, v); }, t.stockageSession);
      }
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 45000 }).catch((e) => console.error('Attente réseau :', t.url, e.message));
      // Attendre la fin des « Chargement… » des pages client.
      await page.waitForFunction(() => !/Chargement…/.test(document.body.innerText), { timeout: 15000 }).catch(() => {});
      // Maquette : CSS ajouté à la page avant la capture, sans toucher au site.
      if (t.css) await page.addStyleTag({ content: t.css });
      // Saisie dans un champ avant la capture : { selecteur, texte }.
      if (t.saisie) { await page.type(t.saisie.selecteur, t.saisie.texte); await new Promise((r) => setTimeout(r, 300)); }
      await page.evaluate(() => document.fonts && document.fonts.ready);
      // Charger les images différées (loading=lazy) avant la capture.
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.images].every((i) => i.complete), { timeout: 10000 }).catch(() => {});
      if (t.defiler) await page.evaluate((y) => window.scrollTo(0, y), t.defiler);
      // Faire défiler jusqu'à un élément (sélecteur CSS), sous l'en-tête collant.
      if (t.element) await page.evaluate((sel) => { const e = document.querySelector(sel); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 90); }, t.element);
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: t.sortie, fullPage: !!t.pleinePage });
      console.log(t.sortie);
      await page.close();
    }
  } finally {
    await nav.close();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
