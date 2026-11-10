---
slug: s07-1-power-bi
titre: Power BI, du modèle en étoile au tableau de bord
domaine: Data
duree: 150
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Décisionnel et IA", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 13 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Connecter Power BI Desktop à PostgreSQL et choisir entre Import et DirectQuery
  - Préparer les données avec Power Query (types, colonnes, étapes appliquées)
  - Construire le modèle (relations, cardinalité, direction du filtre, table de dates)
  - Écrire des mesures DAX essentielles (SUM, DIVIDE, CALCULATE, intelligence temporelle)
  - Concevoir un rapport lisible et le publier dans le service Power BI
prerequis:
  - Séances « Modélisation des données » et « dbt » (le schéma en étoile gold)
  - Power BI Desktop (gratuit, Windows ; sous macOS ou Linux, utiliser une VM Windows)
referentiels:
  - Microsoft PL-300 « Power BI Data Analyst », domaines « Prepare the data », « Model the data », « Visualize and analyze the data » et « Deploy and maintain assets »
  - SQLBI (Russo et Ferrari), « The Definitive Guide to DAX »
  - Stephen Few, « Information Dashboard Design »
quiz:
  - question: "Quelle différence entre une colonne calculée et une mesure en DAX ?"
    choix: ["Aucune", "La colonne calculée est calculée ligne par ligne et stockée ; la mesure est calculée à la volée selon les filtres du visuel", "La mesure est stockée", "La colonne calculée n'existe pas"]
    reponse: 1
    explication: "On privilégie les mesures pour les agrégats (CA, marge, %) : elles réagissent aux filtres et ne prennent pas de place."
  - question: "Dans un modèle en étoile, quelle cardinalité relie dim_produits à fct_ventes ?"
    choix: ["Plusieurs à plusieurs", "Un à plusieurs (une dimension, plusieurs ventes)", "Un à un", "Aucune relation"]
    reponse: 1
    explication: "Côté dimension, la clé est unique ; côté faits, elle se répète. Le filtre se propage de la dimension vers les faits."
  - question: "Pourquoi écrire DIVIDE([Marge], [CA]) plutôt que [Marge] / [CA] ?"
    choix: ["C'est plus rapide à taper", "DIVIDE gère la division par zéro (renvoie vide au lieu d'une erreur)", "La barre oblique n'existe pas en DAX", "Pour arrondir"]
    reponse: 1
    explication: "Un mois sans vente donnerait une erreur ; DIVIDE renvoie BLANK ou une valeur de remplacement."
  - question: "Que fait CALCULATE([CA], dim_produits[categorie] = \"Vêtements\") ?"
    choix: ["Il filtre la table définitivement", "Il calcule le CA en modifiant le contexte de filtre pour ne garder que les Vêtements", "Il supprime les autres catégories", "Il crée une colonne"]
    reponse: 1
    explication: "CALCULATE est la fonction centrale de DAX : elle évalue une expression dans un contexte de filtre modifié."
  - question: "Quel est l'intérêt d'une table de dates marquée comme telle ?"
    choix: ["Décorer le rapport", "Permettre les fonctions d'intelligence temporelle (cumul annuel, même période l'an dernier)", "Accélérer l'import", "Elle est inutile"]
    reponse: 1
    explication: "TOTALYTD, SAMEPERIODLASTYEAR, DATEADD exigent une table de dates continue liée aux faits."
---

## La place de Power BI

C'est le dernier maillon de la chaîne que tu as construite :

```
Sources ──ETL (Python)──▶ silver ──dbt──▶ gold (étoile) ──Power BI──▶ tableau de bord pour la direction
                       orchestré par Airflow chaque nuit
```

**Power BI** (Microsoft) est l'outil de *business intelligence* le plus répandu en entreprise. Ses concurrents sont Tableau, Looker et, en libre, Metabase ou Superset.

| Élément | Rôle |
|---|---|
| **Power BI Desktop** | construire le modèle et le rapport (gratuit, sous Windows) |
| **Service Power BI** (app.powerbi.com) | publier, partager, actualiser |
| **Power Query** (langage M) | préparer les données |
| **DAX** | écrire les calculs (mesures) |

## Se connecter à l'entrepôt

*Obtenir les données*, puis **PostgreSQL** : on indique le serveur `localhost:5434` et la base `postgres`, puis on sélectionne les tables du schéma **gold** (`fct_ventes`, `dim_clients`, `dim_produits`, `dim_date`).

| Mode | Fonctionnement | Quand l'utiliser |
|---|---|---|
| **Import** | les données sont copiées et compressées dans le fichier `.pbix` | par défaut : rapide, toutes les fonctions DAX |
| **DirectQuery** | chaque visuel interroge la base en direct | volumes énormes, ou besoin de données en temps réel |

Le service Power BI accède à une base **locale** grâce à une **passerelle** (*on-premises data gateway*).

## Power Query : préparer

Dans *Transformer les données*, chaque action devient une **étape appliquée**, rejouée à chaque actualisation. C'est un petit pipeline ETL :

- vérifier les **types** (date, nombre entier, texte) ; c'est la première cause d'erreurs ;
- renommer les colonnes avec des noms lisibles par le métier (`montant` devient « Montant (FCFA) ») ;
- supprimer les colonnes inutiles, qui alourdissent le modèle.

> Grâce à dbt, la couche gold est **déjà propre**. Power Query doit rester léger. La règle : « transformer le plus en amont possible, et autant que nécessaire en aval ».

## Le modèle

Dans la **vue Modèle**, on obtient l'étoile de la séance du 8 décembre :

```
dim_date ──1───*── fct_ventes ──*───1── dim_produits
                       │
                       *
                       │
                       1
                   dim_clients
```

- **La cardinalité** : de un à plusieurs (`1:*`), de la dimension vers les faits.
- **La direction du filtre** : **unique**, de la dimension vers les faits. On évite le filtrage bidirectionnel, source d'ambiguïtés et de lenteurs.
- **La table de dates** : `dim_date`, qu'on **marque** comme table de dates (*Outils de table*, puis *Marquer comme table de dates*). Elle doit être continue : un jour par ligne, sans trou.
- On masque les clés techniques (`client_sk`…) dans la vue Rapport.

## DAX : les mesures

Une **mesure** est calculée **à la volée**, selon les filtres actifs (segments, axes, lignes du tableau). C'est le **contexte de filtre**.

```dax
CA = SUM ( fct_ventes[montant] )

Nb commandes = DISTINCTCOUNT ( fct_ventes[commande_id] )

Panier moyen = DIVIDE ( [CA], [Nb commandes] )

CA Vêtements = CALCULATE ( [CA], dim_produits[categorie] = "Vêtements" )

Part du CA = DIVIDE ( [CA], CALCULATE ( [CA], ALL ( dim_produits ) ) )

CA cumul annuel = TOTALYTD ( [CA], dim_date[jour] )

CA mois précédent = CALCULATE ( [CA], DATEADD ( dim_date[jour], -1, MONTH ) )

Évolution % = DIVIDE ( [CA] - [CA mois précédent], [CA mois précédent] )
```

**L'exemple chiffré**, avec les données de la boutique :
- **CA** = 211 000 ;
- **Nb commandes** = 4 ;
- **Panier moyen** = 211 000 / 4 = **52 750** ;
- sur la ligne « Vêtements » d'un tableau par catégorie, **Part du CA** = 141 000 / 211 000 = **66,8 %**.

`ALL(dim_produits)` **retire** le filtre de catégorie au dénominateur, pour diviser par le total.

| | Colonne calculée | Mesure |
|---|---|---|
| Calcul | ligne par ligne, à l'actualisation | à la volée, selon les filtres |
| Stockage | oui (alourdit le modèle) | non |
| Usage | attribut pour filtrer ou trier (tranche de prix) | agrégat (CA, %, moyenne) |

**CALCULATE** est la fonction la plus importante de DAX : elle évalue une expression dans un **contexte de filtre modifié**. Les fonctions `ALL`, `REMOVEFILTERS`, `FILTER` et `KEEPFILTERS` permettent d'ajuster ce contexte.

## Le rapport

Les **principes d'un bon tableau de bord** (Stephen Few) :

1. **Une question par page**, et les indicateurs clés **en haut à gauche** : c'est là que l'œil se pose d'abord.
2. **Le bon visuel pour la bonne question** : une courbe pour une évolution, des barres pour comparer, un tableau pour le détail. Le camembert est réservé à 2 ou 3 parts au maximum.
3. **Des titres qui disent quoi retenir**, comme « Le CA de novembre progresse de 85 % ». Un titre comme « CA par mois » ne dit rien.
4. **Peu de couleurs**, et la couleur au service du sens : une couleur d'alerte uniquement pour ce qui est en retard.
5. **Des segments** (filtres) visibles : période, région, catégorie.
6. **L'accessibilité** : des contrastes suffisants, du texte alternatif sur les visuels, un ordre de tabulation logique.

La structure type de la page « Ventes » :

- **une ligne de cartes** : CA, nombre de commandes, panier moyen, évolution % ;
- **une courbe** : le CA par mois, avec le cumul annuel ;
- **des barres** : le CA par catégorie, triées ;
- **un tableau** : le top 10 des clients ;
- **des segments** : l'année, le mois et la région.

## Publier

- *Publier* envoie le rapport dans un **espace de travail** du service Power BI.
- **L'actualisation planifiée** : par exemple chaque jour à 7 h, après le pipeline Airflow de 2 h.
- **La sécurité au niveau des lignes** (RLS) : un rôle « Région Ouest » avec le filtre DAX `dim_clients[region] = "Ouest"`. Un commercial ne voit alors que sa région.
- **Le partage** se fait par applications ou par espaces de travail. La licence Pro est nécessaire pour partager ; la publication sur le Web rend le rapport **public**, et est à proscrire pour des données d'entreprise.

## Démonstration

1. On connecte Power BI à la couche gold.
2. On vérifie les types dans Power Query.
3. On construit les relations et on marque la table de dates.
4. On écrit les mesures CA, Panier moyen, Part du CA et Évolution %.
5. On construit la page « Ventes ».
6. On vérifie que les chiffres sont identiques à ceux obtenus en SQL (211 000, 141 000, 66,8 %).

## Exercice guidé

1. Crée les mesures `Nb clients actifs` (clients distincts ayant acheté) et `CA par client` (CA divisé par le nombre de clients actifs).
2. Crée une colonne calculée `Gamme` dans `dim_produits` : « Premium » si le prix catalogue est d'au moins 20 000, « Standard » sinon.
3. Affiche le CA par gamme et par catégorie dans une matrice.

## Exercice autonome

Construis le rapport « Pilotage des ventes » sur ta couche gold (ou sur le jeu de données Superstore de la semaine 4) :

1. **Page 1, Synthèse** : 4 cartes, une courbe du CA mensuel avec le cumul, des barres par catégorie et des segments.
2. **Page 2, Clients** : le top 10, la répartition par région et le panier moyen par région.
3. **Les mesures** : CA, Nb commandes, Panier moyen, Part du CA, CA cumul annuel et Évolution % par rapport au mois précédent.
4. Un rôle RLS par région, testé avec *Afficher en tant que*.
5. Des titres de visuels qui énoncent une conclusion.
6. La publication dans ton espace de travail (compte gratuit ou d'essai), avec une capture pour ton portfolio.

## Correction

Exercice guidé :

```dax
Nb clients actifs = DISTINCTCOUNT ( fct_ventes[client_id] )
CA par client = DIVIDE ( [CA], [Nb clients actifs] )
Gamme = IF ( dim_produits[prix_catalogue] >= 20000, "Premium", "Standard" )
```

La vérification : il y a 3 clients actifs (Awa, Fatou, Ibrahima), donc **CA par client** = 211 000 / 3 ≈ **70 333**. C'est la même valeur que la moyenne des totaux calculée en SQL le 24 décembre.

Exercice autonome, l'évolution en % et le piège du premier mois : pour octobre, il n'y a pas de mois précédent. `DIVIDE` renvoie alors un résultat vide au lieu d'une erreur ou d'un « infini ». Le visuel affiche un tiret, ce qui est le comportement attendu.

Le rôle RLS se définit dans *Modélisation*, puis *Gérer les rôles*, avec un rôle « Ouest » et le filtre `[region] = "Ouest"` sur `dim_clients`. Avec *Afficher en tant que Ouest*, seuls les clients de Dakar et de Thiès apparaissent.

## Pour aller plus loin

- Le complément **Power BI approfondi** du 31 décembre traite du DAX avancé, des groupes de calcul, de l'optimisation avec DAX Studio et des paramètres de champ.
- La certification **PL-300** est un objectif accessible après ce parcours, et très demandé.
- Demain : Spark, quand les données ne tiennent plus sur une seule machine.
