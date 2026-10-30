import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateMolarMass, FormulaError } from '@/lib/chemistry/calculator';
export const runtime = 'nodejs';
const Request = z.object({
  operation: z.literal('molar_mass'),
  formula: z.string().min(1).max(128),
}).strict();
export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({status:'invalid',code:'INVALID_JSON',message:'Request body must be valid JSON.'},{status:400}); }
  const parsed = Request.safeParse(input);
  if (!parsed.success) return NextResponse.json({status:'invalid',code:'INVALID_INPUT',message:'Provide operation=molar_mass and a formula of at most 128 characters.'},{status:400});
  try { return NextResponse.json(calculateMolarMass(parsed.data.formula)); }
  catch (error) {
    if (error instanceof FormulaError) return NextResponse.json({status:'unsupported',code:'UNSUPPORTED_FORMULA',message:error.message},{status:422});
    return NextResponse.json({status:'error',code:'INTERNAL_ERROR',message:'Calculation failed.'},{status:500});
  }
}
