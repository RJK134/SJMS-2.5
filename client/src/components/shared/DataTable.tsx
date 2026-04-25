import { useState, useRef, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Download, Loader2 } from 'lucide-react';
import type { Pagination } from '@/types/api';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: Pagination;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (search: string) => void;
  onPageChange?: (cursor: string | null) => void;
  onSort?: (sort: string, order: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  emptyMessage?: string;
  /** Infinite scroll: is more data being fetched? */
  isFetchingMore?: boolean;
  /** Infinite scroll: are there more pages to load? */
  hasMore?: boolean;
  /** Infinite scroll: callback to load next page */
  onLoadMore?: () => void;
}

export default function DataTable<T extends object>({
  columns, data, pagination, isLoading, searchPlaceholder = 'Search...',
  onSearch, onPageChange, onSort, onRowClick, currentSort, currentOrder,
  emptyMessage = 'No records found',
  isFetchingMore, hasMore, onLoadMore,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion for accessible fallback
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting && hasMore && !isFetchingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore]);

  useEffect(() => {
    if (prefersReducedMotion || !onLoadMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleIntersect, prefersReducedMotion, onLoadMore]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = currentSort === key && currentOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (currentSort !== columnKey) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return currentOrder === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const exportCsv = () => {
    const header = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => {
      const val = (row as Record<string, unknown>)[c.key];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
    }).join(','));
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search + Export */}
      <div className="flex items-center justify-between gap-4">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className={`${col.className ?? ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-centre">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow
                  key={(row as Record<string, unknown>).id as string ?? i}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Infinite scroll sentinel + fallback button */}
      {onLoadMore && hasMore && (
        <>
          {/* Auto-scroll sentinel (hidden for reduced motion) */}
          {!prefersReducedMotion && <div ref={sentinelRef} className="h-1" />}
          {/* Loading spinner or manual button */}
          <div className="flex justify-center py-2">
            {isFetchingMore ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : prefersReducedMotion ? (
              <Button variant="outline" size="sm" onClick={onLoadMore}>Load more</Button>
            ) : null}
          </div>
        </>
      )}

      {/* Legacy cursor pagination (for pages not yet migrated to useInfiniteList) */}
      {!onLoadMore && pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {Math.min(data.length, pagination.total)} of {pagination.total} records
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.nextCursor)}
            >
              Load more
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
