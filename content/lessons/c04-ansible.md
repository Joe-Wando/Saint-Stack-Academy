---
slug: c04-ansible
titre: "Complément : automatiser la configuration des serveurs avec Ansible"
piste: complement
semaine: 5
date: 2026-12-10
domaine: DevOps
duree: 120
niveau: bases
objectifs:
  - Expliquer la gestion de configuration et le principe d'idempotence
  - Décrire un inventaire, un module, une tâche, un playbook
  - Écrire un playbook qui installe et configure un serveur web
  - Utiliser variables, gabarits Jinja2, handlers et rôles
  - Protéger les secrets avec Ansible Vault
prerequis:
  - Séances solo de la semaine 1 (Linux, SSH, paquets) et de la semaine 2 (Bash)
referentiels:
  - Red Hat Certified Engineer (RHCE, EX294), consacré à l'automatisation avec Ansible
  - Documentation Ansible, « Getting started » et « Playbook guide »
  - Infrastructure as Code (Kief Morris), chapitre « Configuration management »
quiz:
  - question: "Qu'est-ce qui distingue Ansible de Puppet ou Chef ?"
    choix: ["Il est payant", "Il est sans agent : il se connecte aux machines en SSH", "Il ne fonctionne que sous Windows", "Il n'utilise pas YAML"]
    reponse: 1
    explication: "Rien à installer sur les serveurs gérés, à part Python ; Ansible utilise SSH comme un administrateur."
  - question: "Que signifie qu'une tâche Ansible est idempotente ?"
    choix: ["Elle est rapide", "La relancer ne change rien si l'état voulu est déjà atteint (résultat « ok » au lieu de « changed »)", "Elle ne s'exécute qu'une fois dans la vie du serveur", "Elle est chiffrée"]
    reponse: 1
    explication: "On décrit l'état voulu (nginx installé), pas la commande à lancer ; Ansible ne fait que l'écart."
  - question: "À quoi sert un handler ?"
    choix: ["À gérer les erreurs", "À exécuter une action (redémarrer nginx) seulement si une tâche l'a notifié parce qu'elle a changé quelque chose", "À lister les serveurs", "À chiffrer"]
    reponse: 1
    explication: "Si la configuration n'a pas changé, nginx n'est pas redémarré inutilement."
  - question: "Où déclare-t-on les machines gérées ?"
    choix: ["Dans le playbook uniquement", "Dans l'inventaire (fichier INI ou YAML), regroupées par groupes", "Dans /etc/hosts", "Dans Docker"]
    reponse: 1
    explication: "Exemple : un groupe [web] avec deux serveurs et un groupe [bdd] avec un serveur."
  - question: "Comment stocker un mot de passe utilisé par un playbook ?"
    choix: ["En clair dans le playbook", "Chiffré avec ansible-vault", "Dans le nom du fichier", "Dans un commentaire"]
    reponse: 1
    explication: "ansible-vault encrypt chiffre le fichier ; on peut le versionner dans Git sans exposer le secret."
---

## Le problème

Tu as appris à configurer un serveur à la main : `apt install`, édition des fichiers de configuration, `systemctl enable`, `ufw`. Maintenant, il y a **10 serveurs**. Et il faut que le 11e soit configuré **exactement** comme les autres, dans six mois.

Les scripts Bash aident, mais ils ne savent pas facilement « ne rien faire si c'est déjà fait ».

**Ansible** décrit l'**état voulu** des serveurs en YAML, et l'applique en SSH, sur 1 ou 1 000 machines.

| Outil | Rôle |
|---|---|
| **Terraform** | **créer** l'infrastructure (machines, réseaux), dans ton parcours cloud |
| **Ansible** | **configurer** ce qui tourne dessus (paquets, fichiers, services) |
| **Docker et Kubernetes** | emballer et déployer les applications |

## Les concepts

```
 Poste de contrôle (Ansible installé)
   │ inventaire : quels serveurs ?
   │ playbook : quel état voulu ?
   └──SSH──▶ web1, web2, bdd1 (rien à installer, à part Python)
```

| Terme | Définition |
|---|---|
| **Inventaire** | la liste des machines, regroupées par groupes |
| **Module** | une unité d'action idempotente : `apt`, `copy`, `template`, `service`, `user`, `ufw` |
| **Tâche** | un appel de module avec ses paramètres |
| **Playbook** | un fichier YAML qui applique des tâches à des groupes |
| **Rôle** | un ensemble réutilisable de tâches, gabarits et variables, comme « nginx » ou « postgresql » |

## L'installation et l'inventaire

```bash
python3 -m pip install --user ansible
ansible --version
```

```ini
# inventaire.ini
[web]
web1 ansible_host=192.168.56.11
web2 ansible_host=192.168.56.12

[bdd]
bdd1 ansible_host=192.168.56.21

[all:vars]
ansible_user=ali
ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

Pour s'entraîner, on utilise des VM (Vagrant, Multipass), des conteneurs avec SSH, ou simplement `localhost ansible_connection=local`.

```bash
ansible all -i inventaire.ini -m ping                 # test de connexion
ansible web -i inventaire.ini -m command -a "uptime"  # commande ponctuelle (mode ad hoc)
```

## Le premier playbook

```yaml
# site.yml
- name: Serveurs web
  hosts: web
  become: true                       # sudo
  vars:
    site_titre: "Boutique Saint Stack"
  tasks:
    - name: Installer nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Déployer la page d'accueil
      ansible.builtin.template:
        src: templates/index.html.j2
        dest: /var/www/html/index.html
        mode: "0644"

    - name: Déployer la configuration nginx
      ansible.builtin.template:
        src: templates/site.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: Recharger nginx        # ne déclenche le handler QUE si le fichier a changé

    - name: nginx démarré et activé au démarrage
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Pare-feu, SSH et HTTP autorisés
      community.general.ufw:
        rule: allow
        name: "{{ item }}"
      loop: ["OpenSSH", "Nginx Full"]

  handlers:
    - name: Recharger nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded
```

```html
<!-- templates/index.html.j2 : gabarit Jinja2, comme dans dbt -->
<h1>{{ site_titre }}</h1>
<p>Servi par {{ inventory_hostname }} ({{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }})</p>
```

```bash
ansible-playbook -i inventaire.ini site.yml --check --diff   # simulation : montre ce qui changerait
ansible-playbook -i inventaire.ini site.yml
```

**Le récapitulatif** (*PLAY RECAP*) s'interprète ainsi :

| Statut | Sens |
|---|---|
| `ok` | l'état était déjà le bon, rien n'a été fait |
| `changed` | Ansible a modifié quelque chose |
| `failed` | erreur |

**La preuve de l'idempotence** : on relance le playbook une seconde fois. On doit obtenir `changed=0`.

## Variables et rôles

Les variables peuvent venir du playbook, de `group_vars/web.yml`, de `host_vars/web1.yml` ou de la ligne de commande (`-e`). Les **facts** (`ansible_facts`) sont collectés automatiquement : système, IP, mémoire.

Un **rôle** se crée avec `ansible-galaxy init roles/nginx` :

```
roles/nginx/
├── tasks/main.yml
├── handlers/main.yml
├── templates/
├── defaults/main.yml      variables par défaut
└── meta/main.yml
```

```yaml
# site.yml devient très court
- hosts: web
  become: true
  roles: [commun, nginx]
- hosts: bdd
  become: true
  roles: [commun, postgresql]
```

## Les secrets avec Ansible Vault

```bash
ansible-vault create group_vars/bdd/secrets.yml       # contient : pg_password: "S3cr3t!"
ansible-playbook -i inventaire.ini site.yml --ask-vault-pass
```

Le fichier est **chiffré** (AES-256). On peut le commiter dans Git, mais **jamais** le mot de passe de déchiffrement.

## Démonstration

1. On crée deux VM avec Multipass, puis l'inventaire, puis `ansible -m ping`.
2. On écrit le playbook nginx, on lance `--check --diff`, puis l'exécution réelle : `changed=5`.
3. On relance : `changed=0`, ce qui prouve l'idempotence.
4. On modifie le titre du site : seul le fichier change, et le handler recharge nginx.
5. On transforme le playbook en rôle, puis on ajoute un rôle `commun` (paquets de base, utilisateur `deploy` avec sa clé SSH, durcissement de SSH vu en semaine 1).

## Exercice guidé

Écris un playbook `outils.yml` qui, sur `localhost` :

1. installe `htop`, `tree` et `curl` (une seule tâche, avec une liste) ;
2. crée l'utilisateur `formation`, dans le groupe `sudo` ;
3. crée le dossier `/opt/saint-stack`, avec le propriétaire `formation` et les droits `0750`.

Lance-le deux fois et compare les récapitulatifs.

## Exercice autonome

1. Écris un rôle `commun` qui fait les mises à jour de sécurité, crée un utilisateur `deploy` avec ta clé publique, désactive la connexion root et l'authentification par mot de passe en SSH (avec un handler pour recharger SSH), et active ufw.
2. Écris un rôle `docker` qui installe Docker depuis le dépôt officiel et ajoute `deploy` au groupe `docker`.
3. Écris un playbook qui déploie l'API boutique avec Docker Compose (module `community.docker.docker_compose_v2`) sur le groupe `web`.
4. Mets le mot de passe de la base dans un fichier chiffré par Vault.
5. Prouve l'idempotence avec une seconde exécution à `changed=0`.

## Correction

Exercice guidé :

```yaml
- name: Outils de base
  hosts: localhost
  connection: local
  become: true
  tasks:
    - ansible.builtin.apt:
        name: [htop, tree, curl]
        state: present
        update_cache: true
    - ansible.builtin.user:
        name: formation
        groups: sudo
        append: true
    - ansible.builtin.file:
        path: /opt/saint-stack
        state: directory
        owner: formation
        mode: "0750"
```

La première exécution donne `changed=3`. La seconde donne `changed=0` : c'est l'idempotence. Le seul cas où l'on verrait `changed=1` est l'option `update_cache`, qui peut être signalée comme un changement selon la version. On peut l'éviter avec `cache_valid_time: 3600`.

Exercice autonome, l'extrait clé du rôle `commun` :

```yaml
- name: Durcir SSH
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "^#?{{ item.cle }}"
    line: "{{ item.cle }} {{ item.valeur }}"
    validate: "sshd -t -f %s"          # refuse d'écrire une configuration invalide
  loop:
    - { cle: PermitRootLogin, valeur: "no" }
    - { cle: PasswordAuthentication, valeur: "no" }
  notify: Recharger ssh
```

`validate` reprend la bonne pratique de la séance SSH : vérifier la configuration **avant** de l'appliquer, pour ne pas se retrouver exclu du serveur.

## Pour aller plus loin

- **Molecule** teste les rôles Ansible dans des conteneurs.
- **AWX** et Ansible Automation Platform offrent une interface web, des planifications et des droits.
- Ansible gère aussi Windows (WinRM), les équipements réseau et le cloud.
