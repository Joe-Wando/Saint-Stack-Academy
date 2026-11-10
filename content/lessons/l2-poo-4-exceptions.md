---
slug: l2-poo-4-exceptions
titre: "Java : les exceptions"
domaine: Programmation
duree: 120
difficulte: opérationnel
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 4
prerequis_cours: [l2-poo-3-interfaces-abstraites]
visibilite: public
objectifs:
  - Expliquer ce qu'est une exception et lire une trace de pile (stack trace)
  - Capturer une exception avec try, catch et finally
  - Lever une exception avec throw, et la déclarer avec throws
  - Distinguer exceptions vérifiées et non vérifiées
  - Créer ses propres exceptions et libérer les ressources avec try-with-resources
prerequis:
  - Classes, héritage et interfaces en Java
referentiels:
  - Oracle, « The Java Tutorials », section « Exceptions »
  - Oracle Certified Professional Java SE 21 Developer (1Z0-830), objectifs sur les exceptions
  - SEI CERT Oracle Coding Standard for Java, règles ERR
quiz:
  - question: "Que se passe-t-il si une exception n'est capturée nulle part ?"
    choix: ["Elle est ignorée", "Elle remonte la pile d'appels jusqu'à main, puis le programme s'arrête en affichant la trace de pile", "Le programme redémarre", "Elle devient un avertissement"]
    reponse: 1
    explication: "La trace indique le type d'exception, le message, et la suite des appels avec les numéros de ligne."
  - question: "Quand le bloc finally s'exécute-t-il ?"
    choix: ["Seulement s'il n'y a pas d'exception", "Seulement s'il y a une exception", "Toujours, qu'une exception ait été levée ou non", "Jamais"]
    reponse: 2
    explication: "On l'utilise pour libérer une ressource. try-with-resources le fait automatiquement."
  - question: "Quelle exception est vérifiée (checked) ?"
    choix: ["NullPointerException", "IOException", "ArithmeticException", "IllegalArgumentException"]
    reponse: 1
    explication: "Les exceptions vérifiées (hors RuntimeException) doivent être capturées ou déclarées avec throws ; le compilateur le contrôle."
  - question: "Pourquoi un catch (Exception e) {} vide est-il une mauvaise pratique ?"
    choix: ["Il est trop lent", "Il cache toutes les erreurs : le programme continue dans un état incohérent, sans aucune trace du problème", "Il est interdit par le compilateur", "Il consomme de la mémoire"]
    reponse: 1
    explication: "On capture seulement ce qu'on sait traiter, et on journalise ou on informe l'utilisateur."
  - question: "Que garantit try (BufferedReader r = ...) { ... } ?"
    choix: ["Que le fichier existe", "Que la ressource est fermée automatiquement à la fin du bloc, même en cas d'exception", "Que la lecture est plus rapide", "Qu'aucune exception ne sera levée"]
    reponse: 1
    explication: "La ressource doit implémenter AutoCloseable. C'est la façon recommandée de gérer fichiers et connexions."
---

## L'idée

En C, une fonction signalait une erreur en renvoyant une valeur spéciale (`-1`, `NULL`, `0`), que l'appelant oubliait souvent de tester. Le programme continuait alors avec des données fausses.

En Java, une erreur se signale par une **exception** : un objet qui décrit le problème, et qui **interrompt** le déroulement normal. Elle remonte la pile des appels jusqu'à trouver un bloc capable de la **traiter**. Si personne ne la traite, le programme s'arrête avec un message précis, au lieu de continuer silencieusement dans un état incohérent.

## Lire une trace de pile

```text
Exception in thread "main" java.lang.ArithmeticException: / by zero
    at Notes.moyenne(Notes.java:12)
    at Notes.main(Notes.java:5)
```

- **Le type** : `ArithmeticException` ;
- **le message** : `/ by zero` ;
- **le chemin** : l'erreur s'est produite dans `moyenne`, à la ligne 12, appelée depuis `main`, à la ligne 5.

On lit la trace **de haut en bas** et on cherche la première ligne qui concerne **notre** code.

## Capturer avec try et catch

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
System.out.print("Âge : ");
try {
    int age = Integer.parseInt(sc.nextLine());
    System.out.println("Dans 10 ans : " + (age + 10));
} catch (NumberFormatException e) {
    System.out.println("Ce n'est pas un nombre entier.");
}
```

- Le bloc `try` contient le code qui **peut** échouer.
- Le bloc `catch` s'exécute **seulement** si une exception de ce type survient ; le reste du `try` est alors abandonné.
- On peut enchaîner plusieurs `catch`, du plus **précis** au plus **général**, ou regrouper : `catch (NumberFormatException | NullPointerException e)`.

Le bloc `finally` s'exécute **toujours**, qu'il y ait eu une exception ou non. Il sert à libérer une ressource.

## La hiérarchie des exceptions

```text
Throwable
 ├── Error                      erreurs graves de la JVM (OutOfMemoryError) : on ne les capture pas
 └── Exception
      ├── IOException, SQLException...      exceptions VÉRIFIÉES
      └── RuntimeException                  exceptions NON VÉRIFIÉES
           ├── NullPointerException
           ├── ArithmeticException
           ├── ArrayIndexOutOfBoundsException
           ├── IllegalArgumentException
           │    └── NumberFormatException
           └── IllegalStateException
```

- Les exceptions **vérifiées** (*checked*) représentent des problèmes **extérieurs** et prévisibles : fichier absent, réseau coupé. Le compilateur **oblige** à les capturer ou à les déclarer.
- Les exceptions **non vérifiées** (*unchecked*, sous-classes de `RuntimeException`) signalent en général une **erreur de programmation** : un objet `null`, un indice hors du tableau. On les corrige dans le code plutôt que de les capturer.

## Lever une exception avec throw

Une méthode qui reçoit des données invalides doit **refuser** de continuer :

```java
public void retirer(double montant) {
    if (montant <= 0) {
        throw new IllegalArgumentException("Le montant doit être positif : " + montant);
    }
    if (montant > solde) {
        throw new IllegalStateException("Solde insuffisant");
    }
    solde -= montant;
}
```

Un bon message d'exception indique **ce qui ne va pas**, et la **valeur reçue**.

## Déclarer avec throws

Si une méthode peut provoquer une exception vérifiée qu'elle ne sait pas traiter, elle la **déclare**, et c'est l'appelant qui décidera :

```java
public String lirePremiereLigne(String chemin) throws IOException {
    try (BufferedReader r = Files.newBufferedReader(Path.of(chemin))) {
        return r.readLine();
    }
}
```

Règle : capture une exception là où tu peux **faire quelque chose d'utile** (afficher un message clair, réessayer, utiliser une valeur par défaut). Sinon, laisse-la remonter.

## try-with-resources

Les fichiers, les connexions réseau et les connexions à une base de données doivent être **fermés** après usage. La syntaxe `try (...)` les ferme **automatiquement**, même en cas d'exception :

```java
try (BufferedReader r = Files.newBufferedReader(Path.of("notes.csv"))) {
    String ligne;
    while ((ligne = r.readLine()) != null) {
        System.out.println(ligne);
    }
} catch (IOException e) {
    System.out.println("Lecture impossible : " + e.getMessage());
}
```

C'est l'équivalent sûr du `fclose` du C, impossible à oublier.

## Créer ses propres exceptions

Une exception métier rend le code plus lisible :

```java
public class SoldeInsuffisantException extends Exception {
    private final double manque;

    public SoldeInsuffisantException(double manque) {
        super("Solde insuffisant : il manque " + manque + " FCFA");
        this.manque = manque;
    }

    public double getManque() {
        return manque;
    }
}
```

Elle hérite de `Exception` (donc vérifiée : l'appelant est obligé de la traiter) ou de `RuntimeException` (non vérifiée). On la lève avec `throw new SoldeInsuffisantException(montant - solde);`.

## Les bonnes pratiques

- **Ne jamais écrire de `catch` vide.** Au minimum, journaliser l'erreur.
- **Capturer le type le plus précis possible**, pas `Exception` partout.
- **Ne pas utiliser les exceptions pour le déroulement normal** du programme (par exemple pour sortir d'une boucle).
- **Valider tôt** : lever une exception dès l'entrée d'une méthode si les paramètres sont invalides.
- **Ne pas afficher les traces de pile aux utilisateurs** d'une application web : elles révèlent des informations internes. On les journalise côté serveur, et on affiche un message simple.

## Démonstration

On lit un fichier CSV de notes ligne par ligne. Trois problèmes peuvent survenir : le fichier n'existe pas (`NoSuchFileException`, une `IOException`), une note n'est pas un nombre (`NumberFormatException`), ou le fichier est vide (on lève une `IllegalStateException` au moment de calculer la moyenne). On traite chacun avec un message adapté, et on vérifie que le fichier est toujours fermé.

## Exercice guidé

1. Écris une méthode `int lireEntier(Scanner sc)` qui redemande une saisie tant que l'utilisateur ne tape pas un entier valide.
2. Écris une méthode `double diviser(double a, double b)` qui lève une `IllegalArgumentException` si b vaut 0.
3. Provoque volontairement une `ArrayIndexOutOfBoundsException` et lis la trace de pile.

## Exercice autonome

1. Crée l'exception vérifiée `SoldeInsuffisantException`, et modifie la classe `Compte` pour que `retirer` la lève.
2. Dans `main`, effectue un retrait trop important et affiche le montant manquant.
3. Écris une méthode qui lit un fichier de comptes (titulaire;solde) avec try-with-resources, ignore les lignes mal formées en affichant un avertissement, et renvoie la liste des comptes valides.

## Correction

Exercice guidé, question 1 :

```java
public static int lireEntier(Scanner sc) {
    while (true) {
        System.out.print("Entier : ");
        String saisie = sc.nextLine();
        try {
            return Integer.parseInt(saisie.trim());
        } catch (NumberFormatException e) {
            System.out.println("« " + saisie + " » n'est pas un entier, recommence.");
        }
    }
}
```

Exercice autonome, questions 1 et 2 :

```java
public void retirer(double montant) throws SoldeInsuffisantException {
    if (montant <= 0) {
        throw new IllegalArgumentException("Montant invalide : " + montant);
    }
    if (montant > solde) {
        throw new SoldeInsuffisantException(montant - solde);
    }
    solde -= montant;
}
```

```java
try {
    compte.retirer(80000);
} catch (SoldeInsuffisantException e) {
    System.out.println(e.getMessage());
    System.out.println("Montant manquant : " + e.getManque());
}
```

Le montant invalide (négatif) est une **erreur de programmation** de l'appelant : exception non vérifiée. Le solde insuffisant est une **situation métier normale**, que l'appelant doit prévoir : exception vérifiée.

## Pour aller plus loin

- Les tutoriels Oracle, section « Lesson: Exceptions ».
- Les bibliothèques de journalisation (SLF4J, Logback) remplacent `System.out.println` pour tracer les erreurs en production.
- Cours suivant : « Java : les collections ».
