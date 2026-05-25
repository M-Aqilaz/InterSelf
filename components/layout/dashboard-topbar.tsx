"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = { username: string; coins: number; hasChest?: boolean };

const NAV = [
  { icon: "◈", label: "Command", href: "/dashboard#mission" },
  { icon: "⚔", label: "Battle",  href: "/dashboard#battle"  },
  { icon: "◉", label: "Char",    href: "/dashboard#status"  },
  { icon: "✦", label: "Oracle",  href: "/dashboard#oracle"  },
  { icon: "⬡", label: "Sanctum", href: "/dashboard#vault"   },
  { icon: "⚡", label: "Arena",   href: "/dashboard#arena"   },
  { icon: "◆", label: "Guild",   href: "/dashboard#guild"   },
];

export function DashboardTopbar({ username, coins, hasChest }: Props) {
  const router = useRouter();
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", background:"rgba(8,11,18,0.94)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, zIndex:50 }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
        <div style={{ width:26, height:26, borderRadius:7, background:"#d4a843", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#080b12", fontFamily:"monospace" }}>IS</div>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(136,144,168,0.8)" }}>InterSelf</span>
      </Link>
      <div style={{ display:"flex", gap:2 }}>
        {NAV.map(n => (
          <Link key={n.label} href={n.href} title={n.label} style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color:"rgba(69,78,101,1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, textDecoration:"none" }}>{n.icon}</Link>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#d4a843" }}>⬡ {coins.toLocaleString("id-ID")}</span>
        {hasChest && <span style={{ fontSize:18 }}>🎁</span>}
        <span style={{ fontSize:11, color:"rgba(136,144,168,0.6)" }}>{username}</span>
        <button style={{ padding:"5px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(136,144,168,0.7)", fontSize:11, cursor:"pointer" }}
          onClick={async () => { await fetch("/api/auth/logout", { method:"POST" }); router.push("/"); }}>
          Logout
        </button>
      </div>
    </div>
  );
}
