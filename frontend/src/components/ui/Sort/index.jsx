import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import Button from '../Button';
import Dropdown from '../Dropdown';

/**
 * Reusable Sort Trigger and Dropdown selector.
 * @param {Object} props
 * @param {Array<{value: string, label: string}>} props.sortFields - Sortable database columns
 * @param {string} props.sortBy - Currently active sort column key
 * @param {'asc'|'desc'} props.sortOrder - Currently active direction
 * @param {function} props.onSortChange - Sort change callback
 */
const Sort = ({
  sortFields = [],
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  className = ''
}) => {
  const handleFieldChange = (fieldVal) => {
    onSortChange && onSortChange(fieldVal, sortOrder);
  };

  const toggleDirection = (e) => {
    e.stopPropagation();
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange && onSortChange(sortBy, nextOrder);
  };

  const activeField = sortFields.find(f => f.value === sortBy);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Dropdown
        align="left"
        trigger={
          <Button
            variant="outline"
            size="sm"
            rightIcon={ChevronDown}
            className="text-xs font-semibold"
          >
            <span>Sort by: </span>
            <strong className="text-text-main ml-1 font-bold">
              {activeField ? activeField.label : 'Select field'}
            </strong>
          </Button>
        }
      >
        <div className="py-1">
          {sortFields.map((field) => (
            <div
              key={field.value}
              onClick={() => handleFieldChange(field.value)}
              className={`
                px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors
                ${field.value === sortBy ? 'bg-info/10 text-info font-bold' : 'text-text-secondary hover:text-text-main hover:bg-hover'}
              `}
            >
              {field.label}
            </div>
          ))}
        </div>
      </Dropdown>

      {sortBy && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDirection}
          leftIcon={ArrowUpDown}
          className="text-xs px-2.5"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        />
      )}
    </div>
  );
};

export default Sort;
export { Sort };
