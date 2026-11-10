---
slug: d04-domaine-dns-https
titre: Nom de domaine, DNS et HTTPS pour son site
domaine: Développement web
duree: 90
difficulte: bases
licence:
  - { niveau: L1, semestre: S2, ue: "Programmation web" }
parcours:
  - { parcours: deploiement, ordre: 4 }
ordre: 2
prerequis_cours: [g01-2-reseaux, d01-github-pages]
visibilite: public
objectifs:
  - Choisir et acheter un nom de domaine (extension, registraire, renouvellement)
  - Relier un domaine à GitHub Pages, Netlify ou Vercel avec les bons enregistrements DNS
  - Distinguer domaine racine et sous-domaine, et choisir entre A et CNAME
  - Vérifier la propagation DNS et activer le HTTPS automatique
  - Choisir l'hébergeur adapté à chaque type de projet
prerequis:
  - Avoir suivi « Les réseaux pour développeurs » (DNS, enregistrements A et CNAME)
  - Avoir publié un site sur GitHub Pages, Netlify ou Vercel
referentiels:
  - RFC 1035 (DNS) et RFC 8555 (ACME, protocole de Let's Encrypt)
  - CompTIA Network+ (N10-009), domaine « Network Implementation » (DNS)
  - Documentation GitHub Pages, Netlify et Vercel, sections « Custom domains »
quiz:
  - question: "Quelle différence entre www.monsite.sn et monsite.sn ?"
    choix: ["Aucune", "www.monsite.sn est un sous-domaine ; monsite.sn est le domaine racine (apex)", "monsite.sn est plus sécurisé", "www est obligatoire"]
    reponse: 1
    explication: "Ce sont deux noms distincts, chacun avec ses enregistrements ; on en choisit un comme adresse principale et on redirige l'autre."
  - question: "Pour faire pointer www.monsite.sn vers Netlify, quel enregistrement crée-t-on en général ?"
    choix: ["Un enregistrement A vers une IP", "Un CNAME vers nom-du-site.netlify.app", "Un MX", "Un TXT vide"]
    reponse: 1
    explication: "Un CNAME est un alias vers un autre nom ; l'hébergeur gère lui-même ses adresses IP."
  - question: "Pourquoi utilise-t-on souvent un enregistrement A (et non un CNAME) pour le domaine racine monsite.sn ?"
    choix: ["Par habitude", "Parce que la norme DNS interdit un CNAME à la racine d'une zone, qui contient déjà d'autres enregistrements (NS, SOA)", "Parce que A est plus rapide", "Parce que CNAME est payant"]
    reponse: 1
    explication: "Certains fournisseurs proposent des équivalents (ALIAS, ANAME, CNAME flattening), mais le CNAME classique n'est pas autorisé à la racine."
  - question: "Ton domaine est configuré depuis 10 minutes et certains amis voient encore l'ancien site. Pourquoi ?"
    choix: ["Le domaine est cassé", "La propagation DNS : les résolveurs gardent l'ancienne réponse en cache pendant la durée du TTL", "Le HTTPS bloque", "GitHub est en panne"]
    reponse: 1
    explication: "Il faut attendre l'expiration du TTL (souvent de quelques minutes à quelques heures) ; on vérifie avec dig ou nslookup."
  - question: "Qui fournit le certificat HTTPS sur GitHub Pages, Netlify et Vercel ?"
    choix: ["Toi, en l'achetant", "L'hébergeur, automatiquement et gratuitement (via Let's Encrypt ou équivalent), une fois le DNS correct", "Ton registraire uniquement", "Personne, HTTPS est optionnel"]
    reponse: 1
    explication: "Le certificat est émis quand l'hébergeur peut prouver que le domaine pointe bien vers lui, puis renouvelé automatiquement."
---

## L'idée

`awa221.github.io` ou `mon-site.netlify.app` fonctionnent, mais `awadiop.dev` ou `boutique-wax.sn` font plus **professionnel**, et cette adresse te suit si tu changes d'hébergeur. Ce cours relie un **nom de domaine** à ton site, en mettant en pratique ce qu'on a vu sur le DNS dans le cours sur les réseaux.

```
Visiteur ──▶ « monsite.sn ? » ──▶ DNS ──▶ « c'est chez Netlify » ──▶ Netlify sert le site en HTTPS
```

## 1. Acheter un nom de domaine

| Notion | Explication |
|---|---|
| **Registraire** (*registrar*) | l'entreprise qui vend et gère le domaine : Namecheap, OVHcloud, Gandi, Cloudflare Registrar ; pour le `.sn`, un bureau d'enregistrement agréé par le NIC Sénégal |
| **Extension** (TLD) | `.com`, `.dev` (HTTPS obligatoire), `.sn`, `.africa`, `.tech`… |
| **Prix** | un prix la première année, **puis un renouvellement chaque année**, souvent plus cher. Compare toujours le prix de renouvellement |
| **Zone DNS** | là où l'on écrit les enregistrements, en général chez le registraire |

Les conseils :
- un nom court et facile à épeler ;
- active le **renouvellement automatique** : un domaine expiré peut être racheté par quelqu'un d'autre ;
- active la **protection des informations personnelles** (*WHOIS privacy*) si elle est proposée.

## 2. Domaine racine ou sous-domaine

- **Le domaine racine** (*apex*) : `monsite.sn`.
- **Les sous-domaines** : `www.monsite.sn`, `blog.monsite.sn`, `api.monsite.sn`.

On choisit **une adresse principale** et on **redirige** l'autre vers elle. Les hébergeurs le font automatiquement quand on ajoute les deux.

## 3. Les enregistrements DNS à créer

C'est le rappel du cours sur les réseaux :
- un enregistrement **A** fait pointer un nom vers une **adresse IPv4** ;
- un **CNAME** est un **alias** vers un autre nom ;
- un enregistrement **TXT** sert souvent à **prouver** que tu possèdes le domaine.

> **La règle** : pas de CNAME classique sur le domaine racine. La norme DNS l'interdit, car la racine contient déjà d'autres enregistrements (NS, SOA). On y met des enregistrements A, ou l'équivalent « ALIAS » ou « CNAME flattening » si ton fournisseur le propose.

### GitHub Pages

1. Dans le dépôt, ouvre *Settings*, puis *Pages*, et renseigne *Custom domain* (`monsite.sn`). GitHub crée un fichier `CNAME` dans le dépôt.
2. Chez le registraire :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<ton-pseudo>.github.io` |

3. Une fois le DNS vérifié, coche **Enforce HTTPS**.

Les adresses IP ci-dessus sont celles indiquées par la documentation de GitHub. Vérifie-les dans la page « Managing a custom domain for your GitHub Pages site » avant de les saisir.

### Netlify et Vercel

1. Dans le projet, ouvre *Domain management* (Netlify) ou *Settings*, puis *Domains* (Vercel), et ajoute `monsite.sn` et `www.monsite.sn`.
2. **La plateforme affiche les enregistrements exacts à créer.** Copie-les tels quels : en général un **A** ou un ALIAS pour la racine, et un **CNAME** pour `www`, vers le nom fourni.
3. Autre possibilité : déléguer **toute la zone DNS** à l'hébergeur, en remplaçant les serveurs **NS** chez le registraire par ceux de Netlify ou de Vercel. C'est plus simple, mais tous tes enregistrements, y compris ceux de ta messagerie, se gèrent alors chez eux.

> Ne supprime jamais les enregistrements **MX**, qui servent aux e-mails, en modifiant ta zone : ta messagerie sur ce domaine cesserait de fonctionner.

## 4. La propagation et la vérification

Les résolveurs gardent les réponses en **cache** pendant la durée du **TTL**. Après une modification, certains visiteurs voient encore l'ancienne adresse pendant quelques minutes, voire quelques heures. Pour vérifier :

```bash
dig +short monsite.sn A
dig +short www.monsite.sn CNAME
nslookup monsite.sn 8.8.8.8          # interroger directement un résolveur public
curl -I https://monsite.sn           # code 200 ou 301, et en-têtes de l'hébergeur
```

Astuce : avant une migration, baisse le TTL à 300 secondes la veille, pour que le changement se propage plus vite.

## 5. Le HTTPS automatique

Une fois le DNS correct, l'hébergeur obtient **automatiquement et gratuitement** un certificat, le plus souvent via **Let's Encrypt** et le protocole ACME, puis il le **renouvelle** tout seul. Toi, tu n'as qu'à :
- attendre que le statut passe à *Certificate issued* (ou équivalent) ;
- activer la redirection de HTTP vers HTTPS (*Enforce HTTPS* sur GitHub, automatique sur Netlify et Vercel) ;
- corriger le **contenu mixte** : une page HTTPS qui charge une image ou un script en `http://` est bloquée par le navigateur. Utilise des adresses en `https://` ou relatives.

## 6. Le bilan : quel hébergeur pour quel projet ?

| Projet | Hébergeur conseillé |
|---|---|
| Portfolio, site vitrine HTML/CSS | GitHub Pages |
| Application React ou Vue (Vite) | Netlify ou Vercel |
| Application Next.js avec du code serveur | Vercel |
| API et base de données (NestJS, PostgreSQL), plateforme complète | VPS avec Docker Compose, ou Render ou Railway, avec un domaine `api.monsite.sn` |

## Démonstration

1. On part d'un domaine de test et d'un site Netlify.
2. On ajoute le domaine dans Netlify, on copie les enregistrements chez le registraire, et on suit la propagation avec `dig`.
3. Le certificat est émis, et `curl -I http://monsite.sn` renvoie un `301` vers `https://`.
4. On fait la même chose avec un sous-domaine `portfolio.monsite.sn` en CNAME vers un site GitHub Pages.

## Exercice guidé

Sans acheter de domaine, réponds sur ta feuille :

1. Écris la zone DNS pour que `monsite.sn` et `www.monsite.sn` mènent à ton site GitHub Pages `awa221.github.io`.
2. Ajoute `blog.monsite.sn`, qui pointe vers un site Netlify `blog-awa.netlify.app`.
3. Avec `dig`, trouve les enregistrements A de `github.com` et le CNAME de `www.github.com`.

## Exercice autonome

1. Si tu as un domaine, ou avec un domaine gratuit de test, relie-le à l'un de tes sites, avec la racine **et** `www`, en HTTPS.
2. Vérifie avec `dig` et `curl -I`, et capture le statut du certificat.
3. Provoque un contenu mixte (une image en `http://`), observe l'avertissement dans la console, puis corrige.
4. Prépare l'architecture de mise en ligne de la plateforme Saint Stack Academy : quel domaine, quel sous-domaine pour l'API, quel hébergeur pour chaque partie, et quels enregistrements DNS. Rédige-la en 6 lignes.

## Correction

Exercice guidé :

```
monsite.sn.        A      185.199.108.153
monsite.sn.        A      185.199.109.153
monsite.sn.        A      185.199.110.153
monsite.sn.        A      185.199.111.153
www.monsite.sn.    CNAME  awa221.github.io.
blog.monsite.sn.   CNAME  blog-awa.netlify.app.
```

Dans le dépôt, le fichier `CNAME` contient `monsite.sn`. Côté Netlify, il faut aussi **ajouter** `blog.monsite.sn` dans les domaines du site, sans quoi Netlify ne saura pas quel site servir.

Question 3 : `dig +short github.com A` renvoie une ou plusieurs adresses IP, qui varient selon ta région. `dig +short www.github.com` montre un CNAME vers `github.com.`.

Exercice autonome, question 4, une proposition :
- le domaine `saintstack.sn` (ou `.dev`) ;
- le front-end Next.js sur Vercel, à l'adresse racine et `www` ;
- l'API NestJS, la base et les photos sur un VPS avec Docker Compose, derrière Caddy qui gère le HTTPS automatique, à l'adresse `api.saintstack.sn` (un enregistrement A vers l'IP du VPS) ;
- la variable `NEXT_PUBLIC_API_URL=https://api.saintstack.sn/api` ;
- le MX de la messagerie conservé ;
- le renouvellement automatique du domaine activé.

## Pour aller plus loin

- **Cloudflare** : un DNS gratuit et rapide, un proxy et une protection contre les attaques par déni de service, devant n'importe quel hébergeur.
- **Les e-mails sur ton domaine** (`contact@monsite.sn`) : enregistrements MX, SPF, DKIM et DMARC, pour que tes messages n'arrivent pas en spam.
- C'est la fin du parcours « Mettre son site en ligne ». La suite logique est le parcours DevOps, pour déployer des applications complètes avec Docker et la CI/CD.
