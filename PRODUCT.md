# Flexpin1 HMI — Product Context

## Product Purpose

Industrial machine HMI (Human-Machine Interface) for the Flexpin1 automatic pin-insertion system used in ceramic tile production lines. Operators monitor and command multiple machine subsystems in real time from a fixed workstation mounted near the production floor.

## Register

product

## Users

- **Operatore**: floor-level machine operator; reads machine state, triggers guided procedures, responds to alarms. Limited command authority. Proficient with the physical machine; not a software expert.
- **Admin**: shift supervisor or process engineer; configures recipes, adjusts parameters, reviews logs. Intermediate authority.
- **Superadmin**: maintenance engineer or integrator; full system access including destructive commands, calibration, override.

## Environment

Single fixed 1920×1080 touchscreen panel mounted at eye level in a bright industrial environment. Ambient light is high (overhead fluorescent + reflected tile surfaces). Operators wear gloves. Touch targets must be generous. Sessions last hours; the interface is always on. The scene: a machine operator in a coverall checking pin-insertion status mid-production-run under factory lighting at 8am.

## Brand tone

Calm authority. Industrial precision. No decorative flourishes that could distract during an alarm. Confidence, not consumer friendliness. Labels are in Italian (primary) with English fallback.

## Anti-references

- Consumer dashboards (Stripe, Linear, Vercel) — too airy, too chat-like
- Dark SaaS observability tools (Datadog, Grafana) — too monitoring-centric, wrong ambient assumption
- Medical imaging UIs — wrong domain associations

## Strategic principles

- Status always visible; never hidden behind a click
- Hierarchy: machine-level > subsystem-level > component-level
- Destructive or mode-changing actions require explicit confirmation
- Guided procedures take over the full viewport; no modals
- Minimum 44px touch target on all interactive elements
