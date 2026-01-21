// Traductions pour le CV
const translations = {
    fr: {
        // Navigation
        nav_home: "Accueil",
        nav_about: "À propos",
        nav_experience: "Expérience",
        nav_education: "Formation",
        nav_skills: "Compétences",
        nav_contact: "Contact",

        // Hero Section
        hero_greeting: "Bonjour, je suis",
        hero_name: "hero_name=Benoit Gaulin",
        hero_subtitle: "Chef de Projet Technique | Expert SAS & Leader TI",
        hero_btn_contact: "Me contacter",
        hero_btn_about: "En savoir plus",

        // About Section
        about_title: "À propos de moi",
        //about_text: "Chef de projet technique senior avec plus de 29 ans d'expérience en technologie SAS et gestion de projets complexes. Expert en migration SAS, transformation numérique et leadership d'équipes techniques distribuées. Passionné par l'innovation technologique et l'excellence opérationnelle.",
        about_text: "Chef de projet technique senior avec plus de 29 ans d'expérience en technologie SAS et gestion de projets complexes. Mes années d'expérience m'ont donné l'occasion de participer à un vaste nombre d'industries telles que les assurances, la banque, la fabrication, les énergies et le gouvernement. Depuis plus de 15 ans maintenant, j'ai cumulé divers rôles de direction et de gestion. J'ai aidé les organisations à concevoir, bâtir et opérationnaliser des solutions afin qu'elles puissent être ou demeurer des leaders dans leurs domaines respectifs. Dans ma carrière, je m'assure constamment d'être rigoureux et minutieux dans le maintien d'un haut niveau de qualité dans divers contextes où des solutions efficaces doivent être livrées rapidement et dans les limites du budget. Mon style de gestion est fortement basé sur la responsabilisation de tous les acteurs impliqués dans mes projets. Même si je suis généralement une personne d'action, je me dirige toujours dans la direction qui favorise les meilleures interactions humaines possibles. Toujours. J'aime véritablement apprendre et je suis convaincu que l'humilité est une qualité majeure.",
        about_years_exp: "Années d'expérience",
        about_projects: "Projets livrés",
        about_certifications: "Certifications SAS",

        // Experience Section
        exp_title: "Parcours professionnel",
        exp_show_details: "Afficher les détails",
        exp_hide_details: "Masquer les détails",

        // Job 1 - Current
        exp1_date: "Décembre 2024 - Présent",
        exp1_title: "Consultant en Migration SAS Viya",
        exp1_company: "Banque Nationale | EY",
        exp1_desc: "Soutenir la migration des programmes SAS 9 vers SAS Viya, en fournissant un leadership technique et une expertise en développement de programmes SAS.",
        exp1_ach1: "Réalisé une évaluation complète de l'environnement SAS 9 du client",
        exp1_ach2: "Dirigé le remue-méninges de solutions pour les incompatibilités et défini le mappage source-cible",
        exp1_ach3: "Coordonné les efforts d'intégration avec d'autres équipes techniques",
        exp1_ach4: "Facilité le transfert de connaissances et la formation pour les équipes clientes",

        // Job 2
        exp2_date: "Août 2023 - Novembre 2024",
        exp2_title: "Responsable de la Livraison - Migration SAS",
        exp2_company: "EDC | Accenture",
        exp2_desc: "Dirigé la livraison de bout en bout des projets de migration SAS, supervisant la transformation et la modernisation des solutions d'intelligence d'affaires.",
        exp2_ach1: "Livré des applications SAS performantes alignées avec la stratégie cloud SAS du client",
        exp2_ach2: "Dirigé des équipes distantes diversifiées et favorisé des relations collaboratives",
        exp2_ach3: "Appliqué les méthodologies Agile (SCRUM, Kanban) et MS Project",
        exp2_ach4: "Réalisé des analyses d'écarts et d'impacts pour des applications complexes et interdépendantes",

        // Job 3
        exp3_date: "Juin 2022 - Août 2023",
        exp3_title: "Responsable de la Livraison / Chef de Projet IFRS 17",
        exp3_company: "Banque Nationale | EY",
        exp3_desc: "Supervisé la gestion quotidienne de l'implémentation IFRS 17 dans le cadre du Programme de Conformité Financière et de Modernisation.",
        exp3_ach1: "Géré une équipe complète de développement TI de 16 membres",
        exp3_ach2: "Préparé une feuille de route complète de 2 ans pour la solution IFRS 17",
        exp3_ach3: "Présenté l'état du projet au Comité Exécutif mensuellement",
        exp3_ach4: "Dirigé les stratégies pour les tests, l'opérationnalisation, le plan de reprise après sinistre et la migration cloud",

        // Job 4
        exp4_date: "Février 2020 - Juin 2022",
        exp4_title: "Responsable de la Livraison / Chef de Projet IFRS 17",
        exp4_company: "Intact Corporation Financière | EY",
        exp4_desc: "Dirigé deux initiatives critiques IFRS 17 gérant la Conception & Développement ETL et les projets d'Opérationnalisation.",
        exp4_ach1: "Assemblé et géré une équipe complète de 15 ressources à partir de zéro",
        exp4_ach2: "Livré des flux de travail ETL utilisant SAS Data Integration Studio dans les délais et le budget",
        exp4_ach3: "Orchestré la migration technologique de SAS vers Informatica/Oracle",
        exp4_ach4: "Coordonné la planification de reprise après sinistre et de haute disponibilité",

        // Job 5
        exp5_date: "Février 2016 - Février 2020",
        exp5_title: "Expert et Leader de la Pratique de Développement SAS",
        exp5_company: "Banque Nationale",
        exp5_desc: "Dirigé la pratique de développement SAS gérant une équipe de 8 ressources administrant la plateforme SAS 9.4.",
        exp5_ach1: "Établi un Centre d'Excellence SAS fournissant formation et expertise technique",
        exp5_ach2: "Réduit les incidents du système de production à près de 0% au cours de la première année",
        exp5_ach3: "Augmenté l'adoption organisationnelle de SAS de 150 à 450 utilisateurs",
        exp5_ach4: "Développé et livré un portfolio complet de formation de 12 cours SAS",

        // Job 6
        exp6_date: "Avril 2015 - Février 2016",
        exp6_title: "Pause Sabbatique",
        exp6_company: "Année de Ressourcement Personnel",
        exp6_desc: "Après plus de 20 ans de carrière remplie de grands défis, j'ai décidé de prendre une année sabbatique pour me ressourcer et réaliser des rêves personnels.",
        exp6_ach1: "Voyagé à travers le monde en visitant certaines des plus grandes villes avec mon sac à dos",
        exp6_ach2: "Complété une randonnée en montagne de 230 km en Islande",
        exp6_ach3: "Maintenu une bonne forme physique avec des randonnées régulières dans les Adirondacks, au Vermont et au Québec",
        exp6_ach4: "Réalisé deux rêves de ma liste : apprendre à jouer du piano et écrire 25 articles de blog humoristiques",

        // Job 7
        exp7_date: "Mars 2013 - Avril 2015",
        exp7_title: "Chef de Développement SAS",
        exp7_company: "TD Assurance",
        exp7_desc: "En tant que Chef de Développement, j'étais responsable d'assurer que toutes les étapes des projets SAS dans le cycle de vie du développement logiciel suivent et respectent les meilleures pratiques de l'industrie et de l'organisation.",
        exp7_ach1: "Effectué des évaluations de faisabilité sur des sujets techniques et approuvé les artefacts techniques",
        exp7_ach2: "Dirigé l'écriture des standards de conception interne SAS",
        exp7_ach3: "Géré les flux de développement et créé des packages de déploiement avec le logiciel de contrôle Accurev",
        exp7_ach4: "Participé à tous les projets SAS pour du soutien consultatif et assisté les architectes dans le processus de conception",

        // Job 8
        exp8_date: "Février 2012 - Janvier 2013",
        exp8_title: "Chef de Développement SAS",
        exp8_company: "Desjardins",
        exp8_desc: "Dirigé, encadré et soutenu les membres de l'équipe (10 personnes) pour améliorer et maintenir des pratiques de codage SAS de haute qualité.",
        exp8_ach1: "Redesigné et optimisé tous les programmes SAS produisant les rapports de tableaux de bord marketing annuels",
        exp8_ach2: "Réduit l'échelle totale des programmes de 20 000 à 6 000 lignes de code",
        exp8_ach3: "Diminué le temps global requis pour extraire et traiter les données de 40%",
        exp8_ach4: "Simplifié grandement les programmes pour les rendre plus faciles à modifier et déboguer",

        // Job 9
        exp9_date: "Octobre 2008 - Février 2012",
        exp9_title: "Chef de Développement SAS",
        exp9_company: "TD Assurance",
        exp9_desc: "Fourni des conseils techniques à l'ensemble de l'organisation concernant les technologies SAS déjà en place mais aussi sur les futures. Agi comme leader pour les programmeurs-analystes SAS (35 personnes) répartis sur divers projets.",
        exp9_ach1: "Fourni un soutien sur les meilleures façons d'améliorer l'infrastructure en place (200 utilisateurs, 850 utilisateurs de rapports Web)",
        exp9_ach2: "Préparé et fourni des formations SAS personnalisées à travers l'organisation",
        exp9_ach3: "Rédigé et maintenu les standards de codage SAS à l'échelle de l'entreprise",
        exp9_ach4: "Pris en charge les problèmes opérationnels les plus complexes et fourni du soutien technique avec une très bonne connaissance des environnements UNIX",

        // Job 10
        exp10_date: "Mai 2007 - Octobre 2008",
        exp10_title: "Analyste d'Affaires SAP",
        exp10_company: "Hydro-Québec",
        exp10_desc: "Gestion du support des calendriers de travaux de production pour SAP BW (Business Warehouse) avec support opérationnel 24/7.",
        exp10_ach1: "Géré deux calendriers de travaux de production pour le système de facturation et le système client",
        exp10_ach2: "Appris à évaluer les impératifs et urgences provenant de deux gigantesques systèmes de production par lots",
        exp10_ach3: "Assuré un support opérationnel 24/7 avec téléavertisseurs",
        exp10_ach4: "Expérience précieuse en gestion de systèmes de planification et par lots",

        // Job 11
        exp11_date: "Janvier 2006 - Avril 2007",
        exp11_title: "Architecte Fonctionnel, Spécialiste SAS",
        exp11_company: "Hydro-Québec",
        exp11_desc: "Participé à la reconception du système, la reprogrammation et la migration de Mainframe vers UNIX. Le nouveau système cible incluait plusieurs technologies telles qu'Oracle, Java et SAS.",
        exp11_ach1: "Travaillé avec l'équipe d'architecture pour concevoir le nouveau plan d'architecture du système",
        exp11_ach2: "Redesigné une nouvelle architecture système et framework pour les programmes et le stockage dans SAS",
        exp11_ach3: "Mis en place une interface de communication entre SAS et Oracle via des plug-ins Java",
        exp11_ach4: "Assisté l'équipe de développement dans la programmation de nouveaux codes sources et résolu des problèmes de performance",

        // Job 12
        exp12_date: "Juillet 2005 - Décembre 2005",
        exp12_title: "Spécialiste SAS",
        exp12_company: "Hydro-Québec",
        exp12_desc: "Développé une application d'interface graphique SAS/AF utilisée pour recueillir des données, présenter et analyser des informations sur la consommation d'énergie pour la Province de Québec.",
        exp12_ach1: "Conçu et programmé l'exécution du code client/serveur répartie entre SAS PC local et SAS distant sur Unix",
        exp12_ach2: "Conçu et construit des interfaces graphiques interactives avec le module SAS/ETS pour les prévisions de séries temporelles",
        exp12_ach3: "Préparé et exécuté les tests unitaires et intégrés",
        exp12_ach4: "Formé les utilisateurs de la solution et les programmeurs en charge du support et de la maintenance",

        // Job 13
        exp13_date: "Novembre 2002 - Juin 2005",
        exp13_title: "Administrateur Système SAS",
        exp13_company: "BAT",
        exp13_desc: "Pris en charge le remplacement de l'administrateur système. Mon rôle a principalement changé en diverses activités clés telles que l'administration et la gestion du système SAS actuel en place.",
        exp13_ach1: "Géré et mis à jour les données et programmes système",
        exp13_ach2: "Conçu et construit un outil de déploiement sur les ordinateurs portables des utilisateurs professionnels",
        exp13_ach3: "Fourni un support technique et de programmation aux utilisateurs professionnels",
        exp13_ach4: "Mis en place la gestion du contrôle logiciel SAS",

        // Job 14
        exp14_date: "Mars 2002 - Novembre 2002",
        exp14_title: "Programmeur-Analyste SAS",
        exp14_company: "BAT",
        exp14_desc: "Construction et programmation d'écrans de requête interactifs SAS/AF utilisés pour produire dynamiquement des rapports texte, HTML et Excel utilisés par les représentants marketing et ventes.",
        exp14_ach1: "Programmation client/serveur avec SAS/Connect",
        exp14_ach2: "Création de 5 générateurs de rapports dynamiques représentant plus de 15 000 lignes de code",
        exp14_ach3: "Couplage et transfert de données entre les technologies SAS et Cognos",
        exp14_ach4: "Support utilisateur SAS à travers toute l'organisation",

        // Job 15
        exp15_date: "Avril 2001 - Février 2002",
        exp15_title: "Programmeur-Analyste SAS",
        exp15_company: "SAAQ | Société de l'Assurance Automobile du Québec",
        exp15_desc: "Dans ce projet actuariel, l'objectif était de mettre en œuvre une solution ETL SAS pour le client. Cette nouvelle solution remplaçait le codage SAS/IML effectué par les actuaires.",
        exp15_ach1: "Programmé des plug-ins en utilisant le langage de composants SAS (SCL)",
        exp15_ach2: "Rédigé des artefacts d'exigences fonctionnelles associés à chaque plug-in",
        exp15_ach3: "Rédigé et conduit des cas de tests",
        exp15_ach4: "Fourni un support technique des plug-ins au client",

        // Job 16
        exp16_date: "Mars 1999 - Mars 2001",
        exp16_title: "Programmeur-Analyste SAS",
        exp16_company: "Nortel Networks",
        exp16_desc: "Développement d'une nouvelle interface graphique SAS/AF permettant à l'administrateur de configurer des scénarios de calcul personnalisés pour les métriques de qualité sur l'assemblage de cartes réseau.",
        exp16_ach1: "Conduit des sessions d'exigences avec le client",
        exp16_ach2: "Programmé des pages html interactives avec Javascript et htmSQL pour permettre aux utilisateurs de personnaliser la sortie",
        exp16_ach3: "Créé environ treize écrans interactifs avec SAS/AF",
        exp16_ach4: "Préparé des cas de tests et effectué des tests unitaires et système, formé les utilisateurs",

        // Job 17
        exp17_date: "Février 1996 - Mars 1999",
        exp17_title: "Administrateur de Système d'Information SAS",
        exp17_company: "Citibank",
        exp17_desc: "Géré le système d'information du département de risque de crédit. Programmation SAS pour produire des rapports périodiques pour les départements Marketing, Nouveaux Clients, Risque de Crédit, Recouvrement de Dettes et Investigation de Fraude.",
        exp17_ach1: "Produit et présenté des rapports de synthèse mensuels à la direction",
        exp17_ach2: "Programmé de nouvelles analyses et rapports sur les profils clients et les risques en général",
        exp17_ach3: "Conçu et développé trois bases de données relationnelles Microsoft Access",
        exp17_ach4: "Configuré des campagnes marketing sortantes et préparé un plan d'action pour l'adaptation Y2K",

        // Education Section
        edu_title: "Formation",
        edu1_degree: "Baccalauréat en Informatique",
        edu1_school: "Université du Québec à Montréal (UQAM)",
        edu1_year: "1990 - 1994",
        edu2_title: "Certifications et Formation SAS",
        edu2_school: "Institut SAS",
        edu2_cert1: "Migration de SAS 9.4 vers Viya (2024)",
        edu2_cert2: "Installation et Configuration de la Plateforme SAS Intelligence (2020)",
        edu2_cert3: "Administration de la Plateforme des Technologies d'Intégration SAS (2017)",
        edu2_cert4: "Certification Professionnelle - SAS 9 Avancé (2012)",
        edu2_cert5: "Certification Professionnelle - Programmeur SAS Avancé (2008)",
        edu3_title: "Formation Professionnelle Additionnelle",
        edu3_cert1: "Méthodologie DMR Macroscope Productivity+ (2001)",
        edu3_cert2: "Améliorations des Processus Six Sigma (1999)",
        edu3_cert3: "Développement Orienté Objet avec SAS/AF (1999)",
        edu3_cert4: "Certifications Cognos BI (PowerPlay & Impromptu)",
        edu3_cert5: "Visual Basic .NET (2005)",
        edu4_title: "Pause Sabbatique",
        edu4_year: "2015 - 2016",
        edu4_desc: "Après plus de 20 ans de carrière, j'ai pris une année pour voyager à travers le monde, complété une randonnée en montagne de 230 km en Islande, appris à jouer du piano et écrit 25 articles de blog humoristiques.",

        // Skills Section
        skills_title: "Compétences techniques",
        skill_cat1: "Technologies SAS",
        skill_cat2: "Programmation et Bases de Données",
        skill_cat3: "Cloud & DevOps",
        skill_cat4: "Gestion de Projet et Méthodologies",
        skill_stakeholder: "Gestion des Parties Prenantes",
        skill_cloud_note: "Expérience en tant qu'utilisateur de SAS Viya sur AWS et Azure (non-administrateur Cloud)",
        skill_cloud_user: "(Utilisateur SAS Viya)",

        // Contact Section
        contact_title: "Me contacter",
        contact_subtitle: "N'hésitez pas à me contacter pour discuter de vos projets ou opportunités",
        contact_info_heading: "Restons en contact",
        contact_info_desc: "N'hésitez pas à me contacter pour discuter de vos projets ou opportunités de collaboration.",
        contact_email_label: "Email",
        contact_location_label: "Localisation",
        contact_location_value: "Montréal, QC, Canada",
        contact_availability_label: "Disponibilité",
        contact_availability_value: "Ouvert aux opportunités",
        contact_response_label: "Réponse",
        contact_response_value: "Sous 24-48h",
        contact_note: "💡 <strong>Note:</strong> Vos informations restent privées et ne seront jamais partagées avec des tiers.",
        contact_form_name: "Nom complet *",
        contact_form_name_placeholder: "Jean Dupont",
        contact_form_email: "Email *",
        contact_form_email_placeholder: "jean.dupont@exemple.com",
        contact_form_subject: "Sujet *",
        contact_form_subject_placeholder: "Opportunité de collaboration",
        contact_form_message: "Message *",
        contact_form_message_placeholder: "Bonjour, je souhaiterais discuter avec vous...",
        contact_form_btn: "Envoyer le message",
        contact_form_note: "* Champs obligatoires",
        contact_form_sending: "Envoi en cours...",
        contact_form_success_title: "Message envoyé avec succès!",
        contact_form_success_msg: "Je vous répondrai dans les plus brefs délais.",
        contact_form_error_title: "Erreur d'envoi",
        contact_form_error_msg: "Une erreur s'est produite. Veuillez réessayer.",

        // Footer
        footer_text: "© 2026 [Prénom-Nom]. Tous droits réservés.",
        footer_made_with: "Fait avec",
        footer_and: "et",

        // Chatbot
        chatbot_title: "💬 Demander à l'IA",
        chatbot_subtitle: "Posez-moi des questions sur le CV",
        chatbot_welcome: "Bonjour! Je suis un assistant IA qui peut répondre à vos questions sur le parcours professionnel. N'hésitez pas à me demander des informations sur son expérience, ses compétences ou sa formation.",
        chatbot_placeholder: "Posez une question sur mon CV...",
        chatbot_send: "Envoyer",
    },

    en: {
        // Navigation
        nav_home: "Home",
        nav_about: "About",
        nav_experience: "Experience",
        nav_education: "Education",
        nav_skills: "Skills",
        nav_contact: "Contact",

        // Hero Section
        hero_greeting: "Hello, I'm",
        hero_name: "hero_name=Benoit Gaulin",
        hero_subtitle: "Technical Project Manager | SAS Expert & IT Leader",
        hero_btn_contact: "Contact Me",
        hero_btn_about: "Learn More",

        // About Section
        about_title: "About Me",
        //about_text: "Senior Technical Project Manager with over 29 years of experience in SAS technology and complex project management. Expert in SAS migration, digital transformation, and leading distributed technical teams. Passionate about technological innovation and operational excellence.",
        about_text: "I am an experienced SAS nd IT user, acting as a Technical Project Manager, IT  expert and SAS leader within the Information Technology domain. My years of experience gave me the chance to be involved in a vast number of industries such as Insurances, Banking, Manufacture, Facilities and Government.  For over 15 years now, I cumulated various leading and managing roles.  I helped organization to design, build and operationalize solutions so they can be or stay leaders in their own respective fields.  In my career, I constantly make sure to be rigorous and throughout in maintaining a high level of quality in various contexts where efficient solutions must be delivered fast and on-budget.  My management style is strongly based on empowering all the actors involved in my Projects.  Even though I am in general a go-getter, I always steer myself in the direction that promotes the best possible human interaction. Always. I truly love learning and I go by the rule that humility is a major quality.",
        about_years_exp: "Years of Experience",
        about_projects: "Projects Delivered",
        about_certifications: "SAS Certifications",

        // Experience Section
        exp_title: "Professional Journey",
        exp_show_details: "Show Details",
        exp_hide_details: "Hide Details",

        // Job 1 - Current
        exp1_date: "December 2024 - Present",
        exp1_title: "SAS Viya Migration Consultant",
        exp1_company: "National Bank | EY",
        exp1_desc: "Supporting the migration of SAS 9 programs to SAS Viya, providing technical leadership and expertise in SAS program development.",
        exp1_ach1: "Conducted comprehensive assessment of client's SAS 9 environment",
        exp1_ach2: "Led solution brainstorming for incompatibilities and defined source-target mapping",
        exp1_ach3: "Coordinated integration efforts with other technical teams",
        exp1_ach4: "Facilitated knowledge transfer and training for client teams",

        // Job 2
        exp2_date: "August 2023 - November 2024",
        exp2_title: "Delivery Manager - SAS Migration",
        exp2_company: "EDC | Accenture",
        exp2_desc: "Led end-to-end delivery of SAS migration projects, overseeing the transformation and modernization of business intelligence solutions.",
        exp2_ach1: "Delivered high-performing SAS applications aligned with client's SAS cloud strategy",
        exp2_ach2: "Led diverse remote teams and fostered collaborative relationships",
        exp2_ach3: "Applied Agile methodologies (SCRUM, Kanban) and MS Project",
        exp2_ach4: "Conducted gap and impact analyses for complex interdependent applications",

        // Job 3
        exp3_date: "June 2022 - August 2023",
        exp3_title: "Delivery Manager / IFRS 17 Project Manager",
        exp3_company: "National Bank | EY",
        exp3_desc: "Oversaw day-to-day management of IFRS 17 implementation as part of the Financial Compliance and Modernization Program.",
        exp3_ach1: "Managed a full IT development team of 16 members",
        exp3_ach2: "Prepared comprehensive 2-year roadmap for IFRS 17 solution",
        exp3_ach3: "Presented project status to Executive Committee monthly",
        exp3_ach4: "Led strategies for testing, operationalization, disaster recovery plan, and cloud migration",

        // Job 4
        exp4_date: "February 2020 - June 2022",
        exp4_title: "Delivery Manager / IFRS 17 Project Manager",
        exp4_company: "Intact Financial Corporation | EY",
        exp4_desc: "Led two critical IFRS 17 initiatives managing ETL Design & Development and Operationalization projects.",
        exp4_ach1: "Assembled and managed a full team of 15 resources from scratch",
        exp4_ach2: "Delivered ETL workflows using SAS Data Integration Studio on time and on budget",
        exp4_ach3: "Orchestrated technology migration from SAS to Informatica/Oracle",
        exp4_ach4: "Coordinated disaster recovery planning and high availability",

        // Job 5
        exp5_date: "February 2016 - February 2020",
        exp5_title: "SAS Development Practice Expert and Leader",
        exp5_company: "National Bank",
        exp5_desc: "Led the SAS development practice managing a team of 8 resources administering the SAS 9.4 platform.",
        exp5_ach1: "Established a SAS Center of Excellence providing training and technical expertise",
        exp5_ach2: "Reduced production system incidents to nearly 0% in the first year",
        exp5_ach3: "Increased organizational SAS adoption from 150 to 450 users",
        exp5_ach4: "Developed and delivered a complete training portfolio of 12 SAS courses",

        // Job 6
        exp6_date: "April 2015 - February 2016",
        exp6_title: "Sabbatical Break",
        exp6_company: "Year of Personal Rejuvenation",
        exp6_desc: "After more than 20 years of a career filled with great challenges, I decided to take a sabbatical year to recharge and fulfill personal dreams.",
        exp6_ach1: "Traveled around the world visiting some of the greatest cities with my backpack",
        exp6_ach2: "Completed a 230 km mountain trek in Iceland",
        exp6_ach3: "Maintained good physical fitness with regular hikes in the Adirondacks, Vermont, and Quebec",
        exp6_ach4: "Achieved two bucket list dreams: learning to play piano and writing 25 humorous blog articles",

        // Job 7
        exp7_date: "March 2013 - April 2015",
        exp7_title: "SAS Development Lead",
        exp7_company: "TD Insurance",
        exp7_desc: "As Development Lead, I was responsible for ensuring all stages of SAS projects in the software development lifecycle follow and respect industry and organizational best practices.",
        exp7_ach1: "Conducted feasibility assessments on technical topics and approved technical artifacts",
        exp7_ach2: "Led the writing of internal SAS design standards",
        exp7_ach3: "Managed development streams and created deployment packages with Accurev control software",
        exp7_ach4: "Participated in all SAS projects for consultative support and assisted architects in the design process",

        // Job 8
        exp8_date: "February 2012 - January 2013",
        exp8_title: "SAS Development Lead",
        exp8_company: "Desjardins",
        exp8_desc: "Led, coached, and supported team members (10 people) to improve and maintain high-quality SAS coding practices.",
        exp8_ach1: "Redesigned and optimized all SAS programs producing annual marketing dashboard reports",
        exp8_ach2: "Reduced total program scale from 20,000 to 6,000 lines of code",
        exp8_ach3: "Decreased overall time required to extract and process data by 40%",
        exp8_ach4: "Greatly simplified programs to make them easier to modify and debug",

        // Job 9
        exp9_date: "October 2008 - February 2012",
        exp9_title: "SAS Development Lead",
        exp9_company: "TD Insurance",
        exp9_desc: "Provided technical guidance to the entire organization regarding existing and future SAS technologies. Acted as leader for SAS programmer-analysts (35 people) distributed across various projects.",
        exp9_ach1: "Provided support on best ways to improve infrastructure in place (200 users, 850 Web report users)",
        exp9_ach2: "Prepared and delivered customized SAS training across the organization",
        exp9_ach3: "Wrote and maintained enterprise-wide SAS coding standards",
        exp9_ach4: "Handled the most complex operational issues and provided technical support with strong knowledge of UNIX environments",

        // Job 10
        exp10_date: "May 2007 - October 2008",
        exp10_title: "SAP Business Analyst",
        exp10_company: "Hydro-Quebec",
        exp10_desc: "Managed support for production work schedules for SAP BW (Business Warehouse) with 24/7 operational support.",
        exp10_ach1: "Managed two production work schedules for billing system and customer system",
        exp10_ach2: "Learned to assess imperatives and urgencies from two gigantic batch production systems",
        exp10_ach3: "Ensured 24/7 operational support with pagers",
        exp10_ach4: "Valuable experience in scheduling and batch systems management",

        // Job 11
        exp11_date: "January 2006 - April 2007",
        exp11_title: "Functional Architect, SAS Specialist",
        exp11_company: "Hydro-Quebec",
        exp11_desc: "Participated in system redesign, reprogramming, and migration from Mainframe to UNIX. The new target system included multiple technologies such as Oracle, Java, and SAS.",
        exp11_ach1: "Worked with architecture team to design the new system architecture plan",
        exp11_ach2: "Redesigned a new system architecture and framework for programs and storage in SAS",
        exp11_ach3: "Implemented communication interface between SAS and Oracle via Java plug-ins",
        exp11_ach4: "Assisted development team in programming new source code and resolved performance issues",

        // Job 12
        exp12_date: "July 2005 - December 2005",
        exp12_title: "SAS Specialist",
        exp12_company: "Hydro-Quebec",
        exp12_desc: "Developed a SAS/AF graphical interface application used to collect data, present and analyze information on energy consumption for the Province of Quebec.",
        exp12_ach1: "Designed and programmed client/server code execution distributed between local SAS PC and remote SAS on Unix",
        exp12_ach2: "Designed and built interactive graphical interfaces with SAS/ETS module for time series forecasting",
        exp12_ach3: "Prepared and executed unit and integrated tests",
        exp12_ach4: "Trained solution users and programmers in charge of support and maintenance",

        // Job 13
        exp13_date: "November 2002 - June 2005",
        exp13_title: "SAS System Administrator",
        exp13_company: "BAT",
        exp13_desc: "Took over replacement of system administrator. My role primarily changed to various key activities such as administration and management of the current SAS system in place.",
        exp13_ach1: "Managed and updated system data and programs",
        exp13_ach2: "Designed and built a deployment tool on business users' laptops",
        exp13_ach3: "Provided technical and programming support to business users",
        exp13_ach4: "Implemented SAS software control management",

        // Job 14
        exp14_date: "March 2002 - November 2002",
        exp14_title: "SAS Programmer-Analyst",
        exp14_company: "BAT",
        exp14_desc: "Construction and programming of interactive SAS/AF query screens used to dynamically produce text, HTML, and Excel reports used by marketing and sales representatives.",
        exp14_ach1: "Client/server programming with SAS/Connect",
        exp14_ach2: "Creation of 5 dynamic report generators representing over 15,000 lines of code",
        exp14_ach3: "Coupling and data transfer between SAS and Cognos technologies",
        exp14_ach4: "SAS user support across the entire organization",

        // Job 15
        exp15_date: "April 2001 - February 2002",
        exp15_title: "SAS Programmer-Analyst",
        exp15_company: "SAAQ | Quebec Automobile Insurance Society",
        exp15_desc: "In this actuarial project, the objective was to implement a SAS ETL solution for the client. This new solution replaced SAS/IML coding done by actuaries.",
        exp15_ach1: "Programmed plug-ins using SAS Component Language (SCL)",
        exp15_ach2: "Wrote functional requirements artifacts associated with each plug-in",
        exp15_ach3: "Wrote and conducted test cases",
        exp15_ach4: "Provided technical support for plug-ins to the client",

        // Job 16
        exp16_date: "March 1999 - March 2001",
        exp16_title: "SAS Programmer-Analyst",
        exp16_company: "Nortel Networks",
        exp16_desc: "Development of a new SAS/AF graphical interface allowing the administrator to configure custom calculation scenarios for quality metrics on network card assembly.",
        exp16_ach1: "Conducted requirements sessions with the client",
        exp16_ach2: "Programmed interactive html pages with Javascript and htmSQL to allow users to customize output",
        exp16_ach3: "Created approximately thirteen interactive screens with SAS/AF",
        exp16_ach4: "Prepared test cases and performed unit and system testing, trained users",

        // Job 17
        exp17_date: "February 1996 - March 1999",
        exp17_title: "SAS Information System Administrator",
        exp17_company: "Citibank",
        exp17_desc: "Managed the information system of the credit risk department. SAS programming to produce periodic reports for Marketing, New Clients, Credit Risk, Debt Collection, and Fraud Investigation departments.",
        exp17_ach1: "Produced and presented monthly summary reports to management",
        exp17_ach2: "Programmed new analyses and reports on customer profiles and risks in general",
        exp17_ach3: "Designed and developed three Microsoft Access relational databases",
        exp17_ach4: "Configured outbound marketing campaigns and prepared Y2K adaptation action plan",

        // Education Section
        edu_title: "Education",
        edu1_degree: "Bachelor's Degree in Computer Science",
        edu1_school: "University of Quebec in Montreal (UQAM)",
        edu1_year: "1990 - 1994",
        edu2_title: "SAS Certifications and Training",
        edu2_school: "SAS Institute",
        edu2_cert1: "Migration from SAS 9.4 to Viya (2024)",
        edu2_cert2: "Installation and Configuration of SAS Intelligence Platform (2020)",
        edu2_cert3: "Administration of SAS Integration Technologies Platform (2017)",
        edu2_cert4: "Professional Certification - Advanced SAS 9 (2012)",
        edu2_cert5: "Professional Certification - Advanced SAS Programmer (2008)",
        edu3_title: "Additional Professional Training",
        edu3_cert1: "DMR Macroscope Productivity+ Methodology (2001)",
        edu3_cert2: "Six Sigma Process Improvements (1999)",
        edu3_cert3: "Object-Oriented Development with SAS/AF (1999)",
        edu3_cert4: "Cognos BI Certifications (PowerPlay & Impromptu)",
        edu3_cert5: "Visual Basic .NET (2005)",
        edu4_title: "Sabbatical Break",
        edu4_year: "2015 - 2016",
        edu4_desc: "After more than 20 years of career, I took a year off to travel around the world, completed a 230 km mountain trek in Iceland, learned to play piano, and wrote 25 humorous blog articles.",

        // Skills Section
        skills_title: "Technical Skills",
        skill_cat1: "SAS Technologies",
        skill_cat2: "Programming and Databases",
        skill_cat3: "Cloud & DevOps",
        skill_cat4: "Project Management and Methodologies",
        skill_stakeholder: "Stakeholder Management",
        skill_cloud_note: "Experience as SAS Viya user on AWS and Azure (non-Cloud administrator)",
        skill_cloud_user: "(SAS Viya User)",

        // Contact Section
        contact_title: "Contact Me",
        contact_subtitle: "Feel free to reach out to discuss your projects or opportunities",
        contact_info_heading: "Let's Stay in Touch",
        contact_info_desc: "Feel free to contact me to discuss your projects or collaboration opportunities.",
        contact_email_label: "Email",
        contact_location_label: "Location",
        contact_location_value: "Montreal, QC, Canada",
        contact_availability_label: "Availability",
        contact_availability_value: "Open to opportunities",
        contact_response_label: "Response",
        contact_response_value: "Within 24-48h",
        contact_note: "💡 <strong>Note:</strong> Your information remains private and will never be shared with third parties.",
        contact_form_name: "Full Name *",
        contact_form_name_placeholder: "John Doe",
        contact_form_email: "Email *",
        contact_form_email_placeholder: "john.doe@example.com",
        contact_form_subject: "Subject *",
        contact_form_subject_placeholder: "Collaboration Opportunity",
        contact_form_message: "Message *",
        contact_form_message_placeholder: "Hello, I would like to discuss with you...",
        contact_form_btn: "Send Message",
        contact_form_note: "* Required fields",
        contact_form_sending: "Sending...",
        contact_form_success_title: "Message sent successfully!",
        contact_form_success_msg: "I will respond to you as soon as possible.",
        contact_form_error_title: "Sending Error",
        contact_form_error_msg: "An error occurred. Please try again.",

        // Footer
        footer_text: "© 2026 [First-Name Last-name]. All rights reserved.",
        footer_made_with: "Made with",
        footer_and: "and",

        // Chatbot
        chatbot_title: "💬 Ask the AI",
        chatbot_subtitle: "Ask me questions the resume",
        chatbot_welcome: "Hello! I am an AI assistant who can answer your questions about professional background. Feel free to ask me about his experience, skills, or education.",
        chatbot_placeholder: "Ask a question about my resume...",
        chatbot_send: "Send",
    }
};

// Export the translations object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}
