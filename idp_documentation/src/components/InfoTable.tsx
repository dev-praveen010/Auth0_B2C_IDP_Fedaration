import type { InfoTableProps } from '../types';

export default function InfoTable({ headers, rows, striped = false }: InfoTableProps) {
  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold border border-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 border border-gray-200 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
