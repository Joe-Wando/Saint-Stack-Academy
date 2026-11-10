---
slug: l1-arc-3-monter-diagnostiquer-pc
titre: "Monter un PC et diagnostiquer le démarrage"
domaine: Matériel et architecture
duree: 150
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Architecture des ordinateurs et maintenance" }
ordre: 3
prerequis_cours: [l1-arc-2-composants-ordinateur]
visibilite: public
objectifs:
  - Appliquer les règles de sécurité (électricité, électricité statique, ergonomie)
  - Vérifier la compatibilité des composants avant un montage
  - Monter un PC dans le bon ordre
  - Expliquer les étapes du démarrage (POST, UEFI, chargeur d'amorçage, système)
  - Diagnostiquer une panne de démarrage avec une méthode par élimination
prerequis:
  - Connaître le rôle des composants d'un PC
referentiels:
  - Cisco Networking Academy, « IT Essentials », chapitres « Assemble a computer » et « Troubleshooting »
  - CompTIA A+ Core 1 (220-1101), domaines « Hardware » et « Hardware and Network Troubleshooting »
  - ACM IT2017, domaine « Platform Technologies »
quiz:
  - question: "Pourquoi porte-t-on un bracelet antistatique pour manipuler des composants ?"
    choix: ["Pour se protéger d'une électrocution", "Pour évacuer l'électricité statique du corps, qui peut détruire un composant sans qu'on le remarque", "Pour ne pas rayer les composants", "C'est une obligation légale"]
    reponse: 1
    explication: "Une décharge électrostatique de quelques centaines de volts, imperceptible pour nous, peut endommager une puce."
  - question: "Que fait le POST au démarrage ?"
    choix: ["Il installe Windows", "Il vérifie le matériel essentiel (processeur, RAM, carte graphique) avant de chercher un système à démarrer", "Il met à jour les pilotes", "Il formate le disque"]
    reponse: 1
    explication: "POST signifie Power-On Self-Test. En cas d'échec, la carte mère émet des bips ou allume un voyant de diagnostic."
  - question: "Le PC s'allume, les ventilateurs tournent, mais rien ne s'affiche et la carte mère émet des bips. Que vérifier en premier ?"
    choix: ["Le disque dur", "La RAM : barrettes mal enfoncées ou défectueuses", "Le clavier", "La connexion Internet"]
    reponse: 1
    explication: "Une erreur de RAM est la cause la plus fréquente d'un échec du POST. On consulte le manuel de la carte mère pour interpréter les bips."
  - question: "Le message « No bootable device » apparaît. Qu'est-ce que cela signifie ?"
    choix: ["Le processeur est mort", "Le POST a réussi, mais l'UEFI ne trouve aucun support contenant un système d'exploitation démarrable", "L'écran est débranché", "La RAM est pleine"]
    reponse: 1
    explication: "On vérifie que le disque est détecté dans l'UEFI, l'ordre de démarrage, et l'état du système installé."
  - question: "Quelle est la première étape de la méthode de dépannage enseignée par CompTIA et Cisco ?"
    choix: ["Remplacer la carte mère", "Identifier le problème en questionnant l'utilisateur et en observant les symptômes", "Réinstaller le système", "Commander des pièces"]
    reponse: 1
    explication: "On identifie le problème, puis on formule une hypothèse, on la teste, on établit un plan d'action, on vérifie le fonctionnement et on documente."
---

## L'idée

Savoir monter un ordinateur, c'est comprendre concrètement comment ses pièces s'assemblent. Savoir **diagnostiquer** une panne, c'est l'une des compétences les plus demandées aux techniciens et aux administrateurs : un PC qui ne démarre plus bloque tout un poste de travail.

Dans ce cours, on monte un PC dans le bon ordre, puis on apprend à lire ce que la machine raconte quand elle démarre, ou quand elle refuse de démarrer.

## La sécurité avant tout

- **Débrancher** le câble secteur et appuyer quelques secondes sur le bouton de démarrage pour vider les condensateurs.
- **N'ouvre jamais une alimentation** ni un écran à tube : ils contiennent des condensateurs qui gardent une tension dangereuse, même débranchés.
- **Électricité statique** (ESD) : porte un **bracelet antistatique** relié au châssis, ou touche régulièrement une partie métallique nue du boîtier. Range les composants dans leurs sachets antistatiques.
- Travaille sur une surface dégagée, non moquettée, avec un bon éclairage.
- Range les vis par type : il y en a de plusieurs tailles.

## Vérifier la compatibilité

Avant d'acheter ou de monter, on vérifie les points suivants :

| Composant | Vérification |
|---|---|
| Processeur et carte mère | Même **socket** (par exemple AM5 pour AMD, LGA1700 pour Intel) et chipset compatible |
| RAM | Type (DDR4 ou DDR5) accepté par la carte mère, nombre d'emplacements |
| Stockage | Connecteur M.2 (NVMe ou SATA) ou port SATA disponible |
| Carte graphique | Longueur compatible avec le boîtier, puissance d'alimentation suffisante |
| Alimentation | Puissance totale avec une marge d'au moins 20 %, connecteurs nécessaires |
| Boîtier | Format de la carte mère : ATX, micro-ATX ou mini-ITX |

Des sites comme PCPartPicker vérifient automatiquement ces compatibilités.

## L'ordre de montage

1. **Préparer la carte mère hors du boîtier**, posée sur son carton.
2. **Installer le processeur** : soulever le levier du socket, aligner le repère (un petit triangle doré) sans forcer, puis refermer le levier.
3. **Poser le refroidissement** : pâte thermique (si elle n'est pas pré-appliquée), puis le ventirad, et brancher son ventilateur sur le connecteur `CPU_FAN`.
4. **Insérer la RAM** : ouvrir les clips, aligner l'encoche, puis appuyer fermement jusqu'au clic. Avec deux barrettes, utiliser les emplacements recommandés par le manuel (souvent A2 et B2) pour le **double canal**.
5. **Installer le SSD M.2** et le fixer avec sa petite vis.
6. **Visser les entretoises** dans le boîtier, poser le cache des ports arrière, puis fixer la carte mère.
7. **Installer l'alimentation**, puis brancher le connecteur **ATX 24 broches** et le connecteur **CPU 8 broches**.
8. **Installer la carte graphique** dans le port PCIe x16, et la brancher à l'alimentation si besoin.
9. **Brancher la façade** : bouton d'alimentation, voyants, USB et audio, en suivant le schéma du manuel.
10. **Ranger les câbles** pour laisser circuler l'air, puis faire un premier test avant de refermer.

## Le démarrage, étape par étape

```text
Appui sur le bouton
   -> l'alimentation fournit le courant
   -> POST : test du processeur, de la RAM, de la carte graphique
   -> UEFI : détecte les disques, lit l'ordre de démarrage
   -> chargeur d'amorçage (Windows Boot Manager ou GRUB)
   -> noyau du système d'exploitation
   -> écran de connexion
```

- Le **POST** (*Power-On Self-Test*) vérifie le matériel minimal. En cas d'erreur, la carte mère émet des **bips** ou allume un **voyant de diagnostic** (CPU, DRAM, VGA, BOOT).
- L'**UEFI** (anciennement BIOS) se configure en appuyant sur une touche au démarrage, souvent **Suppr**, **F2** ou **F10**. On y règle l'ordre de démarrage, la date, la virtualisation ou le *Secure Boot*.
- Les disques modernes utilisent la table de partitions **GPT**, les anciens la table **MBR**.

## La méthode de dépannage en six étapes

Cisco et CompTIA enseignent la même démarche :

1. **Identifier le problème** : questionner l'utilisateur (« qu'est-ce qui a changé ? ») et observer.
2. **Formuler une hypothèse** sur la cause probable, en commençant par la plus simple.
3. **Tester l'hypothèse**. Si elle est fausse, en formuler une autre.
4. **Établir un plan d'action** et l'appliquer.
5. **Vérifier** que tout fonctionne, et prévenir la récidive.
6. **Documenter** : symptômes, cause, solution.

On commence toujours par le **plus simple** : le câble est-il branché ? La prise fonctionne-t-elle ? L'écran est-il sur la bonne entrée ?

## Les pannes de démarrage courantes

| Symptôme | Causes probables | Vérifications |
|---|---|---|
| Rien ne s'allume | Secteur, câble, interrupteur de l'alimentation, bouton de façade | Tester la prise, le câble, l'interrupteur arrière |
| Les ventilateurs tournent, écran noir, bips | RAM, carte graphique | Réinsérer la RAM, tester une barrette à la fois, brancher l'écran sur la bonne sortie |
| Le PC s'éteint après quelques secondes ou minutes | Surchauffe, alimentation insuffisante | Ventilateur du processeur branché ? Pâte thermique ? Poussière ? |
| « No bootable device » | Disque non détecté, mauvais ordre de démarrage | Disque visible dans l'UEFI ? Ordre de démarrage ? |
| Redémarrages en boucle, écran bleu | Pilote, mise à jour, RAM défectueuse, disque en fin de vie | Mode sans échec, test de la mémoire, état SMART du disque |
| Date et heure perdues à chaque démarrage | Pile CMOS usée | Remplacer la pile bouton CR2032 |

## Les outils du technicien

- Un tournevis cruciforme, de préférence aimanté, et une lampe.
- Un **testeur d'alimentation**, ou un multimètre.
- Une **clé USB de démarrage** contenant un système de secours (par exemple une clé Ubuntu « live ») et un outil de test mémoire comme **MemTest86**.
- Des pièces de rechange **connues comme fonctionnelles** : une barrette de RAM, un câble, une alimentation. Remplacer une pièce suspecte par une pièce saine est la méthode la plus fiable.

## Démonstration

Sur un PC de démonstration :

1. On retire une barrette de RAM, on démarre : la carte mère bipe ou allume le voyant DRAM. On la remet en place : le POST passe.
2. On débranche le câble SATA du disque : message « No bootable device ». On le rebranche, puis on vérifie dans l'UEFI que le disque apparaît.
3. On entre dans l'UEFI : ordre de démarrage, activation de la virtualisation, lecture des températures.

## Exercice guidé

Pour chaque situation, applique la méthode : pose deux questions à l'utilisateur, puis donne ta première hypothèse et ton premier test.

1. « Mon ordinateur ne s'allume plus depuis la coupure de courant d'hier. »
2. « L'ordinateur démarre, puis il s'éteint tout seul quand je lance un jeu. »
3. « Je viens d'ajouter une barrette de RAM, et maintenant l'écran reste noir. »

## Exercice autonome

1. Rédige une **fiche de compatibilité** pour monter un PC de développement : choisis un processeur, une carte mère, une RAM, un SSD, une alimentation et un boîtier, et justifie la compatibilité de chaque élément.
2. Un client signale : « Le message *No bootable device* apparaît depuis que j'ai branché un disque externe ». Explique la cause probable et la solution.
3. Rédige la **fiche d'intervention** (étape 6 de la méthode) pour la situation 3 de l'exercice guidé.

## Correction

Exercice guidé :

1. Questions : « Le voyant de l'alimentation s'allume-t-il ? L'ordinateur est-il branché sur un onduleur ou une multiprise ? ». Hypothèse : la surtension a endommagé l'alimentation ou la multiprise. Premier test : changer de prise et de câble, puis tester l'alimentation avec un testeur.
2. Questions : « Depuis quand ? Le PC est-il chaud, les ventilateurs bruyants ? ». Hypothèse : **surchauffe** (poussière, ventilateur arrêté) ou alimentation trop faible pour la carte graphique. Premier test : relever les températures avec un logiciel de surveillance (HWMonitor, par exemple) et nettoyer.
3. Questions : « Quel modèle de barrette ? Où l'as-tu insérée ? ». Hypothèse : barrette mal enfoncée ou incompatible (DDR4 au lieu de DDR5, fréquence non prise en charge). Premier test : retirer la nouvelle barrette ; si le PC redémarre, la réinsérer fermement, puis vérifier sa référence.

Exercice autonome, question 2 : l'UEFI essaie de démarrer sur le **disque externe**, placé en premier dans l'ordre de démarrage, et celui-ci ne contient pas de système. Solution : débrancher le disque au démarrage, ou remettre le disque interne en premier dans l'UEFI.

Question 3, exemple de fiche : *date ; poste ; symptôme : écran noir après ajout de RAM ; cause : barrette DDR4 incompatible avec la carte mère DDR5 ; action : retrait de la barrette, commande du bon modèle ; vérification : démarrage et test MemTest86 réussis ; durée : 30 minutes.*

## Pour aller plus loin

- Le simulateur de montage de Cisco IT Essentials et la vidéo « How to build a PC » de la documentation de ta carte mère.
- Ce cours prépare au domaine « Hardware and Network Troubleshooting » de **CompTIA A+**, et au badge **Computer Hardware Basics** de Cisco.
- Cours suivant : « Maintenance préventive et dépannage logiciel ».
