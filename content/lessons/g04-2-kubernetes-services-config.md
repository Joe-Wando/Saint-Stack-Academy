---
slug: g04-2-kubernetes-services-config
titre: Kubernetes, Services, Ingress, ConfigMaps et Secrets
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Conteneurs, orchestration et automatisation", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 13 }
ordre: 4
prerequis_cours: [g04-1-kubernetes-pods-deployments]
visibilite: public
objectifs:
  - Exposer des Pods avec un Service (ClusterIP, NodePort, LoadBalancer)
  - Expliquer le rôle des labels et sélecteurs dans le routage du trafic
  - Router du trafic HTTP par nom de domaine et chemin avec un Ingress
  - Externaliser la configuration avec une ConfigMap
  - Gérer des données sensibles avec un Secret et en connaître les limites
prerequis:
  - Cours « Kubernetes, architecture, Pods et Deployments »
referentiels:
  - CNCF CKAD, domaines « Services and Networking » et « Application Environment, Configuration and Security »
  - CNCF KCNA, domaine « Kubernetes Fundamentals »
  - The Twelve-Factor App, facteur III « Config »
quiz:
  - question: "Pourquoi a-t-on besoin d'un Service devant des Pods ?"
    choix: ["Pour les rendre plus rapides", "Parce que les Pods sont éphémères et changent d'IP ; le Service offre une adresse et un nom stables et répartit la charge", "Pour stocker des données", "Pour les mettre à jour"]
    reponse: 1
    explication: "Le Service sélectionne les Pods par label et répartit les requêtes entre eux, quels que soient leurs IP du moment."
  - question: "Quel type de Service n'est joignable qu'à l'intérieur du cluster ?"
    choix: ["NodePort", "LoadBalancer", "ClusterIP", "Ingress"]
    reponse: 2
    explication: "ClusterIP est le type par défaut, idéal pour une base de données ou une API interne."
  - question: "Les valeurs d'un Secret Kubernetes sont-elles chiffrées par défaut ?"
    choix: ["Oui, toujours", "Non, elles sont seulement encodées en base64 ; il faut activer le chiffrement d'etcd et restreindre l'accès (RBAC)", "Oui, en AES-256 dans le YAML", "Les Secrets n'existent pas"]
    reponse: 1
    explication: "base64 n'est pas du chiffrement : echo c2VjcmV0 | base64 -d révèle « secret ». Ne jamais commiter un Secret en clair dans Git."
  - question: "À quoi sert un Ingress ?"
    choix: ["À créer des Pods", "À router le trafic HTTP(S) externe vers différents Services selon le domaine ou le chemin", "À stocker des fichiers", "À surveiller le cluster"]
    reponse: 1
    explication: "boutique.sn/api va vers le Service api, boutique.sn/ vers le Service web, avec un seul point d'entrée et le TLS."
  - question: "Comment l'API joint-elle le Service postgres du même namespace ?"
    choix: ["Par l'IP du Pod postgres", "Par le nom postgres (DNS interne du cluster)", "Par localhost", "C'est impossible"]
    reponse: 1
    explication: "Le DNS interne (CoreDNS) résout postgres, ou postgres.default.svc.cluster.local depuis un autre namespace."
---

## Le problème

Dans le cours « Kubernetes, architecture, Pods et Deployments », nos 3 Pods d'API tournaient, mais :

- chaque Pod a une IP qui **change** à chaque recréation : impossible de la donner aux clients ;
- personne, en dehors du cluster, ne peut les joindre ;
- l'URL de la base et le mot de passe étaient **en dur** dans l'image ou le manifeste.

## Les Services

Un **Service** donne une **adresse et un nom stables** à un ensemble de Pods choisis par **label**, et **répartit** les requêtes entre eux.

```
                     Service « boutique-api » (10.96.12.34, nom DNS boutique-api)
                       selector: app=boutique-api
              ┌──────────────────┼──────────────────┐
         Pod (app=boutique-api)  Pod (…)          Pod (…)
         10.244.1.5              10.244.2.7       10.244.1.9
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: boutique-api
spec:
  type: ClusterIP              # par défaut
  selector:
    app: boutique-api          # DOIT correspondre aux labels des Pods
  ports:
    - port: 80                 # port du Service
      targetPort: 3000         # port du conteneur
```

| Type | Joignable depuis | Usage |
|---|---|---|
| **ClusterIP** | l'intérieur du cluster | base de données, API interne |
| **NodePort** | chaque nœud, sur un port de 30000 à 32767 | tests, labo |
| **LoadBalancer** | Internet, via un répartiteur de charge du cloud | exposer un service en production dans le cloud |

**Le DNS interne** : un Pod joint le Service par son **nom**, `boutique-api`, ou depuis un autre namespace par `boutique-api.<namespace>.svc.cluster.local`. C'est le même principe que le réseau Docker (voir le cours « Docker, volumes, réseaux et dockerisation d'une API »).

Pour tester en local sans exposer quoi que ce soit : `kubectl port-forward svc/boutique-api 8080:80`, puis `curl localhost:8080`.

> L'erreur la plus fréquente : un **selector** qui ne correspond pas aux labels des Pods. Le Service n'a alors aucun point d'arrivée. Vérifie avec `kubectl get endpoints boutique-api`.

## L'Ingress

Un **Ingress** est le point d'entrée HTTP(S) unique du cluster. Il route selon le **domaine** et le **chemin**, et gère le **TLS**. Il nécessite un **contrôleur d'Ingress** installé dans le cluster, par exemple ingress-nginx.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: boutique
spec:
  ingressClassName: nginx
  rules:
    - host: boutique.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: boutique-api, port: { number: 80 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: boutique-web, port: { number: 80 } } }
```

En local, on ajoute `127.0.0.1 boutique.local` dans `/etc/hosts`, comme on l'a vu dans le cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP ».

## Les ConfigMaps

Une **ConfigMap** stocke la configuration **non sensible** en dehors de l'image, ce qui respecte le facteur III des 12 facteurs.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: boutique-config
data:
  NODE_ENV: production
  LOG_LEVEL: info
  DEVISE: XOF
```

## Les Secrets

Un **Secret** stocke les données **sensibles** : mots de passe, jetons, certificats.

```bash
kubectl create secret generic boutique-db \
  --from-literal=DATABASE_URL='postgres://boutique:Sup3rS3cret@postgres:5432/boutique'
kubectl get secret boutique-db -o yaml       # la valeur apparaît en base64
```

> **Attention** : base64 **n'est pas du chiffrement**. `echo U3VwM3I= | base64 -d` le décode instantanément. En production, il faut :
> - activer le **chiffrement d'etcd** ;
> - limiter l'accès aux Secrets avec RBAC ;
> - **ne jamais** commiter un Secret en clair dans Git. On utilise *Sealed Secrets*, *External Secrets* avec AWS Secrets Manager, ou Vault.

## Injecter la configuration dans les Pods

```yaml
    spec:
      containers:
        - name: api
          image: ghcr.io/saint-stack/boutique-api:1.0
          envFrom:
            - configMapRef: { name: boutique-config }     # toutes les clés deviennent des variables
            - secretRef:    { name: boutique-db }
          env:
            - name: PORT
              value: "3000"
```

On peut aussi **monter** une ConfigMap ou un Secret sous forme de **fichiers**, par exemple pour un fichier de configuration nginx ou un certificat :

```yaml
          volumeMounts:
            - { name: conf, mountPath: /etc/nginx/conf.d }
      volumes:
        - name: conf
          configMap: { name: nginx-conf }
```

Modifier une ConfigMap ne redémarre **pas** les Pods qui l'utilisent en variables d'environnement. Il faut faire `kubectl rollout restart deployment/boutique-api`.

## Démonstration

1. On reprend le Deployment du cours précédent et on lui ajoute un Service ClusterIP.
2. On teste depuis un Pod temporaire : `kubectl run test --rm -it --image=alpine -- wget -qO- boutique-api/sante`.
3. On ajoute la ConfigMap et le Secret, puis on vérifie les variables avec `kubectl exec <pod> -- env | grep -E "NODE_ENV|DATABASE"`.
4. On installe ingress-nginx sur kind, on crée l'Ingress, et `curl http://boutique.local/api/sante` répond.

## Exercice guidé

1. Crée un Deployment `whoami` (image `traefik/whoami`, 3 répliques) et un Service ClusterIP sur le port 80.
2. Avec `kubectl port-forward`, appelle-le plusieurs fois. Que constates-tu dans le champ `Hostname` ?
3. Casse volontairement le `selector` du Service (`app: whoamii`) et observe `kubectl get endpoints`.

## Exercice autonome

1. Pour ton API, crée une ConfigMap (`NODE_ENV`, `LOG_LEVEL`), un Secret (`DATABASE_URL`) et un Service ClusterIP.
2. Modifie `LOG_LEVEL` dans la ConfigMap. Que faut-il faire pour que les Pods en tiennent compte ?
3. Crée un Ingress `boutique.local` : `/api` vers l'API, et `/` vers un Deployment nginx qui sert une page d'accueil.
4. Un collègue a commité `secret.yaml` dans Git avec `data: DATABASE_URL: cG9zdGdyZXM6Ly9...`. Explique le risque et les trois actions à mener.

## Correction

Exercice guidé, question 2 : le `Hostname` **change** d'un appel à l'autre. C'est la répartition de charge du Service entre les 3 Pods. Avec `port-forward`, toutes les requêtes peuvent cependant viser le même Pod ; utilise plutôt un Pod de test et `wget` en boucle.

Question 3 : `kubectl get endpoints whoami` affiche `<none>`, car le Service ne sélectionne plus aucun Pod.

Exercice autonome :

- Question 2 : `kubectl rollout restart deployment/boutique-api`, car les variables d'environnement ne sont lues qu'au démarrage du conteneur.
- Question 4 : la valeur n'est qu'en base64 ; quiconque a accès au dépôt, y compris à son **historique**, lit le mot de passe. Les trois actions :
  1. **Changer immédiatement** le mot de passe de la base, car le secret est considéré comme compromis.
  2. Retirer le fichier de l'historique (`git filter-repo`) et l'ajouter à `.gitignore`.
  3. Mettre en place une méthode sûre (Sealed Secrets, External Secrets) et un scanner de secrets en CI, comme gitleaks ou le *secret scanning* de GitHub.

## Pour aller plus loin

- Les *NetworkPolicies* sont le pare-feu entre Pods : par exemple, seule l'API peut joindre la base.
- cert-manager obtient automatiquement des certificats Let's Encrypt pour les Ingress.
- Cours suivant conseillé : « Kubernetes, application multi-services, stockage persistant et introduction à Helm ».
