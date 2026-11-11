# Charte graphique de MeredianStack (version « couleurs UNIPRO »)

Les couleurs sont inspirées du logo de l'Université Professionnelle (UNIPRO), relevées sur un document imprimé. Elles sont **provisoires** : elles seront ajustées quand le logo officiel sera disponible. Elles doivent donc être définies **à un seul endroit**.

Le site reprend seulement les couleurs. Il n'affiche **ni le nom ni le logo d'UNIPRO** : la plateforme reste ouverte à tous les étudiants.

## 1. Couleurs

| Rôle | Nom de la variable | Valeur | Usage |
|---|---|---|---|
| Bleu nuit | `--nuit` | `#1B2F52` | Textes des titres, bandeaux sombres (accueil, parcours), pied de page, menu de l'administration, blocs de code |
| Bleu | `--bleu` | `#2B4C7E` | Bouton secondaire plein (« Se connecter », « Suivant »), liens, chiffres clés, icônes |
| Bleu moyen | `--bleu-moyen` | `#3D6AA8` | Ruban L1, bandeau de la page Licence L1 |
| Bleu clair | `--bleu-clair` | `#E8EEF7` | Fond des pastilles d'icône, des puces de code en ligne, des barres de progression, des éléments actifs |
| Corail | `--corail` | `#C8473A` | Bouton principal (une seule fois par écran), soulignement du lien actif, trait sous l'en-tête, surtitres, progression, liseré des options de L3 |
| Corail foncé | `--corail-fonce` | `#A93A2F` | Survol du bouton principal |
| Corail clair | `--corail-clair` | `#FCE8E4` | Encadrés « Attention » dans les cours, fond des icônes de certification |
| Fond | `--fond` | `#F6F8FB` | Fond des pages |
| Blanc | `--blanc` | `#FFFFFF` | Cartes, en-tête, formulaires |
| Texte secondaire | `--doux` | `#4F5F7A` | Descriptions, métadonnées (durée, nombre de chapitres) |
| Bordure | `--bord` | `#D9E1EE` | Bordures des cartes, des champs et des puces |
| Texte clair sur fond sombre | `--sur-sombre` | `#C9D4E8` | Paragraphes sur bleu nuit |
| Corail sur fond sombre | `--corail-sur-sombre` | `#F08A7E` | « Stack » et surtitres sur bleu nuit |

**Rubans de niveau** (texte blanc, contraste supérieur à 4,5:1) :

| Niveau | Couleur |
|---|---|
| L1 | `--bleu-moyen` `#3D6AA8` |
| L2 | `--bleu` `#2B4C7E` |
| L3, tronc commun | `--nuit` `#1B2F52` |
| L3, une option | `--nuit` avec un liseré corail de 3 px en bas (`box-shadow: inset 0 -3px 0 var(--corail)`) |
| Cours hors licence | `--nuit` |

**États** : succès `#1F6B4A` sur `#E3F1EA` (badges « Gratuit », « Actif ») ; alerte `#9A3328` sur `#FCE8E4` (« Suspendu », « Certification »).

**Ce qui ne prend PAS ces couleurs** :
- les **logos de technologies et d'organismes** : toujours dans leur couleur d'origine (fichiers `content/sujets.yaml` et `content/organismes.yaml`) ;
- les **illustrations** des domaines et des pages ;
- les **PowerPoint**, qui prennent la couleur de leur sujet (voir le prompt, phase 6).

## 2. Typographie

| Usage | Police | Graisse | Taille (ordinateur) |
|---|---|---|---|
| Titre de bandeau d'accueil | Bricolage Grotesque | 800 | 52 px, interligne 1,08 |
| Titre de page | Bricolage Grotesque | 800 | 40 à 44 px |
| Titre de section | Bricolage Grotesque | 800 | 28 à 32 px |
| Titre de carte | Bricolage Grotesque | 800 | 18 à 20 px |
| Texte courant | Manrope | 400 | 16 à 17 px, interligne 1,6 à 1,75 |
| Libellés, boutons | Manrope | 700 | 14 à 15 px |
| Surtitre (« CHAPITRE 3 SUR 6 », « REPRENDRE ») | Manrope | 700 | 12 à 13 px, majuscules, espacement 0,04 à 0,06 em, couleur corail |
| Code | JetBrains Mono, puis Consolas | 400 | 15 px dans les cours |

Titres : couleur `--nuit`, `letter-spacing: -0.01em`.

## 3. Formes et espacements

- Conteneur central : `max-width: 1180px`, marges latérales 24 px (16 px sur téléphone).
- Rayons : cartes 14 px, boutons et champs 10 px, rubans 7 px, puces 999 px.
- Bordures : 1 px `--bord`. Pas d'ombre portée, sauf l'aperçu de cours en mode Présenter.
- Espacement entre sections : 56 à 64 px. Grilles de cartes : `repeat(auto-fill, minmax(260px, 1fr))`, écart 20 px.
- Zones cliquables : 44 px de haut au minimum.

## 4. Composants

| Composant | Description exacte |
|---|---|
| **En-tête** | Fond blanc, hauteur minimale 72 px, **trait corail de 3 px en bas**. À gauche : carré « MS » 36 px bleu nuit (rayon 9 px), puis « Meredian » en bleu nuit et « Stack » en corail. Menu : Accueil, Licence, Parcours, Catalogue, Certifications ; lien actif en gras, souligné de 2 px corail. À droite, déconnecté : « Contact » puis bouton bleu « Se connecter » ; connecté : photo ronde 38 px avec bordure corail de 2 px, et le prénom. Sur téléphone : bouton menu (trois traits), 44 × 44 px. |
| **Pied de page** | Fond bleu nuit, texte `--sur-sombre`, trois colonnes : présentation, « Apprendre », « La plateforme » (Contact, Confidentialité, Marques). |
| **Bouton principal** | Fond corail, texte blanc, gras, 44 px de haut, rayon 10 px ; survol corail foncé. **Un seul par écran.** |
| **Bouton bleu** | Fond bleu, texte blanc ; survol bleu nuit. |
| **Bouton contour** | Fond blanc, contour 1 px `--bord`, texte bleu nuit ; survol contour bleu. Sur fond sombre : fond transparent, contour `#8FA4C8`, texte blanc. |
| **Carte de cours** | Carte blanche ; image de 150 px de haut en haut ; **ruban de niveau** en haut à gauche (12 px, gras, blanc) ; **pastille du sujet** ronde de 40 px, blanche, bordée, à cheval sur le bas de l'image à droite, avec le logo d'origine ou l'icône générique ; puis le sujet en surtitre corail, le titre, la durée avec une icône d'horloge, et en option une barre de progression (6 px, fond bleu clair, remplissage corail). |
| **Puce de filtre** | Fond blanc, bordure, texte bleu nuit gras 13 px ; active : fond bleu nuit, texte blanc. |
| **Champ de formulaire** | 46 px de haut, bordure 1 px, rayon 10 px, libellé gras au-dessus. |
| **Bandeau de page** | Fond bleu nuit (accueil, parcours) ou couleur du niveau (licence), titre blanc, surtitre corail sur sombre, illustration à droite. |
| **Encadré « Attention »** | Fond corail clair, texte `#6B241C`, icône corail. |
| **Liens dans le texte des cours** | Couleur bleu et **soulignés** (ils ne doivent pas se distinguer par la couleur seule). |

## 5. Écrans de référence

Le dossier `maquette/` contient les 15 écrans en HTML statique. Ouvre-les dans un navigateur : ils font foi pour les mesures et les couleurs.

| Fichier | Page du site |
|---|---|
| `Main.html` | `/` (accueil public) |
| `Connexion.html` | `/connexion` (et `/inscription` sur le même modèle) |
| `Bienvenue.html` | `/bienvenue` (écran 2 sur 4 ; les autres sur le même modèle) |
| `Accueil.html` | `/accueil` (accueil connecté) |
| `Catalogue.html` | `/catalogue` |
| `Licence.html` | `/licence/[niveau]` |
| `Parcours.html` | `/parcours/[code]` |
| `Cours.html` | `/cours/[slug]` |
| `Presenter.html` | `/cours/[slug]/presenter` |
| `Mobile.html` | `/cours/[slug]` à 390 px de large |
| `Certifications.html` | `/certifications` |
| `Profil.html` | `/profil` |
| `Contact.html` | `/contact` |
| `Admin.html` | `/admin` |
| `Erreur404.html` | page 404 |

## 6. Exception : les logos sur la page d'accueil

En règle générale, aucun logo de technologie n'apparaît dans l'identité du site (en-tête, pied de page, favicon, image de partage par défaut).
**Exception voulue** : la section « Les technologies que tu vas apprendre » de la page d'accueil publique affiche les logos des sujets enseignés.
Chaque logo y identifie un sujet et mène aux cours de ce sujet (`/catalogue?sujet=…`). Les logos restent dans leur couleur d'origine,
sans modification (paquet simple-icons), et décoratifs (`alt=""`) : le nom du sujet est écrit en texte sous chaque logo.
Les mentions de marque correspondantes figurent sur la page `/marques`.
