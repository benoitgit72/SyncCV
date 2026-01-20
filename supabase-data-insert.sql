-- ============================================
-- Script d'insertion des données de Ron More (Benoit Gaulin)
-- À exécuter APRÈS avoir créé votre utilisateur dans Supabase Auth
-- ============================================

-- IMPORTANT: Remplacez 'YOUR_USER_ID_HERE' par l'UUID de votre utilisateur
-- Pour trouver votre UUID:
-- 1. Allez dans Authentication → Users dans Supabase
-- 2. Trouvez l'utilisateur Ron More
-- 3. Copiez son UUID (format: 12345678-1234-1234-1234-123456789abc)

-- Variable pour stocker l'ID utilisateur (à remplacer)
-- Vous pouvez aussi exécuter ce script en remplaçant directement 'd5b317b1-34ba-4289-8d40-11fd1b584315' par votre UUID

-- ============================================
-- 1. Insérer les informations personnelles
-- ============================================

INSERT INTO cv_info (user_id, nom, titre, bio, linkedin, photo_url)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Ron More',
  'Chef de Projet Technique | Expert SAS & Leader TI',
  'Professionnel expérimenté en SAS et TI, agissant comme Chef de Projet Technique, expert TI et leader SAS. Mes 29 années d''expérience m''ont donné l''occasion de m''impliquer dans un vaste nombre d''industries telles que l''Assurance, la Banque, la Fabrication, les Installations et le Gouvernement. Depuis plus de 15 ans maintenant, j''occupe divers rôles de direction et de gestion. J''aide les organisations à concevoir, construire et opérationnaliser des solutions afin qu''elles puissent être ou rester des leaders dans leurs domaines respectifs.',
  'https://www.linkedin.com/in/benoit-gaulin-a6a8a43/',
  'photo-profile.jpg'
)
ON CONFLICT (user_id) DO UPDATE
SET
  nom = EXCLUDED.nom,
  titre = EXCLUDED.titre,
  bio = EXCLUDED.bio,
  linkedin = EXCLUDED.linkedin,
  photo_url = EXCLUDED.photo_url;

-- ============================================
-- 2. Insérer les expériences professionnelles (18 expériences)
-- ============================================

-- Expérience 1: Consultant en Migration SAS Viya (2024-Présent)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Consultant en Migration SAS Viya',
  'Banque Nationale | EY',
  '2024-12-01',
  NULL,
  TRUE,
  'Soutenir la migration des programmes SAS 9 vers SAS Viya, en fournissant un leadership technique et une expertise en développement de programmes SAS.

Réalisations:
• Réalisé une évaluation complète de l''environnement SAS 9 du client
• Dirigé le remue-méninges de solutions pour les incompatibilités et défini le mappage source-cible
• Coordonné les efforts d''intégration avec d''autres équipes techniques
• Facilité le transfert de connaissances et la formation pour les équipes clientes',
  ARRAY['SAS Viya', 'SAS 9', 'Migration', 'Leadership Technique'],
  1
);

-- Expérience 2: Responsable de la Livraison - Migration SAS (2023-2024)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Responsable de la Livraison - Migration SAS',
  'EDC | Accenture',
  '2023-08-01',
  '2024-11-01',
  FALSE,
  'Dirigé la livraison de bout en bout des projets de migration SAS, supervisant la transformation et la modernisation des solutions d''intelligence d''affaires.

Réalisations:
• Livré des applications SAS performantes alignées avec la stratégie cloud SAS du client
• Dirigé des équipes distantes diversifiées et favorisé des relations collaboratives
• Appliqué les méthodologies Agile (SCRUM, Kanban) et MS Project
• Réalisé des analyses d''écarts et d''impacts pour des applications complexes et interdépendantes',
  ARRAY['SAS', 'Migration Cloud', 'Agile', 'SCRUM', 'Kanban', 'Leadership'],
  2
);

-- Expérience 3: Responsable de la Livraison / Chef de Projet IFRS 17 - BN (2022-2023)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Responsable de la Livraison / Chef de Projet IFRS 17',
  'Banque Nationale | EY',
  '2022-06-01',
  '2023-08-01',
  FALSE,
  'Supervisé la gestion quotidienne de l''implémentation IFRS 17 dans le cadre du Programme de Conformité Financière et de Modernisation.

Réalisations:
• Géré une équipe complète de développement TI de 16 membres
• Préparé une feuille de route complète de 2 ans pour la solution IFRS 17
• Présenté l''état du projet au Comité Exécutif mensuellement
• Dirigé les stratégies pour les tests, l''opérationnalisation, le plan de reprise après sinistre et la migration cloud',
  ARRAY['Gestion de Projet', 'IFRS 17', 'Leadership', 'Cloud Migration'],
  3
);

-- Expérience 4: Responsable de la Livraison / Chef de Projet IFRS 17 - Intact (2020-2022)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Responsable de la Livraison / Chef de Projet IFRS 17',
  'Intact Corporation Financière | EY',
  '2020-02-01',
  '2022-06-01',
  FALSE,
  'Dirigé deux initiatives critiques IFRS 17 gérant la Conception & Développement ETL et les projets d''Opérationnalisation.

Réalisations:
• Assemblé et géré une équipe complète de 15 ressources à partir de zéro
• Livré des flux de travail ETL utilisant SAS Data Integration Studio dans les délais et le budget
• Orchestré la migration technologique de SAS vers Informatica/Oracle
• Coordonné la planification de reprise après sinistre et de haute disponibilité',
  ARRAY['ETL', 'SAS DI Studio', 'Informatica', 'Oracle', 'Gestion d''Équipe'],
  4
);

-- Expérience 5: Expert et Leader de la Pratique de Développement SAS (2016-2020)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Expert et Leader de la Pratique de Développement SAS',
  'Banque Nationale',
  '2016-02-01',
  '2020-02-01',
  FALSE,
  'Dirigé la pratique de développement SAS gérant une équipe de 8 ressources administrant la plateforme SAS 9.4.

Réalisations:
• Établi un Centre d''Excellence SAS fournissant formation et expertise technique
• Réduit les incidents du système de production à près de 0% au cours de la première année
• Augmenté l''adoption organisationnelle de SAS de 150 à 450 utilisateurs
• Développé et livré un portfolio complet de formation de 12 cours SAS',
  ARRAY['SAS 9.4', 'Centre d''Excellence', 'Formation', 'Leadership', 'Administration'],
  5
);

-- Expérience 6: Pause Sabbatique (2015-2016)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Pause Sabbatique',
  'Année de Ressourcement Personnel',
  '2015-04-01',
  '2016-02-01',
  FALSE,
  'Après plus de 20 ans de carrière remplie de grands défis, j''ai décidé de prendre une année sabbatique pour me ressourcer et réaliser des rêves personnels.

Réalisations:
• Voyagé à travers le monde en visitant certaines des plus grandes villes avec mon sac à dos
• Complété une randonnée en montagne de 230 km en Islande
• Maintenu une bonne forme physique avec des randonnées régulières dans les Adirondacks, au Vermont et au Québec
• Réalisé deux rêves de ma liste : apprendre à jouer du piano et écrire 25 articles de blog humoristiques',
  ARRAY['Développement Personnel', 'Voyage', 'Créativité'],
  6
);

-- Expérience 7: Chef de Développement SAS - TD Assurance (2013-2015)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Chef de Développement SAS',
  'TD Assurance',
  '2013-03-01',
  '2015-04-01',
  FALSE,
  'En tant que Chef de Développement, j''étais responsable d''assurer que toutes les étapes des projets SAS dans le cycle de vie du développement logiciel suivent et respectent les meilleures pratiques de l''industrie et de l''organisation.

Réalisations:
• Effectué des évaluations de faisabilité sur des sujets techniques et approuvé les artefacts techniques
• Dirigé l''écriture des standards de conception interne SAS
• Géré les flux de développement et créé des packages de déploiement avec le logiciel de contrôle Accurev
• Participé à tous les projets SAS pour du soutien consultatif et assisté les architectes dans le processus de conception',
  ARRAY['SAS', 'Standards', 'Accurev', 'SDLC', 'Architecture'],
  7
);

-- Expérience 8: Chef de Développement SAS - Desjardins (2012-2013)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Chef de Développement SAS',
  'Desjardins',
  '2012-02-01',
  '2013-01-01',
  FALSE,
  'Dirigé, encadré et soutenu les membres de l''équipe (10 personnes) pour améliorer et maintenir des pratiques de codage SAS de haute qualité.

Réalisations:
• Redesigné et optimisé tous les programmes SAS produisant les rapports de tableaux de bord marketing annuels
• Réduit l''échelle totale des programmes de 20 000 à 6 000 lignes de code
• Diminué le temps global requis pour extraire et traiter les données de 40%
• Simplifié grandement les programmes pour les rendre plus faciles à modifier et déboguer',
  ARRAY['SAS', 'Optimisation', 'Coaching', 'Reporting'],
  8
);

-- Expérience 9: Chef de Développement SAS - TD Assurance (2008-2012)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Chef de Développement SAS',
  'TD Assurance',
  '2008-10-01',
  '2012-02-01',
  FALSE,
  'Fourni des conseils techniques à l''ensemble de l''organisation concernant les technologies SAS déjà en place mais aussi sur les futures. Agi comme leader pour les programmeurs-analystes SAS (35 personnes) répartis sur divers projets.

Réalisations:
• Fourni un soutien sur les meilleures façons d''améliorer l''infrastructure en place (200 utilisateurs, 850 utilisateurs de rapports Web)
• Préparé et fourni des formations SAS personnalisées à travers l''organisation
• Rédigé et maintenu les standards de codage SAS à l''échelle de l''entreprise
• Pris en charge les problèmes opérationnels les plus complexes et fourni du soutien technique avec une très bonne connaissance des environnements UNIX',
  ARRAY['SAS', 'UNIX', 'Formation', 'Standards', 'Infrastructure'],
  9
);

-- Expérience 10: Analyste d''Affaires SAP (2007-2008)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Analyste d''Affaires SAP',
  'Hydro-Québec',
  '2007-05-01',
  '2008-10-01',
  FALSE,
  'Gestion du support des calendriers de travaux de production pour SAP BW (Business Warehouse) avec support opérationnel 24/7.

Réalisations:
• Géré deux calendriers de travaux de production pour le système de facturation et le système client
• Appris à évaluer les impératifs et urgences provenant de deux gigantesques systèmes de production par lots
• Assuré un support opérationnel 24/7 avec téléavertisseurs
• Expérience précieuse en gestion de systèmes de planification et par lots',
  ARRAY['SAP BW', 'Gestion de Production', 'Support 24/7'],
  10
);

-- Expérience 11: Architecte Fonctionnel, Spécialiste SAS (2006-2007)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Architecte Fonctionnel, Spécialiste SAS',
  'Hydro-Québec',
  '2006-01-01',
  '2007-04-01',
  FALSE,
  'Participé à la reconception du système, la reprogrammation et la migration de Mainframe vers UNIX. Le nouveau système cible incluait plusieurs technologies telles qu''Oracle, Java et SAS.

Réalisations:
• Travaillé avec l''équipe d''architecture pour concevoir le nouveau plan d''architecture du système
• Redesigné une nouvelle architecture système et framework pour les programmes et le stockage dans SAS
• Mis en place une interface de communication entre SAS et Oracle via des plug-ins Java
• Assisté l''équipe de développement dans la programmation de nouveaux codes sources et résolu des problèmes de performance',
  ARRAY['SAS', 'Oracle', 'Java', 'Architecture', 'Migration Mainframe'],
  11
);

-- Expérience 12: Spécialiste SAS (2005)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Spécialiste SAS',
  'Hydro-Québec',
  '2005-07-01',
  '2005-12-01',
  FALSE,
  'Développé une application d''interface graphique SAS/AF utilisée pour recueillir des données, présenter et analyser des informations sur la consommation d''énergie pour la Province de Québec.

Réalisations:
• Conçu et programmé l''exécution du code client/serveur répartie entre SAS PC local et SAS distant sur Unix
• Conçu et construit des interfaces graphiques interactives avec le module SAS/ETS pour les prévisions de séries temporelles
• Préparé et exécuté les tests unitaires et intégrés
• Formé les utilisateurs de la solution et les programmeurs en charge du support et de la maintenance',
  ARRAY['SAS/AF', 'SAS/ETS', 'Client/Serveur', 'Prévisions'],
  12
);

-- Expérience 13: Administrateur Système SAS - BAT (2002-2005)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Administrateur Système SAS',
  'BAT',
  '2002-11-01',
  '2005-06-01',
  FALSE,
  'Pris en charge le remplacement de l''administrateur système. Mon rôle a principalement changé en diverses activités clés telles que l''administration et la gestion du système SAS actuel en place.

Réalisations:
• Géré et mis à jour les données et programmes système
• Conçu et construit un outil de déploiement sur les ordinateurs portables des utilisateurs professionnels
• Fourni un support technique et de programmation aux utilisateurs professionnels
• Mis en place la gestion du contrôle logiciel SAS',
  ARRAY['Administration SAS', 'Déploiement', 'Support Technique'],
  13
);

-- Expérience 14: Programmeur-Analyste SAS - BAT (2002)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Programmeur-Analyste SAS',
  'BAT',
  '2002-03-01',
  '2002-11-01',
  FALSE,
  'Construction et programmation d''écrans de requête interactifs SAS/AF utilisés pour produire dynamiquement des rapports texte, HTML et Excel utilisés par les représentants marketing et ventes.

Réalisations:
• Programmation client/serveur avec SAS/Connect
• Création de 5 générateurs de rapports dynamiques représentant plus de 15 000 lignes de code
• Couplage et transfert de données entre les technologies SAS et Cognos
• Support utilisateur SAS à travers toute l''organisation',
  ARRAY['SAS/AF', 'SAS/Connect', 'Cognos', 'Reporting Dynamique'],
  14
);

-- Expérience 15: Programmeur-Analyste SAS - SAAQ (2001-2002)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Programmeur-Analyste SAS',
  'SAAQ | Société de l''Assurance Automobile du Québec',
  '2001-04-01',
  '2002-02-01',
  FALSE,
  'Dans ce projet actuariel, l''objectif était de mettre en œuvre une solution ETL SAS pour le client. Cette nouvelle solution remplaçait le codage SAS/IML effectué par les actuaires.

Réalisations:
• Programmé des plug-ins en utilisant le langage de composants SAS (SCL)
• Rédigé des artefacts d''exigences fonctionnelles associés à chaque plug-in
• Rédigé et conduit des cas de tests
• Fourni un support technique des plug-ins au client',
  ARRAY['SAS', 'SAS/IML', 'SCL', 'ETL', 'Actuariat'],
  15
);

-- Expérience 16: Programmeur-Analyste SAS - Nortel (1999-2001)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Programmeur-Analyste SAS',
  'Nortel Networks',
  '1999-03-01',
  '2001-03-01',
  FALSE,
  'Développement d''une nouvelle interface graphique SAS/AF permettant à l''administrateur de configurer des scénarios de calcul personnalisés pour les métriques de qualité sur l''assemblage de cartes réseau.

Réalisations:
• Conduit des sessions d''exigences avec le client
• Programmé des pages html interactives avec Javascript et htmSQL pour permettre aux utilisateurs de personnaliser la sortie
• Créé environ treize écrans interactifs avec SAS/AF
• Préparé des cas de tests et effectué des tests unitaires et système, formé les utilisateurs',
  ARRAY['SAS/AF', 'JavaScript', 'htmSQL', 'Qualité'],
  16
);

-- Expérience 17: Administrateur de Système d''Information SAS - Citibank (1996-1999)
INSERT INTO experiences (user_id, titre, entreprise, periode_debut, periode_fin, en_cours, description, competences, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Administrateur de Système d''Information SAS',
  'Citibank',
  '1996-02-01',
  '1999-03-01',
  FALSE,
  'Géré le système d''information du département de risque de crédit. Programmation SAS pour produire des rapports périodiques pour les départements Marketing, Nouveaux Clients, Risque de Crédit, Recouvrement de Dettes et Investigation de Fraude.

Réalisations:
• Produit et présenté des rapports de synthèse mensuels à la direction
• Programmé de nouvelles analyses et rapports sur les profils clients et les risques en général
• Conçu et développé trois bases de données relationnelles Microsoft Access
• Configuré des campagnes marketing sortantes et préparé un plan d''action pour l''adaptation Y2K',
  ARRAY['SAS', 'Microsoft Access', 'Risque de Crédit', 'Reporting'],
  17
);

-- ============================================
-- 3. Insérer les formations et certifications
-- ============================================

-- Formation 1: Certifications SAS
INSERT INTO formations (user_id, diplome, institution, annee_debut, annee_fin, description, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Certifications et Formation SAS',
  'Institut SAS',
  2008,
  2024,
  'Migration de SAS 9.4 vers Viya (2024)
Installation et Configuration de la Plateforme SAS Intelligence (2020)
Administration de la Plateforme des Technologies d''Intégration SAS (2017)
Certification Professionnelle - SAS 9 Avancé (2012)
Certification Professionnelle - Programmeur SAS Avancé (2008)',
  1
);

-- Formation 2: Formation Professionnelle Additionnelle
INSERT INTO formations (user_id, diplome, institution, annee_debut, annee_fin, description, ordre)
VALUES (
  'd5b317b1-34ba-4289-8d40-11fd1b584315',
  'Formation Professionnelle Additionnelle',
  'Divers Instituts',
  1999,
  2005,
  'Méthodologie DMR Macroscope Productivity+ (2001)
Améliorations des Processus Six Sigma (1999)
Développement Orienté Objet avec SAS/AF (1999)
Certifications Cognos BI (PowerPlay & Impromptu)
Visual Basic .NET (2005)',
  2
);

-- ============================================
-- 4. Insérer les compétences
-- ============================================

-- SAS Technologies
INSERT INTO competences (user_id, categorie, competence, niveau, ordre) VALUES
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'SAS Technologies', 'SAS Viya & SAS 9.4', 'Expert', 1),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'SAS Technologies', 'SAS Base & Macro', 'Expert', 2),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'SAS Technologies', 'Enterprise Guide & Studio', 'Avancé', 3),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'SAS Technologies', 'Integration Technologies', 'Expert', 4);

-- Programmation et Bases de Données
INSERT INTO competences (user_id, categorie, competence, niveau, ordre) VALUES
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Programmation et Bases de Données', 'SQL & PL/SQL', 'Avancé', 1),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Programmation et Bases de Données', 'Shell Scripting (Bash, Korn)', 'Avancé', 2),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Programmation et Bases de Données', 'Oracle, PostgreSQL, DB2', 'Avancé', 3),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Programmation et Bases de Données', 'Python, JavaScript, HTML/CSS', 'Avancé', 4);

-- Cloud & DevOps
INSERT INTO competences (user_id, categorie, competence, niveau, ordre) VALUES
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Cloud & DevOps', 'AWS & Azure (Utilisateur SAS Viya)', 'Avancé', 1),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Cloud & DevOps', 'Linux, Unix, Windows', 'Avancé', 2),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Cloud & DevOps', 'Jenkins, Control-M, Accurev', 'Avancé', 3),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Cloud & DevOps', 'Jira, Confluence, MS Project', 'Avancé', 4);

-- Gestion de Projet et Méthodologies
INSERT INTO competences (user_id, categorie, competence, niveau, ordre) VALUES
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Gestion de Projet et Méthodologies', 'Agile (SCRUM, Kanban)', 'Expert', 1),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Gestion de Projet et Méthodologies', 'Waterfall & DMR P+', 'Avancé', 2),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Gestion de Projet et Méthodologies', 'Leadership d''Équipe', 'Expert', 3),
  ('d5b317b1-34ba-4289-8d40-11fd1b584315', 'Gestion de Projet et Méthodologies', 'Gestion des Parties Prenantes', 'Expert', 4);

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Vérification : Compter les enregistrements insérés
SELECT
  (SELECT COUNT(*) FROM cv_info WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315') as nb_cv_info,
  (SELECT COUNT(*) FROM experiences WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315') as nb_experiences,
  (SELECT COUNT(*) FROM formations WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315') as nb_formations,
  (SELECT COUNT(*) FROM competences WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315') as nb_competences;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Données insérées avec succès !';
  RAISE NOTICE 'CV Info: 1 enregistrement';
  RAISE NOTICE 'Expériences: 17 enregistrements';
  RAISE NOTICE 'Formations: 2 enregistrements';
  RAISE NOTICE 'Compétences: 16 enregistrements';
END $$;
