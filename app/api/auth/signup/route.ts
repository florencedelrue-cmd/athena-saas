import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server";
import { createStripeCustomer } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { schoolName, email, password } = await request.json();

    if (!schoolName || !email || !password) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: schoolName,
        plan: "free",
        subscription_status: "inactive",
      })
      .select()
      .single();

    if (schoolError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: schoolError.message }, { status: 500 });
    }

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email,
      school_id: school.id,
      role: "admin",
    });

    if (userError) {
      await supabase.from("schools").delete().eq("id", school.id);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    try {
      const stripeCustomerId = await createStripeCustomer({
        email,
        schoolName,
        schoolId: school.id,
      });

      await supabase
        .from("schools")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", school.id);
    } catch (stripeErr) {
      console.error("Stripe customer creation failed:", stripeErr);
    }

    return NextResponse.json({ success: true, schoolId: school.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Interne serverfout bij registratie." },
      { status: 500 }
    );
  }
}
