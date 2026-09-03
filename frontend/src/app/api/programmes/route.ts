import { NextResponse } from 'next/server';
import { IGNOU_PROGRAMMES } from '../../../lib/programmes';

export async function GET() {
  const data = IGNOU_PROGRAMMES.map((p, idx) => ({
    id: idx + 1,
    code: p.code,
    name: p.name,
    category: p.category || 'General',
    active: true
  }));

  return NextResponse.json(data);
}
