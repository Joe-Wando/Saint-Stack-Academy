---
slug: l1-math-3-arithmetique
titre: "Arithmétique pour l'informatique : division, modulo, PGCD et nombres premiers"
domaine: Mathématiques
duree: 120
difficulte: bases
licence:
  - { niveau: L1, semestre: S1, ue: "Mathématiques pour l'informatique 1" }
ordre: 3
prerequis_cours: [l1-math-1-logique-ensembles]
visibilite: public
objectifs:
  - Écrire la division euclidienne et calculer un modulo, y compris avec des nombres négatifs
  - Calculer avec les congruences (arithmétique modulaire)
  - Calculer un PGCD avec l'algorithme d'Euclide et un PPCM
  - Décomposer un nombre en facteurs premiers
  - Reconnaître ces notions dans des usages réels (horloges, clés de contrôle, hachage, chiffrement)
prerequis:
  - Les quatre opérations sur les entiers
referentiels:
  - ACM/IEEE CS2023, domaine « Mathematical and Statistical Foundations » (théorie des nombres)
  - K. H. Rosen, « Discrete Mathematics and Its Applications », chapitre 4
quiz:
  - question: "Que vaut 47 mod 6 ?"
    choix: ["7", "5", "1", "6"]
    reponse: 1
    explication: "47 = 6 × 7 + 5 : le reste est 5."
  - question: "Il est 22 h. Quelle heure sera-t-il dans 30 heures ?"
    choix: ["52 h", "4 h", "6 h", "8 h"]
    reponse: 1
    explication: "(22 + 30) mod 24 = 52 mod 24 = 4. Les horloges calculent modulo 24."
  - question: "Que vaut PGCD(84, 36) ?"
    choix: ["6", "12", "36", "252"]
    reponse: 1
    explication: "Euclide : 84 = 2×36 + 12, puis 36 = 3×12 + 0. Le dernier reste non nul est 12."
  - question: "Quel lien existe-t-il entre PGCD et PPCM de deux entiers positifs a et b ?"
    choix: ["PGCD + PPCM = a + b", "PGCD × PPCM = a × b", "PPCM = 2 × PGCD", "Aucun"]
    reponse: 1
    explication: "Par exemple, PGCD(84, 36) × PPCM(84, 36) = 12 × 252 = 3024 = 84 × 36."
  - question: "Pourquoi le chiffrement RSA repose-t-il sur les nombres premiers ?"
    choix: ["Ils sont faciles à mémoriser", "Multiplier deux grands nombres premiers est facile, mais retrouver ces facteurs à partir du produit est extrêmement long", "Il n'y en a qu'un nombre fini", "Ils sont tous pairs"]
    reponse: 1
    explication: "La sécurité de RSA repose sur la difficulté de factoriser un nombre de plusieurs centaines de chiffres."
---

## L'idée

L'arithmétique, c'est l'étude des nombres **entiers**. Elle paraît scolaire, mais elle est partout en informatique : le modulo répartit des données entre des serveurs, les clés de contrôle détectent les erreurs de saisie, et les nombres premiers protègent chaque connexion HTTPS.

Les ordinateurs calculent d'ailleurs naturellement en arithmétique modulaire : un entier de 32 bits « fait le tour » après 2³² valeurs, exactement comme une horloge après 12 heures.

## La division euclidienne

Pour deux entiers a et b, avec b > 0, il existe un **unique** couple (q, r) tel que :

**a = b × q + r**, avec **0 ≤ r < b**

- q est le **quotient**, r est le **reste**.
- On note r = **a mod b**. En C, Java, Python : `a % b`.

Exemple : 47 = 6 × 7 + 5, donc 47 mod 6 = 5 et le quotient est 7.

Attention aux **nombres négatifs** : mathématiquement, −7 mod 3 = 2, car −7 = 3 × (−3) + 2. Mais en C et en Java, `-7 % 3` vaut **−1**, alors qu'en Python, `-7 % 3` vaut **2**. Quand le signe peut être négatif, vérifie le comportement du langage.

## Divisibilité

On dit que **b divise a**, noté b | a, si a mod b = 0.

Critères rapides :

| Divisible par | Si... |
|---|---|
| 2 | le dernier chiffre est pair |
| 3 | la somme des chiffres est divisible par 3 |
| 5 | le dernier chiffre est 0 ou 5 |
| 9 | la somme des chiffres est divisible par 9 |
| 10 | le dernier chiffre est 0 |

## Les congruences

On dit que a est **congru** à b **modulo** n, et on note a ≡ b (mod n), si a et b ont le même reste dans la division par n. Autrement dit, si n divise a − b.

Exemples : 17 ≡ 5 (mod 12), car 17 h correspond à 5 h de l'après-midi ; 10 ≡ 3 (mod 7), car dix jours après un lundi, on est un jeudi, comme trois jours après.

On peut **additionner et multiplier** des congruences : on réduit les nombres modulo n à chaque étape, ce qui évite de manipuler de grands nombres.

- (a + b) mod n = ((a mod n) + (b mod n)) mod n
- (a × b) mod n = ((a mod n) × (b mod n)) mod n

Exemple : quel est le dernier chiffre de 7¹⁰⁰ ? On calcule modulo 10 : 7¹ ≡ 7, 7² ≡ 9, 7³ ≡ 3, 7⁴ ≡ 1. Le cycle a une longueur de 4, et 100 = 4 × 25, donc 7¹⁰⁰ = (7⁴)²⁵ ≡ 1. Le dernier chiffre est **1**.

## Le PGCD et l'algorithme d'Euclide

Le **PGCD** (plus grand commun diviseur) de a et b est le plus grand entier qui divise les deux.

L'**algorithme d'Euclide**, vieux de plus de 2 000 ans, repose sur une propriété : PGCD(a, b) = PGCD(b, a mod b). On répète jusqu'à obtenir un reste nul ; le dernier reste non nul est le PGCD.

PGCD(252, 105) :

| a | b | a mod b |
|---|---|---|
| 252 | 105 | 42 |
| 105 | 42 | 21 |
| 42 | 21 | 0 |

PGCD(252, 105) = **21**.

Deux nombres dont le PGCD vaut 1 sont dits **premiers entre eux** : 8 et 15, par exemple.

## Le PPCM

Le **PPCM** (plus petit commun multiple) est le plus petit entier multiple de a et de b. Pour des entiers positifs :

**PGCD(a, b) × PPCM(a, b) = a × b**

PPCM(252, 105) = 252 × 105 / 21 = **1260**.

Usage concret : deux tâches planifiées tournent toutes les 6 minutes et toutes les 15 minutes. Elles tournent en même temps toutes les PPCM(6, 15) = **30** minutes.

## Les nombres premiers

Un nombre **premier** est un entier supérieur ou égal à 2 qui n'a que deux diviseurs : 1 et lui-même. Les premiers sont 2, 3, 5, 7, 11, 13, 17, 19, 23, 29...

**Théorème fondamental de l'arithmétique** : tout entier supérieur ou égal à 2 se décompose de façon **unique** en produit de facteurs premiers.

360 = 2 × 180 = 2 × 2 × 90 = 2 × 2 × 2 × 45 = 2³ × 3² × 5

La décomposition donne un autre moyen de calculer le PGCD : on garde les facteurs communs, avec le plus petit exposant.

Pour tester si n est premier, il suffit de chercher un diviseur jusqu'à √n. Pour les lister tous jusqu'à une limite, on utilise le **crible d'Ératosthène** : on écrit les nombres, puis on barre les multiples de 2, de 3, de 5, etc. ; ceux qui restent sont premiers.

## Les applications en informatique

- **Hachage et répartition** : pour répartir des utilisateurs entre 4 serveurs, on calcule `id % 4`. Les tables de hachage utilisent le même principe.
- **Clés de contrôle** : le numéro **IBAN** est vérifié par un calcul modulo 97 ; les codes-barres EAN-13 utilisent une somme pondérée modulo 10. Une faute de frappe est ainsi détectée immédiatement.
- **Cryptographie** : le chiffrement **RSA** utilise deux grands nombres premiers p et q, et calcule modulo n = p × q. Multiplier p et q est instantané ; retrouver p et q à partir de n, pour un n de plus de 600 chiffres, est hors de portée des ordinateurs actuels.
- **Nombres aléatoires** : `rand() % 100` donne un nombre entre 0 et 99.

## Démonstration

```python
print(47 // 6, 47 % 6)   # 7 5
print(-7 % 3)            # 2 en Python (-1 en C et en Java)

def pgcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

print(pgcd(252, 105))                 # 21
print(252 * 105 // pgcd(252, 105))    # 1260 : le PPCM
print(pow(7, 100, 10))                # 1 : 7^100 mod 10, calculé efficacement

def crible(n):
    premier = [True] * (n + 1)
    premier[0] = premier[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if premier[i]:
            for multiple in range(i * i, n + 1, i):
                premier[multiple] = False
    return [i for i in range(n + 1) if premier[i]]

print(crible(50))
```

## Exercice guidé

1. Écris la division euclidienne de 2026 par 7. Quel jour de la semaine sera-t-on 2026 jours après un mercredi ?
2. Calcule PGCD(1071, 462) avec l'algorithme d'Euclide, puis le PPCM.
3. Décompose 1000 et 2026 en facteurs premiers.

## Exercice autonome

1. Quel est le dernier chiffre de 3²⁰²⁶ ?
2. Un bus passe toutes les 12 minutes, un autre toutes les 18 minutes. Ils partent ensemble à 7 h. À quelle heure repartent-ils ensemble pour la première fois ?
3. Liste les nombres premiers inférieurs à 60 avec le crible d'Ératosthène.
4. 13 utilisateurs, numérotés de 1 à 13, sont répartis sur 4 serveurs avec `id % 4`. Combien d'utilisateurs reçoit chaque serveur ?

## Correction

Exercice guidé :

1. 2026 = 7 × 289 + 3. Trois jours après un mercredi : un **samedi**.
2. 1071 mod 462 = 147 ; 462 mod 147 = 21 ; 147 mod 21 = 0. PGCD = **21**. PPCM = 1071 × 462 / 21 = **23 562**.
3. 1000 = 2³ × 5³ ; 2026 = 2 × 1013 (1013 est premier).

Exercice autonome :

1. Les puissances de 3 modulo 10 suivent le cycle 3, 9, 7, 1, de longueur 4. 2026 = 4 × 506 + 2, donc 3²⁰²⁶ ≡ 3² ≡ 9 : le dernier chiffre est **9**.
2. PPCM(12, 18) = 36 minutes : ils repartent ensemble à **7 h 36**.
3. 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59.
4. Serveur 0 : 4, 8, 12 (3 utilisateurs) ; serveur 1 : 1, 5, 9, 13 (4) ; serveur 2 : 2, 6, 10 (3) ; serveur 3 : 3, 7, 11 (3).

## Pour aller plus loin

- K. H. Rosen, « Discrete Mathematics and Its Applications », chapitre 4 « Number Theory and Cryptography ».
- Le site Project Euler (projecteuler.net) propose des centaines de problèmes d'arithmétique à résoudre en programmant.
- Cours suivant : « Dénombrement et combinatoire ».
