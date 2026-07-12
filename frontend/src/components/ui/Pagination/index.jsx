import React from 'react';
import Button from '../Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Data Grid Pagination.
 * @param {Object} props
 * @param {number} props.currentPage - Active index page
 * @param {number} props.totalItems - Total rows length
 * @param {number} props.itemsPerPage - Page size limit
 * @param {function} props.onPageChange - Index change callback
 * @param {function} props.onPageSizeChange - Page size change callback (optional)
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(totalItems, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-5 border-t border-border bg-card rounded-b-lg text-xs font-semibold text-text-secondary ${className}`}>
      
      {/* Items count metadata */}
      <div className="flex items-center gap-3">
        {totalItems > 0 ? (
          <span>
            Showing <strong className="font-bold text-text-main">{startIdx}</strong> to{' '}
            <strong className="font-bold text-text-main">{endIdx}</strong> of{' '}
            <strong className="font-bold text-text-main">{totalItems}</strong> entries
          </span>
        ) : (
          <span>No entries to display</span>
        )}

        {/* Page size dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider select-none">Limit:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-hover border border-border rounded text-[10.5px] font-bold text-text-main px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-info"
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pages actions list */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          leftIcon={ChevronLeft}
          className="px-2"
        />

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8 p-0"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          leftIcon={ChevronRight}
          className="px-2"
        />
      </div>
    </div>
  );
};

export default Pagination;
export { Pagination };
