interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps {
  title?: string;
  columns: TableColumn[];
  data: any[];
  className?: string;
  maxHeight?: string;
  showIndex?: boolean;
  emptyMessage?: string;
}

export function Table({ 
  title, 
  columns, 
  data, 
  className = "", 
  maxHeight = "400px",
  showIndex = false,
  emptyMessage = "No data available"
}: TableProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-32 text-gray-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {title && (
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      
      <div className="p-6">
        <div 
          className="overflow-auto rounded-lg border border-gray-700"
          style={{ maxHeight }}
        >
          <table className="w-full">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                {showIndex && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider ${
                      column.align === 'center' ? 'text-center' :
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data.map((row, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-750 transition-colors duration-150"
                >
                  {showIndex && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {index + 1}
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 whitespace-nowrap text-sm text-gray-300 ${
                        column.align === 'center' ? 'text-center' :
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
