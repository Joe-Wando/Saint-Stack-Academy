---
slug: l1-arc-4-maintenance-depannage
titre: "Maintenance préventive et dépannage logiciel"
domaine: Matériel et architecture
duree: 150
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Architecture des ordinateurs et maintenance" }
ordre: 4
prerequis_cours: [l1-arc-3-monter-diagnostiquer-pc]
visibilite: public
objectifs:
  - Établir un plan de maintenance préventive (nettoyage, mises à jour, sauvegardes)
  - Appliquer la règle de sauvegarde 3-2-1
  - Protéger un poste contre les logiciels malveillants
  - Diagnostiquer un PC lent avec les outils du système
  - Réinstaller un système d'exploitation proprement
prerequis:
  - Connaître les composants d'un PC et la méthode de dépannage en six étapes
referentiels:
  - Cisco Networking Academy, « IT Essentials », chapitres « Preventive maintenance » et « Security »
  - CompTIA A+ Core 2 (220-1102), domaines « Software Troubleshooting » et « Operational Procedures »
  - ANSSI, « Guide d'hygiène informatique »
quiz:
  - question: "Que signifie la règle de sauvegarde 3-2-1 ?"
    choix: ["3 sauvegardes par jour, 2 par semaine, 1 par mois", "3 copies des données, sur 2 supports différents, dont 1 hors du site", "3 disques, 2 ordinateurs, 1 serveur", "Sauvegarder 3 fois avant de supprimer"]
    reponse: 1
    explication: "Ainsi, un incendie, un vol ou un rançongiciel ne détruit pas toutes les copies à la fois."
  - question: "Pourquoi faut-il installer rapidement les mises à jour de sécurité ?"
    choix: ["Pour avoir de nouvelles couleurs", "Elles corrigent des failles connues, que des attaquants exploitent souvent dans les jours qui suivent leur publication", "Pour libérer de la place", "Elles sont obligatoires par la loi"]
    reponse: 1
    explication: "Une faille publiée est une faille connue de tous, y compris des attaquants."
  - question: "Un PC est lent. Le Gestionnaire des tâches montre le disque à 100 % en permanence. Hypothèse la plus probable ?"
    choix: ["Le processeur est trop faible", "Un disque dur mécanique saturé, ou en fin de vie", "Trop de RAM", "Un écran défectueux"]
    reponse: 1
    explication: "On vérifie l'état SMART du disque et on envisage le passage à un SSD."
  - question: "Comment nettoyer la poussière à l'intérieur d'un PC ?"
    choix: ["Avec un aspirateur ménager directement sur la carte mère", "Avec de l'air comprimé, en bloquant les ventilateurs pour qu'ils ne tournent pas trop vite", "Avec un chiffon mouillé", "En le secouant"]
    reponse: 1
    explication: "L'aspirateur produit de l'électricité statique. Un ventilateur entraîné par l'air comprimé peut produire du courant et s'abîmer."
  - question: "Avant de réinstaller un système d'exploitation, que faut-il faire en priorité ?"
    choix: ["Acheter un nouveau disque", "Sauvegarder les données de l'utilisateur et vérifier qu'on peut les relire", "Désinstaller l'antivirus", "Changer le mot de passe Wi-Fi"]
    reponse: 1
    explication: "Une réinstallation efface généralement le disque système. Une sauvegarde non vérifiée n'est pas une sauvegarde."
---

## L'idée

Un ordinateur bien entretenu tombe moins souvent en panne, reste rapide plus longtemps, et ne fait pas perdre de données. C'est la **maintenance préventive** : agir **avant** la panne. Quand la panne arrive quand même, on applique la **maintenance corrective**, avec méthode.

En Afrique de l'Ouest, trois ennemis menacent particulièrement le matériel : la **poussière**, la **chaleur** et les **coupures et surtensions électriques**. Un bon technicien en tient compte.

## Le plan de maintenance préventive

| Fréquence | Tâche |
|---|---|
| Chaque jour | Sauvegarde automatique des données importantes |
| Chaque semaine | Mises à jour du système et des logiciels, analyse antivirus |
| Chaque mois | Vérifier l'espace disque, l'état du disque (SMART), désinstaller les logiciels inutiles |
| Tous les 3 à 6 mois | Dépoussiérer l'intérieur, vérifier les ventilateurs et les températures |
| Chaque année | Tester la restauration d'une sauvegarde, inventorier le matériel |

## Le matériel : poussière, chaleur et électricité

- **Dépoussiérage** : PC éteint et débranché, à l'**air comprimé**, par petites rafales, en bloquant les ventilateurs avec un doigt. Jamais d'aspirateur ménager directement sur les cartes.
- **Pâte thermique** : sur un PC de plus de 4 ou 5 ans qui chauffe, la remplacer fait souvent baisser la température de plusieurs degrés.
- **Ventilation** : ne pas poser un portable sur un lit ou un coussin, laisser de l'espace derrière une tour.
- **Électricité** : un **onduleur** (UPS) protège contre les coupures et laisse le temps d'éteindre proprement ; un **parafoudre** protège contre les surtensions. Une coupure brutale pendant une écriture peut corrompre des fichiers, voire le système.

## Les mises à jour

Les mises à jour corrigent des **failles de sécurité**, des bogues, et améliorent la compatibilité.

- Active les mises à jour **automatiques** du système (Windows Update, `apt` sous Linux).
- Mets aussi à jour le **navigateur**, la suite bureautique, et les **pilotes** depuis le site du fabricant.
- Sur un poste professionnel, on teste les mises à jour importantes sur une machine avant de les déployer partout.

## Les sauvegardes : la règle 3-2-1

- **3** copies des données : l'original et deux sauvegardes ;
- sur **2** supports différents : disque externe, NAS, cloud ;
- dont **1** copie **hors site** : dans le cloud ou dans un autre bâtiment.

Une sauvegarde qui n'a jamais été **restaurée** à titre de test n'est pas fiable. Et une sauvegarde **toujours branchée** peut être chiffrée par un rançongiciel en même temps que l'original : garde une copie déconnectée.

Outils : Historique des fichiers sous Windows, `rsync` ou Déjà Dup sous Linux, Google Drive ou OneDrive pour la copie distante.

## La sécurité du poste

- Un **antivirus à jour** : Microsoft Defender, intégré à Windows, suffit pour un usage personnel.
- Un **compte utilisateur standard** pour le quotidien, et un compte administrateur réservé à l'installation de logiciels.
- Des logiciels téléchargés uniquement sur le **site officiel** de l'éditeur. Les versions « crackées » sont l'une des premières sources d'infection.
- Méfiance envers les **clés USB** inconnues et les pièces jointes inattendues.
- Le **chiffrement du disque** (BitLocker sous Windows, LUKS sous Linux) protège les données en cas de vol d'un portable.

Signes d'infection : publicités inhabituelles, page d'accueil du navigateur modifiée, ventilateur qui tourne fort sans raison, fichiers renommés ou illisibles.

## Diagnostiquer un PC lent

On cherche quelle ressource est **saturée** :

| Ressource saturée | Outil sous Windows | Outil sous Linux | Pistes |
|---|---|---|---|
| Processeur | Gestionnaire des tâches | `top`, `htop` | Un programme qui tourne en boucle, un logiciel malveillant |
| Mémoire vive | Gestionnaire des tâches | `free -h` | Trop d'onglets, ajouter de la RAM |
| Disque | Gestionnaire des tâches, Moniteur de ressources | `iotop`, `df -h` | Disque plein, disque dur en fin de vie, passer à un SSD |
| Démarrage | Onglet « Démarrage » du Gestionnaire des tâches | `systemd-analyze blame` | Désactiver les programmes inutiles au démarrage |

L'état de santé d'un disque se lit avec ses indicateurs **SMART**, par exemple avec CrystalDiskInfo sous Windows ou `smartctl -a /dev/sda` sous Linux. Un nombre croissant de « secteurs réalloués » annonce la fin du disque : il faut sauvegarder immédiatement.

## Les outils de réparation de Windows

```text
sfc /scannow                           vérifie et répare les fichiers système
DISM /Online /Cleanup-Image /RestoreHealth   répare l'image du système
chkdsk C: /f                           vérifie le système de fichiers
```

Ces commandes se lancent dans un terminal ouvert **en tant qu'administrateur**. Le **mode sans échec** démarre Windows avec le minimum de pilotes : utile pour désinstaller un pilote ou un logiciel qui empêche le démarrage normal. Le **point de restauration** ramène le système à un état antérieur, sans toucher aux documents.

## Réinstaller proprement

Quand le système est trop dégradé, on réinstalle :

1. **Sauvegarder** les données de l'utilisateur, et vérifier qu'elles sont lisibles.
2. Noter les logiciels à réinstaller et récupérer les licences.
3. Créer une **clé d'installation** avec l'outil officiel de Microsoft ou avec Rufus, ou Balena Etcher pour Linux.
4. Démarrer sur la clé (menu de démarrage, souvent avec F12 ou Échap), installer.
5. Installer les **pilotes**, les **mises à jour**, puis les logiciels.
6. Restaurer les données et faire signer la fiche d'intervention.

## Démonstration

1. On ouvre le Gestionnaire des tâches et on lance une vidéo lourde : on observe le processeur, la mémoire et le disque.
2. On désactive trois programmes inutiles au démarrage et on mesure le gain.
3. On lit l'état SMART d'un disque avec CrystalDiskInfo.
4. On configure l'Historique des fichiers vers une clé USB, puis on restaure un fichier supprimé.

## Exercice guidé

Rédige le **plan de maintenance** d'une salle de 15 ordinateurs dans une école de Dakar : tâches, fréquence, responsable, matériel nécessaire. Tiens compte de la poussière et des coupures de courant.

## Exercice autonome

1. Un comptable signale : « Mon PC est devenu très lent, et des publicités s'ouvrent toutes seules dans le navigateur ». Applique la méthode en six étapes et rédige la fiche d'intervention.
2. Propose une stratégie de sauvegarde 3-2-1 pour un étudiant qui a un portable, un téléphone et 15 Go de cours et de projets.
3. Sur ton ordinateur : relève l'état SMART de ton disque, la liste des programmes au démarrage, et la date de ta dernière sauvegarde.

## Correction

Exercice guidé, éléments attendus : sauvegarde des travaux des élèves sur un serveur ou dans le cloud ; mises à jour automatiques ; antivirus centralisé ; dépoussiérage **tous les trois mois**, plus fréquent en saison sèche et pendant l'harmattan ; **onduleurs** sur les postes, ou au minimum des multiprises avec parafoudre ; comptes élèves sans droits administrateur ; un registre des interventions.

Exercice autonome, question 1 :

1. **Identifier** : depuis quand ? Un logiciel a-t-il été installé récemment ? Observation : processus inconnus dans le Gestionnaire des tâches, extensions suspectes dans le navigateur.
2. **Hypothèse** : un logiciel publicitaire (*adware*) installé avec un programme gratuit.
3. **Test** : analyse complète avec Microsoft Defender, en mode hors ligne ; liste des programmes installés récemment.
4. **Plan d'action** : désinstaller le programme suspect, supprimer les extensions, réinitialiser le navigateur, nouvelle analyse.
5. **Vérifier** : plus de publicités, performances normales. Prévenir : compte standard, sensibilisation aux téléchargements.
6. **Documenter** la fiche.

Question 2 : l'original sur le portable ; une copie synchronisée automatiquement sur un service cloud (Google Drive, OneDrive) ; une copie hebdomadaire sur un disque externe ou une clé USB, débranchée après la sauvegarde. Le code des projets est en plus versionné sur GitHub.

## Pour aller plus loin

- Le « Guide d'hygiène informatique » de l'ANSSI (cyber.gouv.fr), 42 mesures simples pour les organisations.
- Ce cours prépare au domaine « Operational Procedures » de **CompTIA A+ Core 2** et au badge **Operating Systems Basics** de Cisco.
- Suite au semestre 2 : l'UE « Maintenance et réseaux ».
