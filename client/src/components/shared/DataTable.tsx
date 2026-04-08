import { useState } from 'react';
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
  onPageChange?: (page: number) => void;
  onSort?: (sort: string, order: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, data, pagination, isLoading, searchPlaceholder = 'Search...',
  onSearch, onPageChange, onSort, onRowClick, currentSort, currentOrder,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');

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
      const val = row[c.key];
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
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => onPageChange?.(pagination.page - 1)}>
              Previous
            </Button>
            <span className="px-2">Page {pagination.page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => onPageChange?.(pagination.page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
