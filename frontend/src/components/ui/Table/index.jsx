import React from 'react';

/**
 * Reusable Basic HTML Table Layout Wrapper.
 * @param {Object} props
 * @param {boolean} props.hover - Enters hover effects on rows
 * @param {boolean} props.striped - Enters background stripes on odd rows
 */
const Table = ({
  children,
  hover = true,
  striped = false,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm ${className}`}>
      <table className="w-full border-collapse text-left text-sm text-text-main">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-hover/50 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, onClick, className = '' }) => (
  <tr
    onClick={onClick}
    className={`
      transition-colors
      ${onClick ? 'cursor-pointer hover:bg-hover' : 'hover:bg-hover/20'}
      ${className}
    `}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '', align = 'left' }) => {
  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td className={`px-5 py-3.5 whitespace-nowrap text-sm font-semibold text-text-main ${aligns[align]} ${className}`}>
      {children}
    </td>
  );
};

export const TableHeadCell = ({ children, className = '', align = 'left' }) => {
  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <th scope="col" className={`px-5 py-3 font-bold text-text-secondary uppercase tracking-widest ${aligns[align]} ${className}`}>
      {children}
    </th>
  );
};

export default Table;
