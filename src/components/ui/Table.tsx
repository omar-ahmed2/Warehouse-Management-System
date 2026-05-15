import React, { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  searchKey?: keyof T;
}

export function Table<T extends { id: string | number }>({ 
  columns, 
  data, 
  onRowClick, 
  isLoading, 
  emptyMessage = 'لا توجد بيانات متاحة',
  searchKey
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (searchTerm && searchKey) {
      result = result.filter((item) => 
        String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, searchKey, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex flex-col w-full h-full bg-white border border-border-color rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-bg-primary/50 border-b border-border-color">
              {columns.map((column) => (
                <th 
                  key={String(column.key)}
                  className={`px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider font-Cairo ${column.sortable ? 'cursor-pointer hover:text-accent-primary transition-colors' : ''}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`opacity-40 transition-transform ${sortConfig?.key === column.key && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-6"><div className="h-4 bg-bg-secondary animate-pulse rounded w-full"></div></td>
                  ))}
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-text-muted font-bold font-Tajawal">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr 
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-bg-primary/40 transition-all group ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-5 text-[13px] text-accent-primary font-bold font-Tajawal tabular-nums">
                      {column.render ? column.render(item, index) : (item[column.key as keyof T] as unknown as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
