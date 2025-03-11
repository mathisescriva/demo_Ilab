import React from 'react';

interface RiskLevelProps {
  level: number;
}

const RiskLevel: React.FC<RiskLevelProps> = ({ level }) => {
  const currentLevel = level || 1;
  const maxLevel = 7;

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">Niveau de risque</h3>
      <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200">
        <div className="flex space-x-1">
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => (
            <div
              key={level}
              className="relative group cursor-pointer"
              style={{ flex: 1 }}
            >
              <div
                className={`h-2 rounded transition-all duration-300 ${
                  level <= maxLevel / 3
                    ? 'bg-green-500 group-hover:bg-green-600'
                    : level <= (maxLevel * 2) / 3
                    ? 'bg-yellow-500 group-hover:bg-yellow-600'
                    : 'bg-red-500 group-hover:bg-red-600'
                } ${level > currentLevel ? 'opacity-30 group-hover:opacity-50' : ''}`}
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  Niveau {level}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between text-sm">
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Risque faible</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Risque moyen</span>
          </div>
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Risque élevé</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Niveau actuel</span>
            <div className="flex items-center space-x-2">
              <span className="text-blue-900 font-bold text-lg">{currentLevel}/{maxLevel}</span>
              <span className="text-blue-600 text-sm">
                ({currentLevel <= maxLevel / 3 ? 'Risque faible' : currentLevel <= (maxLevel * 2) / 3 ? 'Risque moyen' : 'Risque élevé'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLevel;
