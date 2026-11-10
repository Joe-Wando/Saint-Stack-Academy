---
slug: l1-arc-1-representation-information
titre: "Représenter l'information : binaire, hexadécimal et codage"
domaine: Matériel et architecture
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Architecture des ordinateurs et maintenance" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer pourquoi un ordinateur travaille en binaire
  - Convertir un nombre entre les bases 10, 2 et 16
  - Utiliser correctement les unités bit, octet, Ko, Mo, Go et Kio, Mio, Gio
  - Expliquer comment sont codés les entiers négatifs (complément à deux)
  - Expliquer comment sont codés les caractères (ASCII, Unicode, UTF-8) et les couleurs
prerequis:
  - Les quatre opérations et les puissances
referentiels:
  - ACM/IEEE CS2023, domaine « Architecture and Organization » (représentation des données)
  - Cisco Networking Academy, « Computer Hardware Basics » et « IT Essentials »
  - CompTIA A+ Core 1, notions de stockage et de capacité
quiz:
  - question: "Que vaut le nombre binaire 1011 en décimal ?"
    choix: ["11", "13", "1011", "9"]
    reponse: 0
    explication: "1×8 + 0×4 + 1×2 + 1×1 = 11."
  - question: "Combien de valeurs différentes peut-on coder sur un octet (8 bits) ?"
    choix: ["8", "128", "255", "256"]
    reponse: 3
    explication: "2⁸ = 256 valeurs, de 0 à 255 pour un entier non signé."
  - question: "Que vaut l'hexadécimal FF en décimal ?"
    choix: ["16", "255", "256", "1515"]
    reponse: 1
    explication: "F vaut 15 : 15×16 + 15 = 255. Un octet s'écrit toujours avec deux chiffres hexadécimaux."
  - question: "Un disque vendu « 1 To » apparaît comme environ 931 Go dans Windows. Pourquoi ?"
    choix: ["Le disque est défectueux", "Le fabricant compte 1 To = 10¹² octets, alors que Windows affiche en puissances de 1024 (Tio) tout en écrivant « Go »", "Windows occupe 69 Go", "Le formatage efface des données"]
    reponse: 1
    explication: "10¹² / 1024³ ≈ 931. C'est la différence entre les préfixes décimaux (Go) et binaires (Gio)."
  - question: "Pourquoi UTF-8 a-t-il remplacé ASCII pour le texte ?"
    choix: ["Il est plus rapide", "ASCII ne code que 128 caractères, sans accents ni alphabets non latins ; UTF-8 code tous les caractères d'Unicode", "ASCII est payant", "UTF-8 utilise toujours un seul octet"]
    reponse: 1
    explication: "UTF-8 garde les 128 caractères ASCII sur un octet et utilise 2 à 4 octets pour les autres (é, ñ, ߒ, 中, emoji)."
---

## L'idée

Un ordinateur est fait de milliards de **transistors**, de minuscules interrupteurs qui n'ont que deux états : le courant passe ou ne passe pas. On note ces deux états **1** et **0**. Toute l'information (nombres, textes, images, sons, programmes) est donc codée avec seulement deux symboles : c'est le **binaire**.

Un chiffre binaire s'appelle un **bit** (*binary digit*). Avec un bit, on code 2 valeurs ; avec 2 bits, 4 valeurs (00, 01, 10, 11) ; avec n bits, **2ⁿ valeurs**.

## Les bases de numération

Tu comptes en **base 10** : dix chiffres, et chaque position vaut dix fois plus que celle de droite.

2026 = 2×1000 + 0×100 + 2×10 + 6×1 = 2×10³ + 0×10² + 2×10¹ + 6×10⁰

En **base 2**, il n'y a que deux chiffres, et chaque position vaut **deux fois** plus :

| Position | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| Poids | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

Retiens ces poids par cœur : ils servent sans cesse, notamment pour les adresses IP en réseau.

## Du binaire vers le décimal

On additionne les poids des positions qui contiennent un 1.

1101 0110₂ = 128 + 64 + 16 + 4 + 2 = **214**

L'indice ₂ indique la base. En programmation, on écrit souvent `0b11010110`.

## Du décimal vers le binaire

**Méthode des divisions successives** : on divise par 2 jusqu'à obtenir 0, et on lit les restes **de bas en haut**.

| Division | Quotient | Reste |
|---|---|---|
| 45 ÷ 2 | 22 | 1 |
| 22 ÷ 2 | 11 | 0 |
| 11 ÷ 2 | 5 | 1 |
| 5 ÷ 2 | 2 | 1 |
| 2 ÷ 2 | 1 | 0 |
| 1 ÷ 2 | 0 | 1 |

45 = **101101**₂. Vérification : 32 + 8 + 4 + 1 = 45.

**Méthode des poids**, souvent plus rapide : on retire le plus grand poids possible. 45 − 32 = 13 ; 13 − 8 = 5 ; 5 − 4 = 1 ; 1 − 1 = 0. Les poids utilisés sont 32, 8, 4 et 1, d'où 101101.

## L'hexadécimal

Les nombres binaires deviennent vite longs et illisibles. On utilise donc la **base 16**, qui a seize chiffres : 0 à 9, puis A (10), B (11), C (12), D (13), E (14), F (15).

Son grand avantage : **un chiffre hexadécimal correspond exactement à 4 bits**. La conversion se fait par paquets de 4, en partant de la droite.

| Binaire | 0000 | 0001 | ... | 1001 | 1010 | 1011 | 1100 | 1101 | 1110 | 1111 |
|---|---|---|---|---|---|---|---|---|---|---|
| Hexa | 0 | 1 | ... | 9 | A | B | C | D | E | F |

1101 0110₂ → 1101 = D et 0110 = 6 → **D6**₁₆, souvent noté `0xD6`.

Vers le décimal : D6 = 13×16 + 6 = 214. On retrouve bien le même nombre.

On rencontre l'hexadécimal partout : les **adresses MAC** des cartes réseau (`3C:52:82:1A:F0:7B`), les **couleurs** du web, les adresses mémoire et les adresses IPv6.

## Les unités de mesure

- 1 **octet** (en anglais *byte*, symbole o ou B) = 8 bits.
- Un débit internet se mesure en **bits** par seconde : 100 Mbit/s représente environ 12,5 Mo/s.

Deux familles de préfixes coexistent, et c'est une source de confusion :

| Préfixe décimal (SI) | Valeur | Préfixe binaire (CEI) | Valeur |
|---|---|---|---|
| 1 ko | 1 000 octets | 1 Kio | 1 024 octets |
| 1 Mo | 10⁶ octets | 1 Mio | 1 024² octets |
| 1 Go | 10⁹ octets | 1 Gio | 1 024³ octets |
| 1 To | 10¹² octets | 1 Tio | 1 024⁴ octets |

Les fabricants de disques utilisent les préfixes décimaux. Windows calcule en puissances de 1024, mais affiche « Go ». Un disque de 1 To (10¹² octets) apparaît donc comme 10¹² / 1024³ ≈ **931 Go**. Rien n'a disparu.

## Les entiers négatifs : le complément à deux

Comment coder −5 avec seulement des 0 et des 1 ? Les ordinateurs utilisent le **complément à deux**. Sur 8 bits :

1. On écrit 5 en binaire : `0000 0101`.
2. On inverse tous les bits : `1111 1010`.
3. On ajoute 1 : `1111 1011`. C'est −5.

Vérification : 5 + (−5) = `0000 0101` + `1111 1011` = `1 0000 0000`. Le 9ᵉ bit sort de l'octet et disparaît : il reste 0.

Sur 8 bits signés, on code de **−128 à +127**. Le bit de gauche indique le signe : 0 pour positif, 1 pour négatif. C'est pourquoi un `int` de 32 bits va de −2 147 483 648 à 2 147 483 647. Au-delà, le nombre **déborde** et devient négatif : c'est un bogue célèbre.

## Les caractères : ASCII, Unicode et UTF-8

Pour coder du texte, on associe un **numéro** à chaque caractère.

- **ASCII** (1963) code 128 caractères sur 7 bits : lettres anglaises, chiffres, ponctuation. 'A' vaut 65, 'a' vaut 97, '0' vaut 48. Pas d'accents.
- **Unicode** attribue un numéro, appelé **point de code**, à près de 150 000 caractères : toutes les écritures du monde, dont l'alphabet N'Ko d'Afrique de l'Ouest, l'arabe et les emoji. 'é' a le point de code U+00E9.
- **UTF-8** est la façon la plus répandue d'écrire ces numéros en octets : 1 octet pour les caractères ASCII, et 2 à 4 octets pour les autres. Il est compatible avec ASCII et domine aujourd'hui le web.

Quand un texte affiche « Ã© » à la place de « é », c'est qu'un fichier écrit en UTF-8 est lu avec un autre codage.

## Les images et les couleurs

Une image numérique est une grille de **pixels**. En mode **RVB** (rouge, vert, bleu ; *RGB* en anglais), chaque pixel a trois composantes de 0 à 255, soit un octet chacune : 3 octets par pixel, et 2²⁴ ≈ 16,7 millions de couleurs.

En CSS, la couleur `#534AB7` signifie : rouge 0x53 = 83, vert 0x4A = 74, bleu 0xB7 = 183. C'est le violet de Saint Stack Academy.

Une photo de 1920 × 1080 pixels, non compressée, pèse 1920 × 1080 × 3 ≈ 6,2 Mo. Les formats JPEG, PNG ou WebP la **compressent** pour réduire fortement ce poids.

## Démonstration

On vérifie les conversions avec Python, qui sert ici de calculatrice :

```python
print(bin(45))          # 0b101101
print(int("101101", 2)) # 45
print(hex(214))         # 0xd6
print(int("D6", 16))    # 214
print(ord("A"), chr(97))          # 65 a
print("é".encode("utf-8"))        # b'\xc3\xa9' : 2 octets
print(10**12 / 1024**3)           # 931.32...
```

Puis on ouvre un sélecteur de couleur en ligne et on retrouve `#534AB7`, soit (83, 74, 183).

## Exercice guidé

1. Convertis en binaire : 13, 100 et 255.
2. Convertis en décimal : 1010 1010₂ et 0111 1111₂.
3. Convertis en hexadécimal : 1011 1110₂, puis 200 (passe par le binaire).
4. Combien d'adresses différentes peut-on coder avec 32 bits ? Et avec 128 bits ? (Tu viens de comparer IPv4 et IPv6.)

## Exercice autonome

1. Écris −20 en complément à deux sur 8 bits, puis vérifie en additionnant avec 20.
2. Ton téléphone a 128 Go de stockage, dont 18 Go occupés par le système. Combien de photos de 4 Mo peux-tu enregistrer ? (Raisonne en préfixes décimaux.)
3. Décode la couleur `#0F6E56` en RVB.
4. Le mot « Dakar » occupe combien d'octets en ASCII ? Et « Thiès » en UTF-8 ?

## Correction

Exercice guidé :

1. 13 = 1101 ; 100 = 110 0100 (64 + 32 + 4) ; 255 = 1111 1111.
2. 1010 1010 = 128 + 32 + 8 + 2 = 170 ; 0111 1111 = 127.
3. 1011 1110 → BE ; 200 = 1100 1000 → C8.
4. 2³² ≈ 4,3 milliards d'adresses IPv4 ; 2¹²⁸ ≈ 3,4 × 10³⁸ adresses IPv6.

Exercice autonome :

1. 20 = 0001 0100 ; inversion : 1110 1011 ; +1 : **1110 1100**. Et 0001 0100 + 1110 1100 = 1 0000 0000 → 0 sur 8 bits.
2. 128 − 18 = 110 Go = 110 000 Mo ; 110 000 / 4 = **27 500 photos**.
3. 0F = 15, 6E = 110, 56 = 86 → (15, 110, 86), un vert foncé.
4. « Dakar » : 5 octets. « Thiès » : 6 octets, car le « è » occupe 2 octets en UTF-8.

## Pour aller plus loin

- Entraîne-toi aux conversions avec le jeu « Binary Game » de Cisco (learningnetwork.cisco.com).
- Explore la table Unicode sur unicode.org/charts, rubrique « N'Ko ».
- Cours suivant : « Les composants d'un ordinateur ».
