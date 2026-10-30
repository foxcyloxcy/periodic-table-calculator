/** Reference atomic weights (abridged MVP dataset; values in g/mol).
 * CIAAW/IUPAC conventional rounded weights for classroom molar-mass calculations.
 * Not isotope masses or guaranteed fixed natural abundance. A scientific-source
 * license/version review is required before declaring this production certified.
 */
export const DATASET_VERSION = 'mvp-abridged-2026-10-31';
export const atomicWeights: Readonly<Record<string, number>> = Object.freeze({
  H:1.008, He:4.0026, Li:6.94, Be:9.0122, B:10.81, C:12.011,
  N:14.007, O:15.999, F:18.998, Ne:20.180, Na:22.990,
  Mg:24.305, Al:26.982, Si:28.085, P:30.974, S:32.06,
  Cl:35.45, Ar:39.948, K:39.098, Ca:40.078,
  Fe:55.845, Cu:63.546, Zn:65.38, Br:79.904, Ag:107.8682,
  I:126.90447, Ba:137.327, Au:196.96657,
});
export const DATASET_SOURCE = 'CIAAW standard atomic weights (rounded educational reference; manual review pending)';
