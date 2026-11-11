// Diaporama soigné du cours (remplace la version automatique). Porté de diaporamas/reference/langage-c.js.
// Titre d'origine : « Langage C : les bases de la programmation ». Les icônes viennent de lucide-static, les couleurs du sujet (d.C).
// Appelé par tools/diaporamas/generer.mjs avec l'objet `d` du gabarit (tools/diaporamas/gabarit.mjs).
export const titre = 'Langage C : les bases de la programmation';

export default async function diaporama(d) {
  const HEX = d.C;

  await d.couverture('Langage C', 'Les bases de la programmation');
  d.plan(['Pourquoi le C ?', 'Premier programme', 'Variables et types', 'Conditions et boucles', 'Les fonctions', 'Tableaux et pointeurs', 'Mise en pratique']);

  // 01
  await d.separateur('01', 'Pourquoi le C ?');
  {
    const s = d.contenu('Le C en quelques mots');
    d.texte(s, [
      { text: 'Créé en 1972 par Dennis Ritchie aux laboratoires Bell pour écrire le système Unix, le C est un langage ', options: {} },
      { text: 'compilé', options: { bold: true } }, { text: ', ', options: {} }, { text: 'proche de la machine', options: { bold: true } },
      { text: ' et toujours parmi les plus utilisés au monde.', options: { breakLine: true } },
      { text: 'L’apprendre en premier, c’est comprendre ce que font vraiment la mémoire et le processeur.', options: {} },
    ], 0.6, 1.25, 4.1, 2.6, 14);
    await d.cartes(s, [
      ['square-terminal', 'Systèmes', 'Linux, Windows, macOS'],
      ['cpu', 'Embarqué', 'Arduino, objets connectés'],
      ['database', 'Bases de données', 'PostgreSQL, SQLite'],
      ['code-xml', 'Autres langages', 'Python et PHP sont écrits en C'],
    ], { x0: 5.0, y0: 1.2, w: 1.95, h: 1.3, gx: 0.15, gy: 0.15, tailleT: 12, tailleD: 11 });
  }
  {
    const s = d.contenu('Du code source à l’exécutable');
    d.etapes(s, [
      ['Écrire', 'Le code source dans un fichier .c', 'bonjour.c'],
      ['Compiler', 'gcc traduit en langage machine', 'gcc -Wall\nbonjour.c\n-o bonjour'],
      ['Corriger', 'Lire les erreurs et les avertissements', 'error:\nexpected \';\''],
      ['Exécuter', 'Lancer le programme obtenu', './bonjour'],
    ]);
  }

  // 02
  await d.separateur('02', 'Premier programme');
  {
    const s = d.contenu('Bonjour, Dakar !');
    d.code(s, '#include <stdio.h>\n\nint main(void) {\n    printf("Bonjour, Dakar !\\n");\n    return 0;\n}', 0.6, 1.25, 3.9, 2.3, { titre: 'bonjour.c', taille: 12 });
    d.tableau(s, ['Élément', 'Rôle'], [
      ['#include', 'Donne accès à printf et scanf'],
      ['main', 'Point de départ du programme'],
      ['{ }', 'Délimitent un bloc d’instructions'],
      ['printf', 'Affiche du texte ; \\n passe à la ligne'],
      ['return 0', 'Signale que tout s’est bien passé'],
    ], { x: 4.8, y: 1.25, colW: [1.1, 2.4], taille: 12 });
  }

  // 03
  await d.separateur('03', 'Variables et types');
  {
    const s = d.contenu('Variables, types et affichage');
    d.tableau(s, ['Type', 'Contient', 'Exemple', 'Format'], [
      ['int', 'Un entier', '19', '%d'],
      ['double', 'Un nombre à virgule', '13.75', '%f'],
      ['char', 'Un caractère', '\'A\'', '%c'],
    ], { x: 0.6, colW: [1.0, 1.9, 1.0, 0.9] });
    d.code(s, 'int age = 19;\ndouble moyenne = 13.75;\n\nprintf("%d ans, %.2f/20\\n",\n       age, moyenne);\nscanf("%d", &age);', 0.6, 2.85, 4.8, 2.0, { taille: 11 });
    s.addText([
      { text: 'Attention', options: { bold: true, color: HEX.sombre, breakLine: true } },
      { text: '17 / 5 vaut 3 : entre deux entiers, la division est entière. Écris 17.0 / 5 pour obtenir 3.4.', options: {} },
    ], { x: 5.75, y: 1.3, w: 2.3, h: 1.6, fontSize: 12, color: HEX.texte, margin: 0.12, fill: { color: HEX.claire }, valign: 'top', isTextBox: true });
  }

  // 04
  await d.separateur('04', 'Conditions et boucles');
  {
    const s = d.contenu('Décider : if, else if, else');
    d.code(s, 'if (moyenne >= 16) {\n    printf("Très bien\\n");\n} else if (moyenne >= 10) {\n    printf("Admis\\n");\n} else {\n    printf("Ajourné\\n");\n}', 0.6, 1.25, 4.3, 2.5, { titre: 'Conditions', taille: 12 });
    d.tableau(s, ['Opérateur', 'Sens'], [['==', 'égal à'], ['!=', 'différent de'], ['&&', 'ET'], ['||', 'OU'], ['!', 'NON']], { x: 5.3, y: 1.25, colW: [1.1, 1.6] });
    s.addText('= affecte une valeur, == compare. Ne les confonds pas.', { x: 5.3, y: 3.6, w: 2.7, h: 0.6, fontSize: 12, italic: true, color: HEX.doux, margin: 0, isTextBox: true });
  }
  {
    const s = d.contenu('Répéter : les trois boucles');
    const boucles = [
      ['for', 'Nombre de tours connu', 'for (int i = 1;\n     i <= 10; i++) {\n  printf("%d\\n", i);\n}'],
      ['while', 'Tant qu’une condition est vraie', 'while (solde > 0) {\n  solde -= 5000;\n}'],
      ['do while', 'Au moins un tour', 'do {\n  scanf("%d", &note);\n} while (note < 0\n      || note > 20);'],
    ];
    boucles.forEach(([t, dsc, c], i) => {
      const x = 0.6 + i * 2.55;
      s.addText(t, { x, y: 1.25, w: 2.35, h: 0.4, fontSize: 16, bold: true, fontFace: 'Courier New', color: HEX.sombre, margin: 0, isTextBox: true });
      s.addText(dsc, { x, y: 1.65, w: 2.35, h: 0.4, fontSize: 12, color: HEX.doux, margin: 0, isTextBox: true });
      d.code(s, c, x, 2.1, 2.35, 1.75, { taille: 10.5 });
    });
  }

  // 05
  await d.separateur('05', 'Les fonctions');
  {
    const s = d.contenu('Découper son programme en fonctions');
    d.code(s, 'double moyenne(double a, double b) {\n    return (a + b) / 2;\n}\n\nint main(void) {\n    printf("%.2f\\n", moyenne(12, 15));\n    return 0;\n}', 0.6, 1.25, 4.6, 2.75, { titre: 'Définir puis appeler', taille: 11 });
    await d.cartes(s, [
      ['log-in', 'Paramètres', 'Les données reçues'],
      ['log-out', 'return', 'La valeur renvoyée'],
      ['copy', 'Par valeur', 'La fonction reçoit une copie'],
    ], { x0: 5.5, y0: 1.2, cols: 1, w: 2.5, h: 0.98, gy: 0.1, tailleT: 13, tailleD: 11 });
  }

  // 06
  await d.separateur('06', 'Tableaux et pointeurs');
  {
    const s = d.contenu('Tableaux et pointeurs');
    d.code(s, 'int notes[4] = {12, 15, 9, 18};\nnotes[0];   /* 12 : 1re case */\nnotes[3];   /* 18 : dernière */\n\nint x = 7;\nint *p = &x; /* adresse de x */\n*p = 42;     /* x vaut 42 */', 0.6, 1.25, 4.4, 2.6, { taille: 11 });
    const cases = ['12', '15', '9', '18'];
    cases.forEach((v, i) => {
      const x = 5.35 + i * 0.68;
      s.addShape(d.S.RECTANGLE, { x, y: 1.6, w: 0.62, h: 0.55, fill: { color: HEX.blanc }, line: { color: HEX.principale, width: 1.5 } });
      s.addText(v, { x, y: 1.6, w: 0.62, h: 0.55, fontSize: 14, bold: true, color: HEX.texte, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText(String(i), { x, y: 2.18, w: 0.62, h: 0.3, fontSize: 10, color: HEX.doux, align: 'center', margin: 0, isTextBox: true });
    });
    s.addText('Les indices vont de 0 à taille − 1', { x: 5.35, y: 1.2, w: 2.8, h: 0.35, fontSize: 11, bold: true, color: HEX.sombre, margin: 0, isTextBox: true });
    s.addText([{ text: 'Un pointeur', options: { bold: true, breakLine: true } }, { text: 'contient l’adresse d’une variable : avec *p, on lit ou modifie la valeur située à cette adresse.', options: {} }],
      { x: 5.35, y: 2.65, w: 2.65, h: 1.15, fontSize: 12, color: HEX.texte, margin: 0.1, fill: { color: HEX.claire }, valign: 'top', isTextBox: true });
  }

  // 07
  await d.separateur('07', 'Mise en pratique');
  {
    const s = d.contenu('Mise en pratique');
    await d.ressources(s, [
      ['book-open', 'cppreference.com', 'La référence du langage C', 'https://en.cppreference.com/w/c'],
      ['play', 'OnlineGDB', 'Compiler en ligne, sans installer', 'https://www.onlinegdb.com/online_c_compiler'],
      ['graduation-cap', 'Cours Saint Stack Academy', 'Langage C : premier programme, variables et types', null],
    ], 'Écris un programme qui lit 5 notes, affiche la moyenne, la meilleure note et le nombre d’admis (note ≥ 10). Refuse toute note hors de 0 à 20.');
  }

}
