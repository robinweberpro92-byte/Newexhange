import { getBrandSettings } from "@/lib/branding";

type BaseEmailProps = {
  title: string;
  intro?: string;
  children: React.ReactNode;
  footerNote?: string;
};

export async function BaseEmail({ title, intro, children, footerNote }: BaseEmailProps) {
  const brand = await getBrandSettings();

  return (
    <div style={{ background: "#07111a", padding: "32px 0", fontFamily: "Inter, Arial, sans-serif", color: "#f5f7fb" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))" }}>
          <div style={{ padding: 28, background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`, color: "#07111a" }}>
            <div style={{ display: "inline-block", padding: "10px 14px", borderRadius: 16, background: "rgba(7,17,26,0.12)", fontWeight: 800 }}>
              {brand.logoText}
            </div>
            <h1 style={{ margin: "18px 0 0", fontSize: 28, lineHeight: 1.2 }}>{title}</h1>
            <p style={{ margin: "10px 0 0", opacity: 0.82 }}>{brand.brandName} • {brand.tagline}</p>
          </div>

          <div style={{ padding: 28 }}>
            {intro ? <p style={{ marginTop: 0, lineHeight: 1.7, color: "#b8c2d6" }}>{intro}</p> : null}
            <div>{children}</div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: 24, color: "#95a2b8", fontSize: 14 }}>
            <p style={{ margin: 0 }}>{footerNote ?? brand.footerText}</p>
            <p style={{ margin: "10px 0 0" }}>{brand.supportEmail}{brand.supportPhone ? ` • ${brand.supportPhone}` : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
