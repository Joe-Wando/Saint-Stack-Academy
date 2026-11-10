---
slug: l1-out-3-tableur
titre: "Tableur : formules, fonctions et graphiques"
domaine: Métiers et compétences
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Langues et outils" }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Organiser des données en tableau propre (une ligne par enregistrement, une colonne par information)
  - Écrire des formules avec des références relatives, absolues et mixtes
  - Utiliser les fonctions SOMME, MOYENNE, MIN, MAX, NB, SI, NB.SI, SOMME.SI et RECHERCHEX
  - Trier, filtrer, appliquer une mise en forme conditionnelle et créer un tableau croisé dynamique
  - Construire un graphique adapté aux données
prerequis:
  - Les quatre opérations et les pourcentages
referentiels:
  - Microsoft Office Specialist (MOS), Excel Associate
  - Référentiel PIX (compétences numériques), domaine « Information et données »
  - Documentation LibreOffice Calc et Google Sheets
quiz:
  - question: "Que devient la formule =B2*C2 si on la recopie une ligne plus bas ?"
    choix: ["=B2*C2", "=B3*C3", "=C2*D2", "Une erreur"]
    reponse: 1
    explication: "Les références relatives s'adaptent : on décale d'une ligne, les numéros de ligne augmentent de 1."
  - question: "À quoi sert le symbole $ dans =B2*$F$1 ?"
    choix: ["À afficher des dollars", "À figer la référence F1, qui ne bouge pas quand on recopie la formule", "À arrondir", "À masquer la cellule"]
    reponse: 1
    explication: "$F$1 est une référence absolue : utile pour un taux de TVA ou une valeur commune à toutes les lignes."
  - question: "Quelle formule affiche « Admis » si la moyenne en E2 est au moins 10, et « Ajourné » sinon ?"
    choix: ["=SI(E2>=10;\"Admis\";\"Ajourné\")", "=SI(E2<10;\"Admis\")", "=SOMME(E2;10)", "=NB.SI(E2;\"Admis\")"]
    reponse: 0
    explication: "SI(condition ; valeur si vrai ; valeur si faux). Selon la langue et le logiciel, le séparateur est ; ou ,."
  - question: "Quel graphique choisir pour montrer l'évolution des inscriptions sur 10 ans ?"
    choix: ["Un graphique en secteurs", "Une courbe (graphique en lignes)", "Un nuage de points sans ordre", "Un tableau"]
    reponse: 1
    explication: "La courbe montre une évolution dans le temps. Les secteurs servent à montrer les parts d'un tout, à un instant donné."
  - question: "À quoi sert un tableau croisé dynamique ?"
    choix: ["À dessiner", "À résumer rapidement un grand tableau : totaux, moyennes ou comptages par catégorie", "À corriger l'orthographe", "À protéger le fichier"]
    reponse: 1
    explication: "Par exemple, le chiffre d'affaires par mois et par vendeur, en quelques clics, sans écrire de formule."
---

## L'idée

Le tableur (Microsoft Excel, LibreOffice Calc, Google Sheets) est l'outil de calcul le plus utilisé au monde. Budgets, notes, stocks, inventaires, plannings, premières analyses de données : il est partout en entreprise. Pour un informaticien, c'est aussi une **porte d'entrée vers les bases de données et l'analyse de données** : un tableau bien construit ressemble beaucoup à une table SQL.

Le tableur repose sur une idée simple : une cellule peut contenir une **valeur** ou une **formule** qui calcule à partir d'autres cellules. Si une valeur change, tout se recalcule.

## Les bases

- La grille est faite de **colonnes** (A, B, C...) et de **lignes** (1, 2, 3...). Une cellule est désignée par sa **référence** : B3 est en colonne B, ligne 3.
- Une **plage** de cellules : `B2:B31` (de B2 à B31).
- Une **formule** commence toujours par `=` : `=B2+C2`.

### Un tableau propre

Pour pouvoir calculer, trier et filtrer, respecte ces règles, les mêmes qu'en base de données :

1. **Une ligne d'en-tête** avec un nom par colonne.
2. **Une ligne par enregistrement** (un étudiant, une vente).
3. **Une colonne par information**, avec un seul type de donnée (que des nombres, ou que des dates).
4. **Pas de lignes vides** ni de cellules fusionnées au milieu des données.

## Les références relatives, absolues et mixtes

Quand on **recopie** une formule (en tirant la poignée en bas à droite de la cellule), les références s'adaptent :

| Référence | Type | Quand on recopie |
|---|---|---|
| `B2` | relative | la ligne et la colonne bougent |
| `$B$2` | absolue | rien ne bouge |
| `$B2` | mixte | la colonne est figée, la ligne bouge |
| `B$2` | mixte | la ligne est figée, la colonne bouge |

Exemple : les prix hors taxes sont en B2:B10, et le taux de TVA (18 %) est en F1. En C2, on écrit `=B2*(1+$F$1)`, puis on recopie vers le bas : B2 devient B3, B4..., mais `$F$1` reste fixe. La touche **F4** ajoute les `$` automatiquement.

## Les fonctions essentielles

| Fonction | Rôle | Exemple |
|---|---|---|
| `SOMME` | somme | `=SOMME(B2:B31)` |
| `MOYENNE` | moyenne | `=MOYENNE(B2:B31)` |
| `MIN`, `MAX` | plus petite, plus grande valeur | `=MAX(B2:B31)` |
| `NB` | nombre de cellules contenant un nombre | `=NB(B2:B31)` |
| `NBVAL` | nombre de cellules non vides | `=NBVAL(A2:A31)` |
| `ARRONDI` | arrondi | `=ARRONDI(E2;2)` |
| `SI` | choix selon une condition | `=SI(E2>=10;"Admis";"Ajourné")` |
| `NB.SI` | compter selon un critère | `=NB.SI(F2:F31;"Admis")` |
| `SOMME.SI` | sommer selon un critère | `=SOMME.SI(A2:A50;"Dakar";C2:C50)` |
| `RECHERCHEX` | retrouver une valeur dans une autre table | `=RECHERCHEX(A2;Tarifs!A:A;Tarifs!B:B)` |

Dans la version anglaise d'Excel et dans Google Sheets en anglais, les noms changent (`SUM`, `AVERAGE`, `IF`, `COUNTIF`, `XLOOKUP`) et le séparateur est souvent la virgule. Dans les versions françaises, c'est le point-virgule. **`RECHERCHEX`** remplace avantageusement l'ancienne `RECHERCHEV` ; elle est disponible dans les versions récentes d'Excel et dans Google Sheets.

On peut **imbriquer** des fonctions : `=SI(E2>=16;"Très bien";SI(E2>=14;"Bien";SI(E2>=12;"Assez bien";SI(E2>=10;"Passable";"Ajourné"))))`. On retrouve exactement la logique des `else if` du cours de C.

## Trier, filtrer et mettre en forme

- **Trier** : sélectionner le tableau, puis *Données > Trier*, sur une ou plusieurs colonnes.
- **Filtrer** : *Données > Filtrer* ajoute des menus déroulants dans l'en-tête, pour n'afficher que certaines lignes.
- **Mettre sous forme de tableau** (Ctrl + T dans Excel) : le tableau devient un objet nommé, qui s'agrandit tout seul et dont les formules se recopient automatiquement.
- **Mise en forme conditionnelle** : colorer automatiquement les cellules selon leur valeur, par exemple les moyennes inférieures à 10 en rouge.
- **Figer les volets** : garder la ligne d'en-tête visible quand on fait défiler.

## Le tableau croisé dynamique

Un **tableau croisé dynamique** résume un grand tableau sans écrire de formule : on choisit une colonne en **lignes** (par exemple la ville), une en **colonnes** (le mois), et une **valeur** à calculer (la somme des ventes). Le résultat se met à jour en un clic.

C'est l'équivalent d'une requête SQL `GROUP BY`, que tu apprendras en L2.

## Les graphiques

| Objectif | Graphique |
|---|---|
| Comparer des catégories | Histogramme (barres verticales) ou barres horizontales |
| Montrer une évolution dans le temps | Courbe |
| Montrer les parts d'un tout | Secteurs (seulement avec peu de catégories), ou barres empilées |
| Montrer la relation entre deux variables | Nuage de points |

Un bon graphique a un **titre** explicite, des **axes** avec leurs unités, et pas d'effets inutiles (3D, ombres). L'axe des valeurs d'un histogramme commence à **zéro**, sinon les écarts paraissent exagérés.

## Démonstration

On construit le relevé de notes d'un groupe de 10 étudiants :

| | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| 1 | Nom | C (coef. 3) | Maths (coef. 2) | Anglais (coef. 1) | Moyenne | Résultat |
| 2 | Awa | 14 | 12 | 15 | | |

- En E2 : `=ARRONDI((B2*3+C2*2+D2*1)/6;2)`, soit 13,50.
- En F2 : `=SI(E2>=10;"Admis";"Ajourné")`.
- On recopie vers le bas, puis on ajoute en dessous la moyenne de la classe, le nombre d'admis avec `NB.SI`, et la meilleure moyenne avec `MAX`.
- Mise en forme conditionnelle : moyennes inférieures à 10 en rouge.
- Graphique en barres des moyennes par étudiant.

Pour des coefficients modifiables, on les place dans des cellules (par exemple B12, C12, D12) et on écrit `=SOMMEPROD(B2:D2;$B$12:$D$12)/SOMME($B$12:$D$12)`.

## Exercice guidé

Construis le budget mensuel d'un étudiant : une colonne « Catégorie » (transport, nourriture, internet, logement, loisirs), une colonne « Prévu », une colonne « Réel ».

1. Calcule l'écart (Réel − Prévu) et le total de chaque colonne.
2. Affiche « Dépassement » si le réel dépasse le prévu, avec `SI`.
3. Colore les dépassements en rouge avec une mise en forme conditionnelle.
4. Crée un graphique comparant le prévu et le réel par catégorie.

## Exercice autonome

1. Une feuille « Ventes » contient : date, ville, produit, quantité, prix unitaire. Ajoute une colonne « Montant », puis calcule le total des ventes à Dakar avec `SOMME.SI`.
2. Crée un tableau croisé dynamique : montant total par ville et par produit.
3. Une feuille « Produits » contient le code et le prix de chaque produit. Dans la feuille « Ventes », retrouve automatiquement le prix à partir du code avec `RECHERCHEX`.

## Correction

Exercice guidé :

- Écart en D2 : `=C2-B2`. Totaux : `=SOMME(B2:B6)`, etc.
- En E2 : `=SI(C2>B2;"Dépassement";"")`.
- Mise en forme conditionnelle sur la plage C2:C6, avec la formule `=C2>B2`.
- Graphique : un histogramme groupé, avec deux séries (Prévu et Réel) et les catégories en abscisse.

Exercice autonome :

1. Montant en F2 : `=D2*E2`. Total Dakar : `=SOMME.SI(B2:B500;"Dakar";F2:F500)`.
2. Insertion d'un tableau croisé dynamique : « Ville » en lignes, « Produit » en colonnes, « Montant » en valeurs (somme).
3. `=RECHERCHEX(C2;Produits!A:A;Produits!B:B;"Code inconnu")`. Le quatrième argument s'affiche si le code est introuvable, au lieu d'une erreur `#N/A`.

## Pour aller plus loin

- La certification Microsoft Office Specialist Excel, et les exercices gratuits de PIX.
- Le cours « SQL, interroger une base avec SELECT », en L2 : tu y retrouveras le tri, le filtre et les regroupements.
- Fin de l'UE « Langues et outils ».
