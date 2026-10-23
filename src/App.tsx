import { useEffect, useRef, useState, type FormEvent, type MouseEvent as RMouseEvent, type ReactNode } from 'react'

/* ==================================================================== */
/*  SETTINGS                                                             */
/* ==================================================================== */

/**
 * Contact form powered by FormSubmit (free third-party email delivery).
 * REQUIRED ONCE: submit a test message, then click the FormSubmit activation link
 * sent to the destination inbox. A test submission before activation is NOT delivered.
 * Keep the endpoint constant in source; FormSubmit will handle delivery after activation.
 */
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/maryam.ghaderian.work@gmail.com'

// Vite public assets must use the configured deployment base path.
// Works in development and when hosted at /portfolio/ on GitHub Pages.
const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

type Lang = 'en' | 'it'
type Theme = 'dark' | 'light'

/* ==================================================================== */
/*  STATIC DATA (language independent)                                   */
/* ==================================================================== */

const contact = {
  email: 'maryam.ghaderian.work@gmail.com',
  linkedin: 'https://www.linkedin.com/in/maryamghaderian',
  github: 'https://github.com/maryamghaderian',
}

const navHrefs = ['#home', '#projects', '#experience', '#certificates', '#skills', '#about', '#contact']

type CompareImages = { before: string; after: string }

type ProjectBase = {
  index: string
  linkedinPost: string
  link: string
  image: string
  tools: string[]
  /**
   * Optional before/after slider. Fill this in when you have two images, e.g.
   *   compare: { before: '/projects/amatrice-before.jpg', after: '/projects/amatrice-after.jpg' }
   * and the project image is replaced by a draggable comparison slider.
   */
  compare?: CompareImages
}

const projectsBase: ProjectBase[] = [
  {
    index: '01',
    linkedinPost: 'https://lnkd.in/p/diUkxrmd',
    link: 'https://github.com/maryamghaderian/orchard-webgis-data-harmonization',
    image: 'https://raw.githubusercontent.com/maryamghaderian/orchard-webgis-data-harmonization/main/assets/webgis_interface.png',
    tools: ['LiDAR', 'PostGIS', 'GeoServer', 'Leaflet'],
  },
  {
    index: '02',
    linkedinPost: 'https://lnkd.in/p/dCvbYZKg',
    link: 'https://github.com/maryamghaderian/sentinel1-insar-amatrice-2016',
    image: 'https://raw.githubusercontent.com/maryamghaderian/sentinel1-insar-amatrice-2016/main/figures/final/amatrice_insar_los_displacement_validation.png',
    tools: ['SAR', 'InSAR', 'Earth Observation'],
  },
  {
    index: '03',
    linkedinPost: 'https://lnkd.in/p/d7NiS_af',
    link: 'https://github.com/maryamghaderian/water-environmental-geodecision-webgis-turin-po',
    image: 'https://raw.githubusercontent.com/maryamghaderian/water-environmental-geodecision-webgis-turin-po/main/04_outputs/screenshots/webgis_ndvi_overview_screenshot.png',
    tools: ['Sentinel-2', 'QGIS', 'Spatial Analysis'],
  },
]

const experienceBase = [
  { period: '2015–2019', organization: 'Range and Watershed Management Organization' },
  { period: '2014–2015', organization: 'Sabz Eghlim Caspian' },
  { period: '2011–2013', organization: 'Abnemood Shomal Shargh' },
  { period: '2007–2009', organization: 'Abrah Gostar Tadbir' },
]

type CertBaseItem = { title: string; issuer: string; image: string; file?: string }
type CertBaseAlbum = { id: string; cover: string; issuer: string; items: CertBaseItem[] }

const certBase: CertBaseAlbum[] = [
  {
    id: 'geospatial-remote-sensing',
    issuer: 'NASA ARSET · Esri · Politecnico di Torino',
    cover: publicAsset('/certificates/nasa-fundamentals-remote-sensing.jpg'),
    items: [
      { title: 'Fundamentals of Remote Sensing', issuer: 'NASA Applied Remote Sensing Training (ARSET) Program', image: publicAsset('/certificates/nasa-fundamentals-remote-sensing.jpg') },
      { title: 'Processing SAR Data in ArcGIS Notebooks', issuer: 'Esri Training', image: publicAsset('/certificates/esri-processing-sar-arcgis-notebooks.jpg') },
      { title: 'Geo²Plan – Geomatics for Geology and Planning', issuer: 'Politecnico di Torino · International Summer School', image: publicAsset('/certificates/geo2plan-polito.jpg'), file: publicAsset('/certificates/GHADERIAN_GEO2PLAN_polito_certificate.pdf') },
    ],
  },
  {
    id: 'environment-water-climate',
    issuer: 'UNU-INWEH · FAO · EDHEC / Coursera',
    cover: publicAsset('/certificates/fao-sdg15-land-cover.jpg'),
    items: [
      { title: 'Unconventional Water Resources', issuer: 'United Nations University Institute for Water, Environment and Health (UNU-INWEH)', image: publicAsset('/certificates/unu-unconventional-water-resources.jpg') },
      { title: 'Using Land-Cover Information to Monitor Progress on Sustainable Development Goal 15', issuer: 'FAO eLearning Academy', image: publicAsset('/certificates/fao-sdg15-land-cover.jpg') },
      { title: 'Science and Engineering of Climate Change', issuer: 'EDHEC Business School · Coursera', image: publicAsset('/certificates/science-engineering-climate-change.jpg'), file: publicAsset('/certificates/Science and Engineering of Climate Change.pdf') },
    ],
  },
  {
    id: 'academic-agritech',
    issuer: 'Politecnico di Torino · Università di Torino',
    cover: publicAsset('/certificates/nanotechnologies-agriculture-summer-school.jpg'),
    items: [
      { title: 'Nanotechnologies in Agriculture – 3rd Summer School', issuer: 'Politecnico di Torino · Università di Torino', image: publicAsset('/certificates/nanotechnologies-agriculture-summer-school.jpg') },
    ],
  },
]


/**
 * Representative project-location markers, not precise site polygons.
 * Agrion coordinates identify the Manta fruit research centre (Regione Piemonte);
 * they do not claim to locate the precise surveyed orchard footprint.
 */
const SITES = [
  { id: 'agrion', lat: 44.608889, lng: 7.507778, zoom: 13 },
  { id: 'amatrice', lat: 42.6283, lng: 13.2917, zoom: 10 },
  { id: 'turin', lat: 45.0703, lng: 7.6869, zoom: 10 },
]


/* ==================================================================== */
/*  TRANSLATIONS                                                         */
/* ==================================================================== */

interface ProjectCopy { field: string; title: string; description: string; detail: string; context: string; data: string; method: string; output: string }
interface ExperienceCopy { title: string; arrangement: string; description: string; highlight?: string }
interface SkillCopy { number: string; title: string; label: string; summary: string; tools: string[] }
interface CertAlbumCopy { badge: string; title: string; description: string; items: { date: string; note: string }[] }
interface Copy {
  ui: Record<string, string>
  nav: string[]
  chips: string[]
  projects: Record<string, ProjectCopy>
  experience: ExperienceCopy[]
  skills: SkillCopy[]
  about: { title: string; text: string }[]
  certs: Record<string, CertAlbumCopy>
  sites: Record<string, { name: string; note: string }>
}

const en: Copy = {
  ui: {
    skip: 'Skip to content',
    portfolio: 'Portfolio', credentialEducation: 'MSc · 2026', credentialFoundation: 'MSc · 2021', credentialFocus: 'BSc · 2007',
    role: 'GIS & Geospatial Analyst',
    sub1: 'Remote Sensing', sub2: 'Earth Observation', sub3: 'Environmental GIS',
    tagline: 'Evidence-driven maps. Practical geospatial insight.',
    heroText: 'I use GIS, satellite imagery, and LiDAR data to analyze environmental and territorial challenges. My work focuses on spatial data quality, remote sensing, and producing reliable maps that support practical decision-making.',
    downloadCv: 'Download CV',
    statProjects: 'Selected projects', statRoles: 'Professional roles', statCerts: 'Certificates',
    openRemote: 'Open to remote',
    projectsEyebrow: 'Selected work', projectsTitle: 'Projects',
    caseStudy: 'Case study', linkedin: 'LinkedIn', github: 'GitHub',
    mapEyebrow: 'Where the work happens', mapTitle: 'Study Areas',
    mapHint: 'Interactive map of study areas. Use the +/− controls or pick a site below.',
    mapOverview: 'Italy overview', mapFail: 'The map could not be loaded. Please check your connection.',
    expEyebrow: 'Career', expTitle: 'Experience',
    certEyebrow: 'Credentials', certTitle: 'Certificates',
    issuedBy: 'Issued by', preview: 'Preview', certificate: 'Certificate', certificates: 'Certificates',
    albumContents: 'Album contents', openOriginal: 'View original certificate', closeCerts: 'Close certificates preview',
    skillsEyebrow: 'Expertise', skillsTitle: 'Technical Skills',
    aboutEyebrow: 'The story', aboutTitle: 'About Me',
    availTitle: 'Availability', availRoles: 'GIS, Remote Sensing and Geospatial Analysis roles',
    contactEyebrow: 'Get in touch', contactTitle: 'Contact Me',
    email: 'Email',
    phName: 'Full Name', phEmail: 'Email Address', phSubject: 'Subject / Opportunity', phMessage: 'Your Message',
    aName: 'Full name', aEmail: 'Email address', aSubject: 'Subject', aMessage: 'Message',
    send: 'Send Message', sending: 'Sending…',
    sent: 'Thank you — your message has been sent.',
    error: 'Something went wrong. Please email me directly.',
    toTop: 'Back to top ↑',
    csContext: 'Context', csData: 'Data', csMethod: 'Method', csOutput: 'Output', csTools: 'Tools',
    csClose: 'Close case study', csNote: 'Project overview',
    themeToLight: 'Switch to light theme', themeToDark: 'Switch to dark theme', langLabel: 'Language',
    formNote: 'Opens your email application to send the message.', menu: 'Toggle navigation', cmpBefore: 'Before', cmpAfter: 'After', cmpAria: 'Before and after comparison slider',
    metaDesc: 'GIS & Geospatial Analyst specializing in remote sensing, Earth observation and environmental spatial analysis.',
  },
  nav: ['Home', 'Projects', 'Experience', 'Certificates', 'Skills', 'About', 'Contact'],
  chips: ['On-site', 'Hybrid', 'Remote', 'Relocation within Italy', 'International teams'],
  projects: {
    '01': {
      field: 'LIDAR / GEOSPATIAL DATA', title: 'Orchard WebGIS',
      description: 'From point clouds and field observations to validated orchard layers and a local WebGIS prototype.',
      detail: '56 validated crown polygons · 103 apple observations',
      context: 'Turning raw LiDAR point clouds and field observations into harmonized, validated orchard layers that can be explored on the web.',
      data: 'LiDAR point clouds and 103 apple observations collected in the field.',
      method: 'Point-cloud processing and crown delineation, validation against field observations and harmonization into a spatial database (PostGIS).',
      output: '56 validated crown polygons and a local, read-only WebGIS prototype published with GeoServer and Leaflet.',
    },
    '02': {
      field: 'REMOTE SENSING / INSAR', title: 'Amatrice Earthquake InSAR',
      description: 'Sentinel-1 interferometry and qualitative validation of line-of-sight ground deformation.',
      detail: 'Sentinel-1 · SNAP · SNAPHU · QGIS',
      context: 'Measuring from space the ground deformation caused by the 2016 Amatrice earthquake.',
      data: 'Sentinel-1 radar acquisitions covering the event.',
      method: 'Interferometric processing in ESA SNAP, phase unwrapping with SNAPHU, mapping and validation in QGIS.',
      output: 'A line-of-sight displacement map with qualitative validation of the deformation pattern.',
    },
    '03': {
      field: 'ENVIRONMENTAL GIS / EO', title: 'Turin–Po River GeoDecision',
      description: 'An exploratory environmental mapping workflow combining Sentinel-2 indicators and spatial datasets.',
      detail: 'NDVI · NDWI · QGIS · Interactive maps',
      context: 'An exploratory look at vegetation and water conditions along the Po River near Turin.',
      data: 'Sentinel-2 imagery and complementary spatial datasets.',
      method: 'Computation of NDVI and NDWI indicators and spatial analysis in QGIS.',
      output: 'Environmental maps and an interactive WebGIS overview of the indicators.',
    },
  },
  experience: [
    { title: 'GIS Specialist', arrangement: 'Part-time / Project-based', highlight: '45+ thematic maps · 7,920 ha', description: 'Produced more than 45 thematic GIS maps for rangeland and watershed management studies covering over 7,920 hectares. Organized and analyzed spatial datasets, delivering clear cartographic outputs for land and water assessments, technical reporting, and planning.' },
    { title: 'GIS Analyst', arrangement: 'Full-time', description: 'Prepared GIS datasets, conducted spatial analyses, and produced thematic maps for environmental and territorial studies. Delivered consistent cartographic outputs to support technical reporting and project assessments.' },
    { title: 'Technical & GIS Analyst', arrangement: 'Full-time', highlight: '10 sub-basins · 6,755 ha', description: 'Supported spatial assessment of a 6,755-hectare watershed divided into ten sub-basins. Prepared and interpreted GIS datasets and thematic maps to characterize the area and inform watershed evaluation, technical reporting, and planning.' },
    { title: 'Water Resources GIS Analyst', arrangement: 'Full-time', description: 'Prepared and organized geospatial datasets for water resources and environmental engineering studies. Produced thematic maps and spatial analysis outputs to support technical assessments and project documentation.' },
  ],
  skills: [
    { number: '01', title: 'GIS & Spatial Analysis', label: 'Core expertise', summary: 'Spatial data processing, analysis and thematic mapping for environmental and territorial applications.', tools: ['QGIS', 'ArcGIS Pro', 'Spatial data processing', 'Thematic cartography', 'Coordinate systems & projections', 'Spatial data harmonization'] },
    { number: '02', title: 'Remote Sensing & EO', label: 'Core expertise', summary: 'Processing and interpretation of optical and radar imagery for environmental monitoring and spatial analysis.', tools: ['Sentinel-1 / Sentinel-2', 'ESA SNAP', 'SNAPHU', 'SAR / InSAR workflows', 'NDVI / NDWI', 'Raster analysis'] },
    { number: '03', title: 'Spatial Data Management', label: 'Technical workflow', summary: 'Geospatial data organization, validation and harmonization for reliable analysis and publication.', tools: ['PostgreSQL / PostGIS', 'Python-assisted GIS workflows', 'GeoPandas', 'Rasterio / GDAL', 'Vector & raster QA/QC', 'Spatial database preparation'] },
    { number: '04', title: 'Geomatics & LiDAR', label: 'Applied project experience', summary: 'Field-survey and LiDAR data processing for mapping and spatial assessment.', tools: ['LiDAR point clouds', 'CloudCompare', 'GNSS / RTK', 'UAV-based surveying', 'Point-cloud processing', 'Field geospatial data'] },
    { number: '05', title: 'Environmental GIS', label: 'Domain expertise', summary: 'Spatial analysis for watershed management, environmental monitoring and territorial planning.', tools: ['Watershed analysis', 'Land use / land cover', 'Territorial assessment', 'Environmental monitoring', 'Water resources GIS', 'Decision-support maps'] },
    { number: '06', title: 'WebGIS & Publication', label: 'Supporting capability', summary: 'Web mapping and publication of GIS outputs, including local read-only prototypes.', tools: ['GeoServer', 'WMS / WFS', 'Leaflet', 'TypeScript / Vite', 'Docker / Nginx', 'QGIS2Web'] },
  ],
  about: [
    { title: 'Who I Am', text: 'I am a GIS and Geospatial Analyst with a background in environmental and water engineering. My work focuses on spatial data analysis, remote sensing and thematic mapping for environmental monitoring, watershed studies and territorial assessment. I combine technical GIS workflows with clear cartographic communication to make geographic information useful for practical decisions.' },
    { title: 'My Professional Journey', text: 'My professional experience began with GIS mapping and analysis for water resources, watershed management and environmental studies. I later completed an MSc in Environmental Engineering and an MSc in Agritech Engineering at Politecnico di Torino in 2026. Recent projects have focused on Sentinel-1 InSAR, LiDAR-based orchard mapping, geospatial data harmonization and interactive environmental mapping.' },
    { title: 'What I Bring', text: 'I bring experience preparing, validating and interpreting geospatial datasets, producing thematic maps and supporting technical assessments. My strengths include attention to spatial data quality, multidisciplinary problem-solving and clear communication of analysis results. I contribute a practical perspective to GIS, Remote Sensing and Geospatial Analysis projects, including work with international teams.' },
  ],
  certs: {
    'geospatial-remote-sensing': {
      badge: 'Geospatial / Remote Sensing', title: 'Geospatial & Remote Sensing',
      description: 'Professional training in remote sensing, SAR processing, and applied geomatics.',
      items: [
        { date: 'Awarded on 22 December 2025', note: 'Introductory remote sensing training focused on Earth observation principles and practical interpretation of remotely sensed data.' },
        { date: 'Completed on 1 January 2026', note: 'Focused on processing SAR data in the ArcGIS ecosystem, reinforcing skills relevant to radar-based geospatial workflows.' },
        { date: '30 August – 6 September 2026', note: 'Field-based international summer school on geomatics, geology, spatial planning and mountain territories.' },
      ],
    },
    'environment-water-climate': {
      badge: 'Environment / Water / Climate', title: 'Environment, Water & Climate',
      description: 'Complementary training in water resources, environmental monitoring, and climate science.',
      items: [
        { date: 'Completed on 29 October 2024', note: 'Short course on unconventional water resources, relevant to environmental engineering and water-related sustainability topics.' },
        { date: 'Completed on 7 August 2026', note: 'Focused on land-cover information for monitoring SDG 15, linking geospatial data to sustainability and environmental reporting.' },
        { date: 'Completed on 24 October 2022', note: 'Coursework on climate-change science and engineering concepts, adding broader context to environmental and geospatial analysis.' },
      ],
    },
    'academic-agritech': {
      badge: 'Academic / Agritech', title: 'Academic & Agritech Training',
      description: 'University-based training in agricultural innovation and applied science.',
      items: [
        { date: 'Attended on 19–20 September 2024', note: 'Certificate of attendance for a summer school linked to innovation in agriculture and applied agritech topics.' },
      ],
    },
  },
  sites: {
    amatrice: { name: 'Amatrice', note: '2016 earthquake area · Sentinel-1 InSAR deformation study' },
    turin: { name: 'Turin–Po River', note: 'Sentinel-2 NDVI / NDWI environmental mapping (approximate location)' },
  },
}

const it: Copy = {
  ui: {
    skip: 'Vai al contenuto',
    portfolio: 'Portfolio', credentialEducation: 'Laurea magistrale · 2026', credentialFoundation: 'Laurea magistrale · 2021', credentialFocus: 'Laurea triennale · 2007',
    role: 'GIS & Geospatial Analyst',
    sub1: 'Telerilevamento', sub2: 'Osservazione della Terra', sub3: 'GIS ambientale',
    tagline: 'Mappe basate sui dati. Analisi geospaziali concrete.',
    heroText: 'Utilizzo GIS, immagini satellitari e dati LiDAR per analizzare problematiche ambientali e territoriali. Mi occupo di qualità dei dati spaziali, telerilevamento e produzione di mappe affidabili a supporto delle decisioni operative.',
    downloadCv: 'Scarica il CV',
    statProjects: 'Progetti selezionati', statRoles: 'Ruoli professionali', statCerts: 'Certificati',
    openRemote: 'Disponibile da remoto',
    projectsEyebrow: 'Lavori selezionati', projectsTitle: 'Progetti',
    caseStudy: 'Case study', linkedin: 'LinkedIn', github: 'GitHub',
    mapEyebrow: 'Dove nasce il lavoro', mapTitle: 'Aree di studio',
    mapHint: 'Mappa interattiva delle aree di studio. Usa i controlli +/− o scegli un sito qui sotto.',
    mapOverview: 'Panoramica Italia', mapFail: 'Impossibile caricare la mappa. Controlla la connessione.',
    expEyebrow: 'Carriera', expTitle: 'Esperienza',
    certEyebrow: 'Credenziali', certTitle: 'Certificati',
    issuedBy: 'Rilasciato da', preview: 'Anteprima', certificate: 'Certificato', certificates: 'Certificati',
    albumContents: "Contenuto dell'album", openOriginal: "Visualizza il certificato originale", closeCerts: "Chiudi l'anteprima dei certificati",
    skillsEyebrow: 'Know-how', skillsTitle: 'Competenze tecniche',
    aboutEyebrow: 'La mia storia', aboutTitle: 'Chi sono',
    availTitle: 'Disponibilità', availRoles: 'Ruoli in ambito GIS, Remote Sensing e Analisi Geospaziale',
    contactEyebrow: 'Parliamone', contactTitle: 'Contattami',
    email: 'Email',
    phName: 'Nome e cognome', phEmail: 'Indirizzo email', phSubject: 'Oggetto / Opportunità', phMessage: 'Il tuo messaggio',
    aName: 'Nome e cognome', aEmail: 'Indirizzo email', aSubject: 'Oggetto', aMessage: 'Messaggio',
    send: 'Invia messaggio', sending: 'Invio in corso…',
    sent: 'Grazie — il tuo messaggio è stato inviato.',
    error: 'Qualcosa è andato storto. Scrivimi direttamente via email.',
    toTop: 'Torna su ↑',
    csContext: 'Contesto', csData: 'Dati', csMethod: 'Metodo', csOutput: 'Risultato', csTools: 'Strumenti',
    csClose: 'Chiudi il case study', csNote: 'Panoramica del progetto',
    themeToLight: 'Passa al tema chiaro', themeToDark: 'Passa al tema scuro', langLabel: 'Lingua',
    formNote: 'Apre la tua app email per inviare il messaggio.', menu: 'Apri/chiudi menu', cmpBefore: 'Prima', cmpAfter: 'Dopo', cmpAria: 'Cursore di confronto prima e dopo',
    metaDesc: 'GIS e Geospatial Analyst specializzata in telerilevamento, osservazione della Terra e analisi spaziale ambientale.',
  },
  nav: ['Home', 'Progetti', 'Esperienza', 'Certificati', 'Competenze', 'Chi sono', 'Contatti'],
  chips: ['In sede', 'Ibrido', 'Da remoto', 'Trasferimento in Italia', 'Team internazionali'],
  projects: {
    '01': {
      field: 'LIDAR / DATI GEOSPAZIALI', title: 'Orchard WebGIS',
      description: 'Da nuvole di punti e osservazioni di campo a livelli validati del frutteto e a un prototipo WebGIS locale.',
      detail: '56 poligoni di chioma validati · 103 osservazioni di mele',
      context: 'Trasformare nuvole di punti LiDAR grezze e osservazioni di campo in livelli armonizzati e validati del frutteto, esplorabili sul web.',
      data: 'Nuvole di punti LiDAR e 103 osservazioni di mele raccolte sul campo.',
      method: 'Elaborazione della nuvola di punti e delineazione delle chiome, validazione con le osservazioni di campo e armonizzazione in un database spaziale (PostGIS).',
      output: '56 poligoni di chioma validati e un prototipo WebGIS locale in sola lettura pubblicato con GeoServer e Leaflet.',
    },
    '02': {
      field: 'TELERILEVAMENTO / INSAR', title: 'Terremoto di Amatrice – InSAR',
      description: 'Interferometria Sentinel-1 e validazione qualitativa della deformazione del suolo lungo la linea di vista (LOS).',
      detail: 'Sentinel-1 · SNAP · SNAPHU · QGIS',
      context: 'Misurare dallo spazio la deformazione del suolo causata dal terremoto di Amatrice del 2016.',
      data: "Acquisizioni radar Sentinel-1 relative all'evento.",
      method: 'Elaborazione interferometrica con ESA SNAP, unwrapping di fase con SNAPHU, mappatura e validazione in QGIS.',
      output: 'Una mappa di spostamento lungo la linea di vista con validazione qualitativa dello schema di deformazione.',
    },
    '03': {
      field: 'GIS AMBIENTALE / EO', title: 'Torino–Po GeoDecision',
      description: 'Un flusso di mappatura ambientale esplorativo che combina indicatori Sentinel-2 e dataset spaziali.',
      detail: 'NDVI · NDWI · QGIS · Mappe interattive',
      context: "Uno sguardo esplorativo alle condizioni di vegetazione e acqua lungo il Po nei pressi di Torino.",
      data: 'Immagini Sentinel-2 e dataset spaziali complementari.',
      method: 'Calcolo degli indicatori NDVI e NDWI e analisi spaziale in QGIS.',
      output: 'Mappe ambientali e una panoramica WebGIS interattiva degli indicatori.',
    },
  },
  experience: [
    { title: 'Specialista GIS', arrangement: 'Part-time / Su progetto', highlight: '45+ mappe tematiche · 7.920 ha', description: "Ho prodotto oltre 45 mappe tematiche GIS per studi sulla gestione di pascoli e bacini idrografici relativi a più di 7.920 ettari. Ho organizzato e analizzato dati spaziali, realizzando elaborati cartografici per valutazioni territoriali e idriche, relazioni tecniche e pianificazione." },
    { title: 'Analista GIS', arrangement: 'Tempo pieno', description: "Ho preparato dataset GIS, svolto analisi spaziali e prodotto mappe tematiche per studi ambientali e territoriali. Ho fornito elaborati cartografici coerenti a supporto delle valutazioni progettuali e della documentazione tecnica." },
    { title: 'Analista Tecnico e GIS', arrangement: 'Tempo pieno', highlight: '10 sottobacini · 6.755 ha', description: "Ho contribuito alla valutazione spaziale di un bacino idrografico di 6.755 ettari suddiviso in dieci sottobacini. Ho preparato e interpretato dataset GIS e mappe tematiche per descrivere il territorio e supportare valutazioni del bacino, relazioni tecniche e pianificazione." },
    { title: 'Analista GIS per le Risorse Idriche', arrangement: 'Tempo pieno', description: "Ho preparato e organizzato dataset geospaziali per studi sulle risorse idriche e sull'ingegneria ambientale. Ho prodotto mappe tematiche ed elaborati di analisi spaziale a supporto delle valutazioni tecniche e della documentazione di progetto." },
  ],
  skills: [
    { number: '01', title: 'GIS e analisi spaziale', label: 'Competenza chiave', summary: 'Elaborazione e analisi dei dati spaziali e cartografia tematica per applicazioni ambientali e territoriali.', tools: ['QGIS', 'ArcGIS Pro', 'Elaborazione di dati spaziali', 'Cartografia tematica', 'Sistemi di coordinate e proiezioni', 'Armonizzazione dei dati spaziali'] },
    { number: '02', title: 'Telerilevamento e EO', label: 'Competenza chiave', summary: "Elaborazione e interpretazione di immagini ottiche e radar per il monitoraggio ambientale e l'analisi spaziale.", tools: ['Sentinel-1 / Sentinel-2', 'ESA SNAP', 'SNAPHU', 'Flussi di lavoro SAR / InSAR', 'NDVI / NDWI', 'Analisi raster'] },
    { number: '03', title: 'Gestione dei dati spaziali', label: 'Flusso di lavoro tecnico', summary: "Organizzazione, validazione e armonizzazione di dati geospaziali per analisi e pubblicazione affidabili.", tools: ['PostgreSQL / PostGIS', 'Flussi GIS con Python', 'GeoPandas', 'Rasterio / GDAL', 'QA/QC di vettori e raster', 'Preparazione di database spaziali'] },
    { number: '04', title: 'Geomatica e LiDAR', label: 'Esperienza applicata ai progetti', summary: 'Elaborazione di rilievi sul campo e dati LiDAR per cartografia e valutazioni spaziali.', tools: ['Nuvole di punti LiDAR', 'CloudCompare', 'GNSS / RTK', 'Rilievi con UAV', 'Elaborazione di nuvole di punti', 'Dati geospaziali di campo'] },
    { number: '05', title: 'GIS ambientale', label: 'Competenza di dominio', summary: 'Analisi spaziale per la gestione dei bacini, il monitoraggio ambientale e la pianificazione territoriale.', tools: ['Analisi di bacino', 'Uso / copertura del suolo', 'Valutazione territoriale', 'Monitoraggio ambientale', 'GIS per le risorse idriche', 'Mappe di supporto alle decisioni'] },
    { number: '06', title: 'WebGIS e pubblicazione', label: 'Competenza di supporto', summary: 'Pubblicazione di risultati GIS su mappe web e prototipi locali in sola lettura.', tools: ['GeoServer', 'WMS / WFS', 'Leaflet', 'TypeScript / Vite', 'Docker / Nginx', 'QGIS2Web'] },
  ],
  about: [
    { title: 'Chi sono', text: 'Sono una GIS e Geospatial Analyst con una formazione in ingegneria ambientale e delle risorse idriche. Mi occupo di analisi dei dati spaziali, telerilevamento e cartografia tematica per il monitoraggio ambientale, gli studi di bacino e la valutazione territoriale. Unisco flussi di lavoro GIS tecnici e una comunicazione cartografica chiara per rendere le informazioni geografiche utili alle decisioni pratiche.' },
    { title: 'Il mio percorso professionale', text: 'Ho iniziato il mio percorso professionale con la cartografia e l’analisi GIS per le risorse idriche, la gestione dei bacini e gli studi ambientali. Ho poi conseguito una laurea magistrale in Ingegneria Ambientale e un MSc in Agritech Engineering al Politecnico di Torino nel 2026. I progetti più recenti riguardano InSAR con Sentinel-1, mappatura di frutteti con LiDAR, armonizzazione di dati geospaziali e cartografia ambientale interattiva.' },
    { title: 'Cosa porto', text: 'Ho esperienza nella preparazione, validazione e interpretazione di dataset geospaziali, nella produzione di carte tematiche e nel supporto alle valutazioni tecniche. I miei punti di forza comprendono l’attenzione alla qualità dei dati spaziali, un approccio multidisciplinare e la comunicazione chiara dei risultati. Porto una prospettiva pratica nei progetti GIS, di telerilevamento e di analisi geospaziale, anche in team internazionali.' },
  ],
  certs: {
    'geospatial-remote-sensing': {
      badge: 'Geospaziale / Telerilevamento', title: 'Geospaziale e Telerilevamento',
      description: "Formazione in telerilevamento, elaborazione SAR e geomatica applicata.",
      items: [
        { date: 'Conseguito il 22 dicembre 2025', note: "Formazione introduttiva sul telerilevamento, incentrata sui principi dell'osservazione della Terra e sull'interpretazione pratica dei dati telerilevati." },
        { date: 'Completato il 1° gennaio 2026', note: "Incentrato sull'elaborazione di dati SAR nell'ecosistema ArcGIS, rafforzando competenze utili per i flussi di lavoro geospaziali basati su radar." },
        { date: '30 agosto – 6 settembre 2026', note: 'Scuola estiva internazionale sul campo su geomatica, geologia, pianificazione territoriale e territori montani.' },
      ],
    },
    'environment-water-climate': {
      badge: 'Ambiente / Acqua / Clima', title: 'Ambiente, Acqua e Clima',
      description: 'Formazione complementare in risorse idriche, monitoraggio ambientale e scienze del clima.',
      items: [
        { date: 'Completato il 29 ottobre 2024', note: "Breve corso sulle risorse idriche non convenzionali, rilevante per l'ingegneria ambientale e i temi di sostenibilità legati all'acqua." },
        { date: 'Completato il 7 agosto 2026', note: "Incentrato sull'uso delle informazioni sulla copertura del suolo per monitorare l'SDG 15, collegando dati geospaziali, sostenibilità e rendicontazione ambientale." },
        { date: 'Completato il 24 ottobre 2022', note: "Corso su scienza e ingegneria del cambiamento climatico, che aggiunge un contesto più ampio all'analisi ambientale e geospaziale." },
      ],
    },
    'academic-agritech': {
      badge: 'Accademico / Agritech', title: 'Formazione accademica e Agritech',
      description: "Formazione universitaria in innovazione agricola e scienze applicate.",
      items: [
        { date: 'Frequentato il 19–20 settembre 2024', note: "Attestato di partecipazione a una scuola estiva legata all'innovazione in agricoltura e ai temi applicati dell'agritech." },
      ],
    },
  },
  sites: {
    amatrice: { name: 'Amatrice', note: 'Area del terremoto del 2016 · studio di deformazione InSAR con Sentinel-1' },
    turin: { name: 'Torino–Po', note: 'Mappatura ambientale NDVI / NDWI con Sentinel-2 (posizione approssimativa)' },
  },
}

const COPY: Record<Lang, Copy> = { en, it }

/* ==================================================================== */
/*  HELPERS                                                              */
/* ==================================================================== */

function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function writeStore(key: string, value: string) {
  try { window.localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}

let leafletPromise: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  const w = window as any
  if (w.L) return Promise.resolve(w.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve((window as any).L)
    script.onerror = () => { leafletPromise = null; reject(new Error('leaflet failed to load')) }
    document.body.appendChild(script)
  })
  return leafletPromise
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/* ==================================================================== */
/*  SMALL COMPONENTS                                                     */
/* ==================================================================== */

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${shown ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  )
}

function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const move = (e: RMouseEvent<HTMLSpanElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.3
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  return (
    <span ref={ref} onMouseMove={move} onMouseLeave={leave} className={`inline-block transition-transform duration-300 ease-out ${className}`}>
      {children}
    </span>
  )
}

function SectionHeading({ eyebrow, title, small = false }: { eyebrow: string; title: string; small?: boolean }) {
  return (
    <Reveal className={small ? 'mb-8 lg:mb-10' : 'mb-14 lg:mb-20'}>
      {eyebrow && (
        <div className="flex items-center gap-5">
          <span className="font-display c-gold text-[15px] italic tracking-[.08em]">{eyebrow}</span>
          <span aria-hidden="true" className="h-px w-24 bg-gradient-to-r from-[var(--gold)] to-transparent opacity-70" />
        </div>
      )}
      {small ? (
        <h3 className="font-display c-ink mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.05] tracking-[-.02em]">{title}</h3>
      ) : (
        <h2 className={`font-display c-ink ${eyebrow ? 'mt-4' : 'mt-0'} text-[clamp(2.8rem,6vw,5.6rem)] font-medium leading-[1.02] tracking-[-.02em]`}>{title}</h2>
      )}
    </Reveal>
  )
}

function IconArrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-px">{diagonal ? '↗' : '→'}</span>
}

type SocialName = 'linkedin' | 'github'
function SocialIcon({ name }: { name: SocialName }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const }
  if (name === 'linkedin') return <svg {...common}><path d="M4.6 3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM3.3 8h2.6v12H3.3V8Zm5 0h2.5v1.7c.6-1.1 1.7-1.9 3.6-1.9 3 0 4.1 1.9 4.1 5V20h-2.7v-6.4c0-1.5-.3-3-2.1-3-1.9 0-2.7 1.5-2.7 3V20H8.3V8Z" /></svg>
  return <svg {...common}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.7c-2.77.6-3.35-1.18-3.35-1.18-.46-1.16-1.12-1.47-1.12-1.47-.91-.63.07-.62.07-.62 1 .07 1.54 1.03 1.54 1.03.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.64-1.32-2.21-.25-4.53-1.1-4.53-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.32 4.69-4.54 4.94.36.31.69.92.69 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
}

function CompareSlider({ before, after, alt, labels }: { before: string; after: string; alt: string; labels: { before: string; after: string; aria: string } }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative h-full w-full select-none overflow-hidden">
      <img src={after} alt={`${alt} — ${labels.after}`} className="absolute inset-0 h-full w-full object-contain" decoding="async" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={`${alt} — ${labels.before}`} className="h-full w-full object-contain" decoding="async" />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-[var(--hdr)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] c-gold">{labels.before}</span>
      <span className="absolute right-3 top-3 rounded-full bg-[var(--hdr)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] c-gold">{labels.after}</span>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-[var(--gold)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bd-x bg-[var(--bg)] c-gold">↔</span>
      </div>
      <input type="range" min={0} max={100} value={pos} aria-label={labels.aria} onChange={e => setPos(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  )
}

/* Each project keeps its geographical context beside its own case study. */
function ProjectLocationMap({ siteId, lang }: { siteId: 'agrion' | 'amatrice' | 'turin'; lang: Lang }) {
  const mapElement = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const site = SITES.find(s => s.id === siteId)!
  useEffect(() => {
    let stopped = false
    let map: any = null
    loadLeaflet().then(L => {
      if (stopped || !mapElement.current) return
      map = L.map(mapElement.current, { scrollWheelZoom: false, zoomControl: true, dragging: true })
        .setView([site.lat, site.lng], site.zoom)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      }).addTo(map)
      L.circleMarker([site.lat, site.lng], {
        radius: 9, color: '#d6b87a', weight: 2, fillColor: '#d6b87a', fillOpacity: .65,
      }).addTo(map)
      // Location is representative of the study area, not an exact project boundary.
      requestAnimationFrame(() => { if (!stopped) map.invalidateSize() })
    }).catch(() => { if (!stopped) setFailed(true) })
    return () => { stopped = true; if (map) map.remove() }
  }, [siteId])
  const name = siteId === 'agrion' ? 'Fondazione Agrion · Manta (CN)' : siteId === 'amatrice' ? 'Amatrice' : (lang === 'it' ? 'Torino–Po' : 'Turin–Po River')
  return (
    <div className="mt-8 overflow-hidden rounded-[8px] border bd-s bg-alt">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="c-gold text-[11px] font-semibold uppercase tracking-[.12em]">{lang === 'it' ? 'Area di studio' : 'Study area'} · {name}</span>
        <span className="c-mute text-[11px]">{siteId === 'agrion' ? (lang === 'it' ? 'Centro di ricerca · non il perimetro del meleto' : 'Research centre · not orchard boundary') : (lang === 'it' ? 'Posizione indicativa' : 'Approximate location')}</span>
      </div>
      {failed ? <div className="c-soft grid h-[195px] place-items-center text-[13px]">{lang === 'it' ? 'Mappa non disponibile' : 'Map unavailable'}</div>
        : <div ref={mapElement} role="region" aria-label={`${name} study area map`} className="relative z-0 h-[195px] w-full" />}
    </div>
  )
}

/* ==================================================================== */
/*  APP                                                                  */
/* ==================================================================== */

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = readStore('mg-lang')
    if (saved === 'en' || saved === 'it') return saved
    return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en'
  })
  const [theme, setTheme] = useState<Theme>(() => (readStore('mg-theme') === 'light' ? 'light' : 'dark'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(() => window.location.hash || '#home')
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [selectedCertificateIndex, setSelectedCertificateIndex] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'activation' | 'timeout' | 'error'>('idle')

  const t = COPY[lang]

  /* ---- merged, language-resolved data ---- */
  const projects = projectsBase.map(p => ({ ...p, ...t.projects[p.index] }))
  const experience = experienceBase.map((e, i) => ({ ...e, ...t.experience[i] }))
  const albums = certBase.map(a => {
    const c = t.certs[a.id]
    return { ...a, badge: c.badge, title: c.title, description: c.description, items: a.items.map((item, i) => ({ ...item, ...c.items[i] })) }
  })
  const selectedAlbum = albums.find(a => a.id === selectedAlbumId) ?? null
  const selectedCertificate = selectedAlbum ? selectedAlbum.items[selectedCertificateIndex] : null
  const selectedProject = projects.find(p => p.index === selectedProjectId) ?? null

  /* ---- persistence, theme, language, SEO ---- */
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStore('mg-theme', theme)
    setMeta('name', 'theme-color', theme === 'dark' ? '#050b09' : '#f6f1e7')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    writeStore('mg-lang', lang)
    const title = `Maryam Ghaderian — ${t.ui.role}`
    document.title = title
    setMeta('name', 'description', t.ui.metaDesc)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', t.ui.metaDesc)
    setMeta('property', 'og:type', 'website')
    setMeta('name', 'twitter:card', 'summary_large_image')
  }, [lang, t])

  useEffect(() => {
    let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!icon) {
      icon = document.createElement('link')
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='#07120e'/><text x='32' y='41' font-size='26' text-anchor='middle' fill='#d6b87a' font-family='Georgia,serif' font-style='italic'>MG</text></svg>"
    icon.type = 'image/svg+xml'
    icon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Maryam Ghaderian',
      jobTitle: 'GIS & Geospatial Analyst',
      email: `mailto:${contact.email}`,
      sameAs: [contact.linkedin, contact.github],
      knowsAbout: ['GIS', 'Remote Sensing', 'Earth Observation', 'InSAR', 'LiDAR', 'WebGIS', 'Environmental spatial analysis'],
    })
    document.head.appendChild(ld)
    return () => { ld.remove() }
  }, [])

  /* ---- scroll tracking ---- */
  useEffect(() => {
    const update = () => {
      const sections = navHrefs
        .map(h => document.getElementById(h.slice(1)))
        .filter((el): el is HTMLElement => el !== null)
      const position = window.scrollY + 160
      let current = '#home'
      for (const section of sections) {
        if (section.offsetTop <= position) current = `#${section.id}`
      }
      setActiveSection(current)
      setScrolled(window.scrollY > 30)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  /* ---- scroll lock + keyboard for overlays ---- */
  useEffect(() => {
    document.body.style.overflow = menuOpen || selectedAlbumId || selectedProjectId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, selectedAlbumId, selectedProjectId])

  useEffect(() => {
    if (!selectedAlbumId && !selectedProjectId && !menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedAlbumId(null)
        setSelectedProjectId(null)
        setMenuOpen(false)
      }
      if (selectedAlbumId) {
        const count = certBase.find(a => a.id === selectedAlbumId)?.items.length ?? 1
        if (event.key === 'ArrowRight') setSelectedCertificateIndex(prev => Math.min(prev + 1, count - 1))
        if (event.key === 'ArrowLeft') setSelectedCertificateIndex(prev => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedAlbumId, selectedProjectId, menuOpen])

  /* ---- contact form ---- */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const values = new FormData(form)
    if (String(values.get('_gotcha') || '')) return
    const name = String(values.get('fullName') || '').trim()
    const email = String(values.get('email') || '').trim()
    const subject = String(values.get('subject') || '').trim()
    const message = String(values.get('message') || '').trim()
    if (!name || !email || !subject || !message) { setFormStatus('error'); return }

    setFormStatus('sending')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(FORM_ENDPOINT, {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          _replyto: email,
          _subject: `Portfolio contact: ${subject}`,
          subject,
          message,
          _honey: '',
          _template: 'table',
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const result: { success?: boolean | string; message?: string } = await res.json()
      // FormSubmit can return HTTP 200 and the STRING "false" on failure.
      const success = result.success === true || result.success === 'true'
      if (success) {
        setFormStatus('sent')
        form.reset()
      } else if (/activat|confirm/i.test(String(result.message || ''))) {
        setFormStatus('activation')
      } else {
        setFormStatus('error')
      }
    } catch (error) {
      setFormStatus(error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'error')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  const inputClass = 'contact-field w-full border-0 border-b bd bg-transparent px-0 py-4 text-[18px] c-ink outline-none transition-colors duration-300 placeholder:text-[var(--mute)] focus:border-[var(--gold)]'


  return (
    <div className="relative min-h-screen overflow-x-hidden bg-page font-body c-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --bg:#050b09; --bg-alt:#07120e; --panel:#0b1d17;
          --ink:#f3ecdc; --body:#c9c4b6; --soft:#9db2a8; --mute:#7f8d86;
          --gold:#d6b87a; --gold-hi:#ecd9ab; --on-gold:#07120e;
          --g1:#b8955a; --g2:#ecd9ab; --g3:#c9a45f;
          --line:rgba(214,184,122,.25); --line-s:rgba(214,184,122,.15); --line-x:rgba(214,184,122,.5);
          --grid:rgba(214,184,122,.045); --glow:rgba(15,107,77,.2); --glow2:rgba(184,149,90,.1);
          --shadow:rgba(0,0,0,.9); --glow-gold:rgba(214,184,122,.35);
          --hdr:rgba(5,11,9,.82); --overlay:rgba(2,6,5,.9); --grain:.055;
        }
        :root[data-theme='light'] {
          --bg:#f6f1e7; --bg-alt:#efe8da; --panel:#fbf8f1;
          --ink:#14201b; --body:#3a443f; --soft:#55655d; --mute:#6f7b74;
          --gold:#8a6a2f; --gold-hi:#6b4f1d; --on-gold:#fffaf0;
          --g1:#7a5c25; --g2:#b08a45; --g3:#8a6a2f;
          --line:rgba(138,106,47,.32); --line-s:rgba(138,106,47,.18); --line-x:rgba(138,106,47,.6);
          --grid:rgba(138,106,47,.08); --glow:rgba(15,107,77,.1); --glow2:rgba(184,149,90,.16);
          --shadow:rgba(60,45,20,.45); --glow-gold:rgba(138,106,47,.3);
          --hdr:rgba(246,241,231,.86); --overlay:rgba(20,24,20,.72); --grain:.035;
        }

        html {scroll-behavior:smooth;scroll-padding-top:90px}
        body {margin:0;background:var(--bg)}
        .font-display {font-family:'Cormorant Garamond','Playfair Display',Georgia,serif}
        .font-body {font-family:'Inter',ui-sans-serif,system-ui,sans-serif}
        ::selection {background:var(--gold);color:var(--on-gold)}

        .bg-page {background:var(--bg)} .bg-alt {background:var(--bg-alt)} .bg-g {background:var(--gold)}
        .panel {background:linear-gradient(160deg,var(--panel),var(--bg-alt))}
        .c-ink {color:var(--ink)} .c-body {color:var(--body)} .c-soft {color:var(--soft)} .c-mute {color:var(--mute)}
        .c-gold {color:var(--gold)} .c-hi {color:var(--gold-hi)} .c-on {color:var(--on-gold)}
        .bd {border-color:var(--line)} .bd-s {border-color:var(--line-s)} .bd-x {border-color:var(--line-x)}
        .hv-gold:hover {color:var(--gold)} .hv-hi:hover {color:var(--gold-hi)} .hv-bd:hover {border-color:var(--gold)}
        .hv-fill:hover,.group:hover .gh-fill {background:var(--gold);color:var(--on-gold);border-color:var(--gold)}
        .rule {height:1px;background:linear-gradient(90deg,transparent,var(--line-x),transparent)}

        .gold-text {background:linear-gradient(110deg,var(--g1) 0%,var(--g2) 38%,var(--g3) 62%,var(--g2) 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:none}
        .hero-name-line {white-space:nowrap; text-wrap:nowrap}
        .hero-name-effect {display:inline-block; animation:sheen 8s linear infinite, heroGlow 4.8s ease-in-out infinite; transform-origin:left center; will-change:transform,filter,background-position}
        @keyframes sheen {to {background-position:200% center}}
        @keyframes heroGlow {0%,100% {transform:translateY(0) scale(1); filter:drop-shadow(0 0 0 rgba(176,138,69,0))} 50% {transform:translateY(-2px) scale(1.01); filter:drop-shadow(0 0 16px rgba(176,138,69,.28))}}

        /* Keep contact fields consistent in typing, focus and browser autofill states. */
        #contact .contact-field,
        #contact .contact-field:focus,
        #contact .contact-field:hover {
          background: transparent !important;
          background-color: transparent !important;
          color: var(--ink) !important;
          -webkit-text-fill-color: var(--ink) !important;
          caret-color: var(--gold);
          color-scheme: dark;
          border-radius: 0;
        }
        :root[data-theme='light'] #contact .contact-field { color-scheme: light; }
        #contact .contact-field::placeholder { color: var(--mute) !important; opacity: 1; }
        #contact .contact-field:-webkit-autofill,
        #contact .contact-field:-webkit-autofill:hover,
        #contact .contact-field:-webkit-autofill:focus,
        #contact .contact-field:autofill {
          -webkit-box-shadow: 0 0 0 1000px var(--panel) inset !important;
          box-shadow: 0 0 0 1000px var(--panel) inset !important;
          -webkit-text-fill-color: var(--ink) !important;
          caret-color: var(--gold);
          border-radius: 0;
        }

        .btn-gold {background:linear-gradient(120deg,var(--g1) 0%,var(--g2) 45%,var(--g3) 100%);color:var(--on-gold);box-shadow:0 12px 40px -14px var(--glow-gold);transition:box-shadow .4s ease,filter .4s ease}
        .btn-gold:hover {box-shadow:0 18px 50px -10px var(--glow-gold);filter:brightness(1.07)}
        .btn-gold:focus-visible,.btn-ghost:focus-visible {outline:2px solid var(--gold-hi);outline-offset:4px}
        .btn-ghost {border:1px solid var(--line-x);color:var(--gold);transition:all .4s ease}
        .btn-ghost:hover {background:var(--gold);color:var(--on-gold);border-color:var(--gold);box-shadow:0 10px 34px -10px var(--glow-gold)}

        .grain::after {content:"";position:fixed;inset:0;pointer-events:none;z-index:90;opacity:var(--grain);mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
        /* Hero: exactly one plain green gradient, with no imagery, contours or ornaments. */
        #home {
          background: linear-gradient(118deg, #071611 0%, #0b1f18 55%, #10261d 100%);
        }
        :root[data-theme='light'] #home {
          background: linear-gradient(118deg, #f6f1e7 0%, #edf1e9 55%, #e5eee5 100%);
        }

        /* Technical Skills: restrained, high-contrast card hover (no layout shift). */
        .skill-card {
          isolation:isolate;
          background:var(--bg-alt);
          box-shadow:inset 0 0 0 0 transparent;
          transition:background-color .32s ease,box-shadow .32s ease;
        }
        .skill-card::before {
          content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
          background:radial-gradient(ellipse at 85% 12%,rgba(214,184,122,.095),transparent 65%);
          opacity:0;transition:opacity .32s ease;
        }
        .skill-card:hover {
          background:var(--panel);
          box-shadow:inset 0 0 0 1px var(--gold),inset 0 0 36px rgba(214,184,122,.055);
          z-index:1;
        }
        .skill-card:hover::before {opacity:1}
        .skill-card-title {transition:color .32s ease}
        .skill-card:hover .skill-card-title {color:var(--gold-hi)}
        .skill-card:hover .skill-card-chip {border-color:var(--line-x)}
        :root[data-theme='light'] .skill-card::before {
          background:radial-gradient(ellipse at 85% 12%,rgba(138,106,47,.075),transparent 65%);
        }
        @media (prefers-reduced-motion:reduce) {
          .skill-card,.skill-card::before,.skill-card-title {transition:none}
        }

        .reveal {opacity:0;transform:translateY(34px);transition:opacity 1s cubic-bezier(.2,.7,.2,1),transform 1s cubic-bezier(.2,.7,.2,1)}
        .reveal.is-in {opacity:1;transform:none}
        .char {display:inline-block;opacity:0;transform:translateY(55%) rotate(5deg);animation:charIn .95s cubic-bezier(.2,.7,.2,1) forwards}
        @keyframes charIn {to {opacity:1;transform:none}}
        .line-in {display:block;opacity:0;transform:translateY(40px);animation:lineIn 1.1s .55s cubic-bezier(.2,.7,.2,1) forwards}
        @keyframes lineIn {to {opacity:1;transform:none}}

        @keyframes marquee {from {transform:translateX(0)}to {transform:translateX(-50%)}}
        .marquee-track {display:flex;width:max-content;animation:marquee 42s linear infinite}
        .marquee:hover .marquee-track {animation-play-state:paused}
        @keyframes floaty {0%,100% {transform:translateY(0)}50% {transform:translateY(-10px)}}
        .floaty {animation:floaty 7s ease-in-out infinite}
        @keyframes spin-slow {to {transform:rotate(360deg)}}
        .spin-slow {animation:spin-slow 140s linear infinite}
        @keyframes spin-rev {to {transform:rotate(-360deg)}}
        .spin-rev {animation:spin-rev 200s linear infinite}

        .shot {transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
        .shot-wrap:hover .shot {transform:scale(1.035)}
        .cursor-ring {border-color:var(--gold);box-shadow:0 0 18px -4px var(--glow-gold)}

        .leaflet-container {background:var(--bg-alt);font-family:'Inter',system-ui,sans-serif}
        .leaflet-popup-content-wrapper,.leaflet-popup-tip {background:var(--panel);color:var(--ink);border:1px solid var(--line)}
        .leaflet-bar a,.leaflet-bar a:hover {background:var(--panel);color:var(--gold);border-color:var(--line)}
        .leaflet-control-attribution {background:var(--hdr) !important;color:var(--mute) !important}
        .leaflet-control-attribution a {color:var(--gold) !important}

        @media (prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .reveal{opacity:1;transform:none;transition:none}
          .char,.line-in{opacity:1;transform:none;animation:none}
          .marquee-track,.floaty,.spin-slow,.spin-rev,.gold-text,.hero-name-effect{animation:none;filter:none;transform:none}
        }
      `}</style>

      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-g focus:px-5 focus:py-3 focus:text-sm focus:font-semibold c-on">{t.ui.skip}</a>

      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[90]" />
      {/* Standard cursor */}

      {/* scroll progress */}
      <div aria-hidden="true" className="fixed left-0 top-0 z-[70] h-[2px] w-full">
        <div className="h-full bg-gradient-to-r from-[var(--g1)] via-[var(--g2)] to-[var(--g3)]" style={{ width: `${progress}%` }} />
      </div>

      {/* ------------------------------ HEADER ------------------------------ */}
      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${scrolled ? 'bd-s backdrop-blur-xl' : 'border-transparent'}`} style={{ background: scrolled ? 'var(--hdr)' : 'transparent' }}>
        <div className={`mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 transition-all duration-500 lg:px-12 ${scrolled ? 'h-[72px]' : 'h-[96px]'}`}>
          <a href="#home" aria-label={`${t.ui.portfolio} — Home`} className="group flex items-center gap-4">
            <span className="font-display gh-fill grid h-11 w-11 place-items-center rounded-full border bd-x text-[19px] italic c-gold transition-all duration-500">MG</span>
            <span className="hidden text-[14px] font-semibold uppercase tracking-[.22em] c-soft sm:block">{t.ui.portfolio}</span>
          </a>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
            {navHrefs.map((href, i) => (
              <a
                key={href}
                href={href}
                onClick={() => setActiveSection(href)}
                aria-current={activeSection === href ? 'location' : undefined}
                className={`group relative py-2 text-[14px] font-medium uppercase tracking-[.09em] transition-colors duration-300 hv-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold)] ${activeSection === href ? 'c-gold' : 'c-soft'}`}
              >
                {t.nav[i]}
                <span aria-hidden="true" className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-g transition-all duration-500 ${activeSection === href ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div role="group" aria-label={t.ui.langLabel} className="flex overflow-hidden rounded-full border bd">
              {(['en', 'it'] as Lang[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[.18em] transition-colors duration-300 ${lang === l ? 'bg-g c-on' : 'c-soft hv-gold'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? t.ui.themeToLight : t.ui.themeToDark}
              title={theme === 'dark' ? t.ui.themeToLight : t.ui.themeToDark}
              className="grid h-10 w-10 place-items-center rounded-full border bd c-gold transition-all duration-300 hv-fill"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
              )}
            </button>
            <button
              className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-[6px] rounded-full border bd xl:hidden"
              aria-expanded={menuOpen}
              aria-label={t.ui.menu}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={`h-px w-5 bg-g transition-transform duration-300 ${menuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
              <span className={`h-px w-5 bg-g transition-transform duration-300 ${menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div className={`fixed inset-0 z-[55] flex flex-col justify-center px-10 backdrop-blur-2xl transition-all duration-500 xl:hidden ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} style={{ background: 'var(--hdr)' }}>
        <nav className="flex flex-col gap-2">
          {navHrefs.map((href, i) => (
            <a
              key={href}
              href={href}
              onClick={() => { setActiveSection(href); setMenuOpen(false) }}
              aria-current={activeSection === href ? 'location' : undefined}
              className={`font-display flex items-baseline gap-5 border-b bd-s py-3 text-[clamp(2.2rem,9vw,3.4rem)] ${activeSection === href ? 'c-gold' : 'c-ink'}`}
            >
              <span className="font-body text-[12px] tracking-[.2em] c-gold opacity-60">0{i + 1}</span>
              {t.nav[i]}
            </a>
          ))}
        </nav>
      </div>

      <main id="main">
        {/* ------------------------------ HERO ------------------------------ */}
        <section id="home" className="relative isolate overflow-hidden">
          {/* Clean, solid gradient only: no decorative layers or SVG patterns. */}

          <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 pb-24 pt-40 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:gap-10 lg:px-12 lg:pb-32 lg:pt-44">
            <div className="relative z-10 min-w-0">
              <p className="hero-name-line font-display c-ink mt-0 text-[clamp(1.9rem,5.7vw,6.2rem)] font-medium leading-[.92] tracking-[-.03em]">
                <span className="hero-name-effect gold-text inline-block">Maryam</span>{' '}
                <span className="hero-name-effect gold-text ml-[.11em] inline-block italic">Ghaderian</span>
              </p>

              <Reveal delay={300}>
                <h1 className="font-display c-ink mt-10 text-[clamp(1.6rem,2.6vw,2.5rem)] font-normal tracking-[-.01em]">{t.ui.role}</h1>
                <h2 className="c-soft mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium uppercase tracking-[.18em]">
                  {t.ui.sub1} <span className="c-gold">◆</span> {t.ui.sub2} <span className="c-gold">◆</span> {t.ui.sub3}
                </h2>
              </Reveal>

              <Reveal delay={420}>
                <p className="font-display c-hi mt-10 text-[clamp(1.5rem,2.3vw,2.2rem)] italic leading-[1.25]">{t.ui.tagline}</p>
                <p className="c-body mt-6 max-w-[640px] text-[clamp(1.02rem,1.25vw,1.18rem)] font-light leading-[1.9]">{t.ui.heroText}</p>
              </Reveal>

              <Reveal delay={540} className="mt-12">
                <div className="flex flex-wrap items-center gap-5">
                  <Magnetic>
                    <a href={publicAsset("/Maryam_Ghaderian_CV.pdf")} download="Maryam_Ghaderian_CV.pdf" aria-label={t.ui.downloadCv} className="btn-gold group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full px-9 text-[13px] font-semibold uppercase tracking-[.22em]">
                      {t.ui.downloadCv} <IconArrow />
                    </a>
                  </Magnetic>
                  <div className="flex items-center gap-3">
                    {([{ name: 'linkedin', label: 'LinkedIn', url: contact.linkedin }, { name: 'github', label: 'GitHub', url: contact.github }] as { name: SocialName; label: string; url: string }[]).map(s => (
                      <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hv-fill flex h-[54px] w-[54px] items-center justify-center rounded-full border bd-x c-gold transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-8px_var(--glow-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold-hi)]">
                        <SocialIcon name={s.name} />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>

              
            </div>

            {/* portrait */}
            <Reveal delay={300} className="relative mx-auto w-full max-w-[430px] lg:justify-self-end">
              <div className="relative">

                <div className="relative">
                  <div aria-hidden="true" className="absolute -right-3 top-4 h-full w-full rounded-t-[999px] rounded-b-[28px] border bd-x opacity-35" />
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-[28px] bg-gradient-to-b from-[var(--g2)] via-[var(--g1)] to-[var(--g2)] p-[2px] shadow-[0_40px_120px_-30px_var(--shadow),0_0_80px_-20px_var(--glow-gold)]">
                    <div className="h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[26px] bg-[var(--panel)]">
                      {!photoFailed ? (
                        <img src={publicAsset("/maryam-profile.png")} alt="Portrait of Maryam Ghaderian" className="h-full w-full object-cover object-[center_28%]" decoding="async" onError={() => setPhotoFailed(true)} />
                      ) : (
                        <div className="font-display c-gold grid h-full place-items-center text-[110px] italic">MG</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Education — three verified degrees. The university names stay on one line on desktop. */}
        <section aria-labelledby="education-heading" className="border-y bd-s bg-alt">
          <div className="mx-auto max-w-[1500px] px-6 py-11 lg:px-12 lg:py-12">
            <h2 id="education-heading" className="c-gold mb-8 text-[clamp(1.05rem,1.25vw,1.3rem)] font-semibold uppercase tracking-[.17em]">
              {lang === 'it' ? 'Formazione' : 'Education'}
            </h2>
            <div className="grid gap-x-5 gap-y-8 lg:grid-cols-[.95fr_1.22fr_1.22fr] xl:gap-x-8">
              <div className="min-w-0 border-l border-[var(--gold)]/70 pl-4 xl:pl-5">
                <p className="c-ink text-[17px] font-medium leading-[1.45] xl:text-[19px]">MSc Agritech Engineering <span className="c-gold whitespace-nowrap">· 2026</span></p>
                <p className="c-soft mt-2 text-[14px] leading-[1.6] lg:whitespace-nowrap xl:text-[15px]">Politecnico di Torino · Italy</p>
              </div>
              <div className="min-w-0 border-l border-[var(--gold)]/70 pl-4 xl:pl-5">
                <p className="c-ink text-[17px] font-medium leading-[1.45] xl:text-[19px]">MSc Environmental Engineering <span className="c-gold whitespace-nowrap">· 2021</span></p>
                <p className="c-soft mt-2 text-[13px] leading-[1.6] lg:whitespace-nowrap xl:text-[14px]" title="Gorgan University of Agricultural Sciences and Natural Resources, Iran">Gorgan University of Agricultural &amp; Natural Resources · Iran</p>
              </div>
              <div className="min-w-0 border-l border-[var(--gold)]/70 pl-4 xl:pl-5">
                <p className="c-ink text-[17px] font-medium leading-[1.45] xl:text-[19px]">BSc Water Engineering <span className="c-gold whitespace-nowrap">· 2007</span></p>
                <p className="c-soft mt-2 text-[13px] leading-[1.6] lg:whitespace-nowrap xl:text-[14px]" title="Gorgan University of Agricultural Sciences and Natural Resources, Iran">Gorgan University of Agricultural &amp; Natural Resources · Iran</p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- PROJECTS ----------------------------- */}
        <section id="projects" className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.projectsTitle} />

            <div className="space-y-20 lg:space-y-28">
              {projects.map((project, i) => {
                const flip = i % 2 === 1
                return (
                  <article key={project.index} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                    <Reveal className={flip ? 'lg:order-2 lg:col-span-7' : 'lg:col-span-7'}>
                      <div className="shot-wrap relative">
                        <div aria-hidden="true" className={`absolute -z-10 h-full w-full rounded-[6px] border bd ${flip ? '-left-4 top-4' : '-right-4 top-4'}`} />
                        <div className="panel overflow-hidden rounded-[6px] border bd p-3 shadow-[0_40px_90px_-40px_var(--shadow)] sm:p-4">
                          <div className={`bg-alt relative flex w-full items-center justify-center overflow-hidden rounded-[3px] ${project.index === '02' ? 'aspect-[10/7]' : 'aspect-[16/9]'}`}>
                            {project.compare ? (
                              <CompareSlider before={project.compare.before} after={project.compare.after} alt={project.title} labels={{ before: t.ui.cmpBefore, after: t.ui.cmpAfter, aria: t.ui.cmpAria }} />
                            ) : project.image ? (
                              <img src={project.image} alt={`${project.title} — actual project map or interface`} loading="lazy" decoding="async" className="shot block h-full w-full object-contain object-center" />
                            ) : (
                              <div className="h-full w-full bg-alt" aria-hidden="true" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={150} className={flip ? 'lg:order-1 lg:col-span-5' : 'lg:col-span-5'}>
                      <div className="relative">
                        <p className="c-gold relative text-[11px] font-semibold uppercase tracking-[.32em]">{project.field}</p>
                        <h3 className="font-display c-ink relative mt-5 text-[clamp(2.2rem,3.6vw,3.6rem)] font-medium leading-[1.06] tracking-[-.015em]">{project.title}</h3>
                        <p className="c-body relative mt-6 text-[17px] font-normal leading-[1.8]">{project.description}</p>
                        <p className="c-soft relative mt-5 border-l bd-x pl-4 text-[14px] leading-[1.7]">{project.detail}</p>
                        <ul className="relative mt-6 flex flex-wrap gap-2" aria-label={`${project.title} tools`}>
                          {project.tools.map(tool => (
                            <li key={tool} className="c-hi rounded-full border bd px-4 py-1.5 text-[11px] font-medium uppercase tracking-[.16em]">{tool}</li>
                          ))}
                        </ul>
                        {project.index === '02' && <ProjectLocationMap siteId="amatrice" lang={lang} />}
                        {project.index === '03' && <ProjectLocationMap siteId="turin" lang={lang} />}
                        {project.index === '01' && <ProjectLocationMap siteId="agrion" lang={lang} />}
                        <div className="relative mt-10 flex flex-wrap items-center gap-4">
                          <Magnetic>
                            <button type="button" onClick={() => setSelectedProjectId(project.index)} className="btn-gold group inline-flex min-h-[52px] items-center gap-3 rounded-full px-8 text-[12px] font-semibold uppercase tracking-[.22em]">
                              {t.ui.caseStudy} <IconArrow />
                            </button>
                          </Magnetic>
                          <a href={project.linkedinPost} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — LinkedIn`} className="btn-ghost group inline-flex min-h-[52px] items-center gap-3 rounded-full px-7 text-[12px] font-semibold uppercase tracking-[.22em]">
                            {t.ui.linkedin} <IconArrow diagonal />
                          </a>
                          <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — GitHub`} className="btn-ghost group inline-flex min-h-[52px] items-center gap-3 rounded-full px-7 text-[12px] font-semibold uppercase tracking-[.22em]">
                            {t.ui.github} <IconArrow diagonal />
                          </a>
                        </div>
                      </div>
                    </Reveal>
                  </article>
                )
              })}
            </div>

          </div>
        </section>

        {/* ---------------------------- EXPERIENCE ---------------------------- */}
        <section id="experience" className="bg-alt relative py-20 lg:py-28">
          <div aria-hidden="true" className="rule absolute inset-x-0 top-0" />
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.expTitle} />
            <div className="border-t bd">
              {experience.map((job, i) => (
                <Reveal key={job.period} delay={i * 80}>
                  <article className="group grid items-start gap-6 border-b bd py-12 transition-colors duration-500 hover:bg-[var(--line-s)] lg:grid-cols-[205px_minmax(290px,1.05fr)_minmax(0,1.35fr)] lg:gap-x-10 lg:gap-y-6 lg:px-5 lg:py-12">
                    <div className="min-w-0 lg:pt-[5px]">
                      <p className="font-body c-hi text-[clamp(.95rem,1.07vw,1.12rem)] font-medium leading-[1.3] tracking-[-.015em] tabular-nums whitespace-nowrap">{job.period}</p>
                      <p className="c-soft mt-4 text-[12px] font-semibold uppercase tracking-[.16em]">{job.arrangement}</p>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display c-ink text-[clamp(1.8rem,2.15vw,2.3rem)] font-medium leading-[1.16]">{job.title}</h3>
                      <p className="c-gold mt-3 text-[15px] font-medium tracking-[.04em]">{job.organization}</p>
                      {job.highlight && (
                        <p className="c-hi mt-5 inline-block rounded-full border bd-x px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[.18em]">{job.highlight}</p>
                      )}
                    </div>
                    <p className="c-body text-[16px] font-normal leading-[1.75]">{job.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------- CERTIFICATES --------------------------- */}
        <section id="certificates" className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.certTitle} />
            <div className="grid gap-8 lg:grid-cols-3">
              {albums.map((album, i) => (
                <Reveal key={album.id} delay={i * 120} className="h-full">
                  <article className="group panel flex h-full flex-col overflow-hidden rounded-[6px] border bd transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--line-x)] hover:shadow-[0_18px_42px_-30px_var(--shadow)]">
                    <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b bd-s bg-[#e8e8e4] p-3 sm:p-4">
                      <img src={album.cover} alt={`${album.title} — certificate album cover`} loading="lazy" decoding="async" className="block h-full w-full object-contain object-center" />
                    </div>
                    <div className="flex flex-1 flex-col px-7 pb-8 pt-8">
                      <span className="c-gold w-fit border-b bd-x pb-1 text-[11px] font-semibold uppercase tracking-[.24em]">{album.badge}</span>
                      <h3 className="font-display c-ink mt-6 text-[clamp(1.8rem,2.2vw,2.3rem)] font-medium leading-[1.12]">{album.title}</h3>
                      <p className="c-hi mt-4 text-[14px] leading-[1.7]">{t.ui.issuedBy}: {album.issuer}</p>
                      <p className="c-soft mt-4 text-[15px] font-light leading-[1.8]">{album.description}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedAlbumId(album.id); setSelectedCertificateIndex(0) }}
                        className="btn-gold mt-10 inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full px-5 text-[12px] font-semibold uppercase tracking-[.2em]"
                      >
                        {t.ui.preview} ({album.items.length} {album.items.length === 1 ? t.ui.certificate : t.ui.certificates})
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ SKILLS ------------------------------ */}
        <section id="skills" className="bg-alt relative py-20 lg:py-28">
          <div aria-hidden="true" className="rule absolute inset-x-0 top-0" />
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.skillsTitle} />
            <Reveal>
              <div className="grid gap-px overflow-hidden rounded-[6px] border bd md:grid-cols-2 xl:grid-cols-3" style={{ background: 'var(--line)' }}>
                {t.skills.map(skill => (
                  <article key={skill.number} className="skill-card bg-alt group relative flex h-full flex-col p-7 sm:p-9">
                    <div className="flex min-h-[55px] items-center justify-between gap-3">
                      <span className="font-body c-gold shrink-0 text-[28px] font-medium leading-none tracking-[-.045em] tabular-nums opacity-95">{skill.number}</span>
                      <span className="c-soft whitespace-nowrap text-right text-[10px] font-semibold uppercase leading-none tracking-[.08em] sm:text-[11px]">{skill.label}</span>
                    </div>
                    <h3 className="skill-card-title font-display c-ink mt-7 text-[clamp(1.75rem,2.1vw,2.1rem)] font-medium leading-[1.15]">{skill.title}</h3>
                    <p className="c-body mt-4 text-[16px] font-normal leading-[1.75]">{skill.summary}</p>
                    <ul className="mt-7 flex flex-wrap content-start gap-2.5" aria-label={`${skill.title} — ${t.ui.csTools}`}>
                      {skill.tools.map(tool => (
                        <li key={tool} className="skill-card-chip c-hi rounded-full border bd px-3.5 py-2 text-[13px] leading-[1.35] transition-colors duration-300 hv-bd">{tool}</li>
                      ))}
                    </ul>
                    <span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[var(--gold)] to-transparent transition-all duration-500 group-hover:w-full" />
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------ ABOUT ------------------------------ */}
        <section id="about" className="relative py-20 lg:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/3 -z-10 h-[520px] w-[520px] rounded-full blur-[140px]" style={{ background: 'var(--glow)' }} />
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.aboutTitle} />
            <div className="grid gap-14 lg:grid-cols-3 lg:gap-12">
              {t.about.map((b, i) => (
                <Reveal key={b.title} delay={i * 100}>
                  <div className="h-full border-t bd-x pt-7">
                    <h3 className="font-display c-ink mt-1 text-[clamp(1.8rem,2.2vw,2.4rem)] font-medium leading-[1.15]">{b.title}</h3>
                    <p className="c-body mt-5 text-[16px] font-normal leading-[1.8]">{b.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100} className="mt-20">
              <div className="panel rounded-[6px] border bd p-8 sm:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div>
                    <p className="c-gold text-[11px] font-semibold uppercase tracking-[.3em]">{t.ui.availTitle}</p>
                    <p className="font-display c-ink mt-3 text-[1.5rem] leading-[1.25]">{t.ui.availRoles}</p>
                  </div>
                  <ul className="flex flex-wrap gap-3" aria-label={t.ui.availTitle}>
                    {t.chips.map(c => (
                      <li key={c} className="c-hi rounded-full border bd-x px-6 py-3 text-[12px] font-semibold uppercase tracking-[.18em]">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ----------------------------- CONTACT ----------------------------- */}
        <section id="contact" className="bg-alt relative py-20 lg:py-28">
          <div aria-hidden="true" className="rule absolute inset-x-0 top-0" />
          <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
            <SectionHeading eyebrow="" title={t.ui.contactTitle} />
            <div className="grid gap-16 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-24">
              <Reveal>
                <div className="flex flex-col gap-6">
                  <a href={`mailto:${contact.email}`} className="group flex items-center gap-6 border-b bd pb-8 transition-colors duration-300 hv-bd">
                    <span className="gh-fill c-gold flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bd-x transition-all duration-500">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                    </span>
                    <span className="min-w-0">
                      <span className="c-gold block text-[11px] font-semibold uppercase tracking-[.3em]">{t.ui.email}</span>
                      <span className="font-display c-ink hv-hi mt-2 block break-all text-[clamp(1.25rem,1.8vw,1.7rem)] transition-colors">{contact.email}</span>
                    </span>
                  </a>
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-6 border-b bd pb-8 transition-colors duration-300 hv-bd">
                    <span className="gh-fill c-gold flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bd-x transition-all duration-500"><SocialIcon name="linkedin" /></span>
                    <span className="min-w-0">
                      <span className="c-gold block text-[11px] font-semibold uppercase tracking-[.3em]">LinkedIn</span>
                      <span className="font-display c-ink hv-hi mt-2 block break-all text-[clamp(1.25rem,1.8vw,1.7rem)] transition-colors">linkedin.com/in/maryamghaderian</span>
                    </span>
                  </a>
                  <a href={contact.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-6 border-b bd pb-8 transition-colors duration-300 hv-bd">
                    <span className="gh-fill c-gold flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bd-x transition-all duration-500"><SocialIcon name="github" /></span>
                    <span className="min-w-0">
                      <span className="c-gold block text-[11px] font-semibold uppercase tracking-[.3em]">GitHub</span>
                      <span className="font-display c-ink hv-hi mt-2 block break-all text-[clamp(1.25rem,1.8vw,1.7rem)] transition-colors">github.com/maryamghaderian</span>
                    </span>
                  </a>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <form onSubmit={onSubmit} className="panel flex flex-col gap-4 rounded-[6px] border bd p-8 sm:p-12">
                  <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
                    <input aria-label={t.ui.aName} name="fullName" type="text" autoComplete="name" required maxLength={120} placeholder={t.ui.phName} className={inputClass} />
                    <input aria-label={t.ui.aEmail} name="email" type="email" autoComplete="email" required maxLength={254} placeholder={t.ui.phEmail} className={inputClass} />
                  </div>
                  <input aria-label={t.ui.aSubject} name="subject" type="text" required maxLength={160} placeholder={t.ui.phSubject} className={inputClass} />
                  <textarea aria-label={t.ui.aMessage} name="message" required maxLength={4000} rows={6} placeholder={t.ui.phMessage} className={`${inputClass} resize-y leading-7`} />
                  {/* honeypot: hidden from people, bots fill it in */}
                  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Magnetic>
                      <button type="submit" disabled={formStatus === 'sending'} className="btn-gold group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full px-10 text-[12px] font-semibold uppercase tracking-[.24em] disabled:opacity-60">
                        {formStatus === 'sending' && <span aria-hidden="true" className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
                        {formStatus === 'sending' ? t.ui.sending : t.ui.send} {formStatus !== 'sending' && <IconArrow />}
                      </button>
                    </Magnetic>
                    <p role="status" aria-live="polite" className={`text-[14px] ${formStatus === 'error' || formStatus === 'activation' || formStatus === 'timeout' ? 'text-[#e7bd79]' : 'c-gold'}`}>
                      {formStatus === 'sent' ? t.ui.sent : formStatus === 'activation' ? (lang === 'it' ? 'Per attivare il modulo, controlla la tua email e conferma il link ricevuto da FormSubmit. Poi riprova.' : 'Activation required: check your inbox for the FormSubmit confirmation link, activate the form, then try again.') : formStatus === 'timeout' ? (lang === 'it' ? 'La risposta sta impiegando troppo tempo. Controlla la tua email prima di riprovare, per evitare messaggi duplicati.' : 'The server is taking too long to respond. Check your inbox before retrying to avoid duplicate messages.') : formStatus === 'error' ? t.ui.error : ''}
                    </p>
                  </div>
                </form>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer aria-label="Site footer" className="border-t bd bg-page">
        <div className="c-mute mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-6 py-10 text-[11px] uppercase tracking-[.26em] sm:flex-row lg:px-12">
          <span className="font-display c-gold text-[1.3rem] normal-case italic tracking-normal">Maryam Ghaderian</span>
          <span>GIS · Remote Sensing · Earth Observation</span>
          <a href="#home" className="transition-colors hv-gold">{t.ui.toTop}</a>
        </div>
      </footer>

      {/* ------------------------- CASE STUDY MODAL ------------------------- */}
      {selectedProject && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'var(--overlay)' }} role="dialog" aria-modal="true" aria-label={`${selectedProject.title} — ${t.ui.caseStudy}`} onClick={() => setSelectedProjectId(null)}>
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[10px] border bd-x bg-alt shadow-[0_40px_120px_var(--shadow)]" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedProjectId(null)} className="c-gold hv-fill absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border bd-x bg-alt text-[24px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hi)]" aria-label={t.ui.csClose}>×</button>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="bg-page flex items-center justify-center p-4 sm:p-8">
                <div className="bg-alt w-full overflow-hidden rounded-[6px] border bd p-3">
                  <div className="relative aspect-[16/10] w-full">
                    {selectedProject.compare ? (
                      <CompareSlider before={selectedProject.compare.before} after={selectedProject.compare.after} alt={selectedProject.title} labels={{ before: t.ui.cmpBefore, after: t.ui.cmpAfter, aria: t.ui.cmpAria }} />
                    ) : (
                      <img src={selectedProject.image} alt={selectedProject.title} className="h-full w-full object-contain" decoding="async" />
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t bd p-8 sm:p-12 lg:border-l lg:border-t-0">
                <p className="c-gold text-[11px] font-semibold uppercase tracking-[.3em]">{t.ui.csNote} · {selectedProject.index}</p>
                <h3 className="font-display c-ink mt-4 text-[clamp(2rem,3vw,3rem)] font-medium leading-[1.08]">{selectedProject.title}</h3>
                <p className="c-soft mt-3 text-[11px] font-semibold uppercase tracking-[.26em]">{selectedProject.field}</p>
                <dl className="mt-8 space-y-6">
                  {([
                    [t.ui.csContext, selectedProject.context],
                    [t.ui.csData, selectedProject.data],
                    [t.ui.csMethod, selectedProject.method],
                    [t.ui.csOutput, selectedProject.output],
                  ] as [string, string][]).map(([label, text]) => (
                    <div key={label} className="grid gap-2 border-t bd pt-5 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <dt className="font-display c-gold text-[1.25rem] italic">{label}</dt>
                      <dd className="c-body text-[15px] font-light leading-[1.8]">{text}</dd>
                    </div>
                  ))}
                </dl>
                <p className="c-mute mt-8 text-[11px] font-semibold uppercase tracking-[.26em]">{t.ui.csTools}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {selectedProject.tools.map(tool => (
                    <li key={tool} className="c-hi rounded-full border bd px-4 py-1.5 text-[11px] font-medium uppercase tracking-[.16em]">{tool}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={selectedProject.linkedinPost} target="_blank" rel="noopener noreferrer" className="btn-ghost group inline-flex min-h-[48px] items-center gap-3 rounded-full px-7 text-[12px] font-semibold uppercase tracking-[.22em]">{t.ui.linkedin} <IconArrow diagonal /></a>
                  <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="btn-gold group inline-flex min-h-[48px] items-center gap-3 rounded-full px-7 text-[12px] font-semibold uppercase tracking-[.22em]">{t.ui.github} <IconArrow diagonal /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------- CERTIFICATE MODAL --------------------------- */}
      {selectedAlbum && selectedCertificate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'var(--overlay)' }} role="dialog" aria-modal="true" aria-label={`${selectedAlbum.title} — ${t.ui.certTitle}`} onClick={() => setSelectedAlbumId(null)}>
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[10px] border bd-x bg-alt shadow-[0_40px_120px_var(--shadow)]" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedAlbumId(null)} className="c-gold hv-fill absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border bd-x bg-alt text-[24px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-hi)]" aria-label={t.ui.closeCerts}>×</button>
            <div className="grid max-h-[92vh] grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_390px]">
              <div className="bg-page flex min-h-[340px] items-center justify-center p-4 sm:p-6 lg:min-h-[640px]">
                <div className="bg-alt flex h-full w-full items-center justify-center overflow-hidden rounded-[6px] border bd p-3 sm:p-4">
                  <img src={selectedCertificate.image} alt={selectedCertificate.title} className="max-h-[74vh] w-full rounded-[4px] object-contain" decoding="async" />
                </div>
              </div>
              <div className="flex max-h-[92vh] flex-col border-l bd" style={{ background: 'var(--panel)' }}>
                <div className="border-b bd px-7 py-8">
                  <p className="c-gold text-[11px] font-bold uppercase tracking-[.26em]">{selectedAlbum.badge}</p>
                  <h3 className="font-display c-ink mt-4 text-[31px] font-medium leading-[1.14]">{selectedCertificate.title}</h3>
                  <p className="c-body mt-4 text-[15px] leading-7">{selectedCertificate.issuer}</p>
                  <p className="c-mute text-[13px] leading-6">{selectedCertificate.date}</p>
                  {selectedCertificate.note && <p className="c-soft mt-4 text-[14px] font-light leading-7">{selectedCertificate.note}</p>}
                  <a href={selectedCertificate.file ?? selectedCertificate.image} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-6 text-[11px] font-bold uppercase tracking-[.2em]">{t.ui.openOriginal}</a>
                </div>
                <div className="overflow-y-auto px-4 py-5">
                  <p className="c-mute px-2 text-[11px] font-bold uppercase tracking-[.24em]">{t.ui.albumContents}</p>
                  <div className="mt-4 space-y-3">
                    {selectedAlbum.items.map((item, index) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setSelectedCertificateIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-[6px] border p-3 text-left transition ${selectedCertificateIndex === index ? 'border-[var(--gold)] bg-[var(--line-s)]' : 'bd hv-bd'}`}
                      >
                        <img src={item.image} alt="" className="h-16 w-20 flex-none rounded-[3px] object-cover object-center" decoding="async" />
                        <span className="min-w-0">
                          <span className="c-ink block text-[14px] font-semibold leading-6">{item.title}</span>
                          <span className="c-mute mt-1 block text-[12px] leading-5">{item.date}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
