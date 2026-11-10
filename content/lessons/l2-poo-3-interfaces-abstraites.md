---
slug: l2-poo-3-interfaces-abstraites
titre: "Java : interfaces et classes abstraites"
domaine: Programmation
duree: 120
difficulte: opérationnel
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 3
prerequis_cours: [l2-poo-2-heritage-polymorphisme]
visibilite: public
objectifs:
  - Déclarer une classe abstraite et des méthodes abstraites
  - Déclarer et implémenter une interface, y compris plusieurs à la fois
  - Choisir entre classe abstraite et interface
  - Utiliser les interfaces standard Comparable et Comparator pour trier
  - Programmer « vers une interface » pour réduire le couplage
prerequis:
  - Héritage et polymorphisme en Java
referentiels:
  - Oracle, « The Java Tutorials », sections « Interfaces » et « Abstract Methods and Classes »
  - Oracle Certified Professional Java SE 21 Developer (1Z0-830)
  - ACM/IEEE CS2023, domaine « Software Engineering » (conception, abstraction)
quiz:
  - question: "Peut-on écrire new Forme() si Forme est une classe abstraite ?"
    choix: ["Oui", "Non : une classe abstraite ne peut pas être instanciée, seules ses sous-classes concrètes le peuvent", "Seulement dans main", "Seulement si elle n'a pas d'attributs"]
    reponse: 1
    explication: "Une forme « en général » n'a pas d'aire calculable : on crée des cercles ou des rectangles."
  - question: "Une classe Java peut-elle implémenter plusieurs interfaces ?"
    choix: ["Non, une seule", "Oui, par exemple class Smartphone implements Telephone, AppareilPhoto", "Seulement deux", "Seulement si elle est abstraite"]
    reponse: 1
    explication: "L'héritage de classes est simple, mais une classe peut signer autant de contrats (interfaces) que nécessaire."
  - question: "Que doit renvoyer compareTo(autre) quand l'objet courant doit être placé avant autre ?"
    choix: ["Un nombre positif", "Un nombre négatif", "Zéro", "true"]
    reponse: 1
    explication: "Négatif : avant ; zéro : équivalent ; positif : après. Integer.compare(a, b) calcule cela sans risque de débordement."
  - question: "Quand préférer une classe abstraite à une interface ?"
    choix: ["Jamais", "Quand des classes très proches partagent de l'état (attributs) et du code commun", "Quand on veut l'héritage multiple", "Quand il n'y a aucune méthode"]
    reponse: 1
    explication: "L'interface définit un contrat ; la classe abstraite fournit en plus une base commune avec attributs et constructeur."
  - question: "Que signifie « programmer vers une interface » ?"
    choix: ["Écrire des interfaces graphiques", "Déclarer les variables et paramètres avec le type de l'interface (List) plutôt que d'une implémentation (ArrayList)", "N'utiliser que des interfaces", "Éviter les classes"]
    reponse: 1
    explication: "On peut alors changer d'implémentation sans modifier le code qui l'utilise."
---

## L'idée

Une **prise électrique** est un contrat : tout appareil qui a la bonne fiche peut s'y brancher, qu'il s'agisse d'une lampe, d'un chargeur ou d'un ordinateur. La prise ne sait pas ce qu'est l'appareil ; elle sait seulement qu'il respecte le contrat.

En Java, ce contrat s'appelle une **interface** : une liste de méthodes que toute classe qui l'**implémente** s'engage à fournir. La **classe abstraite**, elle, est un modèle **incomplet** : elle donne une base commune, mais laisse certaines méthodes à écrire par les sous-classes. Ces deux outils permettent d'écrire du code général, qui fonctionne avec des classes qui n'existent pas encore.

## Les classes abstraites

```java
public abstract class Paiement {
    protected final double montant;

    protected Paiement(double montant) {
        this.montant = montant;
    }

    public abstract boolean effectuer();      // pas de corps : à définir

    public String recu() {                    // méthode concrète partagée
        return "Paiement de " + montant + " FCFA";
    }
}

public class PaiementMobile extends Paiement {
    private final String numero;

    public PaiementMobile(double montant, String numero) {
        super(montant);
        this.numero = numero;
    }

    @Override
    public boolean effectuer() {
        System.out.println("Demande de paiement envoyée au " + numero);
        return true;
    }
}
```

- Une classe `abstract` **ne peut pas être instanciée** : `new Paiement(1000)` est refusé.
- Une méthode `abstract` n'a pas de corps ; toute sous-classe **concrète** doit la définir.
- Une classe abstraite peut avoir des **attributs**, un **constructeur** et des méthodes **concrètes**.

## Les interfaces

```java
public interface Notifiable {
    void notifier(String message);              // implicitement public et abstract

    default void notifierUrgent(String message) {
        notifier("[URGENT] " + message);        // méthode par défaut (Java 8 et plus)
    }
}

public class Etudiant implements Notifiable {
    private final String email;

    public Etudiant(String email) {
        this.email = email;
    }

    @Override
    public void notifier(String message) {
        System.out.println("E-mail à " + email + " : " + message);
    }
}

public class Groupe implements Notifiable {
    private final String nom;

    public Groupe(String nom) {
        this.nom = nom;
    }

    @Override
    public void notifier(String message) {
        System.out.println("Message au groupe " + nom + " : " + message);
    }
}
```

`Etudiant` et `Groupe` n'ont aucun lien de parenté, mais tous deux sont `Notifiable`. Un service de notification peut donc les traiter de la même façon :

```java
Notifiable[] destinataires = { new Etudiant("awa@exemple.sn"), new Groupe("L2 Info") };
for (Notifiable n : destinataires) {
    n.notifier("Le cours de Java est déplacé en salle 12");
}
```

Une interface ne contient pas d'attributs d'instance (seulement des constantes). Une classe peut **implémenter plusieurs interfaces** : `class Smartphone implements Telephone, AppareilPhoto, Notifiable`.

## Classe abstraite ou interface ?

| | Classe abstraite | Interface |
|---|---|---|
| Relation | « est un » (même famille) | « sait faire » (capacité) |
| Attributs d'instance | oui | non |
| Constructeur | oui | non |
| Héritage | une seule classe parente | plusieurs interfaces possibles |
| Exemple | `Paiement`, `Forme`, `Animal` | `Comparable`, `Notifiable`, `Runnable` |

En pratique, on commence souvent par une **interface** ; on ajoute une classe abstraite quand plusieurs implémentations partagent beaucoup de code.

## Trier avec Comparable

L'interface standard `Comparable<T>` définit l'**ordre naturel** d'une classe avec une seule méthode, `compareTo` :

```java
public class Etudiant implements Comparable<Etudiant> {
    private final String nom;
    private final double moyenne;

    public Etudiant(String nom, double moyenne) {
        this.nom = nom;
        this.moyenne = moyenne;
    }

    public String getNom() { return nom; }
    public double getMoyenne() { return moyenne; }

    @Override
    public int compareTo(Etudiant autre) {
        return this.nom.compareTo(autre.nom);    // ordre alphabétique
    }
}
```

`compareTo` renvoie un nombre **négatif** si l'objet courant vient avant, **zéro** s'ils sont équivalents, **positif** s'il vient après. Ensuite, `Arrays.sort(tableau)` ou `Collections.sort(liste)` trient automatiquement.

## Trier autrement avec Comparator

Pour trier selon un autre critère, sans toucher à la classe, on utilise un `Comparator` :

```java
import java.util.Comparator;

Comparator<Etudiant> parMoyenneDecroissante =
        Comparator.comparingDouble(Etudiant::getMoyenne).reversed();

liste.sort(parMoyenneDecroissante);
liste.sort(Comparator.comparing(Etudiant::getNom));  // par nom
```

`Etudiant::getMoyenne` est une **référence de méthode** : elle désigne la méthode sans l'appeler. Une interface qui n'a qu'une méthode abstraite, comme `Comparator`, s'appelle une **interface fonctionnelle** : on peut aussi la fournir sous forme de **lambda**, `(a, b) -> Double.compare(a.getMoyenne(), b.getMoyenne())`.

## Programmer vers une interface

On déclare les variables et les paramètres avec le type **le plus général** utile :

```java
List<Etudiant> promo = new ArrayList<>();      // et non ArrayList<Etudiant> promo
```

Le reste du code ne dépend que de `List`. Si l'on remplace demain `ArrayList` par `LinkedList`, une seule ligne change. Le même principe permet, dans une application, de remplacer une base de données ou un service de paiement par un autre, ou par une version de **test**. C'est le « D » des principes SOLID : dépendre des abstractions, pas des implémentations.

## Démonstration

On construit une caisse qui accepte plusieurs moyens de paiement : `PaiementMobile`, `PaiementCarte`, `PaiementEspeces`, tous sous-classes de `Paiement`. La méthode `encaisser(Paiement p)` ne connaît que la classe abstraite. On ajoute ensuite un nouveau moyen de paiement sans modifier `encaisser`.

Puis on trie une liste d'étudiants par nom (ordre naturel), puis par moyenne décroissante (Comparator).

## Exercice guidé

1. Crée une interface `Forme` avec les méthodes `aire()` et `perimetre()`.
2. Implémente-la dans `Cercle` et `Carre`.
3. Ajoute une méthode `default String description()` qui renvoie l'aire et le périmètre formatés.
4. Trie un tableau de formes par aire croissante avec un `Comparator`.

## Exercice autonome

1. Crée une interface `Stockage` avec `void sauvegarder(String cle, String valeur)` et `String charger(String cle)`.
2. Implémente `StockageMemoire` (avec une `HashMap`), puis `StockageFichier` (un fichier par clé).
3. Écris une classe `Preferences` qui reçoit un `Stockage` dans son constructeur. Montre qu'on peut passer de l'un à l'autre sans modifier `Preferences`.

## Correction

Exercice guidé :

```java
import java.util.Arrays;
import java.util.Comparator;

interface Forme {
    double aire();
    double perimetre();

    default String description() {
        return String.format("aire %.2f, périmètre %.2f", aire(), perimetre());
    }
}

class Cercle implements Forme {
    private final double r;
    Cercle(double r) { this.r = r; }
    public double aire() { return Math.PI * r * r; }
    public double perimetre() { return 2 * Math.PI * r; }
}

class Carre implements Forme {
    private final double c;
    Carre(double c) { this.c = c; }
    public double aire() { return c * c; }
    public double perimetre() { return 4 * c; }
}

public class Formes {
    public static void main(String[] args) {
        Forme[] formes = { new Carre(3), new Cercle(1), new Carre(1) };
        Arrays.sort(formes, Comparator.comparingDouble(Forme::aire));
        for (Forme f : formes) {
            System.out.println(f.description());
        }
    }
}
```

L'ordre obtenu est : carré de côté 1 (aire 1), cercle de rayon 1 (aire 3,14), carré de côté 3 (aire 9).

Exercice autonome, question 3 : `Preferences` déclare un attribut `private final Stockage stockage;` reçu dans son constructeur. On écrit `new Preferences(new StockageMemoire())` pour les tests, et `new Preferences(new StockageFichier("prefs"))` en production. C'est l'**injection de dépendances**, que tu retrouveras dans NestJS et Spring.

## Pour aller plus loin

- Les tutoriels Oracle, section « Interfaces and Inheritance ».
- Les **interfaces scellées** (`sealed`, Java 17) limitent les classes autorisées à implémenter une interface.
- Cours suivant : « Java : les exceptions ».
