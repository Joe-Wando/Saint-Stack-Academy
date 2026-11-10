---
slug: c09-power-bi-approfondi
titre: "Complément : Power BI approfondi, DAX avancé, performance et gouvernance"
piste: complement
semaine: 8
date: 2026-12-31
domaine: Data
duree: 150
niveau: opérationnel
objectifs:
  - Maîtriser contexte de ligne, contexte de filtre et transition de contexte
  - Écrire des mesures avancées avec variables, itérateurs (SUMX, RANKX) et manipulation du contexte
  - Utiliser l'intelligence temporelle avancée et les groupes de calcul
  - Diagnostiquer et optimiser un modèle (VertiPaq, Performance Analyzer, DAX Studio)
  - Gouverner : RLS dynamique, actualisation incrémentielle, déploiement par environnements
prerequis:
  - Séance solo « Power BI, du modèle en étoile au tableau de bord »
referentiels:
  - Microsoft PL-300 « Power BI Data Analyst » (niveau avancé des domaines « Model » et « Deploy and maintain »)
  - Microsoft DP-600 « Fabric Analytics Engineer » (modélisation sémantique et optimisation)
  - SQLBI (Russo et Ferrari), « The Definitive Guide to DAX », 2e édition
quiz:
  - question: "Que fait SUMX(fct_ventes, fct_ventes[quantite] * fct_ventes[prix_unitaire]) ?"
    choix: ["Il additionne deux colonnes", "Il itère sur chaque ligne de la table, calcule l'expression, puis additionne les résultats", "Il crée une colonne", "Il filtre la table"]
    reponse: 1
    explication: "Les fonctions en X (SUMX, AVERAGEX, MAXX) créent un contexte de ligne pour chaque ligne de la table."
  - question: "Qu'est-ce que la transition de contexte ?"
    choix: ["Le passage d'une page à l'autre", "La conversion du contexte de ligne en contexte de filtre quand une mesure ou CALCULATE est évaluée dans un itérateur", "Un changement de thème", "Une erreur DAX"]
    reponse: 1
    explication: "Dans AVERAGEX(VALUES(dim_clients[client_id]), [CA]), la mesure [CA] est filtrée sur chaque client grâce à la transition."
  - question: "Pourquoi utiliser VAR dans une mesure ?"
    choix: ["C'est obligatoire", "Pour calculer une valeur une seule fois, la réutiliser et rendre la mesure lisible", "Pour créer une table", "Pour la sécurité"]
    reponse: 1
    explication: "Une variable est évaluée une fois, dans le contexte où elle est définie ; c'est plus rapide et plus clair."
  - question: "Quel facteur réduit le plus la taille d'un modèle importé ?"
    choix: ["Ajouter des colonnes calculées", "Supprimer les colonnes inutiles et réduire la cardinalité (par exemple séparer date et heure)", "Ajouter des visuels", "Utiliser plus de pages"]
    reponse: 1
    explication: "Le moteur VertiPaq compresse par colonne : une colonne à forte cardinalité (identifiants, horodatages précis) pèse lourd."
  - question: "À quoi sert la RLS dynamique avec USERPRINCIPALNAME() ?"
    choix: ["À changer la langue", "À filtrer automatiquement les données selon l'utilisateur connecté, avec une seule règle", "À accélérer l'actualisation", "À exporter en PDF"]
    reponse: 1
    explication: "Une table de correspondance e-mail ↔ région suffit, sans créer un rôle par région."
---

## Le cœur de DAX : les contextes

Toute la difficulté de DAX tient en deux notions :

| Contexte | Origine | Question |
|---|---|---|
| **Contexte de filtre** | les axes et les segments du visuel, les filtres, `CALCULATE` | **quelles lignes** sont visibles ? |
| **Contexte de ligne** | une colonne calculée, ou un itérateur (`SUMX`, `FILTER`…) | **quelle ligne** est en cours de traitement ? |

Un contexte de ligne **ne filtre pas** automatiquement les autres tables. Pour le convertir en filtre, il faut `CALCULATE`, que les **mesures** contiennent implicitement. C'est la **transition de contexte**.

```dax
-- CA moyen par client : on itère sur les clients ; [CA] est filtré sur chaque client par transition de contexte
CA moyen par client = AVERAGEX ( VALUES ( dim_clients[client_id] ), [CA] )
```

L'exemple chiffré avec la boutique : les clients actifs ont des CA de 74 000, 67 000 et 70 000. Leur moyenne vaut 211 000 / 3 ≈ **70 333**. Si l'on écrivait `AVERAGE(fct_ventes[montant])`, on obtiendrait la moyenne **par ligne de vente**, soit 211 000 / 7 ≈ 30 143. Ce n'est **pas** la même question.

## Les variables et les itérateurs

```dax
Marge % =
VAR CA = SUMX ( fct_ventes, fct_ventes[quantite] * fct_ventes[prix_unitaire] )
VAR Cout = SUMX ( fct_ventes, fct_ventes[quantite] * RELATED ( dim_produits[cout_unitaire] ) )
RETURN DIVIDE ( CA - Cout, CA )

Rang produit =
IF (
    HASONEVALUE ( dim_produits[nom] ),
    RANKX ( ALL ( dim_produits[nom] ), [CA], , DESC, DENSE )
)

Top 3 produits CA =
CALCULATE ( [CA], TOPN ( 3, ALL ( dim_produits[nom] ), [CA], DESC ) )
```

- `VAR` évalue une valeur **une fois**, dans le contexte où elle est définie. La mesure est plus claire et plus rapide.
- `RELATED` suit une relation du côté « plusieurs » vers le côté « un », dans un contexte de ligne.
- `HASONEVALUE` évite d'afficher un rang sur la ligne de total, où il n'aurait pas de sens.

## La manipulation fine du filtre

| Fonction | Effet |
|---|---|
| `ALL(table ou colonne)` | retire les filtres (dans CALCULATE), ou renvoie toutes les lignes |
| `ALLEXCEPT(table, colonne)` | retire tous les filtres de la table, sauf ceux de cette colonne |
| `ALLSELECTED()` | respecte les segments, mais ignore le filtre du visuel : utile pour un « % du total visible » |
| `REMOVEFILTERS()` | équivalent lisible de ALL dans CALCULATE |
| `KEEPFILTERS()` | ajoute un filtre **sans** remplacer le filtre existant |
| `FILTER(table, condition)` | itère et renvoie les lignes qui respectent la condition (plus coûteux qu'un filtre simple) |
| `TREATAS(valeurs, colonne)` | applique un filtre à travers une relation virtuelle |

```dax
% du total sélectionné = DIVIDE ( [CA], CALCULATE ( [CA], ALLSELECTED ( dim_produits ) ) )

CA clients fidèles =
CALCULATE ( [CA], FILTER ( VALUES ( dim_clients[client_id] ), [Nb commandes] >= 2 ) )
```

## L'intelligence temporelle avancée et les groupes de calcul

```dax
CA N-1 = CALCULATE ( [CA], SAMEPERIODLASTYEAR ( dim_date[jour] ) )
CA 3 derniers mois = CALCULATE ( [CA], DATESINPERIOD ( dim_date[jour], MAX ( dim_date[jour] ), -3, MONTH ) )
CA cumul glissant 12 mois = CALCULATE ( [CA], DATESINPERIOD ( dim_date[jour], MAX ( dim_date[jour] ), -12, MONTH ) )
```

**Les groupes de calcul** répondent à un problème simple : écrire « N-1 », « cumul annuel » et « évolution » pour **chaque** mesure (CA, marge, commandes) donnerait des dizaines de mesures quasi identiques. Un **groupe de calcul** définit ces transformations **une seule fois**, avec `SELECTEDMEASURE()`. On les crée dans Power BI Desktop (vue Modèle) ou avec Tabular Editor.

```dax
-- élément de calcul « Cumul annuel »
CALCULATE ( SELECTEDMEASURE (), DATESYTD ( dim_date[jour] ) )
-- élément de calcul « Évolution vs N-1 % »
VAR N = SELECTEDMEASURE ()
VAR N1 = CALCULATE ( SELECTEDMEASURE (), SAMEPERIODLASTYEAR ( dim_date[jour] ) )
RETURN DIVIDE ( N - N1, N1 )
```

Exemple : 3 mesures × 4 transformations, cela fait 12 mesures à écrire et à maintenir **sans** groupe de calcul, contre 3 mesures et 4 éléments **avec**.

Les **paramètres de champ** (*field parameters*) laissent l'utilisateur choisir la mesure ou l'axe affiché dans un visuel.

## La performance

**Le moteur VertiPaq** compresse **chaque colonne** séparément. Sa taille dépend surtout de la **cardinalité**, c'est-à-dire du nombre de valeurs distinctes.

| Pratique | Gain |
|---|---|
| supprimer les colonnes inutiles (commentaires, identifiants techniques non utilisés) | important |
| séparer un horodatage en **date** et **heure** (de 31 millions de valeurs possibles par an à 365 et 86 400) | très important |
| préférer des **mesures** aux colonnes calculées | moins de mémoire |
| un modèle en **étoile**, avec des relations un à plusieurs à filtre unique | des requêtes simples |
| éviter le filtrage bidirectionnel et les relations plusieurs à plusieurs inutiles | moins d'ambiguïté et plus de vitesse |
| réduire le nombre de visuels par page | moins de requêtes |

**Les outils de diagnostic** :

- **Performance Analyzer** (onglet *Affichage*) : la durée de chaque visuel, en séparant la requête DAX et le rendu ;
- **DAX Studio** (gratuit) : on y exécute la requête copiée, avec *Server Timings* (moteur de stockage ou moteur de formules) et *VertiPaq Analyzer* (la taille de chaque colonne) ;
- **Tabular Editor** : édition avancée et règles de bonnes pratiques (*Best Practice Analyzer*).

## La gouvernance et le déploiement

**La RLS dynamique** :

```dax
-- table Securite (email, region), reliée à dim_clients[region]
-- rôle « Utilisateurs », filtre sur la table Securite :
[email] = USERPRINCIPALNAME ()
```

Une seule règle suffit. Chaque personne voit sa ou ses régions selon la table de correspondance, mise à jour sans republier le rapport.

**L'actualisation incrémentielle** : avec les paramètres `RangeStart` et `RangeEnd` dans Power Query, on n'actualise que les **derniers jours**, et on archive l'historique. C'est indispensable au-delà de quelques millions de lignes.

**Les environnements** : avec les **pipelines de déploiement** (développement, test, production) du service Power BI, ou le format **PBIP** (le projet en fichiers texte) versionné dans **Git**, on retrouve les pratiques DevOps des semaines 1 et 3.

**Le modèle sémantique partagé** : un seul jeu de données certifié, et plusieurs rapports branchés dessus. Il y a ainsi **une seule définition** du chiffre d'affaires dans l'entreprise.

## Démonstration

1. On montre la différence entre `AVERAGE` et `AVERAGEX` sur les clients (30 143 contre 70 333) et on l'explique avec la transition de contexte.
2. On écrit les mesures de rang et de top N, avec `HASONEVALUE`.
3. On crée un groupe de calcul « Temps » (Actuel, Cumul annuel, N-1, Évolution %) appliqué à 3 mesures.
4. On passe le modèle dans VertiPaq Analyzer : on repère la colonne la plus lourde, on l'optimise, puis on compare la taille du fichier.
5. On configure la RLS dynamique et on la teste avec *Afficher en tant que*.

## Exercice guidé

1. Écris la mesure `Nb clients fidèles` (clients ayant au moins 2 commandes livrées), avec `FILTER` et `VALUES`.
2. Écris `% CA du client dans sa région` avec `ALLEXCEPT`.
3. Explique en deux phrases pourquoi `SUM(fct_ventes[montant]) / COUNTROWS(dim_clients)` ne donne pas le CA moyen par client actif.

## Exercice autonome

Sur ton rapport « Pilotage des ventes » :

1. Ajoute un groupe de calcul « Temps » et vérifie qu'il s'applique au CA, au nombre de commandes et au panier moyen.
2. Ajoute un paramètre de champ qui permet de basculer l'axe entre catégorie, région et client.
3. Passe le modèle dans VertiPaq Analyzer, note la taille avant et après optimisation, en justifiant chaque modification.
4. Mets en place une RLS dynamique avec une table de sécurité de 3 utilisateurs.
5. Enregistre le rapport au format PBIP dans un dépôt Git, avec un README qui décrit les mesures clés.

## Correction

Exercice guidé :

```dax
Nb clients fidèles =
COUNTROWS ( FILTER ( VALUES ( fct_ventes[client_id] ), CALCULATE ( DISTINCTCOUNT ( fct_ventes[commande_id] ) ) >= 2 ) )

% CA du client dans sa région =
DIVIDE ( [CA], CALCULATE ( [CA], ALLEXCEPT ( dim_clients, dim_clients[region] ) ) )
```

Avec les données de la boutique : Awa (2 commandes livrées) et Fatou (une seule commande **livrée** sur 2) donnent **1** client fidèle. Le `CALCULATE` dans `FILTER` est nécessaire : il provoque la transition de contexte, qui compte les commandes **de chaque client**.

Question 3 : `COUNTROWS(dim_clients)` compte **tous** les clients, y compris ceux qui n'ont rien acheté (Mariama, Aminata), et ce nombre ne réagit pas au contexte des ventes. Le résultat vaut 211 000 / 6 ≈ 35 167, au lieu de 70 333 pour les seuls clients **actifs**. La bonne mesure est `AVERAGEX(VALUES(fct_ventes[client_id]), [CA])`.

Exercice autonome, question 3, les modifications typiques :
- supprimer les clés techniques non utilisées dans les visuels ;
- séparer l'horodatage de chargement ou le retirer ;
- remplacer les colonnes calculées par des mesures ;
- passer les montants en entiers.

Sur de gros volumes, la réduction obtenue atteint souvent 30 à 60 %.

## Pour aller plus loin

- **Microsoft Fabric** réunit Power BI, le lakehouse (OneLake) et les pipelines. La DP-600 en certifie la maîtrise.
- Le site *dax.guide* (SQLBI) documente chaque fonction avec des exemples.
- La certification **PL-300** est un objectif réaliste après ce complément et un mois de pratique.
