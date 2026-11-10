---
slug: s08-2-bilan-plan-aws
titre: Bilan des huit semaines et plan de préparation AWS Cloud Practitioner
domaine: Cloud
duree: 150
difficulte: bases
licence: []
parcours: []
ordre: 1
prerequis_cours: []
visibilite: prive
objectifs:
  - Faire le bilan de ses compétences par domaine avec une grille objective
  - Constituer un portfolio à partir des projets réalisés
  - Comprendre le contenu et le format de l'examen AWS Certified Cloud Practitioner (CLF-C02)
  - Relier chaque notion déjà vue (Linux, réseaux, Docker, bases de données, supervision) à son service AWS
  - Établir un plan de préparation de 4 semaines avec des ressources fiables
prerequis:
  - Les cours des parcours DevOps, Systèmes et Data
referentiels:
  - AWS Certified Cloud Practitioner (CLF-C02), guide officiel de l'examen
  - AWS Well-Architected Framework (6 piliers)
  - Référentiel de compétences européen e-CF (EN 16234-1)
quiz:
  - question: "Dans le modèle de responsabilité partagée d'AWS, qui gère les correctifs du système d'exploitation d'une instance EC2 ?"
    choix: ["AWS", "Le client", "Personne", "Le fournisseur d'accès Internet"]
    reponse: 1
    explication: "AWS est responsable de la sécurité DU cloud (matériel, centres de données) ; le client de la sécurité DANS le cloud (OS, données, accès)."
  - question: "Quel service AWS correspond le mieux à la base PostgreSQL gérée que tu administres à la main ?"
    choix: ["S3", "Amazon RDS", "CloudWatch", "Route 53"]
    reponse: 1
    explication: "RDS gère sauvegardes, correctifs et haute disponibilité (Multi-AZ) pour PostgreSQL, MySQL, etc."
  - question: "Qu'est-ce qu'une zone de disponibilité (AZ) ?"
    choix: ["Un pays", "Un ou plusieurs centres de données isolés au sein d'une région AWS", "Un compte AWS", "Un type d'instance"]
    reponse: 1
    explication: "Répartir une application sur plusieurs AZ permet de survivre à la panne d'un centre de données."
  - question: "Quel service AWS sert à la supervision (métriques, journaux, alarmes), comme Prometheus et Grafana ?"
    choix: ["IAM", "CloudWatch", "EKS", "Lambda"]
    reponse: 1
    explication: "CloudWatch collecte métriques et journaux et déclenche des alarmes ; CloudTrail, lui, enregistre les appels d'API (audit)."
  - question: "Quel est le bon réflexe avec le compte root d'AWS ?"
    choix: ["L'utiliser au quotidien", "Activer la MFA, ne pas créer de clé d'accès et utiliser des utilisateurs ou rôles IAM pour le travail courant", "Partager son mot de passe avec l'équipe", "Le supprimer"]
    reponse: 1
    explication: "Moindre privilège, comme sudo sous Linux et les comptes d'administration séparés dans Active Directory."
---

## Faire le point

En huit semaines, tu as parcouru un programme dense. Avant d'aller plus loin, on fait un **bilan honnête**. L'objectif n'est pas de se féliciter, mais de savoir **où consolider** et quoi **montrer**.

## La grille d'auto-évaluation

Pour chaque domaine, note ton niveau selon la même échelle que la plateforme :

| Niveau | Critère observable |
|---|---|
| **Découverte** | je comprends les concepts et je refais l'exercice guidé avec le cours sous les yeux |
| **Bases** | je réalise seul l'exercice autonome, en cherchant dans la documentation |
| **Opérationnel** | je l'applique à un projet nouveau, et je l'explique à quelqu'un d'autre |

| Domaine | Cours | Mon niveau | Preuve (projet, dépôt) |
|---|---|---|---|
| Linux et Bash | droits, processus, SSH, scripts, cron | | |
| Réseaux | IP, DNS, HTTP, CIDR, pare-feu | | |
| Windows Server | DNS, DHCP, Active Directory, PowerShell | | |
| Git et CI/CD | GitHub Actions, GitLab CI, Jenkins | | |
| Conteneurs | Docker, Compose, Kubernetes, Helm | | |
| Supervision et sécurité | Prometheus, Grafana, OWASP | | |
| SQL et bases de données | jointures, fenêtres, modélisation, index | | |
| Data engineering | pandas, ETL, dbt, Airflow, Spark | | |
| BI | Power BI, DAX | | |

Le tableau de bord de la plateforme affiche ton avancement et tes moyennes aux quiz **par domaine**. Compare-les à ton ressenti : un écart important (« je me sens Opérationnel, mais j'ai 55 % aux quiz ») indique une notion à revoir.

**La méthode de consolidation** : pour chaque domaine en dessous de « Bases », refais l'exercice autonome **sans** la correction, puis explique-le **à voix haute** à quelqu'un d'autre. Enseigner reste le meilleur moyen d'apprendre.

## Le portfolio

Un recruteur regarde **ce que tu as construit**. Trois projets bien présentés valent mieux que vingt lignes de compétences.

1. **La chaîne data complète** : de l'ETL Python à PostgreSQL, puis dbt (avec ses tests), orchestré par Airflow, jusqu'à Power BI. Fournis un schéma d'architecture, un README et une capture du tableau de bord.
2. **L'application conteneurisée avec CI/CD** : une API et sa base avec Docker Compose, des tests (Jest, Supertest), GitHub Actions qui publie l'image, un déploiement Kubernetes et une supervision Grafana.
3. **Une application web complète** : un frontend Next.js, une API NestJS et une base PostgreSQL, avec authentification et tests.

**Un bon README** contient :

- le problème résolu, en une phrase ;
- un schéma d'architecture ;
- les technologies utilisées ;
- la façon de lancer le projet (une commande, si possible `docker compose up`) ;
- des captures d'écran ;
- ce que tu as appris et ce que tu améliorerais.

## Le cloud : pourquoi AWS ?

Tout ce que tu as installé à la main existe en **service géré** dans le cloud. AWS est le leader du marché, suivi d'Azure et de Google Cloud. **AWS Certified Cloud Practitioner** (CLF-C02) est la certification d'entrée. C'est la première étape de la phase cloud de ton parcours, avant la Terraform Associate et la CKAD.

### L'examen

- 65 questions (QCM et réponses multiples), dont 50 notées ;
- 90 minutes ;
- un score de **700 sur 1 000** pour réussir ;
- disponible en ligne ou en centre d'examen, en plusieurs langues dont le français ;
- environ 100 USD.

| Domaine | Poids |
|---|---|
| 1. Concepts du cloud | 24 % |
| 2. Sécurité et conformité | 30 % |
| 3. Technologie et services cloud | 34 % |
| 4. Facturation, tarification et support | 12 % |

Exemple chiffré : sur 50 questions notées, la sécurité en représente environ 50 × 0,30 = **15**, et la technologie environ **17**. Ce sont les deux priorités.

### Ce que tu sais déjà, version AWS

| Ce que tu as appris | Équivalent AWS |
|---|---|
| Serveur Linux, SSH | **EC2** (machines virtuelles), paires de clés |
| Réseaux, CIDR, pare-feu `ufw` | **VPC**, sous-réseaux publics et privés, **Security Groups**, NACL |
| DNS (semaines 1 et 3) | **Route 53** |
| Utilisateurs, groupes, moindre privilège (semaines 1 et 3) | **IAM** (utilisateurs, groupes, rôles, politiques), MFA |
| Sauvegardes et règle 3-2-1 (semaines 2 et 8) | **S3** (stockage d'objets, classes de stockage), AWS Backup |
| Docker et registre | **ECR**, **ECS** et **Fargate** |
| Kubernetes | **EKS** |
| Prometheus, Grafana, alertes | **CloudWatch** (métriques, journaux, alarmes), **CloudTrail** (audit) |
| PostgreSQL, sauvegardes, haute disponibilité | **RDS**, **Aurora**, Multi-AZ |
| Redis | **ElastiCache** |
| MongoDB, NoSQL | **DynamoDB** |
| Entrepôt, Spark, Kafka (semaines 7 et 8) | **Redshift**, **EMR**, **MSK** ; **Athena** pour interroger S3 en SQL |
| CI/CD | CodePipeline, CodeBuild |
| Script planifié | **Lambda** et EventBridge |

### Les notions spécifiques au cloud

- **L'infrastructure mondiale** : des **régions** (par exemple `eu-west-3` à Paris, ou `af-south-1` au Cap), des **zones de disponibilité** (des centres de données isolés au sein d'une région) et des **points de présence** (CloudFront, le CDN).
- **Le modèle de responsabilité partagée** : AWS sécurise le **cloud** (matériel, centres de données), et le client sécurise ce qu'il met **dans** le cloud (OS, données, IAM, chiffrement).
- **Les modèles de service** : IaaS (EC2), PaaS (Elastic Beanstalk, RDS), SaaS.
- **Les modèles de tarification** : à la demande, instances réservées et *Savings Plans* (jusqu'à environ 72 % de réduction contre un engagement), instances Spot (jusqu'à environ 90 % de réduction, mais interruptibles).
- **Le Well-Architected Framework** et ses 6 piliers : excellence opérationnelle, sécurité, fiabilité, efficacité des performances, optimisation des coûts, durabilité.
- **Les outils de coût** : Cost Explorer, AWS Budgets (des alertes), Pricing Calculator.

## Le plan de préparation sur 4 semaines

Il est prévu pour janvier, à environ 1 h par jour, en parallèle des cours du soir à UNIPRO.

| Semaine | Contenu | Pratique |
|---|---|---|
| 1 | Concepts du cloud, infrastructure mondiale, IAM, responsabilité partagée | créer un compte (Free Tier), activer la MFA sur le root, créer un utilisateur IAM administrateur, configurer une **alerte de budget à 1 USD** |
| 2 | Calcul (EC2, Lambda, ECS), stockage (S3, EBS, EFS), réseau (VPC, Route 53, CloudFront) | lancer une EC2, s'y connecter en SSH, héberger un site statique sur S3 |
| 3 | Bases de données, supervision, sécurité (KMS, WAF, Shield, GuardDuty), conformité | créer une base RDS PostgreSQL, puis la **supprimer** ; créer une alarme CloudWatch |
| 4 | Facturation, support, Well-Architected, révision | 2 examens blancs complets, analyse des erreurs, puis l'examen |

**Les ressources fiables** :

- **AWS Skill Builder**, cours « AWS Cloud Practitioner Essentials » (gratuit, officiel) ;
- le **guide officiel de l'examen** CLF-C02 et les **questions d'exemple** officielles ;
- des examens blancs reconnus ; vise plus de 80 % avant de t'inscrire.

> **Attention à la facture.** Le Free Tier a des limites. Une ressource oubliée (une instance, une passerelle NAT, une adresse IP élastique non attachée) peut coûter plusieurs dizaines de dollars. Avant chaque séance pratique, vérifie ton **alerte de budget**. Après chaque séance, **supprime** ce que tu as créé.

## Démonstration

1. On parcourt ensemble la grille d'auto-évaluation, avec les statistiques de ton espace sur la plateforme.
2. On crée un compte AWS en suivant les règles de sécurité : MFA sur le root, utilisateur IAM, alerte de budget.
3. On lance une EC2 Ubuntu, on s'y connecte en SSH avec la clé créée dans le cours « Linux, gestion des paquets, SSH et clés », on y installe Docker, on y lance l'API boutique, puis on supprime tout.

## Exercice guidé

Associe chaque besoin au bon service AWS :

1. stocker les sauvegardes `pg_dump` pour pas cher, pendant un an ;
2. exécuter un script Python chaque nuit sans gérer de serveur ;
3. surveiller l'utilisation processeur d'une instance et recevoir une alerte ;
4. savoir qui a supprimé une base de données hier ;
5. une base PostgreSQL avec bascule automatique en cas de panne.

## Exercice autonome

1. Remplis la grille d'auto-évaluation avec une **preuve** pour chaque domaine, et choisis 3 domaines à consolider en janvier.
2. Rédige le README de ton projet data principal en suivant le modèle ci-dessus.
3. Planifie dans ton calendrier les 4 semaines de préparation AWS, avec la date visée pour l'examen.
4. Crée ton compte AWS en appliquant les quatre règles de sécurité, et envoie une capture de l'alerte de budget.
5. Rédige, en 10 lignes, l'architecture AWS d'une plateforme de cours en ligne : où iraient le frontend, l'API, la base, les sauvegardes et la supervision ?

## Correction

Exercice guidé :

1. **S3**, avec une classe d'archivage (S3 Glacier) et une règle de cycle de vie qui supprime les fichiers après un an.
2. **Lambda**, déclenché par **EventBridge** (une planification au format cron).
3. **CloudWatch**, avec une alarme qui envoie une notification par **SNS** (e-mail).
4. **CloudTrail**, qui journalise les appels d'API.
5. **RDS PostgreSQL Multi-AZ**, ou Aurora.

Exercice autonome, question 5, une proposition :

- **le frontend Next.js** : AWS Amplify, ou un conteneur sur **ECS Fargate** derrière un **Application Load Balancer**, avec un certificat **ACM** et le DNS sur **Route 53** ;
- **l'API NestJS** : ECS Fargate, avec l'image dans **ECR**, publiée par GitHub Actions avec OIDC ;
- **la base** : **RDS PostgreSQL**, dans un sous-réseau **privé**, avec sauvegardes automatiques ;
- **les secrets** (JWT, base) : **Secrets Manager** ;
- **les journaux et alarmes** : **CloudWatch** ;
- **le coût** : une petite instance RDS et deux petites tâches Fargate, à estimer avec le **Pricing Calculator**.

## Pour aller plus loin

- Après la Cloud Practitioner : l'**AWS Solutions Architect Associate** (SAA-C03) est la certification la plus demandée sur le marché.
- **Terraform** (la Terraform Associate, dans ton parcours) décrit toute cette infrastructure sous forme de code, comme Docker Compose et Kubernetes l'ont fait pour les conteneurs.
- Bravo pour ces huit semaines. La suite : consolider, publier ton portfolio, puis passer la première certification.
