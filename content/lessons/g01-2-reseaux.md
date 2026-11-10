---
slug: g01-2-reseaux
titre: Les réseaux pour développeurs, IP, ports, DNS et HTTP
domaine: Systèmes et outils
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S2, ue: "Maintenance et réseaux" }
parcours:
  - { parcours: web, ordre: 1 }
  - { parcours: systemes, ordre: 7 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Décrire ce qui se passe entre la saisie d'une URL et l'affichage de la page
  - Distinguer une adresse IP, un port et un nom de domaine
  - Expliquer le rôle du DNS et le vérifier avec nslookup ou dig
  - Lire une requête et une réponse HTTP, avec la méthode, le code de statut et les en-têtes
  - Diagnostiquer une connexion avec ping, curl et ss
prerequis:
  - Cours « Le terminal Linux, se déplacer et manipuler des fichiers »
referentiels:
  - CompTIA Network+ (N10-009), domaines 1 « Networking Concepts » et 5 « Troubleshooting »
  - LPI Linux Essentials (010-160), thème 4.4 « Votre ordinateur sur le réseau »
  - RFC 9110 (sémantique HTTP) et RFC 1035 (DNS)
quiz:
  - question: "Dans http://192.168.1.20:8080, que représente 8080 ?"
    choix: ["L'adresse IP", "Le port", "Le masque de sous-réseau", "Le nom de domaine"]
    reponse: 1
    explication: "L'IP désigne la machine, le port désigne le programme qui écoute sur cette machine."
  - question: "À quoi sert le DNS ?"
    choix: ["À chiffrer les échanges", "À traduire un nom de domaine en adresse IP", "À attribuer une IP automatiquement", "À compresser les pages"]
    reponse: 1
    explication: "Le DNS est l'annuaire d'Internet : il transforme google.com en adresse IP. L'attribution automatique d'IP est le rôle de DHCP."
  - question: "Ton API répond 404. Que cela signifie-t-il ?"
    choix: ["Le serveur a planté", "La ressource demandée n'existe pas", "Tu n'es pas authentifié", "Tout s'est bien passé"]
    reponse: 1
    explication: "Les codes 4xx sont des erreurs côté client : 404 signifie ressource introuvable, 401 non authentifié. Les erreurs du serveur sont les 5xx."
  - question: "Quelle méthode HTTP utilise-t-on pour créer une ressource ?"
    choix: ["GET", "POST", "DELETE", "HEAD"]
    reponse: 1
    explication: "GET lit, POST crée, PUT ou PATCH modifie, DELETE supprime."
  - question: "Quel est le port par défaut de HTTPS ?"
    choix: ["80", "22", "443", "5432"]
    reponse: 2
    explication: "80 pour HTTP, 443 pour HTTPS, 22 pour SSH, 5432 pour PostgreSQL."
---

## L'idée

Quand tu tapes `https://github.com` dans ton navigateur, quatre questions se posent dans l'ordre :

1. **Où** se trouve github.com ? C'est le rôle du DNS, qui fournit une adresse IP.
2. **Comment** atteindre cette machine ? C'est le routage IP, à travers des routeurs.
3. **Quel programme** sur cette machine ? C'est le port, ici 443.
4. **Que veut-on lui dire ?** C'est le protocole HTTP : « donne-moi la page d'accueil ».

Tout ce cours déroule ces quatre étapes.

> Analogie postale : le nom de domaine est le nom de l'entreprise, l'IP est l'adresse de l'immeuble, le port est le numéro du bureau, et HTTP est la langue de la lettre.

## Les modèles en couches

On décrit les réseaux par couches, chacune s'appuyant sur celle du dessous. Le modèle TCP/IP en compte quatre :

| Couche | Rôle | Exemples |
|---|---|---|
| Application | Le sens de l'échange | HTTP, DNS, SSH |
| Transport | Livrer au bon programme, de façon fiable ou non | TCP (fiable), UDP (rapide) |
| Internet | Acheminer d'une machine à une autre | IP |
| Accès réseau | Le support physique | Ethernet, Wi-Fi |

Le modèle OSI, plus théorique, en compte sept. Les certifications le citent, mais en pratique on raisonne surtout avec ces quatre couches.

## L'adresse IP

Une adresse **IPv4** est formée de 4 nombres de 0 à 255, par exemple `192.168.1.20`, soit 32 bits.

- **Privées** : `10.x.x.x`, `172.16.x.x` à `172.31.x.x`, `192.168.x.x`. Elles ne sont utilisables qu'à l'intérieur d'un réseau local.
- **Publique** : elle est visible sur Internet. Ta box en possède une et la partage entre tous tes appareils ; c'est le NAT.
- `127.0.0.1`, appelée **localhost**, désigne ta propre machine.

**Notation CIDR.** `192.168.1.0/24` signifie que les 24 premiers bits désignent le réseau et que les 8 bits restants désignent les machines. Cela donne 2⁸ = 256 adresses, dont 254 utilisables : on retire l'adresse du réseau (`.0`) et l'adresse de diffusion (`.255`).

L'IPv6 (`2001:db8::1`) code les adresses sur 128 bits, parce que les adresses IPv4 sont épuisées.

## Les ports

Une machine fait tourner plusieurs services. Le **port**, un nombre de 0 à 65535, indique à quel programme on s'adresse.

| Port | Service |
|---|---|
| 22 | SSH |
| 53 | DNS |
| 80 / 443 | HTTP / HTTPS |
| 3000 / 4000 | serveurs de développement (Next.js, NestJS) |
| 5432 | PostgreSQL |
| 27017 | MongoDB |

Le couple `IP:port` s'appelle un *socket*. L'erreur « address already in use » signifie qu'un autre programme occupe déjà ce port.

## Le DNS

Le DNS traduit `github.com` en adresse IP. Ta machine interroge un **résolveur** (celui de ta box, ou `8.8.8.8` chez Google), qui remonte la hiérarchie si besoin : les serveurs racine, puis ceux de `.com`, puis ceux de `github.com`.

Les principaux types d'enregistrement :

| Type | Rôle |
|---|---|
| `A` | nom vers IPv4 |
| `AAAA` | nom vers IPv6 |
| `CNAME` | alias vers un autre nom |
| `MX` | serveur de messagerie |
| `TXT` | texte libre, souvent utilisé pour prouver qu'on possède le domaine |

Le fichier `/etc/hosts` est consulté **avant** le DNS. Il permet de forcer un nom localement.

## HTTP : requête et réponse

HTTP est un dialogue **texte** et **sans état** : chaque requête est indépendante de la précédente.

```
GET /api/produits?page=2 HTTP/1.1      ← méthode, chemin, version
Host: boutique.sn                        ← en-têtes
Authorization: Bearer eyJhbGci...
Accept: application/json
```

```
HTTP/1.1 200 OK                          ← code de statut
Content-Type: application/json
Content-Length: 58

[{"id":1,"nom":"Chemise","prix":12000}]  ← corps
```

**Méthodes** : `GET` (lire), `POST` (créer), `PUT` ou `PATCH` (modifier), `DELETE` (supprimer).

**Codes de statut**, à connaître par cœur :

| Famille | Sens | Exemples |
|---|---|---|
| 2xx | Succès | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection | 301 Moved Permanently, 304 Not Modified |
| 4xx | Erreur du client | 400 Bad Request, 401 non authentifié, 403 interdit, 404 introuvable |
| 5xx | Erreur du serveur | 500 Internal Server Error, 502 Bad Gateway, 503 indisponible |

**HTTPS** est du HTTP chiffré par TLS. Le certificat prouve l'identité du site, et les échanges ne peuvent plus être lus en chemin.

## Démonstration

```bash
ip a                       # mes interfaces et mes adresses IP (ifconfig sur macOS)
ping -c 4 google.com       # la machine répond-elle ? en combien de millisecondes ?
nslookup github.com        # résolution DNS
dig +short github.com A    # plus concis (paquet dnsutils)
curl -I https://github.com # uniquement les en-têtes de la réponse
curl -v https://httpbin.org/get   # toute la conversation : DNS, TLS, requête, réponse
curl -X POST https://httpbin.org/post -H "Content-Type: application/json" -d '{"nom":"Ali"}'
ss -tlnp                   # quels ports écoutent sur ma machine ?
```

Dans `curl -v`, les lignes commençant par `>` sont ce que tu envoies et celles commençant par `<` sont ce que tu reçois.

## Exercice guidé

1. Trouve ton adresse IP locale. Est-elle privée ou publique ? Justifie avec les plages vues plus haut.
2. Trouve l'adresse IPv4 de `wikipedia.org` avec `dig +short`.
3. Fais `curl -I http://github.com` (sans le **s**). Quel code obtiens-tu, et vers quelle adresse l'en-tête `Location` te renvoie-t-il ?
4. Lance `python3 -m http.server 8000` dans un terminal. Dans un second terminal, vérifie avec `ss -tlnp` que le port 8000 écoute, puis fais `curl -I localhost:8000`.

## Exercice autonome

Avec `https://jsonplaceholder.typicode.com`, une fausse API publique :

1. Récupère l'utilisateur numéro 3. Quel est le code de statut ?
2. Demande l'utilisateur 9999. Quel code obtiens-tu, et pourquoi ?
3. Crée un article avec `POST /posts`, un titre et un corps. Quel code et quel `id` reçois-tu ?
4. Combien d'adresses utilisables contient le réseau `10.0.0.0/28` ? Montre le calcul.
5. Ton collègue écrit : « Mon API Next.js ne répond pas, `curl localhost:3000` affiche *Connection refused* ». Donne deux causes possibles et une commande pour vérifier chacune.

## Correction

Exercice guidé :

1. Par exemple `192.168.1.34` : elle est **privée**, car elle appartient à la plage `192.168.x.x`. Ton adresse publique s'obtient avec `curl ifconfig.me`.
2. `dig +short wikipedia.org A` renvoie une adresse de la forme `185.15.x.x`. Elle peut varier selon ta région.
3. `301 Moved Permanently`, avec l'en-tête `Location: https://github.com/`. Le site force le passage en HTTPS.
4. `ss` affiche une ligne `LISTEN ... 0.0.0.0:8000`, puis `curl` reçoit `HTTP/1.0 200 OK`.

Exercice autonome :

```bash
curl -i https://jsonplaceholder.typicode.com/users/3        # 1. 200, l'utilisatrice « Clementine Bauch »
curl -i https://jsonplaceholder.typicode.com/users/9999     # 2. 404 : la ressource n'existe pas
curl -i -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Bonjour","userId":1}'         # 3. 201 Created, avec "id": 101
```

4. `/28` laisse 32 − 28 = 4 bits pour les machines, soit 2⁴ = 16 adresses. On retire le réseau et la diffusion : il reste **14** adresses utilisables.
5. Cause a : le serveur n'est pas démarré ou a planté. On le vérifie avec `ss -tlnp | grep 3000` : aucune ligne n'apparaît. Cause b : le serveur écoute sur un autre port, ou sur une autre interface. `ss -tlnp` montre alors le vrai port, et la console du serveur indique l'adresse affichée au démarrage.

## Pour aller plus loin

- Les outils de développement du navigateur (F12, onglet Réseau) montrent chaque requête HTTP de la page.
- Le site *howdns.works* explique le DNS sous forme de bande dessinée.
- Le cours « Réseaux approfondis, sous-réseaux, routage, pare-feu et diagnostic » aborde le sous-réseautage, le routage, le pare-feu `ufw` et `tcpdump`.
