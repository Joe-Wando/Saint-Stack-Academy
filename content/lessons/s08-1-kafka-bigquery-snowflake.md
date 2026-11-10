---
slug: s08-1-kafka-bigquery-snowflake
titre: Découverte, Kafka, BigQuery et Snowflake
domaine: Data
duree: 150
difficulte: découverte
licence:
  - { niveau: L3, semestre: S6, ue: "Pipelines et big data", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 16 }
ordre: 6
prerequis_cours: []
visibilite: public
objectifs:
  - Distinguer traitement par lots (batch) et traitement en flux (streaming)
  - Décrire Kafka (topics, partitions, producteurs, consommateurs, groupes, offsets) et le faire tourner localement
  - Expliquer ce qu'est un entrepôt cloud et son modèle de facturation
  - Charger et interroger des données dans BigQuery (bac à sable gratuit)
  - Situer Snowflake (séparation stockage et calcul, warehouses, time travel) et choisir entre ces outils
prerequis:
  - Semaines 4 à 7 du parcours solo (SQL, ETL, dbt, Airflow, Spark)
referentiels:
  - Confluent Certified Developer for Apache Kafka (CCDAK), domaines « Fundamentals » et « Producers and Consumers »
  - Google Cloud Professional Data Engineer, domaine « Storing the data » (BigQuery)
  - SnowPro Core Certification, domaines « Snowflake Architecture » et « Data Loading »
quiz:
  - question: "Quelle différence entre batch et streaming ?"
    choix: ["Aucune", "Le batch traite des lots à intervalles (chaque nuit) ; le streaming traite chaque événement dès qu'il arrive", "Le streaming est réservé à la vidéo", "Le batch est plus récent"]
    reponse: 1
    explication: "Rapport de ventes quotidien : batch. Détection de fraude pendant un paiement : streaming."
  - question: "Dans Kafka, que garantit le découpage d'un topic en partitions ?"
    choix: ["Le chiffrement", "Le parallélisme, et l'ordre des messages au sein d'une même partition", "La suppression automatique", "Le schéma des messages"]
    reponse: 1
    explication: "Les messages de même clé (même client) vont dans la même partition : leur ordre est conservé."
  - question: "Deux consommateurs du même groupe lisent un topic de 4 partitions. Comment se répartissent-ils le travail ?"
    choix: ["Chacun lit tout", "Les partitions sont réparties entre eux (2 chacun)", "Seul le premier lit", "Ils lisent un message sur deux au hasard"]
    reponse: 1
    explication: "Dans un groupe, chaque partition est lue par un seul consommateur ; un autre groupe relirait tout, indépendamment."
  - question: "Comment BigQuery facture-t-il principalement les requêtes en mode à la demande ?"
    choix: ["Au nombre de lignes renvoyées", "Au volume de données lues (scannées)", "À l'heure de connexion", "C'est gratuit sans limite"]
    reponse: 1
    explication: "SELECT * sur une grosse table coûte cher ; choisir les colonnes et filtrer les partitions réduit le coût."
  - question: "Quel est le principe architectural central de Snowflake ?"
    choix: ["Tout sur une seule machine", "La séparation du stockage et du calcul : des warehouses de calcul indépendants interrogent le même stockage", "Pas de SQL", "Un stockage en mémoire uniquement"]
    reponse: 1
    explication: "L'équipe BI et l'équipe data science peuvent avoir chacune leur warehouse sans se gêner, et on ne paie le calcul que lorsqu'il tourne."
---

## Le paysage

Ton parcours a construit une chaîne **batch** : chaque nuit, un ETL, dbt et Power BI. Cette séance ouvre deux portes :

- **le temps réel** : traiter les événements dès qu'ils arrivent, avec **Kafka** ;
- **les entrepôts cloud** : **BigQuery** et **Snowflake**, où de nombreuses entreprises ont migré leurs données.

C'est une séance de **découverte**. L'objectif est de comprendre les concepts, de faire tourner un premier exemple et de savoir quand utiliser quoi.

## Batch ou streaming

| | Batch | Streaming |
|---|---|---|
| Rythme | par lots, à intervalles | événement par événement, en continu |
| Latence | minutes à heures | millisecondes à secondes |
| Exemple | rapport de ventes quotidien | détection de fraude pendant un paiement, suivi d'une livraison |
| Outils | Airflow, dbt, Spark | Kafka, Spark Structured Streaming, Flink |

## Apache Kafka

Kafka est une **plateforme de diffusion d'événements**, créée par LinkedIn. C'est un **journal distribué** : les producteurs y ajoutent des messages, les consommateurs les lisent à leur rythme, et les messages sont **conservés** pendant une durée configurable, 7 jours par défaut.

```
Producteurs                       Topic « paiements » (3 partitions)             Consommateurs
(app mobile)  ──▶   P0: [m0][m3][m6][m9]  ──────────────▶  Groupe « fraude » :   C1 ← P0, P1
(caisse)      ──▶   P1: [m1][m4][m7]      ──────────────▶                        C2 ← P2
(site web)    ──▶   P2: [m2][m5][m8]      ──────────────▶  Groupe « entrepôt » : C3 ← P0, P1, P2
                    ↑ offsets 0, 1, 2…
```

| Concept | Définition |
|---|---|
| **Topic** | une catégorie de messages (`paiements`, `commandes`) |
| **Partition** | un morceau du topic, qui permet le **parallélisme** ; l'ordre est garanti **à l'intérieur** d'une partition |
| **Clé** | les messages de même clé (même client) vont dans la même partition, et restent donc dans l'ordre |
| **Offset** | la position d'un message dans sa partition ; chaque groupe mémorise le sien |
| **Groupe de consommateurs** | les partitions sont **réparties** entre ses membres ; chaque groupe lit **tout** le topic, indépendamment des autres |
| **Broker** | un serveur Kafka ; un cluster en compte plusieurs, avec **réplication** des partitions |

**Le découplage** : le service de paiement **publie** l'événement « paiement accepté » sans savoir qui l'utilise. La fraude, l'entrepôt de données et les notifications le **consomment** chacun de leur côté. Ajouter un nouvel usage ne demande aucune modification du producteur.

### L'essai en local

```yaml
# compose.yaml
services:
  kafka:
    image: apache/kafka:3.8.0       # mode KRaft : plus besoin de ZooKeeper
    ports: ["9092:9092"]
```

```bash
docker compose up -d
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --create --topic paiements --partitions 3 --bootstrap-server localhost:9092
pip install confluent-kafka
```

```python
# producteur.py
import json, random, time
from confluent_kafka import Producer
p = Producer({"bootstrap.servers": "localhost:9092"})
for i in range(20):
    evt = {"id": i, "client": f"C{random.randint(1, 5)}", "montant": random.randint(500, 200_000)}
    p.produce("paiements", key=evt["client"], value=json.dumps(evt))
    time.sleep(0.2)
p.flush()
```

```python
# consommateur_fraude.py
import json
from confluent_kafka import Consumer
c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "fraude", "auto.offset.reset": "earliest"})
c.subscribe(["paiements"])
while True:
    msg = c.poll(1.0)
    if msg is None or msg.error():
        continue
    evt = json.loads(msg.value())
    if evt["montant"] > 150_000:
        print(f"ALERTE paiement {evt['id']} de {evt['client']} : {evt['montant']} FCFA (partition {msg.partition()}, offset {msg.offset()})")
```

Lance **deux** consommateurs du groupe `fraude` : les 3 partitions se répartissent entre eux, par exemple 2 et 1. Lance ensuite un consommateur d'un **autre** groupe : il relit **tout** depuis le début.

## Les entrepôts cloud

Un entrepôt cloud est une base **analytique**, **colonnaire** comme Parquet, **massivement parallèle** et **gérée** : pas de serveur à administrer, et une capacité qui s'adapte à la demande.

### BigQuery (Google Cloud)

- **Sans serveur** : on écrit du SQL, Google alloue les ressources.
- **La facturation à la demande** se fait au **volume de données lues**. Le premier To par mois est gratuit (*free tier*), et le **bac à sable** (*sandbox*) s'utilise sans carte bancaire.
- **Les jeux de données publics** permettent de s'exercer : `bigquery-public-data`.

```sql
-- Les 10 prénoms les plus donnés aux États-Unis depuis 2000 (jeu public)
SELECT name, SUM(number) AS total
FROM `bigquery-public-data.usa_names.usa_1910_current`
WHERE year >= 2000
GROUP BY name
ORDER BY total DESC
LIMIT 10;
```

**Maîtriser le coût** :

- Ne jamais écrire `SELECT *`. Le format est colonnaire : on paie **chaque colonne lue**.
- **Partitionner** les tables par date et les **regrouper** (*cluster*) par les colonnes filtrées.
- Regarder l'estimation du volume avant d'exécuter : « Cette requête traitera 1,2 Go ».

Exemple chiffré : une table de 500 Go a 40 colonnes de taille comparable. Une requête qui lit 4 colonnes scanne environ 500 × 4 / 40 = **50 Go**. Si on filtre en plus une partition d'un mois sur 24, on descend à environ **2 Go**.

### Snowflake

- **La séparation du stockage et du calcul** : les données sont stockées une fois, et des **warehouses** (des grappes de calcul de taille XS, S, M…) les interrogent **indépendamment**.
- **Les warehouses s'arrêtent automatiquement** quand ils sont inactifs : on ne paie le calcul que pendant qu'il tourne, en crédits par seconde.
- **Le time travel** permet d'interroger une table **telle qu'elle était** il y a quelques heures, par exemple pour récupérer une suppression accidentelle : `SELECT * FROM ventes AT(OFFSET => -3600)`.
- **Le zero-copy clone** crée une copie instantanée d'une base pour les tests, sans dupliquer le stockage.
- Il est **multicloud** (AWS, Azure, GCP), et propose un essai gratuit de 30 jours.

### Comparaison rapide

| | PostgreSQL | BigQuery | Snowflake |
|---|---|---|---|
| Usage | OLTP, petit entrepôt | entrepôt analytique | entrepôt analytique |
| Gestion | à toi (ou RDS) | entièrement géré, sans serveur | géré, warehouses à dimensionner |
| Coût | serveur | volume scanné, ou capacité réservée | stockage plus crédits de calcul |
| Échelle | jusqu'à quelques To | Po | Po |
| dbt | oui | oui | oui |

**Ton projet dbt fonctionne sur les trois** : il suffit de changer d'adaptateur (`dbt-bigquery`, `dbt-snowflake`). Le SQL reste en grande partie identique. C'est tout l'intérêt de ce que tu as appris.

## Démonstration

1. On lance Kafka, avec un producteur de paiements et deux groupes consommateurs (fraude et archivage dans un fichier).
2. On ouvre le bac à sable BigQuery, on lance une requête sur un jeu public et on observe le volume scanné.
3. On charge le CSV de la boutique dans BigQuery, puis on y exécute les requêtes de la semaine 7, sans modification.
4. On fait une visite guidée de l'interface Snowflake : warehouses, time travel.

## Exercice guidé

1. Crée le topic `commandes` avec 2 partitions, et produis 10 commandes avec comme clé le `client_id`.
2. Avec un consommateur, affiche pour chaque message sa partition et son offset. Les commandes d'un même client sont-elles toujours dans la même partition ?
3. Dans le bac à sable BigQuery, écris une requête sur `bigquery-public-data.usa_names.usa_1910_current` qui compte les prénoms distincts par décennie. Note le volume scanné.

## Exercice autonome

1. Écris un consommateur Kafka qui lit le topic `paiements` et écrit chaque paiement dans PostgreSQL (couche bronze), de façon idempotente avec `ON CONFLICT (id)`.
2. Ajoute un second groupe qui calcule en continu le total encaissé par client, en mémoire, et l'affiche toutes les 10 secondes.
3. Charge ta table `fct_ventes` (dbt) dans BigQuery, adapte ton projet dbt avec `dbt-bigquery`, et lance `dbt build` sur BigQuery.
4. Rédige une note d'une page : pour une entreprise de paiement mobile au Sénégal, quelle architecture proposerais-tu (Kafka, entrepôt, outil de BI), et pourquoi ?

## Correction

Exercice guidé :

- Question 2 : **oui**. Kafka calcule la partition à partir d'une empreinte de la clé, avec la formule `partition = hash(clé) mod nombre_de_partitions`. Une même clé donne donc toujours la même partition, ce qui préserve l'ordre des commandes d'un client.
- Question 3 :

```sql
SELECT DIV(year, 10) * 10 AS decennie, COUNT(DISTINCT name) AS prenoms
FROM `bigquery-public-data.usa_names.usa_1910_current`
GROUP BY decennie ORDER BY decennie;
```

Seules les colonnes `year` et `name` sont lues, soit quelques dizaines de Mo. Un `SELECT *` lirait toute la table.

Exercice autonome, question 4, une proposition :

- **le flux** : les paiements sont publiés dans Kafka, consommés en temps réel par un service antifraude et par un chargeur vers l'entrepôt ;
- **les données** : un entrepôt cloud, BigQuery ou Snowflake selon le fournisseur cloud choisi, transformé par dbt et orchestré par Airflow ;
- **la restitution** : Power BI pour la direction.

Les points à justifier : la latence nécessaire pour la fraude (inférieure à la seconde), le volume (des millions de transactions par jour), la localisation des données et la réglementation (BCEAO, protection des données personnelles), et le coût.

## Pour aller plus loin

- **Kafka Connect** et **Debezium** capturent automatiquement chaque modification d'une base PostgreSQL dans Kafka : c'est la capture des changements de données (CDC).
- **Spark Structured Streaming** et **Flink** traitent les flux Kafka avec des fenêtres de temps.
- Ces outils reviennent dans la phase 4 (data engineering avancé) de ton parcours de 10 mois.
