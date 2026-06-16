import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Registratie is uitgeschakeld. Leerkrachten loggen in met hun Athena-schoolmail. Contacteer ICT voor een account.",
    },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json({ enabled: false });
}
