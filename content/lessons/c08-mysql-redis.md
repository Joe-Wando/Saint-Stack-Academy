---
slug: c08-mysql-redis
titre: "MySQL face à PostgreSQL, et Redis en profondeur"
domaine: Bases de données
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Développement web avancé", option: developpement-logiciel }
parcours:
  - { parcours: data, ordre: 20 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Installer MySQL, créer une base et un utilisateur avec des droits limités
  - Repérer les différences de syntaxe et de comportement entre MySQL et PostgreSQL
  - Choisir les bons types de structures Redis (chaînes, hashes, listes, ensembles, ensembles triés, streams)
  - Utiliser Redis pour la limitation de débit, les sessions, le pub/sub et les files de tâches
  - Configurer la persistance de Redis (RDB, AOF) et l'éviction mémoire
prerequis:
  - Séances PostgreSQL ; MongoDB et Redis (le 31 décembre, ou en avance)
referentiels:
  - Oracle MySQL 8.0 Database Developer (1Z0-909), bases
  - Redis University RU101 « Introduction to Redis Data Structures » et RU102JS « Redis for JavaScript Developers »
  - Documentation MySQL 8.4 et Redis 7
quiz:
  - question: "Quel moteur de stockage MySQL utiliser par défaut, avec transactions et clés étrangères ?"
    choix: ["MyISAM", "InnoDB", "MEMORY", "CSV"]
    reponse: 1
    explication: "InnoDB est le moteur par défaut depuis MySQL 5.5 : transactions ACID, verrous de ligne, clés étrangères."
  - question: "Quel est l'équivalent MySQL de SERIAL ou GENERATED AS IDENTITY de PostgreSQL ?"
    choix: ["SEQUENCE", "AUTO_INCREMENT", "IDENTITY(1,1)", "ROWID"]
    reponse: 1
    explication: "id INT AUTO_INCREMENT PRIMARY KEY ; IDENTITY(1,1) est la syntaxe de SQL Server."
  - question: "Quelle structure Redis pour un classement des meilleurs vendeurs ?"
    choix: ["Liste", "Ensemble trié (sorted set)", "Chaîne", "Hash"]
    reponse: 1
    explication: "ZINCRBY met à jour le score, ZREVRANGE donne le top N, en temps logarithmique."
  - question: "Que se passe-t-il si Redis redémarre sans aucune persistance configurée ?"
    choix: ["Rien n'est perdu", "Toutes les données en mémoire sont perdues", "Seules les clés expirées sont perdues", "Redis refuse de redémarrer"]
    reponse: 1
    explication: "RDB (instantanés) et/ou AOF (journal des écritures) permettent de recharger les données au démarrage."
  - question: "Avec maxmemory-policy allkeys-lru, que fait Redis quand la mémoire est pleine ?"
    choix: ["Il plante", "Il supprime les clés les moins récemment utilisées pour faire de la place", "Il écrit sur le disque", "Il refuse toutes les lectures"]
    reponse: 1
    explication: "C'est le comportement voulu pour un cache ; pour des données à ne jamais perdre, on choisit noeviction."
---

## Partie 1 : MySQL

MySQL (Oracle), et son dérivé libre **MariaDB**, est la base relationnelle la plus installée au monde. On la trouve derrière WordPress, de nombreux hébergements mutualisés et beaucoup d'applications PHP et Java. Tu la croiseras forcément. Les concepts (tables, clés, SQL, index, transactions) sont **les mêmes** que dans PostgreSQL. Ce sont les **détails** qui changent.

```bash
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8.4
docker exec -it mysql mysql -uroot -p
```

```sql
CREATE DATABASE boutique CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'app'@'%' IDENTIFIED BY 'MotDePasseSolide!26';
GRANT SELECT, INSERT, UPDATE, DELETE ON boutique.* TO 'app'@'%';   -- moindre privilège : ni DROP ni GRANT
USE boutique;
CREATE TABLE produits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prix INT UNSIGNED NOT NULL,
  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
SHOW TABLES; DESCRIBE produits;
```

**`utf8mb4`** est le vrai UTF-8 de MySQL, qui accepte les emoji et tous les caractères. L'ancien `utf8` de MySQL est incomplet : c'est un piège classique.

| Sujet | PostgreSQL | MySQL |
|---|---|---|
| Identifiant automatique | `GENERATED ALWAYS AS IDENTITY` ou `serial` | `AUTO_INCREMENT` |
| Concaténation | `'a' \|\| 'b'` | `CONCAT('a', 'b')` |
| Limite et décalage | `LIMIT 10 OFFSET 20` | identique (ou `LIMIT 20, 10`) |
| Upsert | `ON CONFLICT (id) DO UPDATE` | `ON DUPLICATE KEY UPDATE` |
| Retour après INSERT | `RETURNING *` | non (`LAST_INSERT_ID()`) |
| Booléen | `boolean` | `TINYINT(1)` |
| JSON | `jsonb` (indexable avec GIN) | `JSON` |
| Recherche insensible à la casse | `ILIKE` | `LIKE` (selon la collation, souvent déjà insensible) |
| Guillemets d'identifiant | `"colonne"` | `` `colonne` `` |
| Fonctions de fenêtrage, CTE | oui | oui depuis la version 8.0 |
| Sauvegarde | `pg_dump` | `mysqldump`, ou `mysqlpump` |

```sql
-- L'upsert, version MySQL
INSERT INTO stocks (produit_id, quantite) VALUES (12, 5)
ON DUPLICATE KEY UPDATE quantite = quantite + VALUES(quantite);
```

## Partie 2 : Redis en profondeur

La séance du 31 décembre présente Redis comme cache. Ce complément explore ses **structures** et ses **usages avancés**.

| Structure | Commandes clés | Usage typique |
|---|---|---|
| **Chaîne** | `SET`, `GET`, `INCR`, `EXPIRE` | cache, compteurs, verrous |
| **Hash** | `HSET`, `HGET`, `HINCRBY` | un objet (session, profil) |
| **Liste** | `LPUSH`, `RPOP`, `BRPOP`, `LRANGE` | file de tâches, derniers éléments |
| **Ensemble** | `SADD`, `SISMEMBER`, `SINTER` | valeurs uniques (visiteurs du jour), intersections |
| **Ensemble trié** | `ZADD`, `ZINCRBY`, `ZREVRANGE`, `ZRANK` | classements, files à priorité |
| **Stream** | `XADD`, `XREADGROUP`, `XACK` | journal d'événements avec groupes de consommateurs (un « petit Kafka ») |

### La limitation de débit (*rate limiting*)

C'est l'algorithme à **fenêtre fixe** : au plus 5 tentatives de connexion par minute et par adresse IP, la protection de la séance OWASP du 7 décembre.

```js
async function autoriser(ip) {
  const cle = `limite:connexion:${ip}:${Math.floor(Date.now() / 60000)}`;   // une clé par minute
  const n = await redis.incr(cle);                                           // INCR est atomique
  if (n === 1) await redis.expire(cle, 60);
  return n <= 5;
}
```

Exemple : 7 tentatives dans la même minute. Les tentatives 1 à 5 sont acceptées, la 6e et la 7e sont **refusées** (code 429, *Too Many Requests*). La minute suivante, une nouvelle clé repart à 0.

### Les sessions et le verrou distribué

```
HSET session:8f3a utilisateur 42 role apprenant
EXPIRE session:8f3a 1800                          # déconnexion après 30 minutes d'inactivité
SET verrou:commande:1042 serveur-A NX EX 10       # NX : seulement si la clé n'existe pas → un seul serveur traite
```

### Pub/Sub et file de tâches

```
# Terminal 1                         # Terminal 2
SUBSCRIBE notifications              PUBLISH notifications "Nouvelle commande 1042"
```

Pub/Sub ne **garde rien** : un abonné déconnecté rate les messages. Pour une **file de tâches fiable** (envoi d'e-mails), on utilise une liste avec `BRPOP` (une attente bloquante), ou mieux, un **Stream** avec acquittement, ou une bibliothèque comme **BullMQ** pour Node.

### La persistance et la mémoire

| Mode | Principe | Perte possible |
|---|---|---|
| **RDB** | des instantanés périodiques (`save 60 1000` : toutes les 60 s s'il y a eu au moins 1 000 écritures) | les écritures depuis le dernier instantané |
| **AOF** | un journal de chaque écriture (`appendfsync everysec`) | environ 1 seconde |
| Aucun | | tout, au redémarrage |

```
maxmemory 256mb
maxmemory-policy allkeys-lru     # cache : évince les clés les moins récemment utilisées
# noeviction : refuse les écritures quand la mémoire est pleine (pour des données à ne pas perdre)
```

`INFO memory` et `INFO stats` (le ratio entre `keyspace_hits` et `keyspace_misses`) mesurent l'efficacité du cache.

Exemple : 9 000 succès et 1 000 échecs donnent un taux de succès de 9 000 / 10 000 = **90 %**.

## Démonstration

1. On lance MySQL, on crée la base `boutique` avec un utilisateur limité, puis on porte les tables et requêtes de la semaine 7 en notant chaque différence.
2. Avec Redis, on met en place la limitation de débit sur la route de connexion de l'API, et on la teste avec une boucle `curl`.
3. On crée un classement des produits les plus vus avec un ensemble trié.
4. On démontre Pub/Sub entre deux terminaux.
5. On active l'AOF, on redémarre le conteneur, et on constate que les données sont conservées.

## Exercice guidé

1. Écris en MySQL la table `clients` de la semaine 7 et la requête « chiffre d'affaires livré par client ». Quelles lignes as-tu dû modifier par rapport à PostgreSQL ?
2. Dans `redis-cli`, simule un classement : Awa (74 000), Ibrahima (70 000), Fatou (67 000), puis ajoute 10 000 à Fatou. Affiche le top 3 avec les scores.

## Exercice autonome

1. Migre la base boutique de PostgreSQL vers MySQL : exporte avec `pg_dump --data-only --inserts`, adapte le DDL, importe, et vérifie que les totaux sont identiques.
2. Implémente dans ton API la limitation de débit à fenêtre fixe (5 par minute), puis une version à **fenêtre glissante** avec un ensemble trié (`ZADD` de l'horodatage, `ZREMRANGEBYSCORE` des entrées plus anciennes qu'une minute, `ZCARD`).
3. Implémente une file d'envoi d'e-mails avec BullMQ : l'API ajoute une tâche, un worker la traite, avec 3 tentatives en cas d'échec.
4. Configure Redis en cache avec 100 Mo et `allkeys-lru`. Remplis-le au-delà et observe les évictions dans `INFO stats` (`evicted_keys`).

## Correction

Exercice guidé, question 1 : `serial` devient `INT AUTO_INCREMENT`, et `date_trunc` n'existe pas en MySQL (on utilise `DATE_FORMAT(date_cmd, '%Y-%m-01')`). Les jointures, `GROUP BY`, `SUM` et `ORDER BY` restent identiques. C'est la preuve que le SQL standard se transpose.

Question 2 :

```
ZADD classement 74000 Awa 70000 Ibrahima 67000 Fatou
ZINCRBY classement 10000 Fatou          # 77000
ZREVRANGE classement 0 2 WITHSCORES     # 1) Fatou 77000  2) Awa 74000  3) Ibrahima 70000
```

Exercice autonome, question 2, la fenêtre glissante :

```js
async function autoriserGlissant(ip, limite = 5, fenetreMs = 60000) {
  const cle = `limite:glissant:${ip}`; const maintenant = Date.now();
  await redis.zRemRangeByScore(cle, 0, maintenant - fenetreMs);     // on oublie ce qui a plus d'une minute
  const n = await redis.zCard(cle);
  if (n >= limite) return false;
  await redis.zAdd(cle, { score: maintenant, value: `${maintenant}-${Math.random()}` });
  await redis.expire(cle, Math.ceil(fenetreMs / 1000));
  return true;
}
```

Avec la fenêtre fixe, un attaquant peut faire 5 tentatives à 0 h 59 min 59 s puis 5 autres à 1 h 00 min 00 s, soit 10 en 2 secondes. La fenêtre glissante l'empêche. En production, on rend ces opérations **atomiques** avec une transaction `MULTI` ou un script Lua.

## Pour aller plus loin

- **Redis Stack** ajoute la recherche plein texte, le JSON et les séries temporelles.
- **Valkey** est la version libre de Redis, maintenue par la Linux Foundation depuis le changement de licence de 2024. **AWS ElastiCache** la propose.
- La **réplication MySQL** (source et répliques) sert à répartir les lectures.
