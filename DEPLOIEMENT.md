# Mettre MeredianStack en ligne sur un VPS Hostinger

Ce guide se suit dans l'ordre. Chaque bloc de commandes se copie tel quel. Remplace seulement :

- `DOMAINE` par ton nom de domaine, par exemple `meredianstack.sn` (sans `https://`) ;
- `IP` par l'adresse IP de ton VPS.

À la fin, le site répond sur `https://DOMAINE`, l'API sur `https://DOMAINE/api`, et `www.DOMAINE` redirige vers `DOMAINE`.
Le HTTPS est obtenu et renouvelé tout seul par Caddy (Let's Encrypt).

---

## 1. Préparer le VPS dans hPanel (Hostinger)

1. Ouvre **hPanel**, puis **VPS**, puis ton serveur.
2. Dans **Système d'exploitation**, choisis **Ubuntu 24.04** dans la catégorie « Système d'exploitation seul » (sans panneau de contrôle).
3. Crée ta clé SSH sur ton ordinateur Windows, dans PowerShell :

   ```powershell
   ssh-keygen -t ed25519 -C "olivier@meredianstack"
   ```

   Appuie sur Entrée pour garder l'emplacement proposé, puis choisis une phrase de passe. Affiche ensuite la clé publique :

   ```powershell
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

4. Dans hPanel, rubrique **Clés SSH** du VPS, ajoute cette clé publique (la ligne qui commence par `ssh-ed25519`).
   Ne partage jamais le fichier `id_ed25519` sans `.pub` : c'est ta clé privée.
5. Note l'**adresse IP** du VPS (page d'aperçu du VPS).
6. Si hPanel propose un **pare-feu** pour le VPS, n'ouvre que les ports **22** (SSH), **80** (HTTP) et **443** (HTTPS, TCP et UDP).

## 2. Faire pointer le nom de domaine vers le VPS

Dans la **zone DNS** du domaine (hPanel, rubrique **Domaines** puis **DNS / Serveurs de noms**, ou chez ton registraire) :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `@` | `IP` | 3600 |
| A | `www` | `IP` | 3600 |

Supprime les anciens enregistrements **A** et **AAAA** de `@` et de `www` qui pointeraient ailleurs (par exemple une page de parking).

Vérifie la propagation depuis PowerShell (cela peut prendre de quelques minutes à quelques heures) :

```powershell
nslookup DOMAINE
nslookup www.DOMAINE
```

Les deux doivent renvoyer l'adresse `IP` du VPS. **Ne lance pas le site avant** : Caddy a besoin du DNS pour obtenir le certificat HTTPS.

## 3. Première connexion et sécurité du serveur

Connecte-toi en `root` :

```powershell
ssh root@IP
```

Mets le système à jour :

```bash
apt update && apt upgrade -y
```

Crée ton utilisateur `olivier`, avec le droit `sudo`, et copie-lui ta clé SSH :

```bash
adduser olivier
usermod -aG sudo olivier
rsync --archive --chown=olivier:olivier ~/.ssh /home/olivier
```

**Avant de fermer quoi que ce soit**, ouvre une **seconde fenêtre** PowerShell et vérifie que la connexion avec `olivier` marche :

```powershell
ssh olivier@IP
sudo whoami   # doit répondre : root
```

Seulement si cela fonctionne, interdis la connexion de `root` et par mot de passe (dans la fenêtre `olivier`) :

```bash
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/; s/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sshd -t && sudo systemctl restart ssh
```

Ouvre encore une **nouvelle** fenêtre et reteste `ssh olivier@IP` avant de fermer les autres.

Pare-feu `ufw` : seulement SSH, HTTP et HTTPS :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable
sudo ufw status
```

Protection contre les tentatives de connexion répétées, et mises à jour de sécurité automatiques :

```bash
sudo apt install -y fail2ban unattended-upgrades
sudo systemctl enable --now fail2ban
sudo dpkg-reconfigure -plow unattended-upgrades   # réponds « Oui »
```

## 4. Installer Docker (dépôt officiel de Docker)

N'installe pas le paquet `docker.io` d'Ubuntu : prends celui de Docker.

```bash
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker olivier
```

Déconnecte-toi (`exit`), reconnecte-toi avec `ssh olivier@IP`, puis vérifie :

```bash
docker run --rm hello-world
docker compose version
```

## 5. Récupérer le projet dans /opt/meredianstack

```bash
sudo mkdir -p /opt/meredianstack
sudo chown olivier:olivier /opt/meredianstack
cd /opt/meredianstack
```

**Si le dépôt GitHub est public :**

```bash
git clone https://github.com/Joe-Wando/Saint-Stack-Academy.git .
git checkout main   # ou la branche que tu déploies
```

**Si le dépôt est privé**, crée une **clé de déploiement** en lecture seule, sur le serveur :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploiement_github -N "" -C "deploiement meredianstack"
cat ~/.ssh/deploiement_github.pub
```

Sur GitHub : dépôt, puis **Settings**, **Deploy keys**, **Add deploy key**. Colle la clé, laisse « Allow write access » **décoché**. Puis :

```bash
cat >> ~/.ssh/config <<'FIN'
Host github.com
  IdentityFile ~/.ssh/deploiement_github
  IdentitiesOnly yes
FIN
git clone git@github.com:Joe-Wando/Saint-Stack-Academy.git .
```

## 6. Créer le fichier .env

```bash
cd /opt/meredianstack
cp .env.production.example .env
openssl rand -base64 32   # copie le résultat pour DB_PASSWORD
openssl rand -base64 48   # copie le résultat pour JWT_SECRET
nano .env
```

Remplis au minimum `DOMAINE`, `DB_PASSWORD`, `JWT_SECRET` et `ADMIN_EMAIL` (les e-mails Brevo peuvent venir à l'étape 9).
Enregistre (Ctrl+O, Entrée) et quitte (Ctrl+X), puis protège le fichier :

```bash
chmod 600 .env
```

**Ne commite jamais `.env`, ne l'envoie jamais par message ou par e-mail.** Garde une copie des secrets dans un gestionnaire de mots de passe.

## 7. Lancer le site

```bash
cd /opt/meredianstack
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
docker compose -f compose.yaml -f compose.prod.yaml logs -f
```

La première construction est **longue** : elle installe les dépendances, génère les PowerPoint de tous les cours, puis compile le site.
Sur un VPS à 1 processeur, compte **15 à 30 minutes**. Quitte l'affichage des journaux avec Ctrl+C (cela n'arrête pas le site).

Quand tout est démarré :

```bash
docker compose -f compose.yaml -f compose.prod.yaml ps
curl -fsS https://DOMAINE/api/sante   # doit répondre {"ok":true}
```

Ouvre `https://DOMAINE` dans ton navigateur : le cadenas doit apparaître.

## 8. Créer le compte administrateur

Sur `https://DOMAINE`, clique sur **Commencer gratuitement** et crée un compte avec **l'adresse exacte de `ADMIN_EMAIL`**.
Ce compte reçoit automatiquement le rôle d'administrateur (menu « Administration »).

Tant que les e-mails ne sont pas configurés (étape 9), le lien de vérification s'affiche dans les journaux de l'API :

```bash
docker compose -f compose.yaml -f compose.prod.yaml logs api | grep -i verification
```

## 9. Les e-mails avec Brevo

1. Crée un compte sur [brevo.com](https://www.brevo.com) (l'offre gratuite suffit pour commencer).
2. Dans **Paramètres**, **SMTP et API**, onglet **SMTP** : note le **serveur** (`smtp-relay.brevo.com`), le **port** (587), l'**identifiant** et génère une **clé SMTP**.
3. Dans **Expéditeurs, domaines et IP dédiées**, puis **Domaines**, ajoute `DOMAINE`. Brevo affiche les enregistrements DNS à créer :
   - **SPF** : un enregistrement `TXT` sur `@` (s'il existe déjà un `TXT` qui commence par `v=spf1`, fusionne-les en un seul) ;
   - **DKIM** : un enregistrement `TXT` (ou `CNAME`) avec le nom donné par Brevo ;
   - **DMARC** : un enregistrement `TXT` sur `_dmarc`, par exemple `v=DMARC1; p=none; rua=mailto:ADMIN_EMAIL`.
   Ajoute-les dans la zone DNS du domaine, puis clique sur **Vérifier** dans Brevo.
4. Complète le `.env` du serveur :

   ```bash
   nano /opt/meredianstack/.env   # SMTP_USER, SMTP_PASS (la clé SMTP), SMTP_FROM
   docker compose -f compose.yaml -f compose.prod.yaml up -d api
   ```

5. Teste : crée un compte avec une autre adresse e-mail et vérifie que l'e-mail de confirmation arrive (regarde aussi les indésirables).

## 10. Les sauvegardes

Rends le script exécutable et teste-le une première fois :

```bash
cd /opt/meredianstack
chmod +x scripts/sauvegarde.sh scripts/mettre-a-jour.sh
./scripts/sauvegarde.sh
ls -lh sauvegardes/
```

Sauvegarde **automatique chaque jour à 3 h** :

```bash
crontab -e
```

Ajoute cette ligne à la fin, puis enregistre :

```
0 3 * * * /opt/meredianstack/scripts/sauvegarde.sh >> /opt/meredianstack/sauvegardes/cron.log 2>&1
```

**Une copie hors du serveur chaque semaine** (si le VPS disparaît, les sauvegardes partent avec lui). Depuis ton ordinateur, dans PowerShell :

```powershell
mkdir $env:USERPROFILE\Sauvegardes-MeredianStack -Force
scp "olivier@IP:/opt/meredianstack/sauvegardes/*.gz" $env:USERPROFILE\Sauvegardes-MeredianStack\
```

**Tester une restauration** (à faire au moins une fois, sans toucher à la vraie base) :

```bash
cd /opt/meredianstack
C="docker compose -f compose.yaml -f compose.prod.yaml"
$C exec -T db sh -c 'createdb -U "$POSTGRES_USER" restauration_test'
gunzip -c sauvegardes/base-AAAA-MM-JJ.sql.gz | $C exec -T db sh -c 'psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d restauration_test'
$C exec -T db sh -c 'psql -U "$POSTGRES_USER" -d restauration_test -c "SELECT count(*) FROM utilisateurs"'
$C exec -T db sh -c 'dropdb -U "$POSTGRES_USER" restauration_test'
```

**Restaurer pour de vrai** (après une panne) : remplace `restauration_test` par la vraie base, comme indiqué en tête de `scripts/sauvegarde.sh`.

## 11. Mettre le site à jour plus tard

Après avoir poussé les changements sur GitHub :

```bash
cd /opt/meredianstack
./scripts/mettre-a-jour.sh
```

Le script récupère le code, reconstruit, supprime les anciennes images, puis vérifie que `https://DOMAINE/api/sante` répond.

## 12. En cas de problème

```bash
cd /opt/meredianstack
C="docker compose -f compose.yaml -f compose.prod.yaml"
$C ps                 # état des services
$C logs -f caddy      # certificat HTTPS, redirections
$C logs -f api        # API, connexion, e-mails
$C logs -f web        # site
free -h && df -h      # mémoire et disque
```

**Le site ne s'ouvre pas ou le certificat est refusé**
- Le DNS n'est pas encore propagé : `nslookup DOMAINE` doit renvoyer l'IP du VPS. Attends, puis `$C restart caddy`.
- Le port 80 est fermé : Let's Encrypt en a besoin. Vérifie `sudo ufw status` et le pare-feu de hPanel.
- Trop d'essais ratés : Let's Encrypt bloque quelques heures. Corrige le DNS, puis attends.

**La construction s'arrête (« Killed », « JavaScript heap out of memory »)** : le VPS manque de mémoire. Ajoute un fichier d'échange de 2 Go :

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Puis relance `$C up -d --build`.

**L'API refuse de démarrer avec « JWT_SECRET doit faire au moins 32 caractères »** : génère un secret avec `openssl rand -base64 48`, mets-le dans `.env`, puis `$C up -d api`.

**Les e-mails n'arrivent pas** : vérifie `SMTP_USER`, `SMTP_PASS` et la validation du domaine dans Brevo, puis regarde `$C logs api`.
