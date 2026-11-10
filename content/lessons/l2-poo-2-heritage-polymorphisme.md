---
slug: l2-poo-2-heritage-polymorphisme
titre: "Java : héritage et polymorphisme"
domaine: Programmation
duree: 150
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 2
prerequis_cours: [l2-poo-1-java-classes-objets]
visibilite: public
objectifs:
  - Créer une sous-classe avec extends et appeler le constructeur parent avec super
  - Redéfinir une méthode avec @Override, et la distinguer de la surcharge
  - Expliquer et utiliser le polymorphisme (une référence de type parent vers un objet enfant)
  - Utiliser protected, final et la classe Object (toString, equals)
  - Choisir entre héritage et composition
prerequis:
  - Classes, objets, encapsulation en Java
referentiels:
  - Oracle, « The Java Tutorials », section « Inheritance »
  - Oracle Certified Professional Java SE 21 Developer (1Z0-830), objectifs sur l'héritage
  - ACM/IEEE CS2023, domaine « Foundations of Programming Languages » (polymorphisme)
quiz:
  - question: "Quelle relation justifie un héritage ?"
    choix: ["« A une » : une voiture a un moteur", "« Est un » : un enseignant est une personne", "« Utilise » : un étudiant utilise un ordinateur", "Toute relation"]
    reponse: 1
    explication: "L'héritage exprime une spécialisation. « A un » se modélise par la composition : un attribut."
  - question: "Que fait super(nom) dans le constructeur d'une sous-classe ?"
    choix: ["Il crée un deuxième objet", "Il appelle le constructeur de la classe parente pour initialiser la partie héritée", "Il supprime le parent", "Il appelle toString"]
    reponse: 1
    explication: "Il doit être la première instruction du constructeur."
  - question: "Avec Forme f = new Cercle(2); f.aire();, quelle méthode aire() est exécutée ?"
    choix: ["Celle de Forme", "Celle de Cercle", "Les deux", "Aucune : erreur"]
    reponse: 1
    explication: "C'est la liaison dynamique : Java choisit la méthode selon le type réel de l'objet, à l'exécution."
  - question: "Quelle est la différence entre redéfinition (override) et surcharge (overload) ?"
    choix: ["Aucune", "La redéfinition remplace une méthode héritée avec la même signature ; la surcharge crée une méthode de même nom avec des paramètres différents", "La surcharge est réservée aux constructeurs", "La redéfinition est interdite en Java"]
    reponse: 1
    explication: "@Override demande au compilateur de vérifier qu'on redéfinit bien une méthode existante."
  - question: "Combien de classes une classe Java peut-elle étendre directement ?"
    choix: ["Une seule", "Deux", "Autant qu'on veut", "Aucune"]
    reponse: 0
    explication: "Java interdit l'héritage multiple de classes. Une classe peut en revanche implémenter plusieurs interfaces."
---

## L'idée

Dans une école, il y a des **étudiants** et des **enseignants**. Tous ont un nom, un e-mail, un téléphone. Mais un étudiant a un matricule et des notes, un enseignant a une spécialité et un salaire. Copier les champs communs dans deux classes, c'est dupliquer le code, et donc dupliquer les bogues.

L'**héritage** permet de définir une classe générale, `Personne`, puis des classes **spécialisées**, `Etudiant` et `Enseignant`, qui **héritent** de ses attributs et de ses méthodes, et ajoutent les leurs. Le **polymorphisme** permet ensuite de traiter tous ces objets de façon uniforme, chacun réagissant à sa manière.

## Hériter avec extends

```java
public class Personne {
    protected String nom;
    protected String email;

    public Personne(String nom, String email) {
        this.nom = nom;
        this.email = email;
    }

    public String getNom() {
        return nom;
    }

    public String presentation() {
        return "Je m'appelle " + nom;
    }
}

public class Etudiant extends Personne {
    private final String matricule;

    public Etudiant(String nom, String email, String matricule) {
        super(nom, email);          // initialise la partie Personne
        this.matricule = matricule;
    }

    @Override
    public String presentation() {
        return super.presentation() + ", étudiant, matricule " + matricule;
    }
}
```

- `Etudiant` **est une** `Personne` : il hérite de `nom`, `email`, `getNom()` et `presentation()`.
- `super(...)` appelle le constructeur parent ; c'est la **première** instruction du constructeur.
- `super.presentation()` appelle la version du parent.
- `protected` rend les attributs accessibles aux sous-classes. Beaucoup de développeurs préfèrent garder `private` et passer par des accesseurs, pour mieux protéger l'état.

En UML, l'héritage se dessine par une flèche à **triangle vide**, de l'enfant vers le parent.

## Redéfinir une méthode

La **redéfinition** (*override*) remplace, dans la sous-classe, une méthode héritée **de même signature** (même nom, mêmes paramètres). On ajoute toujours `@Override` : si l'on se trompe de nom ou de paramètres, le compilateur le signale.

À ne pas confondre avec la **surcharge** (*overload*) : plusieurs méthodes de même nom, avec des **paramètres différents**, dans la même classe (`afficher()` et `afficher(int largeur)`).

## Le polymorphisme

Une référence de type **parent** peut désigner un objet **enfant** :

```java
Personne p = new Etudiant("Awa Diop", "awa@exemple.sn", "ETU-01");
System.out.println(p.presentation());
// Je m'appelle Awa Diop, étudiant, matricule ETU-01
```

Java exécute la version de `presentation()` de la classe **réelle** de l'objet (`Etudiant`), même si la variable est déclarée `Personne`. C'est la **liaison dynamique**.

L'intérêt apparaît avec une collection d'objets différents :

```java
public abstract class Forme {
    public abstract double aire();
}

public class Cercle extends Forme {
    private final double rayon;
    public Cercle(double rayon) { this.rayon = rayon; }
    @Override
    public double aire() { return Math.PI * rayon * rayon; }
}

public class Rect extends Forme {
    private final double l, h;
    public Rect(double l, double h) { this.l = l; this.h = h; }
    @Override
    public double aire() { return l * h; }
}
```

```java
Forme[] formes = { new Cercle(1), new Rect(2, 3), new Cercle(2) };
double total = 0;
for (Forme f : formes) {
    total += f.aire();          // chaque forme calcule SA propre aire
}
```

La boucle ne connaît que `Forme`. Ajouter une nouvelle forme (`Triangle`) ne demande **aucune modification** de cette boucle : c'est le grand avantage du polymorphisme. Le mot `abstract` est expliqué dans le cours suivant.

## Le transtypage et instanceof

Avec une référence `Personne`, on n'a accès qu'aux méthodes de `Personne`. Pour utiliser une méthode propre à `Etudiant`, on teste le type réel :

```java
if (p instanceof Etudiant e) {
    System.out.println(e.presentation());
}
```

Cette écriture (Java 16 et plus) teste le type et crée la variable `e` de type `Etudiant` en une fois. Si l'on multiplie les `instanceof`, c'est souvent le signe qu'il manque une méthode redéfinie.

## La classe Object

Toute classe Java hérite, directement ou non, de `Object`. Elle fournit notamment :

| Méthode | Rôle | À redéfinir ? |
|---|---|---|
| `toString()` | description textuelle | presque toujours |
| `equals(Object o)` | égalité de contenu | quand deux objets distincts peuvent être « égaux » |
| `hashCode()` | code utilisé par les tables de hachage | **toujours avec equals** |

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Etudiant autre)) return false;
    return matricule.equals(autre.matricule);
}

@Override
public int hashCode() {
    return matricule.hashCode();
}
```

Deux étudiants sont égaux s'ils ont le même matricule. Si l'on redéfinit `equals` sans `hashCode`, les collections comme `HashSet` se comportent mal.

## final

- Une **classe** `final` ne peut pas être étendue (exemple : `String`).
- Une **méthode** `final` ne peut pas être redéfinie.
- Un **attribut** `final` ne peut pas changer après son initialisation.

## Héritage ou composition ?

L'héritage crée un lien **fort** entre classes : une modification du parent touche tous les enfants. Règle de conception célèbre : **« préférer la composition à l'héritage »**.

- **« Est un »** et le comportement est vraiment partagé : héritage (`Cercle` est une `Forme`).
- **« A un »** : composition, c'est-à-dire un attribut (`Voiture` a un `Moteur` ; `Etudiant` a une `Adresse`).

Java n'autorise l'héritage que d'**une seule** classe. Pour partager un contrat entre des classes sans lien de parenté, on utilise les **interfaces**.

## Démonstration

On modélise le personnel d'une école : `Personne`, puis `Etudiant` et `Enseignant`. On redéfinit `presentation()` dans chaque classe, on stocke tout le monde dans un tableau de `Personne`, et on affiche les présentations dans une seule boucle. Puis on ajoute une classe `Administratif` sans toucher à la boucle.

## Exercice guidé

1. Crée une classe `Employe` (nom, salaire de base) avec une méthode `salaire()` qui renvoie le salaire de base.
2. Crée `Manager extends Employe`, avec une prime : `salaire()` renvoie la base plus la prime.
3. Crée `Stagiaire extends Employe`, dont `salaire()` renvoie une gratification fixe de 75 000 FCFA.
4. Dans un tableau de `Employe`, calcule la masse salariale.

## Exercice autonome

1. Ajoute à la hiérarchie des formes une classe `Triangle` (base, hauteur), sans modifier la boucle de calcul de l'aire totale.
2. Redéfinis `toString()` dans chaque forme, et `equals()` dans `Cercle` (deux cercles de même rayon sont égaux).
3. Explique pourquoi `Carre extends Rect` peut poser problème si `Rect` a des méthodes `setLargeur` et `setHauteur`.

## Correction

Exercice guidé :

```java
public class Employe {
    protected final String nom;
    protected final double base;

    public Employe(String nom, double base) {
        this.nom = nom;
        this.base = base;
    }

    public double salaire() {
        return base;
    }
}

public class Manager extends Employe {
    private final double prime;

    public Manager(String nom, double base, double prime) {
        super(nom, base);
        this.prime = prime;
    }

    @Override
    public double salaire() {
        return base + prime;
    }
}

public class Stagiaire extends Employe {
    public Stagiaire(String nom) {
        super(nom, 0);
    }

    @Override
    public double salaire() {
        return 75000;
    }
}
```

La masse salariale se calcule par `for (Employe e : equipe) total += e.salaire();` : chaque objet applique sa propre règle.

Exercice autonome, question 3 : un carré doit garder ses deux côtés égaux. Si `Carre` hérite de `setLargeur` et de `setHauteur`, un code qui croit manipuler un `Rect` peut rendre le carré rectangulaire, ou être surpris si `setLargeur` modifie aussi la hauteur. La sous-classe ne respecte plus le contrat du parent : c'est le **principe de substitution de Liskov**, le « L » des principes SOLID. Solution : ne pas lier `Carre` et `Rect` par héritage, ou rendre les formes immuables.

## Pour aller plus loin

- Les principes **SOLID** de conception orientée objet.
- Les tutoriels Oracle, section « Inheritance » et « Polymorphism ».
- Cours suivant : « Java : interfaces et classes abstraites ».
