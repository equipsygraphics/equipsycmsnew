// Field types: text | email | phone | number | textarea | select | radio | checkbox | scale | yesno
// Each form has a list of versions. Structural edits create a new version; cosmetic edits (label text only) save in-place.
// Responses are linked to the specific versionId they were submitted against.

export const mockForms = [
  {
    id: 'form-1',
    name: 'Post-Checkout Feedback',
    description: 'Customer satisfaction survey sent 24h after an order is placed.',
    status: 'active',
    currentVersionId: 'fv-1-2',
    createdAt: '2025-01-15',
    versions: [
      {
        id: 'fv-1-1',
        versionNumber: 1,
        createdAt: '2025-01-15',
        archivedAt: '2026-03-10',
        viewCount: 198,
        responseCount: 89,
        fields: [
          { id: 'f1-1', type: 'text',     label: 'Full Name',                              required: false },
          { id: 'f1-2', type: 'email',    label: 'Email Address',                          required: true  },
          { id: 'f1-3', type: 'select',   label: 'What is your occupation?',               required: false, options: ['Builder / Certifier', 'Occupational Therapist', 'Carer / Support Worker', 'Home Owner', 'Other'] },
          { id: 'f1-4', type: 'select',   label: 'How did you hear about us?',             required: false, options: ['Google search', 'Social media', 'Referred by OT', 'Referred by builder', 'Word of mouth', 'Other'] },
          { id: 'f1-5', type: 'scale',    label: 'How easy was it to find the product?',  required: true,  min: 1, max: 5, minLabel: 'Very difficult', maxLabel: 'Very easy' },
          { id: 'f1-6', type: 'yesno',    label: 'Did you experience any technical issues?', required: false },
          { id: 'f1-7', type: 'textarea', label: 'Any suggestions for improvement?',       required: false },
        ],
      },
      {
        id: 'fv-1-2',
        versionNumber: 2,
        createdAt: '2026-03-10',
        archivedAt: null,
        viewCount: 186,
        responseCount: 47,
        fields: [
          { id: 'f2-1', type: 'text',     label: 'Full Name',                                    required: false },
          { id: 'f2-2', type: 'email',    label: 'Email Address',                                required: true  },
          { id: 'f2-3', type: 'select',   label: 'What is your occupation?',                     required: false, options: ['Builder / Certifier', 'Occupational Therapist', 'Carer / Support Worker', 'Home Owner', 'Other'] },
          { id: 'f2-4', type: 'select',   label: 'How did you hear about us?',                   required: false, options: ['Google search', 'Social media', 'Referred by OT', 'Referred by builder', 'Word of mouth', 'Other'] },
          { id: 'f2-5', type: 'scale',    label: 'How easy was it to find the product?',        required: true,  min: 1, max: 5, minLabel: 'Very difficult', maxLabel: 'Very easy' },
          { id: 'f2-6', type: 'scale',    label: 'How clear was the product information?',      required: false, min: 1, max: 5, minLabel: 'Not clear', maxLabel: 'Very clear' },
          { id: 'f2-7', type: 'yesno',    label: 'Did you experience any technical issues?',     required: false },
          { id: 'f2-8', type: 'yesno',    label: 'Did you contact our customer service team?',   required: false },
          { id: 'f2-9', type: 'textarea', label: 'Any suggestions for improvement?',             required: false },
        ],
      },
    ],
  },
  {
    id: 'form-2',
    name: 'OT Research Feedback',
    description: 'Research form for occupational therapists and support workers.',
    status: 'active',
    currentVersionId: 'fv-2-1',
    createdAt: '2025-06-01',
    versions: [
      {
        id: 'fv-2-1',
        versionNumber: 1,
        createdAt: '2025-06-01',
        archivedAt: null,
        viewCount: 315,
        responseCount: 42,
        fields: [
          { id: 'g1', type: 'text',     label: 'Name (optional)',               required: false },
          { id: 'g2', type: 'select',   label: 'Work setting',                  required: true,  options: ['Private practice', 'Hospital / Health service', 'NDIS provider', 'Aged care facility', 'Other'] },
          { id: 'g3', type: 'checkbox', label: 'Funding schemes you work with', required: false, options: ['NDIS', 'DVA', 'Aged Care Package', 'Private / Self-funded', 'Other'] },
          { id: 'g4', type: 'select',   label: 'Quotes requested per month',    required: false, options: ['0–5', '6–15', '16–30', '30+'] },
          { id: 'g5', type: 'scale',    label: 'Satisfaction with our quote process', required: false, min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' },
          { id: 'g6', type: 'checkbox', label: 'Key frustrations you face',     required: false, options: ['Slow turnaround', 'Missing product specs', 'Complicated checkout', 'No trade pricing visible', 'Lack of OT-specific guidance', 'Other'] },
          { id: 'g7', type: 'textarea', label: 'Suggestions for improvement',   required: false },
        ],
      },
    ],
  },
  {
    id: 'form-3',
    name: 'Ramp Calculator Feedback',
    description: 'Short embedded feedback form on the Ramp Calculator landing page.',
    status: 'active',
    currentVersionId: 'fv-3-1',
    createdAt: '2025-09-01',
    versions: [
      {
        id: 'fv-3-1',
        versionNumber: 1,
        createdAt: '2025-09-01',
        archivedAt: null,
        viewCount: 620,
        responseCount: 28,
        fields: [
          { id: 'h1', type: 'scale',    label: 'How useful was the ramp calculator?',               required: true,  min: 1, max: 5, minLabel: 'Not useful', maxLabel: 'Very useful' },
          { id: 'h2', type: 'yesno',    label: 'Did the calculator give you the info you needed?',  required: false },
          { id: 'h3', type: 'radio',    label: 'Which calculator did you use?',                     required: false, options: ['Ramp Depth Calculator', 'Ramp Gradient Calculator', 'Both'] },
          { id: 'h4', type: 'textarea', label: 'Any suggestions?',                                  required: false },
        ],
      },
    ],
  },
]

// Responses are linked to a specific formId + versionId
export const mockFormResponses = [
  // Form 1, Version 2 (current)
  {
    id: 'r-001', formId: 'form-1', versionId: 'fv-1-2',
    submittedAt: '2026-07-05T09:23:00',
    respondent: { name: 'Sarah Mitchell', email: 'sarah.mitchell@example.com' },
    answers: { 'f2-1': 'Sarah Mitchell', 'f2-2': 'sarah.mitchell@example.com', 'f2-3': 'Home Owner', 'f2-4': 'Google search', 'f2-5': 4, 'f2-6': 3, 'f2-7': false, 'f2-8': false, 'f2-9': 'Product descriptions could include more installation photos.' },
  },
  {
    id: 'r-002', formId: 'form-1', versionId: 'fv-1-2',
    submittedAt: '2026-07-04T14:07:00',
    respondent: { name: 'Michael Pham', email: 'mpham@buildco.com.au' },
    answers: { 'f2-1': 'Michael Pham', 'f2-2': 'mpham@buildco.com.au', 'f2-3': 'Builder / Certifier', 'f2-4': 'Referred by OT', 'f2-5': 5, 'f2-6': 4, 'f2-7': true, 'f2-8': true, 'f2-9': 'Login session timed out during checkout. Frustrating.' },
  },
  {
    id: 'r-003', formId: 'form-1', versionId: 'fv-1-2',
    submittedAt: '2026-07-03T11:45:00',
    respondent: { name: '', email: 'anon.user@email.com' },
    answers: { 'f2-1': '', 'f2-2': 'anon.user@email.com', 'f2-3': 'Carer / Support Worker', 'f2-4': 'Social media', 'f2-5': 3, 'f2-6': 3, 'f2-7': false, 'f2-8': false, 'f2-9': '' },
  },
  {
    id: 'r-004', formId: 'form-1', versionId: 'fv-1-2',
    submittedAt: '2026-07-02T16:30:00',
    respondent: { name: 'Donna Nguyen', email: 'donna.n@ndiscare.com.au' },
    answers: { 'f2-1': 'Donna Nguyen', 'f2-2': 'donna.n@ndiscare.com.au', 'f2-3': 'Occupational Therapist', 'f2-4': 'Word of mouth', 'f2-5': 5, 'f2-6': 5, 'f2-7': false, 'f2-8': false, 'f2-9': 'Love the range. More OT-specific filtering would help.' },
  },
  {
    id: 'r-005', formId: 'form-1', versionId: 'fv-1-2',
    submittedAt: '2026-07-01T08:55:00',
    respondent: { name: 'James Corby', email: 'jcorby@gmail.com' },
    answers: { 'f2-1': 'James Corby', 'f2-2': 'jcorby@gmail.com', 'f2-3': 'Home Owner', 'f2-4': 'Google search', 'f2-5': 2, 'f2-6': 2, 'f2-7': true, 'f2-8': true, 'f2-9': 'Payment page crashed once. CS team helped quickly.' },
  },

  // Form 1, Version 1 (archived)
  {
    id: 'r-006', formId: 'form-1', versionId: 'fv-1-1',
    submittedAt: '2026-01-15T10:00:00',
    respondent: { name: 'Jane Williams', email: 'jane@example.com' },
    answers: { 'f1-1': 'Jane Williams', 'f1-2': 'jane@example.com', 'f1-3': 'Home Owner', 'f1-4': 'Google search', 'f1-5': 4, 'f1-6': false, 'f1-7': 'Site was easy to use overall.' },
  },
  {
    id: 'r-007', formId: 'form-1', versionId: 'fv-1-1',
    submittedAt: '2026-02-10T09:20:00',
    respondent: { name: 'Paul Marchetti', email: 'paul.m@email.com' },
    answers: { 'f1-1': 'Paul Marchetti', 'f1-2': 'paul.m@email.com', 'f1-3': 'Builder / Certifier', 'f1-4': 'Referred by builder', 'f1-5': 3, 'f1-6': false, 'f1-7': '' },
  },

  // Form 2, Version 1
  {
    id: 'r-008', formId: 'form-2', versionId: 'fv-2-1',
    submittedAt: '2026-06-28T10:00:00',
    respondent: { name: 'Dr. Rachel Chen', email: 'rchen@privatepractice.com.au' },
    answers: { 'g1': 'Dr. Rachel Chen', 'g2': 'Private practice', 'g3': ['NDIS', 'Aged Care Package'], 'g4': '6–15', 'g5': 4, 'g6': ['Slow turnaround', 'No trade pricing visible'], 'g7': 'Would love a dedicated OT portal.' },
  },
  {
    id: 'r-009', formId: 'form-2', versionId: 'fv-2-1',
    submittedAt: '2026-06-25T13:40:00',
    respondent: { name: 'Mark Holt', email: 'mholt@ndiscare.com.au' },
    answers: { 'g1': '', 'g2': 'NDIS provider', 'g3': ['NDIS', 'DVA'], 'g4': '16–30', 'g5': 3, 'g6': ['Missing product specs', 'Complicated checkout'], 'g7': '' },
  },

  // Form 3, Version 1
  {
    id: 'r-010', formId: 'form-3', versionId: 'fv-3-1',
    submittedAt: '2026-07-01T15:20:00',
    respondent: { name: '', email: '' },
    answers: { 'h1': 5, 'h2': true, 'h3': 'Ramp Depth Calculator', 'h4': '' },
  },
  {
    id: 'r-011', formId: 'form-3', versionId: 'fv-3-1',
    submittedAt: '2026-06-29T11:05:00',
    respondent: { name: 'Chris Bauer', email: 'chris.b@gmail.com' },
    answers: { 'h1': 4, 'h2': true, 'h3': 'Both', 'h4': 'Would be great to save results.' },
  },
]
