---
slug: c01-windows-partages-ntfs
titre: "Partages réseau et droits NTFS sous Windows Server"
domaine: Systèmes
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Administration des systèmes", option: reseaux-systemes-cloud }
parcours:
  - { parcours: systemes, ordre: 12 }
ordre: 8
prerequis_cours: []
visibilite: public
objectifs:
  - Distinguer les permissions de partage (SMB) et les permissions NTFS
  - Calculer les droits effectifs d'un utilisateur selon ses groupes
  - Comprendre l'héritage, sa désactivation et la règle « refuser l'emporte »
  - Créer un partage sécurisé selon AGDLP, en interface graphique et en PowerShell
  - Activer l'énumération basée sur l'accès et les clichés instantanés
prerequis:
  - Séances solo « Active Directory » et « PowerShell »
referentiels:
  - Microsoft AZ-800, domaine « Manage storage and file services »
  - CompTIA Server+ (SK0-005), domaine 3 « Security and Disaster Recovery »
  - ANSSI, guide d'hygiène informatique (mesure sur le cloisonnement des droits)
quiz:
  - question: "Un utilisateur a Contrôle total en partage et Lecture en NTFS. Quel est son droit effectif à travers le réseau ?"
    choix: ["Contrôle total", "Lecture", "Aucun", "Modification"]
    reponse: 1
    explication: "On combine partage et NTFS en prenant le plus restrictif des deux."
  - question: "Awa est dans GG_Compta (Modifier) et GG_Stagiaires (Lecture), sur le même dossier NTFS. Son droit NTFS ?"
    choix: ["Lecture", "Modifier", "Aucun", "Contrôle total"]
    reponse: 1
    explication: "Au sein de NTFS, les autorisations des différents groupes s'additionnent : le plus permissif l'emporte, sauf refus explicite."
  - question: "Que se passe-t-il si un groupe de l'utilisateur a un « Refuser » explicite en écriture ?"
    choix: ["Il est ignoré", "Le refus l'emporte sur toutes les autorisations", "Il ne s'applique qu'au partage", "Il annule l'héritage"]
    reponse: 1
    explication: "Le refus explicite a priorité ; on l'utilise rarement, car il rend les droits difficiles à comprendre."
  - question: "Quelle bonne pratique pour les permissions de partage ?"
    choix: ["Donner les droits fins au niveau du partage", "Mettre « Utilisateurs authentifiés : Contrôle total » en partage et gérer finement en NTFS", "Ne pas utiliser NTFS", "Donner Tout le monde : Contrôle total en NTFS"]
    reponse: 1
    explication: "Un seul endroit pour les droits fins (NTFS), qui s'appliquent aussi en local et sont hérités."
  - question: "À quoi sert l'énumération basée sur l'accès (ABE) ?"
    choix: ["À chiffrer le partage", "À cacher aux utilisateurs les dossiers auxquels ils n'ont pas accès", "À accélérer le réseau", "À sauvegarder"]
    reponse: 1
    explication: "Chacun ne voit que ce qu'il peut ouvrir : moins de confusion, moins d'informations divulguées."
---

## L'idée

Le serveur de fichiers est l'un des usages les plus courants de Windows Server : `\\SRV01\Compta`, `\\SRV01\Direction`… Deux couches de droits protègent un dossier partagé, et c'est leur **combinaison** qui décide de ce que chacun peut faire.

```
Utilisateur ──réseau──▶ [ Permissions de PARTAGE (SMB) ] ──▶ [ Permissions NTFS ] ──▶ Dossier
                         le portail d'entrée                  la serrure de chaque pièce
```

## Les deux couches

| | Permissions de partage | Permissions NTFS |
|---|---|---|
| S'appliquent | **uniquement** à l'accès par le réseau | en local **et** par le réseau |
| Finesse | Lecture, Modifier, Contrôle total | Lecture, Écriture, Modification, Lecture et exécution, Contrôle total, et des droits spéciaux |
| Héritage | non | **oui**, du dossier parent vers ses enfants |

**Le calcul des droits effectifs** se fait en deux étapes :

1. **Dans chaque couche, on additionne** les droits de l'utilisateur et de tous ses groupes. Le plus permissif l'emporte, **sauf refus explicite**, qui l'emporte toujours.
2. **Entre les deux couches**, on prend **le plus restrictif**.

**L'exemple chiffré** : Awa est dans `GG_Compta` et dans `GG_Stagiaires`.

| Couche | GG_Compta | GG_Stagiaires | Résultat de la couche |
|---|---|---|---|
| Partage | Modifier | Lecture | **Modifier** (addition) |
| NTFS | Lecture | Lecture et exécution | **Lecture et exécution** (addition) |
| **Effectif par le réseau** | | | **Lecture et exécution** (le plus restrictif des deux couches) |

## La bonne pratique Microsoft

- Côté **partage** : on met `Utilisateurs authentifiés` en **Contrôle total**, ou au moins en Modifier.
- Côté **NTFS** : on gère **tous** les droits fins, selon la méthode **AGDLP** de la séance du 25 novembre.

Ainsi, il n'y a qu'**un seul endroit** pour raisonner sur les droits.

## L'héritage

Un sous-dossier **hérite** des droits de son parent. On peut **désactiver l'héritage** sur un dossier sensible (*Avancé*, puis *Désactiver l'héritage*), en convertissant ou en supprimant les droits hérités. On le fait **avec parcimonie** : chaque exception complique l'audit.

## La mise en place

```powershell
# 1. Le dossier et les groupes (méthode AGDLP)
New-Item -Path D:\Partages\Compta -ItemType Directory
New-ADGroup DL_Compta_Modif -GroupScope DomainLocal -Path "OU=Groupes,DC=labo,DC=local"
New-ADGroup DL_Compta_Lecture -GroupScope DomainLocal -Path "OU=Groupes,DC=labo,DC=local"
Add-ADGroupMember DL_Compta_Modif -Members GG_Comptables
Add-ADGroupMember DL_Compta_Lecture -Members GG_Direction

# 2. Les droits NTFS : retirer l'héritage, garder les administrateurs et SYSTEM
icacls D:\Partages\Compta /inheritance:r /grant "Administrateurs:(OI)(CI)F" "SYSTEM:(OI)(CI)F" `
  "LABO\DL_Compta_Modif:(OI)(CI)M" "LABO\DL_Compta_Lecture:(OI)(CI)RX"

# 3. Le partage, avec énumération basée sur l'accès
New-SmbShare -Name Compta -Path D:\Partages\Compta -FullAccess "LABO\Utilisateurs authentifiés" -FolderEnumerationMode AccessBased
```

Dans `icacls`, `(OI)(CI)` signifie que le droit est hérité par les **fichiers** (*Object Inherit*) et les **sous-dossiers** (*Container Inherit*). `F` correspond au contrôle total, `M` à la modification, `RX` à la lecture et exécution.

**Vérifier** : on utilise l'onglet *Sécurité*, puis *Avancé* et *Accès effectif*, qui calcule les droits d'un utilisateur précis. En ligne de commande : `icacls D:\Partages\Compta`.

## Les clichés instantanés et les quotas

- **Les clichés instantanés** (*Shadow Copies*, VSS) : depuis les propriétés du volume, on active des copies planifiées. Les utilisateurs restaurent eux-mêmes une ancienne version via l'onglet *Versions précédentes*. Ce n'est **pas** une sauvegarde (même disque), mais cela couvre la majorité des suppressions accidentelles.
- **Les quotas FSRM** (*File Server Resource Manager*) limitent l'espace par dossier et bloquent certains types de fichiers (par exemple `.exe` ou les vidéos).

## Démonstration

1. On crée les dossiers `Compta` et `Direction` et leurs groupes.
2. On applique les droits NTFS avec `icacls`, puis on crée les partages avec ABE.
3. Depuis CLI01, Awa (Compta) ouvre `\\SRV01\Compta` en écriture, et **ne voit pas** `Direction`.
4. On supprime un fichier, puis on le restaure par *Versions précédentes*.

## Exercice guidé

Calcule les droits effectifs à travers le réseau :

1. Partage : Lecture pour `Tout le monde`. NTFS : Modifier pour le groupe de l'utilisateur.
2. Partage : Contrôle total. NTFS : Modifier pour le groupe A et Refuser l'écriture pour le groupe B (l'utilisateur est dans A et B).
3. Le même utilisateur que dans le cas 1, mais connecté **en local** sur le serveur.

## Exercice autonome

Mets en place l'arborescence `D:\Partages\Entreprise` avec trois sous-dossiers :

- `Commun` : lecture et écriture pour tous les employés ;
- `RH` : modification pour les RH, invisible pour les autres ;
- `Direction` : modification pour la direction, lecture pour les RH.

Écris le tout dans un script PowerShell, en respectant AGDLP, avec ABE, et vérifie avec *Accès effectif* pour trois utilisateurs.

## Correction

Exercice guidé :

1. Le partage donne **Lecture** et NTFS donne **Modifier**. Le plus restrictif est la **Lecture**.
2. NTFS donne Modifier moins l'écriture (le refus l'emporte), soit une **lecture seule**. Le partage donne Contrôle total. L'effectif est donc **Lecture** (en pratique, Lecture et exécution).
3. En local, les permissions de partage **ne s'appliquent pas**. L'utilisateur a donc **Modifier**.

Exercice autonome, le cœur du script :

```powershell
$base = "D:\Partages\Entreprise"
"Commun","RH","Direction" | ForEach-Object { New-Item "$base\$_" -ItemType Directory -Force }
icacls "$base\Commun"    /inheritance:r /grant "Administrateurs:(OI)(CI)F" "LABO\DL_Commun_Modif:(OI)(CI)M"
icacls "$base\RH"        /inheritance:r /grant "Administrateurs:(OI)(CI)F" "LABO\DL_RH_Modif:(OI)(CI)M"
icacls "$base\Direction" /inheritance:r /grant "Administrateurs:(OI)(CI)F" "LABO\DL_Dir_Modif:(OI)(CI)M" "LABO\DL_Dir_Lecture:(OI)(CI)RX"
New-SmbShare -Name Entreprise -Path $base -FullAccess "LABO\Utilisateurs authentifiés" -FolderEnumerationMode AccessBased
```

Le groupe `GG_RH` est membre de `DL_RH_Modif` et de `DL_Dir_Lecture`, et `GG_Direction` est membre de `DL_Dir_Modif`. Le dossier racine `Entreprise` doit aussi donner la **lecture** (sans héritage vers les sous-dossiers) aux employés, pour qu'ils puissent l'ouvrir.

## Pour aller plus loin

- **DFS Namespaces** regroupe les partages de plusieurs serveurs sous un seul chemin, comme `\\labo.local\Partages`.
- Les **groupes protégés** et l'**audit des accès** aux fichiers, avec les événements 4663, permettent de savoir qui a lu ou supprimé un fichier sensible.
