import React, { useState } from 'react';
import { Filter as FilterIcon, X } from 'lucide-react';
import Button from '../Button';
import Dropdown from '../Dropdown';
import Checkbox from '../Checkbox';

/**
 * Reusable Multi-Filter Dropdown.
 * @param {Object} props
 * @param {Array<{key: string, label: string, options: Array<{value: string, label: string}>}>} props.filterConfigs - Schema definitions for filter segments
 * @param {Object} props.selectedFilters - Active state values
 * @param {function} props.onFilterChange - Callback returning updated active filter object
 */
const Filter = ({
  filterConfigs = [], // [{ key: 'status', label: 'Status', options: [...] }]
  selectedFilters = {}, // { status: ['Available', 'On Trip'] }
  onFilterChange,
  className = ''
}) => {
  const [tempFilters, setTempFilters] = useState({ ...selectedFilters });

  const handleCheckboxChange = (groupKey, optionVal, isChecked) => {
    const activeValues = tempFilters[groupKey] || [];
    const nextValues = isChecked
      ? [...activeValues, optionVal]
      : activeValues.filter(v => v !== optionVal);

    const nextFilters = {
      ...tempFilters,
      [groupKey]: nextValues
    };
    
    setTempFilters(nextFilters);
  };

  const handleApply = () => {
    onFilterChange && onFilterChange(tempFilters);
  };

  const handleClear = () => {
    const cleared = {};
    filterConfigs.forEach(config => {
      cleared[config.key] = [];
    });
    setTempFilters(cleared);
    onFilterChange && onFilterChange(cleared);
  };

  const activeCount = Object.values(selectedFilters).reduce(
    (count, arr) => count + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return (
    <Dropdown
      align="left"
      className={className}
      trigger={
        <Button
          variant="outline"
          size="sm"
          leftIcon={FilterIcon}
          className="relative text-xs font-semibold"
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="ml-1.5 h-4 w-4 bg-info text-[9px] font-bold text-white flex items-center justify-center rounded-full">
              {activeCount}
            </span>
          )}
        </Button>
      }
    >
      <div className="w-64 p-3.5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs font-bold text-text-main">Filter Board</span>
          {activeCount > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] font-bold text-danger hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="space-y-4 max-h-56 overflow-y-auto">
          {filterConfigs.map((group) => {
            const activeGroupValues = tempFilters[group.key] || [];
            return (
              <div key={group.key} className="space-y-2">
                <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  {group.label}
                </span>
                <div className="space-y-1.5">
                  {group.options.map((opt) => (
                    <Checkbox
                      key={opt.value}
                      label={opt.label}
                      checked={activeGroupValues.includes(opt.value)}
                      onChange={(e) => handleCheckboxChange(group.key, opt.value, e.target.checked)}
                      className="text-xs font-semibold"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-[11px]"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            className="text-[11px]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Dropdown>
  );
};

export default Filter;
export { Filter };
