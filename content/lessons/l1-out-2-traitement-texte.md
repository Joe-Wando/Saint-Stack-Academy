---
slug: l1-out-2-traitement-texte
titre: "Traitement de texte : produire un document professionnel"
domaine: Métiers et compétences
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Langues et outils" }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Utiliser les styles de titres pour structurer un document long
  - Générer une table des matières, numéroter les pages et les titres
  - Insérer des figures, des tableaux et des légendes numérotées
  - Gérer les sauts de page, les sections, les en-têtes et les pieds de page
  - Collaborer sur un document (commentaires, suivi des modifications) et l'exporter en PDF
prerequis:
  - Savoir utiliser un ordinateur et enregistrer un fichier
referentiels:
  - Microsoft Office Specialist (MOS), Word Associate
  - Référentiel PIX (compétences numériques), domaine « Création de contenus »
  - Documentation LibreOffice Writer
quiz:
  - question: "Pourquoi utiliser les styles « Titre 1 », « Titre 2 » plutôt que mettre le texte en gras à la main ?"
    choix: ["C'est plus joli", "Les styles structurent le document : table des matières automatique, navigation, mise en forme modifiable en un clic", "C'est obligatoire", "Le gras est interdit"]
    reponse: 1
    explication: "Modifier un style met à jour tous les titres du document à la fois, et la table des matières se génère automatiquement."
  - question: "Comment passer proprement à la page suivante pour commencer un nouveau chapitre ?"
    choix: ["Appuyer sur Entrée jusqu'en bas de la page", "Insérer un saut de page (Ctrl + Entrée)", "Réduire la police", "Changer de fichier"]
    reponse: 1
    explication: "Avec des retours à la ligne, la mise en page se décale à chaque modification du texte au-dessus."
  - question: "Comment faire pour que la page de titre n'ait pas de numéro, mais que la suite soit numérotée ?"
    choix: ["Effacer le numéro à la main", "Utiliser l'option « première page différente », ou un saut de section", "Créer deux fichiers", "C'est impossible"]
    reponse: 1
    explication: "Les sections permettent des en-têtes, des pieds de page et des numérotations différents dans un même document."
  - question: "À quoi sert le suivi des modifications ?"
    choix: ["À sauvegarder automatiquement", "À voir chaque modification proposée par un relecteur, puis à l'accepter ou la refuser", "À traduire le texte", "À compter les mots"]
    reponse: 1
    explication: "C'est l'outil de base pour relire un rapport à plusieurs."
  - question: "Pourquoi envoyer un rapport final en PDF plutôt qu'en fichier .docx ?"
    choix: ["Le PDF est plus lourd", "Le PDF s'affiche de la même façon sur tous les appareils et ne se modifie pas par erreur", "Le .docx est interdit", "Le PDF corrige les fautes"]
    reponse: 1
    explication: "On garde le fichier source pour le modifier, et on envoie le PDF pour la lecture."
---

## L'idée

Rapport de stage, mémoire, documentation d'un projet, compte rendu de TP : tu produiras de nombreux documents longs. Beaucoup d'étudiants les mettent en forme « à la main » : gras pour les titres, retours à la ligne pour changer de page, numéros tapés au clavier. Au moindre ajout, tout se décale.

Un traitement de texte (Microsoft Word, LibreOffice Writer, Google Docs) sait faire tout cela **automatiquement**, à condition d'utiliser ses vraies fonctions : les **styles**, les **sauts**, les **sections** et les **champs automatiques**.

## Le principe : séparer le fond et la forme

On indique au logiciel **ce qu'est** chaque élément (un titre de niveau 1, un paragraphe, une légende), et non **à quoi il doit ressembler**. L'apparence est définie une seule fois, dans le **style**.

Avantages :

- changer la police de tous les titres en un clic ;
- générer une **table des matières** automatique ;
- naviguer dans le document par le **volet de navigation** ;
- numéroter automatiquement les titres (1, 1.1, 1.2, 2...).

C'est le même principe que le HTML et le CSS en développement web : le HTML dit ce qu'est le contenu, le CSS dit comment l'afficher.

## Les styles de titres et de paragraphes

| Style | Usage |
|---|---|
| **Titre 1** | Les parties ou chapitres |
| **Titre 2** | Les sous-parties |
| **Titre 3** | Les sous-sous-parties (rarement plus) |
| **Normal** ou **Corps de texte** | Les paragraphes |
| **Légende** | Les légendes des figures et des tableaux |

Pour modifier un style : clic droit sur le style, puis *Modifier*. Règle la police, la taille, l'espacement avant et après. **Évite les lignes vides** pour espacer les paragraphes : utilise l'espacement « après » du style (6 à 12 points).

La **numérotation des titres** se configure une fois (*Liste à plusieurs niveaux* dans Word, *Outils > Numérotation des chapitres* dans LibreOffice) : chaque titre est ensuite numéroté automatiquement.

## La table des matières

1. Applique les styles de titres à tous tes titres.
2. Place le curseur à l'endroit voulu.
3. Word : *Références > Table des matières*. LibreOffice : *Insertion > Table des matières et index*.
4. Après chaque modification, **mets la table à jour** (clic droit, *Mettre à jour*).

On peut de la même façon générer une **table des figures**, à partir des légendes.

## Figures, tableaux et légendes

- Insère une image, puis ajoute une **légende** automatique (*Insérer une légende*) : « Figure 1 : Architecture de l'application ». Le numéro se met à jour tout seul si tu ajoutes une figure avant.
- Dans le texte, fais une **référence croisée** vers la figure (« voir figure 1 ») : elle se met aussi à jour.
- Pour les **tableaux**, la légende se place au-dessus ; pour les **figures**, en dessous.
- Règle l'**habillage** de l'image sur « aligné sur le texte » pour éviter qu'elle se déplace.

## Sauts de page et sections

- **Saut de page** (Ctrl + Entrée) : commence une nouvelle page. À utiliser avant chaque chapitre, plutôt qu'une série de retours à la ligne.
- **Saut de section** : découpe le document en parties qui peuvent avoir une orientation (portrait ou paysage), des en-têtes, des pieds de page et une numérotation différents.

Cas typique : la page de titre et la table des matières sans numéro, puis le corps du rapport numéroté à partir de 1.

## En-têtes, pieds de page et numéros

- Double-clique en haut ou en bas de la page pour modifier l'en-tête ou le pied de page.
- Insère le **numéro de page** comme champ automatique, jamais en le tapant.
- Contenu habituel : titre du rapport et nom de l'auteur en en-tête ; numéro « page X sur Y » en pied de page.
- Option **« Première page différente »** : pas d'en-tête sur la page de titre.

## Collaborer sur un document

- **Commentaires** : pour poser une question ou faire une remarque sans modifier le texte.
- **Suivi des modifications** (*Révision > Suivi des modifications*) : chaque ajout et chaque suppression apparaît en couleur ; l'auteur accepte ou refuse.
- **Édition partagée en ligne** (Google Docs, Word en ligne) : plusieurs personnes écrivent en même temps, et l'historique des versions permet de revenir en arrière.

## Finaliser et exporter

1. Mets à jour la table des matières et les références.
2. Lance la **vérification orthographique**, et relis.
3. Vérifie l'affichage en **mode Lecture** ou en aperçu avant impression.
4. **Exporte en PDF** (*Fichier > Exporter* ou *Enregistrer sous > PDF*).
5. Garde le fichier source (.docx ou .odt) pour les modifications.

Nomme les versions clairement : `Rapport_TP3_Diop_v2.docx`, plutôt que `rapport final final (2).docx`.

## Démonstration

On part d'un rapport de 6 pages mis en forme à la main. En 15 minutes :

1. On applique les styles Titre 1 et Titre 2 à tous les titres.
2. On active la numérotation des titres.
3. On génère la table des matières.
4. On remplace les retours à la ligne multiples par des sauts de page.
5. On ajoute les légendes et la numérotation des pages, sauf sur la page de titre.
6. On modifie le style Titre 1 (police, couleur) : tous les titres changent d'un coup.

## Exercice guidé

Crée un document « Compte rendu de TP » avec : une page de titre, une table des matières, trois parties de niveau 1 et deux sous-parties de niveau 2, une capture d'écran légendée, un tableau légendé, et la numérotation des pages à partir de la deuxième page. Exporte-le en PDF.

## Exercice autonome

1. Crée un **modèle** de rapport (fichier .dotx ou .ott) que tu réutiliseras pour tous tes rapports de l'année : styles, page de titre, en-tête et pied de page.
2. À deux, relisez mutuellement vos comptes rendus en activant le suivi des modifications, puis acceptez ou refusez les propositions.
3. Ajoute au rapport une page en orientation **paysage**, pour un grand tableau, sans changer l'orientation des autres pages.

## Correction

Exercice guidé, points de contrôle :

- le volet de navigation affiche bien les 3 parties et leurs sous-parties ;
- la table des matières se met à jour quand on ajoute un titre ;
- les légendes s'appellent « Figure 1 » et « Tableau 1 », avec le style Légende ;
- la page de titre n'a pas de numéro, la page suivante affiche « 2 » (ou « 1 », si l'on a redémarré la numérotation dans une nouvelle section).

Exercice autonome, question 3 : insère un **saut de section (page suivante)** avant et après la page concernée, puis change l'orientation de cette seule section (*Mise en page > Orientation*). Si l'orientation change pour tout le document, c'est que les sauts de section manquent.

## Pour aller plus loin

- La certification Microsoft Office Specialist (MOS), reconnue par les employeurs, et le référentiel PIX, gratuit.
- Pour les documents scientifiques avec des formules, découvre **LaTeX**, par exemple sur Overleaf.
- Pour la documentation de code, le **Markdown** : c'est le format des cours de cette plateforme.
- Cours suivant : « Tableur : formules, fonctions et graphiques ».
