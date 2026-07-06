import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle2, XCircle, RotateCcw, MessageSquare, Clock } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { mockEnquiries } from '../../data/mockEnquiries'

const STATUS_VARIANT = { open: 'warning', replied: 'info', closed: 'grey' }
const STATUS_LABEL   = { open: 'Open',    replied: 'Replied', closed: 'Closed' }

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function EnquiryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [enquiries, setEnquiries] = useState(mockEnquiries)
  const enquiry = enquiries.find(e => e.id === id)

  const [note, setNote] = useState('')
  const [showNoteBox, setShowNoteBox] = useState(false)

  if (!enquiry) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/enquiries')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Enquiries
        </button>
        <p className="text-sm text-text-muted">Enquiry not found.</p>
      </div>
    )
  }

  const update = (changes) => setEnquiries(prev => prev.map(e => e.id !== id ? e : { ...e, ...changes }))

  const addReply = () => {
    if (!note.trim()) return
    const reply = {
      id: `rep-${Date.now()}`,
      author: 'Admin',
      body: note.trim(),
      sentAt: new Date().toISOString(),
    }
    update({ replies: [...enquiry.replies, reply], status: 'replied' })
    setNote('')
    setShowNoteBox(false)
    toast('Note added and status set to Replied', 'success')
  }

  const markReplied = () => { update({ status: 'replied' }); toast('Marked as Replied', 'success') }
  const closeEnquiry = () => { update({ status: 'closed', closedAt: new Date().toISOString() }); toast('Enquiry closed', 'success') }
  const reopenEnquiry = () => { update({ status: 'open', closedAt: undefined, closedNote: undefined }); toast('Enquiry reopened', 'success') }

  const isClosed = enquiry.status === 'closed'

  return (
    <div className="flex gap-6 items-start">
      {/* Main column */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        <button onClick={() => navigate('/enquiries')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Enquiries
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{enquiry.subject}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              From {enquiry.name} · {formatDateTime(enquiry.submittedAt)}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[enquiry.status]} label={STATUS_LABEL[enquiry.status]} dot />
        </div>

        {/* Original message */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-grey-100 flex items-center justify-center text-sm font-semibold text-grey-500">
              {enquiry.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{enquiry.name}</p>
              <p className="text-xs text-text-muted">{enquiry.email}</p>
            </div>
          </div>
          <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed pl-9">
            {enquiry.message}
          </div>
        </div>

        {/* Reply log */}
        {enquiry.replies.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Replies</p>
            {enquiry.replies.map(reply => (
              <div key={reply.id} className="bg-brand-50 rounded-xl border border-brand-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-semibold text-white">A</div>
                    <span className="text-sm font-medium text-text-primary">{reply.author}</span>
                  </div>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(reply.sentAt)}
                  </span>
                </div>
                <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed pl-8">
                  {reply.body}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close note */}
        {isClosed && enquiry.closedNote && (
          <div className="bg-grey-50 rounded-xl border border-border p-4 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-grey-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-text-muted">Closed {enquiry.closedAt ? formatDate(enquiry.closedAt) : ''}</p>
              <p className="text-sm text-text-muted mt-0.5">{enquiry.closedNote}</p>
            </div>
          </div>
        )}

        {/* Add reply / note */}
        {!isClosed && (
          showNoteBox ? (
            <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-text-primary">Add Note</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={5}
                placeholder="Type your reply or internal note…"
                className="w-full px-3 py-2 bg-grey-50 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowNoteBox(false); setNote('') }}>Cancel</Button>
                <Button variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={addReply}>Add Note</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNoteBox(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-text-muted hover:text-brand-600 hover:border-brand-300 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Add reply or note…
            </button>
          )
        )}
      </div>

      {/* Sidebar */}
      <div className="w-64 flex flex-col gap-4 shrink-0">
        {/* Contact info */}
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Contact</p>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-text-muted">Name</p>
              <p className="text-sm text-text-primary font-medium">{enquiry.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm text-text-primary break-all">{enquiry.email}</p>
            </div>
            {enquiry.phone && (
              <div>
                <p className="text-xs text-text-muted">Phone</p>
                <p className="text-sm text-text-primary">{enquiry.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status & actions */}
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Status</p>
          <Badge variant={STATUS_VARIANT[enquiry.status]} label={STATUS_LABEL[enquiry.status]} dot />
          <div className="flex flex-col gap-2 pt-1">
            {enquiry.status === 'open' && (
              <button
                onClick={markReplied}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-2 rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Replied
              </button>
            )}
            {!isClosed && (
              <button
                onClick={closeEnquiry}
                className="flex items-center gap-1.5 text-xs font-medium text-grey-500 hover:text-grey-700 px-3 py-2 rounded-lg border border-border hover:bg-grey-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Close Enquiry
              </button>
            )}
            {isClosed && (
              <button
                onClick={reopenEnquiry}
                className="flex items-center gap-1.5 text-xs font-medium text-warning-600 hover:text-warning-700 px-3 py-2 rounded-lg border border-warning-200 hover:bg-warning-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reopen
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Timeline</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0 mt-1.5" />
              <div>
                <p className="text-xs text-text-secondary">Submitted</p>
                <p className="text-xs text-text-muted">{formatDate(enquiry.submittedAt)}</p>
              </div>
            </div>
            {enquiry.replies.map(reply => (
              <div key={reply.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5" />
                <div>
                  <p className="text-xs text-text-secondary">Reply added</p>
                  <p className="text-xs text-text-muted">{formatDate(reply.sentAt)}</p>
                </div>
              </div>
            ))}
            {enquiry.closedAt && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-grey-300 shrink-0 mt-1.5" />
                <div>
                  <p className="text-xs text-text-secondary">Closed</p>
                  <p className="text-xs text-text-muted">{formatDate(enquiry.closedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
