# Domain model and chemical language

- Element: atomic-number-defined chemical species (H, O); atomic weight references include intervals/uncertainties where relevant.
- Atom/isotope/ion: individual entity with isotope, charge and electronic state as applicable. Do not confuse atomic mass with standard atomic weight.
- Substance: actual chemical form with molecular/formula units, phase and identity (H2(g), O2(g), O3(g), H2O(l)); distinct from choosing element symbols.
- Chemical formula: parsed composition with stoichiometric counts, nested groups, hydrates, optional charge and isotopic specifications. Formula alone cannot guarantee a material's structure.
- Mixture: substances present without assumed reaction.
- Reaction: balanced transformations with known participants, conditions, catalysts, direction, evidence and applicability limits.
- Equation: symbolic reactants/products with atom and charge conservation; mathematically balanced is not evidence that reaction occurs.
- Condition set: temperature, pressure, solvent, phase, concentration, catalyst and other model-specific inputs.
- Quantity: value plus unit, uncertainty/precision and species reference.
- Calculation: selected operation with validated inputs, method, derived steps, outputs and source provenance.
- Reference record: immutable dataset ID/version, measured or evaluated value, units, source/license and retrieval date.
- Support status: computed | insufficient_input | ambiguous | unsupported | invalid. Avoid unsupported “confidence” percentages.

## Input principles
The click UI selects elements to explore; choosing a reaction requires explicit substances and applicability/conditions. H + O must not silently become H2 + O2. Results may be exact symbolic expressions, approximate numerical quantities, intervals or not computable; label appropriately.
