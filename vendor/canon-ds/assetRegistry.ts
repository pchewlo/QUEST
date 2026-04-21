/**
 * ASSET REGISTRY — Canon design system.
 *
 * Canon is a minimal B2B SaaS in the Notion design language.
 * Adding an entry here makes it appear automatically on its respective page.
 */

export type Status = 'draft' | 'in-progress' | 'ready'

export interface BaseAsset {
  id: string
  name: string
  status: Status
  placeholder: boolean
  description: string
  replaceHint?: string
  docs?: {
    usage?: string
    donts?: string[]
    examples?: { label: string; code: string }[]
  }
}

export interface ColorAsset extends BaseAsset {
  hex: string
  token: string
}

export interface TypographyAsset extends BaseAsset {
  family: string
  size: string
  weight: string
  lineHeight: string
  purpose: string
  sample: string
}

export interface IconAsset extends BaseAsset {
  category: string
  icon: string
}

export interface ComponentAsset extends BaseAsset {
  section: 'Buttons' | 'Inputs' | 'Feedback' | 'Data Display' | 'Navigation' | 'Overlay'
}

export interface PatternAsset extends BaseAsset {
  slug: string
}

export interface PrototypeAsset extends BaseAsset {
  slug: string
  kind: 'web' | 'desktop'
}

/* ---------------------------------------------------------------- COLORS */
export const colors: ColorAsset[] = [
  // Surfaces
  { id: 'color-paper',     name: 'Paper',     token: '--bg-canvas',      hex: '#FFFFFF', status: 'ready', placeholder: false, description: 'App canvas and primary surface — pure white.' },
  { id: 'color-cream',     name: 'Cream',     token: '--bg-sunk',        hex: '#FBFBFA', status: 'ready', placeholder: false, description: 'Sunk surface — used for footer rows, code blocks, and the subtle shift behind content.' },
  { id: 'color-fog',       name: 'Fog',       token: '--bg-surface-alt', hex: '#F7F7F5', status: 'ready', placeholder: false, description: 'Alternate surface — hover states, chip backgrounds.' },
  { id: 'color-mist',      name: 'Mist',      token: '--canon-mist',     hex: '#F1F1EF', status: 'ready', placeholder: false, description: 'Compact chip backgrounds and tag fills.' },
  { id: 'color-cloud',     name: 'Cloud',     token: '--canon-cloud',    hex: '#E9E9E7', status: 'ready', placeholder: false, description: 'Rules and horizontal separators at their boldest.' },

  // Ink
  { id: 'color-ink',       name: 'Ink',       token: '--text-primary',   hex: '#37352F', status: 'ready', placeholder: false, description: 'Primary text — the signature warm near-black. Used for every headline and body.' },
  { id: 'color-graphite',  name: 'Graphite',  token: '--text-secondary', hex: '#5F5E5B', status: 'ready', placeholder: false, description: 'Secondary text for descriptions, labels, and supporting copy.' },
  { id: 'color-slate',     name: 'Slate',     token: '--canon-slate',    hex: '#787774', status: 'ready', placeholder: false, description: 'Icon fill and semi-muted text.' },
  { id: 'color-stone',     name: 'Stone',     token: '--text-muted',     hex: '#9B9A97', status: 'ready', placeholder: false, description: 'Muted metadata and placeholder copy.' },

  // Brand — institutional serif palette
  { id: 'color-canon-navy',      name: 'Ink Navy',       token: '--canon-navy',        hex: '#1A2332', status: 'ready', placeholder: false, description: 'Default brand color — used for the wordmark, primary buttons, and institutional signage.' },
  { id: 'color-canon-green',     name: 'Oxford Green',   token: '--canon-green',       hex: '#1D3A2F', status: 'ready', placeholder: false, description: 'Distinctive variant — use when you want to stand out in a vendor lineup.' },
  { id: 'color-canon-graphite',  name: 'Graphite',       token: '--canon-graphite',    hex: '#1F1E1C', status: 'ready', placeholder: false, description: 'Editorial / print variant.' },
  { id: 'color-canon-cream-brand', name: 'Cream',        token: '--canon-cream-brand', hex: '#F3EFE6', status: 'ready', placeholder: false, description: 'Brand surface and inverse mark color.' },
  { id: 'color-link',            name: 'Link Blue',      token: '--link',              hex: '#2383E2', status: 'ready', placeholder: false, description: 'Inline hyperlinks only — never used for primary actions.' },

  // Status
  { id: 'color-status-ready',    name: 'Status / Ready',     token: '--status-ready',        hex: '#448361', status: 'ready',       placeholder: false, description: 'Success / published / ready.' },
  { id: 'color-status-inprogress', name: 'Status / In-Progress', token: '--status-inprogress', hex: '#D9730D', status: 'in-progress', placeholder: false, description: 'Warning / in review / orange.' },
  { id: 'color-status-danger',   name: 'Status / Danger',    token: '--status-danger',       hex: '#D44C47', status: 'ready',       placeholder: false, description: 'Destructive actions and error states.' },
  { id: 'color-status-draft',    name: 'Status / Draft',     token: '--status-draft',        hex: '#9B9A97', status: 'draft',       placeholder: false, description: 'Neutral / not yet started.' },
]

/* -------------------------------------------------------------- TYPOGRAPHY */
export const typography: TypographyAsset[] = [
  { id: 'type-display',   name: 'Display',     family: 'var(--font-display)', size: '40px', weight: '700', lineHeight: '1.15', purpose: 'Marketing hero, empty-state titles', sample: 'Your team\'s second brain.', status: 'ready', placeholder: false, description: 'Inter Bold 40 / 1.15. Rare — reserved for hero moments.' },
  { id: 'type-h1',        name: 'Heading 1',   family: 'var(--font-display)', size: '32px', weight: '700', lineHeight: '1.2',  purpose: 'Page titles',                         sample: 'Workspace settings',          status: 'ready', placeholder: false, description: 'Inter Bold 32 / 1.2.' },
  { id: 'type-h2',        name: 'Heading 2',   family: 'var(--font-display)', size: '24px', weight: '600', lineHeight: '1.25', purpose: 'Section titles',                      sample: 'Members and access',           status: 'ready', placeholder: false, description: 'Inter SemiBold 24 / 1.25.' },
  { id: 'type-h3',        name: 'Heading 3',   family: 'var(--font-display)', size: '20px', weight: '600', lineHeight: '1.3',  purpose: 'Subsection titles, card titles',      sample: 'Q3 product roadmap',          status: 'ready', placeholder: false, description: 'Inter SemiBold 20 / 1.3.' },
  { id: 'type-h4',        name: 'Heading 4',   family: 'var(--font-display)', size: '16px', weight: '600', lineHeight: '1.35', purpose: 'Card header, list section title',     sample: 'Recent activity',             status: 'ready', placeholder: false, description: 'Inter SemiBold 16 / 1.35.' },
  { id: 'type-body-lg',   name: 'Body Large',  family: 'var(--font-sans)',    size: '15px', weight: '400', lineHeight: '1.55', purpose: 'Intro paragraphs',                    sample: 'What we\'re shipping this quarter.', status: 'ready', placeholder: false, description: 'Inter Regular 15 / 1.55.' },
  { id: 'type-body',      name: 'Body',        family: 'var(--font-sans)',    size: '14px', weight: '400', lineHeight: '1.5',  purpose: 'Default body copy',                   sample: 'Focused on collaboration and speed.', status: 'ready', placeholder: false, description: 'Inter Regular 14 / 1.5 — the default reading size.' },
  { id: 'type-body-sm',   name: 'Body Small',  family: 'var(--font-sans)',    size: '13px', weight: '400', lineHeight: '1.5',  purpose: 'Secondary copy, table cells',         sample: 'Updated 2 hours ago',         status: 'ready', placeholder: false, description: 'Inter Regular 13 / 1.5.' },
  { id: 'type-label',     name: 'Label',       family: 'var(--font-sans)',    size: '12px', weight: '500', lineHeight: '1.4',  purpose: 'Form labels, buttons',                sample: 'Workspace name',              status: 'ready', placeholder: false, description: 'Inter Medium 12 / 1.4.' },
  { id: 'type-caption',   name: 'Caption',     family: 'var(--font-sans)',    size: '11px', weight: '500', lineHeight: '1.4',  purpose: 'Uppercase eyebrows, metadata',        sample: 'DOCUMENT',                    status: 'ready', placeholder: false, description: 'Inter Medium 11 / 1.4 — uppercase with letter-spacing.' },
  { id: 'type-mono',      name: 'Mono',        family: 'var(--font-mono)',    size: '13px', weight: '400', lineHeight: '1.5',  purpose: 'Code and token values',               sample: 'const canon = true;',         status: 'ready', placeholder: false, description: 'JetBrains Mono 13 / 1.5.' },

  // Brand serif — for wordmark only
  { id: 'type-brand-wordmark', name: 'Brand Wordmark', family: 'var(--font-brand)', size: '36px', weight: '400', lineHeight: '1.0', purpose: 'Canon wordmark (brand use only)', sample: 'CANON', status: 'ready', placeholder: false, description: 'Iowan Old Style / Palatino / Georgia. Small-caps with 0.24em tracking. Never use this family for UI text.' },
]

/* ------------------------------------------------------------------- ICONS */
export const icons: IconAsset[] = [
  { id: 'icon-home',     name: 'Home',     icon: 'Home',       category: 'Navigation', status: 'ready', placeholder: false, description: 'Home / dashboard icon.' },
  { id: 'icon-search',   name: 'Search',   icon: 'Search',     category: 'Navigation', status: 'ready', placeholder: false, description: 'Search icon.' },
  { id: 'icon-settings', name: 'Settings', icon: 'Settings',   category: 'Navigation', status: 'ready', placeholder: false, description: 'Preferences icon.' },
  { id: 'icon-inbox',    name: 'Inbox',    icon: 'Inbox',      category: 'Navigation', status: 'ready', placeholder: false, description: 'Inbox / notifications.' },
  { id: 'icon-file',     name: 'File',     icon: 'FileText',   category: 'Content',    status: 'ready', placeholder: false, description: 'Document file.' },
  { id: 'icon-folder',   name: 'Folder',   icon: 'Folder',     category: 'Content',    status: 'ready', placeholder: false, description: 'Folder icon.' },
  { id: 'icon-image',    name: 'Image',    icon: 'Image',      category: 'Content',    status: 'ready', placeholder: false, description: 'Image file.' },
  { id: 'icon-plus',     name: 'Plus',     icon: 'Plus',       category: 'Action',     status: 'ready', placeholder: false, description: 'Add / create.' },
  { id: 'icon-trash',    name: 'Trash',    icon: 'Trash2',     category: 'Action',     status: 'ready', placeholder: false, description: 'Delete.' },
  { id: 'icon-edit',     name: 'Edit',     icon: 'Pencil',     category: 'Action',     status: 'ready', placeholder: false, description: 'Edit / modify.' },
  { id: 'icon-copy',     name: 'Copy',     icon: 'Copy',       category: 'Action',     status: 'ready', placeholder: false, description: 'Copy to clipboard.' },
  { id: 'icon-share',    name: 'Share',    icon: 'Share2',     category: 'Action',     status: 'ready', placeholder: false, description: 'Share.' },
  { id: 'icon-check',    name: 'Check',    icon: 'Check',      category: 'Status',     status: 'ready', placeholder: false, description: 'Success.' },
  { id: 'icon-x',        name: 'Close',    icon: 'X',          category: 'Status',     status: 'ready', placeholder: false, description: 'Close / dismiss.' },
  { id: 'icon-alert',    name: 'Alert',    icon: 'AlertTriangle', category: 'Status',  status: 'ready', placeholder: false, description: 'Warning.' },
  { id: 'icon-info',     name: 'Info',     icon: 'Info',       category: 'Status',     status: 'ready', placeholder: false, description: 'Informational.' },
  { id: 'icon-user',     name: 'User',     icon: 'User',       category: 'People',     status: 'ready', placeholder: false, description: 'User / profile.' },
  { id: 'icon-users',    name: 'Users',    icon: 'Users',      category: 'People',     status: 'ready', placeholder: false, description: 'Team / members.' },
  { id: 'icon-bell',     name: 'Bell',     icon: 'Bell',       category: 'Status',     status: 'ready', placeholder: false, description: 'Notifications.' },
]

export const iconCategories = ['All', 'Navigation', 'Action', 'Status', 'Content', 'People']

/* -------------------------------------------------------------- COMPONENTS */
export const components: ComponentAsset[] = [
  // Buttons
  { id: 'comp-button-primary',   name: 'Primary Button',   section: 'Buttons',       status: 'ready', placeholder: false, description: 'High-emphasis action. Canon blue background, white text.' },
  { id: 'comp-button-secondary', name: 'Secondary Button', section: 'Buttons',       status: 'ready', placeholder: false, description: 'Default action. Paper background with hairline border.' },
  { id: 'comp-button-ghost',     name: 'Ghost Button',     section: 'Buttons',       status: 'ready', placeholder: false, description: 'Borderless action for dense UIs (toolbars, tables).' },
  { id: 'comp-button-danger',    name: 'Danger Button',    section: 'Buttons',       status: 'ready', placeholder: false, description: 'Destructive action. Red background.' },

  // Inputs
  { id: 'comp-input-text',       name: 'Text Input',       section: 'Inputs',        status: 'ready', placeholder: false, description: 'Single-line text entry.' },
  { id: 'comp-input-textarea',   name: 'Textarea',         section: 'Inputs',        status: 'ready', placeholder: false, description: 'Multi-line text entry. Vertical resize only.' },
  { id: 'comp-input-select',     name: 'Select',           section: 'Inputs',        status: 'ready', placeholder: false, description: 'Dropdown selection.' },
  { id: 'comp-input-field',      name: 'Field',            section: 'Inputs',        status: 'ready', placeholder: false, description: 'Label + input wrapper with hint and error states.' },

  // Feedback
  { id: 'comp-feedback-badge',   name: 'Badge',            section: 'Feedback',      status: 'ready', placeholder: false, description: 'Compact status chip. Tones: neutral, brand, success, warning, danger.' },

  // Data Display
  { id: 'comp-data-avatar',      name: 'Avatar',           section: 'Data Display',  status: 'ready', placeholder: false, description: 'Initials avatar with deterministic color. Supports image src.' },
  { id: 'comp-data-table',       name: 'Table',            section: 'Data Display',  status: 'ready', placeholder: false, description: 'Generic, typed data table with hover rows.' },

  // Overlay
  { id: 'comp-overlay-modal',    name: 'Modal',            section: 'Overlay',       status: 'ready', placeholder: false, description: 'Blocking dialog. Escape to close, click backdrop to close.' },

  // Brand
  { id: 'comp-brand-wordmark',   name: 'Canon Wordmark',   section: 'Data Display',  status: 'ready', placeholder: false, description: 'The canonical brand mark. Small-caps serif with wide letter-spacing. Sizes XL/LG/MD/SM, colors navy/green/graphite/inverse.' },
  { id: 'comp-brand-cmark',      name: 'C Mark',           section: 'Data Display',  status: 'ready', placeholder: false, description: 'Companion serif C mark for favicons, avatars, and contexts where the full wordmark would render below 14px.' },
]

/* ----------------------------------------------------------------- PATTERNS */
export const patterns: PatternAsset[] = [
  { id: 'pat-navbar',     slug: 'nav-bar',     name: 'Nav Bar',     status: 'ready', placeholder: false, description: 'Horizontal top nav with brand, links, search, and user avatar.' },
  { id: 'pat-sidebar',    slug: 'sidebar',     name: 'Sidebar',     status: 'ready', placeholder: false, description: 'Workspace sidebar with switcher, main nav, and a collapsible pages section.' },
  { id: 'pat-card',       slug: 'card',        name: 'Card',        status: 'ready', placeholder: false, description: 'Rich content card with eyebrow, title, body, avatars, and meta strip.' },
  { id: 'pat-modal',      slug: 'modal',       name: 'Modal',       status: 'ready', placeholder: false, description: 'Invite-teammates dialog built from Modal + Field + Input primitives.' },
  { id: 'pat-datatable',  slug: 'data-table',  name: 'Data Table',  status: 'ready', placeholder: false, description: 'Tabular list of documents with owner, status, and last-updated columns.' },
  { id: 'pat-formlayout', slug: 'form-layout', name: 'Form Layout', status: 'ready', placeholder: false, description: 'Two-column settings layout: description left, inputs right.' },
  { id: 'pat-search',     slug: 'search',      name: 'Search',      status: 'ready', placeholder: false, description: 'Omnibar / command palette with grouped results (documents, people, tags).' },
]

/* --------------------------------------------------------------- PROTOTYPES */
export const prototypes: PrototypeAsset[] = [
  {
    id: 'proto-web-app',
    slug: 'web-app',
    name: 'Canon Web App',
    kind: 'web',
    status: 'in-progress',
    placeholder: false,
    description: 'Full-screen Canon workspace prototype — NavBar + Sidebar + document list.',
    replaceHint: 'Edit src/prototypes/WebAppPrototype.tsx to flesh out additional screens.',
  },
]

/* ---------------------------------------------------------------- AGGREGATE */
export function allAssets() {
  return [
    ...colors,
    ...typography,
    ...icons,
    ...components,
    ...patterns,
    ...prototypes,
  ]
}

export function stats() {
  const all = allAssets()
  const total = all.length
  const ready = all.filter((a) => a.status === 'ready').length
  const inProgress = all.filter((a) => a.status === 'in-progress').length
  const draft = all.filter((a) => a.status === 'draft').length
  const readyPct = total > 0 ? Math.round((ready / total) * 100) : 0
  return { total, ready, inProgress, draft, readyPct }
}

export function rollupStatus(items: BaseAsset[]): Status {
  if (items.some((i) => i.status === 'draft')) return 'draft'
  if (items.some((i) => i.status === 'in-progress')) return 'in-progress'
  return 'ready'
}
