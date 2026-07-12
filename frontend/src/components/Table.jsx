import React from 'react';
import Loader from './Loader';

const Table = ({
  headers = [], // { key: 'name', label: 'Name', align: 'left' }
  data = [],
  renderRow,
  isLoading = false,
  onRowClick,
  emptyMessage = "No records found"
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-left text-sm text-text-main">
        <thead className="bg-hover/50 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={header.key || idx}
                scope="col"
                className={`px-6 py-3.5 font-semibold ${
                  header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader size="md" />
                  <span className="text-xs text-text-secondary">Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`
                  transition-colors
                  ${onRowClick ? 'hover:bg-hover cursor-pointer' : 'hover:bg-hover/20'}
                `}
              >
                {renderRow ? (
                  renderRow(row, rowIdx)
                ) : (
                  headers.map((header) => {
                    const value = row[header.key];
                    return (
                      <td
                        key={header.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {value !== undefined && value !== null ? String(value) : '-'}
                      </td>
                    );
                  })
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
