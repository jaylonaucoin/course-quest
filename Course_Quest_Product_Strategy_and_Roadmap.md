# Course Quest — Product Strategy and Roadmap

**Document version:** 0.1  
**Created / last updated:** September 30, 2026  
**Owner:** Jaylon Aucoin  
**Status:** Working source of truth; product scope, pricing, and priorities remain editable  
**Main repository:** [jaylonaucoin/course-quest](https://github.com/jaylonaucoin/course-quest)

## Contents

- [1. Purpose and authority](#1-purpose-and-authority)
- [2. Product vision](#2-product-vision)
- [3. Audience and jobs to be done](#3-audience-and-jobs-to-be-done)
- [4. Current product baseline](#4-current-product-baseline)
- [5. Competitive context and differentiation](#5-competitive-context-and-differentiation)
- [6. Feature pillar: golf passport and journal](#6-feature-pillar-golf-passport-and-journal)
- [7. Feature pillar: social golf experience](#7-feature-pillar-social-golf-experience)
- [8. Feature pillar: round and shot tracking](#8-feature-pillar-round-and-shot-tracking)
- [9. Feature pillar: smartwatch companion and Health integration](#9-feature-pillar-smartwatch-companion-and-health-integration)
- [10. Feature pillar: AI-assisted caddie](#10-feature-pillar-ai-assisted-caddie)
- [11. Course data and handicap dependencies](#11-course-data-and-handicap-dependencies)
- [12. Proposed technical architecture and data model](#12-proposed-technical-architecture-and-data-model)
- [13. Monetization and revenue scenarios](#13-monetization-and-revenue-scenarios)
- [14. Recommended staged roadmap](#14-recommended-staged-roadmap)
- [15. Validation, launch, and success metrics](#15-validation-launch-and-success-metrics)
- [16. Release and operational requirements](#16-release-and-operational-requirements)
- [17. Risks and mitigations](#17-risks-and-mitigations)
- [18. Decision register and open questions](#18-decision-register-and-open-questions)
- [19. Current execution checklist](#19-current-execution-checklist)
- [20. Instructions for future development work](#20-instructions-for-future-development-work)
- [21. Maintaining this source of truth](#21-maintaining-this-source-of-truth)
- [22. Source register](#22-source-register)

## 1. Purpose and authority

This document consolidates Course Quest’s existing product, proposed improvements, commercial assessment, technical dependencies, and recommended development sequence. It is intended for ongoing planning and as context for development tools such as Cursor and Claude Code.

It records the vision without treating every idea as a committed requirement. A feature appearing here does not mean it has been implemented, scheduled, or validated with users.

### Status vocabulary

| Label | Meaning |
|---|---|
| **Current** | Observed in the GitHub source reviewed on September 30, 2026; runtime behavior may still require verification. |
| **Proposed** | An improvement Jaylon explicitly raised. |
| **Recommended** | A suggested product or engineering approach; not yet a final decision. |
| **Open** | A question requiring a choice, research, or user validation. |
| **Validated** | Supported by recorded user behavior, production results, or completed testing. Do not use this label without evidence. |
| **Deferred** | Deliberately excluded from the current milestone; may be reconsidered. |

### Evidence boundaries

- The code review covered the default branch’s README, repository structure, production-readiness document, package configuration, core journal/map screens, API integration, and portions of data handling.
- The running iPhone app was not tested. This document is not a comprehensive code audit or an App Store readiness certification.
- No active-user counts, retention data, subscription sales, acquisition costs, or profitability figures were supplied.
- Competitor descriptions and provider policies are a dated research snapshot. Recheck them before relying on them for implementation or commercial decisions.
- GitHub source is authoritative for implemented behavior. This document is authoritative for recorded product intent and decisions. Resolve discrepancies explicitly rather than silently treating plans as completed work.

## 2. Product vision

### Current foundation

Course Quest is a mobile golf journal that helps golfers visually track the courses they have played and preserve their experiences through rounds, scores, notes, photos, weather, and a map.

### Proposed long-term vision

Expand Course Quest into a connected golf companion combining:

1. A personal golf passport and photo journal.
2. Social sharing and interaction between golfers.
3. Live round and shot tracking.
4. A smartwatch companion.
5. Personalized AI-assisted caddie advice using the golfer’s actual data and current situation.
6. Potential future official handicap integration and partnerships.

### Recommended positioning to test

**Course Quest helps golfers remember their golf journey, understand their own game, and make better decisions on the course.**

The passport provides immediate value, tracking builds useful personal data, and the caddie turns that data into actionable advice. Social features connect experiences and help distribution.

The product should remain useful when a golfer has no friends using it and has not accumulated enough shot data for personalized recommendations.

### Central commercial hypothesis

A reliable product used throughout repeated rounds could support a stronger subscription proposition than a course journal alone. This increases potential revenue, but also engineering scope, operational expense, and direct competition.

This is a hypothesis, not evidence of willingness to pay.

## 3. Audience and jobs to be done

| Audience | What they want | Relevant product capabilities |
|---|---|---|
| Course collectors and golf travelers | Remember where they played and plan where to go next | Passport, unique-course map, photos, wishlists, trip collections |
| Recreational golfers interested in improvement | Understand distances, mistakes, and opportunities without complicated tools | Simple scoring, shots, club statistics, post-round insights |
| Watch-owning golfers | Record useful information without repeatedly taking out their phone | Wrist scoring, manual shot marking, yardages where supported |
| Regular golf groups | Share experiences and follow their usual playing partners | Friends, shared rounds, comments, group visibility |

**Recommended initial audience:** golfers who play multiple courses and enjoy preserving their experiences. This is closest to the current app and offers a smaller initial scope.

**Open:** whether the first commercial release should emphasize course collecting, game improvement, or both. Marketing should lead with one clear benefit rather than a list of unrelated features.

Important user tasks:

- “Record all the courses I played before I downloaded this app.”
- “Save today’s round and photos quickly.”
- “See my golf journey on a map.”
- “Know how far I usually hit each club.”
- “Understand what actually cost me strokes.”
- “Choose a sensible shot for this situation.”
- “Share this experience with the people I golf with.”

## 4. Current product baseline

| Area | Current source-level capability | Qualification |
|---|---|---|
| Mobile foundation | React Native with Expo, Firebase, and React Native Paper | React Native/Expo development foundation exists; release behavior needs device testing. |
| Accounts | Email/password authentication and account-management screens | Production-readiness document also describes password reset, verification, reauthentication, and deletion. Verify end-to-end. |
| Apple sign-in | Implementation described in the readiness document | Document says its UI is hidden pending Apple Developer setup; do not call it enabled or release-ready. |
| Round journal | Course, date, score, tees, holes, notes, and photos | Adding a round requires score and tees, and selection of a searchable course. |
| Feed | Personal rounds with photos, notes, score, and weather | Not a social feed. |
| Map | Clustered markers generated from saved rounds | A marker represents a round, rather than an explicitly modeled unique course collection. |
| Course lookup | Google Places search and course-location details | Not a hole-layout or golf-scorecard database. |
| Weather | Open-Meteo forecast/archive requests | Weather enrichment is coupled to the add-round flow. Commercial service access needs review. |
| Persistence | Firestore, Firebase Storage, and local caching code | Offline claims in the readiness document need native-device verification; adding rounds depends on network APIs. |
| Preferences | Themes and measurement-unit support | Readiness document records hardcoded units in map callouts as an outstanding issue. |
| Monetization | No purchase implementation identified in the reviewed files | No demonstrated payment, entitlement, or subscription flow. |
| Advanced features | No implementation identified for the proposed social network, live shot tracking, watch companion, or AI caddie | These remain proposed scope. |

### Highest-impact product gap

The app’s course-collection purpose is constrained by its round-entry requirements. A golfer may remember playing a course years ago without remembering the score, tees, or precise date.

**Recommended:** create separate flows for **Add played course** and **Log round**. A played course must not require a fabricated score or date.

### Existing readiness work

The repository’s [production-readiness document](https://github.com/jaylonaucoin/course-quest/blob/main/docs/PRODUCTION_READINESS.md) records issues including immediate deletion without confirmation, inconsistent error handling, input validation, onboarding, and missing features.

Use that document as an input to a fresh release audit, not as proof that older “fixed” items work on current native builds. Its proposed feature priorities are not automatically the strategy in this document.

## 5. Competitive context and differentiation

| Product | Relevant overlap | Implication for Course Quest |
|---|---|---|
| Birdied | Free played-course tracking, rounds, wishlists, world map, country stamps, and exports | Basic passport tracking faces a free substitute. [S1] |
| Course Vaults | Course passports, reviews, maps, friends, and discovery | Course collecting and social discovery already have direct competitors. [S2] |
| Golf Course Passport | Photos, course maps, achievements, and trip planning; Canadian listing includes annual purchase options at C$19.99 and C$24.99 | Supports comparison with paid passport products, but listed products do not establish sales or profitability. [S3] |
| 18Birdies | Community features, watch swing detection, and personalized club recommendations using distances and conditions | Combining social, tracking, and caddie functionality is not itself a unique proposition. [S4–S6] |
| Golfshot | Automatic Apple Watch shot tracking and related on-course functionality | Watch automation competes with established products. [S7] |
| Golf Canada | GPS course maps, score/stat tracking, and official Handicap Index access | Official handicap services and local course utility are already represented. [S8] |

### Recommended differentiation hypotheses

- Easier historical course entry and a better personal golf journal.
- A coherent experience across passport, round, watch, and insights.
- Advice based on actual club-distance distributions and shot outcomes, explained clearly.
- Useful performance insights without requiring excessive manual input.
- A stronger experience for a specific community or region, if user research supports that focus.

These are hypotheses to test against the competitors. Neither an attractive map nor an AI label establishes a defensible advantage.

**Open question:** why would someone switch from their existing golf app, or deliberately use Course Quest alongside it?

## 6. Feature pillar: golf passport and journal

**Status:** Current foundation; recommended expansion.

### Recommended first-release scope

- Quick entry of a previously played course, with optional approximate date or unknown date.
- Separate counts for unique courses and total rounds.
- One course page containing all of the user’s visits, photos, and notes.
- A personal map of unique courses, with clear distinction between played and wished-for courses.
- Search/filter by course and date where dates are known.
- Wishlists and user-created collections, such as “Cape Breton trip” or “Courses to play next year.”
- Export/backup for personal records.
- Shareable course, trip, or passport cards with explicit control over what is included.

### Later possibilities

- Province/state/country milestones.
- Annual golf recaps and photo albums.
- Regional course challenges.
- Curated lists, subject to appropriate rights for any third-party rankings or content.

### Acceptance criteria

- A golfer can add a course without knowing a score, tees, or exact date.
- Repeated rounds at one course increase the round count without inflating the unique-course count.
- Unknown data remains unknown; the app never creates invented historical information.
- Users can correct course matches and handle different courses within one golf facility.
- Private journal content stays private unless deliberately shared.

## 7. Feature pillar: social golf experience

**Status:** Proposed by Jaylon.

### Intended experience

Expand the personal feed into an experience where golfers can share rounds, course visits, photos, and milestones; follow friends; and interact with their golf community.

### Recommended initial scope

- Friend/follow relationships, with the exact model still open.
- Explicit round/post visibility: private, selected group/friends, or public if public posting is introduced.
- A feed focused on the golfer’s existing connections.
- Reactions and comments.
- Invitations to a regular golf group.
- Optional identification of playing partners, respecting their visibility and consent.
- Reporting, blocking, deletion, and moderation tools before public user-generated content launches. Apple’s review requirements apply. [S12]

### Defer initially

- Direct messages and group chat.
- A global algorithmic feed.
- Public forums, marketplaces, leagues, and complex tournaments.
- Large video uploads and creator monetization.

### Commercial role and risks

Social features may increase retention and referrals, but a new feed can feel empty. Existing apps already have community functionality. The launch experience should work for an individual or a small foursome rather than requiring an established global network.

Moderation, notifications, abuse prevention, feed costs, and privacy are ongoing product responsibilities, not just UI work.

### Acceptance criteria

- Private-to-shared changes are intentional and understandable.
- Blocking changes both visibility and interaction permissions.
- Deleted or revoked content is handled consistently across feeds and notifications.
- Live location and Health data are not exposed as an accidental consequence of sharing a round.
- A golfer with zero connections still receives the app’s core personal value.

## 8. Feature pillar: round and shot tracking

**Status:** Proposed by Jaylon.

### Recommended progression

| Stage | Capability | Purpose |
|---|---|---|
| 1 | Hole-by-hole scores, putts, and penalties | Establish a dependable live-round workflow. |
| 2 | Manual shot marking with location, club, and optional lie/outcome | Gather understandable, correctable shot data. |
| 3 | Club-distance summaries and shot history | Deliver value before automatic tracking or AI. |
| 4 | Watch-assisted entry | Reduce phone interaction. |
| 5 | Automatic swing detection with review and corrections | Reduce entry further without treating detections as perfect truth. |

### Important distinctions

- A detected wrist movement is a **candidate swing**, not a confirmed counted golf shot.
- A wrist sensor does not directly measure where the ball lands, its launch conditions, or its full flight path.
- Distance between recorded shot positions must not be labeled as measured carry distance.
- Club identification may require user selection or a clearly labeled estimate.
- Practice swings, provisional balls, penalties, missed detections, and putting require explicit handling.
- Correcting data is part of the core tracking experience.

18Birdies documents detection limitations for short chips, putts, unusual swings, and connection issues, as well as cases where club assignments require correction. Course Quest should set similarly realistic expectations rather than promise perfect tracking. [S6]

### Recommended data-quality rules

- Store measurement type, source, timestamp, and confidence/quality status.
- Preserve raw detections separately from user-confirmed shots.
- Distinguish full swings from partial shots when producing club summaries.
- Show sample counts and avoid presenting sparse data as a stable personal average.
- Define how mishits, penalties, and obvious GPS errors affect each statistic.
- Explain which statistics use measured, entered, or inferred data.

### Acceptance criteria

- A round remains usable after a missed shot or connection interruption.
- Users can add, remove, reposition, and reassign a shot.
- Round and hole scores reconcile with shots, putts, and penalties using documented rules.
- Club statistics update after corrections.
- Logging does not require a user to invent information they did not record.

## 9. Feature pillar: smartwatch companion and Health integration

**Status:** Proposed by Jaylon.

### Recommended first platform and scope

Start with Apple Watch if the initial launch targets the App Store. Wear OS remains an open expansion decision rather than a simultaneous requirement.

First watch features:

- Display the active hole and round state.
- Enter scores, putts, and penalties.
- Mark a shot and select a club.
- Display distance information only where adequate course geometry is available.
- Show connection, GPS, and synchronization status without disrupting play.
- Allow review or correction on the phone.

Automatic swing detection and advanced caddie interactions should follow a reliable manual workflow.

### Technical direction

The React Native/Expo phone app can remain the main mobile foundation. A watchOS companion is a separate native app, likely written in Swift/SwiftUI, with an integration layer connecting it to the iPhone app. This requires native project/build work beyond an Expo Go-only workflow.

Apple’s Watch Connectivity framework supports transfer between the watchOS and companion iOS apps. Design for delayed transfer as well as immediate interaction. [S9]

**Open:** the exact Expo native integration/build workflow, standalone-watch requirements, and supported watch models. Prove these in a small technical spike before promising capability.

### Engineering requirements

- Stable IDs and idempotent synchronization so retries do not duplicate shots.
- Clear ownership of active-round state and conflict resolution.
- Local persistence of pending watch events.
- Recovery from backgrounding, phone separation, app restart, and lost internet.
- Battery measurements across realistic full rounds.
- Permissions and background behavior tested on real hardware.

### Apple Health integration

Potential features include recording an eligible golf workout and displaying useful activity information, such as duration or supported health metrics, where appropriate.

Treat this as optional user value. Request only the Health permissions required by the chosen feature. Keep Health data separate from public golf activity, and do not use it for advertising targeting. Apple imposes specific restrictions on Health data handling. [S13]

**Recommended:** do not send Health data to the AI provider by default. Golf-performance context can initially rely on scores, shots, and course information.

### Acceptance criteria

- Users can complete the intended watch workflow without constant phone interaction.
- Sync retries do not create duplicate rounds or shots.
- Connection loss has a tested recovery path.
- Battery targets are measured and documented before release claims are made.
- Denying Health access leaves ordinary golf functionality usable.

## 10. Feature pillar: AI-assisted caddie

**Status:** Proposed by Jaylon; recommended main premium hypothesis.

### Product goal

Give advice grounded in the golfer’s own history and current situation, rather than generic golf tips.

Potential context:

| Context | Examples | Reliability requirement |
|---|---|---|
| Player | Clubs, typical distances, dispersion, recurring misses, preferences | Record sample size and distinguish supplied estimates from measured data. |
| Round | Hole, tee, score, penalties, recent shots | Use current, reconciled round state. |
| Position and target | GPS position, selected target, green/hazard geometry | Account for accuracy and whether exact pin position is known. |
| Conditions | Wind, temperature, elevation, course conditions | Record freshness and source; local conditions may differ. |
| Situation | Lie, obstacles, recovery needs, intended risk level | Ask the user where it cannot be observed reliably. |

### Example intended outcome

“Your driver’s typical right miss brings the hazard into play. A 5-wood leaves a longer approach but provides a larger margin for error.”

This is an illustrative product example, not a validated Course Quest output or a claim that the necessary data is currently available.

### Recommended architecture

1. Normalize trusted context into structured data.
2. Calculate yardages, statistics, data sufficiency, and candidate choices in ordinary application/backend code.
3. Apply a documented strategy model and identify uncertainty.
4. Let the AI explain supported choices and answer relevant follow-up questions.
5. Validate the output against the available facts and supported action types.

Do not delegate basic score arithmetic, geospatial measurements, or authoritative personal statistics to free-form language generation. AI explanations should not invent club distances, hazards, lies, wind, or exact pin positions.

### Recommended progression

| Stage | Experience | Why start here |
|---|---|---|
| A | Post-round summary based on scores and recorded statistics | Easier to inspect and less dependent on live course geometry. |
| B | Personal distance and tendency explanations based on shots | Builds useful individualized context. |
| C | Before-round preparation and course-specific suggestions | Requires suitable course information and history. |
| D | Situational recommendations during play | Requires dependable live state, geometry, latency, and data quality. |
| E | Watch-based caddie interaction | Adds constrained UI, connectivity, and potentially voice requirements. |

A score-only summary must not claim to know whether putting, driving, or approach play caused the result. Advice specificity must match data specificity.

### Quality and operating requirements

- Explain the recommendation briefly and make supporting distances visible.
- Use conservative fallback behavior when data is insufficient or stale.
- Support missing-data prompts without making every shot tedious.
- Keep a useful non-AI tracking experience when internet or inference is unavailable.
- Control inference usage and token/context size; avoid resending an entire account history.
- Version recommendation logic and record enough context to investigate incorrect outputs.
- Minimize personal information sent to model providers and disclose relevant processing.
- Evaluate groundedness and usefulness separately from how persuasive the wording sounds.

### Competition and differentiation

18Birdies already offers club recommendations incorporating tracked distances and changing playing/weather conditions. A chatbot that repeats those inputs is not necessarily an improvement. [S5]

**Hypothesis to test:** Course Quest can give clearer, more trustworthy, more personalized decisions with less effort from the golfer.

### Acceptance criteria

- Recommendations cite only data available in the structured context.
- Insufficient samples trigger explicit uncertainty or a fallback.
- The app never claims an unavailable exact pin, lie, or hazard measurement.
- Representative scenarios are evaluated with real golfers, including poor GPS, sparse history, unusual shots, and connection loss.
- Cost per AI-active user and latency are measured before wide release.

## 11. Course data and handicap dependencies

### Course location is not a course layout

Current Google Places calls provide course identity/location information. A live golf companion may also need:

- Individual course identities within a multi-course facility.
- Hole numbers and routing.
- Tee positions, pars, and distances.
- Green boundaries or front/center/back points.
- Hazard and layup geometry.
- Tee-specific ratings and slope where legitimately available.
- Data update and correction processes.

Evaluate data providers by coverage, accuracy, commercial rights, offline rights, retention restrictions, cost, and support for user corrections. Verify each desired field rather than assuming a provider supplies everything.

### Candidate approaches

| Approach | Benefit | Tradeoff |
|---|---|---|
| Licensed specialist data | Potentially faster coverage | Price, contract limitations, and dependence on provider quality |
| Open geospatial sources | Potentially useful foundation | Uneven completeness and license/attribution obligations |
| Own mapping for a limited launch region | Direct quality control | Significant maintenance and limited initial coverage |
| User contributions | Can fill gaps | Verification, moderation, rights, and correction responsibilities |

No supplier has been selected. Do not build a global-coverage promise before validating actual coverage.

Google Places content has restrictions on storage, caching, attribution, and map display; place IDs are exempt from its caching restrictions. Review the exact applicable terms before treating returned coordinates or other content as a permanently owned course database or displaying them through a different map provider. [S14]

### Handicap direction

Jaylon proposed a future handicap system and a possible Golf Canada partnership.

Separate:

- Personal score trends and clearly described performance estimates.
- An authorized official Handicap Index service or score-posting integration.

Golf Canada states that use of its administered World Handicap System and Course Rating System, including associated marks, is restricted to member clubs. This does not establish an available developer API or a confirmed integration path for Course Quest. Obtain appropriate authorization and verify applicable terms before promising an official handicap feature. [S10]

**Recommended:** ship useful performance statistics first. Investigate official integration later. Do not make a Golf Canada partnership a prerequisite for the core app, or assume it would include all course-map data.

## 12. Proposed technical architecture and data model

**Status:** Recommended direction; not an implementation specification.

### Architecture boundaries

| Component | Responsibility |
|---|---|
| Phone app | Journal, map, round UI, editing, settings, social interactions |
| Native watch app | Wrist interaction, location/sensor events, pending local data |
| Backend | Authentication enforcement, authorized data access, social operations, provider mediation, entitlements |
| Data integrations | Course data, weather, and any later authorized handicap integration |
| Statistics/strategy layer | Deterministic measurements, aggregates, quality checks, and recommendation inputs |
| AI layer | Grounded explanations and summaries with controlled usage |

Retaining Firebase is a reasonable starting option, not a final architectural constraint. Evaluate new requirements before either expanding the current backend or migrating it. Protect billable/provider secrets and enforce access on trusted server-side paths where needed.

### Conceptual entities

| Entity | Purpose |
|---|---|
| User/profile | Identity, preferences, privacy settings, golf bag references |
| Course/facility | Stable identity, provider references, provenance, permitted geometry |
| Played-course entry | Course collection independent of a scored round; supports uncertain historical dates |
| Round/hole result | Active/completed state, tees, scores, putts, penalties, conditions |
| Shot | Confirmed shot, club, position, type, outcome, measurement quality |
| Sensor event | Raw watch detection distinct from a confirmed shot |
| Club | User bag, supplied distances, observed statistics, sample counts |
| Collection/wishlist | User-organized courses and trip plans |
| Social post | Deliberately shared projection of journal/round content |
| Connection/comment/reaction/report | Social relationships, interactions, and moderation |
| Caddie result | Input references, model/logic version, supported output, uncertainty |
| Entitlement | Verified paid capabilities and subscription state |

### Design principles

- Use stable IDs and explicit provider provenance; obey data retention terms.
- Separate private records from their shared projections.
- Keep measured, supplied, inferred, and unknown values distinguishable.
- Preserve correction history where it materially affects derived statistics.
- Version schemas and migrations rather than assuming existing records contain new fields.
- Design deletion/export across photos, rounds, posts, and derived data.
- Treat local caches and watch synchronization as engineering work requiring real-device validation.

## 13. Monetization and revenue scenarios

### Commercial assessment

The current app is a credible foundation for an independent paid product. There is no evidence yet that its present experience will attract enough paying golfers to be profitable.

The expanded vision could justify higher willingness to pay through repeated on-course utility. It also increases competition with established golf platforms, data expenses, inference costs, watch support, and maintenance.

### Recommended model to test

| Layer | Potential scope | Decision status |
|---|---|---|
| Free | Useful basic passport, journal, and selected sharing/tracking features | Exact limits open; preserve enough value to establish a habit. |
| Passport premium | Richer photo/trip experiences, collections, recaps, presentation options | C$19.99/year is an initial pricing hypothesis, not a selected launch price. |
| Game/caddie premium | Advanced statistics, personalized analysis, eventual on-course caddie/automation | Packaging and price open; validate after these features are useful. |

Do not promise unlimited lifetime cloud storage or AI usage without modeling ongoing costs. A paid download or one-time upgrade remains an alternative for a smaller product, but recurring service expenses still need funding.

For App Store digital feature unlocks, design purchases and entitlements according to current Apple requirements and the relevant storefront rules. [S12]

### Illustrative annual subscription scenarios

These are arithmetic scenarios, not forecasts, market benchmarks, or a promise of achievable subscriber counts. The C$49.99 column illustrates sensitivity to price for a more capable product; it is not an approved price or demonstrated willingness to pay.

| Paying annual subscribers | Gross at C$19.99/year | After 15% commission | Gross at C$49.99/year | After 15% commission |
|---:|---:|---:|---:|---:|
| 100 | C$1,999 | ≈ C$1,699 | C$4,999 | ≈ C$4,249 |
| 500 | C$9,995 | ≈ C$8,496 | C$24,995 | ≈ C$21,246 |
| 1,000 | C$19,990 | ≈ C$16,992 | C$49,990 | ≈ C$42,492 |

The 15% commission assumes eligibility and approved enrollment in Apple’s Small Business Program. It is not automatic merely because revenue is small. [S11]

All figures exclude hosting, storage, APIs, inference, customer acquisition, refunds, applicable taxes/adjustments, developer membership, support, and development time. Annual subscription receipts and annualized revenue should not be confused with monthly subscription cash flow.

### Costs to model before committing to pricing

- Course-data licensing and commercial usage rights.
- Google Places/search and map costs where applicable.
- Firebase reads/writes, image storage, and downloads.
- Weather subscription requirements.
- AI usage by both average and heavy users.
- Moderation, notifications, support, and monitoring.
- App distribution and payment costs.
- Acquisition spending and renewal/churn behavior.
- Costs created by free users as well as paid users.

The app currently calls Open-Meteo’s free hosted endpoints. Its pricing page describes the free API as noncommercial and historical weather access as requiring Professional or higher commercial access. Confirm current terms and costs before monetized release. Options include changing providers, making weather optional, or reducing scope. [S15]

### Useful unit-economics model

**Contribution per paying user = receipts after platform fees and adjustments − variable service cost per paying user − allocated cost of supporting free usage.**

Subtract fixed costs, acquisition, support, and development costs to assess actual profit. Revenue alone is not evidence of a viable business.

Advertising and partnerships are possible later options, not assumed launch income. Avoid an ad model that undermines the journal experience or conflicts with Health-data restrictions.

## 14. Recommended staged roadmap

This sequence is a recommendation. Dates, engineering estimates, release commitments, and budgets have not been selected.

| Milestone | Scope | Exit evidence |
|---|---|---|
| M0 — Validate positioning | Interview golfers, compare alternatives, select first audience, research course data/costs | Clear problem statement and documented reasons users might choose Course Quest |
| M1 — Useful passport release | Historical entry, unique courses, grouped visits, search, privacy, export, onboarding, essential release fixes | Real users can build their passport and return after another round |
| M2 — Dependable live tracking | Hole scoring, manual shots, club bag, correction workflow, basic statistics | Complete rounds produce understandable and correctable data |
| M3 — Personalized analysis | Grounded post-round summaries and distance/tendency explanations | Users find outputs useful; correctness and inference cost are measured |
| M4 — Watch companion | Scoring and manual shots, sync recovery, battery testing | Full-round use on real watches with documented reliability |
| M5 — Advanced tracking/caddie | Automatic detection, validated geometry, situational recommendations | Accuracy, correction burden, latency, and usefulness justify a paid offering |
| M6 — Broader community/integrations | Larger social scope, additional watch platforms, potential official handicap integration | Adoption and authorized dependencies support expansion |

Lightweight sharing/friend features may move earlier if interviews show they drive adoption. M6 means broader community functionality, not a requirement to postpone every social feature until all caddie work is complete.

### Scope guidance

- Passport improvements are closest to the current foundation.
- Live shots and basic watch functionality require significant new product and engineering work.
- Dependable automatic detection and situational advice are major development programs.
- A full social network creates ongoing operational obligations.
- Official handicap access is partly an external authorization problem rather than just a calculation feature.

These are relative assessments, not delivery estimates. Estimate concrete milestones only after resolving their dependencies.

## 15. Validation, launch, and success metrics

### Recommended initial test

Recruit roughly 30–50 golfers who play different courses. This is a suggested manageable test group, not a statistical guarantee or required market benchmark.

Observe whether they:

1. Enter historical courses successfully.
2. Log a real subsequent round.
3. Return without prompting.
4. Use the map/journal to recall or share an experience.
5. Encounter a reason to prefer another app.
6. Actually purchase an offered premium experience.

Treat “I would pay” as weaker evidence than an actual purchase. Track limited beta results separately from broad-market claims.

### Metrics register

| Metric | Definition to establish | What it helps answer |
|---|---|---|
| Activation | For example, completing a passport entry or first round; choose one definition | Do new users reach value? |
| Next-round retention | Return/use after the next real playing opportunity | Does it become a golf habit? |
| Passport completion | Historical entry success and courses added | Is onboarding rewarding or tedious? |
| Round completion | Started rounds that produce usable completed records | Is tracking dependable? |
| Correction burden | Manual corrections/time required for shots | Does automation save effort? |
| Caddie quality | Groundedness, user usefulness, and inappropriate recommendations | Is advice trustworthy? |
| Watch reliability | Sync failures, missing events, and measured battery consumption | Is wrist use practical? |
| Paid conversion/renewal | Actual purchases and renewals with cohort definitions | Does value sustain payment? |
| Service cost | Cost per free, paying, and AI-active user | Are margins sustainable? |
| Social adoption | Invitations leading to active connections and meaningful sharing | Does social improve adoption? |

Golf is seasonal and intermittent. Define retention around playing opportunities as well as calendar periods. Do not interpret winter inactivity as identical to abandonment.

### Launch approach

- Start with a controlled beta and a limited feature promise.
- Consider a focused region/community for distribution and course-data quality.
- Use journal/map sharing as a possible discovery mechanism.
- Pursue larger paid acquisition only after understanding activation, retention, conversion, and acquisition economics.
- Expand promises when the supporting evidence exists.

**Open:** initial geography, release season/date, channels, beta budget, and acceptable commercial outcome for a side project.

## 16. Release and operational requirements

These are delivery requirements tied to the proposed functionality, not evidence that the present app has passed them.

- Audit current authentication, account deletion, permissions, Firestore/Storage rules, and private-data access.
- Verify native offline behavior rather than relying on documentation or browser-oriented persistence assumptions.
- Add deletion confirmation/undo and useful feedback for failed reads/writes.
- Make course search, weather, and photo failures recoverable; optional enrichment should not unnecessarily block saving a valid record.
- Protect billable APIs, control usage, and monitor unexpected costs.
- Provide a privacy policy, relevant consent flows, and accurate App Store disclosures.
- Implement purchase verification, restoration, entitlement updates, and failure states before charging for digital features.
- Implement reporting/blocking/moderation before public social content.
- Validate data-provider licensing, attribution, retention, and offline permissions.
- Measure performance and battery on representative iPhones/watches.
- Test deletion/export across associated content and derived records.
- Document what happens when a subscription expires without unnecessarily trapping a user’s existing records.

The existing Expo foundation does not require an automatic rewrite. Architecture changes should follow demonstrated requirements and technical spikes.

## 17. Risks and mitigations

| Risk | Why it matters | Recommended response |
|---|---|---|
| Undifferentiated feature set | Incumbents already offer many proposed capabilities | Validate a concrete reason to choose Course Quest. |
| Scope expansion | Five major pillars can consume development without proving demand | Deliver small milestones with measurable outcomes. |
| Empty social experience | Value depends on other users joining | Preserve individual value and start with existing golf groups. |
| Poor course coverage | Live distances and strategy depend on accurate geometry | Validate a focused coverage area before global claims. |
| Tracking errors | Bad shots produce bad statistics and advice | Make correction easy and preserve provenance/confidence. |
| Persuasive but incorrect AI | Users may trust fluent explanations unsupported by data | Calculate facts separately and evaluate groundedness. |
| Watch battery/sync problems | A full round is a demanding reliability test | Start manual, test on hardware, and persist pending events. |
| Thin subscription margins | Photos, data, weather, and inference cost money | Model free-user load, heavy use, and fixed expenses. |
| Partnership dependency | Access may be unavailable or slow | Keep the initial product useful without a Golf Canada agreement. |
| Privacy/moderation burden | Social, location, and Health data broaden responsibilities | Build explicit visibility and required operational tooling. |

## 18. Decision register and open questions

### Recorded direction

| ID | Statement | Status |
|---|---|---|
| D01 | Keep Course Quest’s golf-course journal/passport foundation visible in planning. | Current foundation; recommended continuity |
| D02 | Explore a full social aspect beyond the personal feed. | Proposed by Jaylon |
| D03 | Explore live rounds and smartwatch-assisted shot tracking. | Proposed by Jaylon |
| D04 | Explore a contextual AI-assisted caddie using personal and situational data. | Proposed by Jaylon |
| D05 | Explore a smartwatch companion and optional Apple Health integration. | Proposed by Jaylon |
| D06 | Explore a later handicap system and potential Golf Canada relationship. | Proposed by Jaylon; external access unconfirmed |
| D07 | Use this Markdown document as an editable planning source. | Requested by Jaylon |

### Questions to resolve

- [ ] What is the first audience and single primary launch promise?
- [ ] Is the first paid release a passport, a tracking app, or a combined product?
- [ ] Which features are free versus premium?
- [ ] What price and purchase model will be tested?
- [ ] What time and operating budget is acceptable before validation?
- [ ] Which course-data source covers the target region with adequate rights?
- [ ] Does weather earn its expense, and should it be optional?
- [ ] How should course/facility identities and historical entries be modeled?
- [ ] Are connections mutual friends, followers, or both?
- [ ] What privacy default and social moderation process should ship?
- [ ] Which watch models and standalone behaviors will be supported?
- [ ] What tracking accuracy and correction burden are acceptable?
- [ ] Which AI provider, data policy, latency, and usage limits fit the product?
- [ ] What data is sufficient for each recommendation type?
- [ ] What authorized official handicap path, if any, is available?
- [ ] What measured outcome justifies expanding beyond the first release?

### Decision-entry template

When a decision is made, append a row with its date, rationale, and evidence. Keep rejected alternatives only when they explain a meaningful tradeoff.

| ID | Date | Decision | Rationale / evidence | Revisit trigger |
|---|---|---|---|---|
| D08 | TBD | TBD | TBD | TBD |

## 19. Current execution checklist

These are recommended next actions, not completed tasks or mandatory implementation authorization.

- [ ] Select the initial audience and positioning hypothesis.
- [ ] Conduct a small number of problem/competitor interviews.
- [ ] Audit the current app on a real iPhone and reconcile readiness documentation.
- [ ] Specify quick historical entry and unique-course behavior.
- [ ] Research course-data coverage, rights, and costs.
- [ ] Estimate M1 and set a development/operating budget.
- [ ] Define beta activation and next-round retention metrics.
- [ ] Ship a limited beta and observe actual use.
- [ ] Test payment for a concrete premium experience.
- [ ] Run a small watch integration spike before promising automatic tracking.
- [ ] Update this document with evidence and revised priorities.

## 20. Instructions for future development work

Use this section when supplying the document to coding assistants.

- Read the current repository and applicable project instructions before editing code.
- Treat Proposed, Recommended, and Open entries as planning context, not completed functionality or a command to implement the entire vision.
- Follow the user’s current implementation request and selected milestone.
- Keep existing journal and account data compatible unless an intentional migration is included.
- Do not fabricate course geometry, historical scores, sensor measurements, or AI context.
- Preserve the distinction between course collections, rounds, sensor events, and confirmed shots.
- Keep private data access and paid entitlements enforced beyond the client UI.
- Use full tabs for newly authored code indentation, consistent with Jaylon’s preference.
- Validate relevant behavior on real devices when location, watch, Health, or offline functionality is involved.
- Update the document’s feature status and changelog after changes, identifying the evidence used.
- Record unresolved limitations instead of marking a feature complete based solely on UI presence.

## 21. Maintaining this source of truth

After each meaningful change:

1. Update the last-updated date and version.
2. Change affected feature statuses with supporting evidence.
3. Record final decisions in the decision register.
4. Revise the roadmap around the selected scope.
5. Add actual validation results separately from hypothetical revenue scenarios.
6. Recheck supplier/competitor facts when they affect a current choice.

### Validation-results template

| Date / cohort | What was tested | Observed result | Interpretation / limits | Next change |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

### Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09-30 | Consolidated current-source observations, Jaylon’s proposed product pillars, commercial scenarios, recommended sequence, dependencies, and open decisions. No new feature implementation or user validation claimed. |

## 22. Source register

Research snapshot: September 30, 2026. Links describe the sources used, not endorsement or confirmed supplier/partner access. Prices, features, and policies may change.

### Repository evidence

- [Main repository and README](https://github.com/jaylonaucoin/course-quest)
- [Production-readiness assessment](https://github.com/jaylonaucoin/course-quest/blob/main/docs/PRODUCTION_READINESS.md)
- [AddRoundScreen.js](https://github.com/jaylonaucoin/course-quest/blob/main/src/screens/AddRoundScreen.js)
- [HomeScreen.js](https://github.com/jaylonaucoin/course-quest/blob/main/src/screens/HomeScreen.js)
- [MapScreen.js](https://github.com/jaylonaucoin/course-quest/blob/main/src/screens/MapScreen.js)
- [APIController.js](https://github.com/jaylonaucoin/course-quest/blob/main/src/utils/APIController.js)
- [DataController.js](https://github.com/jaylonaucoin/course-quest/blob/main/src/utils/DataController.js)
- [package.json](https://github.com/jaylonaucoin/course-quest/blob/main/package.json)

### External primary sources

| ID | Source | Used for |
|---|---|---|
| S1 | [Birdied press kit](https://birdied.app/press) | Free passport/tracking functionality |
| S2 | [Course Vaults](https://www.coursevaults.com/) | Course passport, reviews, maps, and social overlap |
| S3 | [Golf Course Passport — Canadian App Store](https://apps.apple.com/ca/app/golf-course-passport/id6757707994) | Passport features and listed purchase prices; not sales estimates |
| S4 | [18Birdies Community Feed and Activity Sharing](https://help.18birdies.com/article/564-community-feed-and-activity-sharing) | Social feed overlap |
| S5 | [18Birdies Club Recommendations and True Distance](https://help.18birdies.com/article/791-club-recommendations-and-true-distance) | Contextual club recommendations |
| S6 | [18Birdies Apple Watch Auto Swing Detection](https://help.18birdies.com/article/722-how-shot-detection-works-in-18birdies) | Automatic detection, limitations, and corrections |
| S7 | [Golfshot automatic shot tracking](https://golfshot.com/blog/the-app-that-tracks-all-of-your-shots) | Existing watch-tracking competitor |
| S8 | [Golf Canada App](https://www.golfcanada.ca/golf-canada-app/) | Official app capabilities |
| S9 | [Apple Watch Connectivity](https://developer.apple.com/documentation/WatchConnectivity) | Companion data exchange |
| S10 | [Golf Canada Handicapping](https://www.golfcanada.ca/handicapping/) | Official system authorization considerations |
| S11 | [Apple App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/) | Conditional 15% commission and enrollment |
| S12 | [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | Public user-generated content, purchases, and release requirements |
| S13 | [Apple HealthKit: Protecting user privacy](https://developer.apple.com/documentation/HealthKit/protecting-user-privacy) | Health-data handling restrictions |
| S14 | [Google Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies) | Storage, caching, attribution, and map-display considerations |
| S15 | [Open-Meteo pricing](https://open-meteo.com/en/pricing) | Commercial hosted access and historical-weather plan requirements |
