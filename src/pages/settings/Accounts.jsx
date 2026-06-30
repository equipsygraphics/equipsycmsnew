import { useState } from 'react'
import { Plus, Edit2, Trash2, Shield, User } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Select, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'

const ROLES = ['Admin', 'Editor', 'Viewer']

const ROLE_PERMS = {
  Admin: 'Full access â€” manage all settings, users, and content',
  Editor: 'Manage products, orders, customers, and content',
  Viewer: 'Read-only access to all sections',
}

const mockUsers = [
  { id: 1, name: 'Krist S.', email: 'graphics@equipsy.com.au', role: 'Admin', status: 'active', lastLogin: '24 Jun 2026', you: true },
  { id: 2, name: 'Sarah M.', email: 'sarah@equipsy.com.au', role: 'Editor', status: 'active', lastLogin: '23 Jun 2026', you: false },
  { id: 3, name: 'Tom K.', email: 'tom@equipsy.com.au', role: 'Editor', status: 'active', lastLogin: '22 Jun 2026', you: false },
  { id: 4, name: 'Jess T.', email: 'jess@equipsy.com.au', role: 'Viewer', status: 'inactive', lastLogin: '1 Jun 2026', you: false },
]

const EMPTY = { name: '', email: '', role: 'Editor', status: 'active', sendInvite: true }

export function Accounts() {
  const [users, setUsers] = useState(mockUsers)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openNew = () => { setEditing({ ...EMPTY }); setDrawerOpen(true) }
  const openEdit = (u) => { setEditing({ ...u }); setDrawerOpen(true) }

  const handleSave = () => {
    if (!editing.name.trim() || !editing.email.trim()) { toast('Name and email are required', 'error'); return }
    if (editing.id) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...editing } : u))
      toast(`${editing.name} updated`, 'success')
    } else {
      setUsers(prev => [...prev, { ...editing, id: Date.now(), lastLogin: 'â€”', you: false }])
      toast(editing.sendInvite ? `Invite sent to ${editing.email}` : `${editing.name} added`, 'success')
    }
    setDrawerOpen(false)
  }

  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts & Users"
        subtitle={`${users.filter(u => u.status === 'active').length} active users`}
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>Invite User</Button>}
      />

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Team Members</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['User', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary flex items-center gap-1.5">
                        {u.name}
                        {u.you && <span className="text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded font-semibold">You</span>}
                      </p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    {u.role === 'Admin' ? <Shield className="w-3.5 h-3.5 text-brand-500" /> : <User className="w-3.5 h-3.5 text-text-muted" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-text-muted">{u.lastLogin}</td>
                <td className="px-5 py-3.5"><Badge variant={u.status === 'active' ? 'success' : 'default'} label={u.status === 'active' ? 'Active' : 'Inactive'} dot /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"><Edit2 className="w-4 h-4" /></button>
                    {!u.you && <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role legend */}
      <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-text-primary">Role Permissions</p>
        {ROLES.map(role => (
          <div key={role} className="flex items-start gap-3">
            <span className="text-xs font-semibold text-brand-500 w-12 mt-0.5">{role}</span>
            <p className="text-xs text-text-muted">{ROLE_PERMS[role]}</p>
          </div>
        ))}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing?.id ? `Edit User` : 'Invite User'}>
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Full Name" required><Input value={editing.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sarah M." /></Field>
            <Field label="Email" required><Input type="email" value={editing.email} onChange={e => set('email', e.target.value)} placeholder="user@equipsy.com.au" /></Field>
            <Field label="Role">
              <Select value={editing.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </Select>
              <p className="text-xs text-text-muted mt-1">{ROLE_PERMS[editing.role]}</p>
            </Field>
            <Field label="Status">
              <Select value={editing.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
            {!editing.id && <Toggle label="Send email invitation" checked={editing.sendInvite ?? true} onChange={v => set('sendInvite', v)} />}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>{editing.id ? 'Save Changes' : 'Send Invite'}</Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { setUsers(prev => prev.filter(u => u.id !== deleteTarget.id)); toast(`${deleteTarget?.name} removed`, 'success'); setDeleteTarget(null) }}
        title="Remove user" message={`Remove ${deleteTarget?.name} from the team? They will lose access immediately.`} confirmLabel="Remove" destructive />
    </div>
  )
}
