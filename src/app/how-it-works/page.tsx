import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  { title: "Create your account", text: "Sign up with email + password only. You can complete your profile later." },
  { title: "Choose a method", text: "PayPal, BTC, LTC, USDT, Paysafecard, card or bank transfer — according to availability." },
  { title: "Follow the instructions", text: "Copy the recipient, message/reference and upload proof if the method requires it." },
  { title: "Track the review timeline", text: "Your order moves from submitted to admin review, processing and completion." }
];

export default function HowItWorksPage() {
  return (
    <section className="container-app py-16 md:py-20">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">How it works</p>
        <h1 className="font-display text-4xl font-black text-text md:text-5xl">A professional manual exchange workflow</h1>
        <p className="text-lg leading-8 text-muted">The platform is designed for clear instructions, manual verification when needed, and transparent status updates from admin review to payout.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title} className="space-y-4 p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 font-display text-xl font-black text-text">0{index + 1}</div>
            <h2 className="font-display text-2xl font-black text-text">{step.title}</h2>
            <p className="text-sm leading-7 text-muted">{step.text}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8"><Link href="/dashboard/exchange"><Button size="lg">Start an exchange <ArrowRight className="h-4 w-4" /></Button></Link></div>
    </section>
  );
}
