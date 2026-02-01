# Onboarding: Aha Moment & First 30 Seconds

## Aha moment

**The single moment where users first experience core value:**  
Seeing themselves in a trip (created or joined) with a clear next step—e.g. "Mark Your Availability" or "Pick a Weekend"—so they feel the product is *for them* and *actionable*.

- **Created a trip:** Trip exists, invite link ready to share, "Invite More Friends" or "Continue" to plan.
- **Joined a trip:** In the trip plan/dashboard, can mark availability or see group progress.

**Target:** User reaches this moment within **5 minutes** of first landing (sign-in → onboarding → trip plan).

---

## First 30 seconds (after sign-in)

What happens in the first 30 seconds drives word-of-mouth and retention. For WeekendSync:

1. **Immediately after magic-link click:** Redirect to `/onboarding` if no profile, or to `next` / invite flow. No interstitial "Welcome" carousel.
2. **Onboarding screen:** One headline ("Quick setup"), two fields (name required, home city optional), one CTA ("Continue"). No explanation screens—user *does* something (enters name, continues).
3. **If they came from an invite:** After "Continue", auto-join trip and redirect to trip plan. No extra "You're in!" screen unless it’s a single toast.
4. **If they came to create a trip:** Redirect to home or `/trips/new`; one tap to "Create New Trip" and then the create form.

**Principles applied:**
- **Make the first 30 seconds magical:** Minimal steps, no password, no carousel. Name + Continue → trip.
- **Design from onboarding outward:** Onboarding isn’t a separate flow—it’s the bridge from "signed in" to "in a trip."
- **Remove blockers to the aha moment:** Every screen between sign-in and "in a trip" is a potential drop-off. Keep only: onboarding (2 fields) → join or create → trip plan.

---

## Friction to remove or avoid

| Friction | Recommendation |
|----------|----------------|
| Too many onboarding questions | Keep only display name (required) and home city (optional). No "How will you use the product?" etc. |
| Explanation screens before action | No "How it works" carousel before first use. Use short copy on the create form ("How it works" below fold) instead. |
| Delaying the aha moment | Don’t require email verification before trip access. Don’t add steps between "Continue" and trip plan. |
| Carousels / tooltips | Prefer clear CTAs and one primary action per screen. Tooltips only if the product truly needs them. |
| Treating onboarding as separate | Same design system and tone as rest of app; "Quick setup" feels like part of the same product. |

---

## Retention connection

Early retention wins come from **inflecting the early experience**: the user should leave onboarding *in a trip* (joined or created) with one obvious next step. That sets the habit: "Open app → see my trip → do next step." If the first session ends on "Your trips (empty)" or a generic dashboard, retention will suffer. Always route new users into at least one trip (invite join or create) and show the next step (e.g. "Mark Your Availability") on the first screen they see.

---

## Checklist

- [ ] First 30 s: Sign-in → onboarding (or direct to next) with no extra screens.
- [ ] Onboarding: Max 2 fields; "Continue" submits and redirects (join trip if inviteCode, else home/trips/new).
- [ ] Aha moment: User is in a trip with a clear next step within 5 min.
- [ ] No carousels or explanation-only screens before first value.
- [ ] Invite flow: inviteCode preserved through sign-in and onboarding; auto-join then redirect to trip plan.
