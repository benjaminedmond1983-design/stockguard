import { useState, useEffect } from "react";

const fmt = (n) => (Number(n) % 1 === 0 ? String(n) : Number(n).toFixed(2));

const PLANS = [
  { id: "starter", name: "Starter", price: { monthly: 0, yearly: 0 }, features: ["Up to 25 SKUs", "Receiving and sales log", "Low stock alerts", "CSV import"], color: "#6B7280" },
  { id: "growth", name: "Growth", price: { monthly: 29, yearly: 278.40 }, yearlyMonthly: 23.20, features: ["Up to 500 SKUs", "Everything in Starter", "Profit margin tracking", "CSV export", "AI reorder analysis", "Daily sales summary + 7-day chart", "Tax Center & year-end reports"], color: "#16a34a", popular: true, stripePlans: { monthly: "growth_monthly", yearly: "growth_yearly" } },
  { id: "pro", name: "Pro", price: { monthly: 79, yearly: 758.40 }, yearlyMonthly: 63.20, features: ["Unlimited SKUs", "Everything in Growth", "Business Insights", "Intelligence module", "Shopify integration", "Priority support", "Custom branding", "Tax Center & year-end reports"], color: "#7C3AED", stripePlans: { monthly: "pro_monthly", yearly: "pro_yearly" } },
];

export default function BillingTab({ supabase, userId, userEmail }) {
  const [billing, setBilling] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => { fetchSubscription(); }, [userId]);

  const fetchSubscription = async () => {
    try {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single();
      if (data) setSubscription(data);
    } catch (e) {}
  };

  const handleSubscribe = async (planId, billingPeriod) => {
    const planObj = PLANS.find(p => p.id === planId);
    if (!planObj?.stripePlans) return;
    setCheckoutLoading(planId + "_" + billingPeriod);
    try {
      const res = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_checkout", plan: planObj.stripePlans[billingPeriod], userId, userEmail, successUrl: window.location.origin + "?payment=success", cancelUrl: window.location.origin + "?payment=cancelled" }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Error: " + (data.error || "Unknown"));
    } catch (e) { alert("Error: " + e.message); }
    setCheckoutLoading(null);
  };

  const handleManage = async () => {
    if (!subscription?.stripe_customer_id) return;
    try {
      const res = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_portal", customerId: subscription.stripe_customer_id, returnUrl: window.location.origin }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { alert("Error: " + e.message); }
  };

  const currentPlan = subscription?.plan || "starter";

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1B2B4B", marginBottom: "4px" }}>Billing & Plans</h2>
      <p style={{ color: "#6B7280", marginBottom: "24px" }}>Manage your StockGuard subscription</p>
      {subscription && subscription.plan !== "starter" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "#15803d" }}>Active {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan</div>
            {subscription.current_period_end && <div style={{ fontSize: "13px", color: "#6B7280" }}>Renews {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</div>}
          </div>
          <button onClick={handleManage} style={{ background: "white", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: "500" }}>Manage Subscription</button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", justifyContent: "center" }}>
        <span style={{ fontWeight: billing === "monthly" ? "600" : "400" }}>Monthly</span>
        <div onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")} style={{ width: "52px", height: "28px", background: billing === "yearly" ? "#16a34a" : "#d1d5db", borderRadius: "999px", cursor: "pointer", position: "relative" }}>
          <div style={{ position: "absolute", top: "3px", left: billing === "yearly" ? "27px" : "3px", width: "22px", height: "22px", background: "white", borderRadius: "50%", transition: "left 0.2s" }} />
        </div>
        <span style={{ fontWeight: billing === "yearly" ? "600" : "400" }}>Annual <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "12px", padding: "2px 8px", borderRadius: "999px", fontWeight: "600" }}>Save 20%</span></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {PLANS.map(plan => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = billing === "yearly" ? (plan.yearlyMonthly || 0) : plan.price.monthly;
          const isLoading = checkoutLoading === plan.id + "_" + billing;
          return (
            <div key={plan.id} style={{ border: plan.popular ? "2px solid " + plan.color : "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", position: "relative", background: "white", boxShadow: plan.popular ? "0 4px 20px rgba(0,0,0,0.08)" : "none" }}>
              {plan.popular && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", fontSize: "12px", fontWeight: "600", padding: "4px 14px", borderRadius: "999px" }}>Most popular</div>}
              <div style={{ color: plan.color, fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>{plan.name}</div>
              <div style={{ marginBottom: "20px" }}>
                {plan.price.monthly === 0 ? <span style={{ fontSize: "36px", fontWeight: "800" }}>Free</span> : <><span style={{ fontSize: "36px", fontWeight: "800" }}>${fmt(price)}</span><span style={{ color: "#6B7280" }}>/mo</span>{billing === "yearly" && <div style={{ fontSize: "13px", color: "#6B7280" }}>Billed ${fmt(plan.price.yearly)}/year</div>}</>}
              </div>
              <button onClick={() => { if (isCurrentPlan || !plan.stripePlans) return; handleSubscribe(plan.id, billing); }} disabled={isCurrentPlan || isLoading} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: isCurrentPlan ? "#f3f4f6" : plan.color, color: isCurrentPlan ? "#6B7280" : "white", fontWeight: "600", fontSize: "14px", cursor: isCurrentPlan ? "default" : "pointer", marginBottom: "20px" }}>
                {isLoading ? "Loading..." : isCurrentPlan ? "Current Plan" : plan.price.monthly === 0 ? "Get Started Free" : "Start 14-Day Free Trial"}
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map((f, i) => <div key={i} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#374151" }}><span style={{ color: plan.color, fontWeight: "700" }}>✓</span>{f}</div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
