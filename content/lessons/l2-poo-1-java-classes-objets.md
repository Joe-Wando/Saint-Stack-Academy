---
slug: l2-poo-1-java-classes-objets
titre: "Java : classes et objets"
domaine: Programmation
duree: 150
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 1
prerequis_cours: [l1-algo-2-structures, l1-algo-6-introduction-uml]
visibilite: public
objectifs:
  - Expliquer les idées de la programmation orientée objet (objet, classe, état, comportement)
  - Installer un JDK, compiler et exécuter un programme Java
  - Écrire une classe avec attributs, constructeurs, méthodes et accesseurs
  - Appliquer l'encapsulation (private, public, validation des données)
  - Distinguer membres d'instance et membres statiques, et comprendre les références
prerequis:
  - Programmation en C (fonctions, structures)
  - Lire un diagramme de classes UML
referentiels:
  - Oracle, « The Java Tutorials » (Learning the Java Language)
  - Oracle Certified Foundations Associate Java (1Z0-811), et Java SE 21 Developer (1Z0-830)
  - ACM/IEEE CS2023, domaine « Foundations of Programming Languages » (programmation orientée objet)
quiz:
  - question: "Quelle est la différence entre une classe et un objet ?"
    choix: ["Il n'y en a aucune", "La classe est le modèle ; l'objet est une instance concrète créée à partir de ce modèle avec new", "L'objet est le modèle et la classe l'instance", "Une classe ne contient que des méthodes"]
    reponse: 1
    explication: "La classe Etudiant décrit tous les étudiants ; new Etudiant(\"Awa\") crée un étudiant précis."
  - question: "À quoi sert un constructeur ?"
    choix: ["À détruire l'objet", "À initialiser un nouvel objet au moment de sa création", "À afficher l'objet", "À comparer deux objets"]
    reponse: 1
    explication: "Il porte le nom de la classe, n'a pas de type de retour, et est appelé par new."
  - question: "Pourquoi déclarer les attributs private ?"
    choix: ["Pour accélérer le programme", "Pour protéger l'état de l'objet : on ne peut le modifier qu'à travers des méthodes qui vérifient les valeurs", "Parce que public est interdit", "Pour économiser la mémoire"]
    reponse: 1
    explication: "C'est l'encapsulation : un solde de compte ne doit pas pouvoir devenir négatif par une simple affectation."
  - question: "Après Compte a = new Compte(); Compte b = a; b.deposer(100);, que vaut le solde de a ?"
    choix: ["0", "100", "200", "Une erreur"]
    reponse: 1
    explication: "a et b sont deux références vers le même objet. Il n'y a qu'un seul compte."
  - question: "Que signifie static devant un attribut ?"
    choix: ["Qu'il ne change jamais", "Qu'il appartient à la classe et est partagé par tous les objets, au lieu d'exister dans chaque objet", "Qu'il est privé", "Qu'il est supprimé à la fin"]
    reponse: 1
    explication: "Un compteur du nombre d'étudiants créés est typiquement static. Pour une constante, on écrit static final."
---

## L'idée

En C, on séparait les **données** (les structures) et les **traitements** (les fonctions). La **programmation orientée objet** (POO) les réunit : un **objet** regroupe des **données** qui décrivent son **état**, et des **méthodes** qui décrivent son **comportement**.

Un compte bancaire a un état (titulaire, solde) et des comportements (déposer, retirer, consulter). Dans un programme orienté objet, c'est le compte lui-même qui sait comment déposer et qui refuse un retrait impossible. Cette façon de penser correspond mieux au monde réel, et rend les grands programmes plus faciles à organiser, à réutiliser et à faire évoluer.

**Java**, créé en 1995, est l'un des langages orientés objet les plus utilisés au monde : applications d'entreprise, banques, Android, systèmes big data comme Kafka ou Hadoop.

## Installer Java et le premier programme

Installe un **JDK** (*Java Development Kit*) récent, par exemple une version LTS (21 ou plus récente) d'Eclipse Temurin (adoptium.net). Vérifie avec `java -version` et `javac -version`. Comme éditeur : IntelliJ IDEA Community, ou VS Code avec l'extension Java.

```java
public class Bonjour {
    public static void main(String[] args) {
        System.out.println("Bonjour, Dakar !");
    }
}
```

```bash
javac Bonjour.java    # compile en bytecode : Bonjour.class
java Bonjour          # la machine virtuelle Java (JVM) exécute le bytecode
```

Le fichier doit porter le **même nom que la classe publique**. Java compile vers un **bytecode** exécuté par la **JVM** : le même fichier `.class` tourne sur Windows, Linux et macOS.

Ce qui change par rapport au C : les types de base sont proches (`int`, `double`, `char`, `boolean`), mais les chaînes sont des objets `String`, la mémoire est libérée automatiquement par le **ramasse-miettes**, et il n'y a pas de pointeurs manipulables.

## Définir une classe

```java
public class Compte {
    // attributs : l'état
    private String titulaire;
    private double solde;

    // constructeur : l'initialisation
    public Compte(String titulaire, double soldeInitial) {
        this.titulaire = titulaire;
        this.solde = soldeInitial;
    }

    // méthodes : le comportement
    public void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Montant invalide");
        }
        solde += montant;
    }

    public boolean retirer(double montant) {
        if (montant <= 0 || montant > solde) {
            return false;
        }
        solde -= montant;
        return true;
    }

    public double getSolde() {
        return solde;
    }

    public String getTitulaire() {
        return titulaire;
    }
}
```

| Élément | Rôle |
|---|---|
| Attributs | Les données de chaque objet |
| Constructeur | Même nom que la classe, pas de type de retour, appelé par `new` |
| `this` | L'objet courant : `this.titulaire` désigne l'attribut, `titulaire` le paramètre |
| Méthodes | Les actions possibles sur l'objet |

## Créer et utiliser des objets

```java
public class Banque {
    public static void main(String[] args) {
        Compte c1 = new Compte("Awa Diop", 50000);
        Compte c2 = new Compte("Moussa Sarr", 0);

        c1.deposer(25000);
        boolean ok = c2.retirer(10000);

        System.out.println(c1.getTitulaire() + " : " + c1.getSolde());  // 75000.0
        System.out.println("Retrait possible ? " + ok);                  // false
    }
}
```

Chaque objet a **son propre état** : `c1` et `c2` ont chacun leur solde. On appelle une méthode avec le **point** : `objet.methode(arguments)`.

## L'encapsulation

Les attributs sont `private` : on ne peut pas écrire `c1.solde = -1000000;` depuis l'extérieur de la classe. Le compilateur le refuse. On passe obligatoirement par des **méthodes publiques** qui **vérifient** les règles : c'est l'**encapsulation**.

| Modificateur | Accessible depuis |
|---|---|
| `private` | la classe elle-même seulement |
| (aucun) | les classes du même paquet |
| `protected` | le paquet et les sous-classes |
| `public` | partout |

Règle par défaut : **attributs privés, méthodes publiques** quand elles font partie du service rendu.

Les méthodes `getX()` sont des **accesseurs** (*getters*) ; les méthodes `setX(...)` sont des **mutateurs** (*setters*). On n'écrit un mutateur que si la modification a du sens : un compte n'a pas de `setSolde`, on passe par `deposer` et `retirer`.

## Plusieurs constructeurs et toString

On peut définir plusieurs constructeurs avec des paramètres différents : c'est la **surcharge**.

```java
public Compte(String titulaire) {
    this(titulaire, 0);          // appelle l'autre constructeur
}

@Override
public String toString() {
    return titulaire + " (" + solde + " FCFA)";
}
```

`toString()` renvoie une description textuelle de l'objet ; elle est utilisée automatiquement par `System.out.println(c1)`. L'annotation `@Override` indique qu'on redéfinit une méthode héritée (on y reviendra avec l'héritage).

## Les références

Une variable de type objet contient une **référence** vers l'objet, un peu comme un pointeur en C, mais sans arithmétique possible.

```java
Compte a = new Compte("Fatou", 0);
Compte b = a;          // b désigne le MÊME objet
b.deposer(100);
System.out.println(a.getSolde());   // 100.0
```

Conséquences :

- `==` compare les **références** (est-ce le même objet ?). Pour comparer le contenu, on utilise `equals`, notamment pour les `String` : `nom.equals("Awa")`.
- Une référence qui ne désigne aucun objet vaut `null`. Appeler une méthode sur `null` provoque une `NullPointerException`.

## Les membres statiques

Un attribut ou une méthode `static` appartient à la **classe**, pas à chaque objet.

```java
public class Etudiant {
    private static int nombreCrees = 0;      // partagé par tous
    public static final double NOTE_MAX = 20; // constante

    private final String matricule;
    private final String nom;

    public Etudiant(String nom) {
        nombreCrees++;
        this.matricule = "ETU-" + nombreCrees;
        this.nom = nom;
    }

    public static int getNombreCrees() {
        return nombreCrees;
    }
}
```

On l'utilise par le nom de la classe : `Etudiant.getNombreCrees()`, `Math.sqrt(2)`. `main` est `static` car la JVM l'appelle avant qu'aucun objet n'existe. `final` interdit de modifier la valeur après l'initialisation.

## Démonstration

On traduit en Java la classe `Etudiant` du diagramme UML du semestre 2 : attributs privés, constructeur, méthode `ajouterNote(double)`, méthode `moyenne()`, et `toString()`. On crée trois étudiants dans `main`, puis on tente d'écrire directement dans un attribut privé pour lire l'erreur du compilateur.

## Exercice guidé

Écris une classe `Rectangle` :

1. attributs privés `largeur` et `hauteur` (double) ;
2. un constructeur qui refuse les valeurs négatives ou nulles (lève une `IllegalArgumentException`) ;
3. les méthodes `aire()`, `perimetre()` et `estCarre()` ;
4. une méthode `toString()`.

Teste-la dans un `main`.

## Exercice autonome

1. Écris une classe `Produit` (code, libellé, prix, stock) avec une méthode `vendre(int quantite)` qui refuse une vente supérieure au stock, et une méthode `reapprovisionner(int quantite)`.
2. Ajoute un compteur statique du nombre de produits créés.
3. Dans `main`, crée un tableau de 3 produits, vends-en, et affiche la valeur totale du stock.

## Correction

Exercice guidé :

```java
public class Rectangle {
    private final double largeur;
    private final double hauteur;

    public Rectangle(double largeur, double hauteur) {
        if (largeur <= 0 || hauteur <= 0) {
            throw new IllegalArgumentException("Dimensions invalides");
        }
        this.largeur = largeur;
        this.hauteur = hauteur;
    }

    public double aire() {
        return largeur * hauteur;
    }

    public double perimetre() {
        return 2 * (largeur + hauteur);
    }

    public boolean estCarre() {
        return largeur == hauteur;
    }

    @Override
    public String toString() {
        return "Rectangle " + largeur + " x " + hauteur;
    }

    public static void main(String[] args) {
        Rectangle r = new Rectangle(4, 3);
        System.out.println(r + " : aire " + r.aire() + ", périmètre " + r.perimetre());
    }
}
```

Exercice autonome, extrait :

```java
public class Produit {
    private static int nombreProduits = 0;
    private final String code;
    private final String libelle;
    private final int prix;
    private int stock;

    public Produit(String code, String libelle, int prix, int stock) {
        this.code = code;
        this.libelle = libelle;
        this.prix = prix;
        this.stock = stock;
        nombreProduits++;
    }

    public boolean vendre(int quantite) {
        if (quantite <= 0 || quantite > stock) {
            return false;
        }
        stock -= quantite;
        return true;
    }

    public void reapprovisionner(int quantite) {
        if (quantite > 0) {
            stock += quantite;
        }
    }

    public int valeurStock() {
        return prix * stock;
    }

    public static int getNombreProduits() {
        return nombreProduits;
    }
}
```

Le stock n'est modifiable que par `vendre` et `reapprovisionner` : il ne peut jamais devenir négatif.

## Pour aller plus loin

- Depuis Java 16, les **records** créent en une ligne des classes de données immuables : `record Point(int x, int y) {}`.
- Les tutoriels officiels d'Oracle, section « Classes and Objects ».
- La certification Oracle Certified Foundations Associate Java valide ces bases.
- Cours suivant : « Java : héritage et polymorphisme ».
