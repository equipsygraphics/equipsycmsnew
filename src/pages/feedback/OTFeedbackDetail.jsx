import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User, MessageSquare, Briefcase, ClipboardList } from 'lucide-react'
import { mockOTFeedback, OT_QUESTIONS } from '../../data/mockOTFeedback'

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-text-muted" />}
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-text-primary">{value || '—'}</p>
    </div>
  )
}

function QuestionBlock({ label, subtitle, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</p>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// Single-select answer: show selected option as a filled pill
function RadioAnswer({ value, other }) {
  if (!value) return <p className="text-sm text-text-muted italic">No answer</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-brand-500 text-white border-brand-500">{value}</span>
      {other && <span className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-grey-100 text-text-secondary border-border">{other}</span>}
    </div>
  )
}

// Multi-select answer: show each selected item as a filled pill
function CheckboxAnswer({ values, other }) {
  if (!values?.length) return <p className="text-sm text-text-muted italic">No answer</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map(v => (
        <span key={v} className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-brand-500 text-white border-brand-500">{v}</span>
      ))}
      {other && <span className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-grey-100 text-text-secondary border-border">{other}</span>}
    </div>
  )
}

export function OTFeedbackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const feedback = mockOTFeedback.find(f => f.id === id) || mockOTFeedback[0]
  const { respondent, answers } = feedback
  const isAnon = !respondent.name

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/ot-feedback')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to OT Feedback
      </button>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-text-primary">
            {isAnon ? 'Anonymous Response' : respondent.name}
          </h1>
          <span className="text-xs font-medium text-text-muted bg-grey-100 border border-border px-2 py-0.5 rounded-full">{feedback.id}</span>
        </div>
        <p className="text-sm text-text-muted">
          Submitted {new Date(feedback.dateSubmitted).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Main */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Work context */}
          <SectionCard title="Work Context" icon={Briefcase}>
            <QuestionBlock label="Primary work setting" subtitle="Select one">
              <RadioAnswer value={answers.workSetting} other={answers.workSettingOther} />
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="Funding schemes worked with most" subtitle="Select all that apply">
              <CheckboxAnswer values={answers.fundingSchemes} other={answers.fundingSchemesOther} />
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="Scopes of work or quote requests per month" subtitle="Select one">
              <RadioAnswer value={answers.quotesPerMonth} />
            </QuestionBlock>
          </SectionCard>

          {/* Quoting process */}
          <SectionCard title="Quoting & Procurement Process" icon={ClipboardList}>
            <QuestionBlock label="Tools used to write scopes of work or procurement documents" subtitle="Select all that apply">
              <CheckboxAnswer values={answers.scopeTools} other={answers.scopeToolsOther} />
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="How service providers are found and selected" subtitle="Select all that apply">
              <CheckboxAnswer values={answers.findProviders} other={answers.findProvidersOther} />
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="Number of providers typically requested per job" subtitle="Select one">
              <RadioAnswer value={answers.quotesPerJob} />
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="Most frustrating parts of the quoting and procurement process" subtitle="Select all that apply">
              <CheckboxAnswer values={answers.frustrations} other={answers.frustrationsOther} />
            </QuestionBlock>
          </SectionCard>

          {/* Improvement suggestions */}
          <SectionCard title="Improvement Suggestions" icon={MessageSquare}>
            <QuestionBlock label="What aspect of your shopping experience could we improve?">
              {answers.improvements?.trim()
                ? <p className="text-sm text-text-primary leading-relaxed bg-grey-50 rounded-lg p-3 border border-border">{answers.improvements}</p>
                : <p className="text-sm text-text-muted italic">No suggestions provided.</p>
              }
            </QuestionBlock>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Respondent" icon={User}>
            {isAnon
              ? <p className="text-sm text-text-muted italic">Anonymous — no contact details provided.</p>
              : <>
                  <InfoRow label="Name" value={respondent.name} />
                  <InfoRow label="Email" value={respondent.email} />
                </>
            }
          </SectionCard>

          <SectionCard title="Submission">
            <InfoRow label="Response ID" value={feedback.id} />
            <InfoRow label="Date Submitted" value={new Date(feedback.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} />
          </SectionCard>

          {/* Quick summary */}
          <SectionCard title="At a Glance">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Work setting</span>
                <span className="text-text-primary font-medium text-right max-w-32 truncate" title={answers.workSetting}>{answers.workSetting}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Quotes/month</span>
                <span className="text-text-primary font-medium">{answers.quotesPerMonth}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Quotes/job</span>
                <span className="text-text-primary font-medium">{answers.quotesPerJob}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Funding schemes</span>
                <span className="text-text-primary font-medium">{answers.fundingSchemes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Frustrations listed</span>
                <span className="text-text-primary font-medium">{answers.frustrations.length}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
