import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createCheckoutSession, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Alleen beheerders kunnen een abonnement starten." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const plan = body.plan || "pro";

    if (plan !== "pro") {
      return NextResponse.json({ error: "Ongeldig plan." }, { status: 400 });
    }

    const priceId = STRIPE_PLANS.pro.priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe prijs niet geconfigureerd." },
        { status: 500 }
      );
    }

    const checkoutUrl = await createCheckoutSession({
      customerId: session.school.stripe_customer_id || undefined,
      customerEmail: session.user.email,
      schoolId: session.school.id,
      priceId,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Fout bij aanmaken checkout sessie." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Stripe checkout endpoint. POST to create a session.",
    plans: STRIPE_PLANS,
  });
}
