---
slug: s07-2-spark
titre: Apache Spark, traitement distribué avec PySpark
piste: solo
semaine: 7
date: 2026-12-23
domaine: Data
duree: 150
niveau: découverte
objectifs:
  - Expliquer quand et pourquoi passer de pandas à un moteur distribué
  - Décrire l'architecture de Spark (driver, executors, partitions, cluster manager)
  - Manipuler des DataFrames PySpark (lecture, sélection, filtre, agrégation, jointure)
  - Comprendre l'évaluation paresseuse (transformations, actions, DAG, shuffle)
  - Écrire en Parquet partitionné et utiliser Spark SQL
prerequis:
  - Séances « Python pour la data » et « SQL avancé »
  - Java 17 et Python 3.10 ou plus (ou Docker)
referentiels:
  - Databricks Certified Associate Developer for Apache Spark, domaines « Spark Architecture » et « Spark DataFrame API »
  - Databricks Certified Data Engineer Associate
  - Documentation Apache Spark 3.5, « Spark SQL, DataFrames and Datasets Guide »
quiz:
  - question: "Quand faut-il passer de pandas à Spark ?"
    choix: ["Toujours", "Quand les données ne tiennent plus en mémoire sur une machine ou que le traitement devient trop long", "Pour les petits CSV", "Jamais"]
    reponse: 1
    explication: "Pour 100 Mo, pandas est plus simple et plus rapide ; pour des centaines de Go, Spark répartit le travail."
  - question: "Que se passe-t-il quand on écrit df.filter(...).groupBy(...).agg(...) sans action ?"
    choix: ["Le calcul est fait immédiatement", "Rien n'est calculé : Spark construit un plan, exécuté seulement lors d'une action (show, count, write)", "Une erreur", "Les données sont supprimées"]
    reponse: 1
    explication: "C'est l'évaluation paresseuse : Spark optimise tout le plan (optimiseur Catalyst) avant de l'exécuter."
  - question: "Qu'est-ce qu'un shuffle ?"
    choix: ["Un mélange aléatoire des lignes", "Une redistribution des données entre les executors, nécessaire pour un groupBy ou une jointure", "Un format de fichier", "Une erreur de mémoire"]
    reponse: 1
    explication: "Le shuffle passe par le réseau et le disque : c'est l'opération la plus coûteuse, à limiter."
  - question: "Pourquoi le format Parquet est-il privilégié ?"
    choix: ["Il est lisible dans un éditeur de texte", "Il est colonnaire, compressé, typé : on ne lit que les colonnes utiles", "Il est plus ancien que le CSV", "Il est réservé à Excel"]
    reponse: 1
    explication: "Une requête sur 3 colonnes d'une table de 50 colonnes lit environ 6 % des données."
  - question: "À quoi sert partitionBy('annee', 'mois') à l'écriture ?"
    choix: ["À trier", "À ranger les fichiers par dossiers annee=/mois= pour ne lire que les partitions utiles", "À compresser", "À supprimer les doublons"]
    reponse: 1
    explication: "Un filtre sur mois = 12 ne lit que le dossier correspondant : c'est l'élagage de partitions."
---

## Pourquoi Spark ?

pandas charge **tout** en mémoire, sur **une** machine. C'est parfait pour 100 Mo, difficile pour 20 Go, impossible pour 2 To. Les opérateurs télécoms et les banques traitent pourtant chaque jour des milliards de lignes (appels, transactions mobiles, journaux).

**Apache Spark** répartit le travail sur **plusieurs machines** (un cluster), en mémoire autant que possible. C'est le moteur au cœur de **Databricks**, et il est disponible sur tous les clouds (AWS EMR, Google Dataproc, Azure Synapse).

| | pandas | Spark |
|---|---|---|
| Machine | une seule | une à des milliers |
| Volume confortable | jusqu'à quelques Go | du Go au Po |
| Exécution | immédiate | **paresseuse**, optimisée |
| Langages | Python | Python (PySpark), SQL, Scala, Java, R |

> Pour de petites données, Spark est **plus lent** que pandas : distribuer le travail a un coût. On le choisit pour le volume, pas par habitude.

## L'architecture

```
                 ┌────────── Driver (ton programme) ──────────┐
                 │ SparkSession, plan d'exécution, ordonnance  │
                 └──────────────┬──────────────────────────────┘
                     Cluster manager (local, YARN, Kubernetes)
          ┌─────────────────────┼─────────────────────┐
   Executor 1             Executor 2             Executor 3
   [tâche][tâche]         [tâche][tâche]         [tâche][tâche]
   partitions 1-4         partitions 5-8         partitions 9-12
```

- **Le driver** exécute ton code, construit le plan et distribue les tâches.
- **Les executors** traitent les **partitions** : les données sont découpées en morceaux, et **une tâche traite une partition**.
- **Le parallélisme** : 12 partitions sur 3 executors de 4 cœurs donnent 12 tâches **simultanées**.

## L'installation

```bash
pip install pyspark==3.5.3          # nécessite Java 17 (sudo apt install openjdk-17-jre)
# ou : docker run -it -p 8888:8888 jupyter/pyspark-notebook
```

```python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("ventes").master("local[*]").getOrCreate()   # local[*] : tous les cœurs de ta machine
```

L'interface **Spark UI** (`http://localhost:4040`) affiche les jobs, les étapes, les tâches et les shuffles.

## Les DataFrames PySpark

```python
ventes = (spark.read
    .option("header", True).option("inferSchema", True)
    .csv("donnees/ventes_*.csv"))                     # plusieurs fichiers d'un coup

ventes.printSchema()
ventes.show(5)

livrees = (ventes
    .filter(F.col("statut") == "livrée")
    .withColumn("montant", F.col("prix") * F.col("quantite"))
    .withColumn("mois", F.date_trunc("month", F.col("date_cmd"))))

par_categorie = (livrees
    .groupBy("categorie")
    .agg(F.sum("montant").alias("ca"), F.countDistinct("commande_id").alias("nb_commandes"))
    .orderBy(F.desc("ca")))

par_categorie.show()
```

| pandas | PySpark |
|---|---|
| `df[df["statut"] == "livrée"]` | `df.filter(F.col("statut") == "livrée")` |
| `df["montant"] = df.prix * df.quantite` | `df.withColumn("montant", F.col("prix") * F.col("quantite"))` |
| `df.groupby("categorie")["montant"].sum()` | `df.groupBy("categorie").agg(F.sum("montant"))` |
| `df.merge(clients, on="client_id")` | `df.join(clients, "client_id", "left")` |
| `df.sort_values("ca")` | `df.orderBy("ca")` |

**Les fonctions de fenêtrage**, comme en SQL (semaine 4) :

```python
from pyspark.sql.window import Window
w = Window.partitionBy("categorie").orderBy(F.desc("ca"))
top = ca_produit.withColumn("rang", F.row_number().over(w)).filter("rang <= 3")
```

## L'évaluation paresseuse

| Type | Exemples | Effet |
|---|---|---|
| **Transformations** | `filter`, `select`, `withColumn`, `groupBy`, `join` | **rien n'est calculé** : Spark enrichit un plan |
| **Actions** | `show`, `count`, `collect`, `write` | le plan est **optimisé** (Catalyst) puis **exécuté** |

Le bénéfice : Spark voit **tout** le plan avant d'agir. Il peut ainsi pousser les filtres au plus près de la lecture, ne lire que les colonnes utiles et réorganiser les jointures. `df.explain()` affiche le plan.

**Le shuffle** : un `groupBy` ou une `join` oblige à **regrouper** sur une même machine les lignes de même clé. Les données circulent alors entre executors, par le réseau et le disque. C'est l'opération **la plus coûteuse**.

Pour joindre une grosse table de faits à une petite dimension, `F.broadcast(dim)` envoie la petite table à **chaque** executor et **évite le shuffle**.

> Attention à `collect()` : il ramène **toutes** les données sur le driver. Sur 500 millions de lignes, le driver manque de mémoire. Utilise `show()`, `limit()` ou `write`.

## Spark SQL

```python
livrees.createOrReplaceTempView("ventes")
spark.sql("""
  SELECT categorie, date_trunc('month', date_cmd) AS mois, SUM(montant) AS ca
  FROM ventes GROUP BY 1, 2 ORDER BY 2
""").show()
```

Tout ton SQL des semaines 4 et 7 fonctionne ici. dbt sait d'ailleurs produire du Spark SQL.

## Écrire en Parquet partitionné

```python
(livrees
  .withColumn("annee", F.year("date_cmd")).withColumn("mois_num", F.month("date_cmd"))
  .write.mode("overwrite")
  .partitionBy("annee", "mois_num")
  .parquet("lac/silver/ventes"))
```

Cela produit `lac/silver/ventes/annee=2026/mois_num=12/part-0000.parquet`, et ainsi de suite.

- **Parquet** est un format **colonnaire**, compressé et typé. Exemple chiffré : une requête qui lit 3 colonnes d'une table de 50 colonnes lit environ 3 / 50 = **6 %** des données.
- **Le partitionnement** : `spark.read.parquet("lac/silver/ventes").filter("mois_num = 12")` ne lit **que** le dossier de décembre. C'est l'élagage de partitions.
- **Delta Lake** et **Apache Iceberg** ajoutent à Parquet les transactions ACID, les mises à jour (`MERGE`) et l'historique des versions. C'est la base du *lakehouse* de Databricks.

## Démonstration

1. On génère 5 millions de lignes de ventes fictives avec `spark.range(5_000_000)` et des colonnes aléatoires.
2. On compare le temps d'un calcul de CA par catégorie avec pandas (sur un échantillon) et avec Spark.
3. On ouvre la Spark UI pour observer les étapes et le shuffle du `groupBy`.
4. On écrit en CSV et en Parquet partitionné, puis on compare les tailles et la durée d'une requête filtrée sur un mois.

## Exercice guidé

À partir du fichier `ventes.csv` de la boutique (exporté depuis la vue `ventes_detaillees` de la séance du 24 décembre) :

1. Charge-le dans un DataFrame Spark et affiche son schéma.
2. Calcule le CA livré par client, trié par ordre décroissant.
3. Compare avec le résultat SQL : Awa 74 000, Ibrahima 70 000, Fatou 67 000.

## Exercice autonome

1. Génère un jeu de 10 millions de transactions de paiement mobile, avec un identifiant, un émetteur, un bénéficiaire, un montant, des frais, un type, une date sur l'année 2026 et une région.
2. Calcule le volume et le montant par mois et par type, puis le top 10 des émetteurs par montant, et la part des frais par région.
3. Joins une petite table « regions » (5 lignes) avec `broadcast` et observe dans `explain()` l'absence de shuffle pour cette jointure.
4. Écris le résultat en Parquet partitionné par mois.
5. Mesure la différence de temps entre une requête sur un seul mois en lisant le CSV et en lisant le Parquet partitionné.
6. Explique sur ta feuille pourquoi `df.count()` prend du temps alors que `df.filter(...)` est instantané.

## Correction

Exercice guidé :

```python
df = spark.read.option("header", True).option("inferSchema", True).csv("ventes.csv")
(df.filter(F.col("statut") == "livrée")
   .groupBy("client").agg(F.sum("montant").alias("total"))
   .orderBy(F.desc("total")).show())
```

Exercice autonome, la génération de données :

```python
import datetime as dt
n = 10_000_000
tx = (spark.range(n)
  .withColumn("emetteur", (F.rand(1) * 200_000).cast("int"))
  .withColumn("montant", (F.rand(2) * 100_000 + 500).cast("int"))
  .withColumn("frais", F.round(F.col("montant") * 0.01))
  .withColumn("type", F.element_at(F.array(F.lit("transfert"), F.lit("paiement"), F.lit("retrait")), (F.rand(3) * 3).cast("int") + 1))
  .withColumn("date", F.date_add(F.lit(dt.date(2026, 1, 1)), (F.rand(4) * 365).cast("int")))
  .withColumn("region_id", (F.rand(5) * 5).cast("int")))
```

`element_at` est indexé à partir de 1, d'où le `+ 1`.

Question 6 : `filter` est une **transformation**, Spark ne fait qu'ajouter une étape au plan. `count` est une **action** : il force la lecture des données, l'application de toutes les transformations et le comptage dans chaque partition, puis l'addition des comptes sur le driver.

## Pour aller plus loin

- **Databricks Community Edition** est un environnement Spark gratuit dans le navigateur, avec Delta Lake.
- **Structured Streaming** traite les flux en continu avec la même API de DataFrames. On fera le lien avec Kafka la semaine prochaine.
- La certification **Databricks Data Engineer Associate** fait partie de la phase 4 de ton parcours de 10 mois.
