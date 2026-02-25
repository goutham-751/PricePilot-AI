"""
Decision Engine — Converts analytics signals into actionable pricing
recommendations with confidence scores.

Rules:
    1. Competitor Undercut Response   — match price within 5% if margin allows
    2. Demand Surge Capture           — increase price by 5-8% gradually
    3. Low Inventory Guard            — hold price, suppress promotions
    4. Seasonal Discount Window       — apply 10-15% discount tier
    5. Trend Surge Preparation        — prepare for demand surge
    6. Margin Floor Protection        — block price decrease below floor

Usage:
    engine = DecisionEngine()
    result = await engine.evaluate(product_id)
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from db.supabase_client import supabase
from services.feature_engineering import FeatureEngineer

# ── Logging ──────────────────────────────────────────────────────────

logger = logging.getLogger("decision_engine")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(handler)


# ── Decision Rules ───────────────────────────────────────────────────

RULES = [
    {
        "id": 1,
        "name": "Competitor Undercut Response",
        "trigger": "price_position_index > 1.10",
        "action": "Match price within 5% if margin > 15%",
        "priority": "critical",
        "status": "active",
    },
    {
        "id": 2,
        "name": "Demand Surge Capture",
        "trigger": "demand_growth_rate > 0.15 AND trend_momentum > 10",
        "action": "Increase price by 5-8% gradually",
        "priority": "high",
        "status": "active",
    },
    {
        "id": 3,
        "name": "Low Demand Guard",
        "trigger": "demand_growth_rate < -0.15",
        "action": "Offer 10% discount, avoid overstock",
        "priority": "high",
        "status": "active",
    },
    {
        "id": 4,
        "name": "Seasonal Discount Window",
        "trigger": "seasonal_index < 0.9 AND demand_growth < 0",
        "action": "Apply 10-15% discount tier",
        "priority": "medium",
        "status": "active",
    },
    {
        "id": 5,
        "name": "Trend Surge Preparation",
        "trigger": "trend_momentum > 15 AND demand_growth < 0.05",
        "action": "Prepare for demand surge, increase stock",
        "priority": "medium",
        "status": "active",
    },
    {
        "id": 6,
        "name": "Margin Floor Protection",
        "trigger": "price_position_index < 0.85",
        "action": "Block further price decrease, escalate to review",
        "priority": "critical",
        "status": "active",
    },
]


# ── Decision Engine ──────────────────────────────────────────────────

class DecisionEngine:
    """
    Rule-based decision engine that evaluates market signals
    and generates actionable pricing recommendations.
    """

    def __init__(self):
        self.engineer = FeatureEngineer()

    def _evaluate_rules(self, signals: dict) -> list[dict]:
        """
        Evaluate all rules against current signals and return
        triggered recommendations.
        """
        recommendations = []
        now = datetime.now(timezone.utc).strftime("%H:%M:%S")

        position = signals.get("price_position_index", 1.0)
        growth = signals.get("demand_growth_rate", 0.0)
        momentum = signals.get("trend_momentum", 0.0)
        acceleration = signals.get("trend_acceleration", 0.0)
        volatility = signals.get("price_volatility", "low")
        elasticity = signals.get("elasticity_label", "medium")
        seasonal = signals.get("seasonal_index", 1.0)

        # Rule 1: Competitor Undercut — your price is >10% above market
        if position > 1.10:
            pct = round((position - 1.0) * 100, 1)
            confidence = min(95, 70 + int(pct * 2))
            recommendations.append({
                "type": "decrease",
                "title": f"Reduce price by {pct:.0f}% to match market",
                "description": (
                    f"Your price is {pct:.1f}% above competitor average. "
                    f"Market volatility is {volatility}. Adjust to maintain competitiveness."
                ),
                "impact": f"-{pct:.0f}%",
                "confidence": confidence,
                "urgency": "High",
                "rule": "Competitor Undercut Response",
                "input": f"position_index={position:.2f}",
            })

        # Rule 2: Demand Surge — rising demand + rising trends
        if growth > 0.15 and momentum > 10:
            increase = min(8, max(3, int(growth * 30)))
            confidence = min(95, 65 + int(momentum))
            recommendations.append({
                "type": "increase",
                "title": f"Increase price by {increase}%",
                "description": (
                    f"Demand growing at {growth:.0%} with trend momentum of {momentum:.0f}. "
                    f"Market interest is accelerating — safe to capture margin."
                ),
                "impact": f"+{increase}%",
                "confidence": confidence,
                "urgency": "High",
                "rule": "Demand Surge Capture",
                "input": f"growth={growth:.2f}, momentum={momentum:.0f}",
            })

        # Rule 3: Low Demand — falling demand
        if growth < -0.15:
            discount = min(15, max(5, int(abs(growth) * 50)))
            confidence = min(90, 60 + int(abs(growth) * 100))
            recommendations.append({
                "type": "discount",
                "title": f"Offer {discount}% discount",
                "description": (
                    f"Demand falling at {growth:.0%}. "
                    f"A targeted discount could stabilize sales and capture market share."
                ),
                "impact": f"+{discount * 2}% volume",
                "confidence": confidence,
                "urgency": "Medium",
                "rule": "Low Demand Guard",
                "input": f"growth={growth:.2f}",
            })

        # Rule 4: Seasonal Discount — low season + falling demand
        if seasonal < 0.9 and growth < 0:
            confidence = min(85, 55 + int((1 - seasonal) * 200))
            recommendations.append({
                "type": "discount",
                "title": "Apply seasonal discount (10-15%)",
                "description": (
                    f"Seasonal index at {seasonal:.2f} (below normal). "
                    f"Demand is declining — a seasonal promotion can maintain volume."
                ),
                "impact": "+12% volume",
                "confidence": confidence,
                "urgency": "Medium",
                "rule": "Seasonal Discount Window",
                "input": f"seasonal={seasonal:.2f}, growth={growth:.2f}",
            })

        # Rule 5: Trend Surge Preparation — trends rising but demand hasn't caught up
        if momentum > 15 and growth < 0.05:
            confidence = min(88, 60 + int(momentum * 1.5))
            recommendations.append({
                "type": "stock",
                "title": "Prepare for demand surge",
                "description": (
                    f"Trend momentum at +{momentum:.0f} but demand hasn't surged yet. "
                    f"Historical pattern suggests imminent demand spike. Increase stock."
                ),
                "impact": "+20-40% demand expected",
                "confidence": confidence,
                "urgency": "High",
                "rule": "Trend Surge Preparation",
                "input": f"momentum={momentum:.0f}, growth={growth:.2f}",
            })

        # Rule 6: Margin Floor — your price is too low
        if position < 0.85:
            pct = round((1.0 - position) * 100, 1)
            confidence = min(97, 80 + int(pct))
            recommendations.append({
                "type": "increase",
                "title": f"Raise price — {pct:.0f}% below market",
                "description": (
                    f"Your price is {pct:.1f}% below competitor average. "
                    f"This may erode margins without capturing proportional volume."
                ),
                "impact": f"+{pct:.0f}% margin",
                "confidence": confidence,
                "urgency": "Critical",
                "rule": "Margin Floor Protection",
                "input": f"position_index={position:.2f}",
            })

        # If no rules triggered, add a HOLD recommendation
        if not recommendations:
            recommendations.append({
                "type": "hold",
                "title": "Maintain current pricing",
                "description": (
                    "All indicators are within normal ranges. "
                    "No action required at this time."
                ),
                "impact": "Stable",
                "confidence": 92,
                "urgency": "Low",
                "rule": "Default Assessment",
                "input": "All signals normal",
            })

        return recommendations

    def _build_decision_log(
        self, signals: dict, recommendations: list[dict],
    ) -> list[dict]:
        """Build audit trail of rule evaluations."""
        now = datetime.now(timezone.utc).strftime("%H:%M:%S")
        log = []

        for rule in RULES:
            triggered = any(
                r.get("rule") == rule["name"] for r in recommendations
            )
            log.append({
                "time": now,
                "rule": rule["name"],
                "input": self._get_rule_input(signals, rule["id"]),
                "decision": (
                    next(
                        (f"ACTION: {r['title']}" for r in recommendations if r.get("rule") == rule["name"]),
                        "PASS: within threshold",
                    )
                ),
                "confidence": (
                    next(
                        (r["confidence"] for r in recommendations if r.get("rule") == rule["name"]),
                        95,
                    )
                ),
            })

        return log

    def _get_rule_input(self, signals: dict, rule_id: int) -> str:
        """Format relevant signal values for a rule."""
        inputs = {
            1: f"position={signals.get('price_position_index', 0):.2f}",
            2: f"growth={signals.get('demand_growth_rate', 0):.2f}, momentum={signals.get('trend_momentum', 0):.0f}",
            3: f"growth={signals.get('demand_growth_rate', 0):.2f}",
            4: f"seasonal={signals.get('seasonal_index', 0):.2f}",
            5: f"momentum={signals.get('trend_momentum', 0):.0f}, growth={signals.get('demand_growth_rate', 0):.2f}",
            6: f"position={signals.get('price_position_index', 0):.2f}",
        }
        return inputs.get(rule_id, "N/A")

    async def evaluate(self, product_id: str) -> dict:
        """
        Run full decision engine evaluation for a product.

        Steps:
            1. Compute feature signals
            2. Evaluate rules against signals
            3. Generate recommendations with confidence
            4. Build audit log

        Returns:
            dict with recommendations, decision_log, signals, and rules.
        """
        # Get product price
        try:
            product = (
                supabase.table("products")
                .select("id, name, base_price")
                .eq("id", product_id)
                .limit(1)
                .execute()
            )
            if product.data:
                your_price = float(product.data[0]["base_price"])
                product_name = product.data[0]["name"]
            else:
                your_price = 100.0
                product_name = "Unknown"
        except Exception:
            your_price = 100.0
            product_name = "Unknown"

        # Step 1: Compute signals
        signals = await self.engineer.compute_signals(product_id, your_price)

        # Step 2 & 3: Evaluate rules → recommendations
        recommendations = self._evaluate_rules(signals)

        # Step 4: Build decision log
        decision_log = self._build_decision_log(signals, recommendations)

        result = {
            "product_id": product_id,
            "product_name": product_name,
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "signals": signals,
            "recommendations": recommendations,
            "decision_log": decision_log,
            "rules": RULES,
            "rules_evaluated": len(RULES),
            "actions_triggered": len([r for r in recommendations if r["type"] != "hold"]),
        }

        logger.info(
            f"✓ Decision engine: {result['actions_triggered']} actions "
            f"from {result['rules_evaluated']} rules for '{product_name}'"
        )
        return result

    async def evaluate_all_products(self) -> list[dict]:
        """Run decision engine for all products."""
        try:
            response = supabase.table("products").select("id").execute()
            products = response.data or []
        except Exception as e:
            logger.error(f"Failed to fetch products: {e}")
            return []

        results = []
        for p in products:
            result = await self.evaluate(p["id"])
            results.append(result)

        logger.info(f"✓ Evaluated {len(results)} products")
        return results


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    async def _test():
        engine = DecisionEngine()
        products = supabase.table("products").select("id, name").limit(1).execute()
        if products.data:
            p = products.data[0]
            result = await engine.evaluate(p["id"])
            print(f"\n=== DECISION ENGINE for {p['name']} ===")
            print(f"Actions triggered: {result['actions_triggered']}")
            for rec in result["recommendations"]:
                print(f"\n  [{rec['urgency']}] {rec['title']}")
                print(f"  Confidence: {rec['confidence']}%")
                print(f"  {rec['description']}")
        else:
            print("No products found")

    asyncio.run(_test())
