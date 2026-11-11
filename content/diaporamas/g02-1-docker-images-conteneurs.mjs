// Diaporama soigné du cours (remplace la version automatique). Porté de diaporamas/reference/docker.js.
// Titre d'origine : « Docker : conteneuriser une application ». Les icônes viennent de lucide-static, les couleurs du sujet (d.C).
// Appelé par tools/diaporamas/generer.mjs avec l'objet `d` du gabarit (tools/diaporamas/gabarit.mjs).
export const titre = 'Docker : conteneuriser une application';

export default async function diaporama(d) {
  const HEX = d.C;

  await d.couverture('Docker', 'Conteneuriser une application');
  d.plan(['Pourquoi Docker ?', 'Images et conteneurs', 'Les commandes de base', 'Le Dockerfile', 'Volumes et réseaux', 'Docker Compose', 'Mise en pratique']);

  // 01
  await d.separateur('01', 'Pourquoi Docker ?');
  {
    const s = d.contenu('« Ça marche sur ma machine »');
    d.texte(s, [
      { text: 'Une application dépend de tout un environnement : version de Node ou de Python, bibliothèques, base de données, variables… D’un ordinateur à l’autre, il change, et l’application casse.', options: { breakLine: true } },
      { text: 'Docker emballe l’application ', options: {} }, { text: 'avec tout ce dont elle a besoin', options: { bold: true } },
      { text: ' dans un conteneur, qui tourne de la même façon partout.', options: {} },
    ], 0.6, 1.25, 4.0, 2.8, 14);
    await d.cartes(s, [
      ['copy', 'Portable', 'Même résultat en dev, en test et en production'],
      ['feather', 'Léger', 'Démarre en quelques secondes'],
      ['layers', 'Isolé', 'Chaque service a son propre environnement'],
      ['share-2', 'Partageable', 'Une image se publie et se télécharge'],
    ], { x0: 4.95, y0: 1.2, w: 2.0, h: 1.35, gx: 0.15, gy: 0.15, tailleT: 12, tailleD: 11 });
  }
  {
    const s = d.contenu('Machine virtuelle ou conteneur ?');
    d.tableau(s, ['Critère', 'Machine virtuelle', 'Conteneur Docker'], [
      ['Contenu', 'Un système d’exploitation complet', 'L’application et ses dépendances'],
      ['Noyau', 'Le sien', 'Partagé avec la machine hôte'],
      ['Démarrage', 'Plusieurs minutes', 'Quelques secondes'],
      ['Taille', 'Plusieurs gigaoctets', 'Quelques dizaines de mégaoctets'],
      ['Usage typique', 'Isoler un système entier', 'Livrer et faire tourner des applications'],
    ], { colW: [1.6, 2.95, 2.95] });
  }

  // 02
  await d.separateur('02', 'Images et conteneurs');
  {
    const s = d.contenu('Image, conteneur, registre');
    const blocs = [
      ['archive', 'Image', 'Le modèle figé : code, dépendances et configuration. Comme une recette.'],
      ['box', 'Conteneur', 'Une image en cours d’exécution. On peut en lancer plusieurs à partir d’une seule image.'],
      ['cloud', 'Registre', 'L’endroit où l’on stocke et partage les images, comme Docker Hub.'],
    ];
    for (const [i, b] of blocs.entries()) {
      await d.cartes(s, [b], { x0: 0.6 + i * 2.6, y0: 1.3, cols: 1, w: 2.3, h: 1.9, tailleT: 15, tailleD: 12 });
      if (i < 2) s.addText('→', { x: 2.9 + i * 2.6, y: 1.95, w: 0.3, h: 0.5, fontSize: 22, bold: true, color: HEX.principale, align: 'center', margin: 0, isTextBox: true });
    }
    d.code(s, 'docker pull postgres:17   # télécharger une image\ndocker run postgres:17    # créer et lancer un conteneur', 0.6, 3.45, 7.4, 0.8, { taille: 11 });
  }

  // 03
  await d.separateur('03', 'Les commandes de base');
  {
    const s = d.contenu('Les commandes à connaître');
    d.tableau(s, ['Commande', 'Rôle'], [
      ['docker run -d -p 8080:80 nginx', 'Lancer un conteneur en arrière-plan, port 8080 vers 80'],
      ['docker ps', 'Lister les conteneurs en cours (-a : tous)'],
      ['docker logs -f <nom>', 'Suivre les journaux d’un conteneur'],
      ['docker exec -it <nom> sh', 'Ouvrir un terminal dans le conteneur'],
      ['docker stop <nom>', 'Arrêter un conteneur'],
      ['docker rm <nom>', 'Supprimer un conteneur arrêté'],
      ['docker images', 'Lister les images présentes'],
    ], { colW: [3.6, 3.9], taille: 12 });
  }

  // 04
  await d.separateur('04', 'Le Dockerfile');
  {
    const s = d.contenu('Écrire un Dockerfile');
    d.code(s, 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nUSER node\nEXPOSE 3000\nCMD ["node", "index.js"]', 0.6, 1.25, 3.6, 3.0, { titre: 'Dockerfile', taille: 12 });
    d.tableau(s, ['Instruction', 'Rôle'], [
      ['FROM', 'Image de départ'],
      ['WORKDIR', 'Dossier de travail'],
      ['COPY', 'Copier des fichiers'],
      ['RUN', 'Exécuter pendant la construction'],
      ['USER', 'Ne pas tourner en root'],
      ['EXPOSE', 'Port utilisé (documentation)'],
      ['CMD', 'Commande au démarrage'],
    ], { x: 4.5, y: 1.25, colW: [1.15, 2.3], taille: 11 });
  }
  {
    const s = d.contenu('Construire et lancer son image');
    d.etapes(s, [
      ['Construire', 'Depuis le dossier du projet', 'docker build\n-t mon-api .'],
      ['Lancer', 'Port 3000 du conteneur exposé', 'docker run -d\n-p 3000:3000\nmon-api'],
      ['Vérifier', 'Ouvrir dans le navigateur', 'localhost:3000'],
      ['Publier', 'Sur Docker Hub', 'docker push\nmoi/mon-api'],
    ]);
    s.addText([{ text: 'Bonnes pratiques : ', options: { bold: true } }, { text: 'un fichier .dockerignore (node_modules, .env), une image de base légère, un utilisateur non root, et jamais de secret dans l’image.', options: {} }],
      { x: 0.6, y: 4.25, w: 7.3, h: 0.6, fontSize: 12, color: HEX.texte, margin: 0, isTextBox: true });
  }

  // 05
  await d.separateur('05', 'Volumes et réseaux');
  {
    const s = d.contenu('Garder ses données, relier ses conteneurs');
    await d.cartes(s, [
      ['hard-drive', 'Volume', 'Les données survivent à la suppression du conteneur. Indispensable pour une base de données.'],
      ['network', 'Réseau', 'Les conteneurs d’un même réseau se joignent par leur nom : l’API appelle « db ».'],
    ], { y0: 1.2, w: 3.6, h: 1.45 });
    d.code(s, 'docker volume create pgdata\ndocker network create app\ndocker run -d --name db --network app \\\n  -v pgdata:/var/lib/postgresql/data \\\n  -e POSTGRES_PASSWORD=secret postgres:17', 0.6, 2.85, 7.4, 1.55, { taille: 11 });
  }

  // 06
  await d.separateur('06', 'Docker Compose');
  {
    const s = d.contenu('Toute l’application dans un fichier');
    d.code(s, 'services:\n  api:\n    build: .\n    ports: ["3000:3000"]\n    environment:\n      DATABASE_URL: postgres://app:secret@db:5432/app\n    depends_on: [db]\n  db:\n    image: postgres:17\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: secret\n    volumes: [pgdata:/var/lib/postgresql/data]\nvolumes:\n  pgdata:', 0.6, 1.15, 4.9, 3.85, { titre: 'compose.yaml', taille: 10 });
    d.tableau(s, ['Commande', 'Rôle'], [
      ['docker compose up -d', 'Tout lancer'],
      ['docker compose ps', 'État des services'],
      ['docker compose logs -f api', 'Journaux de l’API'],
      ['docker compose down', 'Tout arrêter'],
    ], { x: 5.65, y: 1.15, colW: [2.05, 1.2], taille: 10 });
  }

  // 07
  await d.separateur('07', 'Mise en pratique');
  {
    const s = d.contenu('Mise en pratique');
    await d.ressources(s, [
      ['book-open', 'Documentation officielle', 'docs.docker.com', 'https://docs.docker.com/get-started/'],
      ['play', 'Play with Docker', 'Un environnement Docker gratuit en ligne', 'https://labs.play-with-docker.com/'],
      ['graduation-cap', 'Cours MeredianStack', 'Docker, images et conteneurs', null],
    ], 'Écris le Dockerfile d’une petite API Node, puis un compose.yaml qui la lance avec PostgreSQL. Arrête tout, relance : les données doivent toujours être là.');
  }

}
