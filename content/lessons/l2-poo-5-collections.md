---
slug: l2-poo-5-collections
titre: "Java : les collections et les génériques"
domaine: Programmation
duree: 150
difficulte: opérationnel
licence:
  - { niveau: L2, semestre: S3, ue: "Langages et programmation orientée objet" }
ordre: 5
prerequis_cours: [l2-poo-4-exceptions]
visibilite: public
objectifs:
  - Expliquer le rôle des génériques (List<String>) et des classes enveloppes (Integer)
  - Utiliser List (ArrayList), Set (HashSet, TreeSet) et Map (HashMap, TreeMap)
  - Choisir la collection adaptée à un besoin, selon ses performances
  - Parcourir, trier et filtrer une collection
  - Écrire des traitements simples avec les streams (filter, map, collect)
prerequis:
  - Interfaces, Comparable et Comparator en Java
  - Tableaux, listes chaînées, piles et files
referentiels:
  - Oracle, « The Java Tutorials », section « Collections »
  - Oracle Certified Professional Java SE 21 Developer (1Z0-830), objectifs sur les collections et les streams
  - ACM/IEEE CS2023, domaine « Algorithmic Foundations » (structures de données)
quiz:
  - question: "Quelle collection choisir pour éliminer automatiquement les doublons ?"
    choix: ["ArrayList", "Un Set, par exemple HashSet", "Un tableau", "LinkedList"]
    reponse: 1
    explication: "Un Set ne contient jamais deux éléments égaux au sens de equals."
  - question: "Quelle collection associe une clé (un matricule) à une valeur (un étudiant) ?"
    choix: ["List", "Set", "Map", "Queue"]
    reponse: 2
    explication: "map.get(matricule) retrouve l'étudiant en temps quasi constant avec une HashMap."
  - question: "Pourquoi écrit-on List<Integer> et non List<int> ?"
    choix: ["Par convention", "Les génériques n'acceptent que des objets : on utilise la classe enveloppe Integer, et Java convertit automatiquement", "int est trop petit", "C'est une erreur"]
    reponse: 1
    explication: "C'est l'autoboxing : liste.add(5) ajoute Integer.valueOf(5)."
  - question: "Que se passe-t-il si l'on supprime des éléments d'une ArrayList pendant une boucle for-each ?"
    choix: ["Rien de spécial", "Une ConcurrentModificationException est levée", "Les éléments sont déplacés à la fin", "La liste est triée"]
    reponse: 1
    explication: "On utilise plutôt liste.removeIf(condition), ou un Iterator et sa méthode remove()."
  - question: "Que renvoie promo.stream().filter(e -> e.getMoyenne() >= 10).map(Etudiant::getNom).toList() ?"
    choix: ["Le nombre d'admis", "La liste des noms des étudiants qui ont au moins 10", "La moyenne de la promotion", "Une erreur"]
    reponse: 1
    explication: "filter garde les éléments qui vérifient la condition, map transforme chaque élément, toList rassemble le résultat."
---

## L'idée

Au semestre 2, tu as programmé à la main des tableaux dynamiques, des listes chaînées, des piles et des files. Comprendre leur fonctionnement était essentiel. Mais dans un vrai projet, on ne les réécrit pas : Java fournit le **framework des collections**, un ensemble de structures de données testées, optimisées et interchangeables.

Bien choisir sa collection change tout : chercher un élément dans une liste de 100 000 éléments demande jusqu'à 100 000 comparaisons, alors qu'une table de hachage le retrouve presque immédiatement.

## Les génériques

Une collection précise le **type** de ses éléments entre chevrons :

```java
List<String> noms = new ArrayList<>();
noms.add("Awa");
noms.add(42);          // refusé à la compilation : 42 n'est pas un String
String premier = noms.get(0);   // pas de conversion nécessaire
```

Les génériques n'acceptent que des **objets**. Pour les types de base, on utilise les **classes enveloppes** : `Integer`, `Double`, `Boolean`, `Character`. Java convertit automatiquement dans les deux sens (*autoboxing*) :

```java
List<Integer> notes = new ArrayList<>();
notes.add(15);               // int converti en Integer
int n = notes.get(0);        // Integer converti en int
```

## Les trois grandes familles

| Interface | Principe | Implémentations courantes |
|---|---|---|
| `List` | suite **ordonnée**, avec doublons, accès par indice | `ArrayList`, `LinkedList` |
| `Set` | ensemble **sans doublons** | `HashSet`, `LinkedHashSet`, `TreeSet` |
| `Map` | associations **clé → valeur**, clés uniques | `HashMap`, `LinkedHashMap`, `TreeMap` |

On y ajoute `Queue` et `Deque` pour les files et les piles (`ArrayDeque`).

## List : ArrayList

```java
List<String> villes = new ArrayList<>(List.of("Dakar", "Thiès", "Ziguinchor"));
villes.add("Saint-Louis");
villes.add(1, "Kaolack");            // insertion à l'indice 1
System.out.println(villes.get(0));   // Dakar
System.out.println(villes.size());   // 5
villes.remove("Thiès");
System.out.println(villes.contains("Dakar"));   // true
Collections.sort(villes);            // ordre alphabétique
```

`ArrayList` est un **tableau dynamique** : accès par indice immédiat, ajout en fin rapide, insertion au début lente (décalage). C'est la liste à utiliser **par défaut**. `LinkedList` est une liste doublement chaînée ; elle est rarement plus rapide en pratique.

`List.of(...)` crée une liste **non modifiable** ; pour la modifier, on la copie dans une `ArrayList`.

## Set : HashSet et TreeSet

```java
Set<String> inscrits = new HashSet<>();
inscrits.add("awa@exemple.sn");
inscrits.add("moussa@exemple.sn");
boolean nouveau = inscrits.add("awa@exemple.sn");   // false : déjà présent
System.out.println(inscrits.size());                // 2
```

- `HashSet` : ajout, suppression et recherche en temps **quasi constant** ; ordre imprévisible.
- `LinkedHashSet` : garde l'ordre d'insertion.
- `TreeSet` : garde les éléments **triés** (ordre naturel ou `Comparator`) ; opérations en O(log n).

Pour que deux objets soient reconnus comme doublons, leur classe doit redéfinir `equals` **et** `hashCode` (voir le cours sur l'héritage).

## Map : HashMap et TreeMap

```java
Map<String, Double> moyennes = new HashMap<>();
moyennes.put("ETU-01", 14.5);
moyennes.put("ETU-02", 9.75);
moyennes.put("ETU-01", 15.0);                  // remplace la valeur

System.out.println(moyennes.get("ETU-01"));    // 15.0
System.out.println(moyennes.get("ETU-99"));    // null : clé absente
System.out.println(moyennes.getOrDefault("ETU-99", 0.0));   // 0.0

for (Map.Entry<String, Double> e : moyennes.entrySet()) {
    System.out.println(e.getKey() + " : " + e.getValue());
}
```

Un usage très fréquent : **compter** des occurrences.

```java
Map<String, Integer> parVille = new TreeMap<>();
for (String ville : List.of("Dakar", "Thiès", "Dakar", "Kaolack", "Dakar")) {
    parVille.merge(ville, 1, Integer::sum);    // ajoute 1, ou crée avec 1
}
System.out.println(parVille);   // {Dakar=3, Kaolack=1, Thiès=1}
```

`TreeMap` garde les clés triées ; `HashMap` est plus rapide mais sans ordre.

## Choisir sa collection

| Besoin | Collection |
|---|---|
| Une liste ordonnée, accès par position | `ArrayList` |
| Éliminer les doublons, tester l'appartenance rapidement | `HashSet` |
| Des éléments toujours triés | `TreeSet` |
| Retrouver une valeur par une clé | `HashMap` |
| Des clés triées | `TreeMap` |
| Une pile ou une file | `ArrayDeque` (`push`/`pop`, `offer`/`poll`) |

Et toujours : **déclarer avec l'interface** (`List`, `Set`, `Map`), créer avec l'implémentation.

## Parcourir et modifier

```java
for (String v : villes) {                 // boucle for-each
    System.out.println(v);
}

villes.removeIf(v -> v.startsWith("K"));  // supprimer selon une condition
villes.forEach(System.out::println);
```

Supprimer un élément **pendant** une boucle for-each provoque une `ConcurrentModificationException`. On utilise `removeIf`, ou un `Iterator` et sa méthode `remove()`.

## Les streams

Les **streams** (Java 8 et plus) décrivent un traitement sur une collection comme une chaîne d'opérations :

```java
record Etudiant(String nom, String ville, double moyenne) {}

List<Etudiant> promo = List.of(
    new Etudiant("Awa", "Dakar", 14.5),
    new Etudiant("Moussa", "Thiès", 9.0),
    new Etudiant("Fatou", "Dakar", 16.25),
    new Etudiant("Ibrahima", "Kaolack", 11.0)
);

List<String> admis = promo.stream()
        .filter(e -> e.moyenne() >= 10)          // garder
        .sorted(Comparator.comparingDouble(Etudiant::moyenne).reversed())
        .map(Etudiant::nom)                      // transformer
        .toList();                               // rassembler
// [Fatou, Awa, Ibrahima]

double moyenneDakar = promo.stream()
        .filter(e -> e.ville().equals("Dakar"))
        .mapToDouble(Etudiant::moyenne)
        .average()
        .orElse(0);                              // 15.375

Map<String, Long> effectifParVille = promo.stream()
        .collect(Collectors.groupingBy(Etudiant::ville, Collectors.counting()));
```

On reconnaît les équivalents de SQL : `filter` correspond à `WHERE`, `map` à `SELECT`, `sorted` à `ORDER BY`, `groupingBy` à `GROUP BY`.

## Démonstration

On gère le carnet de notes d'une promotion : une `Map<String, List<Double>>` associe chaque matricule à la liste de ses notes. On ajoute des notes, on calcule la moyenne de chaque étudiant, on trie le classement, et on compte les admis par ville avec un stream. On mesure ensuite le temps de 100 000 recherches dans une `ArrayList`, puis dans un `HashSet`.

## Exercice guidé

1. Lis une phrase, découpe-la en mots (`split(" ")`), et affiche le nombre de mots **différents** avec un `Set`.
2. Compte le nombre d'occurrences de chaque mot avec une `Map`, puis affiche les mots dans l'ordre alphabétique.
3. Affiche les 3 mots les plus fréquents.

## Exercice autonome

Avec la liste `promo` de la section sur les streams :

1. Affiche le nom de l'étudiant qui a la meilleure moyenne.
2. Construis une `Map<String, List<String>>` qui associe chaque ville à la liste des noms de ses étudiants.
3. Calcule le taux de réussite (pourcentage de moyennes supérieures ou égales à 10).
4. Réécris la question 2 sans stream, avec une boucle et `computeIfAbsent`.

## Correction

Exercice guidé :

```java
String phrase = "le chat voit le chien et le chat fuit";
String[] mots = phrase.split(" ");

Set<String> differents = new HashSet<>(Arrays.asList(mots));
System.out.println(differents.size());           // 6

Map<String, Integer> compte = new TreeMap<>();
for (String m : mots) {
    compte.merge(m, 1, Integer::sum);
}
System.out.println(compte);   // {chat=2, chien=1, et=1, fuit=1, le=3, voit=1}

compte.entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .limit(3)
        .forEach(e -> System.out.println(e.getKey() + " " + e.getValue()));
```

Exercice autonome :

```java
promo.stream()
     .max(Comparator.comparingDouble(Etudiant::moyenne))
     .ifPresent(e -> System.out.println(e.nom()));              // Fatou

Map<String, List<String>> parVille = promo.stream()
        .collect(Collectors.groupingBy(Etudiant::ville,
                 Collectors.mapping(Etudiant::nom, Collectors.toList())));

double taux = 100.0 * promo.stream().filter(e -> e.moyenne() >= 10).count() / promo.size();   // 75.0

Map<String, List<String>> parVille2 = new TreeMap<>();
for (Etudiant e : promo) {
    parVille2.computeIfAbsent(e.ville(), v -> new ArrayList<>()).add(e.nom());
}
```

`computeIfAbsent` crée la liste de la ville au premier étudiant rencontré, puis renvoie la liste existante pour les suivants.

## Pour aller plus loin

- Les tutoriels Oracle, section « Collections », et la documentation de `java.util.stream`.
- Le livre « Effective Java » de Joshua Bloch, référence des bonnes pratiques Java.
- Cours suivant : « Python orienté objet ».
