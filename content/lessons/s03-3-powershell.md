---
slug: s03-3-powershell
titre: PowerShell, objets, pipeline et automatisation de l'administration
piste: solo
semaine: 3
date: 2026-11-27
domaine: Systèmes
duree: 120
niveau: bases
objectifs:
  - Expliquer la différence fondamentale entre PowerShell (objets) et Bash (texte)
  - Trouver une commande et son aide avec Get-Command, Get-Help et Get-Member
  - Filtrer, trier et sélectionner avec le pipeline (Where-Object, Sort-Object, Select-Object)
  - Écrire un script avec variables, conditions, boucles, fonctions et gestion d'erreurs
  - Automatiser une tâche AD à partir d'un CSV et exporter un rapport
prerequis:
  - Séances « Bash » et « Active Directory »
referentiels:
  - Microsoft AZ-800, compétences PowerShell transverses
  - Microsoft Learn, parcours « PowerShell for beginners »
  - PowerShell Practice and Style Guide (communauté PoshCode)
quiz:
  - question: "Quelle est la grande différence entre le pipeline PowerShell et celui de Bash ?"
    choix: ["Aucune", "PowerShell transmet des objets avec des propriétés ; Bash transmet du texte", "Bash est plus rapide", "PowerShell n'a pas de pipeline"]
    reponse: 1
    explication: "Pas besoin de découper du texte avec cut ou awk : on accède directement à $_.Name, $_.Length…"
  - question: "Comment voir les propriétés et méthodes des objets renvoyés par Get-Process ?"
    choix: ["Get-Process | Get-Member", "Get-Help Process", "Get-Process -all", "man Get-Process"]
    reponse: 0
    explication: "Get-Member (alias gm) révèle le type de l'objet et tout ce qu'il contient."
  - question: "Quel est le format des noms de commandes PowerShell ?"
    choix: ["nom-verbe", "Verbe-Nom, comme Get-Service", "verbe_nom", "Libre"]
    reponse: 1
    explication: "Verbes approuvés (Get, Set, New, Remove, Start, Stop…) et nom au singulier : on devine facilement les commandes."
  - question: "Que fait Where-Object { $_.Status -eq 'Running' } ?"
    choix: ["Il démarre les services", "Il ne garde que les objets dont la propriété Status vaut Running", "Il trie par statut", "Il affiche une erreur"]
    reponse: 1
    explication: "$_ désigne l'objet courant ; -eq est l'opérateur d'égalité (pas ==)."
  - question: "Pourquoi les scripts .ps1 refusent-ils parfois de s'exécuter ?"
    choix: ["PowerShell est cassé", "À cause de la stratégie d'exécution (ExecutionPolicy)", "Il faut les compiler", "Il faut les renommer en .bat"]
    reponse: 1
    explication: "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser autorise tes scripts locaux et exige une signature pour ceux venus d'Internet."
---

## L'idée

PowerShell est le shell et le langage de script de Microsoft. Il est libre et multiplateforme depuis la version 7 : il tourne aussi sur Linux et macOS. Tout ce que tu as fait avec la souris cette semaine (DNS, DHCP, AD) peut s'automatiser en PowerShell, sur **1 serveur ou sur 100**.

**La grande différence avec Bash** : Bash fait passer du **texte** d'une commande à l'autre, PowerShell fait passer des **objets** avec des propriétés.

```bash
# Bash : les 3 processus qui consomment le plus de mémoire, en découpant du texte
ps aux --sort=-%mem | head -4 | awk '{print $11, $6}'
```

```powershell
# PowerShell : on manipule des propriétés nommées
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 3 Name, WorkingSet
```

## Les commandes : Verbe-Nom

| Verbe | Rôle | Exemples |
|---|---|---|
| `Get` | lire | `Get-Service`, `Get-ADUser`, `Get-ChildItem` |
| `Set` | modifier | `Set-Location`, `Set-ADUser` |
| `New` / `Remove` | créer / supprimer | `New-Item`, `Remove-Item` |
| `Start` / `Stop` | démarrer / arrêter | `Start-Service`, `Stop-Process` |

**Les trois commandes pour se débrouiller seul :**

```powershell
Get-Command *service*            # trouver une commande
Get-Help Get-Service -Examples   # l'aide, avec des exemples (Update-Help la première fois)
Get-Service | Get-Member         # le type d'objet, ses propriétés et ses méthodes
```

Les alias familiers existent : `ls` (`Get-ChildItem`), `cd`, `cat` (`Get-Content`), `ps`, `rm`. Dans un script, on écrit toujours les noms complets.

## Le pipeline objet

```powershell
Get-Service |
  Where-Object { $_.Status -eq 'Running' -and $_.StartType -eq 'Automatic' } |
  Sort-Object DisplayName |
  Select-Object Name, DisplayName, Status
```

| Commande | Rôle | Équivalent Bash |
|---|---|---|
| `Where-Object` | filtrer | `grep` |
| `Sort-Object` | trier | `sort` |
| `Select-Object` | choisir des propriétés ou les N premiers | `cut`, `head` |
| `Measure-Object` | compter, additionner, faire la moyenne | `wc` |
| `Group-Object` | regrouper | `sort` puis `uniq -c` |
| `ForEach-Object` | agir sur chaque objet | `while read` |

Les **opérateurs** : `-eq`, `-ne`, `-gt`, `-lt`, `-like` (avec `*`), `-match` (expression régulière), `-and`, `-or`, `-not`.

**Exemple chiffré** : la taille totale des fichiers `.log` d'un dossier.

```powershell
Get-ChildItem C:\Logs -Filter *.log | Measure-Object Length -Sum
# Count : 12   Sum : 5242880  →  5 242 880 / 1 048 576 = 5 Mo
```

## Exporter les résultats

```powershell
Get-Process | Select-Object Name, CPU | Export-Csv rapport.csv -NoTypeInformation -Encoding UTF8
Get-Service | ConvertTo-Json | Out-File services.json
Get-ADUser -Filter * | ConvertTo-Html -Property Name, Enabled | Out-File utilisateurs.html
Import-Csv eleves.csv | Format-Table      # lire un CSV : chaque ligne devient un objet
```

## Le langage

```powershell
$nom = "Awa"                          # variable
$nombres = 1..5                       # tableau
$infos = @{ Ville = "Dakar"; Pays = "Sénégal" }   # dictionnaire
"Bonjour $nom, $($nombres.Count) éléments"        # interpolation ; $( ) pour une expression

if ($nombres.Count -gt 3) { "Grand" } elseif ($nombres.Count -eq 3) { "Moyen" } else { "Petit" }

foreach ($n in $nombres) { "Carré de $n : $($n * $n)" }

function Test-Port {
    param(
        [Parameter(Mandatory)] [string] $Hote,
        [int] $Port = 443
    )
    $ok = Test-NetConnection -ComputerName $Hote -Port $Port -InformationLevel Quiet
    [pscustomobject]@{ Hote = $Hote; Port = $Port; Ouvert = $ok }   # renvoyer un OBJET
}
Test-Port -Hote google.com
```

**La gestion des erreurs :**

```powershell
try {
    Get-Item C:\inexistant -ErrorAction Stop       # Stop transforme l'erreur en exception
} catch {
    Write-Warning "Erreur : $($_.Exception.Message)"
} finally {
    Write-Host "Fin"
}
```

**Exécuter des scripts** : `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`, puis `.\mon-script.ps1`.

**L'administration à distance** : `Invoke-Command -ComputerName SRV01, SRV02 -ScriptBlock { Get-Service DNS }`. C'est l'équivalent de SSH, et PowerShell 7 sait d'ailleurs utiliser SSH.

## Démonstration : un rapport d'audit AD

```powershell
Import-Module ActiveDirectory
$limite = (Get-Date).AddDays(-30)

$inactifs = Get-ADUser -Filter { Enabled -eq $true } -Properties LastLogonDate, Department |
  Where-Object { -not $_.LastLogonDate -or $_.LastLogonDate -lt $limite } |
  Select-Object Name, SamAccountName, Department, LastLogonDate

$inactifs | Export-Csv "C:\Rapports\inactifs_$(Get-Date -Format yyyy-MM-dd).csv" -NoTypeInformation -Encoding UTF8
$inactifs | Group-Object Department | Select-Object Name, Count
"$($inactifs.Count) compte(s) inactif(s) depuis plus de 30 jours"
```

C'est une tâche réelle d'administrateur : les comptes inactifs sont une cible de choix pour les attaquants.

## Exercice guidé

1. Liste les 5 plus gros fichiers de ton dossier `Documents`, de façon récursive, avec leur nom et leur taille en Mo, arrondie à 2 décimales. Indice : une propriété calculée `@{N='Mo';E={[math]::Round($_.Length/1MB,2)}}`.
2. Compte les services par statut (`Running`, `Stopped`) avec `Group-Object`.
3. Écris la fonction `Get-Salutation`, qui prend un paramètre obligatoire `-Prenom` et renvoie un objet contenant le prénom et l'heure.

## Exercice autonome

Écris `Import-Utilisateurs.ps1`, qui crée des comptes AD à partir de ce CSV :

```
Prenom,Nom,Service
Awa,Diop,Comptabilite
Moussa,Fall,Informatique
Fatou,Sall,Ventes
```

1. L'identifiant est `prenom.nom`, en minuscules et sans accents.
2. Chaque compte est créé dans l'OU de son service, et ajouté au groupe `GG_<Service>`, que le script crée s'il n'existe pas.
3. Un mot de passe aléatoire de 14 caractères, avec changement obligatoire à la première connexion.
4. Le script ne plante pas si un utilisateur existe déjà : il l'indique et continue.
5. À la fin, un CSV de résultat avec l'identifiant, le statut (`créé`, `existant` ou `erreur`) et le mot de passe initial (pour un laboratoire uniquement).

## Correction

Exercice guidé :

```powershell
Get-ChildItem $HOME\Documents -Recurse -File | Sort-Object Length -Descending |
  Select-Object -First 5 Name, @{N='Mo';E={[math]::Round($_.Length/1MB,2)}}
Get-Service | Group-Object Status | Select-Object Name, Count
function Get-Salutation { param([Parameter(Mandatory)][string]$Prenom)
  [pscustomobject]@{ Prenom = $Prenom; Heure = Get-Date -Format HH:mm } }
```

Exercice autonome :

```powershell
#Requires -Modules ActiveDirectory
param([string]$Fichier = ".\utilisateurs.csv")
$base = "OU=Entreprise,DC=labo,DC=local"

function Remove-Accents([string]$s) {
  -join ($s.Normalize('FormD').ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark' })
}
function New-MotDePasse { -join ((33..126) | Get-Random -Count 14 | ForEach-Object { [char]$_ }) }

$resultats = foreach ($l in Import-Csv $Fichier) {
  $id = (Remove-Accents "$($l.Prenom).$($l.Nom)").ToLower()
  $ou = "OU=$($l.Service),$base"; $groupe = "GG_$($l.Service)"
  try {
    if (Get-ADUser -Filter "SamAccountName -eq '$id'") {
      [pscustomobject]@{ Id = $id; Statut = 'existant'; MotDePasse = '' }; continue
    }
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$($l.Service)'")) { New-ADOrganizationalUnit -Name $l.Service -Path $base }
    if (-not (Get-ADGroup -Filter "Name -eq '$groupe'")) { New-ADGroup $groupe -GroupScope Global -Path $ou }
    $mdp = New-MotDePasse
    New-ADUser -Name "$($l.Prenom) $($l.Nom)" -GivenName $l.Prenom -Surname $l.Nom -SamAccountName $id `
      -UserPrincipalName "$id@labo.local" -Path $ou -Enabled $true -ChangePasswordAtLogon $true `
      -AccountPassword (ConvertTo-SecureString $mdp -AsPlainText -Force) -ErrorAction Stop
    Add-ADGroupMember $groupe -Members $id
    [pscustomobject]@{ Id = $id; Statut = 'créé'; MotDePasse = $mdp }
  } catch {
    [pscustomobject]@{ Id = $id; Statut = "erreur : $($_.Exception.Message)"; MotDePasse = '' }
  }
}
$resultats | Export-Csv .\resultat_import.csv -NoTypeInformation -Encoding UTF8
$resultats | Group-Object Statut | Select-Object Name, Count
```

Le point clé : `foreach` **renvoie** les objets créés dans la boucle, que l'on récupère directement dans `$resultats`.

## Pour aller plus loin

- *Pester*, le framework de tests de PowerShell, permet de tester ses scripts comme du code applicatif.
- *Desired State Configuration* (DSC) décrit l'état voulu d'un serveur, à la manière d'Ansible (complément du 10 décembre).
- PowerShell 7 sous Linux : `sudo snap install powershell --classic`.
