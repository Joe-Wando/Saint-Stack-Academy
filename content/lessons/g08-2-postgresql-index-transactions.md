---
slug: g08-2-postgresql-index-transactions
titre: PostgreSQL, index, transactions et sauvegardes
domaine: Bases de données
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Bases de données avancées" }
parcours:
  - { parcours: data, ordre: 18 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Lire un plan d'exécution avec EXPLAIN ANALYZE
  - Créer les bons index (B-tree, composite, unique, partiel) et en connaître le coût
  - Expliquer les propriétés ACID et utiliser BEGIN, COMMIT, ROLLBACK
  - Comprendre les niveaux d'isolation et les verrous dans les cas courants
  - Sauvegarder et restaurer une base avec pg_dump et pg_restore, et planifier les sauvegardes
prerequis:
  - Cours « PostgreSQL, modéliser et normaliser une base de données »
referentiels:
  - Documentation PostgreSQL 16, chapitres 11 « Indexes », 13 « Concurrency Control » et 26 « Backup and Restore »
  - Oracle Database SQL Certified Associate (1Z0-071), domaine « Managing Transactions »
  - Theo Härder et Andreas Reuter (1983), propriétés ACID
quiz:
  - question: "À quoi sert un index ?"
    choix: ["À sauvegarder la table", "À retrouver rapidement des lignes sans parcourir toute la table", "À trier définitivement la table", "À chiffrer les données"]
    reponse: 1
    explication: "Comme l'index d'un livre : on va directement à la bonne page au lieu de tout lire (Seq Scan)."
  - question: "Quel est le coût d'un index ?"
    choix: ["Aucun", "De l'espace disque et des écritures plus lentes (chaque INSERT ou UPDATE met l'index à jour)", "Il ralentit toutes les lectures", "Il supprime des données"]
    reponse: 1
    explication: "On indexe les colonnes réellement utilisées dans les WHERE, JOIN et ORDER BY fréquents, pas toutes les colonnes."
  - question: "Que garantit le A de ACID (atomicité) ?"
    choix: ["Que la base est rapide", "Qu'une transaction s'applique entièrement ou pas du tout", "Que les données sont chiffrées", "Que plusieurs utilisateurs peuvent lire"]
    reponse: 1
    explication: "Un virement débite ET crédite, ou ne fait rien : jamais l'un sans l'autre."
  - question: "Après BEGIN, une erreur survient au milieu de la transaction. Que faire ?"
    choix: ["COMMIT", "ROLLBACK pour tout annuler", "Rien", "Redémarrer PostgreSQL"]
    reponse: 1
    explication: "ROLLBACK annule toutes les modifications depuis BEGIN ; la base revient à l'état d'avant."
  - question: "Pourquoi tester régulièrement la restauration d'une sauvegarde ?"
    choix: ["Ce n'est pas utile", "Parce qu'une sauvegarde jamais restaurée peut être incomplète ou inutilisable, et on ne le découvre qu'en cas de crise", "Pour accélérer la base", "Pour libérer de l'espace"]
    reponse: 1
    explication: "Une sauvegarde n'a de valeur que si la restauration fonctionne, dans un délai connu."
---

## L'idée

Dans le cours « PostgreSQL, modéliser et normaliser une base de données », la base est devenue **juste**. Ici, on la rend **rapide** (les index), **fiable** quand plusieurs utilisateurs écrivent en même temps (les transactions) et **récupérable** en cas de catastrophe (les sauvegardes). Ce sont les trois questions que pose toute mise en production.

## Le jeu d'essai : un million de lignes

```sql
CREATE TABLE commandes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id int NOT NULL,
  date_cmd date NOT NULL,
  statut text NOT NULL,
  montant int NOT NULL
);
INSERT INTO commandes (client_id, date_cmd, statut, montant)
SELECT (random() * 50000)::int,
       DATE '2024-01-01' + (random() * 1000)::int,
       (ARRAY['livrée','annulée','en cours'])[1 + (random() * 2)::int],
       (random() * 100000)::int
FROM generate_series(1, 1000000);
ANALYZE commandes;                    -- met à jour les statistiques utilisées par le planificateur
```

## Lire un plan d'exécution

```sql
EXPLAIN ANALYZE SELECT * FROM commandes WHERE client_id = 4242;
```

```
Seq Scan on commandes  (cost=0.00..20834.00 rows=20 width=27) (actual time=0.9..62.4 rows=19 loops=1)
  Filter: (client_id = 4242)
  Rows Removed by Filter: 999981
Execution Time: 62.5 ms
```

**Seq Scan** signifie que PostgreSQL a **lu le million de lignes** pour en garder 19.

## Les index

```sql
CREATE INDEX idx_commandes_client ON commandes (client_id);
EXPLAIN ANALYZE SELECT * FROM commandes WHERE client_id = 4242;
```

```
Bitmap Heap Scan on commandes ... (actual time=0.05..0.12 rows=19 loops=1)
  -> Bitmap Index Scan on idx_commandes_client ...
Execution Time: 0.15 ms
```

On passe de 62,5 ms à 0,15 ms, soit environ **400 fois plus rapide**.

> Un index est comme l'**index d'un livre**. Pour trouver « Kubernetes », on ne relit pas les 600 pages : on consulte l'index, qui donne directement le numéro de la page.

Un index **B-tree** (le type par défaut) est un arbre trié. Le nombre d'étapes pour trouver une valeur croît comme log₂(n). Pour n = 1 000 000, log₂(10⁶) ≈ **20** comparaisons, au lieu d'un million.

| Type d'index | Exemple | Usage |
|---|---|---|
| Simple | `(client_id)` | égalité, plage, tri |
| **Composite** | `(client_id, date_cmd)` | filtres sur les deux colonnes ; l'**ordre compte** : utile pour `client_id` seul, pas pour `date_cmd` seul |
| **Unique** | `CREATE UNIQUE INDEX ... (email)` | impose l'unicité (créé automatiquement par `UNIQUE` et `PRIMARY KEY`) |
| **Partiel** | `... WHERE statut = 'en cours'` | n'indexe que les lignes utiles : plus petit et plus rapide |
| Sur expression | `(lower(email))` | pour des recherches `WHERE lower(email) = ...` |
| GIN | `(donnees jsonb)`, recherche plein texte | contenu des JSON, mots dans un texte |

**Le coût d'un index** : il prend de la place sur le disque, et **chaque** `INSERT`, `UPDATE` ou `DELETE` doit aussi le mettre à jour. On indexe donc :

- les **clés étrangères**, utilisées dans les jointures ; PostgreSQL ne les indexe **pas** automatiquement ;
- les colonnes des `WHERE` et `ORDER BY` **fréquents**.

On n'indexe **pas** une colonne peu sélective (comme un booléen réparti à 50 / 50), ni une petite table.

## Les transactions et ACID

Un **virement** Wave de 10 000 FCFA d'Awa vers Moussa demande **deux** modifications :

```sql
BEGIN;
UPDATE comptes SET solde = solde - 10000 WHERE titulaire = 'Awa';
UPDATE comptes SET solde = solde + 10000 WHERE titulaire = 'Moussa';
COMMIT;
```

Si le serveur tombe **entre** les deux `UPDATE`, sans transaction, 10 000 FCFA disparaissent. **Avec** une transaction, c'est tout ou rien.

| Propriété | Garantie |
|---|---|
| **A**tomicité | toutes les opérations, ou aucune |
| **C**ohérence | les contraintes (`CHECK solde >= 0`, clés) sont respectées à la fin |
| **I**solation | les transactions simultanées ne se voient pas à moitié faites |
| **D**urabilité | une fois le `COMMIT` fait, les données survivent à une panne (journal WAL) |

```sql
BEGIN;
UPDATE comptes SET solde = solde - 50000 WHERE titulaire = 'Awa';   -- Awa n'a que 30 000
-- ERREUR : violation de la contrainte CHECK (solde >= 0)
ROLLBACK;                                                            -- rien n'a changé
```

Dans le code (Node avec `pg`) :

```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE comptes SET solde = solde - $1 WHERE id = $2', [montant, de]);
  await client.query('UPDATE comptes SET solde = solde + $1 WHERE id = $2', [montant, vers]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

## La concurrence et l'isolation

PostgreSQL utilise le **MVCC** : chaque transaction voit une **photo** cohérente des données. Les lectures ne bloquent pas les écritures.

| Niveau d'isolation | Ce qu'il empêche |
|---|---|
| `READ COMMITTED` (par défaut) | lire des données non validées |
| `REPEATABLE READ` | qu'une même lecture donne deux résultats dans une transaction |
| `SERIALIZABLE` | toute anomalie : le résultat est le même que si les transactions s'étaient exécutées l'une après l'autre |

**Le cas classique, la dernière place d'une session** : deux personnes réservent en même temps. Pour éviter de vendre la place deux fois, on **verrouille** la ligne :

```sql
BEGIN;
SELECT places_restantes FROM sessions WHERE id = 7 FOR UPDATE;   -- l'autre transaction attend
UPDATE sessions SET places_restantes = places_restantes - 1 WHERE id = 7 AND places_restantes > 0;
COMMIT;
```

Les **interblocages** (*deadlocks*) surviennent quand deux transactions s'attendent mutuellement. PostgreSQL les détecte et en annule une. Pour les éviter, on verrouille toujours les lignes **dans le même ordre**.

## Les sauvegardes

| Outil | Ce qu'il fait |
|---|---|
| `pg_dump` | sauvegarde **logique** d'une base, sous forme de SQL ou d'archive |
| `pg_dumpall` | toutes les bases, avec les rôles |
| `pg_basebackup` et archivage WAL | sauvegarde **physique** et restauration **à un instant précis** (PITR) |

```bash
pg_dump -U postgres -d boutique -F c -f boutique_$(date +%F).dump       # format personnalisé, compressé
pg_restore -U postgres -d boutique_restauree --clean --if-exists boutique_2026-12-29.dump
# avec Docker :
docker exec pg-cours pg_dump -U postgres -F c postgres > sauvegarde.dump
```

**La stratégie** :

- **automatiser**, par exemple avec le script et le cron (voir le cours « Bash en pratique, script de sauvegarde et planification avec cron »), une fois par nuit ;
- appliquer la règle **3-2-1** : 3 copies, sur 2 supports différents, dont 1 hors site ;
- **chiffrer** les sauvegardes, qui contiennent des données personnelles ;
- **tester la restauration** chaque mois, en chronométrant.

Deux objectifs à fixer avec le métier :

- **RPO** : combien de données peut-on accepter de perdre ? Avec une sauvegarde par nuit, jusqu'à 24 h.
- **RTO** : combien de temps pour remettre le service en route ?

## Démonstration

1. On génère le million de lignes.
2. `EXPLAIN ANALYZE` sans index (Seq Scan, environ 60 ms), puis avec un index (environ 0,1 ms).
3. On ajoute un index composite et on montre que l'ordre des colonnes compte.
4. On fait un virement dans une transaction, puis un virement qui échoue et un `ROLLBACK` : les soldes sont inchangés.
5. On ouvre deux terminaux `psql` pour simuler deux réservations simultanées avec `FOR UPDATE`.
6. On fait un `pg_dump`, on supprime une table « par erreur », puis on restaure avec `pg_restore` : la table est revenue.

## Exercice guidé

Sur la table d'un million de commandes :

1. Mesure `SELECT COUNT(*) FROM commandes WHERE statut = 'en cours' AND date_cmd >= '2026-01-01'` sans index.
2. Crée l'index le plus adapté (indice : un index partiel ou composite) et mesure à nouveau.
3. Calcule le gain : le temps avant divisé par le temps après.

## Exercice autonome

1. Crée une table `comptes (id, titulaire, solde CHECK (solde >= 0))`, avec 3 comptes.
2. Écris une fonction Node `virement(de, vers, montant)` transactionnelle. Teste un virement réussi, un virement qui dépasse le solde et un compte inexistant. Vérifie après chaque cas que la **somme totale** des soldes est inchangée.
3. Simule deux réservations simultanées de la dernière place, d'abord sans `FOR UPDATE` (montre le problème), puis avec.
4. Écris le script `sauvegarde-pg.sh` : `pg_dump` horodaté, rotation sur 7 jours, journal. Planifie-le avec cron.
5. Restaure la sauvegarde dans une base `boutique_test`, chronomètre, et note ton RTO.

## Correction

Exercice guidé :

```sql
CREATE INDEX idx_cmd_en_cours ON commandes (date_cmd) WHERE statut = 'en cours';
EXPLAIN ANALYZE SELECT COUNT(*) FROM commandes WHERE statut = 'en cours' AND date_cmd >= '2026-01-01';
```

L'index partiel ne contient que les lignes « en cours », soit environ un quart de la table, et il est trié par date. Exemple de gain : 70 ms avant et 4 ms après, soit environ **17 fois plus rapide**. Les valeurs dépendent de la machine.

Exercice autonome, question 2 : l'**invariant** à vérifier est `SELECT SUM(solde) FROM comptes`. Il doit rester identique après chaque appel, réussi ou non. Si un virement échoue au 2e `UPDATE` sans transaction, la somme diminue : c'est la preuve que l'atomicité est indispensable.

Question 3, sans `FOR UPDATE` : les deux transactions lisent `places_restantes = 1`, et chacune enregistre sa réservation. On a vendu **2** places pour **1**. Avec `FOR UPDATE`, la seconde transaction attend que la première ait validé, puis lit 0 et refuse.

## Pour aller plus loin

- `pg_stat_statements` liste les requêtes les plus coûteuses de la base. C'est le point de départ de toute optimisation.
- Les **réplicas en lecture** et la haute disponibilité (Patroni, ou AWS RDS Multi-AZ) servent à absorber la charge et à survivre à une panne.
- Cours suivant conseillé : « NoSQL, MongoDB et Redis » : deux bases **NoSQL** pour d'autres besoins.
