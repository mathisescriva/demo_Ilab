import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import RiskLevel from './components/RiskLevel';
import CostBreakdown from './components/CostBreakdown';
import KeyInformation from './components/KeyInformation';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import KIDExplorer from './components/KIDExplorer';
import JsonViewer from './components/JsonViewer';
import RiskMatrix from './components/RiskMatrix';
import ESGMetrics from './components/ESGMetrics';
import { KID, Costs } from './types';
import { defaultKidData } from '../../data/defaultKidData';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuration du worker PDF
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface RiskData {
  id: string;
  name: string;
  probability: number;
  impact: number;
  category: 'environmental' | 'social' | 'governance';
  griMappings: Array<{
    code: string;
    name: string;
    status: 'detected' | 'missing';
  }>;
  history: Array<{
    date: string;
    probability: number;
    impact: number;
  }>;
}

// Données d'exemple pour la matrice de risques
const mockRisks: RiskData[] = [
  {
    id: "emissions_co2",
    name: "Émissions de CO2",
    probability: 4,
    impact: 5,
    category: "environmental",
    griMappings: [
      { code: "305", name: "Émissions", status: "detected" },
      { code: "302", name: "Énergie", status: "detected" },
      { code: "307", name: "Conformité environnementale", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 5, impact: 4 },
      { date: "2022-06", probability: 5, impact: 4 },
      { date: "2023-01", probability: 4, impact: 5 },
      { date: "2023-06", probability: 4, impact: 5 },
      { date: "2024-01", probability: 4, impact: 5 }
    ]
  },
  {
    id: "droits_travailleurs",
    name: "Droits des travailleurs",
    probability: 3,
    impact: 4,
    category: "social",
    griMappings: [
      { code: "401", name: "Emploi", status: "detected" },
      { code: "402", name: "Relations employés/direction", status: "detected" },
      { code: "407", name: "Liberté syndicale", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 4, impact: 4 },
      { date: "2022-06", probability: 4, impact: 4 },
      { date: "2023-01", probability: 3, impact: 4 },
      { date: "2023-06", probability: 3, impact: 4 },
      { date: "2024-01", probability: 3, impact: 4 }
    ]
  },
  {
    id: "ethique_affaires",
    name: "Éthique des affaires",
    probability: 2,
    impact: 5,
    category: "governance",
    griMappings: [
      { code: "205", name: "Anti-corruption", status: "detected" },
      { code: "206", name: "Comportement anticoncurrentiel", status: "detected" },
      { code: "415", name: "Politique publique", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 3, impact: 5 },
      { date: "2022-06", probability: 3, impact: 5 },
      { date: "2023-01", probability: 2, impact: 5 },
      { date: "2023-06", probability: 2, impact: 5 },
      { date: "2024-01", probability: 2, impact: 5 }
    ]
  },
  {
    id: "gestion_dechets",
    name: "Gestion des déchets",
    probability: 5,
    impact: 3,
    category: "environmental",
    griMappings: [
      { code: "306", name: "Déchets", status: "detected" },
      { code: "303", name: "Eau et effluents", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 4, impact: 3 },
      { date: "2022-06", probability: 4, impact: 3 },
      { date: "2023-01", probability: 5, impact: 3 },
      { date: "2023-06", probability: 5, impact: 3 },
      { date: "2024-01", probability: 5, impact: 3 }
    ]
  },
  {
    id: "diversite",
    name: "Diversité et inclusion",
    probability: 3,
    impact: 3,
    category: "social",
    griMappings: [
      { code: "405", name: "Diversité et égalité des chances", status: "detected" },
      { code: "406", name: "Lutte contre la discrimination", status: "detected" },
      { code: "404", name: "Formation et éducation", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 3, impact: 4 },
      { date: "2022-06", probability: 3, impact: 3 },
      { date: "2023-01", probability: 3, impact: 3 },
      { date: "2023-06", probability: 3, impact: 3 },
      { date: "2024-01", probability: 3, impact: 3 }
    ]
  }
];

// Données d'exemple pour les métriques ESG
const mockESGData = {
  riskCategories: {
    environmental: 45,
    social: 30,
    governance: 25
  },
  emissions: {
    scope1: 1200000,
    scope2: 800000,
    scope3: 3500000
  },
  historicalEmissions: [
    { year: '2019', value: 6000000 },
    { year: '2020', value: 5500000 },
    { year: '2021', value: 5200000 },
    { year: '2022', value: 4800000 },
    { year: '2023', value: 4300000 }
  ]
};

interface KIDManagerProps {
  onUpload: (files: FileList) => void;
}

export const KIDManager: React.FC<KIDManagerProps> = ({ onUpload }) => {
  const [selectedKid, setSelectedKid] = useState<KID | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedKidsForComparison, setSelectedKidsForComparison] = useState<KID[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string>('');
  const [kids, setKids] = useState<KID[]>([]);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showKIDExplorer, setShowKIDExplorer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showStandardsPopup, setShowStandardsPopup] = useState(false);
  const [risks] = useState<RiskData[]>(mockRisks);

  // Exemple de données pour les standards
  const [standards] = useState([
    { id: '1', name: 'GRI 305', score: 85, details: 'Émissions de gaz à effet de serre' },
    { id: '2', name: 'SASB EM-IS-110a', score: 60, details: 'Gestion de l\'énergie' },
    { id: '3', name: 'TCFD', score: 75, details: 'Divulgation des risques climatiques' },
  ]);

  const processingSteps = [
    {
      message: "Analyse de la structure du document...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      message: "Extraction des tableaux et données numériques...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16" />
        </svg>
      )
    },
    {
      message: "Identification des sections clés...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      message: "Extraction du contexte et des relations...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-ping" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      message: "Traitement des images et graphiques...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      message: "Conversion au format exploitable...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      message: "Finalisation de l'intégration...",
      icon: (
        <svg className="w-8 h-8 text-purple-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const simulateProcessing = async () => {
    setIsProcessing(true);
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      // Temps d'attente plus long pour chaque étape (entre 1.5s et 2.5s)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    }
    setIsProcessing(false);
    setProcessingStep(0);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await simulateProcessing();
      
      try {
        // Limiter à 5 fichiers maximum
        const newFiles = Array.from(files).slice(0, 5 - kids.length);
        
        // Utiliser les données par défaut depuis le fichier defaultKidData.ts
        const newKids: KID[] = newFiles.map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          url: URL.createObjectURL(file),
          file,
          ...defaultKidData
        }));

        setKids(prevKids => {
          // Révoquer les anciennes URLs avant de les remplacer
          prevKids.forEach(kid => {
            if (kid.url.startsWith('blob:')) {
              URL.revokeObjectURL(kid.url);
            }
          });
          return [...prevKids, ...newKids];
        });

        if (onUpload) {
          onUpload(files);
        }

        // Réinitialiser les erreurs si le chargement réussit
        setPdfError('');
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers:', error);
        setPdfError('Erreur lors du chargement des fichiers. Veuillez réessayer.');
      }
    }
  };

  const selectKid = (kid: KID) => {
    setSelectedKid(kid);
    setPageNumber(1);
    setPdfError('');
  };

  const selectKidForComparison = (kid: KID) => {
    if (selectedKidsForComparison.some(k => k.id === kid.id)) {
      setSelectedKidsForComparison(prev => prev.filter(k => k.id !== kid.id));
    } else if (selectedKidsForComparison.length < 2) {
      setSelectedKidsForComparison(prev => [...prev, kid]);
    }
  };

  const startComparison = () => {
    setIsComparing(true);
    setSelectedKid(null);
  };

  const exitComparison = () => {
    setIsComparing(false);
    setSelectedKidsForComparison([]);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(''); // Réinitialiser l'erreur en cas de succès
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Erreur PDF:', error);
    setPdfError('Erreur lors du chargement du PDF. Veuillez vérifier que le fichier est un PDF valide.');
  };

  useEffect(() => {
    return () => {
      kids.forEach(kid => {
        if (kid.url.startsWith('blob:')) {
          URL.revokeObjectURL(kid.url);
        }
      });
    };
  }, [kids]);

  // Ajouter cette fonction pour gérer l'apparition du popup des standards
  useEffect(() => {
    if (selectedKid && !showStandardsPopup) {
      const timer = setTimeout(() => {
        setShowStandardsPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedKid]);

  return (
    <div className="p-6">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                {processingSteps[processingStep].icon}
              </div>
              <p className="text-lg font-semibold text-black mb-2">Traitement en cours</p>
              <p className="text-gray-600 text-center">{processingSteps[processingStep].message}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(processingStep + 1) * (100 / processingSteps.length)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Section upload */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Plateforme de pilotage ESG</h1>
            {isComparing && (
              <button
                onClick={exitComparison}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Retour
              </button>
            )}
          </div>
          <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              </div>
            )}
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            Ajouter un Rapport
          </label>
        </div>
      </div>

      {isComparing ? (
        // Interface de comparaison
        <div className="space-y-8">
          {/* Section sélection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Sélection des KIDs à comparer</h2>

            </div>
            <div className="grid grid-cols-1 gap-4">
              {kids.map((kid) => (
                <div
                  key={kid.id}
                  onClick={() => selectKidForComparison(kid)}
                  className={`bg-gray-50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                    selectedKidsForComparison.some(k => k.id === kid.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : selectedKidsForComparison.length === 2
                        ? 'opacity-50 cursor-not-allowed'
                        : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{kid.name}</h3>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                    {selectedKidsForComparison.some(k => k.id === kid.id) && (
                      <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full border-2 border-indigo-500">
                        <span className="text-sm font-medium text-indigo-700">
                          {selectedKidsForComparison.findIndex(k => k.id === kid.id) + 1}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section comparaison */}
          {selectedKidsForComparison.length === 2 && (
            <>
              {/* Prévisualisation côte à côte */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Prévisualisation Comparative</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                      disabled={pageNumber <= 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-600 self-center">
                      Page {pageNumber} sur {numPages}
                    </span>
                    <button
                      onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                      disabled={pageNumber >= numPages}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {selectedKidsForComparison.map((kid, index) => (
                    <div key={kid.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">Document {index + 1}</h3>
                      <Document
                        file={kid.url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        }
                        options={{
                          cMapUrl: 'cmaps/',
                          cMapPacked: true,
                          standardFontDataUrl: 'standard_fonts/'
                        }}
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={400}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyse comparative */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Analyse Comparative</h2>
                  <button
                    onClick={() => setShowAdvancedAnalytics(prev => !prev)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    {showAdvancedAnalytics ? 'Vue Simple' : 'Analyse Avancée'}
                  </button>
                </div>

                {showAdvancedAnalytics ? (
                  <AdvancedAnalytics selectedKids={selectedKidsForComparison} />
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {selectedKidsForComparison.map((kid, index) => (
                      <div key={kid.id}>
                        <h3 className="font-medium text-gray-800 mb-4">Document {index + 1}</h3>
                        <div className="space-y-6">
                          <RiskLevel level={parseInt(kid.risks.riskIndicator)} />
                          <CostBreakdown costs={kid.costs} />
                          <KeyInformation info={kid} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        // Interface normale
        <div className="flex gap-8">
          {/* Section de gauche : Liste des KIDs et Prévisualisation */}
          <div className="w-1/2">
            {/* Liste des KIDs */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Rapports RSE/ESG</h2>
                </div>

              </div>
              <div className="grid grid-cols-1 gap-4">
                {kids.map((kid) => (
                  <div
                    key={kid.id}
                    onClick={() => selectKid(kid)}
                    className={`bg-gray-50 rounded-xl p-4 cursor-pointer transition-all border-2 ${
                      selectedKid?.id === kid.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1">{kid.name}</h3>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {kids.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun Rapport uploadé. Utilisez le bouton en haut pour ajouter des documents.</p>
                </div>
              )}
            </div>

            {/* Prévisualisation du PDF */}
            {selectedKid && !isComparing && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6">         <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Prévisualisation</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                      disabled={pageNumber <= 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-600 self-center">
                      Page {pageNumber} sur {numPages}
                    </span>
                    <button
                      onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                      disabled={pageNumber >= numPages}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {pdfError ? (
                    <div className="text-center p-8 text-red-500">{pdfError}</div>
                  ) : (
                    <div className="flex justify-center">
                      <Document
                        file={selectedKid.url}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        onLoadError={(error) => {
                          console.error('Erreur PDF:', error);
                          setPdfError('Erreur lors du chargement du PDF. Veuillez vérifier que le fichier est un PDF valide.');
                        }}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        }
                        options={{
                          cMapUrl: 'cmaps/',
                          cMapPacked: true,
                          standardFontDataUrl: 'standard_fonts/'
                        }}
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={300}
                          loading={
                            <div className="flex items-center justify-center p-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          }
                          error={
                            <div className="text-center p-4 text-red-500">
                              Erreur lors du chargement de la page
                            </div>
                          }
                        />
                      </Document>
                    </div>
                  )}
                </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500 mt-6">
                  <JsonViewer data={selectedKid} />
                </div>
              </div>
            )}
          </div>

          {/* Section de droite : Analyse */}
          <div className="w-1/2">
            {selectedKid ? (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Analyse du rapport</h2>
                  <button
                    onClick={() => setShowAdvancedAnalytics(prev => !prev)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    {showAdvancedAnalytics ? 'Vue Simple' : 'Analyse Avancée'}
                  </button>
                </div>

                {showAdvancedAnalytics ? (
                  <AdvancedAnalytics selectedKids={[selectedKid]} />
                ) : (
                  <div className="space-y-8">
                    <RiskMatrix risks={risks} />
                    <ESGMetrics esgData={mockESGData} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">Sélectionnez un rapport RSE/ESG pour voir son analyse détaillée</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showKIDExplorer && (
        <KIDExplorer
          kids={kids}
          onClose={() => setShowKIDExplorer(false)}
        />
      )}
      {/* Popup des standards */}
      {showStandardsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Standards détectés</h3>
              </div>
              <button
                onClick={() => setShowStandardsPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
              <p className="text-blue-700 font-medium">
                Elixir détecte que ce document mentionne les standards suivants :
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">GRI 305</h4>
                  <p className="text-sm text-gray-600">Émissions de gaz à effet de serre</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">SASB EM-IS-110a</h4>
                  <p className="text-sm text-gray-600">Gestion de l'énergie</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-200">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">TCFD</h4>
                  <p className="text-sm text-gray-600">Divulgation des risques climatiques</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowStandardsPopup(false)}
              className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <span>Compris</span>
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KIDManager;
