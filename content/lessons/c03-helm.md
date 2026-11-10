---
slug: c03-helm
titre: "Écrire son propre chart Helm"
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Conteneurs, orchestration et automatisation", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 15 }
ordre: 7
prerequis_cours: []
visibilite: public
objectifs:
  - Décrire la structure d'un chart (Chart.yaml, values.yaml, templates/)
  - Paramétrer des manifestes avec les gabarits Go (.Values, .Release, fonctions, conditions, boucles)
  - Gérer plusieurs environnements avec des fichiers de valeurs
  - Vérifier un chart (lint, template, dry-run) et gérer son cycle de vie (install, upgrade, rollback)
  - Déclarer des dépendances et publier un chart
prerequis:
  - Cours Kubernetes, dont « Kubernetes, application multi-services, stockage persistant et introduction à Helm »
referentiels:
  - CNCF CKAD, domaine « Application Deployment » (Helm)
  - Documentation Helm v3, « Chart Template Guide » et « Best Practices »
  - Semantic Versioning 2.0.0
quiz:
  - question: "Quel fichier contient les valeurs par défaut d'un chart ?"
    choix: ["Chart.yaml", "values.yaml", "templates/_helpers.tpl", "NOTES.txt"]
    reponse: 1
    explication: "Chart.yaml décrit le chart (nom, version) ; values.yaml contient les paramètres modifiables."
  - question: "Comment surcharger le nombre de répliques à l'installation ?"
    choix: ["En modifiant le template", "helm install api ./chart --set replicaCount=4 (ou -f valeurs-prod.yaml)", "Avec kubectl scale uniquement", "Impossible"]
    reponse: 1
    explication: "--set pour une valeur ponctuelle, -f pour un fichier de valeurs par environnement ; le dernier fourni l'emporte."
  - question: "Que fait helm template ./chart ?"
    choix: ["Il installe le chart", "Il affiche les manifestes générés sans rien envoyer au cluster", "Il supprime le chart", "Il crée un nouveau chart"]
    reponse: 1
    explication: "Indispensable pour vérifier le résultat des gabarits avant de déployer."
  - question: "Quelle différence entre version et appVersion dans Chart.yaml ?"
    choix: ["Aucune", "version est celle du chart (le paquet) ; appVersion celle de l'application déployée", "appVersion est obligatoire et version facultative", "version désigne Kubernetes"]
    reponse: 1
    explication: "On peut corriger le chart (version 1.2.1) sans changer l'application (appVersion 3.4.0)."
  - question: "Que permet helm rollback api 2 ?"
    choix: ["Supprimer la révision 2", "Revenir à l'état de la révision 2 de la release api", "Installer la version 2 de Helm", "Rien"]
    reponse: 1
    explication: "Helm conserve l'historique des révisions : helm history api pour les lister."
---

## Pourquoi écrire son chart ?

Dans le cours « Kubernetes, application multi-services, stockage persistant et introduction à Helm », tu as **utilisé** un chart existant (`bitnami/postgresql`). Pour **ta propre** application (l'API boutique, par exemple), tu as des manifestes (Deployment, Service, Ingress, ConfigMap) presque identiques d'un environnement à l'autre. Seuls changent les répliques, l'image, le domaine et les ressources.

**Helm** les transforme en **modèles paramétrés** : un seul chart, plusieurs fichiers de valeurs.

## La structure d'un chart

```bash
helm create boutique-api
```

```
boutique-api/
├── Chart.yaml            identité du chart
├── values.yaml           paramètres par défaut
├── templates/
│   ├── _helpers.tpl      fonctions réutilisables (noms, labels)
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── NOTES.txt         message affiché après l'installation
└── charts/               dépendances
```

```yaml
# Chart.yaml
apiVersion: v2
name: boutique-api
description: API de la boutique Saint Stack
version: 0.1.0            # version du CHART (SemVer) : on l'incrémente à chaque modification du chart
appVersion: "1.2.0"       # version de l'APPLICATION (l'image)
```

## Les gabarits

```yaml
# values.yaml
replicaCount: 2
image:
  repository: ghcr.io/saint-stack/boutique-api
  tag: ""                       # vide : on prend appVersion
service:
  port: 80
  targetPort: 3000
ingress:
  enabled: false
  host: boutique.local
env:
  NODE_ENV: production
  LOG_LEVEL: info
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 256Mi }
```

```yaml
# templates/deployment.yaml (extrait)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "boutique-api.fullname" . }}
  labels: {{- include "boutique-api.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels: {{- include "boutique-api.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels: {{- include "boutique-api.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - containerPort: {{ .Values.service.targetPort }}
          env:
            {{- range $cle, $valeur := .Values.env }}
            - name: {{ $cle }}
              value: {{ $valeur | quote }}
            {{- end }}
          resources: {{- toYaml .Values.resources | nindent 12 }}
```

| Élément | Rôle |
|---|---|
| `{{ .Values.x }}` | une valeur de `values.yaml` ou surchargée |
| `{{ .Release.Name }}`, `{{ .Chart.AppVersion }}` | des informations sur la release et le chart |
| `default`, `quote`, `upper`, `toYaml`, `nindent` | des **fonctions**, enchaînées avec `\|` comme en Bash |
| `{{- if .Values.ingress.enabled }} … {{- end }}` | une condition |
| `{{- range … }} … {{- end }}` | une boucle |
| `{{-` et `-}}` | suppriment les espaces et les sauts de ligne autour du gabarit |
| `include "nom" .` | appelle une fonction définie dans `_helpers.tpl` |

```yaml
# templates/ingress.yaml : n'existe que si on l'active
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "boutique-api.fullname" . }}
spec:
  rules:
    - host: {{ .Values.ingress.host | quote }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ include "boutique-api.fullname" . }}
                port: { number: {{ .Values.service.port }} }
{{- end }}
```

## Un fichier de valeurs par environnement

```yaml
# valeurs-prod.yaml : seules les différences
replicaCount: 4
image:
  tag: "1.2.0"
ingress:
  enabled: true
  host: api.boutique.sn
env:
  LOG_LEVEL: warn
resources:
  limits: { cpu: "1", memory: 512Mi }
```

**L'ordre de priorité**, du plus faible au plus fort : `values.yaml`, puis les fichiers `-f` dans l'ordre donné, puis `--set`.

## Vérifier, puis déployer

```bash
helm lint ./boutique-api                                       # erreurs de syntaxe et bonnes pratiques
helm template api ./boutique-api -f valeurs-prod.yaml          # voir les manifestes générés
helm install api ./boutique-api -n boutique --create-namespace -f valeurs-prod.yaml --dry-run
helm install api ./boutique-api -n boutique -f valeurs-prod.yaml
helm upgrade api ./boutique-api -n boutique -f valeurs-prod.yaml --set image.tag=1.3.0
helm history api -n boutique
helm rollback api 1 -n boutique
helm upgrade --install api ./boutique-api -n boutique -f valeurs-prod.yaml --atomic   # pour la CI : annule tout en cas d'échec
```

## Dépendances et publication

```yaml
# Chart.yaml : la base de données en dépendance, activable
dependencies:
  - name: postgresql
    version: "16.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

On télécharge les dépendances avec `helm dependency update`. **Publier** : `helm package ./boutique-api` produit `boutique-api-0.1.0.tgz`, qu'on pousse dans un registre OCI (`helm push boutique-api-0.1.0.tgz oci://ghcr.io/saint-stack/charts`).

## Démonstration

1. On fait `helm create`, on nettoie les gabarits inutiles et on adapte `values.yaml` à l'API boutique.
2. On compare `helm template` avec `values.yaml`, puis avec `valeurs-prod.yaml` : l'Ingress apparaît, il y a 4 répliques.
3. On installe sur kind, puis on fait un `upgrade` vers une nouvelle image et un `rollback`.
4. On ajoute un `checksum` de la ConfigMap dans les annotations du Pod, pour que tout changement de configuration redémarre automatiquement les Pods.

## Exercice guidé

1. Ajoute à `values.yaml` un paramètre `config.devise` (par défaut `XOF`) et crée `templates/configmap.yaml`, qui le contient.
2. Ajoute dans le Deployment un `envFrom` vers cette ConfigMap.
3. Affiche le résultat avec `helm template`, puis avec `--set config.devise=EUR`.

## Exercice autonome

1. Écris un chart complet pour l'application de ton choix (API et frontend Next.js) : Deployment, Service, Ingress optionnel, HPA optionnel, ConfigMap, et Secret par référence à un Secret existant.
2. Écris deux fichiers de valeurs, `valeurs-dev.yaml` et `valeurs-prod.yaml`.
3. Écris un `NOTES.txt` qui affiche l'URL d'accès.
4. Ajoute une étape `helm lint` et `helm template` au workflow GitHub Actions.
5. Simule une mauvaise mise à jour (une image inexistante) avec `--atomic --timeout 2m` et observe le retour arrière automatique.

## Correction

Exercice guidé :

```yaml
# templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "boutique-api.fullname" . }}-config
data:
  DEVISE: {{ .Values.config.devise | default "XOF" | quote }}
```

```yaml
# dans le conteneur du Deployment
          envFrom:
            - configMapRef:
                name: {{ include "boutique-api.fullname" . }}-config
```

`helm template api ./boutique-api --set config.devise=EUR | grep DEVISE` affiche `DEVISE: "EUR"`.

Exercice autonome, question 5 : avec `--atomic`, Helm attend que les Pods soient prêts. L'image n'existe pas (`ImagePullBackOff`), donc après 2 minutes Helm **annule automatiquement** la mise à jour et revient à la révision précédente. `helm history` affiche alors une révision « failed » suivie d'un retour arrière. Sans `--atomic`, la release resterait dans un état cassé.

## Pour aller plus loin

- **Helmfile** décrit plusieurs releases et environnements dans un seul fichier.
- **Argo CD** déploie des charts Helm selon la démarche GitOps.
- L'onglet *Charts* d'Artifact Hub (artifacthub.io) permet de s'inspirer de charts publics bien écrits.
