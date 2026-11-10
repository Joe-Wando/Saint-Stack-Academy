---
slug: s02-3-reseaux-approfondis
titre: Réseaux approfondis, sous-réseaux, routage, pare-feu et diagnostic
domaine: Systèmes
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Réseaux et sécurité" }
parcours:
  - { parcours: systemes, ordre: 8 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Découper un réseau en sous-réseaux avec la notation CIDR
  - Lire une table de routage et expliquer le rôle de la passerelle par défaut
  - Expliquer TCP (poignée de main en trois temps) et UDP
  - Configurer un pare-feu avec ufw selon le principe du moindre accès
  - Diagnostiquer avec traceroute, ss, tcpdump et nc
prerequis:
  - Cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP »
referentiels:
  - CompTIA Network+ (N10-009), domaines 1 « Networking Concepts », 4 « Network Security » et 5 « Troubleshooting »
  - Cisco CCNA 200-301, domaine 1 « Network Fundamentals »
  - LPIC-1 (102-500), objectifs 109.1 à 109.3
quiz:
  - question: "Combien d'adresses utilisables dans 192.168.10.0/26 ?"
    choix: ["64", "62", "30", "254"]
    reponse: 1
    explication: "32 − 26 = 6 bits pour les machines : 2⁶ = 64 adresses, moins l'adresse du réseau et celle de diffusion = 62."
  - question: "À quoi sert la passerelle par défaut ?"
    choix: ["À attribuer les adresses IP", "À envoyer les paquets destinés à un réseau qu'on ne connaît pas (Internet)", "À résoudre les noms", "À chiffrer le trafic"]
    reponse: 1
    explication: "Si la destination n'est pas sur ton réseau local, le paquet part vers la passerelle (ta box ou un routeur) qui le fait suivre."
  - question: "Quelle est la séquence de la poignée de main TCP ?"
    choix: ["ACK, SYN, FIN", "SYN, SYN-ACK, ACK", "HELLO, OK, GO", "GET, 200, CLOSE"]
    reponse: 1
    explication: "Le client envoie SYN, le serveur répond SYN-ACK, le client confirme avec ACK : la connexion est établie."
  - question: "Pourquoi DNS et la vidéo en direct utilisent-ils souvent UDP ?"
    choix: ["UDP est chiffré", "UDP est plus léger et rapide : pas de connexion ni de retransmission", "UDP garantit l'ordre des paquets", "TCP est interdit"]
    reponse: 1
    explication: "Pour une requête DNS courte ou une image vidéo déjà dépassée, retransmettre serait inutile : la vitesse prime."
  - question: "Quelle règle ufw autoriser en premier sur un serveur distant avant ufw enable ?"
    choix: ["ufw allow 80", "ufw allow OpenSSH", "ufw deny all", "ufw allow 5432"]
    reponse: 1
    explication: "Sinon, activer le pare-feu (politique par défaut : tout refuser en entrée) coupe ta propre connexion SSH."
---

## Pourquoi aller plus loin ?

Dans le cloud (AWS, Kubernetes), tu dois **concevoir** des réseaux : un VPC en `10.0.0.0/16`, des sous-réseaux publics et privés, des règles de pare-feu (*security groups*). Et quand « ça ne répond pas », il faut savoir **où** ça bloque : DNS, route, pare-feu ou application.

## Les sous-réseaux et le CIDR

Une adresse IPv4 fait 32 bits. Le suffixe `/n` indique combien de bits désignent le **réseau** ; les `32 − n` bits restants désignent les **machines**.

**Formule** : nombre d'adresses = 2^(32 − n), et nombre de machines utilisables = 2^(32 − n) − 2. On retire l'adresse du **réseau** (la première) et celle de **diffusion** (la dernière).

| CIDR | Masque | Adresses | Utilisables |
|---|---|---|---|
| /16 | 255.255.0.0 | 65 536 | 65 534 |
| /24 | 255.255.255.0 | 256 | 254 |
| /26 | 255.255.255.192 | 64 | 62 |
| /28 | 255.255.255.240 | 16 | 14 |
| /30 | 255.255.255.252 | 4 | 2 |

**Exemple chiffré : découper `192.168.1.0/24` en 4 sous-réseaux.** Pour faire 4 sous-réseaux, il faut 2 bits de plus (2² = 4), donc des `/26` de 64 adresses chacun :

| Sous-réseau | Plage | Réseau | Diffusion |
|---|---|---|---|
| 1 | .0 à .63 | 192.168.1.0 | 192.168.1.63 |
| 2 | .64 à .127 | 192.168.1.64 | 192.168.1.127 |
| 3 | .128 à .191 | 192.168.1.128 | 192.168.1.191 |
| 4 | .192 à .255 | 192.168.1.192 | 192.168.1.255 |

Dans le cloud, on place typiquement les serveurs web dans un sous-réseau **public** et les bases de données dans un sous-réseau **privé**, non joignable depuis Internet.

## Le routage

Pour chaque paquet, ta machine consulte sa **table de routage** : « pour joindre tel réseau, je passe par où ? »

```
$ ip route
default via 192.168.1.1 dev wlan0          ← tout le reste part vers la box
192.168.1.0/24 dev wlan0 proto kernel      ← mon réseau local : envoi direct
172.17.0.0/16 dev docker0                  ← le réseau de Docker
```

On applique la règle **la plus précise** qui correspond. Si aucune ne correspond, on utilise la route `default`, c'est-à-dire la **passerelle**. La box fait ensuite le **NAT** : elle remplace ton adresse privée par son adresse publique.

`traceroute google.com` (ou `mtr`) montre chaque routeur traversé, avec son délai.

## TCP et UDP

| | TCP | UDP |
|---|---|---|
| Connexion | oui (poignée de main) | non |
| Fiabilité | accusés de réception, retransmission, ordre garanti | aucune garantie |
| Vitesse | plus lent | plus rapide |
| Usages | HTTP, SSH, bases de données | DNS, vidéo en direct, jeux, VoIP |

**La poignée de main TCP en trois temps :**

```
Client                     Serveur
  │ ── SYN ──────────────────▶ │   « je veux me connecter »
  │ ◀──────────── SYN-ACK ──── │   « d'accord, et toi ? »
  │ ── ACK ──────────────────▶ │   « c'est parti »
```

Les **états** visibles avec `ss` :

- `LISTEN` : le service attend des connexions ;
- `ESTABLISHED` : la connexion est ouverte ;
- `TIME-WAIT` : la connexion vient de se fermer.

## Le pare-feu avec ufw

Un pare-feu filtre les paquets selon des règles. Sous Linux, le moteur est `netfilter` (nftables, ou iptables sur les anciens systèmes). `ufw` (*Uncomplicated Firewall*) le rend simple d'emploi.

Le **principe** : on refuse tout en entrée par défaut, et on n'ouvre que le strict nécessaire.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH              # AVANT d'activer, sinon tu te coupes toi-même
sudo ufw allow 80,443/tcp           # le site web
sudo ufw allow from 10.0.1.0/24 to any port 5432   # PostgreSQL, seulement depuis le sous-réseau applicatif
sudo ufw enable
sudo ufw status numbered
sudo ufw delete 3                   # supprimer la règle n° 3
```

> Attention : Docker modifie lui-même iptables. Un port publié avec `-p 5432:5432` peut **contourner** ufw. En production, ne publie pas les ports des bases de données, ou lie-les à localhost : `-p 127.0.0.1:5432:5432`.

## La méthode de diagnostic, par couches

Quand « l'API ne répond pas », on remonte les couches dans l'ordre :

| Étape | Question | Commande |
|---|---|---|
| 1. Réseau | La machine est-elle joignable ? | `ping`, `ip route`, `traceroute` |
| 2. DNS | Le nom se résout-il ? | `dig api.exemple.sn` |
| 3. Port | Le port est-il ouvert ? | `nc -zv hote 443`, et sur le serveur `ss -tlnp` |
| 4. Pare-feu | Est-ce filtré ? | `sudo ufw status` ; un délai d'attente signifie souvent un filtrage, un refus immédiat signifie que rien n'écoute |
| 5. Application | Que répond-elle ? | `curl -v`, `journalctl -u ...` |

`tcpdump` capture les paquets eux-mêmes :

```bash
sudo tcpdump -i any port 3000 -n        # voir le trafic vers le port 3000
sudo tcpdump -i any port 53 -n          # voir les requêtes DNS passer
```

Pour une analyse graphique, enregistre la capture (`-w capture.pcap`) et ouvre-la dans Wireshark.

## Démonstration

```bash
ip a && ip route
traceroute -n 8.8.8.8
nc -l 9000 &                       # un petit serveur TCP sur le port 9000
ss -tlnp | grep 9000               # LISTEN
sudo tcpdump -i lo port 9000 -n &  # on observe…
echo "bonjour" | nc localhost 9000 # …la poignée de main SYN, SYN-ACK, ACK puis les données
nc -zv localhost 9001              # « Connection refused » : rien n'écoute
```

## Exercice guidé

1. Découpe `10.0.0.0/24` en 8 sous-réseaux. Quel est le CIDR ? Donne les plages des trois premiers.
2. Combien de machines dans un `/27` ? dans un `/22` ?
3. L'adresse `172.16.5.130/25` appartient à quel réseau ? Quelle est l'adresse de diffusion ?

## Exercice autonome

Tu conçois le réseau d'une petite plateforme dans `10.20.0.0/16` :

- un sous-réseau public pour 2 serveurs web et un répartiteur de charge ;
- un sous-réseau privé pour l'API, prévu pour jusqu'à 50 conteneurs ;
- un sous-réseau privé pour PostgreSQL et Redis.

1. Propose un CIDR pour chacun, sans chevauchement, en justifiant leur taille.
2. Écris les règles ufw du serveur de base de données : SSH depuis un poste d'administration `10.20.0.10` seulement, et PostgreSQL depuis le sous-réseau de l'API seulement.
3. Un collègue reçoit `curl: (28) Connection timed out` vers l'API, mais `ping` répond. Quelles sont tes trois premières hypothèses, et dans quel ordre les vérifies-tu ?

## Correction

Exercice guidé :

1. 8 sous-réseaux demandent 3 bits de plus (2³ = 8) : ce sont des **/27** de 32 adresses. Les trois premiers : `10.0.0.0` à `.31`, `10.0.0.32` à `.63`, `10.0.0.64` à `.95`.
2. Un `/27` donne 2⁵ − 2 = **30** machines. Un `/22` donne 2¹⁰ − 2 = **1 022** machines.
3. Un `/25` découpe le dernier octet en blocs de 128. Comme 130 ≥ 128, l'adresse appartient au réseau **172.16.5.128/25**, dont l'adresse de diffusion est **172.16.5.255**.

Exercice autonome :

1. Une proposition, parmi d'autres valables :
   - public `10.20.1.0/28`, soit 14 machines pour 3 utilisées, avec de la marge ;
   - API `10.20.2.0/26`, soit 62 machines pour 50 prévues ;
   - données `10.20.3.0/28`.

   On garde de l'espace libre entre les sous-réseaux pour pouvoir grandir. Remarque : AWS réserve 5 adresses par sous-réseau et non 2, ce qui laisse 11 machines dans un `/28`.
2. Les règles du serveur de base de données :

```bash
sudo ufw default deny incoming
sudo ufw allow from 10.20.0.10 to any port 22 proto tcp
sudo ufw allow from 10.20.2.0/26 to any port 5432 proto tcp
sudo ufw enable
```

3. Le `ping` passe, donc le réseau fonctionne. Un **délai d'attente** (et non un refus) oriente vers un **filtrage**. Les hypothèses à vérifier dans l'ordre :
   - un pare-feu bloque le port : `ufw status`, ou le *security group* dans le cloud ;
   - l'API écoute sur 127.0.0.1 au lieu de 0.0.0.0 : `ss -tlnp` sur le serveur ;
   - le port publié par Docker n'est pas le bon : `docker ps`.

   On le confirme avec `nc -zv hote port`.

## Pour aller plus loin

- La simulation Cisco Packet Tracer permet de construire des réseaux virtuels avec routeurs et commutateurs.
- La semaine prochaine, Windows Server : DNS et DHCP côté serveur.
- Dans le parcours AWS : VPC, *security groups*, NACL et passerelles NAT reprennent exactement ces notions.
