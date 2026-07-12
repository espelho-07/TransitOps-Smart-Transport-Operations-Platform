import React from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
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
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-border bg-card rounded-b-lg text-sm text-text-secondary ${className}`}>
      <div>
        {totalItems > 0 ? (
          <span>
            Showing <strong className="font-semibold text-text-main">{startIdx}</strong> to{' '}
            <strong className="font-semibold text-text-main">{endIdx}</strong> of{' '}
            <strong className="font-semibold text-text-main">{totalItems}</strong> entries
          </span>
        ) : (
          <span>No entries to display</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={ChevronLeft}
        />
        
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8 px-0"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={ChevronRight}
        />
      </div>
    </div>
  );
};

export default Pagination;
