import { Table, type TableColumn } from '../components/Table'
import { Badge } from '../components/Badge'
import { Avatar } from '../components/Avatar'

interface Doc {
  id: string
  title: string
  owner: string
  status: 'Draft' | 'In review' | 'Published'
  updated: string
}

const rows: Doc[] = [
  { id: '1', title: 'Q3 product roadmap',    owner: 'Ada Lovelace', status: 'Published', updated: '2h ago' },
  { id: '2', title: 'Pricing page redesign', owner: 'Grace Hopper', status: 'In review', updated: 'Yesterday' },
  { id: '3', title: 'Onboarding flow v4',    owner: 'Alan Turing',  status: 'Draft',     updated: '3 days ago' },
  { id: '4', title: 'Brand voice guide',     owner: 'Katherine Johnson', status: 'Published', updated: 'Apr 18' },
  { id: '5', title: 'Team OKRs — Q3',        owner: 'Linus Torvalds', status: 'Draft',   updated: 'Apr 12' },
]

const columns: TableColumn<Doc>[] = [
  {
    key: 'title',
    header: 'Title',
    render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span>,
  },
  {
    key: 'owner',
    header: 'Owner',
    render: (r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.owner} size={20} />
        {r.owner}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => {
      const tone = r.status === 'Published' ? 'success'
                 : r.status === 'In review' ? 'warning'
                 : 'neutral'
      return <Badge tone={tone as 'success' | 'warning' | 'neutral'}>{r.status}</Badge>
    },
  },
  {
    key: 'updated',
    header: 'Updated',
    align: 'right',
    render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.updated}</span>,
    width: 120,
  },
]

export function DataTablePattern() {
  return (
    <div style={{ width: '100%', maxWidth: 780 }}>
      <Table
        columns={columns}
        data={rows}
        getRowKey={(r) => r.id}
        onRowClick={() => {}}
      />
    </div>
  )
}
