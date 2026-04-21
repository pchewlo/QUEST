import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  width?: string | number
  align?: 'left' | 'right' | 'center'
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  getRowKey: (row: T, i: number) => string
  onRowClick?: (row: T) => void
}

/** Simple, Notion-style table. Sticky header, hover rows, subtle separators. */
export function Table<T>({ columns, data, getRowKey, onRowClick }: TableProps<T>) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
        <thead>
          <tr style={{ background: 'var(--bg-sunk)' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align ?? 'left',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  borderBottom: '1px solid var(--border-subtle)',
                  width: c.width,
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 100ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align ?? 'left',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: 'var(--space-6)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
