"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "mission"|"battle"|"status"|"oracle"|"vault"|"arena"|"guild";

export type DashboardTabsProps = {
  mission: ReactNode; battle: ReactNode; status: ReactNode;
  oracle: ReactNode; vault: ReactNode; arena: ReactNode; guild: ReactNode;
};

const TABS = [
  { id:"mission" as TabId, icon:"◈", world:"Command Room",  flavor:"Chest, misi & weekly arc",  color:"#50c890", accent:"#3aaa7a" },
  { id:"battle"  as TabId, icon:"⚔", world:"War Chamber",   flavor:"Boss, dungeon & focus",      color:"#f07080", accent:"#e05a6a" },
  { id:"status"  as TabId, icon:"◉", world:"Character",     flavor:"Stat, habit & growth",       color:"#a78bfa", accent:"#7c3aed" },
  { id:"oracle"  as TabId, icon:"✦", world:"Oracle's Den",  flavor:"AI, analytics & ranking",    color:"#d4a843", accent:"#d4a843" },
  { id:"vault"   as TabId, icon:"⬡", world:"The Sanctum",   flavor:"Item, shop & achievement",   color:"#50c890", accent:"#3aaa7a" },
  { id:"arena"   as TabId, icon:"⚡", world:"Arena",         flavor:"PvP challenge & duel",       color:"#f472b6", accent:"#ec4899" },
  { id:"guild"   as TabId, icon:"◆", world:"Guild",          flavor:"Friends & allies",           color:"#fb923c", accent:"#f97316" },
];

const LORE: Record<TabId,string> = {
  mission: '"Setiap task yang selesai melemahkan Kegelapan. Setiap hari yang dilewati memperkuatnya."',
  battle:  '"Prokrastinasi tidak menunggu. Setiap detik tanpa aksi adalah HP yang dipulihkan musuhmu."',
  status:  '"Kekuatan sejati tidak datang dari item — tapi dari kebiasaan yang dibangun setiap hari."',
  oracle:  '"Data adalah senjata. Mereka yang memahami pola mereka sendiri tidak bisa dikalahkan."',
  vault:   '"Koleksi bukan tujuan — ia adalah bukti perjalanan yang telah kamu tempuh."',
  arena:   '"Kompetisi terbaik adalah melawan dirimu kemarin."',
  guild:   '"Tidak ada petualang yang menaklukkan dungeon sendirian."',
};

const IDS = new Set(TABS.map(t=>t.id));
function getHash(): TabId {
  if(typeof window==="undefined") return "mission";
  const h = window.location.hash.replace("#","") as TabId;
  return IDS.has(h) ? h : "mission";
}

export function DashboardTabs(props: DashboardTabsProps) {
  const [active, setActive] = useState<TabId>("mission");

  useEffect(()=>{
    const f = requestAnimationFrame(()=>setActive(getHash()));
    const fn = ()=>setActive(getHash());
    window.addEventListener("hashchange",fn);
    return ()=>{ cancelAnimationFrame(f); window.removeEventListener("hashchange",fn); };
  },[]);

  const go = useCallback((id:TabId)=>{
    setActive(id);
    window.history.replaceState(null,"",`#${id}`);
    window.scrollTo({top:0,behavior:"smooth"});
  },[]);

  const activeTab = TABS.find(t=>t.id===active)??TABS[0]!;

  return (
    <div style={{display:"flex",width:"100%"}} className="dash-layout">

      {/* SIDEBAR desktop */}
      <aside style={{width:200,flexShrink:0,position:"sticky",top:57,height:"calc(100vh - 57px)",overflowY:"auto",padding:"14px 10px",borderRight:"1px solid rgba(255,255,255,0.06)",background:"#0c1018",display:"flex",flexDirection:"column",gap:2}} className="dash-sidebar">
        <div style={{padding:"4px 8px 12px",marginBottom:2,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.3em",textTransform:"uppercase",color:"#2a3148",fontFamily:"monospace"}}>Navigation</div>
        </div>
        <nav role="tablist" style={{display:"flex",flexDirection:"column",gap:1}}>
          {TABS.map(tab=>{
            const on = tab.id===active;
            return (
              <button key={tab.id} role="tab" aria-selected={on} onClick={()=>go(tab.id)}
                style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 10px",borderRadius:10,border:`1px solid ${on?"rgba(255,255,255,0.08)":"transparent"}`,background:on?"rgba(255,255,255,0.05)":"transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",position:"relative",width:"100%"}}>
                {on && (
                  <motion.div layoutId="sidebar-bar"
                    style={{position:"absolute",left:0,top:8,bottom:8,width:2,borderRadius:1,background:tab.accent}}
                    transition={{type:"spring",stiffness:500,damping:35}} />
                )}
                <span style={{fontSize:14,marginTop:1,flexShrink:0,color:on?tab.color:"#2a3148",transition:"color 0.12s"}}>{tab.icon}</span>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:on?"#eef0f5":"#454e65",transition:"color 0.12s"}}>{tab.world}</div>
                  <div style={{fontSize:9,color:on?"#454e65":"#2a3148",lineHeight:1.3,marginTop:1}}>{tab.flavor}</div>
                </div>
              </button>
            );
          })}
        </nav>
        <div style={{marginTop:"auto",padding:"8px 6px"}}>
          <div style={{borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",padding:"10px 12px"}}>
            <div style={{fontSize:7,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#2a3148",fontFamily:"monospace",marginBottom:6}}>World Lore</div>
            <AnimatePresence mode="wait">
              <motion.p key={active} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.2}}
                style={{fontSize:9,color:"#2a3148",lineHeight:1.65,fontStyle:"italic"}}>
                {LORE[active]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* MOBILE nav */}
      <nav role="tablist" className="dash-mobile-nav scrollbar-none"
        style={{display:"none",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0c1018",overflowX:"auto"}}>
        {TABS.map((tab,i)=>{
          const on = tab.id===active;
          return (
            <button key={tab.id} role="tab" aria-selected={on} onClick={()=>go(tab.id)}
              style={{flex:"1 0 auto",minWidth:52,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 8px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",color:on?tab.color:"#2a3148",position:"relative",transition:"color 0.12s",borderRight:i<TABS.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
              {on && <div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:tab.accent}} />}
              <span style={{fontSize:14,lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>{tab.world.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* CONTENT */}
      <div style={{flex:1,minWidth:0,padding:20,overflowX:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <span style={{fontSize:18,color:activeTab.color}}>{activeTab.icon}</span>
          <div>
            <h2 style={{fontSize:15,fontWeight:700,color:"#eef0f5",lineHeight:1}}>{activeTab.world}</h2>
            <p style={{fontSize:10,color:"#454e65",marginTop:2}}>{activeTab.flavor}</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.section key={active} role="tabpanel" id={active}
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:0.16}}
            style={{display:"flex",flexDirection:"column",gap:16,width:"100%"}}>
            {props[active]}
          </motion.section>
        </AnimatePresence>
      </div>

      <style>{`
        @media(max-width:1024px){
          .dash-sidebar{display:none!important}
          .dash-mobile-nav{display:flex!important}
          .dash-layout{flex-direction:column}
        }
      `}</style>
    </div>
  );
}
