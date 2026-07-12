import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import Button from '../Button';
import Search from '../Search';
import Filter from '../Filter';
import Sort from '../Sort';
import Pagination from '../Pagination';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHeadCell } from '../Table';
import Checkbox from '../Checkbox';
import EmptyState from '../EmptyState';
import Dropdown from '../Dropdown';

/**
 * Reusable Advanced Enterprise DataTable.
 * @param {Object} props
 * @param {Array<Object>} props.columns - [{ key: string, label: string, sortable?: boolean, render?: (val, row) => React.ReactNode }]
 * @param {Array<Object>} props.data - Rows data
 * @param {boolean} props.isLoading - Grid loading state
 * @param {Array<Object>} props.filterConfigs - Schema configurations for Filter component
 * @param {Array<Object>} props.sortFields - Sort configurations for Sort component
 * @param {React.ReactNode} props.bulkActions - Custom buttons to show when rows are selected
 * @param {function} props.expandableRowRender - Renders expandable row drawers
 * @param {function} props.onRowClick - Click handler for rows
 */
const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  filterConfigs = [],
  sortFields = [],
  bulkActions,
  expandableRowRender,
  onRowClick,
  emptyMessage = "No records found",
  searchPlaceholder = "Search records..."
}) => {
  // Normalize columns to support both key/label/render and accessor/header/cell formats
  const normalizedColumns = useMemo(() => {
    return columns.map(c => {
      const key = c.key || c.accessor || '';
      const label = c.label || c.header || '';
      let renderFn = c.render;
      if (!renderFn && c.cell) {
        renderFn = (val, row) => c.cell(row);
      }
      return {
        ...c,
        key,
        label,
        render: renderFn
      };
    });
  }, [columns]);

  // 1. Internal states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState(sortFields[0]?.value || '');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(() => 
    normalizedColumns.map(c => c.key)
  );

  // Sync visible column keys if normalizedColumns length shifts
  useEffect(() => {
    setVisibleColumnKeys(normalizedColumns.map(c => c.key));
  }, [normalizedColumns]);

  // Reset pagination on filter or search changes
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
  };

  // 2. Filter & Sort client logic (fallbacks if parent does not supply custom API handlers)
  const processedData = useMemo(() => {
    let result = [...data];

    // Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
      );
    }

    // Dropdown Filters
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        result = result.filter(row => values.includes(String(row[key])));
      }
    });

    // Column Sorting
    if (sortBy) {
      result.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, searchQuery, selectedFilters, sortBy, sortOrder]);

  // 3. Paginated details
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // 4. Selections
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedRowIds(paginatedData.map(row => row.id || row._id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (rowId, isChecked) => {
    if (isChecked) {
      setSelectedRowIds(prev => [...prev, rowId]);
    } else {
      setSelectedRowIds(prev => prev.filter(id => id !== rowId));
    }
  };

  // 5. Accordion expansions
  const handleToggleExpandRow = (rowId, e) => {
    e.stopPropagation();
    setExpandedRowIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  // Active columns filtered by visibility toggles
  const activeColumns = normalizedColumns.filter(c => visibleColumnKeys.includes(c.key));

  return (
    <div className="space-y-4">
      {/* Search, Filter, Sort, Column Toggle control panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          {/* Debounced Search Component */}
          <Search value={searchQuery} onChange={handleSearchChange} placeholder={searchPlaceholder} />
          
          {/* Accordion Multiple Filters */}
          {filterConfigs.length > 0 && (
            <Filter
              filterConfigs={filterConfigs}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Sort Component */}
          {sortFields.length > 0 && (
            <Sort
              sortFields={sortFields}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortBy(field);
                setSortOrder(order);
              }}
            />
          )}
        </div>

        {/* Column Visibility dropdown */}
        <Dropdown
          align="right"
          trigger={
            <Button variant="outline" size="sm" rightIcon={ChevronDown} className="text-xs font-semibold">
              <span>Columns</span>
            </Button>
          }
        >
          <div className="p-2.5 w-48 space-y-2">
            <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border/40 pb-1.5 mb-1.5">
              Toggle Columns
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {normalizedColumns.map(col => {
                const isChecked = visibleColumnKeys.includes(col.key);
                return (
                  <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleColumnKeys(prev => [...prev, col.key]);
                        } else {
                          setVisibleColumnKeys(prev => prev.filter(k => k !== col.key));
                        }
                      }}
                      className="rounded border border-border bg-card text-info focus:ring-1 focus:ring-info h-3.5 w-3.5"
                    />
                    <span>{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </Dropdown>
      </div>

      {/* Bulk actions banner bar */}
      {selectedRowIds.length > 0 && bulkActions && (
        <div className="flex items-center justify-between bg-info/10 border border-info/20 px-5 py-3 rounded-lg animate-fadeIn text-xs font-semibold">
          <span className="text-info font-bold">
            {selectedRowIds.length} row(s) selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedRowIds, () => setSelectedRowIds([]))}
          </div>
        </div>
      )}

      {/* Grid Table Scaffolding */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* Expansion cell header */}
            {expandableRowRender && <TableHeadCell className="w-10" />}

            {/* Checkbox bulk selection cell header */}
            <TableHeadCell className="w-10 text-center">
              <Checkbox
                checked={paginatedData.length > 0 && selectedRowIds.length === paginatedData.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </TableHeadCell>

            {/* Active columns cell headers */}
            {activeColumns.map((col) => (
              <TableHeadCell
                key={col.key}
                align={col.align || 'left'}
                className={col.sortable ? 'cursor-pointer hover:text-text-main transition-colors select-none' : ''}
                onClick={() => {
                  if (col.sortable) {
                    const nextOrder = sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc';
                    setSortBy(col.key);
                    setSortOrder(nextOrder);
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {col.sortable && sortBy === col.key && (
                    <span className="text-[10px] text-info">
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={activeColumns.length + 2} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-info" size={32} />
                  <span className="text-xs text-text-secondary font-bold">Querying server database records...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={activeColumns.length + 2} className="py-12">
                <EmptyState
                  title="No records matched query"
                  description={emptyMessage}
                  className="border-0 shadow-none bg-transparent"
                />
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row) => {
              const rowId = row.id || row._id;
              const isChecked = selectedRowIds.includes(rowId);
              const isExpanded = expandedRowIds.includes(rowId);

              return (
                <React.Fragment key={rowId}>
                  <TableRow
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={onRowClick ? 'cursor-pointer' : ''}
                  >
                    {/* Expand trigger button */}
                    {expandableRowRender && (
                      <TableCell className="w-10">
                        <button
                          type="button"
                          onClick={(e) => handleToggleExpandRow(rowId, e)}
                          className="text-text-secondary hover:text-text-main p-0.5 rounded focus:outline-none"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </TableCell>
                    )}

                    {/* Selector checkbox */}
                    <TableCell className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                      />
                    </TableCell>

                    {/* Column Cells */}
                    {activeColumns.map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <TableCell key={col.key} align={col.align || 'left'}>
                          {col.render ? col.render(cellValue, row) : String(cellValue !== undefined && cellValue !== null ? cellValue : '-')}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Expandable sub-view row content */}
                  {isExpanded && expandableRowRender && (
                    <TableRow className="bg-hover/20 hover:bg-hover/20" onClick={e => e.stopPropagation()}>
                      <TableCell colSpan={activeColumns.length + 2} className="px-10 py-4">
                        <div className="animate-fadeIn">
                          {expandableRowRender(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination controls footer */}
      {processedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={processedData.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default DataTable;
export { DataTable };
