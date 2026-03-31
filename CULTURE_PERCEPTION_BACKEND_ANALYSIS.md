# Culture & Perception Tab - Backend Data Analysis

## Current Status

### ✅ Already Powered by Backend (Live Data)

1. **Voice Suppression** ([`VoiceSuppression.tsx`](main-dashboard/src/components/VoiceSuppression.tsx))
   - **Data Source**: Supervisor diagnostics from database
   - **Fields Used**: 
     - `p3.voiceSuppression` (supervisor view)
     - `p3.comfortRaisingConcerns` (supervisor view)
     - `p3.comfortSharing` (supervisor view)
     - `p4.voiceSuppression` (worker view)
   - **Status**: ✅ Fully operational

2. **Dark Energy Report** ([`DarkEnergyReport.tsx`](main-dashboard/src/components/DarkEnergyReport.tsx))
   - **Data Source**: Live systemic force analysis from diagnostics
   - **Status**: ✅ Fully operational

---

## 🔴 Currently Hidden - Can Be Powered Up

### 1. **Burnout by Level** ([`BurnoutByLevel.tsx`](main-dashboard/src/components/BurnoutByLevel.tsx))

**Current State**: Hardcoded multi-cycle/level data

**Available Backend Data**:
- ✅ `p1.burnout` (1-5 scale) - Available in both worker and supervisor diagnostics
- ✅ `p1.weeklyHrs` - Available for correlation
- ✅ `p1.enthusiasm` - Available in supervisor diagnostics
- ✅ `p4.enthusiasm` - Available in worker diagnostics (days per month feeling energetic)
- ✅ Employee role/level from `employees` table
- ✅ Department information for segmentation

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/burnout-by-level
// Calculation:
// 1. Group diagnostics by employee role/level (Executive, Mid-Management, Frontline)
// 2. Calculate average burnout score per level
// 3. Convert 1-5 scale to percentage (e.g., 3/5 = 60%)
// 4. Track historical cycles for trend analysis
// 5. Compare against industry benchmarks (can be stored in config)
```

**Data Quality**: ⭐⭐⭐⭐⭐ Excellent - Direct field available

---

### 2. **Trust Decay Curve** ([`TrustDecayCurve.tsx`](main-dashboard/src/components/TrustDecayCurve.tsx))

**Current State**: Hardcoded multi-cycle trust data with projections

**Available Backend Data**:
- ✅ `p1.orgHealth` (1-10 scale) - Proxy for trust
- ✅ `p3.comfortRaisingConcerns` (supervisor view) - Trust indicator
- ✅ `p3.comfortSharing` (supervisor view) - Trust indicator
- ✅ `p4.voiceSuppression` (worker view) - Inverse trust indicator
- ✅ Historical diagnostics with `created_at` timestamps for cycle tracking

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/trust-decay
// Calculation:
// 1. Create composite trust score from:
//    - orgHealth (40% weight)
//    - comfortRaisingConcerns (30% weight)
//    - comfortSharing (20% weight)
//    - (10 - voiceSuppression) (10% weight)
// 2. Group by audit cycles (using created_at timestamps)
// 3. Calculate decay rate between cycles
// 4. Project future cycles using linear regression
// 5. Identify critical threshold crossings
```

**Data Quality**: ⭐⭐⭐⭐ Very Good - Composite calculation needed

---

### 3. **Cognitive Economy Model** ([`CognitiveEconomyModel.tsx`](main-dashboard/src/components/CognitiveEconomyModel.tsx))

**Current State**: Hardcoded time allocation model

**Available Backend Data**:
- ✅ `p4.meetingRatio` (% of time in meetings) - Worker diagnostics
- ✅ `p3.meetingsVsFocus` (% meetings vs focus time) - Supervisor diagnostics
- ✅ `activityDetails` array with:
  - `percentTime` - Time allocation per activity
  - `contrib` - Contribution level (High/Med/Low)
  - `energy` - Energy level (1-5)
  - `skillMatch` - Match/Stretched/Overqualified
- ✅ `p1.legacyBurden` (% time on legacy systems)

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/cognitive-economy
// Calculation:
// 1. Aggregate all activityDetails across workforce
// 2. Categorize activities into:
//    - Strategic Work (High contrib + High energy + Match/Stretched)
//    - Deep/Creative (Low meeting ratio + High energy)
//    - Collaborative Work (Medium contrib + team activities)
//    - Meetings (from meetingRatio field)
//    - Internal Friction (Low contrib + Low energy + Overqualified)
//    - Admin & Overhead (legacyBurden + low contrib activities)
//    - Recovery/Idle (calculated from remaining time)
// 3. Calculate current vs optimal allocation
// 4. Estimate cognitive waste cost (time * avg salary)
```

**Data Quality**: ⭐⭐⭐⭐ Very Good - Rich activity data available

---

### 4. **Employer Brand Health** ([`EmployerBrandHealth.tsx`](main-dashboard/src/components/EmployerBrandHealth.tsx))

**Current State**: Hardcoded internal vs external sentiment data

**Available Backend Data**:
- ✅ `p1.orgHealth` - Internal health score
- ✅ `p4.enthusiasm` - Internal sentiment indicator
- ⚠️ External sentiment - NOT AVAILABLE (would need external API integration)

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/employer-brand
// Calculation:
// 1. Internal HSI (Health Sentiment Index):
//    - Average orgHealth across all diagnostics
//    - Weight by enthusiasm scores
//    - Track by cycle
// 2. External Sentiment:
//    - OPTION A: Mock/placeholder until external API integrated
//    - OPTION B: Manual input field for HR to update quarterly
//    - OPTION C: Integrate with Glassdoor/Indeed APIs (future)
// 3. Calculate divergence gap
// 4. Track trend over cycles
```

**Data Quality**: ⭐⭐⭐ Good - Internal data available, external needs integration

---

### 5. **Cultural Contagion DNA** ([`CulturalContagionDNA.tsx`](main-dashboard/src/components/CulturalContagionDNA.tsx))

**Current State**: Hardcoded cohort behavior patterns

**Available Backend Data**:
- ⚠️ Previous employer information - NOT AVAILABLE in current schema
- ✅ `department_name` - Available for grouping
- ✅ `p1.burnout` - Behavior pattern indicator
- ✅ `p4.voiceSuppression` - Behavior pattern indicator
- ✅ NLP signals from `nlp_signals` table - Sentiment patterns

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/cultural-contagion
// Requirements:
// 1. ADD FIELD to employees table: previous_employer (TEXT)
// 2. ADD FIELD to employees table: hire_date (DATE)
// 3. Calculation:
//    - Group employees by previous_employer
//    - Identify behavioral patterns per cohort (burnout, voice suppression, NLP sentiment)
//    - Measure pattern spread to employees from different employers
//    - Calculate contagion intensity and radius
//    - Identify critical spreading cohorts
```

**Data Quality**: ⭐⭐ Fair - Requires schema extension

---

### 6. **Shadow Organisation** ([`ShadowOrganisation.tsx`](main-dashboard/src/components/ShadowOrganisation.tsx))

**Current State**: Hardcoded informal network data

**Available Backend Data**:
- ✅ `p4.alternateContact` - Who workers go to for help (worker diagnostics)
- ✅ Organizational hierarchy from `employees` table (manager field)
- ✅ `activityDetails` with engagement levels
- ⚠️ Influence scoring - Needs calculation algorithm

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/shadow-organization
// Calculation:
// 1. Build formal org chart from employees.manager relationships
// 2. Build informal network from:
//    - p4.alternateContact mentions (who people actually go to)
//    - Cross-department collaboration patterns
//    - Activity engagement levels
// 3. Calculate influence scores:
//    - Formal authority (position in hierarchy)
//    - Informal mentions (how often referenced as alternateContact)
//    - Cross-functional reach (departments influenced)
//    - Engagement levels from supervisor audits
// 4. Identify shadow leaders (high informal, low formal authority)
// 5. Map influence network
```

**Data Quality**: ⭐⭐⭐⭐ Very Good - Alternate contact field is key

---

### 7. **Inaction Cost Clock** ([`InactionCostClock.tsx`](main-dashboard/src/components/InactionCostClock.tsx))

**Current State**: Hardcoded NLP/cost data

**Available Backend Data**:
- ✅ `p4.blockers` (free text) - Worker diagnostics
- ✅ `p3.blockers` (free text) - Supervisor diagnostics
- ✅ NLP signals from `nlp_signals` table with urgency scores
- ✅ Salary data from `roles` table (min_salary, max_salary)
- ✅ `p1.weeklyHrs` - For capacity calculations

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/inaction-cost
// Calculation:
// 1. Aggregate all blockers from diagnostics
// 2. Use NLP urgency_score to prioritize
// 3. Calculate cost per blocker:
//    - Affected employees * avg hourly rate * estimated hours lost
// 4. Track accumulation over time (days since first reported)
// 5. Categorize by department and severity
// 6. Calculate total annual cost projection
```

**Data Quality**: ⭐⭐⭐⭐⭐ Excellent - NLP already processing blockers

---

### 8. **Cultural Contagion Signal** (Inline component in [`CultureAndPerception.tsx`](main-dashboard/src/components/CultureAndPerception.tsx))

**Current State**: Hardcoded NLP resignation language detection

**Available Backend Data**:
- ✅ `nlp_signals` table with full NLP analysis
- ✅ `sentiment`, `sentiment_score`, `sentiment_detail`
- ✅ `urgency`, `urgency_score`, `urgency_detail`
- ✅ `signal`, `signal_emoji`, `signal_label`
- ✅ `interpretation` field
- ✅ Department and employee tracking

**Implementation Path**:
```javascript
// Backend endpoint needed: GET /api/culture/contagion-signals
// Calculation:
// 1. Query nlp_signals for resignation-related patterns:
//    - Sentiment: negative
//    - Keywords: "not recognised", "looking elsewhere", "no growth", "disconnected"
// 2. Group by department and time period
// 3. Calculate trend (% change vs previous cycle)
// 4. Identify top phrases from raw_text
// 5. Correlate with other metrics (perception gap, burnout)
// 6. Flag departments with accelerating negative sentiment
```

**Data Quality**: ⭐⭐⭐⭐⭐ Excellent - NLP infrastructure already exists

---

## Summary Table

| Component | Current State | Backend Data Available | Complexity | Priority | Data Quality |
|-----------|---------------|------------------------|------------|----------|--------------|
| Voice Suppression | ✅ Live | ✅ Yes | - | - | ⭐⭐⭐⭐⭐ |
| Dark Energy Report | ✅ Live | ✅ Yes | - | - | ⭐⭐⭐⭐⭐ |
| Burnout by Level | 🔴 Hidden | ✅ Yes | Low | High | ⭐⭐⭐⭐⭐ |
| Trust Decay Curve | 🔴 Hidden | ✅ Yes | Medium | High | ⭐⭐⭐⭐ |
| Cognitive Economy | 🔴 Hidden | ✅ Yes | Medium | High | ⭐⭐⭐⭐ |
| Employer Brand | 🔴 Hidden | ⚠️ Partial | Medium | Medium | ⭐⭐⭐ |
| Cultural Contagion DNA | 🔴 Hidden | ⚠️ Needs Schema | High | Low | ⭐⭐ |
| Shadow Organisation | 🔴 Hidden | ✅ Yes | High | Medium | ⭐⭐⭐⭐ |
| Inaction Cost Clock | 🔴 Hidden | ✅ Yes | Low | High | ⭐⭐⭐⭐⭐ |
| Contagion Signal | 🔴 Hidden | ✅ Yes | Low | High | ⭐⭐⭐⭐⭐ |

---

## Recommended Implementation Order

### Phase 1: Quick Wins (1-2 days)
1. **Burnout by Level** - Direct field mapping
2. **Inaction Cost Clock** - NLP data already available
3. **Cultural Contagion Signal** - NLP infrastructure exists

### Phase 2: Medium Complexity (3-5 days)
4. **Trust Decay Curve** - Composite scoring needed
5. **Cognitive Economy Model** - Activity categorization logic

### Phase 3: Advanced Features (5-7 days)
6. **Shadow Organisation** - Network analysis algorithms
7. **Employer Brand Health** - Internal data + external integration planning

### Phase 4: Future Enhancement (Requires Schema Changes)
8. **Cultural Contagion DNA** - Needs previous_employer field added

---

## Required Backend Endpoints

```javascript
// New endpoints to create in server.js:

// 1. GET /api/culture/burnout-by-level
// Returns: { levels: [{ label, pct, industry, trend, note }], timestamp }

// 2. GET /api/culture/trust-decay
// Returns: { cycles: [{ cycle, trust, projected }], decayRate, criticalIn }

// 3. GET /api/culture/cognitive-economy
// Returns: { categories: [{ label, current, optimal, color }], totalWaste, costPerYear }

// 4. GET /api/culture/employer-brand
// Returns: { cycles: [{ cycle, internal, external }], gap, trend }

// 5. GET /api/culture/shadow-organization
// Returns: { nodes: [...], edges: [...], shadowLeaders: [...] }

// 6. GET /api/culture/inaction-cost
// Returns: { totalCost, costPerDay, topBlockers: [...], byDepartment: [...] }

// 7. GET /api/culture/contagion-signals
// Returns: { signals: [{ dept, pct, trend, phrases: [...] }] }
```

---

## Database Schema Enhancements (Optional)

```sql
-- For Cultural Contagion DNA feature:
ALTER TABLE employees ADD COLUMN previous_employer TEXT;
ALTER TABLE employees ADD COLUMN hire_date DATE;

-- For historical trend tracking:
CREATE TABLE culture_metrics_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER REFERENCES companies(id),
    metric_type TEXT, -- 'burnout', 'trust', 'cognitive_economy', etc.
    cycle_number INTEGER,
    metric_data TEXT, -- JSON blob
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Conclusion

**8 out of 9 hidden indicators** can be powered up with existing backend data:

- ✅ **5 indicators** can be implemented immediately with existing data
- ⚠️ **2 indicators** need medium complexity calculations but data exists
- ⚠️ **1 indicator** needs partial external integration
- 🔴 **1 indicator** requires schema changes for full functionality

The backend server already captures rich diagnostic data that can power most of the Culture & Perception tab. The main work is creating aggregation endpoints and calculation logic, not data collection.
