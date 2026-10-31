# Formula input validation and suggestions

Purpose: assist formula entry without asserting a chemical reaction, inventing an identity, or treating a proposed formula as correct without confirmation.

## Hardcoded examples vs calculated results
- The **Try** formulas are sample inputs, NOT hardcoded numerical results. The parser computes atom counts, and the CIAAW 2024 atomic-weight table supplies the numerical constants.
- The small PubChem-backed registry contains reviewed **names**, not precomputed molar masses.
- Suggestions are algorithmic: consecutive repeated element symbols can be compacted; uniquely reviewed capitalization can be corrected; bounded edit distance can rank nearby reviewed formula spellings.

## UX rules
1. Repeated element clicks increment terminal atom counts: FeSO → FeSO2 → FeSO3 → FeSO4. Clicking does NOT imply a reaction.
2. FeSOOOO proposes FeSO4 with explicit user confirmation. Both have the same element counts but neither alone establishes sample identity.
3. FeSO5 may suggest nearby reviewed FeSO4, warning that selecting it changes composition and chemical identity.
4. Unknown Xx returns a parser error, not a fabricated mass. When a recognizable symbol spelling is one edit away, show up to the suggestion limit of alternative *valid formula spellings* for explicit user confirmation. Existing elements without standard atomic weights remain unsupported.
5. Valid but unnamed formulas still calculate molar mass, with a separate unverified-name state.
6. Candidate options do not silently rewrite the input or run alternative calculations.

## Suggestion categories
| Reason | Example | Meaning |
|---|---|---|
| Repeated symbols | FeSOOOO → FeSO4 | Same atom count; formatting only |
| Known capitalization | feso4 → FeSO4 | Unique reviewed entry |
| Near reviewed name | FeSO5 → FeSO4 | Different atom count; requires explicit choice |
| Unknown symbol | Xx → Xe (possible symbol spelling) | Invalid input; suggestion requires confirmation, no automatic result |
| Valid formula, unresolved identity | C2H6O | Compute mass but do not invent a name |

## Evidence and future expansion
Suggestions currently draw from five reviewed PubChem formula records; this is not a comprehensive compound database. Broad predictions would require an authorized compound identity dataset with structural isomers, hydration, phases, ion charges and provenance. Never derive a reaction solely from selected elements.
Compaction does not cross parentheses, charges or existing multipliers. Unknown or ambiguous states are first-class outputs; symbol correction choices are limited to supported CIAAW elements and validated with the same parser as the calculator. Future upgrades may offer verified per-token element spellings and more compound choices, but never guess weights.

## Verification
Vitest tests cover repeated clicks, conservation of atom counts, ambiguity, unresolved formulas, and independent numeric computation. CI must pass typecheck, lint, tests and static export; actual browser interaction should also be checked.
