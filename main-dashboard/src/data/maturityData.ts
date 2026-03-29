// ─────────────────────────────────────────────────────────────
//  WORKable Maturity Intelligence — Data Layer
//  All department definitions, questionnaires, level metadata,
//  ROI data, blocker relations, and shadow maturity benchmarks.
// ─────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  text: string;
  category: string;
}

export interface DepartmentDef {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  questions: Question[];
  isSpecial?: boolean;
}

export interface DepartmentScore {
  departmentId: string;
  answers: Record<string, number>;
  score: number;          // 1–5 average
  completedAt: string;
}

export type ScoresMap = Record<string, DepartmentScore>;

export interface MaturityLevelDef {
  name: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characteristics: string[];
}

export interface BlockerRelation {
  from: string;
  to: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

// ── Maturity level metadata ─────────────────────────────────
export const MATURITY_LEVELS: Record<number, MaturityLevelDef> = {
  1: {
    name: 'Emergent',
    tagline: 'Reactive & undefined',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.22)',
    description: 'Processes are ad-hoc and unpredictable. Success depends on individual heroics rather than systems.',
    characteristics: [
      'No documented or standardized processes',
      'Purely reactive — problems addressed after they occur',
      'High key-person risk, no redundancy',
      'No KPIs or metrics tracked',
      'Siloed decisions with no cross-functional view',
    ],
  },
  2: {
    name: 'Developing',
    tagline: 'Aware but inconsistent',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.22)',
    description: 'Awareness of the need for structure exists, but execution is inconsistent and improvement initiatives often stall.',
    characteristics: [
      'Some processes exist but are inconsistently applied',
      'Basic metrics tracked but rarely acted upon',
      'Improvement efforts start but rarely reach completion',
      'Cross-functional friction slows decisions',
      'Leadership recognizes gaps but lacks a clear plan',
    ],
  },
  3: {
    name: 'Defined',
    tagline: 'Standardized & consistent',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.22)',
    description: 'Core processes are documented, standardized, and consistently executed. Metrics are tracked and drive decisions.',
    characteristics: [
      'All major processes documented and routinely followed',
      'KPIs reviewed regularly and acted upon',
      'Structured cross-functional collaboration',
      'Technology meaningfully supports key workflows',
      'Decisions are data-informed at all levels',
    ],
  },
  4: {
    name: 'Advanced',
    tagline: 'Data-driven & optimizing',
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.08)',
    borderColor: 'rgba(6,182,212,0.22)',
    description: 'Predictive capabilities and continuous optimization define every operation. Data drives strategy, not just reporting.',
    characteristics: [
      'Predictive analytics actively inform decisions',
      'Continuous improvement is cultural, not just programmatic',
      'Deep cross-system and cross-function integration',
      'Innovation happens within existing operations',
      'Performance is benchmarked against industry leaders',
    ],
  },
  5: {
    name: 'Transcendent',
    tagline: 'Self-evolving & industry-leading',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.08)',
    borderColor: 'rgba(139,92,246,0.22)',
    description: 'Sets the industry standard. Capability compounds autonomously. Competitors benchmark against this organisation.',
    characteristics: [
      'Sets benchmarks that others in the industry follow',
      'Self-optimizing systems require minimal intervention',
      'Talent is attracted by reputation alone',
      'External recognition as a category leader',
      'Capability is a durable competitive moat',
    ],
  },
};

// ── Department definitions ───────────────────────────────────
export const DEPARTMENTS: DepartmentDef[] = [
  {
    id: 'hr',
    name: 'HR & People',
    shortName: 'HR',
    color: '#f472b6',
    bgColor: 'rgba(244,114,182,0.08)',
    borderColor: 'rgba(244,114,182,0.22)',
    description: 'Human capital strategy, talent management, and culture',
    questions: [
      { id: 'hr_01', text: 'Employee onboarding is documented and consistently applied across all roles', category: 'Process' },
      { id: 'hr_02', text: 'Performance reviews happen on schedule for every employee, every year', category: 'Performance' },
      { id: 'hr_03', text: 'Employee engagement is formally measured and followed up with action plans', category: 'Culture' },
      { id: 'hr_04', text: 'Succession plans exist for all critical and senior leadership roles', category: 'Talent' },
      { id: 'hr_05', text: 'HR decisions are supported by people analytics and data', category: 'Analytics' },
      { id: 'hr_06', text: 'A formal learning and development framework exists for all levels', category: 'Development' },
      { id: 'hr_07', text: 'Talent acquisition follows a structured, consistent, and repeatable process', category: 'Recruitment' },
      { id: 'hr_08', text: 'HR systems are integrated and significantly reduce manual administrative work', category: 'Technology' },
      { id: 'hr_09', text: 'HR KPIs are tracked and reported to leadership on a regular cadence', category: 'Metrics' },
      { id: 'hr_10', text: 'Compensation is benchmarked to market and structured with transparent bands', category: 'Compensation' },
      { id: 'hr_11', text: 'DEI initiatives are measured, targeted, and continuously improved', category: 'Culture' },
      { id: 'hr_12', text: 'You can identify employees at risk of leaving before they resign', category: 'Retention' },
      { id: 'hr_13', text: 'Internal communication is structured, consistent, and effectiveness is measured', category: 'Communication' },
      { id: 'hr_14', text: 'Workplace culture is deliberately shaped and managed, not left to chance', category: 'Culture' },
      { id: 'hr_15', text: 'HR is viewed and engaged as a strategic business partner at board level', category: 'Strategic' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    shortName: 'Finance',
    color: '#34d399',
    bgColor: 'rgba(52,211,153,0.08)',
    borderColor: 'rgba(52,211,153,0.22)',
    description: 'Financial planning, reporting, controls, and strategic finance',
    questions: [
      { id: 'fin_01', text: 'Monthly financial close consistently completes within 5 business days', category: 'Process' },
      { id: 'fin_02', text: 'Budgeting uses rolling forecasts rather than static annual cycles', category: 'Planning' },
      { id: 'fin_03', text: 'Business units have self-service access to financial analytics', category: 'Analytics' },
      { id: 'fin_04', text: 'Cash flow forecasting is accurate within ±10% on a rolling basis', category: 'Accuracy' },
      { id: 'fin_05', text: 'Risk management is embedded in all financial decision-making', category: 'Risk' },
      { id: 'fin_06', text: 'Finance systems are integrated (ERP, planning, and reporting)', category: 'Technology' },
      { id: 'fin_07', text: 'Internal controls are documented, owned, and regularly tested', category: 'Controls' },
      { id: 'fin_08', text: 'Finance acts as a strategic business partner to operations and leadership', category: 'Strategic' },
      { id: 'fin_09', text: 'Tax planning is proactive, not reactive', category: 'Compliance' },
      { id: 'fin_10', text: 'Working capital is actively managed and optimized', category: 'Efficiency' },
      { id: 'fin_11', text: 'Financial data quality is trusted and consistent across the organisation', category: 'DataQuality' },
      { id: 'fin_12', text: 'Scenario planning is used regularly for major business decisions', category: 'Planning' },
      { id: 'fin_13', text: 'Key finance metrics are visible to all relevant stakeholders near real-time', category: 'Transparency' },
      { id: 'fin_14', text: 'Accounts payable and receivable processes are substantially automated', category: 'Automation' },
      { id: 'fin_15', text: 'Finance team spends >50% of time on analysis and insight, not just reporting', category: 'Value' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    shortName: 'Ops',
    color: '#fb923c',
    bgColor: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.22)',
    description: 'Core processes, quality, efficiency, and delivery excellence',
    questions: [
      { id: 'ops_01', text: 'Core operational processes are documented and followed consistently', category: 'Process' },
      { id: 'ops_02', text: 'Operational KPIs are visible to relevant teams in real or near-real time', category: 'Metrics' },
      { id: 'ops_03', text: 'Continuous improvement is a formal, funded discipline (Lean, Six Sigma, etc.)', category: 'Improvement' },
      { id: 'ops_04', text: 'Capacity planning is data-driven and forward-looking by at least one quarter', category: 'Planning' },
      { id: 'ops_05', text: 'Quality management systems are in place and demonstrably effective', category: 'Quality' },
      { id: 'ops_06', text: 'Supply disruptions and operational risks are anticipated, not just reacted to', category: 'Resilience' },
      { id: 'ops_07', text: 'Operations and finance are aligned on resource allocation decisions', category: 'Alignment' },
      { id: 'ops_08', text: 'Automation has meaningfully reduced manual errors in key processes', category: 'Automation' },
      { id: 'ops_09', text: 'Customer experience quality is designed into operational workflows', category: 'CX' },
      { id: 'ops_10', text: 'Environmental and sustainability metrics are tracked and improving', category: 'Sustainability' },
      { id: 'ops_11', text: 'Vendor and partner performance is actively and formally managed', category: 'Partnerships' },
      { id: 'ops_12', text: 'Cross-departmental handoffs are smooth, documented, and SLA-bound', category: 'Integration' },
      { id: 'ops_13', text: 'Safety and compliance incidents are measured and trending consistently downward', category: 'Compliance' },
      { id: 'ops_14', text: 'Operational forecasts are shared proactively with leadership each month', category: 'Communication' },
      { id: 'ops_15', text: 'Operations leadership contributes meaningfully to strategic planning', category: 'Strategic' },
    ],
  },
  {
    id: 'it',
    name: 'IT & Technology',
    shortName: 'IT',
    color: '#60a5fa',
    bgColor: 'rgba(96,165,250,0.08)',
    borderColor: 'rgba(96,165,250,0.22)',
    description: 'Systems, infrastructure, security, and technology governance',
    questions: [
      { id: 'it_01', text: 'Critical IT systems maintain >99% uptime with documented SLAs', category: 'Reliability' },
      { id: 'it_02', text: 'Cybersecurity posture is formally assessed and remediated at least annually', category: 'Security' },
      { id: 'it_03', text: 'Technology roadmap is reviewed quarterly and aligned to business strategy', category: 'Alignment' },
      { id: 'it_04', text: 'Change management process consistently prevents production incidents', category: 'Process' },
      { id: 'it_05', text: 'Data is formally managed as a strategic asset with governance policies', category: 'DataGovernance' },
      { id: 'it_06', text: 'IT support resolves incidents within agreed SLA windows consistently', category: 'Service' },
      { id: 'it_07', text: 'Cloud adoption is intentional, documented, and cost-optimized', category: 'Infrastructure' },
      { id: 'it_08', text: 'IT operates with a product mindset focused on business outcomes', category: 'Mindset' },
      { id: 'it_09', text: 'Technical debt is measured, tracked, and actively reduced each quarter', category: 'Quality' },
      { id: 'it_10', text: 'APIs and integrations enable seamless data flow between business systems', category: 'Integration' },
      { id: 'it_11', text: 'Disaster recovery plans are documented, tested, and up to date', category: 'Resilience' },
      { id: 'it_12', text: 'IT procurement follows a formal evaluation and governance process', category: 'Governance' },
      { id: 'it_13', text: 'Development teams follow CI/CD pipelines with automated testing in place', category: 'Engineering' },
      { id: 'it_14', text: 'IT performance metrics are reported to and reviewed by executive leadership', category: 'Visibility' },
      { id: 'it_15', text: 'Dedicated budget and process exists for IT innovation and emerging technology', category: 'Innovation' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales & Revenue',
    shortName: 'Sales',
    color: '#a3e635',
    bgColor: 'rgba(163,230,53,0.08)',
    borderColor: 'rgba(163,230,53,0.22)',
    description: 'Revenue generation, pipeline management, and commercial strategy',
    questions: [
      { id: 'sal_01', text: 'Sales methodology is documented and consistently applied by all salespeople', category: 'Process' },
      { id: 'sal_02', text: 'CRM is used by all sales staff with clean, complete, and trusted data', category: 'Technology' },
      { id: 'sal_03', text: 'Sales forecast accuracy is within ±10% on a rolling 90-day basis', category: 'Forecasting' },
      { id: 'sal_04', text: 'Sales coaching is structured and happens regularly, not just at review time', category: 'Development' },
      { id: 'sal_05', text: 'Pipeline health metrics are reviewed and acted on at least weekly', category: 'Metrics' },
      { id: 'sal_06', text: 'Win/loss analysis is conducted systematically after every significant deal', category: 'Analytics' },
      { id: 'sal_07', text: 'Customer segmentation actively drives sales strategy and resource allocation', category: 'Strategy' },
      { id: 'sal_08', text: 'Sales and marketing are tightly aligned on ICP definition and messaging', category: 'Alignment' },
      { id: 'sal_09', text: 'Pricing strategy is data-driven and consistently applied across the team', category: 'Pricing' },
      { id: 'sal_10', text: 'Sales onboarding reduces time-to-first-deal to under 60 days', category: 'Enablement' },
      { id: 'sal_11', text: 'Customer retention and expansion metrics are actively owned by sales', category: 'Retention' },
      { id: 'sal_12', text: 'A revenue operations function exists and drives pipeline efficiency', category: 'Operations' },
      { id: 'sal_13', text: 'Sales data quality is trusted and actively used for strategic planning', category: 'DataQuality' },
      { id: 'sal_14', text: 'Incentive structures drive the right long-term behaviours, not just short-term wins', category: 'Compensation' },
      { id: 'sal_15', text: 'Sales systematically surfaces customer insights to product and marketing', category: 'FeedbackLoop' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Comms',
    shortName: 'Marketing',
    color: '#f9a8d4',
    bgColor: 'rgba(249,168,212,0.08)',
    borderColor: 'rgba(249,168,212,0.22)',
    description: 'Brand, demand generation, content, and market positioning',
    questions: [
      { id: 'mkt_01', text: 'Marketing strategy is documented, approved, and tied directly to revenue goals', category: 'Strategy' },
      { id: 'mkt_02', text: 'Brand guidelines are consistent across all channels and actively enforced', category: 'Brand' },
      { id: 'mkt_03', text: 'Content production follows a structured editorial calendar with clear ownership', category: 'Process' },
      { id: 'mkt_04', text: 'Marketing ROI is measured at the campaign, channel, and cohort level', category: 'Analytics' },
      { id: 'mkt_05', text: 'Customer personas are research-based and reviewed at least annually', category: 'Intelligence' },
      { id: 'mkt_06', text: 'Marketing automation is deployed for lead nurturing and lifecycle management', category: 'Technology' },
      { id: 'mkt_07', text: 'SEO/SEM strategy is active and generating measurable organic growth', category: 'Digital' },
      { id: 'mkt_08', text: 'Social media presence is managed strategically with defined goals', category: 'Digital' },
      { id: 'mkt_09', text: 'Marketing and sales share pipeline attribution data and agree on definitions', category: 'Alignment' },
      { id: 'mkt_10', text: 'Product launches follow a defined and repeatable GTM playbook', category: 'Process' },
      { id: 'mkt_11', text: 'Customer lifecycle marketing is active across acquisition, retention, and expansion', category: 'Lifecycle' },
      { id: 'mkt_12', text: 'Brand sentiment and share-of-voice is monitored and acted upon', category: 'Reputation' },
      { id: 'mkt_13', text: 'Marketing team has analytics capability in-house, not dependent on agencies', category: 'Capability' },
      { id: 'mkt_14', text: 'ABM (Account-Based Marketing) is practiced for strategic target accounts', category: 'Strategy' },
      { id: 'mkt_15', text: 'Marketing budget allocation is dynamically adjusted based on performance data', category: 'Optimization' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy & Biz Dev',
    shortName: 'Strategy',
    color: '#c084fc',
    bgColor: 'rgba(192,132,252,0.08)',
    borderColor: 'rgba(192,132,252,0.22)',
    description: 'Corporate strategy, competitive intelligence, and growth development',
    questions: [
      { id: 'str_01', text: 'A documented 3–5 year strategic plan exists, is current, and widely communicated', category: 'Planning' },
      { id: 'str_02', text: 'Strategy is clearly understood and can be articulated by all senior leaders', category: 'Communication' },
      { id: 'str_03', text: 'Strategic priorities are translated into measurable OKRs or KPIs', category: 'Execution' },
      { id: 'str_04', text: 'Competitive intelligence is gathered and used systematically', category: 'Intelligence' },
      { id: 'str_05', text: 'Market sensing and trend analysis is a formal, funded activity', category: 'Insight' },
      { id: 'str_06', text: 'Strategy reviews happen at least quarterly with clear decisions and owners', category: 'Governance' },
      { id: 'str_07', text: 'M&A, partnerships, and growth opportunities are evaluated using a formal process', category: 'BizDev' },
      { id: 'str_08', text: 'Portfolio management ensures resources flow to highest-priority strategic initiatives', category: 'Resource' },
      { id: 'str_09', text: 'Innovation pipeline is actively managed alongside the core business', category: 'Innovation' },
      { id: 'str_10', text: 'Board and investor communications are strategic, forward-looking, and evidence-based', category: 'Stakeholders' },
      { id: 'str_11', text: 'Scenario planning is used for all major strategic decisions', category: 'Planning' },
      { id: 'str_12', text: 'Strategic assumptions are explicitly stated and periodically validated', category: 'Rigor' },
      { id: 'str_13', text: 'Business development has a formal, managed pipeline with clear KPIs', category: 'Process' },
      { id: 'str_14', text: 'Organisational design is reviewed and updated as strategy evolves', category: 'Design' },
      { id: 'str_15', text: 'Strategy function has genuine budget authority and executive-level influence', category: 'Influence' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    shortName: 'Legal',
    color: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.22)',
    description: 'Legal risk, contracts, regulatory compliance, and governance',
    questions: [
      { id: 'leg_01', text: 'All material contracts go through a formal, tracked legal review process', category: 'Contracts' },
      { id: 'leg_02', text: 'Regulatory changes are monitored and actioned proactively before deadlines', category: 'Compliance' },
      { id: 'leg_03', text: 'Legal risks are rated by severity and reported to leadership quarterly', category: 'Risk' },
      { id: 'leg_04', text: 'Standard contract templates are maintained, up to date, and widely used', category: 'Efficiency' },
      { id: 'leg_05', text: 'Data privacy and GDPR/local compliance is actively and formally managed', category: 'Privacy' },
      { id: 'leg_06', text: 'Intellectual property assets are catalogued, valued, and legally protected', category: 'IP' },
      { id: 'leg_07', text: 'Legal team is involved in major business decisions before commitments are made', category: 'Strategic' },
      { id: 'leg_08', text: 'Litigation management is proactive with defined escalation paths', category: 'Litigation' },
      { id: 'leg_09', text: 'Internal investigations follow a documented, consistent, and fair process', category: 'Process' },
      { id: 'leg_10', text: 'All employment documentation is clear, current, and legally compliant', category: 'Employment' },
      { id: 'leg_11', text: 'Compliance training is mandatory, tracked, and completion is enforced', category: 'Training' },
      { id: 'leg_12', text: 'Third-party and vendor legal risks are assessed before every engagement', category: 'ThirdParty' },
      { id: 'leg_13', text: 'Legal spend is measured, budgeted, and regularly reviewed for efficiency', category: 'Efficiency' },
      { id: 'leg_14', text: 'Board-level legal and compliance risks are clearly and regularly communicated', category: 'Governance' },
      { id: 'leg_15', text: 'Legal technology is deployed to improve efficiency and reduce manual work', category: 'Technology' },
    ],
  },
  {
    id: 'rnd',
    name: 'R&D & Innovation',
    shortName: 'R&D',
    color: '#2dd4bf',
    bgColor: 'rgba(45,212,191,0.08)',
    borderColor: 'rgba(45,212,191,0.22)',
    description: 'Research, innovation pipeline, and intellectual property development',
    questions: [
      { id: 'rnd_01', text: 'An innovation strategy exists, is funded, and has active executive sponsorship', category: 'Strategy' },
      { id: 'rnd_02', text: 'R&D investment is benchmarked against industry peers and adjusted accordingly', category: 'Investment' },
      { id: 'rnd_03', text: 'Innovation pipeline has clear stage-gates with defined go/no-go criteria', category: 'Process' },
      { id: 'rnd_04', text: 'Ideas are collected from across the organisation and evaluated systematically', category: 'IdeaManagement' },
      { id: 'rnd_05', text: 'Cross-functional teams actively collaborate on innovation projects', category: 'Collaboration' },
      { id: 'rnd_06', text: 'Customer insights directly feed and prioritize the R&D agenda', category: 'CustomerCentric' },
      { id: 'rnd_07', text: 'Intellectual property is systematically developed, filed, and protected', category: 'IP' },
      { id: 'rnd_08', text: 'Failure is documented, analysed, and learnings are openly shared', category: 'Culture' },
      { id: 'rnd_09', text: 'R&D metrics (output, velocity, commercial success rate) are reported to leadership', category: 'Metrics' },
      { id: 'rnd_10', text: 'Technology scanning monitors emerging technologies relevant to the business', category: 'TechIntelligence' },
      { id: 'rnd_11', text: 'External partnerships (universities, start-ups, labs) are actively leveraged', category: 'OpenInnovation' },
      { id: 'rnd_12', text: 'Time-to-market for new offerings is measured and consistently improving', category: 'Speed' },
      { id: 'rnd_13', text: 'Innovation outcomes are measured by business impact, not just activity or output', category: 'Outcomes' },
      { id: 'rnd_14', text: 'R&D team has genuine autonomy and psychological safety to experiment', category: 'Culture' },
      { id: 'rnd_15', text: 'Innovation contributes materially to revenue or cost reduction each year', category: 'Impact' },
    ],
  },
  {
    id: 'product',
    name: 'Product Management',
    shortName: 'Product',
    color: '#818cf8',
    bgColor: 'rgba(129,140,248,0.08)',
    borderColor: 'rgba(129,140,248,0.22)',
    description: 'Product strategy, discovery, roadmap, and customer-centric development',
    questions: [
      { id: 'prd_01', text: 'Product strategy is documented, current, and aligned to business goals', category: 'Strategy' },
      { id: 'prd_02', text: 'Product roadmap is prioritised using a formal framework (RICE, MoSCoW, etc.)', category: 'Planning' },
      { id: 'prd_03', text: 'Customer discovery is conducted before major features are committed to', category: 'Discovery' },
      { id: 'prd_04', text: 'Core product metrics (activation, retention, NPS) are tracked weekly', category: 'Metrics' },
      { id: 'prd_05', text: 'Engineering, design, and product operate in aligned, productive sprints', category: 'Collaboration' },
      { id: 'prd_06', text: 'Feature adoption is measured at least 30 days post-launch', category: 'Analytics' },
      { id: 'prd_07', text: 'A/B testing is used to validate product and UX decisions', category: 'Experimentation' },
      { id: 'prd_08', text: 'Product and technical debt is tracked and regularly addressed', category: 'Quality' },
      { id: 'prd_09', text: 'Customer feedback is systematically collected and fed back into the roadmap', category: 'Feedback' },
      { id: 'prd_10', text: 'Product team has direct, unfiltered access to customers on a regular basis', category: 'CustomerAccess' },
      { id: 'prd_11', text: 'Competitive product analysis is conducted at least quarterly', category: 'Intelligence' },
      { id: 'prd_12', text: 'Product OKRs are owned and tracked by product managers', category: 'Accountability' },
      { id: 'prd_13', text: 'Product decisions are data-driven, not driven by the highest-paid opinion', category: 'DataDriven' },
      { id: 'prd_14', text: 'Product go-to-market is coordinated tightly with marketing and sales', category: 'GTM' },
      { id: 'prd_15', text: 'Product vision is clearly articulated, inspiring, and consistently communicated', category: 'Vision' },
    ],
  },
  {
    id: 'cs',
    name: 'Customer Success',
    shortName: 'CS',
    color: '#4ade80',
    bgColor: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.22)',
    description: 'Customer retention, expansion, health, and lifetime value',
    questions: [
      { id: 'cs_01', text: 'Customer onboarding follows a documented, repeatable, time-bound playbook', category: 'Onboarding' },
      { id: 'cs_02', text: 'Customer health scores are calculated algorithmically and actively monitored', category: 'HealthScoring' },
      { id: 'cs_03', text: 'Churn risk is identified predictively, not only after the customer signals intent', category: 'Retention' },
      { id: 'cs_04', text: 'Customer success is involved in the sales process before deals close', category: 'PreSales' },
      { id: 'cs_05', text: 'Expansion revenue (upsell/cross-sell) is owned and tracked by the CS team', category: 'Growth' },
      { id: 'cs_06', text: 'Voice of customer data is systematically collected and shared across the company', category: 'VoC' },
      { id: 'cs_07', text: 'NPS/CSAT is measured regularly and findings are acted upon with clear owners', category: 'Satisfaction' },
      { id: 'cs_08', text: 'Escalations follow a documented process with defined SLAs and escalation paths', category: 'Escalation' },
      { id: 'cs_09', text: 'CS metrics are compiled and reported to leadership at least monthly', category: 'Metrics' },
      { id: 'cs_10', text: 'CS team systematically contributes insights into the product feedback loop', category: 'ProductLoop' },
      { id: 'cs_11', text: 'Renewal management begins proactively at least 90 days before contract expiry', category: 'Renewals' },
      { id: 'cs_12', text: 'Customer segmentation actively drives CS resource and time allocation', category: 'Segmentation' },
      { id: 'cs_13', text: 'CS headcount and capacity is adequate relative to ARR and account complexity', category: 'Capacity' },
      { id: 'cs_14', text: 'Digital/tech-touch tools scale CS coverage beyond high-touch limitations', category: 'Scale' },
      { id: 'cs_15', text: 'CS team has clear revenue accountability and contributes to ARR growth targets', category: 'RevenueFocus' },
    ],
  },
  {
    id: 'supply',
    name: 'Supply Chain',
    shortName: 'Supply',
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.08)',
    borderColor: 'rgba(249,115,22,0.22)',
    description: 'Procurement, vendor management, logistics, and supply chain resilience',
    questions: [
      { id: 'sup_01', text: 'Supplier base is rationalised and every supplier has a named relationship owner', category: 'Supplier' },
      { id: 'sup_02', text: 'Procurement follows a formal, documented sourcing and evaluation process', category: 'Process' },
      { id: 'sup_03', text: 'Total cost of ownership (TCO) drives all procurement decisions, not just unit price', category: 'CostManagement' },
      { id: 'sup_04', text: 'Supply chain risks are formally identified, rated by impact, and actively mitigated', category: 'Risk' },
      { id: 'sup_05', text: 'Inventory levels are optimised using demand data and forecasting models', category: 'Inventory' },
      { id: 'sup_06', text: 'Supplier performance is reviewed formally using KPIs at least quarterly', category: 'Performance' },
      { id: 'sup_07', text: 'ESG and sustainability criteria are formally included in supplier selection', category: 'Sustainability' },
      { id: 'sup_08', text: 'Procurement technology (e-procurement, vendor portals) is deployed and adopted', category: 'Technology' },
      { id: 'sup_09', text: 'Contract compliance with suppliers is monitored on an ongoing basis', category: 'Compliance' },
      { id: 'sup_10', text: 'Procurement savings are tracked against baselines and formally reported', category: 'Savings' },
      { id: 'sup_11', text: 'Demand planning involves procurement proactively, not reactively', category: 'Planning' },
      { id: 'sup_12', text: 'Strategic supplier relationships are formally managed at executive level', category: 'Relationships' },
      { id: 'sup_13', text: 'Supply chain disruption scenarios are documented, planned for, and rehearsed', category: 'Resilience' },
      { id: 'sup_14', text: 'Supply chain KPIs are visible to finance, operations, and executive leadership', category: 'Visibility' },
      { id: 'sup_15', text: 'Procurement strategy is recognised as contributing to competitive advantage', category: 'Strategic' },
    ],
  },
  // ── Special assessments ─────────────────────────────────────
  {
    id: 'digital',
    name: 'Digital Transformation',
    shortName: 'Digital',
    color: '#38bdf8',
    bgColor: 'rgba(56,189,248,0.08)',
    borderColor: 'rgba(56,189,248,0.22)',
    description: 'Digital strategy, cloud, legacy modernisation, and digital culture',
    isSpecial: true,
    questions: [
      { id: 'dig_01', text: 'A digital transformation strategy exists with active, visible executive sponsorship', category: 'Strategy' },
      { id: 'dig_02', text: 'Cloud-first policies actively guide all new technology decisions', category: 'Cloud' },
      { id: 'dig_03', text: 'Data is formally treated as a strategic asset with governance policies in place', category: 'Data' },
      { id: 'dig_04', text: 'Digital skills gaps are assessed and individual development plans exist for all', category: 'Skills' },
      { id: 'dig_05', text: 'Customer-facing digital experiences are continuously tested and improved', category: 'CX' },
      { id: 'dig_06', text: 'Legacy system replacement roadmap is documented, funded, and being executed', category: 'Modernisation' },
      { id: 'dig_07', text: 'Digital transformation ROI is measured and reported to leadership', category: 'ROI' },
      { id: 'dig_08', text: 'Cross-functional digital initiatives have dedicated resources and accountable owners', category: 'Resources' },
      { id: 'dig_09', text: 'Change management is formally applied to all major digital transformation programmes', category: 'ChangeManagement' },
      { id: 'dig_10', text: 'Cybersecurity is embedded from the start in all digital transformation work', category: 'Security' },
      { id: 'dig_11', text: 'API and integration architecture enables digital agility across all core systems', category: 'Architecture' },
      { id: 'dig_12', text: 'Employee digital adoption is measured and actively supported with training', category: 'Adoption' },
      { id: 'dig_13', text: 'External digital ecosystem (platforms, technology partners) is strategically leveraged', category: 'Ecosystem' },
      { id: 'dig_14', text: 'Digital experimentation (MVPs, pilots, proofs of concept) is culturally accepted', category: 'Culture' },
      { id: 'dig_15', text: 'Digital transformation has delivered measurable, reported business outcomes', category: 'Outcomes' },
    ],
  },
  {
    id: 'ai',
    name: 'AI Readiness',
    shortName: 'AI',
    color: '#a78bfa',
    bgColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.22)',
    description: 'AI strategy, data readiness, ethics governance, and capability maturity',
    isSpecial: true,
    questions: [
      { id: 'ai_01', text: 'An AI/ML strategy is defined, funded, and linked to clear business objectives', category: 'Strategy' },
      { id: 'ai_02', text: 'Data quality and availability meets the requirements for AI/ML development', category: 'Data' },
      { id: 'ai_03', text: 'The organisation has a clear map of where AI creates the highest business value', category: 'ValueMapping' },
      { id: 'ai_04', text: 'An AI ethics and governance framework exists and is actively enforced', category: 'Ethics' },
      { id: 'ai_05', text: 'Technical infrastructure (compute, storage, pipelines) supports AI workloads', category: 'Infrastructure' },
      { id: 'ai_06', text: 'AI/ML talent is available in-house or through reliable, capable external partners', category: 'Talent' },
      { id: 'ai_07', text: 'At least one AI use case is fully deployed and operating in a production environment', category: 'Implementation' },
      { id: 'ai_08', text: 'AI model performance is actively monitored and maintained after deployment', category: 'Monitoring' },
      { id: 'ai_09', text: 'Employees across all functions understand AI capabilities and its limitations', category: 'Literacy' },
      { id: 'ai_10', text: 'AI bias and fairness risks are actively assessed and mitigated in all deployments', category: 'Fairness' },
      { id: 'ai_11', text: 'Regulatory requirements for AI in your industry are understood and managed', category: 'Compliance' },
      { id: 'ai_12', text: 'Budget is specifically allocated for AI experimentation, development, and scaling', category: 'Investment' },
      { id: 'ai_13', text: 'AI project outcomes are measured, tracked, and reported to executive leadership', category: 'Metrics' },
      { id: 'ai_14', text: 'Leadership actively champions and visibly supports AI adoption across the business', category: 'Leadership' },
      { id: 'ai_15', text: 'An AI capability roadmap exists and is reviewed and updated at least quarterly', category: 'Planning' },
    ],
  },
];

// ── Demo initial scores ──────────────────────────────────────
// Pre-populated for a realistic mid-tier company at approx Level 2.6 overall
export const DEMO_SCORES: ScoresMap = (() => {
  const raw: Record<string, number[]> = {
    hr:       [3, 3, 2, 2, 2, 3, 3, 2, 3, 2, 2, 2, 3, 3, 2],
    finance:  [3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3],
    operations:[2, 2, 2, 2, 3, 2, 3, 2, 2, 2, 3, 2, 3, 3, 2],
    it:       [3, 2, 3, 3, 2, 3, 2, 2, 2, 2, 3, 3, 2, 3, 2],
    sales:    [2, 3, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    marketing:[2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2],
    strategy: [3, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 2, 3],
    legal:    [3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 2, 3, 2],
    rnd:      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 3, 2],
    product:  [2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
    cs:       [2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1, 2],
    supply:   [2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    digital:  [2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 1, 2, 1],
    ai:       [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 1],
  };

  const result: ScoresMap = {};
  DEPARTMENTS.forEach(dept => {
    const vals = raw[dept.id] ?? dept.questions.map(() => 2);
    const answers: Record<string, number> = {};
    dept.questions.forEach((q, i) => { answers[q.id] = vals[i] ?? 2; });
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    result[dept.id] = {
      departmentId: dept.id,
      answers,
      score: Math.round(avg * 10) / 10,
      completedAt: '2026-03-15',
    };
  });
  return result;
})();

// ── Utility: score → maturity level ─────────────────────────
export function scoreToLevel(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score < 1.8) return 1;
  if (score < 2.6) return 2;
  if (score < 3.4) return 3;
  if (score < 4.2) return 4;
  return 5;
}

export function computeOrgScore(scores: ScoresMap): number {
  const vals = Object.values(scores).map(s => s.score);
  if (vals.length === 0) return 1;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

// ── Unlock conditions per dept per target level ──────────────
export const UNLOCK_CONDITIONS: Record<string, Record<number, string[]>> = {
  hr: {
    3: ['Implement structured 90-day onboarding with weekly check-ins', 'Launch bi-annual engagement surveys with mandatory action tracking', 'Define succession plans for all VP+ and critical roles', 'Deploy an integrated HRIS that connects payroll, performance, and L&D', 'Publish a monthly HR metrics dashboard to leadership'],
    4: ['Deploy predictive attrition model on HRIS data', 'Build personalised learning journeys using skills assessment data', 'Move to continuous performance conversations (replace annual reviews)', 'Launch formal employer brand strategy with measurable reach KPIs', 'Achieve >85% completion rate on all development plans'],
    5: ['Earn top-quartile employer brand recognition in at least one external ranking', 'Demonstrate HR contribution to revenue via measurable retention ROI', 'Sustain Culture NPS above 70 for three consecutive quarters', 'HR is represented in all M&A due diligence and strategic decisions', 'Workforce planning predicts capability needs 18+ months ahead'],
  },
  finance: {
    3: ['Reduce financial close cycle to ≤5 business days consistently', 'Implement rolling 12-month forecast replacing static annual budget', 'Deploy integrated ERP with planning and reporting modules', 'Publish monthly finance dashboards with self-service access for all BUs', 'Document, assign owners, and test all key internal controls'],
    4: ['Deploy real-time cash flow forecasting model', 'Implement advanced scenario and sensitivity modelling', 'Automate 80%+ of AP/AR processes via workflow tools', 'Stand up a dedicated FP&A function with business partnering model', 'Integrate finance data into all operational decision systems'],
    5: ['Finance drives capital allocation decisions at board level using ROI models', 'Real-time P&L visibility available to all operational leaders', 'Finance talent pipeline feeds CEO/CFO/COO roles', 'Near-instantaneous financial close (T+1 or better)', 'Dynamic pricing and financial models integrated into product decisions'],
  },
  operations: {
    3: ['Document all Tier 1 processes with clear owners and version control', 'Deploy operational KPI dashboard updated at least daily', 'Establish formal CI programme (Lean/Six Sigma) with dedicated budget', 'Implement SLA-based cross-department handoff protocols', 'Synchronise operations planning cycle with finance and strategy'],
    4: ['Deploy real-time monitoring across key operational touchpoints', 'Implement predictive maintenance or demand-sensing models', 'Automate 60%+ of repetitive, rule-based operational tasks', 'Build a cross-functional operations command room with live data', 'Achieve <2% quality defect or error rate across Tier 1 processes'],
    5: ['AI-driven decision-making embedded in core operational loops', 'Achieve net-zero or circular operations model', 'Operations methodology published and benchmarked externally', 'Operations innovation directly informs new product or service design', 'Operational excellence is a primary driver of customer NPS scores'],
  },
  it: {
    3: ['Implement ITIL-based service management process end-to-end', 'Complete annual penetration test and remediate all critical findings within 30 days', 'Publish a rolling IT roadmap aligned to the 3-year business strategy', 'Deploy CI/CD pipelines for all production systems', 'Reduce unplanned downtime to <0.5% of total uptime per year'],
    4: ['Implement AIOps or observability platform for proactive detection', 'Deploy zero-trust security architecture across all systems', 'Build API-first integration layer connecting all core business systems', 'Reduce technical debt ratio below 15% of total engineering capacity', 'Stand up a platform engineering function to enable self-service'],
    5: ['IT generates revenue through technology-enabled products or services', 'Real-time data mesh enables instant insight across the organisation', 'Engineering culture attracts top-5% tech talent without agency support', 'Hold externally recognised security and compliance certifications', 'Technology capability drives new business model or revenue stream'],
  },
  sales: {
    3: ['Document and train all reps on a single, consistent sales methodology', 'Clean CRM data to >90% completeness and enforce hygiene standards', 'Implement structured weekly pipeline review cadence with defined agenda', 'Deploy a sales enablement platform with content library', 'Define and enforce ICP with written alignment from marketing'],
    4: ['Implement AI-powered lead scoring and rep prioritisation', 'Build a dedicated Revenue Operations function with full-funnel analytics', 'Deploy conversational intelligence (call recording + AI-driven coaching)', 'Achieve forecast accuracy within ±8% on rolling 90-day basis', 'Launch formal expansion playbooks managed jointly with CS'],
    5: ['Sales motion is a product: predictable, scalable, and fully documented', 'Quota attainment >85% of team, every quarter, consistently', 'Sales team generates its own thought leadership content and brand authority', 'Sales insights directly drive at least two product roadmap decisions per year', 'Revenue flywheel operates with <10% management intervention'],
  },
  marketing: {
    3: ['Build and enforce comprehensive brand guidelines across all channels', 'Implement marketing automation for lead nurturing and lifecycle journeys', 'Launch a documented content calendar with quarterly themes and owners', 'Establish a marketing attribution model agreed upon with sales', 'Set, report, and act on 3 core marketing KPIs monthly'],
    4: ['Deploy full-funnel analytics with direct revenue attribution', 'Implement ABM programme for top 20 target accounts', 'Build in-house demand generation capability (not agency-dependent)', 'Launch customer lifecycle marketing campaigns across all segments', 'Create brand sentiment tracking dashboard with response SLAs'],
    5: ['Brand is a measurable competitive moat — quantified via pricing premium data', 'Marketing pipeline generation consistently exceeds sales capacity', 'Marketing intelligence directly shapes corporate and product strategy', 'Content establishes the industry narrative, not just promotes products', 'Marketing ROI exceeds all other investment categories in the company'],
  },
  strategy: {
    3: ['Publish a 3-year strategic plan with measurable objectives and owners', 'Establish quarterly strategy review cadence with executive leadership', 'Translate company strategy into department-level OKRs', 'Launch a formal competitive intelligence function with regular reports', 'Align capital allocation decision process to documented strategic priorities'],
    4: ['Implement formal scenario planning using quantified probability models', 'Stand up corporate development pipeline with defined stage-gates', 'Build strategy visualisation and storytelling tools for board use', 'Integrate strategy cycle with financial forecasting models', 'Publish regular strategic communication for investors and board'],
    5: ['Strategy team is a genuine competitive intelligence and foresight function', 'Organisation executes strategy faster than competitors can replicate', 'Strategy capability attracts top-tier MBA and strategy talent externally', 'M&A and partnerships consistently generate above-market returns', 'Strategy is cited externally as a source of competitive differentiation'],
  },
  legal: {
    3: ['Document and standardise the contract review and approval process', 'Implement a compliance monitoring calendar covering all key regulations', 'Complete IP audit and register all key assets with appropriate protection', 'Launch mandatory compliance training with tracked completion rates', 'Publish a legal risk register to leadership on a quarterly basis'],
    4: ['Deploy contract lifecycle management (CLM) software', 'Implement automated regulatory change monitoring tools', 'Stand up a data privacy programme with named DPO (if applicable)', 'Build third-party risk management process for all Tier 1 vendors', 'Achieve <5 business day average contract turnaround time'],
    5: ['Legal is a value creator — IP portfolio generates licensing revenue', 'AI-assisted contract review and generation reduces legal costs by >40%', 'Zero material compliance breaches across three consecutive years', 'Legal drives international expansion and M&A deal structuring proactively', 'Legal function is an externally recognised centre of excellence'],
  },
  rnd: {
    3: ['Define and fund a formal innovation strategy with a named executive owner', 'Implement stage-gate process for all innovation projects with criteria', 'Launch an internal idea management platform with transparent review process', 'Establish at least 2 active external partnerships (university, start-up, lab)', 'Set R&D investment as a defined % of revenue target'],
    4: ['Build open innovation programme with external ecosystem and events', 'Stand up technology scanning function producing quarterly reports', 'Achieve 20%+ of annual revenue from products launched in last 3 years', 'Launch a dedicated innovation lab or autonomous R&D team', 'File 5+ patents or significant IP registrations annually'],
    5: ['R&D creates proprietary capabilities that competitors cannot acquire or replicate', 'Innovation velocity recognised in external analyst or media coverage', 'R&D alumni become recognised industry leaders in their domains', 'Technology leadership drives a measurable premium in company valuation multiple', 'R&D frames the company\'s positioning in industry analyst narratives'],
  },
  product: {
    3: ['Implement a formal product discovery process (user interviews, jobs-to-be-done)', 'Deploy product analytics platform (event tracking, funnel analysis)', 'Establish product OKR framework explicitly linked to company goals', 'Launch bi-weekly customer interview sessions as a standing ritual', 'Create and maintain a shared, accessible product roadmap'],
    4: ['Build continuous A/B testing infrastructure with statistical power', 'Implement a product-led growth loop with measured activation metric', 'Deploy real-time feature adoption analytics post-launch', 'Establish a customer advisory board with regular structured input', 'Integrate product usage data into sales and CS workflows'],
    5: ['Product is the primary revenue and customer acquisition engine', 'Product intuition is a company-wide, externally recognised capability', 'Feature adoption rate consistently >70% within 30 days of launch', 'Product defines and leads the category in market analyst reports', 'Product organisation autonomously launches new product lines'],
  },
  cs: {
    3: ['Document and deploy a CS onboarding playbook with clear milestones', 'Implement a customer health scoring system with defined thresholds', 'Launch quarterly business review (QBR) programme for all strategic accounts', 'Build basic churn prediction model using CRM and product usage data', 'Set CS KPIs tied directly to revenue (NRR, GRR, expansion ARR)'],
    4: ['Deploy AI-powered health scoring with early warning notifications', 'Build a scaled, digital-touch CS motion for SMB and mid-market', 'Implement expansion playbooks with measurable upsell/cross-sell programmes', 'Stand up a customer community and advocacy programme', 'Achieve net revenue retention (NRR) consistently above 110%'],
    5: ['CS creates a measurable referral and expansion flywheel for sales', 'CS maturity is cited by prospects as a reason to choose your company', 'NPS consistently above 60 across all customer segments', 'CS alumni become champions at new companies and refer business back', 'CS model is published and benchmarked by industry analysts'],
  },
  supply: {
    3: ['Rationalise supplier base into strategic/preferred/transactional tiers', 'Implement an e-procurement platform with approval workflows', 'Document a TCO methodology and apply it to all >$10K purchases', 'Launch formal supplier performance review programme with scorecards', 'Create and maintain a supply chain risk register'],
    4: ['Deploy demand planning and inventory optimisation tools', 'Implement supplier collaboration portal for forecasting and communication', 'Build supply chain scenario planning capability with playbooks', 'Achieve full ESG compliance measurement across all Tier 1 suppliers', 'Automate 70%+ of purchase order processing'],
    5: ['Supply chain is a recognised source of competitive speed advantage', 'Supplier network creates unique time-to-market capability vs. competitors', 'Circular economy model fully embedded in supply chain operations', 'Supply chain resilience is presented as a board-level strategic asset', 'Supply chain innovations are published and cited externally'],
  },
  digital: {
    3: ['Appoint a Chief Digital Officer or executive-level digital sponsor', 'Publish and fund a cloud migration roadmap with clear phases', 'Establish a data governance framework with named data stewards per domain', 'Launch a digital skills assessment and structured reskilling programme', 'Define digital transformation KPIs and measure baseline'],
    4: ['Migrate 60%+ of all workloads to cloud infrastructure', 'Deploy an enterprise data platform (data lakehouse or data mesh)', 'Launch a digital experience lab for customer-facing innovation', 'Achieve digital upskilling completion for 80%+ of total workforce', 'Retire or modernise all Tier 1 legacy systems per the roadmap'],
    5: ['Digital capability is the core business model, not a transformation programme', 'AI-first decisions are embedded across all operational functions', 'Platform business model is enabled and sustained by digital capability', 'Digital velocity provides measurable time-to-market competitive advantage', 'Digital talent and culture is a recognised employer brand differentiator'],
  },
  ai: {
    3: ['Define an AI strategy with a named AI lead and initial use case pipeline', 'Complete an organisation-wide data quality audit and remediation plan', 'Launch AI literacy training for all employees across all functions', 'Deploy first production AI use case with defined success metrics', 'Publish an AI ethics and governance policy approved by leadership'],
    4: ['Build an ML platform for rapid model experimentation and deployment', 'Scale to 5+ production AI use cases across at least 3 business functions', 'Implement AI model monitoring and bias detection systems in production', 'Launch a formal AI Centre of Excellence (CoE) with dedicated headcount', 'Establish an AI ROI measurement framework across all deployments'],
    5: ['AI is a proprietary competitive moat that competitors cannot easily replicate', 'Autonomous AI agents manage significant portions of core operations', 'AI capability attracts strategic partnerships and investment interest', 'Proprietary training data creates models unavailable to competitors', 'AI contribution to revenue or cost reduction exceeds 20% of total impact'],
  },
};

// ── Blocker network ──────────────────────────────────────────
export const BLOCKER_RELATIONS: BlockerRelation[] = [
  { from: 'it',      to: 'digital',    description: 'IT infrastructure maturity gates digital transformation progress',       severity: 'high'   },
  { from: 'it',      to: 'ai',         description: 'AI workloads require mature IT infrastructure and data pipelines',        severity: 'high'   },
  { from: 'digital', to: 'ai',         description: 'AI readiness requires the digital transformation foundation',             severity: 'high'   },
  { from: 'hr',      to: 'operations', description: 'Talent quality and capability directly impacts operational execution',    severity: 'medium' },
  { from: 'finance', to: 'strategy',   description: 'Strategic plans require financial rigour and scenario modelling',         severity: 'medium' },
  { from: 'strategy',to: 'rnd',        description: 'Innovation agenda must align with and be funded by strategic priorities', severity: 'medium' },
  { from: 'product', to: 'sales',      description: 'Product maturity drives sales conviction and competitive win rates',      severity: 'medium' },
  { from: 'marketing',to: 'sales',     description: 'Marketing quality and alignment gates sales pipeline quality',            severity: 'high'   },
  { from: 'cs',      to: 'sales',      description: 'CS maturity impacts net revenue retention and referral generation',       severity: 'medium' },
  { from: 'legal',   to: 'strategy',   description: 'Legal maturity enables M&A, partnerships, and international expansion',  severity: 'low'    },
  { from: 'supply',  to: 'operations', description: 'Supply chain reliability directly constrains operational performance',    severity: 'medium' },
  { from: 'rnd',     to: 'product',    description: 'R&D maturity feeds the product innovation pipeline',                     severity: 'medium' },
];

// ── ROI per department per level achieved ────────────────────
export const ROI_DATA: Record<string, Record<number, { value: string; driver: string; annual: number }>> = {
  hr:       { 2: { value: '$120K/yr', driver: 'Reduced ad-hoc turnover costs',                     annual: 120  }, 3: { value: '$340K/yr', driver: 'Structured retention & faster hiring',              annual: 340  }, 4: { value: '$780K/yr', driver: 'Predictive attrition model prevents critical exits',   annual: 780  }, 5: { value: '$1.4M/yr', driver: 'Employer brand premium & talent acquisition moat',     annual: 1400 } },
  finance:  { 2: { value: '$80K/yr',  driver: 'Faster close cycle & reduced audit findings',       annual: 80   }, 3: { value: '$220K/yr', driver: 'Cash optimisation & controls improvement',            annual: 220  }, 4: { value: '$560K/yr', driver: 'Predictive FP&A drives better capital allocation',    annual: 560  }, 5: { value: '$1.1M/yr', driver: 'Finance drives strategic value creation directly',     annual: 1100 } },
  operations:{ 2: { value: '$150K/yr', driver: 'Reduced waste and rework costs',                   annual: 150  }, 3: { value: '$420K/yr', driver: 'Process standardisation eliminates variance',         annual: 420  }, 4: { value: '$890K/yr', driver: 'Automation and predictive ops reduce cost base',       annual: 890  }, 5: { value: '$1.8M/yr', driver: 'Operations excellence becomes a revenue enabler',      annual: 1800 } },
  it:       { 2: { value: '$100K/yr', driver: 'Reduced downtime and incident costs',               annual: 100  }, 3: { value: '$280K/yr', driver: 'Security posture reduces breach risk cost',           annual: 280  }, 4: { value: '$620K/yr', driver: 'Platform capability accelerates product delivery',     annual: 620  }, 5: { value: '$1.3M/yr', driver: 'IT drives revenue through digital capability',         annual: 1300 } },
  sales:    { 2: { value: '$200K/yr', driver: 'Consistency improves close rate',                   annual: 200  }, 3: { value: '$550K/yr', driver: 'Structured pipeline improves forecast accuracy',      annual: 550  }, 4: { value: '$1.2M/yr', driver: 'RevOps multiplies sales efficiency',                   annual: 1200 }, 5: { value: '$2.5M/yr', driver: 'Sales motion becomes self-compounding engine',          annual: 2500 } },
  marketing:{ 2: { value: '$90K/yr',  driver: 'Consistent brand reduces CAC',                     annual: 90   }, 3: { value: '$250K/yr', driver: 'Attribution model improves spend efficiency',          annual: 250  }, 4: { value: '$580K/yr', driver: 'Demand generation exceeds top-of-funnel targets',     annual: 580  }, 5: { value: '$1.2M/yr', driver: 'Brand as moat eliminates competitor substitution',     annual: 1200 } },
  strategy: { 2: { value: '$60K/yr',  driver: 'Better resource allocation decisions',              annual: 60   }, 3: { value: '$180K/yr', driver: 'Aligned OKRs reduce wasted strategic investment',    annual: 180  }, 4: { value: '$450K/yr', driver: 'Scenario planning prevents major strategic errors',    annual: 450  }, 5: { value: '$1.0M/yr', driver: 'Strategy drives M&A and growth above market returns',  annual: 1000 } },
  legal:    { 2: { value: '$70K/yr',  driver: 'Standardised contracts reduce turnaround',          annual: 70   }, 3: { value: '$190K/yr', driver: 'Proactive compliance avoids fines and delays',        annual: 190  }, 4: { value: '$420K/yr', driver: 'CLM technology and automation cuts legal cost',        annual: 420  }, 5: { value: '$800K/yr', driver: 'IP portfolio generates licensing revenue',            annual: 800  } },
  rnd:      { 2: { value: '$100K/yr', driver: 'Stage-gate process eliminates waste',               annual: 100  }, 3: { value: '$280K/yr', driver: 'Innovation pipeline delivers commercial output',       annual: 280  }, 4: { value: '$650K/yr', driver: 'IP and partnerships create new revenue streams',       annual: 650  }, 5: { value: '$1.5M/yr', driver: 'R&D moat is irreplicable by competitors',              annual: 1500 } },
  product:  { 2: { value: '$120K/yr', driver: 'Discovery reduces failed feature spend',            annual: 120  }, 3: { value: '$320K/yr', driver: 'Analytics-driven roadmap accelerates growth',         annual: 320  }, 4: { value: '$720K/yr', driver: 'PLG loop reduces CAC and accelerates expansion',      annual: 720  }, 5: { value: '$1.6M/yr', driver: 'Product defines and leads the market category',        annual: 1600 } },
  cs:       { 2: { value: '$110K/yr', driver: 'Structured onboarding reduces early churn',         annual: 110  }, 3: { value: '$300K/yr', driver: 'Health scoring enables proactive intervention',        annual: 300  }, 4: { value: '$680K/yr', driver: 'NRR >110% compounds ARR growth automatically',       annual: 680  }, 5: { value: '$1.3M/yr', driver: 'CS flywheel generates referrals and expansion',        annual: 1300 } },
  supply:   { 2: { value: '$90K/yr',  driver: 'Supplier rationalisation reduces spend',            annual: 90   }, 3: { value: '$240K/yr', driver: 'TCO methodology improves procurement decisions',      annual: 240  }, 4: { value: '$530K/yr', driver: 'Automation and optimisation reduce cost base',          annual: 530  }, 5: { value: '$1.0M/yr', driver: 'Supply chain speed creates competitive advantage',       annual: 1000 } },
  digital:  { 2: { value: '$180K/yr', driver: 'Cloud migration reduces infrastructure cost',       annual: 180  }, 3: { value: '$480K/yr', driver: 'Data governance enables better decisions',             annual: 480  }, 4: { value: '$1.1M/yr', driver: 'Digital experiences drive acquisition and retention',  annual: 1100 }, 5: { value: '$2.2M/yr', driver: 'Platform model unlocks new digital revenue streams',    annual: 2200 } },
  ai:       { 2: { value: '$120K/yr', driver: 'First AI use case replaces manual processing',      annual: 120  }, 3: { value: '$380K/yr', driver: 'Multiple models reduce operational costs',              annual: 380  }, 4: { value: '$950K/yr', driver: 'AI-driven decisions improve margins across functions', annual: 950  }, 5: { value: '$2.8M/yr', driver: 'Proprietary AI creates insurmountable competitive moat', annual: 2800 } },
};

// ── Shadow maturity: leadership perception vs. measured score ─
export const SHADOW_MATURITY: Record<string, number> = {
  hr: 3.5, finance: 3.8, operations: 3.2, it: 3.4, sales: 3.0,
  marketing: 3.1, strategy: 3.6, legal: 3.5, rnd: 2.8, product: 3.0,
  cs: 2.9, supply: 3.2, digital: 2.8, ai: 2.5,
};
