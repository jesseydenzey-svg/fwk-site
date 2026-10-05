"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export function useAdminGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("supabase disponible ?", !!supabase);
    if (!supabase) return;

    supabase.auth.getSession().then(({ data, error }) => {
      console.log("session recue", data, error);
      if (!data.session) {
        console.log("redirection vers login");
        router.replace("/admin/login");
      } else {
        setReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("changement d'etat auth", session);
      if (!session) {
        router.replace("/admin/login");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return ready;
}