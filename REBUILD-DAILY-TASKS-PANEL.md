# REBUILD — Daily Tasks Panel Visual
# Ganti TOTAL return statement komponen ini.
# Logic/API tidak berubah — hanya tampilan.

Buka components/sections/daily-tasks-panel.tsx.

## PART 1 — Hapus semua state dan fungsi terkait optional task form

Hapus state berikut (cari dan hapus baris-baris ini):
```
const [formTitle, setFormTitle] = useState("");
const [formDescription, setFormDescription] = useState("");
```

Hapus fungsi addOptionalTask seluruhnya (dari `const addOptionalTask` sampai penutup `}, [...]`).

---

## PART 2 — Ganti TOTAL return statement

Cari baris:
```
  return (
    <div className="relative overflow-hidden rounded-3xl border p-6"
```

Ganti SELURUH return (dari baris itu sampai closing `);` terakhir di komponen) dengan:

```tsx
  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "linear-gradient(160deg,#080b12,#0c1018)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div aria-hidden style={{ position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)", width:300, height:300, borderRadius:"50%", background:"rgba(212,168,67,0.05)", filter:"blur(80px)", pointerEvents:"none" }} />
      <div aria-hidden style={{ position:"absolute", bottom:-40, right:0, width:200, height:200, borderRadius:"50%", background:"rgba(58,170,122,0.05)", filter:"blur(70px)", pointerEvents:"none" }} />

      {/* Floating reward numbers */}
      <AnimatePresence>
        {floatingRewards.map((burst) => (
          <motion.span
            key={burst.id}
            className={`pointer-events-none absolute text-sm font-bold ${burst.color}`}
            initial={{ opacity:0, y:0 }}
            animate={{ opacity:1, y:-60 }}
            exit={{ opacity:0, y:-90 }}
            style={{ right:`${burst.offset}%`, top:"10%", fontFamily:"monospace", zIndex:10 }}
          >
            {burst.label}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div style={{ padding:"20px 20px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>
            Tugas Harian
          </p>
          <h3 style={{ fontSize:22, fontWeight:900, color:"#eef0f5", lineHeight:1.1, marginTop:2 }}>
            Antrian Misi
          </h3>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginTop:2, fontFamily:"monospace" }}>
            Ritual Sistem
          </p>
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          style={{ fontSize:11, color:"rgba(255,255,255,0.35)", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}
        >
          Segarkan
        </button>
      </div>

      {/* Combo HUD */}
      <div style={{ padding:"0 20px" }}>
        <AnimatePresence>
          {combo >= 2 && <ComboHUD combo={combo} />}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin:"12px 20px 0", borderRadius:12, border:"1px solid rgba(224,90,106,0.3)", background:"rgba(224,90,106,0.08)", padding:"10px 14px", fontSize:12, color:"#f07080" }}>
          {error}
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div style={{ padding:"24px 20px", fontSize:13, color:"rgba(255,255,255,0.4)" }}>Memuat tugas...</div>
      ) : (
        <div style={{ padding:"16px 20px 20px", display:"flex", flexDirection:"column", gap:8 }}>
          {systemMatches.map(({ definition, task }) => {
            const isExpanded = expandedKey === definition.key;
            const hasTimer = "timerMinutes" in definition && !!definition.timerMinutes;
            const isDone = task?.completedToday ?? false;
            const isClickable = task && !isDone && !pending;

            const diff = task?.difficulty ?? "MEDIUM";
            const accentColor = isDone ? "rgba(255,255,255,0.15)"
              : diff === "HARD" || diff === "LEGENDARY" ? "#e05a6a"
              : diff === "EASY" ? "#3aaa7a"
              : "#d4a843";

            const borderColor = isDone ? "rgba(255,255,255,0.06)"
              : diff === "HARD" || diff === "LEGENDARY" ? "rgba(224,90,106,0.25)"
              : diff === "EASY" ? "rgba(58,170,122,0.2)"
              : "rgba(212,168,67,0.2)";

            const badgeBg = diff === "HARD" || diff === "LEGENDARY" ? "rgba(224,90,106,0.12)"
              : diff === "EASY" ? "rgba(58,170,122,0.12)"
              : "rgba(212,168,67,0.12)";

            const badgeColor = diff === "HARD" || diff === "LEGENDARY" ? "#f07080"
              : diff === "EASY" ? "#50c890"
              : "#d4a843";

            return (
              <motion.div
                key={definition.key}
                id={`task-card-${task?.id}`}
                layout
                initial={{ opacity:0, y:6 }}
                animate={{ opacity: isDone ? 0.55 : 1, y:0 }}
                style={{
                  display:"flex",
                  borderRadius:14,
                  border:`1px solid ${borderColor}`,
                  background: isDone ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
                  overflow:"hidden",
                  cursor: isClickable ? "pointer" : "default",
                  transition:"all 0.15s",
                }}
                onClick={() => { if(isClickable) completeTask(task); }}
                whileHover={isClickable ? { scale:1.002, backgroundColor:"rgba(255,255,255,0.05)" } : {}}
                whileTap={isClickable ? { scale:0.998 } : {}}
              >
                {/* Left accent bar */}
                <div style={{ width:3, flexShrink:0, background:accentColor, borderRadius:"14px 0 0 14px" }} />

                {/* Content */}
                <div style={{ flex:1, padding:"14px 14px 14px 16px" }}>
                  {/* Top row: title + badge + expand */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Title row */}
                      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:6, marginBottom:3 }}>
                        {isDone && (
                          <span style={{ fontSize:11, color:"#50c890", fontWeight:700 }}>✓</span>
                        )}
                        <span style={{ fontSize:13, fontWeight:700, color: isDone ? "rgba(255,255,255,0.35)" : "#eef0f5", textDecoration: isDone ? "line-through" : "none" }}>
                          {definition.title}
                        </span>
                        {task && (
                          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"2px 7px", borderRadius:5, background:badgeBg, color:badgeColor, border:`1px solid ${borderColor}`, fontFamily:"monospace" }}>
                            {task.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Subtitle */}
                      <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(212,168,67,0.55)", fontFamily:"monospace", marginBottom:6 }}>
                        {definition.subtitle}
                      </p>

                      {/* Quick action */}
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.55 }}>
                        {definition.quickAction}
                      </p>

                      {/* Reward chips */}
                      {task && (
                        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, marginTop:10 }}>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"rgba(58,170,122,0.1)", color:"#50c890", fontFamily:"monospace" }}>
                            +{Math.round(task.expReward * getComboMultiplier(combo))} EXP
                          </span>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"rgba(212,168,67,0.1)", color:"#d4a843", fontFamily:"monospace" }}>
                            +{Math.round(task.coinReward * getComboMultiplier(combo))} coins
                          </span>
                          {task.statRewards?.map((sr) => (
                            <span key={sr.stat} style={{ fontSize:9, padding:"2px 6px", borderRadius:5, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>
                              +{sr.amount} {formatLabel(sr.stat)}
                            </span>
                          ))}
                          {combo >= 2 && !isDone && (
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:"rgba(212,168,67,0.15)", color:"#d4a843", border:"1px solid rgba(212,168,67,0.3)", fontFamily:"monospace" }}>
                              x{getComboMultiplier(combo).toFixed(1)} COMBO
                            </span>
                          )}
                          <span style={{ marginLeft:"auto", fontSize:10, color: isDone ? "#50c890" : "rgba(255,255,255,0.2)", fontStyle: isDone ? "normal" : "italic", fontWeight: isDone ? 600 : 400 }}>
                            {isDone ? "Selesai hari ini ✓" : "klik untuk selesaikan"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expand button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedKey(isExpanded ? null : definition.key); }}
                      style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginTop:2, transition:"all 0.12s" }}
                      aria-label={isExpanded ? "Tutup detail" : "Lihat detail"}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity:0, height:0 }}
                        animate={{ opacity:1, height:"auto" }}
                        exit={{ opacity:0, height:0 }}
                        style={{ overflow:"hidden" }}
                      >
                        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:12, paddingTop:12, display:"flex", flexDirection:"column", gap:10 }}>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{definition.detail}</p>
                          {"actions" in definition && definition.actions && (
                            <ol style={{ display:"flex", flexDirection:"column", gap:6 }}>
                              {(definition.actions as string[]).map((step, idx) => (
                                <li key={idx} style={{ display:"flex", gap:10, fontSize:11, color:"rgba(255,255,255,0.6)" }}>
                                  <span style={{ flexShrink:0, fontFamily:"monospace", fontSize:9, color:"rgba(212,168,67,0.5)", marginTop:2 }}>
                                    {String(idx+1).padStart(2,"0")}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          )}
                          {"readingUrls" in definition && definition.readingUrls && (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                              {(definition.readingUrls as {label:string;url:string}[]).map((src) => (
                                <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer"
                                  style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"4px 10px", textDecoration:"none", background:"rgba(255,255,255,0.03)" }}>
                                  <ExternalLink className="h-3 w-3" />
                                  {src.label}
                                </a>
                              ))}
                            </div>
                          )}
                          {hasTimer && (
                            <ReadingTimer
                              minutes={definition.timerMinutes as number}
                              onComplete={() => setReadingSessionDone(true)}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* renderTask (selesai button dll) */}
                  {renderTask(task, hasTimer)}
                </div>
              </motion.div>
            );
          })}

          {/* Quest tambahan — hanya tampil list, tanpa form tambah */}
          {customTasks.length > 0 && (
            <div style={{ marginTop:8 }}>
              <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", fontFamily:"monospace", marginBottom:8 }}>
                Quest Tambahan
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {customTasks.map((task) => {
                  const isDone = task.completedToday ?? false;
                  return (
                    <motion.div
                      key={task.id}
                      style={{
                        display:"flex",
                        borderRadius:12,
                        border:"1px solid rgba(212,168,67,0.2)",
                        background:"rgba(255,255,255,0.02)",
                        overflow:"hidden",
                        cursor: isDone || pending ? "default" : "pointer",
                        opacity: isDone ? 0.5 : 1,
                      }}
                      onClick={() => { if(!isDone && !pending) completeTask(task); }}
                      whileHover={!isDone ? { scale:1.002 } : {}}
                    >
                      <div style={{ width:3, flexShrink:0, background: isDone ? "rgba(255,255,255,0.15)" : "#d4a843" }} />
                      <div style={{ flex:1, padding:"10px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                          {isDone && <span style={{ fontSize:10, color:"#50c890", fontWeight:700 }}>✓</span>}
                          <span style={{ fontSize:12, fontWeight:600, color: isDone ? "rgba(255,255,255,0.35)" : "#eef0f5", textDecoration: isDone ? "line-through" : "none" }}>
                            {task.title}
                          </span>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(212,168,67,0.1)", color:"#d4a843", fontFamily:"monospace", fontWeight:700, textTransform:"uppercase" }}>
                            CUSTOM
                          </span>
                        </div>
                        {task.description && (
                          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.4 }}>{task.description}</p>
                        )}
                        <div style={{ display:"flex", gap:5, marginTop:6 }}>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:5, background:"rgba(58,170,122,0.1)", color:"#50c890", fontFamily:"monospace" }}>+{task.expReward} EXP</span>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:5, background:"rgba(212,168,67,0.1)", color:"#d4a843", fontFamily:"monospace" }}>+{task.coinReward} coins</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RewardModal />
      <LevelUpModal />
    </div>
  );
```

---

## Setelah selesai:

```bash
npm run lint
npm run dev
```

Pastikan tidak ada error TypeScript terkait `formTitle`, `formDescription`, atau `addOptionalTask`.
Kalau ada error "cannot find formTitle", berarti masih ada referensi ke state yang sudah dihapus — hapus juga semua referensi tersebut.
