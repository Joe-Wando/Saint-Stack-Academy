---
slug: s04-2-sql-fenetres-cte
titre: SQL avancé, CTE et fonctions de fenêtrage
piste: solo
semaine: 4
date: 2026-12-02
domaine: Data
duree: 120
niveau: bases
objectifs:
  - Découper une requête complexe en étapes lisibles avec WITH (CTE)
  - Expliquer la différence entre un agrégat GROUP BY et une fonction de fenêtrage
  - Classer avec ROW_NUMBER, RANK et DENSE_RANK et extraire le top N par groupe
  - Calculer des cumuls, des moyennes mobiles et des évolutions avec SUM OVER, LAG et LEAD
  - Écrire une CTE récursive simple (hiérarchie, calendrier)
prerequis:
  - Séance « SQL pour la data, jointures et agrégats » (même base d'exemple)
referentiels:
  - ISO/IEC 9075 (SQL:2003, fonctions de fenêtrage)
  - Databricks Certified Data Engineer Associate, domaine « ELT with Spark SQL and Python »
  - dbt Analytics Engineering Certification, domaine « SQL »
quiz:
  - question: "Quelle est la différence entre SUM(...) GROUP BY et SUM(...) OVER (...) ?"
    choix: ["Aucune", "GROUP BY réduit à une ligne par groupe ; OVER calcule pour chaque ligne en gardant toutes les lignes", "OVER est plus lent et inutile", "GROUP BY garde toutes les lignes"]
    reponse: 1
    explication: "Avec OVER, chaque commande garde sa ligne et reçoit en plus, par exemple, le total de son client."
  - question: "Trois ventes à 500, 500, 300. Que donne DENSE_RANK() OVER (ORDER BY montant DESC) ?"
    choix: ["1, 2, 3", "1, 1, 3", "1, 1, 2", "2, 2, 1"]
    reponse: 2
    explication: "ROW_NUMBER : 1, 2, 3. RANK : 1, 1, 3 (saute un rang). DENSE_RANK : 1, 1, 2 (sans trou)."
  - question: "Que renvoie LAG(ca) OVER (ORDER BY mois) ?"
    choix: ["Le CA du mois suivant", "Le CA du mois précédent", "Le CA total", "Le plus petit CA"]
    reponse: 1
    explication: "LAG regarde en arrière, LEAD en avant ; idéal pour calculer une évolution d'un mois sur l'autre."
  - question: "Quel est l'intérêt principal d'une CTE (WITH) ?"
    choix: ["Elle stocke les données sur disque", "Elle rend une requête complexe lisible, en étapes nommées", "Elle remplace les index", "Elle crée une table permanente"]
    reponse: 1
    explication: "Chaque étape a un nom explicite ; la requête se lit de haut en bas, comme un pipeline. C'est exactement le style dbt."
  - question: "Pour obtenir les 2 produits les plus vendus PAR catégorie, quelle approche ?"
    choix: ["ORDER BY ventes LIMIT 2", "ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY ventes DESC) puis filtrer rang <= 2", "GROUP BY categorie LIMIT 2", "MAX(ventes)"]
    reponse: 1
    explication: "LIMIT agit sur tout le résultat ; PARTITION BY recommence la numérotation dans chaque catégorie."
---

## Pourquoi ces outils ?

Les questions d'analyse réelles sont rarement simples :

- « Quel est le **top 3** des produits **dans chaque** catégorie ? »
- « Quelle est l'**évolution** du chiffre d'affaires d'un mois sur l'autre ? »
- « Quel est le **cumul** des ventes depuis le début de l'année ? »

Avec `GROUP BY` seul, ces questions demandent des sous-requêtes illisibles. Les **CTE** et les **fonctions de fenêtrage** les résolvent proprement. On les rencontre partout en data engineering : dbt, Spark SQL, BigQuery.

On reprend la base d'hier (clients, produits, commandes, lignes).

## Les CTE : nommer les étapes

Une **CTE** (*Common Table Expression*) est une requête nommée, utilisable dans la suite de la requête :

```sql
WITH ventes AS (                       -- étape 1 : le détail des ventes livrées
    SELECT co.id AS commande_id, co.client_id, co.date_cmd,
           p.categorie, p.nom AS produit, p.prix * l.quantite AS montant
    FROM lignes l
    JOIN commandes co ON co.id = l.commande_id
    JOIN produits p   ON p.id = l.produit_id
    WHERE co.statut = 'livrée'
),
par_client AS (                        -- étape 2 : le total par client
    SELECT client_id, SUM(montant) AS total
    FROM ventes GROUP BY client_id
)
SELECT c.nom, pc.total                 -- étape 3 : le résultat
FROM par_client pc JOIN clients c ON c.id = pc.client_id
ORDER BY pc.total DESC;
```

La requête se lit **de haut en bas**, comme un pipeline. C'est exactement le style des modèles **dbt** de la semaine 5.

## Les fonctions de fenêtrage

Un **agrégat** `GROUP BY` **réduit** les lignes : on obtient une ligne par groupe. Une **fonction de fenêtrage** calcule sur un ensemble de lignes (la **fenêtre**) mais **garde chaque ligne**.

```
fonction(...) OVER (
    PARTITION BY ...   -- découpe en groupes, sans réduire le nombre de lignes
    ORDER BY ...       -- ordre à l'intérieur de chaque groupe
    ROWS BETWEEN ...   -- taille du cadre (optionnel)
)
```

```sql
WITH ventes AS ( /* même CTE qu'au-dessus */ )
SELECT commande_id, client_id, montant,
       SUM(montant) OVER (PARTITION BY client_id) AS total_client,
       ROUND(100.0 * montant / SUM(montant) OVER (PARTITION BY client_id), 1) AS part_pct
FROM ventes;
```

Chaque ligne de vente garde son détail **et** reçoit le total de son client.

## Classer : ROW_NUMBER, RANK, DENSE_RANK

Pour des montants de 70 000, 35 000, 35 000 et 24 000, triés par ordre décroissant :

| Montant | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 70 000 | 1 | 1 | 1 |
| 35 000 | 2 | 2 | 2 |
| 35 000 | 3 | 2 | 2 |
| 24 000 | 4 | 4 | 3 |

**Le top N par groupe**, le schéma le plus demandé en entretien :

```sql
WITH ventes_produit AS (
    SELECT p.categorie, p.nom, SUM(l.quantite) AS qte
    FROM lignes l JOIN produits p ON p.id = l.produit_id
    GROUP BY p.categorie, p.nom
),
classees AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY qte DESC) AS rang
    FROM ventes_produit
)
SELECT * FROM classees WHERE rang <= 2;
```

On ne peut pas filtrer une fonction de fenêtrage dans un `WHERE`, car elle est calculée à l'étape du `SELECT`. D'où la CTE intermédiaire.

**Dédoublonner** en gardant la ligne la plus récente de chaque client est le même schéma, avec `ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY date_cmd DESC)` puis le filtre `rang = 1`.

## Cumuls, moyennes mobiles et évolutions

```sql
WITH mensuel AS (
    SELECT date_trunc('month', co.date_cmd)::date AS mois, SUM(p.prix * l.quantite) AS ca
    FROM lignes l JOIN commandes co ON co.id = l.commande_id JOIN produits p ON p.id = l.produit_id
    WHERE co.statut = 'livrée'
    GROUP BY 1
)
SELECT mois, ca,
       SUM(ca) OVER (ORDER BY mois) AS ca_cumule,
       LAG(ca) OVER (ORDER BY mois) AS ca_mois_precedent,
       ROUND(100.0 * (ca - LAG(ca) OVER (ORDER BY mois)) / LAG(ca) OVER (ORDER BY mois), 1) AS evolution_pct,
       AVG(ca) OVER (ORDER BY mois ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moyenne_mobile_3
FROM mensuel ORDER BY mois;
```

**L'exemple chiffré**, avec la base d'hier :
- octobre : commande 1 (39 000) et commande 2 (35 000), soit **74 000** ;
- novembre : commande 4 (67 000) et commande 6 (70 000), soit **137 000** ;
- le cumul de novembre vaut 211 000 ;
- l'évolution vaut (137 000 − 74 000) / 74 000 ≈ **+85,1 %**.

| Fonction | Rôle |
|---|---|
| `LAG(x, n)` / `LEAD(x, n)` | valeur n lignes avant ou après |
| `FIRST_VALUE(x)` / `LAST_VALUE(x)` | première ou dernière valeur de la fenêtre |
| `NTILE(4)` | découpe en quartiles |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | cadre glissant de 3 lignes |

## Les CTE récursives

Elles servent aux hiérarchies (organigramme, catégories imbriquées) et à la génération de séries :

```sql
WITH RECURSIVE calendrier AS (
    SELECT DATE '2026-10-01' AS jour
    UNION ALL
    SELECT jour + 1 FROM calendrier WHERE jour < DATE '2026-10-31'
)
SELECT c.jour, COUNT(co.id) AS nb_commandes
FROM calendrier c LEFT JOIN commandes co ON co.date_cmd = c.jour
GROUP BY c.jour ORDER BY c.jour;
```

Cette requête affiche **tous** les jours d'octobre, y compris ceux sans commande. C'est indispensable pour tracer un graphique sans trous. Dans PostgreSQL, `generate_series` fait la même chose plus simplement.

## Démonstration

Sur la base d'exemple, on construit pas à pas un rapport mensuel complet : chiffre d'affaires, cumul, évolution, et meilleur client du mois, en ajoutant une CTE à chaque étape et en vérifiant un nombre à la main à chaque fois.

## Exercice guidé

1. Pour chaque commande livrée, affiche son montant et le rang de ce montant parmi **toutes** les commandes livrées, avec `RANK`.
2. Pour chaque client, affiche ses commandes avec le numéro d'ordre de la commande (1re, 2e…) par date.
3. Affiche pour chaque commande la date de la commande **précédente** du même client, et le nombre de jours écoulés depuis.

## Exercice autonome

1. Écris une requête qui renvoie, pour chaque catégorie, le produit au plus gros chiffre d'affaires, avec ce montant et la part qu'il représente dans le chiffre d'affaires de sa catégorie.
2. Ajoute 6 commandes réparties sur décembre 2026 et janvier 2027, puis calcule par mois le chiffre d'affaires, le cumul **remis à zéro chaque année** et l'évolution par rapport au mois précédent.
3. Réécris la requête de la question 1 **sans** fonction de fenêtrage. Compare la lisibilité.

## Correction

Exercice guidé :

```sql
WITH m AS (
  SELECT co.id, co.client_id, co.date_cmd, SUM(p.prix*l.quantite) AS montant
  FROM commandes co JOIN lignes l ON l.commande_id=co.id JOIN produits p ON p.id=l.produit_id
  WHERE co.statut='livrée' GROUP BY co.id
)
SELECT id, montant, RANK() OVER (ORDER BY montant DESC) AS rang FROM m;
-- 6 (70 000) rang 1 ; 4 (67 000) rang 2 ; 1 (39 000) rang 3 ; 2 (35 000) rang 4

SELECT client_id, id, date_cmd,
       ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY date_cmd) AS numero,
       LAG(date_cmd) OVER (PARTITION BY client_id ORDER BY date_cmd) AS precedente,
       date_cmd - LAG(date_cmd) OVER (PARTITION BY client_id ORDER BY date_cmd) AS jours
FROM commandes ORDER BY client_id, date_cmd;
-- Awa : commande 2, 18 jours après la commande 1
```

Exercice autonome, question 1 :

```sql
WITH ca_produit AS (
  SELECT p.categorie, p.nom, SUM(p.prix*l.quantite) AS ca
  FROM lignes l JOIN produits p ON p.id=l.produit_id JOIN commandes co ON co.id=l.commande_id
  WHERE co.statut='livrée' GROUP BY p.categorie, p.nom
), classes AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY categorie ORDER BY ca DESC) AS rang,
         ROUND(100.0*ca/SUM(ca) OVER (PARTITION BY categorie),1) AS part
  FROM ca_produit
)
SELECT categorie, nom, ca, part FROM classes WHERE rang = 1;
-- Vêtements : Boubou brodé, 105 000 (74,5 %) ; Accessoires : Sac en cuir, 25 000 (62,5 %) ; Chaussures : Sandales, 30 000 (100 %)
```

Question 2 : le cumul annuel s'écrit `SUM(ca) OVER (PARTITION BY date_part('year', mois) ORDER BY mois)`.

Question 3 : sans fenêtrage, il faut une sous-requête corrélée qui calcule le maximum par catégorie, puis une jointure sur ce maximum. C'est plus long, et cela renvoie plusieurs lignes en cas d'égalité.

## Pour aller plus loin

- `QUALIFY`, dans BigQuery, Snowflake et Databricks, filtre directement sur une fonction de fenêtrage, sans CTE.
- Les exercices « Window Functions » du site pgexercises.com.
- Vendredi : la même analyse en Python avec pandas, puis des graphiques avec Matplotlib.
