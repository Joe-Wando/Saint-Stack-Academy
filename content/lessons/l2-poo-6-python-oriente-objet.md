---
slug: l2-poo-6-python-oriente-objet
titre: "Python orienté objet"
domaine: Programmation
duree: 150
difficulte: opérationnel
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 6
prerequis_cours: [l2-poo-2-heritage-polymorphisme]
visibilite: public
objectifs:
  - Écrire une classe Python avec __init__, des attributs et des méthodes
  - Appliquer les conventions d'encapsulation de Python et utiliser @property
  - Utiliser l'héritage, super() et le polymorphisme en Python
  - Redéfinir les méthodes spéciales (__str__, __repr__, __eq__, __lt__, __len__)
  - Simplifier les classes de données avec @dataclass, et comparer Python et Java
prerequis:
  - Bases de Python (variables, listes, dictionnaires, fonctions)
  - Classes, héritage et polymorphisme en Java
referentiels:
  - Documentation officielle Python, tutoriel « Classes » (docs.python.org)
  - OpenEDG Python Institute, PCAP (Certified Associate in Python Programming), section « Object-Oriented Programming »
  - Cisco Networking Academy, « Python Essentials 2 »
quiz:
  - question: "Que représente self dans une méthode Python ?"
    choix: ["La classe", "L'objet sur lequel la méthode est appelée", "Un mot-clé réservé sans rôle", "Le module"]
    reponse: 1
    explication: "compte.deposer(100) appelle Compte.deposer(compte, 100) : self reçoit compte. C'est l'équivalent de this en Java, mais écrit explicitement."
  - question: "Que signifie un attribut nommé _solde, avec un tiret bas ?"
    choix: ["Il est réellement privé et inaccessible", "C'est une convention : attribut interne, à ne pas utiliser hors de la classe", "Il est statique", "Il est constant"]
    reponse: 1
    explication: "Python ne bloque pas l'accès, mais la convention est respectée par tous les développeurs."
  - question: "À quoi sert __str__ ?"
    choix: ["À créer l'objet", "À définir le texte affiché par print(objet) et str(objet)", "À comparer deux objets", "À détruire l'objet"]
    reponse: 1
    explication: "C'est l'équivalent de toString() en Java. __repr__ donne une représentation pour les développeurs."
  - question: "Que fait le décorateur @dataclass ?"
    choix: ["Il connecte la classe à une base de données", "Il génère automatiquement __init__, __repr__ et __eq__ à partir des attributs annotés", "Il rend la classe abstraite", "Il accélère le programme"]
    reponse: 1
    explication: "C'est l'équivalent des records Java : idéal pour des classes qui portent surtout des données."
  - question: "Pourquoi dit-on que Python pratique le « duck typing » ?"
    choix: ["Parce qu'il a été créé par un canard", "Parce qu'un objet est accepté s'il possède les méthodes utilisées, quel que soit son type déclaré", "Parce qu'il n'a pas de classes", "Parce qu'il est lent"]
    reponse: 1
    explication: "« Si ça marche comme un canard et que ça cancane comme un canard, c'est un canard. » Pas besoin d'interface déclarée."
---

## L'idée

Tu connais maintenant les concepts objet en Java : classes, encapsulation, héritage, polymorphisme. **Python** les applique avec une syntaxe plus légère et une philosophie différente : moins de contraintes imposées par le langage, davantage de **conventions** respectées par les développeurs.

Python est devenu incontournable en science des données, en intelligence artificielle, en automatisation et en développement web (Django, FastAPI). Les bibliothèques que tu utiliseras (pandas, scikit-learn) sont entièrement orientées objet : `df = pd.DataFrame(...)` crée un objet, et `df.describe()` appelle une de ses méthodes.

## Une première classe

```python
class Compte:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self._solde = solde

    def deposer(self, montant):
        if montant <= 0:
            raise ValueError(f"Montant invalide : {montant}")
        self._solde += montant

    def retirer(self, montant):
        if montant > self._solde:
            return False
        self._solde -= montant
        return True

    def solde(self):
        return self._solde


c = Compte("Awa Diop", 50000)
c.deposer(25000)
print(c.titulaire, c.solde())     # Awa Diop 75000
```

| Python | Java | Rôle |
|---|---|---|
| `class Compte:` | `public class Compte {` | déclaration |
| `__init__(self, ...)` | constructeur | initialisation |
| `self` | `this` | l'objet courant, **écrit explicitement** en premier paramètre |
| `Compte("Awa", 50000)` | `new Compte("Awa", 50000)` | création, sans `new` |
| `raise ValueError(...)` | `throw new IllegalArgumentException(...)` | lever une exception |

Les attributs sont créés dans `__init__` par affectation (`self.titulaire = ...`), sans déclaration de type. On peut ajouter des **annotations de type** facultatives : `def __init__(self, titulaire: str, solde: float = 0) -> None:`, utiles pour la lisibilité et les outils de vérification.

## L'encapsulation à la Python

Python n'a pas de mot-clé `private`. On utilise des **conventions** :

- `nom` : public ;
- `_nom` : **interne**, « ne touche pas de l'extérieur » ;
- `__nom` : le nom est transformé (*name mangling*) pour éviter les conflits dans les sous-classes ; rarement utile.

Pour contrôler l'accès à un attribut tout en gardant une syntaxe simple, on utilise une **propriété** :

```python
class Produit:
    def __init__(self, libelle, prix):
        self.libelle = libelle
        self.prix = prix              # passe par le setter ci-dessous

    @property
    def prix(self):
        return self._prix

    @prix.setter
    def prix(self, valeur):
        if valeur < 0:
            raise ValueError("Le prix ne peut pas être négatif")
        self._prix = valeur


p = Produit("Clé USB", 5000)
p.prix = 4500        # appelle le setter, qui vérifie
print(p.prix)        # appelle le getter : 4500
```

On écrit `p.prix` comme un attribut, mais la validation est garantie. Si l'on n'a besoin d'aucune vérification, on garde un simple attribut public : c'est le style Python.

## Attributs de classe et méthodes statiques

```python
class Etudiant:
    nombre = 0                       # attribut de classe, partagé

    def __init__(self, nom):
        Etudiant.nombre += 1
        self.matricule = f"ETU-{Etudiant.nombre:03d}"
        self.nom = nom

    @classmethod
    def depuis_csv(cls, ligne):      # constructeur alternatif
        nom = ligne.split(";")[0]
        return cls(nom)

    @staticmethod
    def note_valide(note):
        return 0 <= note <= 20
```

- Un attribut défini dans le corps de la classe est **partagé** (comme `static` en Java).
- `@classmethod` reçoit la classe (`cls`) : utile pour les **constructeurs alternatifs**.
- `@staticmethod` ne reçoit ni l'objet ni la classe : c'est une fonction rangée dans la classe.

## Héritage et polymorphisme

```python
class Personne:
    def __init__(self, nom):
        self.nom = nom

    def presentation(self):
        return f"Je m'appelle {self.nom}"


class Enseignant(Personne):
    def __init__(self, nom, specialite):
        super().__init__(nom)
        self.specialite = specialite

    def presentation(self):
        return super().presentation() + f", j'enseigne {self.specialite}"


for p in [Personne("Moussa"), Enseignant("Mme Ndiaye", "l'algorithmique")]:
    print(p.presentation())
```

- La classe parente se met entre parenthèses : `class Enseignant(Personne):`.
- `super().__init__(...)` appelle le constructeur parent.
- La redéfinition ne demande aucun mot-clé ; `isinstance(p, Personne)` teste le type.
- Python autorise l'**héritage multiple**, à utiliser avec prudence.

Python pratique le **duck typing** : une fonction accepte n'importe quel objet qui possède les méthodes dont elle a besoin, sans interface déclarée. Pour définir un contrat explicite, on utilise une **classe abstraite** du module `abc` :

```python
from abc import ABC, abstractmethod
import math

class Forme(ABC):
    @abstractmethod
    def aire(self):
        ...

class Cercle(Forme):
    def __init__(self, r):
        self.r = r

    def aire(self):
        return math.pi * self.r ** 2
```

`Forme()` lève alors une erreur : on ne peut pas instancier une classe abstraite.

## Les méthodes spéciales

Les méthodes entourées de doubles tirets bas permettent à tes objets de fonctionner avec la syntaxe de Python :

| Méthode | Déclenchée par | Équivalent Java |
|---|---|---|
| `__str__` | `print(obj)`, `str(obj)` | `toString()` |
| `__repr__` | affichage dans la console, débogage | |
| `__eq__` | `a == b` | `equals()` |
| `__lt__` | `a < b`, et donc `sorted()` | `compareTo()` |
| `__len__` | `len(obj)` | `size()` |
| `__contains__` | `x in obj` | `contains()` |

```python
class Promotion:
    def __init__(self, nom):
        self.nom = nom
        self._etudiants = []

    def ajouter(self, etudiant):
        self._etudiants.append(etudiant)

    def __len__(self):
        return len(self._etudiants)

    def __str__(self):
        return f"Promotion {self.nom} ({len(self)} étudiants)"
```

`len(promo)` et `print(promo)` fonctionnent alors naturellement.

## Les dataclasses

Pour une classe qui porte surtout des **données**, `@dataclass` génère `__init__`, `__repr__` et `__eq__` automatiquement :

```python
from dataclasses import dataclass, field

@dataclass(order=True)
class Note:
    valeur: float
    matiere: str = field(compare=False)
    coefficient: int = field(default=1, compare=False)


notes = [Note(14, "C"), Note(9.5, "Maths", 2), Note(16, "Anglais")]
print(sorted(notes)[0])          # Note(valeur=9.5, matiere='Maths', coefficient=2)
print(Note(12, "C") == Note(12, "C"))   # True
```

`order=True` génère aussi les comparaisons, ici sur le seul champ `valeur`. C'est l'équivalent des **records** de Java.

## Python et Java : la synthèse

| | Java | Python |
|---|---|---|
| Typage | statique, vérifié à la compilation | dynamique, annotations facultatives |
| Encapsulation | `private`, imposée | `_nom`, convention |
| Interfaces | `interface` | duck typing, ou `ABC` |
| Héritage | simple (+ interfaces) | multiple possible |
| Données | `record` | `@dataclass` |
| Verbosité | plus élevée | plus faible |

## Démonstration

On modélise une petite bibliothèque : une dataclass `Livre` (titre, auteur, année), une classe `Bibliotheque` avec les méthodes `ajouter`, `rechercher_par_auteur` et `emprunter`, et les méthodes spéciales `__len__` et `__contains__`. On teste `len(biblio)`, `"Une si longue lettre" in biblio` et `sorted(biblio.livres, key=lambda l: l.annee)`.

## Exercice guidé

1. Écris une classe `Rectangle` avec `largeur` et `hauteur`, et les méthodes `aire()` et `perimetre()`.
2. Ajoute `__str__` et `__eq__` (deux rectangles sont égaux s'ils ont les mêmes dimensions).
3. Crée une sous-classe `Carre` qui n'a besoin que d'un côté.

## Exercice autonome

1. Écris la classe `Compte` avec une propriété `solde` en lecture seule, et une exception personnalisée `SoldeInsuffisant` (classe qui hérite de `Exception`) levée par `retirer`.
2. Crée `CompteEpargne(Compte)` avec un taux d'intérêt et une méthode `appliquer_interets()`.
3. Réécris la classe `Etudiant` (nom, liste de notes) en dataclass, avec une méthode `moyenne()`, puis trie une liste d'étudiants par moyenne décroissante.

## Correction

Exercice guidé :

```python
class Rectangle:
    def __init__(self, largeur, hauteur):
        self.largeur = largeur
        self.hauteur = hauteur

    def aire(self):
        return self.largeur * self.hauteur

    def perimetre(self):
        return 2 * (self.largeur + self.hauteur)

    def __str__(self):
        return f"Rectangle {self.largeur} x {self.hauteur}"

    def __eq__(self, autre):
        if not isinstance(autre, Rectangle):
            return NotImplemented
        return (self.largeur, self.hauteur) == (autre.largeur, autre.hauteur)


class Carre(Rectangle):
    def __init__(self, cote):
        super().__init__(cote, cote)

    def __str__(self):
        return f"Carré de côté {self.largeur}"
```

Exercice autonome :

```python
from dataclasses import dataclass, field

class SoldeInsuffisant(Exception):
    pass

class Compte:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self._solde = solde

    @property
    def solde(self):
        return self._solde

    def retirer(self, montant):
        if montant > self._solde:
            raise SoldeInsuffisant(f"Il manque {montant - self._solde} FCFA")
        self._solde -= montant

class CompteEpargne(Compte):
    def __init__(self, titulaire, solde=0, taux=0.035):
        super().__init__(titulaire, solde)
        self.taux = taux

    def appliquer_interets(self):
        self._solde += self._solde * self.taux

@dataclass
class Etudiant:
    nom: str
    notes: list = field(default_factory=list)

    def moyenne(self):
        return sum(self.notes) / len(self.notes) if self.notes else 0

promo = [Etudiant("Awa", [14, 16]), Etudiant("Moussa", [9, 11]), Etudiant("Fatou", [17, 18])]
classement = sorted(promo, key=lambda e: e.moyenne(), reverse=True)
print([e.nom for e in classement])     # ['Fatou', 'Awa', 'Moussa']
```

Sans propriété « setter », `compte.solde = 0` lève une `AttributeError` : le solde est bien en lecture seule. `field(default_factory=list)` crée une nouvelle liste pour chaque étudiant ; une valeur par défaut `[]` serait partagée entre tous les objets.

## Pour aller plus loin

- Le tutoriel officiel Python, chapitre « Classes ».
- Le cours gratuit « Python Essentials 2 » de Cisco NetAcad, qui prépare à la certification **PCAP**.
- Le cours « Python pour la data, pandas et Matplotlib » applique ces notions aux données.
- Fin de l'UE « Langages et programmation orientée objet ».
