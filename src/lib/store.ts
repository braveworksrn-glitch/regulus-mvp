"use client";

// Browser-local demo game state (sandbox lot, XP, quests, simulated orders).
// Stands in for the Supabase profiles/service_orders/quest_progress tables so
// the demo needs no login. Nothing here touches real money or real land.

import { useCallback, useEffect, useState } from "react";
import { IMPROVEMENT_ACTIONS, QUESTS, TileState } from "./game";

export interface SimOrder {
  id: string;
  lotSlug: string;
  lotName: string;
  actionId: string;
  status: "approved" | "scheduled" | "in_progress" | "verified";
  ticks: number; // simulated weekly ticks elapsed
  ticksNeeded: number;
  totalCents: number;
  createdAt: string;
}

export interface GameState {
  sandboxClaimed: boolean;
  sandboxTileState: TileState;
  xp: number;
  completedQuests: string[];
  orders: SimOrder[];
}

const KEY = "regulus-demo-state-v1";

const INITIAL: GameState = {
  sandboxClaimed: false,
  sandboxTileState: "overgrown",
  xp: 0,
  completedQuests: [],
  orders: [],
};

function load(): GameState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
  } catch {
    return INITIAL;
  }
}

function save(s: GameState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const completeQuest = useCallback(
    (questId: string) => {
      update((s) => {
        if (s.completedQuests.includes(questId)) return s;
        const q = QUESTS.find((x) => x.id === questId);
        return {
          ...s,
          xp: s.xp + (q?.xp ?? 0),
          completedQuests: [...s.completedQuests, questId],
        };
      });
    },
    [update]
  );

  const claimSandbox = useCallback(() => {
    update((s) => (s.sandboxClaimed ? s : { ...s, sandboxClaimed: true }));
    completeQuest("stake");
  }, [update, completeQuest]);

  const placeOrder = useCallback(
    (lotSlug: string, lotName: string, actionId: string, totalCents: number) => {
      const action = IMPROVEMENT_ACTIONS.find((a) => a.id === actionId);
      const order: SimOrder = {
        id: `ord-${lotSlug}-${actionId}-${new Date().getTime()}`,
        lotSlug,
        lotName,
        actionId,
        status: "scheduled",
        ticks: 0,
        ticksNeeded: action ? action.etaWeeksMin : 2,
        totalCents,
        createdAt: new Date().toISOString(),
      };
      update((s) => ({ ...s, orders: [order, ...s.orders] }));
      completeQuest("boots");
      return order.id;
    },
    [update, completeQuest]
  );

  const tickOrder = useCallback(
    (orderId: string) => {
      update((s) => {
        const orders = s.orders.map((o) => {
          if (o.id !== orderId || o.status === "verified") return o;
          const ticks = o.ticks + 1;
          const done = ticks >= o.ticksNeeded;
          return {
            ...o,
            ticks,
            status: done ? ("verified" as const) : ("in_progress" as const),
          };
        });
        let next = { ...s, orders };
        const finished = orders.find(
          (o) => o.id === orderId && o.status === "verified"
        );
        if (finished && finished.lotSlug === "sandbox") {
          const action = IMPROVEMENT_ACTIONS.find((a) => a.id === finished.actionId);
          if (action) next = { ...next, sandboxTileState: action.resultingTileState };
        }
        return next;
      });
    },
    [update]
  );

  const reset = useCallback(() => {
    save(INITIAL);
    setState(INITIAL);
  }, []);

  return { state, ready, claimSandbox, placeOrder, tickOrder, completeQuest, reset };
}
