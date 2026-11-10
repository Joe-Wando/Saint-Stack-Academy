---
slug: g04-1-kubernetes-pods-deployments
titre: Kubernetes, architecture, Pods et Deployments
domaine: DevOps
duree: 120
difficulte: découverte
licence:
  - { niveau: L3, semestre: S6, ue: "Conteneurs, orchestration et automatisation", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 12 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce qu'apporte un orchestrateur par rapport à Docker Compose
  - Décrire l'architecture d'un cluster (plan de contrôle, nœuds, kubelet)
  - Créer un cluster local et piloter Kubernetes avec kubectl
  - Écrire les manifestes YAML d'un Pod et d'un Deployment
  - Faire une mise à l'échelle, une mise à jour progressive et un retour arrière
prerequis:
  - Cours Docker, dont « Docker Compose et Docker Hub »
referentiels:
  - CNCF Kubernetes and Cloud Native Associate (KCNA), domaines « Kubernetes Fundamentals » et « Container Orchestration »
  - CNCF Certified Kubernetes Application Developer (CKAD), domaine « Application Deployment »
  - Documentation officielle kubernetes.io, « Concepts »
quiz:
  - question: "Quel est le plus petit objet déployable dans Kubernetes ?"
    choix: ["Le conteneur", "Le Pod", "Le Deployment", "Le nœud"]
    reponse: 1
    explication: "Un Pod enveloppe un ou plusieurs conteneurs qui partagent le réseau et des volumes ; Kubernetes ne gère jamais un conteneur seul."
  - question: "Pourquoi ne crée-t-on presque jamais de Pod directement ?"
    choix: ["C'est interdit", "Parce qu'un Pod supprimé ou planté n'est pas recréé ; un Deployment, lui, maintient le nombre de répliques voulu", "Parce qu'un Pod n'a pas d'IP", "Parce que c'est payant"]
    reponse: 1
    explication: "Le Deployment (via un ReplicaSet) compare en permanence l'état réel à l'état désiré et corrige l'écart."
  - question: "Quel composant du plan de contrôle choisit le nœud sur lequel placer un Pod ?"
    choix: ["etcd", "kube-scheduler", "kubelet", "kube-proxy"]
    reponse: 1
    explication: "Le scheduler choisit selon les ressources disponibles ; le kubelet du nœud choisi lance ensuite les conteneurs."
  - question: "Que fait kubectl rollout undo deployment/api ?"
    choix: ["Supprime le Deployment", "Revient à la version précédente du Deployment", "Redémarre le cluster", "Annule la dernière commande kubectl"]
    reponse: 1
    explication: "Kubernetes garde l'historique des révisions : un retour arrière prend quelques secondes."
  - question: "Que signifie le caractère déclaratif de Kubernetes ?"
    choix: ["On décrit les étapes une par une", "On décrit l'état voulu (3 répliques de telle image) et Kubernetes s'occupe d'y parvenir et de s'y maintenir", "On déclare les erreurs", "On écrit en Java"]
    reponse: 1
    explication: "kubectl apply -f envoie l'état désiré ; les contrôleurs font converger la réalité vers cet état."
---

## Pourquoi un orchestrateur ?

Docker Compose fait tourner une application sur **une** machine. En production, il faut aller plus loin :

- plusieurs machines, pour encaisser la charge et survivre à une panne ;
- relancer automatiquement un conteneur qui plante, ou le déplacer si sa machine tombe ;
- monter en charge (passer de 3 à 30 copies de l'API un jour de soldes) ;
- mettre à jour **sans interruption**, et revenir en arrière en cas de problème.

**Kubernetes** (ou **K8s**), créé par Google puis confié à la CNCF, est devenu le standard. Tous les clouds le proposent en service managé : EKS chez AWS, GKE chez Google, AKS chez Azure.

> Analogie : Docker est un musicien, Compose un petit groupe qui joue dans un salon, et Kubernetes le **chef d'orchestre** d'un orchestre symphonique. Si un musicien tombe malade, le chef le remplace aussitôt.

## Le principe déclaratif

On ne dit pas à Kubernetes **comment** faire (« lance un conteneur, puis un autre… »). On décrit l'**état voulu** : « je veux 3 copies de `boutique-api:1.2` ». Des **contrôleurs** comparent sans arrêt l'état **réel** à l'état **désiré** et corrigent l'écart. C'est la **boucle de réconciliation**.

## L'architecture d'un cluster

```
                  ┌─────────────── Plan de contrôle ───────────────┐
 kubectl ───────▶ │ kube-apiserver  ◀──▶ etcd (base clé-valeur)    │
                  │ kube-scheduler        controller-manager        │
                  └───────────────────────┬─────────────────────────┘
          ┌───────────────────────────────┼──────────────────────────────┐
     ┌────▼──── Nœud 1 ────┐        ┌─────▼─── Nœud 2 ────┐       ┌─────▼─── Nœud 3 ────┐
     │ kubelet  kube-proxy │        │ kubelet  kube-proxy │       │ kubelet  kube-proxy │
     │ containerd          │        │ containerd          │       │ containerd          │
     │ [Pod] [Pod]         │        │ [Pod]               │       │ [Pod] [Pod]         │
     └─────────────────────┘        └─────────────────────┘       └─────────────────────┘
```

| Composant | Rôle |
|---|---|
| **kube-apiserver** | la porte d'entrée : tout passe par son API REST, y compris kubectl |
| **etcd** | la mémoire du cluster, où est stocké tout l'état |
| **kube-scheduler** | choisit sur quel nœud placer chaque nouveau Pod |
| **controller-manager** | fait tourner les boucles de réconciliation |
| **kubelet** | l'agent présent sur chaque nœud, qui lance et surveille les conteneurs |
| **kube-proxy** | règles réseau des Services (vus dans le cours suivant) |
| **runtime** | containerd, qui exécute réellement les conteneurs |

## Un cluster local

```bash
# Option 1 : kind (Kubernetes IN Docker), léger
kind create cluster --name saint-stack
# Option 2 : minikube
minikube start
# Docker Desktop : Settings, puis Kubernetes, puis Enable

kubectl cluster-info
kubectl get nodes
```

## kubectl, l'essentiel

```bash
kubectl get pods                  # lister (pods, deployments, services, all…)
kubectl get pods -o wide          # avec le nœud et l'IP
kubectl describe pod <nom>        # détail et ÉVÉNEMENTS : c'est là qu'on trouve les erreurs
kubectl logs <pod> [-f]           # journaux
kubectl exec -it <pod> -- sh      # shell dans le conteneur
kubectl apply -f fichier.yaml     # créer ou mettre à jour depuis un manifeste
kubectl delete -f fichier.yaml
kubectl explain deployment.spec   # documentation intégrée des champs
```

## Le Pod

Le **Pod** est la plus petite unité. Il contient un ou plusieurs conteneurs qui partagent **la même IP** et peuvent partager des volumes.

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-test
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.27-alpine
      ports:
        - containerPort: 80
```

Tout manifeste a quatre parties : `apiVersion`, `kind`, `metadata` (le nom et les **labels**) et `spec` (l'état voulu).

Un Pod seul n'est **pas recréé** s'il est supprimé ou si son nœud tombe. On le fait donc gérer par un Deployment.

## Le Deployment

```
Deployment (état voulu : 3 répliques de boutique-api:1.0)
   └── ReplicaSet (maintient exactement 3 Pods)
         ├── Pod boutique-api-7c9f-abcde
         ├── Pod boutique-api-7c9f-fghij
         └── Pod boutique-api-7c9f-klmno
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boutique-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: boutique-api           # les Pods gérés : ceux qui portent ce label
  template:                        # le modèle de Pod
    metadata:
      labels:
        app: boutique-api
    spec:
      containers:
        - name: api
          image: ghcr.io/saint-stack/boutique-api:1.0
          ports:
            - containerPort: 3000
          resources:
            requests: { cpu: 100m, memory: 128Mi }   # réservé pour le placement
            limits:   { cpu: 500m, memory: 256Mi }   # plafond
          readinessProbe:                             # prêt à recevoir du trafic ?
            httpGet: { path: /sante, port: 3000 }
          livenessProbe:                              # toujours en vie ? sinon redémarrage
            httpGet: { path: /sante, port: 3000 }
            initialDelaySeconds: 10
```

`100m` signifie 100 millicœurs, soit 0,1 cœur de processeur. `128Mi` signifie 128 mébioctets.

## Mise à l'échelle, mise à jour, retour arrière

```bash
kubectl apply -f deployment.yaml
kubectl get deploy,rs,pods
kubectl scale deployment boutique-api --replicas=5
kubectl delete pod <un-des-pods>            # il est recréé aussitôt
kubectl set image deployment/boutique-api api=ghcr.io/saint-stack/boutique-api:1.1
kubectl rollout status deployment/boutique-api   # mise à jour progressive
kubectl rollout history deployment/boutique-api
kubectl rollout undo deployment/boutique-api     # retour à la 1.0
```

La **mise à jour progressive** (*rolling update*) crée les nouveaux Pods au fur et à mesure et ne supprime les anciens que lorsque les nouveaux sont **prêts** (sonde *readiness*). Il n'y a donc **aucune interruption**.

## Démonstration

1. On crée le cluster avec kind, puis le Deployment nginx à 3 répliques.
2. On supprime 2 Pods et on les voit être recréés en direct (`kubectl get pods -w`).
3. On met à jour l'image vers une version **qui n'existe pas** : le statut passe à `ImagePullBackOff`, et `describe` affiche l'événement qui explique pourquoi.
4. On fait `rollout undo` : tout revient dans l'ordre. Grâce à la mise à jour progressive, les anciens Pods n'avaient jamais été supprimés.

## Exercice guidé

1. Écris `pod.yaml` pour un Pod `httpd:2.4`, applique-le, puis trouve son IP et son nœud.
2. Supprime-le. Est-il recréé ? Pourquoi ?
3. Transforme-le en Deployment à 2 répliques, puis passe à 4 répliques **en modifiant le fichier** et en refaisant `apply`, sans utiliser `scale`.

## Exercice autonome

1. Déploie ton image d'API, publiée dans le cours « GitHub Actions, tests, matrice, secrets et publication d'une image Docker », en Deployment à 3 répliques, avec des ressources et les deux sondes.
2. Provoque un plantage : un Pod qui démarre avec une mauvaise commande. Quel statut observes-tu, et comment le diagnostiques-tu ?
3. Fais une mise à jour vers une nouvelle version de ton image, puis un retour arrière. Note les révisions.
4. Explique sur ta feuille ce que fait le scheduler si tu demandes 10 répliques avec `requests: memory: 2Gi` sur un cluster d'un nœud de 8 Gi.

## Correction

Exercice guidé, question 2 : le Pod **n'est pas recréé**, car rien ne le gère. Un Pod seul n'a pas de contrôleur.

Question 3 :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: httpd }
spec:
  replicas: 4
  selector: { matchLabels: { app: httpd } }
  template:
    metadata: { labels: { app: httpd } }
    spec:
      containers: [ { name: httpd, image: "httpd:2.4", ports: [ { containerPort: 80 } ] } ]
```

C'est l'esprit déclaratif : le **fichier** est la source de vérité, versionnée dans Git.

Exercice autonome :

- Question 2 : le statut est `CrashLoopBackOff`. Le conteneur démarre, plante, est relancé, puis Kubernetes espace de plus en plus les tentatives. Le diagnostic se fait avec `kubectl logs <pod> --previous` (les journaux de l'exécution précédente) et `kubectl describe pod` (code de sortie, événements).
- Question 4 : 8 Gi divisés par 2 Gi donnent au plus **4** Pods, et en pratique **3**, car le système et Kubernetes réservent aussi de la mémoire. Les autres restent en `Pending`, et `describe` affiche `Insufficient memory`. Il faut ajouter des nœuds ou réduire la demande.

## Pour aller plus loin

- `k9s` est une interface texte très pratique pour naviguer dans un cluster.
- Les *Namespaces* séparent les environnements dans un même cluster : `kubectl create namespace test`.
- Cours suivant conseillé : « Kubernetes, Services, Ingress, ConfigMaps et Secrets » : rendre l'API joignable et la configurer.
