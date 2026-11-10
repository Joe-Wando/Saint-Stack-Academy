---
slug: g08-1-postgresql-modelisation
titre: PostgreSQL, modéliser et normaliser une base de données
domaine: Bases de données
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }
parcours:
  - { parcours: web, ordre: 12 }
ordre: 5
prerequis_cours: []
visibilite: public
objectifs:
  - Passer d'un besoin métier à un modèle entité-association (entités, attributs, cardinalités)
  - Traduire le modèle en tables (clés primaires, étrangères, tables d'association)
  - Appliquer les formes normales 1FN, 2FN et 3FN pour éliminer les redondances
  - Choisir les bons types et contraintes PostgreSQL (NOT NULL, UNIQUE, CHECK, ON DELETE)
  - Écrire le script DDL et le faire évoluer avec des migrations
prerequis:
  - Séances SQL de la semaine 7
referentiels:
  - Oracle Database SQL Certified Associate (1Z0-071), domaine « Creating Tables and Constraints »
  - E. F. Codd, modèle relationnel (1970) et formes normales
  - Documentation PostgreSQL 16, chapitre 5 « Data Definition »
quiz:
  - question: "Une commande contient plusieurs produits, un produit figure dans plusieurs commandes. Comment le représenter ?"
    choix: ["Une colonne produits avec une liste dans commandes", "Une table d'association lignes_commande (commande_id, produit_id, quantité)", "Dupliquer la commande pour chaque produit", "Une colonne commande dans produits"]
    reponse: 1
    explication: "Une relation plusieurs-à-plusieurs se traduit toujours par une table d'association avec deux clés étrangères."
  - question: "Qu'interdit la première forme normale (1FN) ?"
    choix: ["Les clés primaires", "Les valeurs multiples dans une même colonne (« 0612, 0778 »)", "Les dates", "Les jointures"]
    reponse: 1
    explication: "Chaque cellule contient une valeur atomique ; plusieurs téléphones vont dans une table à part."
  - question: "La table commandes contient client_id, client_nom et client_ville. Quel problème ?"
    choix: ["Aucun", "Redondance : les informations du client dépendent de client_id et non de la commande (violation de la 3FN)", "Trop de colonnes", "Il manque un index"]
    reponse: 1
    explication: "Si Awa déménage, il faudrait modifier toutes ses commandes ; on garde seulement client_id et on joint la table clients."
  - question: "Quel type choisir pour un montant en FCFA ?"
    choix: ["float", "integer ou numeric (jamais float pour de l'argent)", "text", "date"]
    reponse: 1
    explication: "float introduit des erreurs d'arrondi (0,1 + 0,2 ≠ 0,3) ; le FCFA n'ayant pas de centimes, integer ou bigint suffit."
  - question: "Que fait ON DELETE CASCADE sur lignes_commande.commande_id ?"
    choix: ["Il empêche la suppression", "Supprimer une commande supprime automatiquement ses lignes", "Il supprime le client", "Il archive la commande"]
    reponse: 1
    explication: "RESTRICT (par défaut) refuserait la suppression ; SET NULL viderait la clé ; CASCADE propage."
---

## L'idée

Jusqu'ici, on a **interrogé** des bases qui existaient déjà. Aujourd'hui, on **conçoit** la sienne. Une base mal conçue produit des données incohérentes (le même client avec deux adresses différentes), des requêtes compliquées et des bugs difficiles à corriger. Une heure de modélisation évite des semaines de corrections.

La démarche suit quatre étapes :

1. le **besoin métier** ;
2. le **modèle conceptuel** (entités et associations) ;
3. les **tables** (modèle logique) ;
4. le **script SQL** (modèle physique).

## Étape 1 : le besoin

> Une école de code organise des **formations**. Chaque formation a plusieurs **sessions** (dates, salle). Des **apprenants** s'inscrivent à des sessions et paient un montant, éventuellement avec une remise. Chaque session est animée par **un formateur**. On veut aussi garder les **téléphones** des apprenants (souvent plusieurs).

On repère les **noms** (les entités probables) et les **verbes** (les associations).

## Étape 2 : le modèle entité-association

```
 FORMATION 1 ──── a ──── * SESSION * ──── animée par ──── 1 FORMATEUR
                              *
                              │ inscription (montant, remise, date)
                              *
                          APPRENANT 1 ──── possède ──── * TELEPHONE
```

| Cardinalité | Lecture | Traduction en tables |
|---|---|---|
| **1 – plusieurs** | une formation a plusieurs sessions | clé étrangère `formation_id` **côté plusieurs** (dans `sessions`) |
| **plusieurs – plusieurs** | un apprenant suit plusieurs sessions, une session a plusieurs apprenants | **table d'association** `inscriptions` |
| **1 – 1** | (rare) | clé étrangère avec `UNIQUE`, ou fusion des deux tables |

Une association plusieurs-à-plusieurs peut porter **ses propres attributs** : le montant payé appartient à l'**inscription**, et non à l'apprenant ni à la session.

## Étape 3 : la normalisation

La normalisation élimine les **redondances**, qui provoquent des **anomalies** de mise à jour, d'insertion et de suppression.

Le point de départ est une table « tout-en-un », comme on en voit dans Excel :

| inscription | apprenant | telephones | formation | prix_formation | formateur | formateur_tel |
|---|---|---|---|---|---|---|
| 1 | Awa Diop | 77 111, 76 222 | DevOps | 150 000 | Olivier | 78 999 |
| 2 | Awa Diop | 77 111, 76 222 | Data | 180 000 | Olivier | 78 999 |

**1FN, des valeurs atomiques.** La colonne `telephones` contient deux valeurs : c'est interdit. On crée la table `telephones (apprenant_id, numero)`.

**2FN, pas de dépendance à une partie de la clé.** Dans une table dont la clé est composée, comme (`apprenant_id`, `session_id`), une colonne comme `prix_formation` ne dépend que de la session, c'est-à-dire d'une **partie** de la clé. On la déplace dans la bonne table.

**3FN, pas de dépendance entre colonnes non-clés.** `formateur_tel` dépend de `formateur`, pas de l'inscription. Le formateur devient une table à part.

> La règle mnémotechnique : chaque colonne dépend **de la clé, de toute la clé, et de rien d'autre que la clé**.

**Le gain, chiffré** : si Awa change de numéro, il faut modifier 1 ligne dans `telephones`, contre une ligne **par inscription** dans la table « tout-en-un ». Avec 12 inscriptions, cela fait 12 modifications, et une seule oubliée suffit à rendre les données incohérentes.

**La dénormalisation volontaire** se pratique dans un entrepôt de données (le schéma en étoile), pour accélérer la lecture. Dans une base **transactionnelle**, on vise la 3FN.

## Étape 4 : le script PostgreSQL

```sql
CREATE TABLE formateurs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom        text NOT NULL,
  email      text NOT NULL UNIQUE,
  telephone  text
);

CREATE TABLE formations (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  intitule   text NOT NULL UNIQUE,
  prix       integer NOT NULL CHECK (prix > 0),      -- FCFA : pas de centimes
  duree_h    smallint NOT NULL CHECK (duree_h BETWEEN 1 AND 500)
);

CREATE TABLE sessions (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  formation_id bigint NOT NULL REFERENCES formations(id) ON DELETE RESTRICT,
  formateur_id bigint NOT NULL REFERENCES formateurs(id),
  debut        date NOT NULL,
  fin          date NOT NULL,
  places       smallint NOT NULL DEFAULT 20,
  CHECK (fin >= debut)
);

CREATE TABLE apprenants (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom         text NOT NULL,
  email       text NOT NULL UNIQUE,
  cree_le     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE telephones (
  apprenant_id bigint NOT NULL REFERENCES apprenants(id) ON DELETE CASCADE,
  numero       text NOT NULL,
  PRIMARY KEY (apprenant_id, numero)
);

CREATE TABLE inscriptions (
  apprenant_id bigint NOT NULL REFERENCES apprenants(id) ON DELETE CASCADE,
  session_id   bigint NOT NULL REFERENCES sessions(id),
  inscrit_le   timestamptz NOT NULL DEFAULT now(),
  montant_paye integer NOT NULL CHECK (montant_paye >= 0),
  remise_pct   numeric(5,2) NOT NULL DEFAULT 0 CHECK (remise_pct BETWEEN 0 AND 100),
  PRIMARY KEY (apprenant_id, session_id)            -- un apprenant ne s'inscrit qu'une fois à une session
);
```

### Bien choisir les types

| Donnée | Type | À éviter |
|---|---|---|
| Identifiant | `bigint GENERATED ALWAYS AS IDENTITY`, ou `uuid` | |
| Argent | `integer` ou `bigint` (FCFA), `numeric(12,2)` (euros) | `float`, `real` |
| Texte | `text` (sans limite artificielle) | `char(n)` |
| Date seule | `date` | du texte |
| Instant précis | `timestamptz` (avec fuseau) | `timestamp` sans fuseau |
| Oui ou non | `boolean` | `'O'` et `'N'` |
| Données semi-structurées | `jsonb` | du JSON stocké en texte |

### Les contraintes, le dernier rempart

`NOT NULL`, `UNIQUE`, `CHECK`, `REFERENCES` : la base **refuse** les données incohérentes, même si l'application a un bug. La validation dans l'API ne suffit pas, car plusieurs applications ou scripts peuvent écrire dans la même base.

**Le comportement à la suppression** (`ON DELETE`) :

| Option | Effet |
|---|---|
| `RESTRICT` (par défaut) | refuse la suppression si des lignes dépendent de celle-ci |
| `CASCADE` | supprime les lignes dépendantes |
| `SET NULL` | vide la clé étrangère |

## Les migrations

Une base évolue avec l'application. Chaque changement de structure est un **fichier de migration**, versionné dans Git et appliqué dans l'ordre, sur tous les environnements :

```
migrations/
├── 001_creation_initiale.sql
├── 002_ajout_colonne_ville.sql      ALTER TABLE apprenants ADD COLUMN ville text;
└── 003_index_email.sql
```

Les outils : Flyway, Liquibase, ou les migrations de Prisma, TypeORM et Django. On ne modifie **jamais** une base de production « à la main ».

## Démonstration

1. On part du tableau « tout-en-un ».
2. On repère en direct les anomalies, puis on normalise étape par étape (1FN, 2FN, 3FN).
3. On dessine le modèle sur dbdiagram.io.
4. On exécute le script, puis on tente d'insérer des données invalides (prix négatif, e-mail en double, double inscription) et on lit les erreurs de PostgreSQL.

## Exercice guidé

Normalise cette table jusqu'à la 3FN et donne le script `CREATE TABLE` :

| id_location | client | tel_client | voiture_immat | modele | marque | date_debut | date_fin | prix_jour |
|---|---|---|---|---|---|---|---|---|

Le prix par jour dépend du modèle de la voiture.

## Exercice autonome

Modélise la base du mini-projet de groupe, enrichi d'**événements** : un membre peut organiser des événements, s'inscrire à ceux des autres, et chaque événement a des **tags** (plusieurs par événement).

1. Le modèle entité-association, avec les cardinalités.
2. La vérification de la 3FN, en justifiant chaque table.
3. Le script DDL complet, avec types, clés et contraintes (un événement a une capacité positive ; on ne s'inscrit pas deux fois).
4. Trois fichiers de migration : création, ajout d'une colonne `lieu`, ajout d'une contrainte `CHECK` sur les dates.
5. Un jeu de données de test et 3 requêtes : les événements à venir avec leur nombre d'inscrits, les membres les plus actifs, et les tags les plus utilisés.

## Correction

Exercice guidé :

```sql
CREATE TABLE clients  (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nom text NOT NULL, telephone text);
CREATE TABLE marques  (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nom text NOT NULL UNIQUE);
CREATE TABLE modeles  (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, marque_id bigint NOT NULL REFERENCES marques(id),
                       nom text NOT NULL, prix_jour integer NOT NULL CHECK (prix_jour > 0), UNIQUE (marque_id, nom));
CREATE TABLE voitures (immatriculation text PRIMARY KEY, modele_id bigint NOT NULL REFERENCES modeles(id));
CREATE TABLE locations (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        client_id bigint NOT NULL REFERENCES clients(id),
                        immatriculation text NOT NULL REFERENCES voitures(immatriculation),
                        date_debut date NOT NULL, date_fin date NOT NULL, CHECK (date_fin >= date_debut));
```

Pourquoi chaque table :

- `tel_client` dépend du client ;
- `modele` dépend de la voiture ;
- `marque` et `prix_jour` dépendent du modèle.

Ce sont autant de dépendances **entre colonnes non-clés** (violation de la 3FN), qui deviennent des tables séparées.

Pour retrouver le prix d'une location, on calcule `(date_fin - date_debut + 1) * prix_jour` par jointure. On le stocke **aussi** dans `locations` si le tarif peut changer et qu'on veut figer le prix au moment de la réservation : c'est une redondance **volontaire**, historique.

Exercice autonome, les tables clés :

- `evenements (id, organisateur_id → membres, titre, debut, fin, capacite CHECK > 0)` ;
- `participations (membre_id, evenement_id, PRIMARY KEY (membre_id, evenement_id))` ;
- `tags (id, libelle UNIQUE)` ;
- `evenements_tags (evenement_id, tag_id, PRIMARY KEY (evenement_id, tag_id))`.

## Pour aller plus loin

- La forme normale de Boyce-Codd (BCNF) et la 4FN traitent des cas plus rares.
- Les outils de diagramme dbdiagram.io et DrawSQL génèrent le SQL à partir du schéma.
- Demain : les index, les transactions et les sauvegardes, pour une base rapide et fiable.
