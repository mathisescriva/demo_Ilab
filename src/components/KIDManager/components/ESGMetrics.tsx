import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ESGMetricsProps {
  esgData: {
    riskCategories: {
      environmental: number;
      social: number;
      governance: number;
    };
    emissions: {
      scope1: number;
      scope2: number;
      scope3: number;
    };
    historicalEmissions: Array<{
      year: string;
      value: number;
    }>;
  };
}

const COLORS = {
  environmental: '#34D399',
  social: '#60A5FA',
  governance: '#9333EA',
  scope1: '#10B981',
  scope2: '#3B82F6',
  scope3: '#6366F1'
};

const ESGMetrics: React.FC<ESGMetricsProps> = ({ esgData }) => {
  const [animate, setAnimate] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    setAnimate(true);
  }, []);

  // Enriched risk data with performance indicators
  const riskData = [
    { 
      name: 'Environnement', 
      value: esgData.riskCategories.environmental, 
      color: COLORS.environmental,
      description: 'Risques liés au changement climatique, à la biodiversité et à la pollution',
      trend: -5, // Exemple de tendance
      performance: 'strong', // 'strong', 'moderate', 'weak'
      details: [
        'Émissions de GES en baisse de 15%',
        'Programme de biodiversité en place',
        'Certification ISO 14001'
      ]
    },
    { 
      name: 'Social', 
      value: esgData.riskCategories.social, 
      color: COLORS.social,
      description: 'Risques liés aux droits humains, conditions de travail et impact sur les communautés',
      trend: 2,
      performance: 'moderate',
      details: [
        'Taux de rotation du personnel: 8%',
        'Score d\'engagement: 7.5/10',
        'Diversité: 42% de femmes'
      ]
    },
    { 
      name: 'Gouvernance', 
      value: esgData.riskCategories.governance, 
      color: COLORS.governance,
      description: 'Risques liés à l\'éthique des affaires, la conformité et la structure de gouvernance',
      trend: -2,
      performance: 'strong',
      details: [
        'Conseil: 45% indépendant',
        'Politique anti-corruption',
        'Transparence: Score 9/10'
      ]
    }
  ];

  // Données pour le donut des émissions
  const emissionsData = [
    { 
      name: 'Scope 1', 
      value: esgData.emissions.scope1, 
      color: COLORS.scope1,
      description: 'Émissions directes des installations détenues ou contrôlées'
    },
    { 
      name: 'Scope 2', 
      value: esgData.emissions.scope2, 
      color: COLORS.scope2,
      description: 'Émissions indirectes liées à la consommation d\'électricité'
    },
    { 
      name: 'Scope 3', 
      value: esgData.emissions.scope3, 
      color: COLORS.scope3,
      description: 'Autres émissions indirectes de la chaîne de valeur'
    }
  ];

  // Calcul du total des émissions
  const totalEmissions = emissionsData.reduce((sum, item) => sum + item.value, 0);
  const totalRisks = riskData.reduce((sum, item) => sum + item.value, 0);

  // Fonction pour formater les nombres en k/M/B
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '0';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Enhanced tooltip with performance indicators
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.name.includes('Scope') ? totalEmissions : totalRisks;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div style={{ 
          position: 'fixed',
          top: '20%',
          left: '20%',
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          maxWidth: '20rem',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base">{data.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              data.performance === 'strong' ? 'bg-green-100 text-green-800' :
              data.performance === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.performance === 'strong' ? 'Fort' :
               data.performance === 'moderate' ? 'Modéré' : 'Faible'}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {data.name.includes('Scope') ? formatNumber(data.value) + ' tCO₂e' : data.value}
            <span className="text-sm text-gray-500">({percentage}%)</span>
            {data.trend && (
              <span className={`flex items-center text-sm ${data.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.trend < 0 ? <ArrowTrendingDownIcon className="w-4 h-4" /> : <ArrowTrendingUpIcon className="w-4 h-4" />}
                {Math.abs(data.trend)}%
              </span>
            )}
          </p>
          <p className="text-xs text-gray-600 mt-2">{data.description}</p>
          {data.details && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-1">Points clés:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {data.details.map((detail: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Enhanced trend tooltip with more context
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const prevYear = esgData.historicalEmissions.find(item => 
        parseInt(item.year) === parseInt(label) - 1
      );
      
      let percentChange = 0;
      let changeText = "";
      
      if (prevYear) {
        percentChange = ((value - prevYear.value) / prevYear.value) * 100;
        changeText = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% vs ${parseInt(label) - 1}`;
      }

      // Calculate average for the period
      const average = esgData.historicalEmissions.reduce((sum, item) => sum + item.value, 0) / esgData.historicalEmissions.length;
      const vsAverage = ((value - average) / average) * 100;
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base">{label}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              value < average ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {value < average ? 'Sous la moyenne' : 'Au-dessus de la moyenne'}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {formatNumber(value)} tCO₂e
          </p>
          <div className="mt-2 space-y-1">
            {prevYear && (
              <p className={`text-xs ${percentChange < 0 ? 'text-green-600' : 'text-red-600'} font-medium flex items-center gap-1`}>
                {percentChange < 0 ? <ArrowTrendingDownIcon className="w-4 h-4" /> : <ArrowTrendingUpIcon className="w-4 h-4" />}
                {changeText}
              </p>
            )}
            <p className="text-xs text-gray-600">
              {vsAverage > 0 ? '+' : ''}{vsAverage.toFixed(1)}% vs moyenne historique
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Métriques ESG</h3>
          <div className="relative group">
            <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white rounded-lg shadow-lg border border-gray-100 text-xs text-gray-600">
              Ces métriques représentent la performance ESG globale de l'entreprise, incluant les risques environnementaux, sociaux et de gouvernance.
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">Données mises à jour: {new Date().toLocaleDateString('fr-FR')}</span>
          <div className="flex gap-2">
            {['day', 'month', 'year'].map((period) => (
              <button
                key={period}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedMetric === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedMetric(period)}
              >
                {period === 'day' ? 'Jour' : period === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Répartition des risques ESG */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent"></div>
          <div className="relative">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center justify-between">
              <span>Répartition des risques ESG</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Score: A-</span>
              </div>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius="70%"
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={300}
                    isAnimationActive={animate}
                  >
                    {riskData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomPieTooltip />}
                    position={{ x: 20, y: 0 }}
                    cursor={false}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {riskData.map((entry, index) => (
                <div key={index} className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-gray-600">{entry.name}</span>
                  <span className={`ml-2 text-xs font-medium ${
                    entry.trend < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.trend < 0 ? '↓' : '↑'} {Math.abs(entry.trend)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Émissions par scope avec design amélioré */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent"></div>
          <div className="relative">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center justify-between">
              <span>Émissions par scope</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  -15% vs 2022
                </span>
              </div>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emissionsData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="70%"
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={600}
                    isAnimationActive={animate}
                  >
                    {emissionsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomPieTooltip />}
                    position={{ x: 20, y: 0 }}
                    cursor={false}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-10" className="text-gray-700 text-xs font-medium">Total</tspan>
                    <tspan x="50%" dy="20" className="text-gray-900 text-sm font-bold">{formatNumber(totalEmissions)}</tspan>
                    <tspan x="50%" dy="20" className="text-gray-500 text-xs">tCO₂e</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {emissionsData.map((entry, index) => (
                <div key={index} className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-gray-600">{entry.name}</span>
                  <span className="ml-2 text-xs font-medium text-gray-700">
                    {((entry.value / totalEmissions) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Évolution des émissions avec design amélioré */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Évolution des émissions</h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Objectif 2025: -30%
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esgData.historicalEmissions} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis 
                  dataKey="year" 
                  stroke="#6B7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12} 
                  tickFormatter={formatNumber} 
                  tickLine={false} 
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<TrendTooltip />} />
                <Bar
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={900}
                  isAnimationActive={animate}
                  radius={[4, 4, 0, 0]}
                  fill="url(#barGradient)"
                  className="transition-all duration-300 hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                <span className="text-xs text-gray-600">Baisse</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-400"></div>
                <span className="text-xs text-gray-600">Hausse</span>
              </div>
            </div>
            <div className="text-xs">
              {(() => {
                const firstYear = esgData.historicalEmissions[0];
                const lastYear = esgData.historicalEmissions[esgData.historicalEmissions.length - 1];
                const percentChange = ((lastYear.value - firstYear.value) / firstYear.value) * 100;
                return (
                  <span className={`px-3 py-1.5 rounded-full ${
                    percentChange < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {percentChange < 0 ? '↓' : '↑'} {Math.abs(percentChange).toFixed(1)}% depuis {firstYear.year}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGMetrics; 