/** Formatting only: never compatibility-fold superscripts, charges or isotopes. */
export function normalizeFormulaNotation(input:string):string {
 const digits='₀₁₂₃₄₅₆₇₈₉';
 return input.trim().replace(/[₀-₉]/g,digit=>String(digits.indexOf(digit)));
}

/** Explicit capability boundaries; unsupported syntax must never lose tokens. */
export function unsupportedFormulaNotation(input:string):string|null {
 if(/(?:->|→|⇌|=)/.test(input))return 'Reaction equations are not supported here. Enter one neutral chemical formula.';
 if(/[·⋅•.]/.test(input))return 'Hydrates, dot-separated formulas and decimal atom counts are not supported yet. Hydration water must not be omitted to obtain a result.';
 if(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻^]/.test(input))return 'Superscript isotope or charge notation is not supported yet. Subscript atom counts such as H₂O are supported.';
 if(/[+-]/.test(input))return 'Charged ions and plus-separated species are not supported yet. Enter one neutral formula; do not remove an ionic charge to obtain a result.';
 if(/[\[\]{}]/.test(input))return 'Square-bracket and brace notation is not supported yet. Neutral formulas with parentheses, such as Ca(OH)2, are supported.';
 return null;
}
