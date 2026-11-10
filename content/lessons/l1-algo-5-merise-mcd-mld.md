---
slug: l1-algo-5-merise-mcd-mld
titre: "Merise : modéliser les données (MCD et MLD)"
domaine: Bases de données
duree: 150
difficulte: bases
licence:
  - { niveau: L1, semestre: S2, ue: "Algorithmique et modélisation" }
ordre: 5
prerequis_cours: []
visibilite: public
objectifs:
  - Construire un dictionnaire des données à partir d'un énoncé
  - Identifier les entités, leurs attributs et leurs identifiants
  - Définir les associations et leurs cardinalités
  - Construire un modèle conceptuel des données (MCD)
  - Le transformer en modèle logique (MLD) puis en tables SQL
prerequis:
  - Les ensembles et le produit cartésien
referentiels:
  - Méthode Merise (H. Tardieu, A. Rochfeld, R. Colletti)
  - ACM/IEEE CS2023, domaine « Data Management » (modélisation conceptuelle)
  - P. P. Chen, modèle entité-association (1976)
quiz:
  - question: "Qu'est-ce qu'un identifiant dans un MCD ?"
    choix: ["Un attribut facultatif", "Un attribut (ou un groupe d'attributs) dont la valeur est unique pour chaque occurrence de l'entité", "Le nom de l'entité", "Une association"]
    reponse: 1
    explication: "Le matricule identifie un étudiant : deux étudiants ne peuvent pas avoir le même. Le nom ne convient pas, car il peut y avoir des homonymes."
  - question: "Que signifient les cardinalités 1,n du côté Client dans « Client (1,n) passe (1,1) Commande » ?"
    choix: ["Un client passe exactement une commande", "Un client passe au moins une commande, et peut en passer plusieurs", "Une commande a plusieurs clients", "Un client n'a pas de commande"]
    reponse: 1
    explication: "La cardinalité se lit du côté de l'entité : un client participe au minimum 1 fois et au maximum n fois à l'association."
  - question: "Comment traduit-on une association 1,1 — 0,n dans le MLD ?"
    choix: ["On crée une table pour l'association", "L'identifiant de l'entité du côté 0,n devient une clé étrangère dans la table du côté 1,1", "On supprime l'association", "On fusionne les deux tables"]
    reponse: 1
    explication: "Chaque commande appartient à un seul client : on ajoute id_client dans la table Commande."
  - question: "Comment traduit-on une association n,n (plusieurs à plusieurs) ?"
    choix: ["Par une clé étrangère dans une des deux tables", "Par une nouvelle table dont la clé primaire est composée des deux identifiants", "Elle est interdite", "Par un attribut multivalué"]
    reponse: 1
    explication: "Un étudiant suit plusieurs cours, un cours a plusieurs étudiants : on crée une table Inscription(#matricule, #code_cours)."
  - question: "Pourquoi ne pas stocker l'âge d'un étudiant, mais sa date de naissance ?"
    choix: ["Par habitude", "L'âge change chaque année et se calcule à partir de la date de naissance : stocker une donnée calculée crée des incohérences", "L'âge est une donnée sensible", "La date prend moins de place"]
    reponse: 1
    explication: "On évite les données calculables et les doublons : c'est le début de la normalisation."
---

## L'idée

Avant de créer une base de données, il faut **comprendre** les informations à gérer et leurs relations. Se précipiter sur les tables conduit à des doublons, des incohérences et des requêtes impossibles.

**Merise** est une méthode de conception française, née dans les années 1970 et très utilisée dans l'enseignement et les entreprises francophones, notamment en Afrique de l'Ouest. Elle sépare la réflexion en niveaux :

1. le **MCD** (modèle conceptuel des données) : *quoi* ? Les informations et leurs relations, indépendamment de toute technologie ;
2. le **MLD** (modèle logique des données) : les **tables**, les clés primaires et étrangères ;
3. le **MPD** (modèle physique) : le code SQL pour un logiciel précis (PostgreSQL, MySQL...).

Le MCD correspond au **modèle entité-association** de Peter Chen, utilisé dans le monde entier.

## Étape 1 : le dictionnaire des données

On part de l'énoncé, et on liste toutes les **données élémentaires** :

> *Une école veut gérer ses étudiants (matricule, nom, prénom, date de naissance, e-mail) et ses cours (code, intitulé, nombre de crédits). Un étudiant appartient à une seule classe (code, libellé, niveau) ; une classe contient plusieurs étudiants. Un étudiant s'inscrit à plusieurs cours, et chaque inscription donne lieu à une note.*

| Code | Signification | Type | Remarque |
|---|---|---|---|
| matricule | Matricule de l'étudiant | Texte (12) | identifiant |
| nom_etu | Nom | Texte (50) | |
| prenom_etu | Prénom | Texte (50) | |
| date_naiss | Date de naissance | Date | |
| email_etu | E-mail | Texte (100) | unique |
| code_cours | Code du cours | Texte (10) | identifiant |
| intitule | Intitulé du cours | Texte (100) | |
| credits | Nombre de crédits | Entier | |
| code_classe | Code de la classe | Texte (10) | identifiant |
| libelle_classe | Libellé | Texte (50) | |
| niveau | Niveau (L1, L2, L3) | Texte (2) | |
| note | Note obtenue | Décimal | dépend de l'étudiant **et** du cours |

On élimine les **données calculées** (l'âge, la moyenne) : elles se calculent à partir des autres.

## Étape 2 : les entités et leurs identifiants

Une **entité** représente un ensemble d'objets de même nature, décrits par les mêmes **attributs**. Chaque entité a un **identifiant** (souligné), dont la valeur est unique pour chaque **occurrence**.

```text
+----------------+     +----------------+     +----------------+
| ETUDIANT       |     | COURS          |     | CLASSE         |
|----------------|     |----------------|     |----------------|
| _matricule_    |     | _code_cours_   |     | _code_classe_  |
| nom_etu        |     | intitule       |     | libelle_classe |
| prenom_etu     |     | credits        |     | niveau         |
| date_naiss     |     +----------------+     +----------------+
| email_etu      |
+----------------+
```

On n'identifie jamais par le nom : deux étudiants peuvent s'appeler « Moussa Diallo ».

## Étape 3 : les associations et les cardinalités

Une **association** relie des entités. Elle porte un **verbe** : un étudiant *appartient* à une classe, un étudiant *s'inscrit* à un cours.

Les **cardinalités** indiquent, pour une occurrence d'une entité, le **minimum** et le **maximum** de fois où elle participe à l'association. On se pose la question **de chaque côté** :

- « Un étudiant appartient à combien de classes ? » Au minimum 1, au maximum 1 : **1,1**.
- « Une classe contient combien d'étudiants ? » Au minimum 0 (une classe qui vient d'être créée), au maximum plusieurs : **0,n**.

| Cardinalité | Signification |
|---|---|
| 0,1 | zéro ou une fois |
| 1,1 | exactement une fois |
| 0,n | zéro, une ou plusieurs fois |
| 1,n | au moins une fois |

Une association peut porter des **attributs** : la **note** ne dépend ni de l'étudiant seul, ni du cours seul, mais du **couple** (étudiant, cours). Elle appartient donc à l'association S'INSCRIRE.

```text
CLASSE (0,n) ---- APPARTENIR ---- (1,1) ETUDIANT (0,n) ---- S'INSCRIRE ---- (0,n) COURS
                                                            | note |
```

## Étape 4 : du MCD au MLD

Les règles de passage :

1. **Chaque entité devient une table.** L'identifiant devient la **clé primaire**.
2. **Association avec un côté 1,1 (ou 0,1)** : l'identifiant de l'autre entité devient une **clé étrangère** dans la table du côté 1,1. L'association disparaît.
3. **Association n,n** (des maximums n des deux côtés) : elle devient une **table**, dont la clé primaire est composée des identifiants des entités reliées, qui sont aussi des clés étrangères. Ses attributs deviennent des colonnes.

Résultat, avec la clé primaire soulignée (notée ici entre `_`) et les clés étrangères précédées de `#` :

```text
CLASSE (_code_classe_, libelle_classe, niveau)
ETUDIANT (_matricule_, nom_etu, prenom_etu, date_naiss, email_etu, #code_classe)
COURS (_code_cours_, intitule, credits)
INSCRIPTION (_#matricule_, _#code_cours_, note)
```

## Étape 5 : le code SQL

```sql
CREATE TABLE classe (
    code_classe    VARCHAR(10) PRIMARY KEY,
    libelle_classe VARCHAR(50) NOT NULL,
    niveau         CHAR(2) NOT NULL CHECK (niveau IN ('L1', 'L2', 'L3'))
);

CREATE TABLE etudiant (
    matricule   VARCHAR(12) PRIMARY KEY,
    nom_etu     VARCHAR(50) NOT NULL,
    prenom_etu  VARCHAR(50) NOT NULL,
    date_naiss  DATE,
    email_etu   VARCHAR(100) UNIQUE,
    code_classe VARCHAR(10) NOT NULL REFERENCES classe(code_classe)
);

CREATE TABLE cours (
    code_cours VARCHAR(10) PRIMARY KEY,
    intitule   VARCHAR(100) NOT NULL,
    credits    INTEGER NOT NULL CHECK (credits > 0)
);

CREATE TABLE inscription (
    matricule  VARCHAR(12) REFERENCES etudiant(matricule),
    code_cours VARCHAR(10) REFERENCES cours(code_cours),
    note       NUMERIC(4, 2) CHECK (note BETWEEN 0 AND 20),
    PRIMARY KEY (matricule, code_cours)
);
```

`NOT NULL` sur `code_classe` traduit le minimum **1** de la cardinalité 1,1 : un étudiant a obligatoirement une classe.

## Les erreurs fréquentes

- Mettre une **liste** dans un attribut (« cours : C, Java, SQL ») : chaque attribut contient une seule valeur. Une liste révèle une association n,n.
- Placer un attribut dans la mauvaise entité, comme la note dans ÉTUDIANT.
- Oublier les cardinalités minimales, qui deviennent les `NOT NULL`.
- Créer des entités qui ne sont que des attributs (une entité VILLE avec un seul attribut, sans autre information).

## Démonstration

On modélise ensemble un service de location de livres à la bibliothèque : ADHÉRENT, LIVRE, AUTEUR, avec les associations ÉCRIRE (un livre a un ou plusieurs auteurs) et EMPRUNTER (avec la date d'emprunt et la date de retour). On construit le MCD au tableau, puis le MLD, puis on crée les tables dans PostgreSQL, et l'on insère quelques lignes pour tester les contraintes.

Outils pour dessiner : **Looping** (gratuit, conçu pour Merise), ou draw.io.

## Exercice guidé

*Une agence de transport gère ses chauffeurs (numéro, nom, téléphone), ses bus (immatriculation, marque, nombre de places) et ses lignes (numéro, départ, arrivée). Un trajet est effectué par un chauffeur, avec un bus, sur une ligne, à une date et une heure.*

1. Établis le dictionnaire des données.
2. Identifie les entités et leurs identifiants.

## Exercice autonome

1. Termine le MCD de l'agence de transport : associations et cardinalités.
2. Écris le MLD.
3. Écris le code SQL de création des tables.

## Correction

Exercice guidé : entités **CHAUFFEUR** (_num_chauffeur_, nom, telephone), **BUS** (_immatriculation_, marque, nb_places), **LIGNE** (_num_ligne_, depart, arrivee). La date et l'heure appartiennent au trajet.

Exercice autonome : le plus simple est de faire du trajet une **entité** TRAJET (_id_trajet_, date_trajet, heure_depart), reliée à chacune des trois entités par une association 1,1 du côté TRAJET (un trajet a un seul chauffeur, un seul bus, une seule ligne) et 0,n de l'autre côté.

```text
CHAUFFEUR (_num_chauffeur_, nom, telephone)
BUS (_immatriculation_, marque, nb_places)
LIGNE (_num_ligne_, depart, arrivee)
TRAJET (_id_trajet_, date_trajet, heure_depart, #num_chauffeur, #immatriculation, #num_ligne)
```

```sql
CREATE TABLE trajet (
    id_trajet       SERIAL PRIMARY KEY,
    date_trajet     DATE NOT NULL,
    heure_depart    TIME NOT NULL,
    num_chauffeur   INTEGER NOT NULL REFERENCES chauffeur(num_chauffeur),
    immatriculation VARCHAR(15) NOT NULL REFERENCES bus(immatriculation),
    num_ligne       INTEGER NOT NULL REFERENCES ligne(num_ligne)
);
```

On pourrait ajouter une contrainte `UNIQUE (immatriculation, date_trajet, heure_depart)`, pour qu'un bus ne soit pas affecté à deux trajets en même temps.

## Pour aller plus loin

- La **normalisation** (1re, 2e et 3e formes normales) formalise les bonnes pratiques de ce cours : tu la verras dans le cours « PostgreSQL, modéliser et normaliser une base de données ».
- Le logiciel Looping génère directement le MLD et le SQL à partir du MCD.
- Cours suivant : « Introduction à UML ».
