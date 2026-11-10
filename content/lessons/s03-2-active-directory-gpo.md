---
slug: s03-2-active-directory-gpo
titre: Active Directory, domaine, utilisateurs, groupes et stratégies de groupe
piste: solo
semaine: 3
date: 2026-11-25
domaine: Systèmes
duree: 120
niveau: découverte
objectifs:
  - Expliquer ce qu'est un annuaire et le rôle d'Active Directory Domain Services
  - Distinguer domaine, forêt, unité d'organisation, contrôleur de domaine
  - Promouvoir un serveur en contrôleur de domaine et joindre un poste au domaine
  - Créer utilisateurs, groupes et unités d'organisation selon la méthode AGDLP
  - Créer et appliquer une stratégie de groupe (GPO), puis vérifier avec gpresult
prerequis:
  - Séance « Windows Server, installation, rôles DNS et DHCP »
referentiels:
  - Microsoft AZ-800, domaine « Deploy and manage AD DS in on-premises and cloud environments »
  - Microsoft SC-300 (Microsoft Entra ID), pour la suite dans le cloud
  - ANSSI, « Recommandations de sécurité relatives à Active Directory »
quiz:
  - question: "Qu'est-ce qu'un contrôleur de domaine ?"
    choix: ["Un pare-feu", "Un serveur qui héberge l'annuaire AD et authentifie les utilisateurs du domaine", "Un poste client", "Un routeur"]
    reponse: 1
    explication: "Il stocke la base AD (NTDS.dit), vérifie les mots de passe (Kerberos) et applique les stratégies."
  - question: "À quoi sert une unité d'organisation (OU) ?"
    choix: ["À donner des droits sur des fichiers", "À ranger les objets (utilisateurs, ordinateurs) et à leur appliquer des GPO ou déléguer leur administration", "À remplacer les groupes", "À créer un domaine"]
    reponse: 1
    explication: "On lie les GPO aux OU ; les groupes, eux, servent à donner des droits d'accès."
  - question: "Dans la méthode AGDLP, à qui donne-t-on directement les permissions sur un dossier partagé ?"
    choix: ["Aux comptes utilisateurs", "Aux groupes de domaine local", "Aux groupes globaux", "À l'administrateur seulement"]
    reponse: 1
    explication: "Accounts dans Global groups, eux-mêmes dans Domain Local groups, qui reçoivent les Permissions."
  - question: "Quelle commande force l'application immédiate des GPO sur un poste ?"
    choix: ["gpupdate /force", "ipconfig /renew", "gpresult /apply", "net use"]
    reponse: 0
    explication: "Sinon, les GPO se rafraîchissent environ toutes les 90 minutes ou à la connexion. gpresult /r affiche celles qui sont appliquées."
  - question: "Pourquoi AD dépend-il fortement du DNS ?"
    choix: ["Il ne dépend pas du DNS", "Les clients trouvent les contrôleurs de domaine grâce à des enregistrements SRV dans le DNS", "Pour afficher les sites web", "Pour attribuer les IP"]
    reponse: 1
    explication: "Un poste mal configuré en DNS (par exemple sur 8.8.8.8) ne trouve pas le domaine et ne peut pas le rejoindre."
---

## Le problème

Une entreprise compte 200 employés et 200 ordinateurs. Sans gestion centralisée, il faudrait créer chaque compte sur chaque machine, changer les mots de passe partout et configurer chaque poste à la main. **Active Directory** (AD) est l'**annuaire** centralisé de Microsoft : un seul compte par personne, valable sur tous les postes du domaine, et des règles appliquées automatiquement.

> Analogie : un établissement scolaire. L'annuaire est le registre des élèves et du personnel. Le contrôleur de domaine est le bureau de l'accueil qui vérifie les cartes. Les unités d'organisation sont les classes. Les stratégies de groupe sont le règlement intérieur, appliqué à toute une classe d'un coup.

## Le vocabulaire

| Terme | Définition | Exemple |
|---|---|---|
| **Domaine** | périmètre d'administration et d'authentification | `labo.local` |
| **Contrôleur de domaine** (DC) | serveur qui héberge l'annuaire et authentifie | SRV01 |
| **Forêt** | ensemble d'un ou plusieurs domaines | la forêt `labo.local` |
| **Unité d'organisation** (OU) | dossier qui range les objets, cible des GPO | `OU=Comptabilite` |
| **Objet** | utilisateur, groupe, ordinateur, imprimante | `awa.diop` |
| **GPO** | stratégie de groupe : un ensemble de réglages appliqués aux utilisateurs ou aux ordinateurs | « fond d'écran de l'entreprise » |

L'authentification repose sur **Kerberos** (des tickets) et l'interrogation de l'annuaire sur **LDAP** (port 389). Dans le cloud, l'équivalent est **Microsoft Entra ID** (anciennement Azure AD).

## Créer le domaine

Sur SRV01, dont l'IP fixe et le DNS ont été configurés hier :

```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "labo.local" -DomainNetbiosName "LABO" -InstallDns
# mot de passe du mode restauration (DSRM) demandé, puis redémarrage
```

Ce qui se passe :

- l'annuaire est créé (base `NTDS.dit`) ;
- le DNS reçoit une zone **intégrée à AD**, avec les enregistrements **SRV** (`_ldap._tcp.labo.local`) grâce auxquels les postes trouvent le DC ;
- le compte local Administrateur devient `LABO\Administrateur`.

## Joindre un poste au domaine

Sur CLI01, dont le **DNS doit pointer vers le DC** (`192.168.10.10`, ce que fournit l'option DHCP d'hier) :

```powershell
Add-Computer -DomainName labo.local -Credential LABO\Administrateur -Restart
```

On peut aussi passer par *Paramètres système avancés*, *Nom de l'ordinateur*, puis *Modifier* et *Domaine*. Au redémarrage, on se connecte avec un compte du domaine.

## Organiser : OU, utilisateurs, groupes

```powershell
New-ADOrganizationalUnit -Name "Entreprise" -Path "DC=labo,DC=local"
New-ADOrganizationalUnit -Name "Comptabilite" -Path "OU=Entreprise,DC=labo,DC=local"
New-ADOrganizationalUnit -Name "Informatique" -Path "OU=Entreprise,DC=labo,DC=local"

New-ADUser -Name "Awa Diop" -SamAccountName awa.diop -UserPrincipalName awa.diop@labo.local `
  -Path "OU=Comptabilite,OU=Entreprise,DC=labo,DC=local" `
  -AccountPassword (Read-Host -AsSecureString "Mot de passe") -Enabled $true -ChangePasswordAtLogon $true

New-ADGroup -Name "GG_Comptables" -GroupScope Global -Path "OU=Comptabilite,OU=Entreprise,DC=labo,DC=local"
Add-ADGroupMember -Identity GG_Comptables -Members awa.diop
```

La console graphique correspondante est *Utilisateurs et ordinateurs Active Directory* (`dsa.msc`).

### Les types de groupes et la méthode AGDLP

| Étendue | Contient | Usage |
|---|---|---|
| **Globale** | des utilisateurs du domaine | regrouper par **métier** : `GG_Comptables` |
| **Domaine local** | des groupes globaux | recevoir des **permissions** : `DL_Compta_Lecture` |
| **Universelle** | des groupes de toute la forêt | environnements multi-domaines |

**AGDLP** : les comptes (**A**ccounts) vont dans des groupes **G**lobaux, qui vont dans des groupes de **D**omaine **L**ocal, qui reçoivent les **P**ermissions.

Ainsi, quand Moussa rejoint la comptabilité, on l'ajoute à `GG_Comptables` et il obtient **tous** les accès d'un coup, sans toucher à aucun dossier. C'est la même idée que les groupes Linux de la semaine 1, à l'échelle de l'entreprise.

## Les stratégies de groupe

Une **GPO** contient des réglages en deux parties : la **configuration ordinateur**, appliquée au démarrage, et la **configuration utilisateur**, appliquée à la connexion. On la crée dans la *Gestion des stratégies de groupe* (`gpmc.msc`) et on la **lie** à une OU.

Des exemples classiques :

- **les mots de passe** : longueur minimale, complexité, verrouillage après 5 échecs (dans la *Default Domain Policy*) ;
- **le poste** : interdire le panneau de configuration, imposer un fond d'écran, verrouiller la session après 10 minutes ;
- **les lecteurs réseau** : connecter automatiquement `\\SRV01\Compta` en `P:` (préférences).

**L'ordre d'application** se retient par **LSDOU** : Local, puis Site, puis Domaine, puis OU. **La dernière appliquée l'emporte** en cas de conflit.

```powershell
New-GPO -Name "GPO_Compta_Verrouillage" | New-GPLink -Target "OU=Comptabilite,OU=Entreprise,DC=labo,DC=local"
# sur le poste client :
gpupdate /force
gpresult /r          # les GPO réellement appliquées à l'utilisateur et à l'ordinateur
```

## La sécurité, l'essentiel

- **Comptes séparés** : `awa.diop` pour le travail quotidien, `adm.awa.diop` pour l'administration.
- Le moins de membres possible dans *Admins du domaine*.
- **LAPS** génère un mot de passe administrateur local différent sur chaque poste.
- Les attaquants visent AD en priorité : l'ANSSI publie un guide de recommandations dédié.

## Démonstration

1. On promeut SRV01 et on joint CLI01 au domaine.
2. On crée l'arborescence d'OU, 4 utilisateurs et 2 groupes globaux.
3. On crée une GPO « fond d'écran et verrouillage », liée à l'OU Comptabilité.
4. Awa se connecte sur CLI01 : la GPO s'applique, ce que confirme `gpresult /r`. Moussa, de l'OU Informatique, n'est pas concerné.

## Exercice guidé

1. Crée les OU `Ventes` et `Direction` sous `Entreprise`.
2. Crée 3 utilisateurs dans `Ventes` et le groupe global `GG_Commerciaux` contenant ces 3 utilisateurs.
3. Crée une GPO qui interdit l'accès au panneau de configuration, liée à `Ventes`. Vérifie-la avec un commercial, puis avec un autre utilisateur.

## Exercice autonome

1. Crée 20 utilisateurs à partir d'un fichier CSV (`Prenom,Nom,Service`), chacun dans l'OU de son service. Indice : `Import-Csv` et une boucle. On le reverra vendredi en PowerShell.
2. Applique AGDLP à un partage `\\SRV01\Ventes` : groupe global `GG_Commerciaux`, groupe de domaine local `DL_Ventes_Modif` avec la permission Modifier sur le dossier.
3. Une GPO liée au domaine impose un fond d'écran bleu, une GPO liée à l'OU `Ventes` un fond d'écran vert. Lequel voit un commercial ? Et un directeur ? Justifie avec LSDOU.

## Correction

Exercice guidé :

```powershell
"Ventes","Direction" | ForEach-Object { New-ADOrganizationalUnit -Name $_ -Path "OU=Entreprise,DC=labo,DC=local" }
$ou = "OU=Ventes,OU=Entreprise,DC=labo,DC=local"
"fatou.sall","ibou.ndiaye","marie.faye" | ForEach-Object {
  New-ADUser -Name $_ -SamAccountName $_ -Path $ou -AccountPassword (ConvertTo-SecureString "Labo!2026x" -AsPlainText -Force) -Enabled $true
}
New-ADGroup GG_Commerciaux -GroupScope Global -Path $ou
Add-ADGroupMember GG_Commerciaux -Members fatou.sall,ibou.ndiaye,marie.faye
```

Le mot de passe écrit en clair n'est acceptable que dans un **laboratoire**. Dans un vrai domaine, on le génère et on le transmet de façon sécurisée.

Exercice autonome, question 2 :

```powershell
New-ADGroup DL_Ventes_Modif -GroupScope DomainLocal -Path "OU=Ventes,OU=Entreprise,DC=labo,DC=local"
Add-ADGroupMember DL_Ventes_Modif -Members GG_Commerciaux
New-Item C:\Partages\Ventes -ItemType Directory
New-SmbShare -Name Ventes -Path C:\Partages\Ventes -ChangeAccess "LABO\DL_Ventes_Modif"
$acl = Get-Acl C:\Partages\Ventes
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule("LABO\DL_Ventes_Modif","Modify","ContainerInherit,ObjectInherit","None","Allow")))
Set-Acl C:\Partages\Ventes $acl
```

Question 3 : un commercial voit le fond **vert**. La GPO de l'OU s'applique après celle du domaine, et la dernière l'emporte. Un directeur, dont l'OU n'a pas de GPO de fond d'écran, voit le fond **bleu** du domaine.

## Pour aller plus loin

- Le complément « Partages et droits NTFS » (26 novembre) approfondit les permissions de fichiers.
- Microsoft Entra Connect synchronise un AD local avec Entra ID : c'est l'identité hybride.
- Vendredi : PowerShell, pour automatiser toute cette administration.
