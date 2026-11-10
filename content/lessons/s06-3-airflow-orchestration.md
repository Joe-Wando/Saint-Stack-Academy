---
slug: s06-3-airflow-orchestration
titre: Airflow en pratique, orchestrer l'ETL et dbt de bout en bout
domaine: Data
duree: 150
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Pipelines et big data", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 12 }
ordre: 4
prerequis_cours: []
visibilite: public
objectifs:
  - Orchestrer dans un même DAG une extraction Python, un contrôle qualité et dbt
  - Gérer connexions, variables et secrets sans les écrire dans le code
  - Utiliser capteurs (sensors), branchements et règles de déclenchement
  - Traiter les données par partition de date pour des relances et rattrapages sûrs
  - Mettre en place alertes, SLA et bonnes pratiques de production
prerequis:
  - Cours « Apache Airflow, les bases de l'orchestration », « Construire un pipeline ETL en Python vers PostgreSQL » et « dbt, tests, documentation, snapshots et intégration continue »
referentiels:
  - Astronomer Certification for Apache Airflow Fundamentals et DAG Authoring
  - Databricks Certified Data Engineer Associate, domaine « Production Pipelines »
  - Google SRE Workbook, chapitre « Data Processing Pipelines »
quiz:
  - question: "Pourquoi utiliser {{ ds }} dans les tâches plutôt que la date du jour ?"
    choix: ["C'est plus court", "Pour que chaque exécution traite sa propre journée : une relance ou un rattrapage du 10 décembre traite bien le 10", "Airflow l'impose", "Pour le fuseau horaire"]
    reponse: 1
    explication: "datetime.now() donnerait la date de la relance, et retraiterait la mauvaise journée."
  - question: "À quoi sert un FileSensor ?"
    choix: ["À supprimer un fichier", "À attendre qu'un fichier existe avant de lancer la suite", "À compresser un fichier", "À lire un fichier"]
    reponse: 1
    explication: "Exemple : attendre l'export quotidien commandes_2026-12-18.csv déposé par l'équipe du site."
  - question: "Où stocker le mot de passe de l'entrepôt utilisé par un DAG ?"
    choix: ["Dans le fichier du DAG", "Dans une Connection Airflow (ou un gestionnaire de secrets)", "Dans un commentaire", "Dans le nom de la tâche"]
    reponse: 1
    explication: "Les fichiers de DAG sont dans Git ; les Connections sont chiffrées dans la base de métadonnées ou lues depuis Vault ou AWS Secrets Manager."
  - question: "Que fait un BranchPythonOperator ?"
    choix: ["Il crée une branche Git", "Il choisit à l'exécution quelle(s) tâche(s) suivante(s) lancer ; les autres sont ignorées (skipped)", "Il lance toutes les branches", "Il fusionne deux DAG"]
    reponse: 1
    explication: "Par exemple : s'il n'y a aucune commande ce jour-là, on saute le chargement et on passe directement à la notification."
  - question: "Pourquoi éviter le code lourd au niveau supérieur d'un fichier de DAG ?"
    choix: ["Pour la lisibilité seulement", "Parce que le scheduler relit les fichiers de DAG en permanence : une requête à la base en dehors d'une tâche s'exécuterait des milliers de fois", "Python l'interdit", "Pour économiser le disque"]
    reponse: 1
    explication: "Tout accès réseau ou base doit se trouver dans une tâche."
---

## L'objectif

Réunir les briques des deux dernières semaines en **un pipeline de production** :

```
attendre_fichier ──▶ extraire_charger_silver ──▶ verifier_volume ──┬──▶ dbt_build ──▶ notifier_succes
   (sensor)              (ETL Python)              (branchement)    └──▶ rien_a_faire ─┘
```

Chaque nuit, pour la journée `{{ ds }}`, le DAG fait quatre choses :

1. il attend l'export du site ;
2. il charge la couche silver de façon idempotente ;
3. il construit et teste l'étoile avec dbt ;
4. il prévient quelqu'un, que tout ait réussi ou non.

## Les connexions, variables et secrets

| Élément | Usage | Où |
|---|---|---|
| **Connection** | identifiants d'un système (base, API, S3) | *Admin*, puis *Connections*, ou la variable d'environnement `AIRFLOW_CONN_<ID>` |
| **Variable** | paramètre simple (dossier d'entrée, seuil) | *Admin*, puis *Variables* |
| **Secrets backend** | en production : Vault, AWS Secrets Manager | configuration d'Airflow |

```bash
# dans .env de Docker Compose : la connexion « entrepot » sous forme d'URI
AIRFLOW_CONN_ENTREPOT='postgresql://postgres:data@host.docker.internal:5434/postgres'
```

Le code du DAG ne contient **jamais** de mot de passe, seulement l'identifiant `entrepot`.

## Le DAG complet

```python
# dags/pipeline_ventes.py
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.sensors.filesystem import FileSensor
from airflow.operators.bash import BashOperator
from airflow.operators.empty import EmptyOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook

DOSSIER = "/opt/airflow/donnees"
DBT_DIR = "/opt/airflow/dbt/boutique_dbt"

def alerter_echec(context):
    ti = context["task_instance"]
    print(f"ÉCHEC {ti.dag_id}.{ti.task_id} pour {context['ds']} : {ti.log_url}")
    # en production : envoi d'un message Slack, Telegram ou e-mail avec le lien vers le journal

@dag(
    schedule="0 2 * * *",
    start_date=datetime(2026, 12, 1),
    catchup=False,
    max_active_runs=1,                               # jamais deux exécutions en parallèle
    default_args={
        "retries": 2, "retry_delay": timedelta(minutes=10),
        "on_failure_callback": alerter_echec,
        "execution_timeout": timedelta(hours=1),
    },
    tags=["ventes", "production"],
)
def pipeline_ventes():

    attendre = FileSensor(
        task_id="attendre_fichier",
        filepath=DOSSIER + "/commandes_{{ ds }}.csv",
        poke_interval=300, timeout=6 * 3600, mode="reschedule",   # libère le worker entre deux vérifications
    )

    @task
    def extraire_charger_silver(ds=None) -> int:
        import pandas as pd
        df = pd.read_csv(f"{DOSSIER}/commandes_{ds}.csv", parse_dates=["date_cmd"])
        df = df.drop_duplicates(subset=["commande_id", "produit_id"])
        hook = PostgresHook(postgres_conn_id="entrepot")
        moteur = hook.get_sqlalchemy_engine()
        with moteur.begin() as c:                                   # transaction : tout ou rien
            c.exec_driver_sql("DELETE FROM silver.lignes_commande WHERE date_cmd = %s", (ds,))   # partition du jour
            df.to_sql("lignes_commande", c, schema="silver", if_exists="append", index=False)
        return len(df)

    @task.branch
    def verifier_volume(nb_lignes: int) -> str:
        return "dbt_build" if nb_lignes > 0 else "rien_a_faire"

    dbt_build = BashOperator(
        task_id="dbt_build",
        bash_command="cd " + DBT_DIR + " && dbt build --target prod --vars '{\"jour\": \"{{ ds }}\"}'",   # Airflow remplace {{ ds }}
    )

    rien = EmptyOperator(task_id="rien_a_faire")

    @task(trigger_rule="none_failed_min_one_success")
    def notifier_succes(ds=None):
        print(f"Pipeline ventes du {ds} terminé")

    n = extraire_charger_silver()
    attendre >> n
    verifier_volume(n) >> [dbt_build, rien] >> notifier_succes()

pipeline_ventes()
```

| Élément | Pourquoi |
|---|---|
| `max_active_runs=1` | deux exécutions simultanées pourraient se marcher dessus |
| `FileSensor` en mode `reschedule` | attendre le fichier sans bloquer un worker pendant des heures |
| `DELETE` de la partition, puis insertion, dans une transaction | **idempotence par partition** : relancer le 10 décembre remplace exactement le 10 décembre |
| `@task.branch` | sauter dbt les jours sans données |
| `trigger_rule="none_failed_min_one_success"` | la notification s'exécute quelle que soit la branche suivie (l'autre est « skipped ») |
| `on_failure_callback` | une alerte avec le lien vers le journal |
| `execution_timeout` | une tâche bloquée ne tourne pas indéfiniment |

Ici, dbt est lancé avec Bash, ce qui est simple. En entreprise, on utilise souvent **Astronomer Cosmos**, qui transforme chaque modèle dbt en tâche Airflow.

## Le traitement par partition

Exemple chiffré : le fichier du 18 décembre contient 1 250 lignes. Une première exécution charge 1 250 lignes datées du 18. Si on relance, le `DELETE` supprime ces 1 250 lignes puis les réinsère : il y en a **toujours 1 250**, et non 2 500.

Pour les relances, on dispose de *Clear* sur une exécution, et du **rattrapage** pour une période :

```bash
airflow dags backfill pipeline_ventes -s 2026-12-01 -e 2026-12-17
```

Chaque jour est traité indépendamment, avec son propre `{{ ds }}`.

## Les bonnes pratiques de production

1. **Rien de lourd au niveau supérieur du fichier**. Le scheduler relit les DAG toutes les 30 secondes environ : une requête SQL écrite en dehors d'une tâche s'exécuterait des milliers de fois par jour.
2. **Des tâches atomiques et idempotentes** : une tâche fait une seule chose, et peut être relancée sans risque.
3. **Les données ne passent pas par XCom** : on transmet seulement des nombres ou des noms de tables et de fichiers.
4. **Les dépendances lourdes sont isolées**, avec `@task.virtualenv`, `DockerOperator` ou `KubernetesPodOperator`.
5. **Les DAG sont testés en CI** : on vérifie que tous les DAG s'importent sans erreur avec `DagBag`.

```python
# tests/test_dags.py
from airflow.models import DagBag
def test_aucune_erreur_import():
    assert DagBag(dag_folder="dags", include_examples=False).import_errors == {}
```

6. **Les SLA et la supervision** : on mesure la durée des exécutions et on alerte si les données ne sont pas prêtes à 7 h. Airflow expose des métriques StatsD, que Prometheus et Grafana (voir le cours « Supervision avec Prometheus et Grafana ») peuvent afficher.

## Démonstration

1. On monte les dossiers `donnees/` et `dbt/` dans le Compose d'Airflow, et on installe `dbt-postgres` dans l'image (avec un `Dockerfile` qui part de `apache/airflow:2.10.5`).
2. On crée la connexion `entrepot`.
3. On dépose `commandes_2026-12-18.csv` : le capteur se débloque et la chaîne s'exécute.
4. On fait échouer un test dbt (une vente avec un client inconnu) : `dbt_build` passe au rouge, le callback affiche l'alerte, et on lit le journal dbt dans Airflow.
5. On corrige, puis on fait *Clear* : le pipeline repasse au vert, et le nombre de lignes reste identique.

## Exercice guidé

1. Ajoute au DAG une tâche `compter_silver`, après le chargement, qui affiche le nombre de lignes de `silver.lignes_commande` pour `{{ ds }}`, avec `PostgresHook`.
2. Ajoute un paramètre `seuil_min` dans les **Variables** d'Airflow (100). Si le volume du jour est inférieur au seuil, le branchement mène à une tâche `alerte_volume_faible` au lieu de dbt.

## Exercice autonome

Mets en production ta chaîne data complète :

1. Une image Airflow personnalisée, avec ton pipeline ETL Python sous forme de paquet et dbt.
2. Un DAG avec un capteur, l'extraction et le chargement par partition, dbt build, la vérification de fraîcheur et la notification.
3. Des alertes en cas d'échec, que tu reçois réellement (un e-mail, ou un bot Telegram avec `requests`).
4. Un rattrapage du 1er au 17 décembre avec 17 fichiers générés, puis la vérification que le chiffre d'affaires mensuel de `mart_ca_mensuel` est juste.
5. Un test de chargement des DAG en CI.
6. Un schéma d'architecture sur ta feuille, des sources jusqu'à Power BI. Il te servira de base pour ton portfolio.

## Correction

Exercice guidé :

```python
from airflow.models import Variable

@task
def compter_silver(ds=None) -> int:
    hook = PostgresHook(postgres_conn_id="entrepot")
    n = hook.get_first("SELECT COUNT(*) FROM silver.lignes_commande WHERE date_cmd = %s", parameters=(ds,))[0]
    print(f"{n} lignes pour le {ds}")
    return n

@task.branch
def verifier_volume(n: int) -> str:
    seuil = int(Variable.get("seuil_min", default_var=100))   # lu à l'exécution, pas au chargement du fichier
    if n == 0:
        return "rien_a_faire"
    return "dbt_build" if n >= seuil else "alerte_volume_faible"
```

`Variable.get` est appelé **dans** la tâche, et non au niveau supérieur du fichier (bonne pratique n° 1).

Exercice autonome, question 4 : la vérification consiste à additionner les chiffres d'affaires journaliers des 17 fichiers, en Python ou en SQL sur la couche silver. Le résultat doit égaler la ligne de décembre de `mart_ca_mensuel`. Un écart indique un jour chargé deux fois (défaut d'idempotence) ou un jour manquant.

## Pour aller plus loin

- **Les datasets Airflow** déclenchent un DAG quand un autre DAG a produit une donnée : c'est la planification guidée par les données.
- **OpenLineage** suit automatiquement le lignage des données entre Airflow, dbt et Spark.
- La semaine prochaine : Power BI pour visualiser l'étoile, puis Spark pour les gros volumes.
