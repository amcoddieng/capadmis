export const politiqueConfidentialite = (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Politique de confidentialité — CapAdmis</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #1a1a1a; }
    h2 { color: #2c3e50; margin-top: 2rem; }
    p { margin: 0.5rem 0; }
    ul { padding-left: 1.5rem; }
    .date { color: #666; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>Politique de confidentialité — CapAdmis</h1>
  <p class="date"><strong>Dernière mise à jour :</strong> 17 août 2026</p>

  <h2>1. Qui sommes-nous</h2>
  <p>CapAdmis accompagne les étudiants dans leurs démarches d'orientation, d'admission universitaire et de visa étudiant pour les études en France et à l'étranger.</p>
  <p>Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter via <a href="https://capadmis.com/contact">capadmis.com/contact</a>.</p>

  <h2>2. Données que nous collectons</h2>
  <p>Dans le cadre de nos échanges, notamment via WhatsApp, nous pouvons collecter :</p>
  <ul>
    <li>Votre numéro de téléphone WhatsApp</li>
    <li>Votre prénom et, le cas échéant, votre nom</li>
    <li>Les informations que vous nous communiquez sur votre situation académique (BAC, filière, année d'obtention), votre projet d'études, votre domaine d'intérêt, votre pays de destination souhaité et votre niveau d'avancement dans vos démarches</li>
    <li>Le contenu de vos échanges avec notre assistante conversationnelle et/ou nos conseillers</li>
    <li>Les messages vocaux ou images que vous nous envoyez, le cas échéant transcrits ou analysés à des fins de compréhension de votre demande</li>
  </ul>

  <h2>3. Pourquoi nous collectons ces données</h2>
  <p>Ces informations sont utilisées pour :</p>
  <ul>
    <li>Comprendre votre projet d'études et évaluer si un accompagnement CapAdmis peut vous correspondre</li>
    <li>Vous mettre en relation avec un conseiller CapAdmis si votre profil et votre intention le justifient</li>
    <li>Assurer le suivi de nos échanges et améliorer la qualité de notre accompagnement</li>
    <li>Vous recontacter dans le cadre de nos services, y compris pour des relances liées à une conversation en cours</li>
  </ul>
  <p>Nous ne vendons pas vos données personnelles à des tiers.</p>

  <h2>4. Comment vos données sont stockées</h2>
  <p>Vos données sont conservées de manière sécurisée sur nos systèmes internes, pour la durée nécessaire au traitement de votre demande et au suivi de la relation commerciale, ou conformément aux durées imposées par la réglementation applicable.</p>

  <h2>5. Partage des données</h2>
  <p>Vos données peuvent être partagées avec les membres de l'équipe commerciale CapAdmis en charge du suivi de votre dossier. Elles peuvent également être traitées par nos prestataires techniques (hébergement, messagerie WhatsApp Business via Meta, outils d'intelligence artificielle utilisés pour la compréhension et la rédaction des réponses), dans la stricte mesure nécessaire au fonctionnement de nos services.</p>

  <h2>6. Vos droits</h2>
  <p>Vous pouvez à tout moment demander l'accès, la rectification ou la suppression des données vous concernant, en nous contactant via <a href="https://capadmis.com/contact">capadmis.com/contact</a>. Vous pouvez également, à tout moment, mettre fin à nos échanges sur WhatsApp.</p>

  <h2>7. Modifications de cette politique</h2>
  <p>Cette politique de confidentialité peut être mise à jour. La date de dernière mise à jour figure en haut de cette page.</p>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
};
//# sourceMappingURL=legalController.js.map