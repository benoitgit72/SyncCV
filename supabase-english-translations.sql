-- ============================================
-- English Translations for Ron More CV Database
-- ============================================
-- This script updates all tables with English translations
-- User ID: d5b317b1-34ba-4289-8d40-11fd1b584315
-- Execute this script AFTER running supabase-add-english-columns.sql
-- ============================================

-- ============================================
-- 1. Update cv_info with English translations
-- ============================================

UPDATE cv_info
SET
  titre_en = 'Technical Project Manager | SAS Expert & IT Leader',
  bio_en = 'Experienced SAS and IT professional, serving as Technical Project Manager, IT expert, and SAS leader. My 29 years of experience have given me the opportunity to be involved in a wide range of industries such as Insurance, Banking, Manufacturing, Facilities, and Government. For over 15 years now, I have held various leadership and management roles. I help organizations design, build, and operationalize solutions so they can be or remain leaders in their respective fields.'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- ============================================
-- 2. Update experiences with English translations
-- ============================================

-- Experience 1: SAS Viya Migration Consultant (2024-Present)
UPDATE experiences
SET
  titre_en = 'SAS Viya Migration Consultant',
  entreprise_en = 'National Bank | EY',
  description_en = 'Support the migration of SAS 9 programs to SAS Viya, providing technical leadership and expertise in SAS program development.

Achievements:
• Conducted comprehensive assessment of client''s SAS 9 environment
• Led solution brainstorming for incompatibilities and defined source-target mapping
• Coordinated integration efforts with other technical teams
• Facilitated knowledge transfer and training for client teams'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Consultant en Migration SAS Viya'
AND ordre = 1;

-- Experience 2: Delivery Manager - SAS Migration (2023-2024)
UPDATE experiences
SET
  titre_en = 'Delivery Manager - SAS Migration',
  entreprise_en = 'EDC | Accenture',
  description_en = 'Led end-to-end delivery of SAS migration projects, overseeing transformation and modernization of business intelligence solutions.

Achievements:
• Delivered high-performing SAS applications aligned with client''s SAS cloud strategy
• Led diverse remote teams and fostered collaborative relationships
• Applied Agile methodologies (SCRUM, Kanban) and MS Project
• Conducted gap and impact analyses for complex, interdependent applications'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Responsable de la Livraison - Migration SAS'
AND ordre = 2;

-- Experience 3: Delivery Manager / IFRS 17 Project Manager - BN (2022-2023)
UPDATE experiences
SET
  titre_en = 'Delivery Manager / IFRS 17 Project Manager',
  entreprise_en = 'National Bank | EY',
  description_en = 'Oversaw day-to-day management of IFRS 17 implementation within the Financial Compliance & Modernization Program.

Achievements:
• Managed a full IT development team of 16 members
• Prepared a comprehensive 2-year roadmap for the IFRS 17 solution
• Presented project status to Executive Committee monthly
• Led strategies for testing, operationalization, disaster recovery plan, and cloud migration'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Responsable de la Livraison / Chef de Projet IFRS 17'
AND entreprise = 'Banque Nationale | EY'
AND ordre = 3;

-- Experience 4: Delivery Manager / IFRS 17 Project Manager - Intact (2020-2022)
UPDATE experiences
SET
  titre_en = 'Delivery Manager / IFRS 17 Project Manager',
  entreprise_en = 'Intact Financial Corporation | EY',
  description_en = 'Led two critical IFRS 17 initiatives managing ETL Design & Development and Operationalization projects.

Achievements:
• Assembled and managed a full team of 15 resources from scratch
• Delivered ETL workflows using SAS Data Integration Studio on time and on budget
• Orchestrated technology migration from SAS to Informatica/Oracle
• Coordinated disaster recovery and high availability planning'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Responsable de la Livraison / Chef de Projet IFRS 17'
AND entreprise = 'Intact Corporation Financière | EY'
AND ordre = 4;

-- Experience 5: SAS Development Practice Expert and Leader (2016-2020)
UPDATE experiences
SET
  titre_en = 'SAS Development Practice Expert and Leader',
  entreprise_en = 'National Bank',
  description_en = 'Led the SAS development practice managing a team of 8 resources administering the SAS 9.4 platform.

Achievements:
• Established a SAS Center of Excellence providing training and technical expertise
• Reduced production system incidents to nearly 0% within the first year
• Increased organizational SAS adoption from 150 to 450 users
• Developed and delivered a comprehensive portfolio of 12 SAS training courses'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Expert et Leader de la Pratique de Développement SAS'
AND ordre = 5;

-- Experience 6: Sabbatical Break (2015-2016)
UPDATE experiences
SET
  titre_en = 'Sabbatical Break',
  entreprise_en = 'Year of Personal Renewal',
  description_en = 'After over 20 years of a career filled with great challenges, I decided to take a sabbatical year to recharge and achieve personal dreams.

Achievements:
• Traveled around the world visiting some of the greatest cities with my backpack
• Completed a 230 km mountain hike in Iceland
• Maintained good physical fitness with regular hiking in the Adirondacks, Vermont, and Quebec
• Achieved two bucket list dreams: learning to play piano and writing 25 humorous blog articles'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Pause Sabbatique'
AND ordre = 6;

-- Experience 7: SAS Development Lead - TD Insurance (2013-2015)
UPDATE experiences
SET
  titre_en = 'SAS Development Lead',
  entreprise_en = 'TD Insurance',
  description_en = 'As Development Lead, I was responsible for ensuring that all stages of SAS projects in the software development life cycle follow and respect industry and organizational best practices.

Achievements:
• Performed feasibility assessments on technical topics and approved technical artifacts
• Led the writing of internal SAS design standards
• Managed development flows and created deployment packages with Accurev control software
• Participated in all SAS projects for consultative support and assisted architects in the design process'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Chef de Développement SAS'
AND entreprise = 'TD Assurance'
AND periode_debut = '2013-03-01'
AND ordre = 7;

-- Experience 8: SAS Development Lead - Desjardins (2012-2013)
UPDATE experiences
SET
  titre_en = 'SAS Development Lead',
  entreprise_en = 'Desjardins',
  description_en = 'Led, coached, and supported team members (10 people) to improve and maintain high-quality SAS coding practices.

Achievements:
• Redesigned and optimized all SAS programs producing annual marketing dashboard reports
• Reduced total program scale from 20,000 to 6,000 lines of code
• Decreased overall time required to extract and process data by 40%
• Greatly simplified programs to make them easier to modify and debug'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Chef de Développement SAS'
AND entreprise = 'Desjardins'
AND ordre = 8;

-- Experience 9: SAS Development Lead - TD Insurance (2008-2012)
UPDATE experiences
SET
  titre_en = 'SAS Development Lead',
  entreprise_en = 'TD Insurance',
  description_en = 'Provided technical guidance across the organization regarding existing and future SAS technologies. Acted as leader for SAS programmer-analysts (35 people) spread across various projects.

Achievements:
• Provided support on best ways to improve existing infrastructure (200 users, 850 web report users)
• Prepared and delivered customized SAS training across the organization
• Authored and maintained enterprise-wide SAS coding standards
• Handled the most complex operational issues and provided technical support with extensive knowledge of UNIX environments'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Chef de Développement SAS'
AND entreprise = 'TD Assurance'
AND periode_debut = '2008-10-01'
AND ordre = 9;

-- Experience 10: SAP Business Analyst (2007-2008)
UPDATE experiences
SET
  titre_en = 'SAP Business Analyst',
  entreprise_en = 'Hydro-Quebec',
  description_en = 'Managed production batch calendar support for SAP BW (Business Warehouse) with 24/7 operational support.

Achievements:
• Managed two production batch calendars for billing system and customer system
• Learned to assess imperatives and urgencies from two gigantic batch production systems
• Ensured 24/7 operational support with pagers
• Valuable experience in scheduling and batch system management'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Analyste d''Affaires SAP'
AND ordre = 10;

-- Experience 11: Functional Architect, SAS Specialist (2006-2007)
UPDATE experiences
SET
  titre_en = 'Functional Architect, SAS Specialist',
  entreprise_en = 'Hydro-Quebec',
  description_en = 'Participated in system redesign, reprogramming, and migration from Mainframe to UNIX. The new target system included multiple technologies such as Oracle, Java, and SAS.

Achievements:
• Worked with architecture team to design the new system architecture plan
• Redesigned a new system architecture and framework for programs and storage in SAS
• Implemented communication interface between SAS and Oracle via Java plugins
• Assisted development team in programming new source code and resolved performance issues'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Architecte Fonctionnel, Spécialiste SAS'
AND ordre = 11;

-- Experience 12: SAS Specialist (2005)
UPDATE experiences
SET
  titre_en = 'SAS Specialist',
  entreprise_en = 'Hydro-Quebec',
  description_en = 'Developed a SAS/AF graphical interface application used to collect data, present, and analyze information about energy consumption for the Province of Quebec.

Achievements:
• Designed and programmed client/server code execution distributed between local SAS PC and remote SAS on Unix
• Designed and built interactive graphical interfaces with SAS/ETS module for time series forecasting
• Prepared and executed unit and integration tests
• Trained solution users and programmers in charge of support and maintenance'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Spécialiste SAS'
AND ordre = 12;

-- Experience 13: SAS System Administrator - BAT (2002-2005)
UPDATE experiences
SET
  titre_en = 'SAS System Administrator',
  entreprise_en = 'BAT',
  description_en = 'Took over as replacement for system administrator. My role primarily changed to various key activities such as administering and managing the current SAS system in place.

Achievements:
• Managed and updated system data and programs
• Designed and built a deployment tool on professional users'' laptops
• Provided technical and programming support to professional users
• Implemented SAS software control management'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Administrateur Système SAS'
AND ordre = 13;

-- Experience 14: SAS Programmer-Analyst - BAT (2002)
UPDATE experiences
SET
  titre_en = 'SAS Programmer-Analyst',
  entreprise_en = 'BAT',
  description_en = 'Built and programmed interactive SAS/AF query screens used to dynamically produce text, HTML, and Excel reports used by marketing and sales representatives.

Achievements:
• Client/server programming with SAS/Connect
• Created 5 dynamic report generators representing over 15,000 lines of code
• Coupled and transferred data between SAS and Cognos technologies
• SAS user support across the entire organization'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Programmeur-Analyste SAS'
AND entreprise = 'BAT'
AND periode_debut = '2002-03-01'
AND ordre = 14;

-- Experience 15: SAS Programmer-Analyst - SAAQ (2001-2002)
UPDATE experiences
SET
  titre_en = 'SAS Programmer-Analyst',
  entreprise_en = 'SAAQ | Quebec Automobile Insurance Corporation',
  description_en = 'In this actuarial project, the objective was to implement a SAS ETL solution for the client. This new solution replaced the SAS/IML coding performed by actuaries.

Achievements:
• Programmed plugins using SAS Component Language (SCL)
• Authored functional requirements artifacts associated with each plugin
• Authored and conducted test cases
• Provided technical support for plugins to the client'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Programmeur-Analyste SAS'
AND entreprise = 'SAAQ | Société de l''Assurance Automobile du Québec'
AND ordre = 15;

-- Experience 16: SAS Programmer-Analyst - Nortel (1999-2001)
UPDATE experiences
SET
  titre_en = 'SAS Programmer-Analyst',
  entreprise_en = 'Nortel Networks',
  description_en = 'Developed a new SAS/AF graphical interface allowing the administrator to configure custom calculation scenarios for quality metrics on network card assembly.

Achievements:
• Conducted requirements sessions with the client
• Programmed interactive HTML pages with Javascript and htmSQL to allow users to customize output
• Created approximately thirteen interactive screens with SAS/AF
• Prepared test cases and performed unit and system testing, trained users'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Programmeur-Analyste SAS'
AND entreprise = 'Nortel Networks'
AND ordre = 16;

-- Experience 17: SAS Information System Administrator - Citibank (1996-1999)
UPDATE experiences
SET
  titre_en = 'SAS Information System Administrator',
  entreprise_en = 'Citibank',
  description_en = 'Managed the credit risk department''s information system. SAS programming to produce periodic reports for Marketing, New Customers, Credit Risk, Debt Collection, and Fraud Investigation departments.

Achievements:
• Produced and presented monthly summary reports to management
• Programmed new analyses and reports on customer profiles and risks in general
• Designed and developed three Microsoft Access relational databases
• Configured outbound marketing campaigns and prepared an action plan for Y2K adaptation'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND titre = 'Administrateur de Système d''Information SAS'
AND ordre = 17;

-- ============================================
-- 3. Update formations with English translations
-- ============================================

-- Formation 1: SAS Certifications
UPDATE formations
SET
  diplome_en = 'SAS Certifications and Training',
  institution_en = 'SAS Institute',
  description_en = 'Migration from SAS 9.4 to Viya (2024)
SAS Intelligence Platform Installation and Configuration (2020)
SAS Integration Technologies Platform Administration (2017)
Professional Certification - SAS 9 Advanced (2012)
Professional Certification - Advanced SAS Programmer (2008)'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND diplome = 'Certifications et Formation SAS'
AND ordre = 1;

-- Formation 2: Additional Professional Training
UPDATE formations
SET
  diplome_en = 'Additional Professional Training',
  institution_en = 'Various Institutes',
  description_en = 'DMR Macroscope Productivity+ Methodology (2001)
Six Sigma Process Improvements (1999)
Object-Oriented Development with SAS/AF (1999)
Cognos BI Certifications (PowerPlay & Impromptu)
Visual Basic .NET (2005)'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND diplome = 'Formation Professionnelle Additionnelle'
AND ordre = 2;

-- ============================================
-- 4. Update competences with English translations
-- ============================================

-- SAS Technologies Category
UPDATE competences
SET
  categorie_en = 'SAS Technologies',
  competence_en = 'SAS Viya & SAS 9.4',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'SAS Technologies'
AND competence = 'SAS Viya & SAS 9.4';

UPDATE competences
SET
  categorie_en = 'SAS Technologies',
  competence_en = 'SAS Base & Macro',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'SAS Technologies'
AND competence = 'SAS Base & Macro';

UPDATE competences
SET
  categorie_en = 'SAS Technologies',
  competence_en = 'Enterprise Guide & Studio',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'SAS Technologies'
AND competence = 'Enterprise Guide & Studio';

UPDATE competences
SET
  categorie_en = 'SAS Technologies',
  competence_en = 'Integration Technologies',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'SAS Technologies'
AND competence = 'Integration Technologies';

-- Programming and Databases Category
UPDATE competences
SET
  categorie_en = 'Programming and Databases',
  competence_en = 'SQL & PL/SQL',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Programmation et Bases de Données'
AND competence = 'SQL & PL/SQL';

UPDATE competences
SET
  categorie_en = 'Programming and Databases',
  competence_en = 'Shell Scripting (Bash, Korn)',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Programmation et Bases de Données'
AND competence = 'Shell Scripting (Bash, Korn)';

UPDATE competences
SET
  categorie_en = 'Programming and Databases',
  competence_en = 'Oracle, PostgreSQL, DB2',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Programmation et Bases de Données'
AND competence = 'Oracle, PostgreSQL, DB2';

UPDATE competences
SET
  categorie_en = 'Programming and Databases',
  competence_en = 'Python, JavaScript, HTML/CSS',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Programmation et Bases de Données'
AND competence = 'Python, JavaScript, HTML/CSS';

-- Cloud & DevOps Category
UPDATE competences
SET
  categorie_en = 'Cloud & DevOps',
  competence_en = 'AWS & Azure (SAS Viya User)',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Cloud & DevOps'
AND competence = 'AWS & Azure (Utilisateur SAS Viya)';

UPDATE competences
SET
  categorie_en = 'Cloud & DevOps',
  competence_en = 'Linux, Unix, Windows',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Cloud & DevOps'
AND competence = 'Linux, Unix, Windows';

UPDATE competences
SET
  categorie_en = 'Cloud & DevOps',
  competence_en = 'Jenkins, Control-M, Accurev',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Cloud & DevOps'
AND competence = 'Jenkins, Control-M, Accurev';

UPDATE competences
SET
  categorie_en = 'Cloud & DevOps',
  competence_en = 'Jira, Confluence, MS Project',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Cloud & DevOps'
AND competence = 'Jira, Confluence, MS Project';

-- Project Management and Methodologies Category
UPDATE competences
SET
  categorie_en = 'Project Management and Methodologies',
  competence_en = 'Agile (SCRUM, Kanban)',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Gestion de Projet et Méthodologies'
AND competence = 'Agile (SCRUM, Kanban)';

UPDATE competences
SET
  categorie_en = 'Project Management and Methodologies',
  competence_en = 'Waterfall & DMR P+',
  niveau_en = 'Advanced'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Gestion de Projet et Méthodologies'
AND competence = 'Waterfall & DMR P+';

UPDATE competences
SET
  categorie_en = 'Project Management and Methodologies',
  competence_en = 'Team Leadership',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Gestion de Projet et Méthodologies'
AND competence = 'Leadership d''Équipe';

UPDATE competences
SET
  categorie_en = 'Project Management and Methodologies',
  competence_en = 'Stakeholder Management',
  niveau_en = 'Expert'
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
AND categorie = 'Gestion de Projet et Méthodologies'
AND competence = 'Gestion des Parties Prenantes';

-- ============================================
-- Verification Queries
-- ============================================

-- Verify cv_info translations
SELECT
  nom,
  titre,
  titre_en,
  LEFT(bio, 50) as bio_fr_preview,
  LEFT(bio_en, 50) as bio_en_preview
FROM cv_info
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- Verify experiences translations (count)
SELECT
  COUNT(*) as total_experiences,
  COUNT(titre_en) as translated_titles,
  COUNT(entreprise_en) as translated_companies,
  COUNT(description_en) as translated_descriptions
FROM experiences
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- Verify formations translations
SELECT
  diplome,
  diplome_en,
  institution,
  institution_en
FROM formations
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
ORDER BY ordre;

-- Verify competences translations
SELECT
  categorie,
  categorie_en,
  COUNT(*) as skill_count
FROM competences
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
GROUP BY categorie, categorie_en
ORDER BY categorie;

-- Detailed verification: Check for any missing translations
SELECT
  'cv_info' as table_name,
  COUNT(*) FILTER (WHERE titre_en IS NULL) as missing_titre_en,
  COUNT(*) FILTER (WHERE bio_en IS NULL) as missing_bio_en
FROM cv_info
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
UNION ALL
SELECT
  'experiences' as table_name,
  COUNT(*) FILTER (WHERE titre_en IS NULL) as missing_titre_en,
  COUNT(*) FILTER (WHERE description_en IS NULL) as missing_description_en
FROM experiences
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
UNION ALL
SELECT
  'formations' as table_name,
  COUNT(*) FILTER (WHERE diplome_en IS NULL) as missing_diplome_en,
  COUNT(*) FILTER (WHERE description_en IS NULL) as missing_description_en
FROM formations
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'
UNION ALL
SELECT
  'competences' as table_name,
  COUNT(*) FILTER (WHERE categorie_en IS NULL) as missing_categorie_en,
  COUNT(*) FILTER (WHERE competence_en IS NULL) as missing_competence_en
FROM competences
WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- ============================================
-- Confirmation Message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'English translations successfully applied!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Updated records for user: d5b317b1-34ba-4289-8d40-11fd1b584315';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - cv_info: 1 record (titre_en, bio_en)';
  RAISE NOTICE '  - experiences: 17 records (titre_en, entreprise_en, description_en)';
  RAISE NOTICE '  - formations: 2 records (diplome_en, institution_en, description_en)';
  RAISE NOTICE '  - competences: 16 records (categorie_en, competence_en, niveau_en)';
  RAISE NOTICE '';
  RAISE NOTICE 'Please run the verification queries above to confirm all translations were applied correctly.';
  RAISE NOTICE '====================================';
END $$;
