import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return stripeInstance;
}

export const STRIPE_PLANS = {
  free: {
    name: "Free",
    priceId: null,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
  },
} as const;

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  schoolId: string;
  priceId: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=canceled`,
    metadata: {
      school_id: params.schoolId,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

export async function createStripeCustomer(params: {
  email: string;
  schoolName: string;
  schoolId: string;
}): Promise<string> {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.schoolName,
    metadata: {
      school_id: params.schoolId,
    },
  });

  return customer.id;
}
