import React, { useState } from 'react';

interface HistoricalData {
  date: string;
  probability: number;
  impact: number;
}

interface GRIMapping {
  code: string;
  name: string;
  status: 'detected' | 'missing';
}

interface Risk {
  id: string;
  name: string;
  probability: number; // 1-5
  impact: number; // 1-5
  category: 'environmental' | 'social' | 'governance';
  griMappings: GRIMapping[];
  history: HistoricalData[];
}

// Données d'exemple
const mockRisks: Risk[] = [
  {
    id: "ethique_affaires",
    name: "Éthique des affaires",
    probability: 1,
    impact: 5,
    category: "governance",
    griMappings: [
      { code: "205", name: "Anti-corruption", status: "detected" },
      { code: "206", name: "Comportement anticoncurrentiel", status: "detected" },
      { code: "415", name: "Politique publique", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 2, impact: 4 },
      { date: "2022-06", probability: 2, impact: 5 },
      { date: "2023-01", probability: 1, impact: 5 },
      { date: "2023-06", probability: 1, impact: 5 },
      { date: "2024-01", probability: 1, impact: 5 }
    ]
  },
  {
    id: "emissions_ges",
    name: "Émissions de gaz à effet de serre",
    probability: 4,
    impact: 4,
    category: "environmental",
    griMappings: [
      { code: "305", name: "Émissions", status: "detected" },
      { code: "302", name: "Énergie", status: "detected" }
    ],
    history: [
      { date: "2022-01", probability: 3, impact: 3 },
      { date: "2022-06", probability: 3, impact: 4 },
      { date: "2023-01", probability: 4, impact: 4 },
      { date: "2023-06", probability: 4, impact: 4 },
      { date: "2024-01", probability: 4, impact: 4 }
    ]
  },
  {
    id: "sante_securite",
    name: "Santé et sécurité au travail",
    probability: 3,
    impact: 4,
    category: "social",
    griMappings: [
      { code: "403", name: "Santé et sécurité au travail", status: "detected" },
      { code: "404", name: "Formation et éducation", status: "missing" }
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
    id: "biodiversite",
    name: "Impact sur la biodiversité",
    probability: 5,
    impact: 3,
    category: "environmental",
    griMappings: [
      { code: "304", name: "Biodiversité", status: "detected" },
      { code: "306", name: "Déchets", status: "missing" }
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
    id: "droits_humains",
    name: "Droits humains dans la chaîne d'approvisionnement",
    probability: 2,
    impact: 5,
    category: "social",
    griMappings: [
      { code: "412", name: "Évaluation des droits de l'homme", status: "detected" },
      { code: "414", name: "Évaluation sociale des fournisseurs", status: "missing" }
    ],
    history: [
      { date: "2022-01", probability: 3, impact: 5 },
      { date: "2022-06", probability: 3, impact: 5 },
      { date: "2023-01", probability: 2, impact: 5 },
      { date: "2023-06", probability: 2, impact: 5 },
      { date: "2024-01", probability: 2, impact: 5 }
    ]
  }
];

interface RiskMatrixProps {
  risks?: Risk[];
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks = mockRisks }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().getFullYear().toString());
  const [hoveredRisk, setHoveredRisk] = useState<Risk | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const matrixRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const matrixSize = 5;
  const cellSize = 60;

  const getCellColor = (probability: number, impact: number) => {
    const severity = probability * impact;
    if (severity <= 6) return 'bg-emerald-50/40';
    if (severity <= 15) return 'bg-amber-50/40';
    return 'bg-rose-50/40';
  };

  const getCellBorderColor = (probability: number, impact: number) => {
    const severity = probability * impact;
    if (severity <= 6) return 'border-emerald-100';
    if (severity <= 15) return 'border-amber-100';
    return 'border-rose-100';
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'environmental': return 'bg-emerald-500';
      case 'social': return 'bg-sky-500';
      case 'governance': return 'bg-violet-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBorderColor = (category: string) => {
    switch (category) {
      case 'environmental': return 'border-emerald-600';
      case 'social': return 'border-sky-600';
      case 'governance': return 'border-violet-600';
      default: return 'border-gray-600';
    }
  };

  const getAxisLabel = (value: number, axis: 'probability' | 'impact') => {
    const labels = {
      probability: ['Rare', 'Peu probable', 'Possible', 'Probable', 'Très probable'],
      impact: ['Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Critique']
    };
    return labels[axis][value - 1];
  };

  const renderGRIMappings = (risk: Risk) => {
    if (!risk.griMappings || !Array.isArray(risk.griMappings)) {
      return null;
    }

    const detected = risk.griMappings.filter(m => m && m.status === 'detected');
    const missing = risk.griMappings.filter(m => m && m.status === 'missing');

    return (
      <div className="mt-2 space-y-2">
        {detected.length > 0 && (
          <div className="text-green-600">
            <div className="font-medium">Correspondances détectées :</div>
            {detected.map(mapping => (
              <div key={mapping.code} className="ml-2">
                GRI {mapping.code} ({mapping.name})
              </div>
            ))}
          </div>
        )}
        {missing.length > 0 && (
          <div className="text-amber-600">
            <div className="font-medium">Informations manquantes :</div>
            {missing.map(mapping => (
              <div key={mapping.code} className="ml-2">
                GRI {mapping.code} ({mapping.name})
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderHistoryChart = (risk: Risk) => {
    if (!risk.history || !Array.isArray(risk.history) || risk.history.length === 0) {
      return (
        <div className="mt-4 border-t pt-2">
          <div className="text-gray-500 text-xs">Aucun historique disponible</div>
        </div>
      );
    }

    const sortedHistory = [...risk.history]
      .filter(h => h.date && h.probability && h.impact)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedHistory.length === 0) {
      return (
        <div className="mt-4 border-t pt-2">
          <div className="text-gray-500 text-xs">Données historiques invalides</div>
        </div>
      );
    }

    const maxValue = Math.max(...sortedHistory.map(h => Math.max(h.probability || 0, h.impact || 0)));
    
    return (
      <div className="mt-4 border-t pt-2">
        <div className="font-medium mb-2">Évolution dans le temps</div>
        <div className="flex items-center gap-4 mb-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 mr-1" />
            <span>Impact</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-1" />
            <span>Probabilité</span>
          </div>
        </div>
        <div className="h-24 flex items-end space-x-2">
          {sortedHistory.map((data, index) => (
            <div key={data.date} className="relative group flex-1">
              <div className="flex flex-col items-center gap-0.5">
                <div 
                  className="w-full bg-blue-500 rounded-sm transition-all duration-300"
                  style={{ height: `${(data.impact / maxValue) * 100}%` }}
                />
                <div 
                  className="w-full bg-green-500 rounded-sm transition-all duration-300"
                  style={{ height: `${(data.probability / maxValue) * 100}%` }}
                />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-gray-500 whitespace-nowrap">
                {new Date(data.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 bg-white shadow-lg rounded p-2 text-xs whitespace-nowrap z-20">
                <div className="font-medium">{new Date(data.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                <div className="flex gap-3">
                  <div>
                    <span className="text-blue-500 font-medium">Impact:</span> {getAxisLabel(data.impact, 'impact')}
                  </div>
                  <div>
                    <span className="text-green-500 font-medium">Probabilité:</span> {getAxisLabel(data.probability, 'probability')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleRiskHover = React.useCallback((risk: Risk, event: React.MouseEvent) => {
    const point = event.currentTarget.getBoundingClientRect();
    const matrix = matrixRef.current?.getBoundingClientRect();
    
    if (matrix) {
      let x = point.left - matrix.left + (point.width / 2);
      let y = point.top - matrix.top;
      
      setTooltipPosition({ x, y });
      setHoveredRisk(risk);
    }
  }, []);

  const handleRiskLeave = React.useCallback(() => {
    setHoveredRisk(null);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Cartographie des Risques</h3>
      <div className="flex items-start justify-between p-6 bg-white rounded-xl shadow-sm">
        <div className="relative risk-matrix" ref={matrixRef}>
          <div 
            ref={tooltipRef}
            className={`absolute z-10 w-80 bg-white rounded-xl shadow-xl border-0 p-4
              transition-all duration-200 ease-out pointer-events-none origin-bottom
              ${hoveredRisk ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}
            style={{ 
              left: `${tooltipPosition.x}px`,
              bottom: `${matrixSize * cellSize - tooltipPosition.y + 80}px`,
              transform: 'translateX(-50%)',
              willChange: 'transform, opacity',
              boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            {hoveredRisk && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 transition-all duration-200 ease-out">{hoveredRisk.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full transition-all duration-200 ease-out ${
                      hoveredRisk.category === 'environmental' ? 'bg-green-100 text-green-800' :
                      hoveredRisk.category === 'social' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {hoveredRisk.category.charAt(0).toUpperCase() + hoveredRisk.category.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Impact</div>
                      <div className="font-medium text-gray-800">{getAxisLabel(hoveredRisk.impact, 'impact')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Probabilité</div>
                      <div className="font-medium text-gray-800">{getAxisLabel(hoveredRisk.probability, 'probability')}</div>
                    </div>
                  </div>

                  {hoveredRisk.griMappings && hoveredRisk.griMappings.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Correspondances GRI</p>
                      <div className="grid grid-cols-2 gap-2">
                        {hoveredRisk.griMappings.map(mapping => (
                          <div key={mapping.code} 
                            className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs ${
                              mapping.status === 'detected' 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>GRI {mapping.code}</span>
                            <span className="ml-2 text-xs">
                              {mapping.status === 'detected' ? '✓' : '×'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hoveredRisk.history && hoveredRisk.history.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Évolution</p>
                      <div className="space-y-1.5">
                        {hoveredRisk.history.slice(-3).reverse().map(entry => (
                          <div key={entry.date} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1">
                            <span className="text-xs text-gray-600">{formatDate(entry.date)}</span>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="flex items-center">
                                <span className="text-gray-500 mr-1">P:</span>
                                <span className="font-medium text-gray-800">{entry.probability}</span>
                              </span>
                              <span className="flex items-center">
                                <span className="text-gray-500 mr-1">I:</span>
                                <span className="font-medium text-gray-800">{entry.impact}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Flèche du tooltip avec une tige plus longue */}
                <div 
                  className="absolute w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45 -bottom-2 left-1/2 -translate-x-1/2"
                  style={{
                    willChange: 'transform',
                    boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.05)'
                  }}
                ></div>
              </>
            )}
          </div>

          {/* Matrix */}
          <div className="flex">
            {/* Y-axis labels */}
            <div className="relative flex flex-col items-end mr-6 mt-16">
              <div className="h-[300px] flex flex-col justify-between">
                {[...Array(matrixSize)].map((_, idx) => (
                  <div key={idx} className="text-sm text-gray-500 transform -translate-y-1/2 py-1 px-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    {getAxisLabel(matrixSize - idx, 'probability')}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="relative backdrop-blur-sm bg-white/30 rounded-lg p-1">
                {[...Array(matrixSize)].map((_, row) => (
                  <div key={row} className="flex">
                    {[...Array(matrixSize)].map((_, col) => {
                      const probability = matrixSize - row;
                      const impact = col + 1;
                      const cellRisks = risks.filter(risk => risk.probability === probability && risk.impact === impact);
                      
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`relative border ${getCellBorderColor(probability, impact)} ${getCellColor(probability, impact)} transition-all duration-200`}
                          style={{ 
                            width: cellSize, 
                            height: cellSize,
                            borderWidth: '1px',
                          }}
                        >
                          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 p-1.5">
                            {cellRisks.map(risk => (
                              <div
                                key={risk.id}
                                className="relative group cursor-pointer"
                                onMouseEnter={(event) => handleRiskHover(risk, event)}
                                onMouseLeave={handleRiskLeave}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full ${getRiskColor(risk.category)} border-2 ${getRiskBorderColor(risk.category)} 
                                    shadow-lg transition-all duration-300 ease-out hover:scale-125 hover:shadow-xl`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="mt-4 relative" style={{ width: `${cellSize * matrixSize}px`, height: '40px' }}>
                <div className="grid grid-cols-5 gap-0">
                  {[...Array(matrixSize)].map((_, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-center items-start"
                    >
                      <div
                        className="text-xs text-gray-500 whitespace-nowrap px-1"
                        style={{ 
                          width: 'min-content',
                          fontSize: '0.7rem',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {getAxisLabel(idx + 1, 'impact')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-16 ml-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Catégories de Risques</h4>
            <div className="space-y-2.5">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full ${getRiskColor('environmental')} border-2 ${getRiskBorderColor('environmental')} mr-3 shadow-sm`} />
                <span className="text-sm text-gray-600">Environnemental</span>
              </div>
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full ${getRiskColor('social')} border-2 ${getRiskBorderColor('social')} mr-3 shadow-sm`} />
                <span className="text-sm text-gray-600">Social</span>
              </div>
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full ${getRiskColor('governance')} border-2 ${getRiskBorderColor('governance')} mr-3 shadow-sm`} />
                <span className="text-sm text-gray-600">Gouvernance</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Niveau de Risque</h4>
              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-emerald-50/40 border border-emerald-100 mr-3 rounded" />
                  <span className="text-sm text-gray-600">Faible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-amber-50/40 border border-amber-100 mr-3 rounded" />
                  <span className="text-sm text-gray-600">Moyen</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-rose-50/40 border border-rose-100 mr-3 rounded" />
                  <span className="text-sm text-gray-600">Élevé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateStr: string) => {
  const [year, month] = dateStr.split('-');
  const months = {
    '01': 'Jan', '06': 'Juin', '12': 'Déc'
  };
  return `${months[month as keyof typeof months]} ${year}`;
};

// Ajout des keyframes pour l'animation de la flèche
const styles = `
@keyframes tooltipArrowAppear {
  from {
    transform: translate(-50%, -4px) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0) rotate(45deg);
    opacity: 1;
  }
}
`;

// Injection des styles dans le document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default RiskMatrix; 