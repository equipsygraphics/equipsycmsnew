function daysAgo(n) {
  const d = new Date('2026-07-03')
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const OT_WORK_SETTINGS = [
  'Private practice (sole)',
  'Private practice (team / group)',
  'Hospital / health service',
  'Community health / outreach',
  'NDIS provider organisation',
  'Other',
]

export const OT_FUNDING_SCHEMES = [
  'NDIS',
  'Support at Home / HCP',
  'CHSP',
  "DVA",
  'SWEP',
  'TAC / WorkCover',
  'Private / self-funded',
  'Other',
]

export const OT_QUOTES_PER_MONTH = ['Fewer than 5', '5–10', '11–20', '21–40', 'More than 40']

export const OT_SCOPE_TOOLS = [
  'Microsoft Word / Google Docs',
  'Excel / Spreadsheet',
  'Standard funding template (e.g., NDIS)',
  'Company/organisation template',
  'Annotate image/photo',
  'Other',
]

export const OT_FIND_PROVIDERS = [
  'Existing relationships / word of mouth',
  'Google / online search',
  'Recommendations from colleagues',
  'Industry directories or associations',
  'Provider contacted me directly',
  'Other',
]

export const OT_QUOTES_PER_JOB = [
  '1 (I have a go-to)',
  '2–3',
  '4–5',
  'More than 5',
  'It varies too much to say',
]

export const OT_FRUSTRATIONS = [
  'Writing the scope of work / requirements document',
  'Finding providers with the right credentials',
  'Getting quotes back in a timely manner',
  'Comparing quotes in different formats',
  'Tracking project status after a quote is accepted',
  'Meeting funding body documentation requirements',
  'Communicating changes or revisions with providers',
  'Keeping an audit trail for compliance',
  'Other',
]

export const OT_QUESTIONS = [
  { id: 'workSetting',     label: "What's your primary work setting?",                                                        type: 'radio',    options: OT_WORK_SETTINGS },
  { id: 'fundingSchemes',  label: 'Which funding schemes do you work with most?',                                              type: 'checkbox', options: OT_FUNDING_SCHEMES },
  { id: 'quotesPerMonth',  label: 'Roughly how many scopes of work or quote requests do you prepare per month?',               type: 'radio',    options: OT_QUOTES_PER_MONTH },
  { id: 'scopeTools',      label: 'What tools do you currently use to write scopes of work or procurement documents?',         type: 'checkbox', options: OT_SCOPE_TOOLS },
  { id: 'findProviders',   label: 'How do you currently find and select service providers (builders, suppliers) for a job?',   type: 'checkbox', options: OT_FIND_PROVIDERS },
  { id: 'quotesPerJob',    label: 'How many service providers do you typically request quotes from per job?',                   type: 'radio',    options: OT_QUOTES_PER_JOB },
  { id: 'frustrations',    label: "What's the most frustrating part of the quoting and procurement process?",                  type: 'checkbox', options: OT_FRUSTRATIONS },
  { id: 'improvements',   label: 'What aspect of your shopping experience could we improve?',                                  type: 'text' },
]

export const mockOTFeedback = [
  {
    id: 'OT-001',
    dateSubmitted: daysAgo(1),
    respondent: { name: 'Sarah Chen', email: 'sarah.chen@mobilityot.com.au' },
    answers: {
      workSetting: 'Private practice (sole)', workSettingOther: null,
      fundingSchemes: ['NDIS', 'Support at Home / HCP'], fundingSchemesOther: null,
      quotesPerMonth: '5–10',
      scopeTools: ['Microsoft Word / Google Docs', 'Company/organisation template'], scopeToolsOther: null,
      findProviders: ['Existing relationships / word of mouth', 'Recommendations from colleagues'], findProvidersOther: null,
      quotesPerJob: '2–3',
      frustrations: ['Getting quotes back in a timely manner', 'Comparing quotes in different formats', 'Keeping an audit trail for compliance'], frustrationsOther: null,
      improvements: 'A centralised platform where I can send a scope and get multiple quotes back in a standard format would save me hours each week.',
    },
  },
  {
    id: 'OT-002',
    dateSubmitted: daysAgo(2),
    respondent: { name: 'James Okafor', email: 'j.okafor@ndisot.com.au' },
    answers: {
      workSetting: 'NDIS provider organisation', workSettingOther: null,
      fundingSchemes: ['NDIS'], fundingSchemesOther: null,
      quotesPerMonth: '21–40',
      scopeTools: ['Standard funding template (e.g., NDIS)', 'Company/organisation template'], scopeToolsOther: null,
      findProviders: ['Existing relationships / word of mouth', 'Provider contacted me directly'], findProvidersOther: null,
      quotesPerJob: '1 (I have a go-to)',
      frustrations: ['Meeting funding body documentation requirements', 'Tracking project status after a quote is accepted'], frustrationsOther: null,
      improvements: 'Better integration with NDIS portals would be the single biggest improvement.',
    },
  },
  {
    id: 'OT-003',
    dateSubmitted: daysAgo(3),
    respondent: { name: null, email: null },
    answers: {
      workSetting: 'Private practice (team / group)', workSettingOther: null,
      fundingSchemes: ['NDIS', 'Support at Home / HCP', 'CHSP'], fundingSchemesOther: null,
      quotesPerMonth: '11–20',
      scopeTools: ['Microsoft Word / Google Docs', 'Annotate image/photo'], scopeToolsOther: null,
      findProviders: ['Google / online search', 'Recommendations from colleagues', 'Industry directories or associations'], findProvidersOther: null,
      quotesPerJob: '2–3',
      frustrations: ['Writing the scope of work / requirements document', 'Finding providers with the right credentials', 'Getting quotes back in a timely manner'], frustrationsOther: null,
      improvements: 'Pre-populated product specs and pricing on quote requests would help a lot.',
    },
  },
  {
    id: 'OT-004',
    dateSubmitted: daysAgo(5),
    respondent: { name: 'Priya Ramaswamy', email: null },
    answers: {
      workSetting: 'Hospital / health service', workSettingOther: null,
      fundingSchemes: ['DVA', 'SWEP', 'Private / self-funded'], fundingSchemesOther: null,
      quotesPerMonth: 'Fewer than 5',
      scopeTools: ['Microsoft Word / Google Docs', 'Standard funding template (e.g., NDIS)'], scopeToolsOther: null,
      findProviders: ['Recommendations from colleagues', 'Industry directories or associations'], findProvidersOther: null,
      quotesPerJob: '4–5',
      frustrations: ['Comparing quotes in different formats', 'Meeting funding body documentation requirements'], frustrationsOther: null,
      improvements: '',
    },
  },
  {
    id: 'OT-005',
    dateSubmitted: daysAgo(7),
    respondent: { name: 'Liam Burke', email: 'liam.burke@communityhealth.vic.gov.au' },
    answers: {
      workSetting: 'Community health / outreach', workSettingOther: null,
      fundingSchemes: ['CHSP', 'TAC / WorkCover', 'Private / self-funded'], fundingSchemesOther: null,
      quotesPerMonth: '5–10',
      scopeTools: ['Excel / Spreadsheet', 'Company/organisation template'], scopeToolsOther: null,
      findProviders: ['Existing relationships / word of mouth', 'Google / online search'], findProvidersOther: null,
      quotesPerJob: '2–3',
      frustrations: ['Communicating changes or revisions with providers', 'Keeping an audit trail for compliance', 'Tracking project status after a quote is accepted'], frustrationsOther: null,
      improvements: 'Automatic email notifications when a quote is updated or confirmed would be very helpful.',
    },
  },
  {
    id: 'OT-006',
    dateSubmitted: daysAgo(10),
    respondent: { name: null, email: null },
    answers: {
      workSetting: 'Private practice (sole)', workSettingOther: null,
      fundingSchemes: ['NDIS', 'Support at Home / HCP'], fundingSchemesOther: null,
      quotesPerMonth: '5–10',
      scopeTools: ['Microsoft Word / Google Docs', 'Annotate image/photo', 'Other'], scopeToolsOther: 'Voice memos then transcribe',
      findProviders: ['Existing relationships / word of mouth'], findProvidersOther: null,
      quotesPerJob: '1 (I have a go-to)',
      frustrations: ['Getting quotes back in a timely manner', 'Finding providers with the right credentials'], frustrationsOther: null,
      improvements: 'Verified provider profiles showing their credentials, insurance, and response times would make choosing much easier.',
    },
  },
  {
    id: 'OT-007',
    dateSubmitted: daysAgo(14),
    respondent: { name: 'Fiona Mackay', email: 'fiona.m@otpractice.com.au' },
    answers: {
      workSetting: 'Private practice (team / group)', workSettingOther: null,
      fundingSchemes: ['NDIS', 'Support at Home / HCP', 'DVA', 'Private / self-funded'], fundingSchemesOther: null,
      quotesPerMonth: '21–40',
      scopeTools: ['Company/organisation template', 'Standard funding template (e.g., NDIS)'], scopeToolsOther: null,
      findProviders: ['Existing relationships / word of mouth', 'Recommendations from colleagues', 'Provider contacted me directly'], findProvidersOther: null,
      quotesPerJob: 'It varies too much to say',
      frustrations: ['Writing the scope of work / requirements document', 'Comparing quotes in different formats', 'Meeting funding body documentation requirements', 'Communicating changes or revisions with providers'], frustrationsOther: null,
      improvements: 'Structured quote templates that I can send to any provider and get back a comparable response would be a game changer.',
    },
  },
  {
    id: 'OT-008',
    dateSubmitted: daysAgo(18),
    respondent: { name: 'Marcus Tran', email: 'marcus.tran@accessot.com.au' },
    answers: {
      workSetting: 'Other', workSettingOther: 'Telehealth / remote OT consultancy',
      fundingSchemes: ['NDIS', 'SWEP'], fundingSchemesOther: null,
      quotesPerMonth: '11–20',
      scopeTools: ['Microsoft Word / Google Docs', 'Excel / Spreadsheet'], scopeToolsOther: null,
      findProviders: ['Google / online search', 'Industry directories or associations', 'Recommendations from colleagues'], findProvidersOther: null,
      quotesPerJob: '2–3',
      frustrations: ['Getting quotes back in a timely manner', 'Keeping an audit trail for compliance', 'Writing the scope of work / requirements document'], frustrationsOther: null,
      improvements: 'A supplier directory filtered by location, funding scheme support, and product category would save enormous research time.',
    },
  },
]
