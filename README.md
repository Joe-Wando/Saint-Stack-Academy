# Saint Stack Academy

Une plateforme ouverte à tous les étudiants en informatique, quelle que soit leur école : des cours en chapitres, des exercices corrigés, des quiz corrigés par le serveur et le suivi de sa progression. Chacun avance à son rythme, sans calendrier.

Les cours sont rangés de deux façons :
- **la licence** : L1, L2, puis L3 avec trois options, découpées en semestres et en unités d'enseignement (UE) ;
- **les parcours métiers** : Développeur web, Ingénieur DevOps, Data engineer, Administrateur systèmes et réseaux.

Les contenus s'appuient sur des références internationales (ACM/IEEE CS2023, ACM IT2017, ECTS, Cisco CCNA, CompTIA, LPI, ISTQB, Scrum Guide, OWASP, certifications cloud et data).

- **web/** : Next.js 15 et React 19 (interface)
- **api/** : NestJS 11 (API REST, authentification JWT, vérification de l'e-mail, correction des quiz, suivi)
- **content/referentiel.yaml** : la structure L1, L2, L3 et des parcours (source de vérité)
- **content/lessons/** : un cours = un fichier Markdown avec un en-tête YAML
- **PostgreSQL 16** : comptes, progression, notes

## Lancer avec Docker (recommandé)

```bash
cp .env.example .env      # puis remplir les valeurs
docker compose up -d --build
```

- Interface : http://localhost:3000
- API : http://localhost:4000/api/sante

**Premier lancement** : crée ton compte avec l'adresse définie dans `ADMIN_EMAIL` (l'ancien nom `FORMATEUR_EMAIL` reste accepté) : il reçoit automatiquement le rôle admin. Tous les autres comptes sont apprenants. L'inscription est libre, avec une vérification de l'adresse e-mail.

## Les e-mails (vérification et mot de passe oublié)

- **En développement**, laisse `SMTP_HOST` vide : les liens ne sont pas envoyés, ils sont écrits dans le journal de l'API. On les récupère avec `docker compose logs api`.
- **En production**, deux options simples :
  - **Brevo** (gratuit jusqu'à 300 e-mails par jour) : crée un compte, vérifie ton domaine ou ton adresse d'expéditeur, puis renseigne `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, et les identifiants SMTP donnés par Brevo dans `SMTP_USER` et `SMTP_PASS`.
  - **Gmail** : active la validation en deux étapes, crée un **mot de passe d'application**, puis renseigne `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=ton.adresse@gmail.com` et `SMTP_PASS=<mot de passe d'application>`.
- `SMTP_FROM` est l'expéditeur affiché, et `WEB_URL` sert à construire les liens envoyés (en production, l'adresse https du site).

## Rôles

| Rôle | Voit | Espace |
|---|---|---|
| Admin | tous les cours, y compris les cours privés | Accueil, Licence, Parcours, Catalogue, Mes cours, Statistiques |
| Apprenant | tous les cours publics | Accueil (son niveau), Licence, Parcours, Catalogue, Mon profil |

L'admin dispose d'une section **Administration** (`/admin`) : tableau de bord, utilisateurs (avec leur photo et leur avancement), fiche de chaque compte (suspension, rôle, vérification, suppression), statistiques des cours, messages reçus et « Mes cours ». Chaque action sur un compte est enregistrée dans un journal. C'est annoncé aux apprenants dans la page `/confidentialite` (loi sénégalaise n° 2008-12), qu'ils acceptent à l'inscription.

## Profil, photos et contact

- **Profil** (`/profil`) : l'évolution de chacun (activité sur 12 semaines, quiz, compétences, jalons, notes), ses informations et sa photo, la sécurité du compte (mot de passe, adresse e-mail, export de ses données en JSON, suppression).
- **Photos de profil** : JPEG, PNG ou WebP de 2 Mo au plus, vérifiées par leur contenu, recadrées en 512 × 512 et converties en WebP sans métadonnées. Elles sont stockées dans le volume Docker `uploads` (`UPLOADS_DIR`, par défaut `/data/uploads`) : un `docker compose down` ne les efface pas, contrairement à `docker compose down -v`.
- **Contact** (`/contact`) : les coordonnées affichées se modifient dans `web/src/lib/contact.ts`. Les messages arrivent dans `/admin/messages`, et en copie par e-mail si le SMTP est configuré.
- **Recharger les cours** : après avoir modifié `content/`, le bouton « Recharger les cours » de `/admin/cours` relit les fichiers sans redémarrer l'API.

## Ajouter ou modifier un cours

1. Crée `content/lessons/<slug>.md`, en copiant un cours existant pour respecter la structure. Le nom du fichier doit être identique au `slug`.
2. Dans l'en-tête, place le cours :
   - `licence` : la liste de ses emplacements, par exemple `{ niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }` (ajoute `option: big-data-ia` pour une UE d'option de L3). Le titre de l'UE doit être identique à celui de `content/referentiel.yaml` ;
   - `parcours` : par exemple `{ parcours: data, ordre: 3 }` ;
   - `ordre` : l'ordre conseillé dans l'UE ; `prerequis_cours` : les slugs à connaître avant ; `visibilite` : `public` ou `prive` (visible par l'admin seulement) ;
   - `difficulte` : découverte, bases ou opérationnel.
   Une UE sans cours affiche « Cours en préparation » : la remplir ne demande aucune modification du code.
3. Le quiz est dans l'en-tête. `reponse` est l'indice (à partir de 0) du bon choix. Les réponses ne sont jamais envoyées au navigateur.
4. Une section `## Correction` est masquée jusqu'au clic de l'apprenant.
5. Redémarre l'API pour recharger les cours : `docker compose restart api`.
6. Régénère les diaporamas PowerPoint (`web/public/diaporamas/<slug>.pptx`, commités ; les cours privés n'en ont pas) : `npm install` puis `npm run diaporamas` à la racine. Pour un seul cours : `node tools/generer-diaporamas.mjs <slug>`.

La migration des anciens cours (champs `piste`, `semaine`, `date`) vers ce format est faite par `node tools/migrer-cours.mjs`, à partir de `placement-cours.json`. Elle est idempotente.

Structure d'un cours :
- Objectifs
- Le cours (une notion à la fois, avec un exemple chiffré)
- Démonstration
- Exercice guidé
- Exercice autonome
- Correction
- Pour aller plus loin
- Quiz de 5 questions

## Déployer en ligne

Sur un serveur Linux (VPS) avec Docker :

1. Clone le dépôt, puis crée `.env` avec des secrets forts : `openssl rand -base64 48`.
2. Définis `WEB_URL` et `API_URL` avec tes domaines en **https**.
3. Ajoute un reverse proxy avec HTTPS automatique (Caddy ou Traefik) devant les ports 3000 et 4000.
4. Lance `docker compose up -d --build`.
5. Sauvegarde la base chaque nuit avec `pg_dump`, en suivant le cours « PostgreSQL, index, transactions et sauvegardes ».

En production, l'API refuse de démarrer si `JWT_SECRET` a gardé sa valeur par défaut.

## Développement local sans Docker

```bash
cd api && npm install && npm run build && DATABASE_URL=postgres://... CONTENT_DIR=../content npm start
cd web && npm install && npm run dev
```
