---
slug: s03-1-windows-dns-dhcp
titre: Windows Server, installation, rôles DNS et DHCP
domaine: Systèmes
duree: 120
difficulte: découverte
licence:
  - { niveau: L3, semestre: S5, ue: "Administration des systèmes", option: reseaux-systemes-cloud }
parcours:
  - { parcours: systemes, ordre: 9 }
ordre: 6
prerequis_cours: []
visibilite: public
objectifs:
  - Installer Windows Server 2022 dans une machine virtuelle et le configurer (nom, IP fixe)
  - Expliquer la notion de rôle et de fonctionnalité, et utiliser le Gestionnaire de serveur
  - Installer et configurer le rôle DHCP (étendue, exclusions, réservations, options)
  - Installer et configurer le rôle DNS (zone directe, zone inverse, enregistrements A, CNAME, PTR)
  - Vérifier le fonctionnement depuis un client avec ipconfig et nslookup
prerequis:
  - Cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP » et « Réseaux approfondis, sous-réseaux, routage, pare-feu et diagnostic »
  - VirtualBox ou Hyper-V, 8 Go de RAM et 60 Go de disque libres
referentiels:
  - Microsoft AZ-800 « Administering Windows Server Hybrid Core Infrastructure », domaines « Manage Windows Servers » et « Implement and manage on-premises networking »
  - CompTIA Server+ (SK0-005), domaine 1
  - RFC 2131 (DHCP)
quiz:
  - question: "Pourquoi un serveur DNS ou DHCP doit-il avoir une adresse IP fixe ?"
    choix: ["Pour être plus rapide", "Parce que les clients doivent toujours le trouver à la même adresse", "Windows l'impose pour tous les serveurs", "Pour économiser des adresses"]
    reponse: 1
    explication: "Si l'IP du serveur DHCP changeait, plus personne ne recevrait d'adresse ; idem pour le DNS configuré sur les postes."
  - question: "Quelle est la séquence DHCP (DORA) ?"
    choix: ["Discover, Offer, Request, Acknowledge", "Deliver, Open, Read, Accept", "Domain, Owner, Record, Address", "Data, Option, Route, Alias"]
    reponse: 0
    explication: "Le client cherche (Discover), le serveur propose (Offer), le client demande (Request), le serveur confirme (Ack)."
  - question: "À quoi sert une réservation DHCP ?"
    choix: ["À bloquer un client", "À donner toujours la même IP à un appareil identifié par son adresse MAC", "À réserver le serveur DNS", "À accélérer le bail"]
    reponse: 1
    explication: "Utile pour une imprimante ou un serveur : configuration centralisée, mais adresse stable."
  - question: "Quel enregistrement DNS traduit une IP en nom (recherche inverse) ?"
    choix: ["A", "CNAME", "PTR", "MX"]
    reponse: 2
    explication: "Les PTR sont stockés dans une zone de recherche inversée (par exemple 10.168.192.in-addr.arpa)."
  - question: "Quelle commande Windows renouvelle l'adresse obtenue par DHCP ?"
    choix: ["ipconfig /renew", "ipconfig /flushdns", "netstat -r", "nslookup /dhcp"]
    reponse: 0
    explication: "ipconfig /release libère l'adresse, /renew en redemande une, /all affiche tout (serveur DHCP, bail, DNS)."
---

## Pourquoi Windows Server ?

La majorité des entreprises gèrent leurs postes de travail avec **Windows Server** : les comptes utilisateurs, les imprimantes, les partages de fichiers, les mises à jour. Un administrateur système, et souvent un DevOps dans une entreprise « hybride », doit savoir mettre en place les **services réseau de base**. Ce cours traite **DHCP**, qui distribue les adresses, et **DNS**, qui traduit les noms. Le cours suivant traite **Active Directory**, qui en dépend.

## Le laboratoire

```
Réseau interne VirtualBox « labo » (192.168.10.0/24)
 ├── SRV01  Windows Server 2022   192.168.10.10 (fixe)   rôles : DNS, DHCP, puis AD DS
 └── CLI01  Windows 10/11         adresse reçue par DHCP
```

1. Télécharge l'ISO d'**évaluation** de Windows Server 2022, gratuite pendant 180 jours, sur le *Microsoft Evaluation Center*.
2. Crée la VM avec 4 Go de RAM, 2 processeurs, 50 Go de disque et une carte réseau en **réseau interne** « labo ».
3. Installe l'édition *Standard (expérience de bureau)*.
4. Configure le serveur :
   - **le nom** : SRV01 ;
   - **l'IP fixe** : `192.168.10.10/24`, avec comme DNS `127.0.0.1` (lui-même, une fois le rôle installé) ;
   - **les mises à jour**.

Pour configurer en PowerShell plutôt qu'à la souris, ce qui est plus rapide et reproductible :

```powershell
Rename-Computer -NewName SRV01 -Restart
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.10 -PrefixLength 24
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1
```

## Rôles et fonctionnalités

- Un **rôle** est un service rendu au réseau : DNS, DHCP, AD DS, serveur de fichiers, IIS (le serveur web).
- Une **fonctionnalité** est un outil pour le serveur lui-même : sauvegarde Windows Server, .NET, BitLocker.
- Le **Gestionnaire de serveur** (*Server Manager*) les ajoute par *Gérer*, puis *Ajouter des rôles et fonctionnalités*.

```powershell
Install-WindowsFeature DNS, DHCP -IncludeManagementTools
```

## Le DHCP

Le protocole DHCP attribue automatiquement à chaque appareil une adresse IP, un masque, une passerelle et un DNS, pour une durée limitée appelée le **bail**.

**La séquence DORA :**

```
Client                                  Serveur DHCP
  │ ── Discover (diffusion) ──────────────▶ │   « Y a-t-il un serveur DHCP ? »
  │ ◀────────────────────────── Offer ───── │   « Je te propose 192.168.10.100 »
  │ ── Request ───────────────────────────▶ │   « Je la prends »
  │ ◀──────────────────────────── Ack ───── │   « Accordée pour 8 jours »
```

| Notion | Définition | Valeur du labo |
|---|---|---|
| **Étendue** (*scope*) | plage d'adresses distribuables | 192.168.10.100 à .200 |
| **Exclusion** | adresses de la plage à ne jamais distribuer | .100 à .109 (pour des équipements) |
| **Réservation** | IP fixe liée à une adresse MAC | imprimante en .150 |
| **Options** | informations transmises avec l'IP | 003 Routeur = .1 ; 006 DNS = .10 ; 015 Domaine = labo.local |
| **Bail** | durée d'attribution | 8 jours |

Exemple chiffré : la plage .100 à .200 compte 101 adresses. Avec 10 exclusions, il en reste **91** distribuables.

Dans la console DHCP : **autoriser** le serveur (obligatoire dans un domaine), puis créer l'étendue IPv4 et l'**activer**. En PowerShell :

```powershell
Add-DhcpServerv4Scope -Name "Labo" -StartRange 192.168.10.100 -EndRange 192.168.10.200 -SubnetMask 255.255.255.0
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.10.0 -StartRange 192.168.10.100 -EndRange 192.168.10.109
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -Router 192.168.10.1 -DnsServer 192.168.10.10 -DnsDomain labo.local
Add-DhcpServerv4Reservation -ScopeId 192.168.10.0 -IPAddress 192.168.10.150 -ClientId "00-15-5D-01-02-03" -Name "Imprimante"
```

> Attention : jamais deux serveurs DHCP sur le même réseau sans coordination. Le serveur DHCP de VirtualBox doit être désactivé sur le réseau « labo ».

## Le DNS

Le DNS côté serveur reprend les notions du cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP » :

- une **zone de recherche directe** `labo.local` traduit les noms en IP (enregistrements `A`, `CNAME`, `MX`) ;
- une **zone de recherche inversée** `10.168.192.in-addr.arpa` traduit les IP en noms (enregistrements `PTR`) ;
- un **redirecteur** (*forwarder*) transmet à un DNS public (`8.8.8.8`, `1.1.1.1`) ce que le serveur ne connaît pas, pour accéder à Internet.

```powershell
Add-DnsServerPrimaryZone -Name "labo.local" -ZoneFile "labo.local.dns"
Add-DnsServerPrimaryZone -NetworkId "192.168.10.0/24" -ZoneFile "10.168.192.in-addr.arpa.dns"
Add-DnsServerResourceRecordA -ZoneName labo.local -Name srv01 -IPv4Address 192.168.10.10 -CreatePtr
Add-DnsServerResourceRecordCName -ZoneName labo.local -Name intranet -HostNameAlias srv01.labo.local
Add-DnsServerForwarder -IPAddress 1.1.1.1, 8.8.8.8
```

Dans le cours « Active Directory, domaine, utilisateurs, groupes et stratégies de groupe », Active Directory crée automatiquement sa propre zone, **intégrée à AD** et répliquée.

## La vérification côté client

Sur CLI01, configuré en DHCP sur le réseau « labo » :

```
ipconfig /all          → IP 192.168.10.110, serveur DHCP 192.168.10.10, DNS 192.168.10.10, bail…
ipconfig /release
ipconfig /renew
nslookup srv01.labo.local     → 192.168.10.10
nslookup intranet.labo.local  → alias de srv01
nslookup 192.168.10.10        → srv01.labo.local (zone inverse)
```

Sur le serveur, la console DHCP, rubrique *Baux d'adresses*, affiche CLI01.

## Démonstration

On monte tout le laboratoire : installation, IP fixe, rôles, étendue, zones. On démarre le client et on suit l'échange DORA dans l'observateur d'événements, ou avec Wireshark si on veut l'observer en détail.

## Exercice guidé

1. Calcule le nombre d'adresses distribuables d'une étendue `192.168.10.50` à `192.168.10.250` avec une exclusion `.50` à `.69`.
2. Ajoute une réservation pour CLI01 en `.120` (trouve sa MAC avec `ipconfig /all`), puis renouvelle son bail et vérifie l'adresse.
3. Crée l'enregistrement `A` `web.labo.local` vers `.20`, et un `CNAME` `www` vers `web`.

## Exercice autonome

1. Réalise tout le laboratoire **uniquement en PowerShell**, dans un script `labo-reseau.ps1`.
2. Ajoute une seconde étendue pour un réseau « invités » `192.168.20.0/24`, avec un bail de 4 heures.
3. Un utilisateur se plaint : « J'ai une adresse en 169.254.x.x et pas d'Internet ». Explique ce que cela signifie et donne trois vérifications.

## Correction

Exercice guidé, question 1 : de .50 à .250, il y a 201 adresses. On retire les 20 adresses exclues (.50 à .69), il en reste **181**.

Questions 2 et 3 :

```powershell
Add-DhcpServerv4Reservation -ScopeId 192.168.10.0 -IPAddress 192.168.10.120 -ClientId "<MAC-de-CLI01>" -Name CLI01
# sur le client : ipconfig /release puis ipconfig /renew → 192.168.10.120
Add-DnsServerResourceRecordA -ZoneName labo.local -Name web -IPv4Address 192.168.10.20 -CreatePtr
Add-DnsServerResourceRecordCName -ZoneName labo.local -Name www -HostNameAlias web.labo.local
```

Exercice autonome, question 3 : une adresse en `169.254.x.x` est une adresse **APIPA**. Le client n'a reçu **aucune réponse DHCP** et s'est attribué une adresse tout seul. Les vérifications :

1. Le service DHCP tourne-t-il, l'étendue est-elle **activée** et le serveur **autorisé** ? Vérifie avec `Get-DhcpServerv4Scope`.
2. Le client est-il sur le bon réseau (câble, VLAN, réseau interne de la VM) ?
3. L'étendue est-elle **pleine** ? Consulte les statistiques avec `Get-DhcpServerv4ScopeStatistics`.

## Pour aller plus loin

- Le *basculement DHCP* (*failover*) répartit une étendue entre deux serveurs pour la haute disponibilité.
- Windows Admin Center offre une interface web d'administration moderne.
- Cours suivant conseillé : « Active Directory, domaine, utilisateurs, groupes et stratégies de groupe » : promotion du serveur en **contrôleur de domaine**.
