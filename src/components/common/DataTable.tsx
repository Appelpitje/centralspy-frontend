import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No tactical records located.',
  searchPlaceholder = 'Search records...',
  enableSearch = false,
  searchFilter,
  pageSize = 10,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter
  const filteredData = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, q));
    }
    return data.filter((item) =>
      Object.values(item as Record<string, any>).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  }, [data, searchQuery, enableSearch, searchFilter]);

  // 2. Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = col.sortValue ? col.sortValue(a) : (a as any)[sortKey];
      let bVal = col.sortValue ? col.sortValue(b) : (b as any)[sortKey];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      {/* Search Bar */}
      {enableSearch && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-carbon-900 border border-carbon-700 text-gray-200 placeholder-gray-500 rounded-sm text-xs font-mono pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
          <div className="text-xs font-mono text-gray-400">
            TOTAL RECORDS: <span className="text-cyan-400 font-semibold">{sortedData.length}</span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-sm border border-carbon-800 bg-carbon-950/60 shadow-hud-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-carbon-800 bg-carbon-900/80 font-mono text-[11px] uppercase tracking-wider text-gray-400">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={cn(
                      'px-4 py-3 font-semibold select-none',
                      col.align ? alignClasses[col.align] : 'text-left',
                      col.sortable ? 'cursor-pointer hover:text-cyan-400 transition-colors' : ''
                    )}
                  >
                    <div className={cn('flex items-center space-x-1.5', col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start')}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-500">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800/60 text-xs font-mono text-gray-300">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-carbon-900/20">
                  {columns.map((_, cIdx) => (
                    <td key={`cell-${i}-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-3.5 bg-carbon-800/80 rounded-sm w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 font-mono text-xs tracking-wider uppercase"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-2xl">⚡</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'transition-colors duration-100',
                    index % 2 === 0 ? 'bg-carbon-950/40' : 'bg-carbon-900/20',
                    onRowClick
                      ? 'cursor-pointer hover:bg-cyan-950/30 hover:text-cyan-200'
                      : 'hover:bg-carbon-800/40'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap',
                        col.align ? alignClasses[col.align] : 'text-left'
                      )}
                    >
                      {col.render
                        ? col.render(item, (currentPage - 1) * pageSize + index)
                        : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-xs font-mono text-gray-400">
          <div>
            Showing <span className="text-gray-200 font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-gray-200 font-medium">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="text-gray-200 font-medium">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white hover:border-carbon-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 bg-carbon-900 border border-carbon-700 text-cyan-400 rounded-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white hover:border-carbon-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
