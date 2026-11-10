---
slug: g04-3-kubernetes-multi-services-helm
titre: Kubernetes, application multi-services, stockage persistant et introduction à Helm
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Conteneurs, orchestration et automatisation", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 14 }
ordre: 5
prerequis_cours: []
visibilite: public
objectifs:
  - Déployer une application complète (base, API, frontend) dans un namespace
  - Rendre des données persistantes avec PersistentVolumeClaim et StatefulSet
  - Organiser ses manifestes et les appliquer d'un coup (dossier, Kustomize)
  - Comprendre le rôle de Helm (chart, values, release) et installer un chart existant
  - Mettre à l'échelle automatiquement avec un HorizontalPodAutoscaler
prerequis:
  - Cours « Kubernetes, architecture, Pods et Deployments » et « Kubernetes, Services, Ingress, ConfigMaps et Secrets »
referentiels:
  - CNCF CKAD, domaines « Application Design and Build » et « Application Deployment » (Helm, Kustomize)
  - CNCF KCNA, domaine « Cloud Native Application Delivery »
  - Documentation Helm v3, « Chart Template Guide »
quiz:
  - question: "Que se passe-t-il pour les données d'une base dans un Deployment sans volume quand son Pod est recréé ?"
    choix: ["Elles sont conservées", "Elles sont perdues", "Elles sont copiées sur un autre nœud", "Elles sont envoyées dans etcd"]
    reponse: 1
    explication: "Même leçon qu'avec Docker : il faut un PersistentVolumeClaim pour que les données survivent au Pod."
  - question: "Quelle différence entre un PersistentVolume (PV) et un PersistentVolumeClaim (PVC) ?"
    choix: ["Aucune", "Le PV est l'espace de stockage réel ; le PVC est la demande de stockage faite par l'application", "Le PVC est plus rapide", "Le PV est réservé au cloud"]
    reponse: 1
    explication: "L'application demande « 5 Gi » (PVC) ; le cluster lui attribue un volume (PV), souvent créé automatiquement par une StorageClass."
  - question: "Pourquoi utiliser un StatefulSet plutôt qu'un Deployment pour une base de données ?"
    choix: ["C'est plus rapide", "Il donne à chaque Pod une identité stable (nom, ordre) et son propre volume", "Il évite les Services", "Il est obligatoire pour toutes les applications"]
    reponse: 1
    explication: "postgres-0 garde son nom et son volume après redémarrage, ce qui est indispensable pour les applications avec état."
  - question: "Dans Helm, qu'est-ce qu'une release ?"
    choix: ["Une version de Helm", "Une installation d'un chart dans un cluster, avec un nom et un historique", "Un fichier YAML", "Une image Docker"]
    reponse: 1
    explication: "helm install ma-base bitnami/postgresql crée la release ma-base ; helm upgrade et helm rollback la font évoluer."
  - question: "Que fait un HorizontalPodAutoscaler ?"
    choix: ["Il ajoute des nœuds", "Il ajuste automatiquement le nombre de répliques selon une métrique (par exemple l'usage processeur)", "Il agrandit les disques", "Il met à jour les images"]
    reponse: 1
    explication: "Par exemple : entre 2 et 10 répliques pour viser 70 % de processeur. Il faut que les Pods déclarent des requests."
---

## L'objectif

Déployer **toute** la boutique dans Kubernetes : PostgreSQL avec des données persistantes, l'API à 3 répliques et un frontend, regroupés dans un namespace. Puis découvrir **Helm**, le gestionnaire de paquets de Kubernetes, qui évite de réécrire 300 lignes de YAML pour chaque environnement.

```
Namespace « boutique »
 Ingress boutique.local ──┬── /api ──▶ Service api ──▶ Deployment api (3 Pods) ──┐
                          └── /    ──▶ Service web ──▶ Deployment web (2 Pods)   │
                                                                                  ▼
                                       Service postgres ──▶ StatefulSet postgres-0 ── PVC 5 Gi
```

## Le stockage persistant

| Objet | Rôle | Analogie |
|---|---|---|
| **PersistentVolume** (PV) | un espace de stockage réel (disque cloud, NFS…) | un appartement |
| **PersistentVolumeClaim** (PVC) | la **demande** de l'application : « 5 Gi en lecture-écriture » | une demande de location |
| **StorageClass** | le type de stockage et sa création **automatique** | l'agence qui trouve l'appartement |

Sur kind, minikube ou dans le cloud, une StorageClass par défaut crée le PV automatiquement à partir du PVC.

## Le StatefulSet pour la base

Un **StatefulSet** est un Deployment pour les applications **avec état**. Ses Pods ont un **nom stable** (`postgres-0`, `postgres-1`), démarrent dans l'ordre et ont chacun **leur propre volume**.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: boutique
spec:
  serviceName: postgres
  replicas: 1
  selector: { matchLabels: { app: postgres } }
  template:
    metadata: { labels: { app: postgres } }
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          envFrom: [ { secretRef: { name: postgres-auth } } ]   # POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
          ports: [ { containerPort: 5432 } ]
          volumeMounts:
            - { name: data, mountPath: /var/lib/postgresql/data, subPath: pgdata }
          readinessProbe:
            exec: { command: ["pg_isready", "-U", "boutique"] }
  volumeClaimTemplates:                 # un PVC créé automatiquement par Pod
    - metadata: { name: data }
      spec:
        accessModes: ["ReadWriteOnce"]
        resources: { requests: { storage: 5Gi } }
---
apiVersion: v1
kind: Service
metadata: { name: postgres, namespace: boutique }
spec:
  selector: { app: postgres }
  ports: [ { port: 5432 } ]
```

Le séparateur `---` permet de mettre plusieurs objets dans un même fichier.

> En production, beaucoup d'équipes **ne mettent pas** leur base dans Kubernetes. Elles utilisent un service managé (AWS RDS, Cloud SQL) qui gère pour elles les sauvegardes et la haute disponibilité. Savoir le faire reste indispensable pour les environnements de développement et de test.

## Organiser ses manifestes

```
k8s/
├── 00-namespace.yaml
├── 10-postgres.yaml        (Secret, StatefulSet, Service)
├── 20-api.yaml             (ConfigMap, Deployment, Service)
├── 30-web.yaml             (Deployment, Service)
└── 40-ingress.yaml
```

```bash
kubectl apply -f k8s/                 # applique tout le dossier, dans l'ordre alphabétique
kubectl get all -n boutique
kubectl config set-context --current --namespace=boutique   # namespace par défaut
```

**Kustomize**, intégré à kubectl, gère les variantes par environnement : une base commune et des surcouches `dev` et `prod` qui changent les répliques ou les images. On l'applique avec `kubectl apply -k overlays/prod`.

## La mise à l'échelle automatique

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api, namespace: boutique }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

**Le calcul** : répliques voulues = ⌈ répliques actuelles × (usage actuel ÷ cible) ⌉.

Exemple chiffré : 3 répliques à 140 % de processeur en moyenne, pour une cible de 70 %. On obtient ⌈3 × 140 / 70⌉ = **6** répliques.

Il faut que le serveur de métriques (`metrics-server`) soit installé et que les Pods déclarent des `requests`, car le pourcentage est calculé par rapport à elles.

## Helm, le gestionnaire de paquets de Kubernetes

| Terme | Définition | Équivalent |
|---|---|---|
| **Chart** | un paquet : modèles de manifestes et valeurs par défaut | un paquet `apt` |
| **values.yaml** | les paramètres modifiables (répliques, image, ressources) | un fichier de configuration |
| **Release** | une installation d'un chart dans un cluster | un logiciel installé |
| **Dépôt** | un catalogue de charts | un dépôt `apt` |

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm search repo postgresql
helm install ma-base bitnami/postgresql -n boutique \
  --set auth.username=boutique,auth.database=boutique,primary.persistence.size=5Gi
helm list -n boutique
helm upgrade ma-base bitnami/postgresql -n boutique -f mes-valeurs.yaml
helm rollback ma-base 1 -n boutique
helm uninstall ma-base -n boutique
```

En **une commande**, on obtient un PostgreSQL avec StatefulSet, Service, Secret, PVC et sondes, configuré selon les bonnes pratiques. Le cours « Écrire son propre chart Helm » montre comment écrire **son propre** chart.

## Démonstration

1. Avec `kubectl apply -f k8s/`, on déploie toute la boutique dans le namespace `boutique`.
2. On ajoute deux produits par l'Ingress.
3. On fait `kubectl delete pod postgres-0` : le Pod est recréé **avec le même nom**, et les produits sont toujours là grâce au PVC.
4. On installe l'HPA, on génère de la charge (`kubectl run charge --image=busybox -- sh -c "while true; do wget -qO- http://api/produits; done"`), et on regarde `kubectl get hpa -w` faire monter le nombre de répliques.
5. On remplace notre StatefulSet par le chart Bitnami avec `helm install`.

## Exercice guidé

1. Crée un PVC de 1 Gi et un Pod `busybox` qui y écrit la date toutes les 5 secondes.
2. Supprime le Pod, recrée-le, et vérifie que le fichier contient toujours les anciennes lignes.
3. Affiche le PV créé automatiquement et sa StorageClass.

## Exercice autonome

1. Déploie la boutique complète dans le namespace `boutique`, avec un dossier `k8s/` versionné dans Git.
2. Prouve la persistance de la base en supprimant `postgres-0`.
3. Ajoute un HPA à l'API (de 2 à 6 répliques, cible 60 %) et provoque une montée en charge.
4. Calcule : 4 répliques à 90 % de processeur, pour une cible de 60 %. Combien de répliques l'HPA demandera-t-il ? Et s'il y a un maximum de 5 ?
5. Installe Redis avec Helm (`bitnami/redis`, sans réplicas secondaires) et fais en sorte que l'API s'y connecte grâce au Service créé par le chart.

## Correction

Exercice guidé :

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: journal }
spec: { accessModes: ["ReadWriteOnce"], resources: { requests: { storage: 1Gi } } }
---
apiVersion: v1
kind: Pod
metadata: { name: ecrivain }
spec:
  containers:
    - name: b
      image: busybox
      command: ["sh", "-c", "while true; do date >> /data/journal.txt; sleep 5; done"]
      volumeMounts: [ { name: d, mountPath: /data } ]
  volumes: [ { name: d, persistentVolumeClaim: { claimName: journal } } ]
```

Vérification : `kubectl exec ecrivain -- wc -l /data/journal.txt`. Le nombre de lignes continue d'augmenter après la recréation du Pod.

Exercice autonome :

- Question 4 : ⌈4 × 90 / 60⌉ = ⌈6⌉ = **6** répliques. Avec un maximum de 5, l'HPA s'arrête à **5**.
- Question 5 :
  - installation : `helm install cache bitnami/redis -n boutique --set architecture=standalone` ;
  - le Service s'appelle `cache-redis-master`, et le mot de passe se trouve dans le Secret `cache-redis` ;
  - l'API reçoit `REDIS_URL=redis://:<mdp>@cache-redis-master:6379`, avec le mot de passe injecté depuis le Secret par `secretKeyRef`.

## Pour aller plus loin

- **Argo CD** applique la démarche GitOps : le cluster se synchronise automatiquement sur le dossier `k8s/` du dépôt Git.
- Les *Operators* (CloudNativePG, par exemple) gèrent une base de données comme le ferait un administrateur : sauvegardes, réplication, bascule.
- Cours suivant conseillé : « Supervision avec Prometheus et Grafana ».
