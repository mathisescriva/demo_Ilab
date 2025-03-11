import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

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
  // État pour l'animation d'entrée
  const [animate, setAnimate] = useState(false);

  // Déclencher l'animation au chargement
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Données pour le camembert des risques ESG
  const riskData = [
    { 
      name: 'Environnement', 
      value: esgData.riskCategories.environmental, 
      color: COLORS.environmental,
      description: 'Risques liés au changement climatique, à la biodiversité et à la pollution'
    },
    { 
      name: 'Social', 
      value: esgData.riskCategories.social, 
      color: COLORS.social,
      description: 'Risques liés aux droits humains, conditions de travail et impact sur les communautés'
    },
    { 
      name: 'Gouvernance', 
      value: esgData.riskCategories.governance, 
      color: COLORS.governance,
      description: 'Risques liés à l\'éthique des affaires, la conformité et la structure de gouvernance'
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

  // Tooltip personnalisé pour les graphiques en camembert
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.name.includes('Scope') ? totalEmissions : totalRisks;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100 max-w-xs animate-fade-in">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{data.name}</h3>
          <p className="text-lg font-bold text-gray-800">
            {data.name.includes('Scope') ? formatNumber(data.value) + ' tCO₂e' : data.value}
            <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  // Tooltip pour le graphique d'évolution
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
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100 animate-fade-in">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{label}</h3>
          <p className="text-lg font-bold text-gray-800">
            {formatNumber(value)} tCO₂e
          </p>
          {prevYear && (
            <p className={`text-xs mt-2 ${percentChange < 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {percentChange < 0 ? '↓' : '↑'} {changeText}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 p-6 bg-white rounded-xl shadow-sm transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Métriques ESG</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Données mises à jour: {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Répartition des risques ESG */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition des risques ESG</h4>
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
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {riskData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des émissions */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Émissions par scope</h4>
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
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium">
                  <tspan x="50%" dy="-5" className="text-gray-700 text-xs">Total</tspan>
                  <tspan x="50%" dy="15" className="text-gray-900 text-sm font-bold">{formatNumber(totalEmissions)}</tspan>
                  <tspan x="50%" dy="15" className="text-gray-500 text-xs">tCO₂e</tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {emissionsData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Évolution des émissions */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Évolution des émissions</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={esgData.historicalEmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis dataKey="year" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
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
              >
                {esgData.historicalEmissions.map((entry, index) => {
                  const prevValue = index > 0 ? esgData.historicalEmissions[index - 1].value : entry.value;
                  const isDecreasing = entry.value < prevValue;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isDecreasing ? '#10B981' : '#F87171'} 
                      radius={4}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
              <span className="text-xs text-gray-600">Baisse</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-red-400"></div>
              <span className="text-xs text-gray-600">Hausse</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {(() => {
              const firstYear = esgData.historicalEmissions[0];
              const lastYear = esgData.historicalEmissions[esgData.historicalEmissions.length - 1];
              const percentChange = ((lastYear.value - firstYear.value) / firstYear.value) * 100;
              return (
                <span className={percentChange < 0 ? 'text-green-600' : 'text-red-600'}>
                  {percentChange < 0 ? '↓' : '↑'} {Math.abs(percentChange).toFixed(1)}% depuis {firstYear.year}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGMetrics; 