---
slug: g03-4-jenkins
titre: Jenkins, pipelines déclaratifs et intégration avec GitHub
domaine: DevOps
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S6, ue: "Intégration et déploiement continus", option: reseaux-systemes-cloud }
parcours:
  - { parcours: devops, ordre: 11 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Installer Jenkins avec Docker et le configurer au premier lancement
  - Écrire un Jenkinsfile déclaratif (agent, stages, steps, post)
  - Créer un job Pipeline relié à un dépôt GitHub par webhook
  - Gérer des identifiants dans le magasin Credentials
  - Situer Jenkins par rapport à GitHub Actions et GitLab CI
prerequis:
  - Séances GitHub Actions et GitLab CI
  - Docker installé
referentiels:
  - Certified Jenkins Engineer (CJE, CloudBees), domaines « Pipelines » et « CI/CD »
  - Documentation Jenkins, « Pipeline Syntax »
  - Fiche du projet « Configuration d'un job Pipeline Jenkins relié à GitHub »
quiz:
  - question: "Où se trouve la définition d'un pipeline « Pipeline script from SCM » ?"
    choix: ["Dans l'interface Jenkins uniquement", "Dans un fichier Jenkinsfile versionné dans le dépôt", "Dans le README", "Dans GitHub Actions"]
    reponse: 1
    explication: "Le pipeline est versionné avec le code (pipeline as code), relu et historisé comme le reste."
  - question: "À quoi sert le bloc post { failure { ... } } ?"
    choix: ["À lancer un stage après le build", "À exécuter des actions selon le résultat final (notification d'échec, nettoyage)", "À publier sur GitHub", "À relancer automatiquement"]
    reponse: 1
    explication: "post propose always, success, failure, unstable, cleanup… pour réagir au résultat."
  - question: "Vers quelle URL pointe le webhook GitHub pour déclencher Jenkins ?"
    choix: ["http://<jenkins>/build", "http://<jenkins>/github-webhook/", "https://github.com/jenkins", "http://<jenkins>/api/json"]
    reponse: 1
    explication: "Avec la case « GitHub hook trigger for GITScm polling » cochée dans le job. Jenkins doit être joignable depuis Internet."
  - question: "Comment utiliser un mot de passe stocké dans Jenkins sans l'écrire dans le Jenkinsfile ?"
    choix: ["environment { PASS = 'secret' }", "withCredentials ou credentials('id') dans environment", "En l'écrivant dans un commentaire", "Avec echo"]
    reponse: 1
    explication: "Le secret reste dans le magasin chiffré de Jenkins ; il est injecté au moment de l'exécution et masqué dans les journaux."
  - question: "Quel est l'inconvénient principal de Jenkins par rapport à GitHub Actions ?"
    choix: ["Il n'est pas gratuit", "Il faut l'héberger, le mettre à jour et maintenir ses plugins soi-même", "Il ne gère pas Docker", "Il ne supporte pas Git"]
    reponse: 1
    explication: "Jenkins est libre et très flexible, mais son exploitation (serveur, sécurité, plugins) demande du travail."
---

## Jenkins en contexte

Jenkins est le serveur d'intégration continue **historique** : il est libre, écrit en Java et a été créé en 2011. Il reste très répandu dans les banques, les opérateurs télécoms et les grandes entreprises, avec plus de 1 800 **plugins**. On l'héberge **soi-même**, ce qui apporte un contrôle total, mais aussi la maintenance qui va avec.

| | Jenkins | GitHub Actions | GitLab CI |
|---|---|---|---|
| Hébergement | par toi | GitHub | GitLab, ou ton serveur |
| Configuration | `Jenkinsfile` (syntaxe Groovy) | YAML | YAML |
| Extensions | plugins | actions | modèles (`include`) |
| Maintenance | importante | nulle | faible à moyenne |

Le vocabulaire : le **contrôleur** est le serveur Jenkins ; les **agents** sont les machines qui exécutent les builds ; un **job** (ou projet) décrit le travail ; un **build** est une exécution numérotée de ce job.

## Installer Jenkins avec Docker

```bash
docker network create jenkins
docker volume create jenkins_home
docker run -d --name jenkins --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts-jdk21
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Au premier lancement, sur `http://localhost:8080` :

1. On colle le mot de passe initial.
2. On choisit *Install suggested plugins* (Git, Pipeline, Credentials…).
3. On crée le compte administrateur.

Le volume `jenkins_home` conserve toute la configuration : c'est la leçon de la semaine 2 qui s'applique.

## Le Jenkinsfile déclaratif

```groovy
pipeline {
    agent any                                   // n'importe quel agent disponible

    environment {
        NODE_ENV = 'test'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))   // garder les 20 derniers builds
    }

    stages {
        stage('Récupération') {
            steps {
                checkout scm
            }
        }
        stage('Installation') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Tests') {
            parallel {                          // deux tâches en même temps
                stage('Lint')      { steps { sh 'npm run lint' } }
                stage('Unitaires') { steps { sh 'npm test' } }
            }
        }
        stage('Image Docker') {
            when { branch 'main' }              // seulement sur main
            steps {
                sh 'docker build -t boutique-api:${BUILD_NUMBER} .'
            }
        }
    }

    post {
        success { echo "Build ${env.BUILD_NUMBER} réussi" }
        failure { echo 'Échec : consulter le journal (Console Output)' }
        always  { cleanWs() }                   // nettoyer l'espace de travail
    }
}
```

| Bloc | Rôle |
|---|---|
| `agent` | où exécuter : `any`, un label, ou `docker { image 'node:22' }` |
| `environment` | variables d'environnement |
| `stages` puis `stage` | les étapes visibles dans l'interface |
| `steps` | les commandes : `sh`, `echo`, `checkout`, `junit` |
| `when` | condition (branche, variable…) |
| `post` | actions selon le résultat |

**Un agent Docker** : chaque build tourne dans un conteneur, exactement comme `image:` sur GitLab.

```groovy
pipeline {
    agent { docker { image 'node:22-alpine' } }
    stages { stage('Tests') { steps { sh 'npm ci && npm test' } } }
}
```

Cela nécessite le plugin *Docker Pipeline* et un agent qui a accès à Docker.

## Les identifiants

Ils se gèrent dans *Manage Jenkins*, puis *Credentials* : on ajoute par exemple un identifiant de type *Username with password*, d'identifiant `dockerhub`.

```groovy
stage('Publier') {
    when { branch 'main' }
    environment {
        DOCKERHUB = credentials('dockerhub')   // crée DOCKERHUB_USR et DOCKERHUB_PSW
    }
    steps {
        sh 'echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin'
        sh 'docker tag boutique-api:${BUILD_NUMBER} $DOCKERHUB_USR/boutique-api:${BUILD_NUMBER}'
        sh 'docker push $DOCKERHUB_USR/boutique-api:${BUILD_NUMBER}'
    }
}
```

Les commandes `sh` sont entre **guillemets simples** : c'est le shell qui lit la variable, pas Groovy. Le secret n'est donc pas interpolé dans le script Groovy.

## Relier Jenkins à GitHub

Ce sont les étapes de ta fiche de configuration :

1. *New Item*, puis *Pipeline*.
2. **General** : cocher *GitHub project* et indiquer l'URL du dépôt.
3. **Triggers** : cocher *GitHub hook trigger for GITScm polling*.
4. **Pipeline** : choisir *Definition*, puis *Pipeline script from SCM*, avec SCM Git, l'URL du dépôt, la branche `*/main` et le chemin `Jenkinsfile`.
5. Côté GitHub, dans *Settings*, puis *Webhooks* : renseigner `http://<adresse-jenkins>/github-webhook/`, avec le type de contenu `application/json`.

Jenkins doit être **joignable depuis Internet** pour recevoir le webhook. En local, on utilise un tunnel (ngrok, Cloudflare Tunnel), ou à défaut l'interrogation périodique *Poll SCM* (`H/5 * * * *`, la syntaxe cron de la semaine 2).

Pour construire **toutes les branches** et les pull requests, on crée plutôt un job **Multibranch Pipeline**.

## Démonstration

1. On lance Jenkins dans Docker et on installe les plugins.
2. On ajoute le `Jenkinsfile` à l'API boutique, avec un agent `docker` `node:22-alpine`.
3. On crée le job Pipeline depuis SCM, puis *Build Now*.
4. On regarde la *Stage View* et la *Console Output*.
5. On casse un test : le build devient rouge et le bloc `post failure` s'exécute.

## Exercice guidé

1. Crée un job Pipeline avec un script **saisi directement** (*Pipeline script*) qui contient trois stages : `Bonjour` (affiche la date), `Système` (`uname -a`) et `Fin`.
2. Ajoute un bloc `post` qui affiche « Toujours exécuté ».
3. Lance-le trois fois, puis observe l'historique et les numéros de build.

## Exercice autonome

1. Écris le `Jenkinsfile` de ton API : installation, lint et tests en parallèle, puis la construction de l'image seulement sur `main`.
2. Ajoute l'identifiant `dockerhub` et un stage `Publier`.
3. Ajoute `junit 'rapports/*.xml'` dans `post always` pour afficher les résultats des tests. Configure ton outil de test pour produire du JUnit XML.
4. Compare sur ta feuille : nombre de lignes, temps de mise en place et maintenance, entre ce Jenkinsfile et le workflow GitHub Actions de mardi.

## Correction

Exercice guidé :

```groovy
pipeline {
    agent any
    stages {
        stage('Bonjour') { steps { sh 'date' } }
        stage('Système') { steps { sh 'uname -a' } }
        stage('Fin')     { steps { echo 'Terminé' } }
    }
    post { always { echo 'Toujours exécuté' } }
}
```

Exercice autonome, question 3 : avec le lanceur natif de Node, `node --test --test-reporter=junit --test-reporter-destination=rapports/tests.xml` produit le fichier. Avec Jest, on utilise le paquet `jest-junit`. Jenkins affiche alors la tendance des tests au fil des builds.

Question 4, à titre indicatif : le Jenkinsfile et le workflow GitHub ont une longueur comparable (40 à 60 lignes). En revanche, Jenkins demande d'installer le serveur, les plugins, les identifiants et une exposition sur Internet, puis des mises à jour régulières, en particulier de sécurité. GitHub Actions ne demande aucune infrastructure, mais tes builds tournent chez GitHub et dans la limite de leurs quotas.

## Pour aller plus loin

- *Blue Ocean* et le plugin *Pipeline Graph View* offrent une visualisation moderne des pipelines.
- Les *Shared Libraries* mettent en commun des étapes Groovy entre plusieurs projets.
- Le bilan de la semaine : trois outils, mais les **mêmes concepts** (déclencheur, étapes, agent, secrets, artefacts, conditions). Tu pourras t'adapter à n'importe quelle entreprise.
