import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
  key: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  loading,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  emptyTitle?: string
  emptyDescription?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
        <p className="font-semibold text-[#1d1d1d]">{emptyTitle}</p>
        {emptyDescription ? <p className="text-sm text-gray-500 mt-2">{emptyDescription}</p> : null}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#fff9f3] border-b border-orange-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-orange-50 last:border-0 hover:bg-[#fffaf6]/60">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
