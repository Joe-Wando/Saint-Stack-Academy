---
slug: s06-2-airflow-bases
titre: Apache Airflow, les bases de l'orchestration
domaine: Data
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Pipelines et big data", option: big-data-ia }
parcours:
  - { parcours: data, ordre: 11 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce qu'est un orchestrateur et pourquoi cron ne suffit plus
  - Décrire l'architecture d'Airflow (scheduler, webserver, executor, base de métadonnées)
  - Écrire un DAG avec des tâches et des dépendances, avec l'API TaskFlow
  - Comprendre la planification (schedule, start_date, catchup, logical date)
  - Utiliser l'interface pour lancer, suivre, relancer et lire les journaux des tâches
prerequis:
  - Séances « Bash en pratique, cron » et « Pipeline ETL en Python »
  - Docker Compose
referentiels:
  - Astronomer Certification for Apache Airflow Fundamentals
  - Google Cloud Professional Data Engineer, domaine « Maintaining and automating data workloads » (Cloud Composer)
  - Documentation Apache Airflow, « Core Concepts »
quiz:
  - question: "Qu'apporte Airflow par rapport à cron ?"
    choix: ["Rien de plus", "Les dépendances entre tâches, les relances automatiques, l'historique, l'interface de suivi et le rattrapage des exécutions", "Il est plus rapide pour une seule commande", "Il remplace la base de données"]
    reponse: 1
    explication: "cron lance une commande à heure fixe sans savoir si la précédente a réussi ; Airflow orchestre un graphe de tâches."
  - question: "Que signifie DAG ?"
    choix: ["Data Access Gateway", "Directed Acyclic Graph : un graphe orienté sans cycle de tâches", "Daily Automated Group", "Database Admin Guide"]
    reponse: 1
    explication: "Orienté : les tâches ont un ordre ; sans cycle : une tâche ne peut pas dépendre d'elle-même, même indirectement."
  - question: "Que fait l'opérateur >> dans extraire >> transformer ?"
    choix: ["Il compare deux tâches", "Il déclare que transformer s'exécute après la réussite d'extraire", "Il redirige la sortie", "Il fusionne les tâches"]
    reponse: 1
    explication: "C'est la déclaration de dépendance ; << déclare l'inverse."
  - question: "Avec catchup=True, start_date au 1er décembre et un DAG quotidien activé le 16, que se passe-t-il ?"
    choix: ["Rien", "Airflow lance les exécutions manquées du 1er au 15 (rattrapage)", "Le DAG s'exécute une seule fois", "Une erreur"]
    reponse: 1
    explication: "Utile pour recharger l'historique ; souvent désactivé (catchup=False) pour éviter une avalanche d'exécutions."
  - question: "Pourquoi une tâche Airflow doit-elle être idempotente ?"
    choix: ["Pour être plus rapide", "Parce qu'Airflow peut la relancer (retries, relance manuelle) : la relancer ne doit pas dupliquer les données", "C'est une obligation de Python", "Pour l'interface"]
    reponse: 1
    explication: "On retrouve le principe du pipeline ETL du 9 décembre : upsert, ou suppression de la partition du jour avant rechargement."
---

## Pourquoi un orchestrateur ?

Chaque nuit, notre chaîne data doit :

1. extraire les commandes (le script Python du 9 décembre) ;
2. **ensuite** lancer `dbt build` (le 11 et le 15 décembre) ;
3. **ensuite** rafraîchir le tableau de bord ;
4. **et** prévenir quelqu'un si une étape échoue.

Avec **cron**, on programmerait l'extraction à 2 h et dbt à 2 h 30, **en espérant** que l'extraction soit finie. Si elle échoue, dbt tourne quand même, sur des données incomplètes, et personne n'est prévenu.

Un **orchestrateur** gère :

| Besoin | cron | Airflow |
|---|---|---|
| Dépendances entre étapes | non | oui |
| Relances automatiques | non | oui (`retries`) |
| Historique et journaux par exécution | à faire soi-même | oui, dans l'interface |
| Rattrapage des jours manqués | non | oui (`catchup`, *backfill*) |
| Alertes en cas d'échec | non | oui (callbacks, e-mail) |

**Apache Airflow**, créé par Airbnb en 2014, est l'orchestrateur le plus utilisé en data engineering. Il existe en version managée chez Google (Cloud Composer) et chez AWS (MWAA).

## Les concepts

```
DAG « pipeline_ventes » (chaque jour à 2 h)
  extraire ──▶ controler ──▶ charger ──▶ dbt_build ──▶ notifier
```

| Concept | Définition |
|---|---|
| **DAG** | graphe **orienté sans cycle** : l'ensemble des tâches et de leurs dépendances, écrit en **Python** |
| **Tâche** (*task*) | une étape du DAG |
| **Opérateur** | le modèle d'une tâche : `PythonOperator`, `BashOperator`, `SQLExecuteQueryOperator`, `DockerOperator`… |
| **Exécution** (*DAG run*) | une exécution du DAG pour une date donnée |
| **Instance de tâche** | une tâche dans une exécution, avec un état : *success*, *failed*, *up_for_retry*… |

## L'architecture

```
 dags/*.py ──▶ [ Scheduler ] ──▶ décide quoi lancer ──▶ [ Executor / Workers ] exécutent les tâches
                    │                                             │
                    └──────────▶ [ Base de métadonnées (PostgreSQL) ] ◀─┘
                                          ▲
                                 [ Webserver / API ] ◀── toi, dans le navigateur
```

- **Le scheduler** lit les DAG et décide quelles tâches sont prêtes.
- **L'executor** les exécute : *LocalExecutor* sur une machine, *CeleryExecutor* ou *KubernetesExecutor* à grande échelle.
- **La base de métadonnées** stocke tout l'historique.

## L'installation avec Docker Compose

```bash
mkdir airflow && cd airflow
curl -LfO 'https://airflow.apache.org/docs/apache-airflow/2.10.5/docker-compose.yaml'
mkdir -p dags logs plugins config
echo "AIRFLOW_UID=$(id -u)" > .env
docker compose up airflow-init
docker compose up -d
```

L'interface est sur `http://localhost:8080`, avec les identifiants de laboratoire `airflow` / `airflow`.

> **Version.** Ce cours utilise **Airflow 2.10**, encore très répandu en entreprise. Airflow 3 (2025) garde les mêmes concepts. Deux choses changent : les imports deviennent `from airflow.sdk import dag, task`, et le rattrapage se lance avec `airflow backfill create`. Les fichiers de `dags/` sont détectés automatiquement après quelques secondes.

Il faut au moins 4 Go de RAM disponibles pour Docker. On retrouve la semaine 2 : un fichier Compose, plusieurs services, des volumes.

## Le premier DAG (API TaskFlow)

```python
# dags/bonjour.py
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.operators.bash import BashOperator

@dag(
    dag_id="bonjour_saint_stack",
    schedule="@daily",                      # ou une expression cron : "0 2 * * *"
    start_date=datetime(2026, 12, 1),
    catchup=False,                          # ne pas rattraper les jours passés
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["formation"],
)
def bonjour():

    @task
    def extraire() -> list[int]:
        return [12000, 5000, 35000]         # la valeur de retour est transmise à la tâche suivante (XCom)

    @task
    def total(montants: list[int]) -> int:
        return sum(montants)

    @task
    def afficher(t: int):
        print(f"Chiffre d'affaires du jour : {t} FCFA")

    date = BashOperator(task_id="date_serveur", bash_command="date")

    afficher(total(extraire())) >> date     # dépendances : déduites des appels, puis >> explicite

bonjour()
```

- Avec l'**API TaskFlow** (`@task`), les dépendances se déduisent des appels de fonctions, et les valeurs passent entre tâches par **XCom**.
- `>>` déclare explicitement « après » : `a >> b >> c`, ou `a >> [b, c]` pour un embranchement parallèle.
- **XCom** est fait pour de **petites** valeurs : un nombre, un chemin de fichier, un nom de table. Jamais un DataFrame d'un million de lignes. Les données transitent par la base ou par un stockage de fichiers.

Le calcul de la tâche `total` : 12 000 + 5 000 + 35 000 = **52 000 FCFA**, visible dans les journaux de `afficher`.

## La planification

| Valeur de `schedule` | Signification |
|---|---|
| `"@daily"` | tous les jours à minuit |
| `"0 2 * * *"` | tous les jours à 2 h (syntaxe cron de la semaine 2) |
| `"@hourly"`, `"@weekly"` | toutes les heures, toutes les semaines |
| `None` | uniquement à la main ou par déclenchement externe |

**La date logique** (*logical date*) désigne la **période traitée** par l'exécution, et non l'heure de lancement. L'exécution qui traite les ventes du **15 décembre** démarre le **16 à 0 h**, une fois la journée terminée. On l'utilise dans les tâches avec `{{ ds }}` (`2026-12-15`) pour ne traiter **que** cette journée. C'est ce qui permet de relancer proprement n'importe quel jour passé.

Le **fuseau horaire** : Airflow raisonne en UTC par défaut. Dakar étant en UTC+0, c'est pratique ici, mais il faut y penser ailleurs.

## L'interface

- **La vue DAGs** : activer ou désactiver un DAG, le lancer à la main (bouton *Trigger*).
- **La vue Grid** : l'historique des exécutions, avec une case par tâche (vert, rouge, orange).
- **La vue Graph** : le DAG dessiné.
- **Les journaux** : un clic sur une tâche, puis *Logs*. C'est là qu'on lit les erreurs.
- **Clear** : relancer une tâche, et éventuellement celles qui en dépendent.

En ligne de commande : `docker compose exec airflow-scheduler airflow dags test bonjour_saint_stack 2026-12-15` exécute le DAG une fois, pour tester.

## Démonstration

1. On lance Airflow avec Docker Compose.
2. On écrit le DAG `bonjour`, puis on le voit apparaître dans l'interface.
3. On le lance et on lit les journaux (52 000 FCFA).
4. On provoque une erreur (`1 / 0`) : la tâche passe en *up_for_retry*, puis en *failed* après 2 essais, et la tâche suivante devient *upstream_failed*.
5. On corrige, puis on fait *Clear* sur la tâche : elle repasse au vert.

## Exercice guidé

1. Écris un DAG manuel (`schedule=None`) avec 4 tâches Bash : `debut`, puis `a` et `b` en parallèle, puis `fin`.
2. Vérifie le dessin dans la vue Graph.
3. Fais échouer `b` (`exit 1`). Quel est l'état de `fin` ? Pourquoi ?

## Exercice autonome

1. Écris le DAG `rapport_quotidien`, planifié chaque jour à 6 h, sans rattrapage :
   - une tâche lit dans la base de la semaine 4 le nombre de commandes et le chiffre d'affaires livré de la journée `{{ ds }}` ;
   - une tâche écrit le résultat dans une table `rapports_quotidiens (jour, nb_commandes, ca)`, de façon **idempotente** ;
   - une tâche affiche un résumé.
2. Ajoute `retries=3` avec un délai de 2 minutes.
3. Lance un **rattrapage** sur la période du 1er au 10 décembre avec `airflow dags backfill`.
4. Explique pourquoi la tâche d'écriture doit supprimer la ligne du jour avant de l'insérer, ou utiliser un *upsert*.

## Correction

Exercice guidé :

```python
from airflow.decorators import dag
from airflow.operators.bash import BashOperator
from datetime import datetime

@dag(schedule=None, start_date=datetime(2026, 12, 1), catchup=False)
def embranchement():
    debut = BashOperator(task_id="debut", bash_command="echo début")
    a = BashOperator(task_id="a", bash_command="sleep 5")
    b = BashOperator(task_id="b", bash_command="exit 1")
    fin = BashOperator(task_id="fin", bash_command="echo fin")
    debut >> [a, b] >> fin
embranchement()
```

`fin` passe à l'état **upstream_failed** : par défaut (`trigger_rule="all_success"`), une tâche n'est lancée que si **toutes** ses tâches amont ont réussi. Avec `trigger_rule="all_done"`, elle s'exécuterait quand même ; c'est utile pour une tâche de nettoyage.

Exercice autonome, l'écriture idempotente :

```python
from airflow.providers.postgres.hooks.postgres import PostgresHook

@task
def ecrire(stats: dict, ds=None):
    hook = PostgresHook(postgres_conn_id="boutique")        # connexion définie dans Admin, puis Connections
    hook.run("""INSERT INTO rapports_quotidiens (jour, nb_commandes, ca) VALUES (%s, %s, %s)
                ON CONFLICT (jour) DO UPDATE SET nb_commandes = EXCLUDED.nb_commandes, ca = EXCLUDED.ca""",
             parameters=(ds, stats["n"], stats["ca"]))
```

Le rattrapage : `airflow dags backfill rapport_quotidien -s 2026-12-01 -e 2026-12-10`.

Question 4 : si la tâche est relancée (une relance automatique ou un *Clear*), un simple `INSERT` créerait **deux** lignes pour le même jour, et les cumuls seraient doublés. L'upsert garantit **une seule** ligne par jour, quel que soit le nombre d'exécutions.

## Pour aller plus loin

- Les **Connections** et **Variables** d'Airflow stockent identifiants et paramètres en dehors du code des DAG.
- **Dagster** et **Prefect** sont des alternatives modernes, centrées sur les données plutôt que sur les tâches.
- Vendredi : un vrai pipeline orchestré, avec l'ETL Python, dbt, les capteurs (*sensors*) et les alertes.
