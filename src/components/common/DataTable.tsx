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
  loadingMessage?: string;
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
  emptyMessage = 'No records yet.',
  loadingMessage = 'Loading…',
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
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-sand-50 border border-sand-300 text-ink placeholder-ink-faint rounded-lg text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
            />
          </div>
          <div className="text-xs font-mono text-ink-muted">
            Records: <span className="text-ink font-semibold">{sortedData.length}</span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-sand-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-100 font-sans text-xs font-medium tracking-normal text-ink-muted">
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
                      col.sortable ? 'cursor-pointer hover:text-ink transition-colors' : ''
                    )}
                  >
                    <div className={cn('flex items-center space-x-1.5', col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start')}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-ink-faint">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-olive-700" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-olive-700" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200 text-sm text-ink">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-ink">{loadingMessage}</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center"
                >
                  <p className="text-sm font-medium text-ink">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'transition-colors duration-100',
                    index % 2 === 0 ? 'bg-sand-50' : 'bg-sand-100/70',
                    onRowClick
                      ? 'cursor-pointer hover:bg-olive-50'
                      : 'hover:bg-sand-100'
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
        <div className="flex items-center justify-between px-1 text-sm text-ink-muted">
          <div>
            Showing <span className="text-ink font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-ink font-medium">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="text-ink font-medium">{sortedData.length}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 text-ink">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
