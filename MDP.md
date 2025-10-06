# Buraco RL — State & Action I/O Specification (v0.1)

This document defines the **state (observation) and action** interfaces for training/serving RL agents to play **Buraco** in three observability modes and a multi-agent environment. It intentionally excludes model/algorithmic details.

---

## 0. Terminology & Notation

* **Players:** `P0..P3` (seated clockwise). The **learning agent** is always `P0` in observations (seat randomization is handled by the environment).
* **Teams:** `(P0,P2)` vs `(P1,P3)`.
* **Deck:** 108 physical cards (2×52 + 4 Jokers).
* **CardID:** integer in `[0..107]`, uniquely identifying a **physical** card instance (rank, suit, copy).
* **Locations:** mutually exclusive zones (e.g., hands, melds, discard, stock, dead/pot piles).
* **Meld:** a table/run on the table. Each active meld has an index `m_id`.
* **Phases per turn (3 model calls):**

  1. **Draw phase:** choose `DRAW_STOCK` or `PICK_DISCARD`.
  2. **Meld phase:** optionally create/add cards to melds (may be multi-step inside the environment; the *model* is called once and returns a whole plan).
  3. **Discard phase:** choose one card to discard.

---

## 1. Canonical Card Indexing

### 1.1 CardID Layout

* `card_id ∈ {0..107}`
* Deterministic mapping `(rank, suit, copy_index)` → `card_id`
* Ranks: `A,2,3,4,5,6,7,8,9,10,J,Q,K`; Suits: `♣,♦,♥,♠`; Joker has suit `JOKER`.
* Environment supplies a static table for lookups:

```json
CardStatic[108] = {
  "rank": int (0..12),             // A=0,...,K=12
  "suit": int (0..3, or 4=JOKER),
  "is_joker": 0/1,
  "is_wild": 0/1,                  // per rule variant (e.g., 2s wild)
  "rank_value": int,               // scoring rank value
  "seq_index": int                 // for runs ordering (A=0..K=12), joker/2 handled by rules
}
```

---

## 2. Location Model

### 2.1 Coarse Location Set (minimum)

```
H0, H1, H2, H3                       // players’ hands
M0..M_{M_max-1}                      // per-active-meld “bins”, padded
ALLY_DEAD, OPP_DEAD                  // dead/pot piles (or DEAD0/DEAD1 per team)
DISCARD                              // discard pile (ordered)
STOCK                                // draw pile (ordered, face-down)
```

* `M_max` is a fixed upper bound (e.g., 20). Inactive meld slots are masked.

### 2.2 Meld Table

Each active meld `m_id` has features:

```json
MeldTable[M_max] = {
  "active": 0/1,
  "team": int (0=ally, 1=opp),
  "type": int (0=set,1=run,2=unknown),
  "base_rank": int (0..12 or -1),
  "base_suit": int (0..3 or -1),
  "length": int,
  "wild_count": int,
  "is_clean": 0/1,                  // variant-dependent
  "is_canasta": 0/1,
  "owner_last_player": int (0..3)
}
```

---

## 3. Observability Modes

All modes share the same **public** components. Hidden information differs.

### 3.1 Fully Observable (FO)

* The observation contains **exact** locations of all 108 cards (including hidden zones).
* Intended for centralised training or perfect-information variants.

### 3.2 Partial Observable with **Env Memory** (PO-E)

* Observation includes only **public** exact locations (melds, discard) and **probabilistic beliefs** for hidden zones (hands of others, stock, dead piles) **computed by the environment**.
* The belief is per card, per hidden location, summing to 1 for each hidden card.

### 3.3 Partial Observable with **Agent Memory** (PO-A)

* Observation includes only **public** exact locations. **No beliefs** provided.
* Optionally includes a short **event log** (recent observable actions).
* The agent must infer/remember hidden state over time.

---

## 4. Observation Schema (Per-Agent, Per-Call)

### 4.1 Core Tensors

#### 4.1.1 Card-Location Matrix

Binary one-hot over locations for each card:

```
card_location: shape [L, 108], dtype=uint8
  L = 4 (hands) + M_max (melds) + 1 (ALLY_DEAD) + 1 (OPP_DEAD) + 1 (DISCARD) + 1 (STOCK)
```

* **FO:** all 108 columns have exactly one 1 (true location).
* **PO-E:** for hidden locations, put 0 in `card_location`; their mass is in `hidden_belief`.
* **PO-A:** only public zones (melds, discard) are 1; hidden zones are 0.

#### 4.1.2 Stack Position Channels

Continuous position for ordered stacks (0 if not in stack):

```
stack_pos: shape [2, 108], float32
  stack_pos[0, c] = normalized position in DISCARD (top=1.0, bottom→0.0)
  stack_pos[1, c] = normalized position in STOCK   (top unknown -> optional 0)
```

#### 4.1.3 Static Card Features

Provided separately (immutable):

```
card_static: shape [F_card, 108], float32
  // e.g., rank one-hot(13), suit one-hot(5 incl. joker), is_wild(1), rank_value(1), seq_index(1)
```

#### 4.1.4 Meld Table + Mask

```
meld_table: shape [M_max, F_meld], float32
meld_mask:  shape [M_max], uint8              // 1 if meld_table row is active
```

#### 4.1.5 Turn & Match Meta

```
turn_meta: shape [F_meta], float32
  {
    "current_player": one-hot(4),
    "phase": one-hot(3)              // 0=draw,1=meld,2=discard
    "ally_score": float,
    "opp_score": float,
    "ally_canastas": int,
    "opp_canastas": int,
    "ally_dead_available": 0/1,
    "opp_dead_available": 0/1,
    "hand_sizes": one-hot or ints per player,
    "turn_count": int or normalized float,
    "rule_flags": bitfield or one-hot (e.g., wild rules, discard-pickup rule)
  }
```

### 4.2 Hidden Information (mode-specific)

#### 4.2.1 FO: (none)

* Hidden info is already resolved in `card_location`.

#### 4.2.2 PO-E: Belief Tensor

```
hidden_belief: shape [L_hidden, 108], float32  // probabilities (per hidden location)
  L_hidden includes: H1,H2,H3 (others’ hands), STOCK, ALLY_DEAD, OPP_DEAD
  For a card that is not publicly placed: sum over hidden locations == 1
```

#### 4.2.3 PO-A: Event Log (optional)

```
recent_events: shape [K, F_event], float32 or int
  Each row is a tokenized event, e.g.:
    - {type=DRAW_STOCK, player=Pi}
    - {type=PICK_DISCARD, player=Pi, count=n, top_card=cid}
    - {type=DISCARD, player=Pi, card=cid}
    - {type=MELD_NEW, player=Pi, meld_id=m, cards=[cid...]}
    - {type=MELD_ADD, player=Pi, meld_id=m, cards=[cid...]}
```

> **Note:** In PO-A, `hidden_belief` is **absent**.

### 4.3 Action Masks (always provided)

For each call, the environment supplies masks to restrict legal choices:

* `mask_draw_actiontype` for draw phase.
* `mask_meld_actiontype / masks for arguments` for meld phase (see §5.2).
* `mask_discard_card[108]` for discard phase (1 if discarding `card_id` is legal).

Masks are part of the observation payload for the corresponding phase.

---

## 5. Action Interfaces (3 Calls per Turn)

All actions are returned as **JSON-serializable** structures. The environment validates and will reject/clip illegal details, but masks should prevent most illegal outputs.

### 5.1 Draw Phase (Call #1)

**Input (observation):**

* `card_location`, `stack_pos`, `card_static`, `meld_table`, `meld_mask`, `turn_meta`
* Mode-specific: `hidden_belief` (PO-E) or `recent_events` (PO-A)
* `mask_draw_actiontype`: `[2]` (DRAW_STOCK vs PICK_DISCARD). Optional extra flags if discard pickup has sub-modes.

**Output (action):**

```json
{
  "action_type": "DRAW",                 // fixed
  "choice": "DRAW_STOCK" | "PICK_DISCARD"
}
```

### 5.2 Meld Phase (Call #2)

**Input (observation):**

* Same core tensors as above, with phase=meld.
* `meld_table`, `meld_mask` must reference current open melds.
* **Meld legality masks** (all are provided by the environment):

  * `mask_can_meld_new`: 0/1
  * `mask_meld_new_card[H0_size]`: which hand cards are selectable initially
  * `constraints_meld_new`: compact rules (min length, sets/runs rules, wild limits)
  * `mask_can_meld_add[m_id]`: per meld 0/1
  * `mask_meld_add_card[m_id, H0_size]`: hand cards legal to add to meld `m_id`
  * If multiple add operations allowed in one phase, environment will interpret the **plan** (below).

**Output (action):** a **meld plan** executed atomically by the environment:

```json
{
  "action_type": "MELD",
  "ops": [
    {
      "op": "MELD_NEW",
      "cards": [card_id, ...],          // subset of H0, must satisfy constraints
      "as_type": "SET" | "RUN" | "AUTO" // optional hint; env can auto-derive
    },
    {
      "op": "MELD_ADD",
      "meld_id": m_id,
      "cards": [card_id, ...]
    }
    // ... zero or more ops in desired order
  ]
}
```

* Empty `ops` is allowed → the agent chooses to **skip** melding.
* The environment **may stop** interpreting after the first illegal op (no partial effects), or apply **best-effort** up to failure (configurable; specify in env settings).

### 5.3 Discard Phase (Call #3)

**Input (observation):**

* Same core tensors, phase=discard.
* `mask_discard_card[108]`: 1 for each `card_id` in H0 that is legal to discard given current state/rules (e.g., cannot immediately discard the just-picked disallowed card if rule enforces melding first, etc.).

**Output (action):**

```json
{
  "action_type": "DISCARD",
  "card": card_id
}
```

---

## 6. Multi-Agent Environment Specification

### 6.1 Interface

Environment follows a **PettingZoo-style AEC** or **Gymnasium multi-agent** abstraction:

* `env.reset(seed, options)` → returns dict of per-agent observations or starts AEC iterator.

* `env.agents = ["P0","P1","P2","P3"]` (order is current play order).

* **Step loop per turn (AEC):**

  1. Active agent `P_i` receives **Draw observation** → agent returns **Draw action**.
  2. Environment updates state (draw/pick).
  3. Same agent receives **Meld observation** → agent returns **Meld plan**.
  4. Environment applies the plan.
  5. Same agent receives **Discard observation** → agent returns **Discard card**.
  6. Environment applies discard; turn passes to next player.

* **Done/Termination:** at hand end (e.g., a team goes out), `terminations[agent]` set to True; `truncations` for time/step caps.

* **Rewards:** per-agent scalar based on final team score delta (or shaped); returned at `step` and/or at terminal.

### 6.2 Seeding & Reproducibility

* `env.reset(seed)` seeds:

  * Deck shuffling,
  * Seat permutation (then canonicalize observation so learning agent is P0),
  * Tie-breaking randomness.
* `env.state_id` (optional): opaque hash/string allowing deterministic reproduction of a starting state for debugging.

### 6.3 Observation Delivery (Per Agent)

* At each sub-phase, **only the active agent** receives a non-`None` observation by default.
  Optionally, enable **simultaneous observers** (others get passive observations with `phase="other"`) for off-policy experience.

### 6.4 Action Validation & Masks

* Before each call, environment **computes masks** strictly from rules and current state.
* Any submitted action must be **consistent** with masks:

  * If not, environment either:

    * returns `illegal_action=True` with `info.reason`, does **no state change**, and may assign a small penalty (config), **or**
    * auto-clips to the nearest legal action (configurable; discouraged for training).

### 6.5 Info Channel

* `info` may include:

  * `last_event`: compact encoding of what just happened,
  * `illegal_action` flag and reason,
  * `score_breakdown`: tally of points from melds/canastas/penalties,
  * `rule_variant_id`.

### 6.6 Rule Variants (Config)

* Wild rules (2s/jokers), clean/dirty canasta definition,
* Discard pickup rules (full pile, restrictions),
* Dead/pot handling,
* Min cards to open,
* Max melds, max hand size (for masking),
* Whether **Meld phase** allows multiple ops or single op.

Provide a canonical `EnvConfig` (JSON) that fully determines rules & limits.

### 6.7 Teaming & Policies

* `policy_mapping_fn(player_id)` (external to env) can map players to policies.
  Environment is **policy-agnostic**; it just exposes per-agent I/O.

---

## 7. JSON Payload Shapes (Concise)

### 7.1 Observation (generic; fields omitted by mode/phase)

```json
{
  "card_location": [[0/1]],     // [L,108]
  "stack_pos": [[float]],       // [2,108]
  "card_static": [[float]],     // [F_card,108]  (static; may be provided once out-of-band)
  "meld_table": [[float]],      // [M_max,F_meld]
  "meld_mask": [0/1],           // [M_max]
  "turn_meta": [float],         // [F_meta]

  "hidden_belief": [[float]],   // [L_hidden,108]   (PO-E only)
  "recent_events": [[int|float]],// [K,F_event]     (PO-A only)

  "mask_draw_actiontype": [0/1],         // [2]        (draw phase)
  "mask_can_meld_new": 0/1,              // (meld phase)
  "mask_meld_new_card": [0/1],           // [H0_size]
  "constraints_meld_new": {...},         // object with rule constraints
  "mask_can_meld_add": [0/1],            // [M_max]
  "mask_meld_add_card": [[0/1]],         // [M_max, H0_size]
  "mask_discard_card": [0/1]             // [108]      (discard phase)
}
```

### 7.2 Actions

**Draw:**

```json
{ "action_type": "DRAW", "choice": "DRAW_STOCK" }
```

or

```json
{ "action_type": "DRAW", "choice": "PICK_DISCARD" }
```

**Meld:**

```json
{
  "action_type": "MELD",
  "ops": [
    {"op":"MELD_NEW","cards":[12,37,89],"as_type":"SET"},
    {"op":"MELD_ADD","meld_id":2,"cards":[44]}
  ]
}
```

**Discard:**

```json
{ "action_type": "DISCARD", "card": 73 }
```

---

## 8. Event Encoding (for PO-A optional `recent_events`)

Define a compact, fixed-width encoding to avoid ragged arrays:

```
type: int         // 0=DRAW_STOCK,1=PICK_DISCARD,2=DISCARD,3=MELD_NEW,4=MELD_ADD
player: int       // 0..3
top_card: int     // -1 if N/A
count: int        // e.g., cards taken from discard; -1 if N/A
meld_id: int      // -1 if N/A
cards_hash: int   // hash of cards involved (or first card_id if single); -1 if N/A
pad: ints         // to reach F_event fixed length
```

Environment also exposes a verbose event object via `info.last_event` for debugging/logging.

---

## 9. Invariants & Validation

* Each `card_id` appears in **exactly one** location (FO) or in **public + hidden belief** that sums to 1 (PO-E).
* `meld_mask[i]=0` ⇒ `meld_table[i]` contents are ignored and not targetable by actions.
* `mask_*` fields are **authoritative**; actions must respect them.
* On `reset()`, hands/discard/stock are consistent with `card_location` and `stack_pos`.
* Seat permutation is applied **before** canonicalization (agent → P0).

---

## 10. Versioning & Extensibility

* `spec_version: "0.1"`
* Reserved fields:

  * `mask_special`: for rule-specific exceptions,
  * `op_extra`: freeform object per op for house rules,
  * `telemetry`: env-defined counters (not for training).

---

### Appendix A — Dimensions (Typical Defaults)

* `M_max = 20`
* `F_card ≈ 20` (rank/suit one-hots + flags + values)
* `F_meld ≈ 10–14`
* `F_meta ≈ 32` (depends on rule flags you include)
* `L = 4 + M_max + 4 = M_max + 8` (hands 4 + melds M_max + discard/stock/deads 4)
* `L_hidden = 4` or `6` depending on whether deads are counted hidden

---

**End of Specification.**

