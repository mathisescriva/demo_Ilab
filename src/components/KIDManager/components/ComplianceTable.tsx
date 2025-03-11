import React from 'react';

interface Standard {
  id: string;
  name: string;
  score: number; // 0-100
  details: string;
}

interface ComplianceTableProps {
  standards: Standard[];
}

const ComplianceTable: React.FC<ComplianceTableProps> = ({ standards }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Conformité vs. Référentiels</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référentiel
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Détails
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standards.map((standard) => (
              <tr key={standard.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {standard.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${getScoreColor(standard.score)} mr-2`}></div>
                    <span className="text-sm text-gray-900">{standard.score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {standard.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceTable; 