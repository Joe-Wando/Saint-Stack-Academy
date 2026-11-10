---
slug: g04-4-prometheus-grafana
titre: Supervision avec Prometheus et Grafana
piste: groupe
semaine: 4
date: 2026-12-04
domaine: DevOps
duree: 120
niveau: bases
objectifs:
  - Expliquer les trois piliers de l'observabilité (métriques, journaux, traces)
  - Décrire le fonctionnement de Prometheus (collecte, séries temporelles, exporters)
  - Écrire des requêtes PromQL simples (rate, sum, by, histogram_quantile)
  - Instrumenter une API Node pour exposer ses métriques
  - Construire un tableau de bord Grafana et définir une alerte utile
prerequis:
  - Semaine 2 (Docker Compose) ; Kubernetes de la semaine 4
referentiels:
  - CNCF Prometheus Certified Associate (PCA), domaines « Observability Concepts », « PromQL », « Instrumentation » et « Alerting »
  - Google, Site Reliability Engineering, chapitre 6 « Monitoring Distributed Systems » (les quatre signaux d'or)
  - Méthode RED (Rate, Errors, Duration), Tom Wilkie
quiz:
  - question: "Comment Prometheus récupère-t-il les métriques ?"
    choix: ["Les applications les lui envoient (push)", "Il interroge régulièrement un point /metrics sur chaque cible (pull)", "Il lit les journaux", "Par e-mail"]
    reponse: 1
    explication: "Modèle pull : toutes les 15 s par défaut, Prometheus « scrape » /metrics. Pour les tâches courtes, il existe le Pushgateway."
  - question: "Quel type de métrique pour compter les requêtes HTTP reçues ?"
    choix: ["Gauge", "Counter", "Histogram", "Summary"]
    reponse: 1
    explication: "Un compteur ne fait qu'augmenter (il repart de zéro au redémarrage). Une gauge monte et descend (mémoire, connexions actives)."
  - question: "Que calcule rate(http_requests_total[5m]) ?"
    choix: ["Le total des requêtes", "Le nombre moyen de requêtes par seconde sur les 5 dernières minutes", "Les requêtes des 5 dernières secondes", "Le taux d'erreur"]
    reponse: 1
    explication: "rate transforme un compteur en débit par seconde, en gérant les remises à zéro."
  - question: "Quels sont les quatre signaux d'or selon Google SRE ?"
    choix: ["CPU, RAM, disque, réseau", "Latence, trafic, erreurs, saturation", "Logs, traces, métriques, alertes", "Disponibilité, sécurité, coût, vitesse"]
    reponse: 1
    explication: "Ils décrivent ce que vit l'utilisateur : temps de réponse, volume, échecs, et proximité de la limite des ressources."
  - question: "Pourquoi la latence se mesure-t-elle au 95e percentile plutôt qu'en moyenne ?"
    choix: ["C'est plus simple", "La moyenne masque les requêtes lentes que subit une partie des utilisateurs", "Le percentile est toujours plus bas", "Prometheus ne calcule pas de moyenne"]
    reponse: 1
    explication: "Moyenne de 100 ms possible alors que 5 % des utilisateurs attendent 3 s : le p95 révèle ce problème."
---

## Pourquoi superviser ?

Ton application tourne en production. Comment sais-tu qu'elle va bien ? Qu'elle répond vite ? Que le disque ne sera pas plein demain ? Sans supervision, ce sont **les utilisateurs** qui te préviennent, souvent trop tard et en colère.

**L'observabilité** repose sur trois piliers :

| Pilier | Question | Outils |
|---|---|---|
| **Métriques** | combien, à quelle vitesse ? (des nombres dans le temps) | Prometheus, Grafana |
| **Journaux** | que s'est-il passé exactement ? | Loki, Elasticsearch |
| **Traces** | par où est passée cette requête, et où a-t-elle perdu du temps ? | Jaeger, Tempo, OpenTelemetry |

Aujourd'hui, on se concentre sur les **métriques**.

## Que mesurer ?

**Les quatre signaux d'or** (Google SRE) :

1. **Latence** : le temps de réponse ;
2. **Trafic** : le nombre de requêtes par seconde ;
3. **Erreurs** : le taux de réponses 5xx ;
4. **Saturation** : la proximité de la limite (processeur, mémoire, disque, connexions).

La **méthode RED**, pour chaque service : *Rate* (débit), *Errors* (erreurs), *Duration* (durée).

## Prometheus

Prometheus est une base de données de **séries temporelles** et un outil de collecte. C'est un projet diplômé de la CNCF, comme Kubernetes.

```
 ┌──────────┐  scrape /metrics  ┌──────────────┐  PromQL  ┌─────────┐
 │ API Node │ ◀──────────────── │  Prometheus  │ ◀─────── │ Grafana │
 │ node_exp.│     toutes les    │ (stockage)   │          └─────────┘
 │ postgres │       15 s        │   règles ────┼──▶ Alertmanager ──▶ e-mail, Slack
 └──────────┘                   └──────────────┘
```

- **Modèle pull** : Prometheus vient lire `/metrics` sur chaque **cible**.
- Une **série** est un nom de métrique accompagné de **labels** : `http_requests_total{method="GET", route="/produits", status="200"}`.
- Les **exporters** exposent les métriques de logiciels existants : `node_exporter` pour la machine, `postgres_exporter`, `cAdvisor` pour les conteneurs.

### Les quatre types de métriques

| Type | Comportement | Exemple |
|---|---|---|
| **Counter** | ne fait qu'augmenter | `http_requests_total` |
| **Gauge** | monte et descend | `memoire_utilisee_octets`, `connexions_actives` |
| **Histogram** | répartit des mesures dans des intervalles (*buckets*) | `http_request_duration_seconds` |
| **Summary** | calcule des quantiles côté application | (moins utilisé) |

## Instrumenter une API Node

```js
const client = require('prom-client');
client.collectDefaultMetrics();                    // processeur, mémoire, boucle d'événements de Node

const duree = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3],
});

app.use((req, res, next) => {
  const fin = duree.startTimer();
  res.on('finish', () => fin({ method: req.method, route: req.route?.path ?? req.path, status: res.statusCode }));
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

> Attention à la **cardinalité** : ne mets jamais un identifiant d'utilisateur ou une URL complète (`/produits/123`) dans un label. Chaque valeur différente crée une nouvelle série, et Prometheus finit par saturer. Utilise la route (`/produits/:id`).

## Le lancement avec Docker Compose

```yaml
# compose.yaml (extrait)
  prometheus:
    image: prom/prometheus:v2.55.0
    volumes: [ "./prometheus.yml:/etc/prometheus/prometheus.yml:ro" ]
    ports: [ "9090:9090" ]
  grafana:
    image: grafana/grafana:11.3.0
    ports: [ "3001:3000" ]
    volumes: [ "grafana:/var/lib/grafana" ]
  node-exporter:
    image: prom/node-exporter:v1.8.2
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: api
    static_configs: [ { targets: ['api:3000'] } ]
  - job_name: machine
    static_configs: [ { targets: ['node-exporter:9100'] } ]
```

Dans Kubernetes, le chart Helm `kube-prometheus-stack` installe tout en une commande, et découvre les cibles automatiquement grâce aux *ServiceMonitors*.

## PromQL, l'essentiel

```promql
up                                              # 1 si la cible répond, 0 sinon
rate(http_request_duration_seconds_count[5m])   # requêtes par seconde
sum by (route) (rate(http_request_duration_seconds_count[5m]))   # par route

# Taux d'erreurs 5xx en pourcentage
100 * sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
    / sum(rate(http_request_duration_seconds_count[5m]))

# Latence au 95e percentile
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# Disque : pourcentage d'espace libre
100 * node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}
```

**Exemple chiffré** : le compteur passe de 12 000 à 12 600 en 5 minutes. `rate` donne 600 / 300 = **2 requêtes par seconde**. Si 30 de ces 600 requêtes sont des 5xx, le taux d'erreurs vaut 30 / 600 = **5 %**.

**Le percentile** : si le p95 vaut 0,8 s, alors 95 % des requêtes ont pris **au plus** 0,8 s, et 5 % ont pris plus longtemps.

## Grafana

1. Ouvre `http://localhost:3001` (identifiants `admin` / `admin` au premier lancement, à changer aussitôt).
2. *Connections*, puis *Data sources* : ajoute Prometheus avec l'URL `http://prometheus:9090`.
3. *Dashboards*, puis *New* : un panneau par signal d'or (débit, erreurs, latence p95, processeur et mémoire).
4. *Import* : le tableau de bord n° **1860** (« Node Exporter Full ») donne en un clic la vue complète de la machine.

## Les alertes

Une bonne alerte est **actionnable** : elle signale un problème que vit l'utilisateur, avec un seuil et une durée, pour éviter les fausses alertes.

```yaml
# regles.yml
groups:
  - name: boutique
    rules:
      - alert: TauxErreursEleve
        expr: |
          100 * sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
              / sum(rate(http_request_duration_seconds_count[5m])) > 5
        for: 10m
        labels: { severity: critique }
        annotations:
          summary: "Plus de 5 % d'erreurs 5xx depuis 10 minutes"
      - alert: DisqueBientotPlein
        expr: predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 24*3600) < 0
        for: 30m
        annotations: { summary: "Le disque sera plein dans moins de 24 h" }
```

**Alertmanager** reçoit ces alertes, les regroupe et les envoie par e-mail, Slack ou Telegram.

## Démonstration

1. On ajoute `prom-client` à l'API boutique et les trois services au fichier Compose.
2. Dans Prometheus, sur `localhost:9090`, *Status* puis *Targets* : toutes les cibles sont `UP`.
3. On génère du trafic, dont des erreurs, sur une route `/panne` qui renvoie 500 une fois sur trois.
4. On construit le tableau de bord RED dans Grafana, puis on importe le n° 1860.
5. On déclenche l'alerte `TauxErreursEleve` et on la regarde passer de *pending* à *firing*.

## Exercice guidé

Écris les requêtes PromQL suivantes :

1. le nombre de cibles qui ne répondent pas ;
2. le nombre de requêtes par seconde de la route `/produits` ;
3. l'utilisation processeur de la machine, en pourcentage. Indice : `node_cpu_seconds_total{mode="idle"}`.

## Exercice autonome

1. Instrumente ton API et ajoute la pile de supervision à ton fichier Compose.
2. Ajoute une métrique métier : un **Counter** `commandes_total`, avec le label `moyen_paiement` (`wave`, `orange_money`, `carte`).
3. Construis un tableau de bord avec les 4 signaux d'or, plus les commandes par minute selon le moyen de paiement.
4. Écris une alerte « API injoignable depuis 2 minutes », et une alerte « p95 supérieur à 1 s pendant 10 minutes ».
5. Ton API a une moyenne de 120 ms et un p99 de 4 s. Que dis-tu à ton équipe ?

## Correction

Exercice guidé :

```promql
count(up == 0)
sum(rate(http_request_duration_seconds_count{route="/produits"}[5m]))
100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])))
```

Exercice autonome, questions 2 et 4 :

```js
const commandes = new client.Counter({ name: 'commandes_total', help: 'Commandes validées', labelNames: ['moyen_paiement'] });
commandes.inc({ moyen_paiement: 'wave' });
```

```yaml
- alert: ApiInjoignable
  expr: up{job="api"} == 0
  for: 2m
- alert: LatenceElevee
  expr: histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) > 1
  for: 10m
```

Question 5 : la moyenne est trompeuse. **1 requête sur 100 prend 4 secondes ou plus**. Sur 100 000 requêtes par jour, cela fait au moins 1 000 expériences très lentes. Il faut chercher la cause :
- une requête SQL sans index (semaine 8) ;
- un appel externe lent ;
- le ramasse-miettes de Node.

On s'appuie sur des **traces** pour trouver où le temps est perdu.

## Pour aller plus loin

- Les SLO et budgets d'erreur, par exemple « 99,9 % des requêtes en moins de 300 ms sur 30 jours », sont le cœur de la démarche SRE.
- OpenTelemetry est le standard unique pour instrumenter métriques, journaux et traces.
- Grafana Loki est l'équivalent de Prometheus pour les journaux, et s'interroge avec LogQL.
