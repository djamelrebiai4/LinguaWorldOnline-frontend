import{r as n,j as e}from"./three-vendor-BrF7bqo1.js";import{c as A,p as U,a as ee,b as W}from"./index-C2Y9NDyy.js";function te(){if(typeof window>"u"||typeof navigator>"u"||!window.isSecureContext||!(window.SpeechRecognition||window.webkitSpeechRecognition))return!1;const o=navigator.userAgent.toLowerCase();if(/android|iphone|ipad|mobile/i.test(o))return!0;const c=o.includes("edg/"),l=o.includes("opr/")||o.includes("opera"),d=o.includes("vivaldi"),f=o.includes("yabrowser"),b=typeof navigator.brave<"u"||navigator.userAgentData?.brands?.some(p=>p.brand==="Brave"),F=o.includes("chrome")&&!c&&!l&&!d&&!f&&!b,i=o.includes("safari")&&!o.includes("chrome");return F||c||i}function ie(s){const o=s?s.trim().length:0;return o<=6?"clamp(2.2rem, 6.5vw, 3.8rem)":o<=12?"clamp(1.8rem, 5.2vw, 2.8rem)":o<=20?"clamp(1.4rem, 4.2vw, 2.1rem)":"clamp(1.15rem, 3.6vw, 1.7rem)"}const V=`
  .fc-root {
    position: fixed; inset: 0;
    width: 100vw; height: 100dvh;
    background: #dfeefc;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: 'Nunito', 'Segoe UI', Tahoma, sans-serif;
    z-index: 99999;
  }

  /* Header */
  .fc-header {
    position: absolute;
    top: 20px; left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 10;
  }

  /* Universal Premium Back Button */
  .fc-back-btn {
    position: absolute;
    left: 20px;
    width: 48px; height: 48px;
    padding: 0; border-radius: 50%;
    color: transparent !important; font-size: 0;
    display: flex; align-items: center; justify-content: center;
    background: #ffffff;
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fc-back-btn::after {
    content: ''; position: absolute;
    width: 22px; height: 22px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232563EB' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E");
    background-size: contain; background-repeat: no-repeat; background-position: center;
    transition: transform 0.25s ease;
  }
  .fc-back-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  }
  .fc-back-btn:hover::after { transform: translateX(-3px); }
  .fc-back-btn:active {
    transform: translateY(2px) scale(0.92);
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
  }

  .fc-counter {
    color: white; font-size: 1.1rem; font-weight: 800;
    background: rgba(0,0,0,0.15); padding: 8px 20px;
    border-radius: 20px; letter-spacing: 0.5px;
  }

  /* Flashcard Container */
  .fc-container {
    width: 90%; max-width: 600px;
    height: 52dvh; min-height: 400px; max-height: 470px;
    perspective: 1200px;
    cursor: pointer;
    margin-top: 40px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .fc-inner {
    width: 100%; height: 100%; position: relative;
    transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
    transform-style: preserve-3d;
  }
  .fc-inner.flipped {
    transform: rotateY(180deg);
  }

  /* Card Sides */
  .fc-front, .fc-back {
    position: absolute; width: 100%; height: 100%;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    border-radius: 32px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    box-sizing: border-box;
  }

  /* Front (English) */
  .fc-front {
    background: white;
    border: 4px solid #939fd4;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 30px;
  }
  .fc-type {
    position: absolute; top: 30px;
    margin: 0; color: #2563eb; font-size: 1rem; font-weight: 900; 
    text-transform: uppercase; letter-spacing: 2px;
    background: rgba(37, 99, 235, 0.1); padding: 6px 16px; border-radius: 12px;
  }
  .fc-word {
    margin: 0; color: #2c3e50;
    font-size: clamp(2.5rem, 8vw, 4.5rem); 
    text-transform: capitalize; text-align: center; font-weight: 800;
    line-height: 1.1;
  }
  .fc-hint {
    position: absolute; bottom: 24px;
    margin: 0; color: #bdc3c7; font-size: 1rem; font-weight: 700;
  }

  /* Back (Translation + Interactive Actions) */
  .fc-back {
    background: #1e3a8a;
    border: 4px solid #1e40af; 
    transform: rotateY(180deg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    padding: 24px 22px 18px;
  }
  .fc-lang {
    margin: 0; color: #c8daf0;
    font-size: 0.95rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 2px;
  }
  .fc-translated {
    margin: 4px 0 10px 0; 
    color: #FFD166;
    text-transform: capitalize; text-align: center; font-weight: 800;
    line-height: 1.15;
    word-break: break-word;
    max-width: 100%;
  }
  .fc-example-box {
    background: rgba(255,255,255,0.08); width: 100%;
    padding: 14px 18px; border-radius: 16px; 
    border-left: 5px solid #FFD166;
    text-align: left; box-sizing: border-box;
  }
  .fc-example-target {
    margin: 0 0 4px 0; color: white; font-size: clamp(0.95rem, 3.8vw, 1.25rem); font-weight: 700;
    line-height: 1.25;
  }
  .fc-example-eng {
    margin: 0; color: #d1e4fc;
    font-size: clamp(0.85rem, 3.2vw, 1rem); font-style: italic; font-weight: 600;
    line-height: 1.25;
  }

  /* Bottom Actions Bar (Audio - Status/Feedback - Mic) */
  .fc-action-bar {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    box-sizing: border-box;
  }

  .fc-action-btn {
    width: 44px; height: 44px; min-width: 44px; min-height: 44px;
    border-radius: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.12);
    color: white;
    cursor: pointer;
    font-size: 20px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s ease; outline: none;
    flex-shrink: 0;
    padding: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  .fc-action-btn:hover {
    background: rgba(255,255,255,0.22);
    border-color: rgba(255,255,255,0.5);
    transform: scale(1.06);
  }
  .fc-action-btn:active { transform: scale(0.94); }

  .fc-action-btn.recording {
    background: #ef4444;
    border-color: #fca5a5;
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.35);
    transform: scale(0.96);
  }

  /* Middle Feedback Box */
  .fc-feedback-box {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 4px;
  }
  .fc-feedback-text {
    font-size: clamp(0.85rem, 3.2vw, 0.95rem);
    font-weight: 800;
    line-height: 1.2;
    transition: color 0.2s ease;
  }
  .fc-feedback-text.idle { color: rgba(209, 228, 252, 0.8); }
  .fc-feedback-text.listening { color: #fde047; }
  .fc-feedback-text.correct { color: #4ade80; }
  .fc-feedback-text.incorrect { color: #f87171; }
  .fc-feedback-text.error { color: #f87171; }

  .fc-transcript-sub {
    font-size: 0.78rem;
    font-style: italic;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Controls (Next/Prev) */
  .fc-controls {
    display: flex; gap: 16px; margin-top: 32px;
    width: 90%; max-width: 600px;
  }
  .fc-control-btn {
    flex: 1; padding: 18px 20px;
    font-size: 1.2rem; font-weight: 800; font-family: 'Nunito', sans-serif;
    border-radius: 20px; border: none;
    cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }
  .fc-control-btn:disabled {
    background: rgba(255,255,255,0.4); color: rgba(0,0,0,0.3);
    box-shadow: none; cursor: default;
  }
  .fc-control-btn:not(:disabled) {
    background: white; color: #2563eb; 
  }
  .fc-control-btn:not(:disabled):hover {
    transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.12);
  }
  .fc-control-btn:not(:disabled):active {
    transform: translateY(2px) scale(0.95); box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }

  .desktop-back-btn {
    position: absolute; left: 20px;
    display: inline-flex; align-items: center; gap: 8px;
    background: #ffffff; border: 1.5px solid rgba(37, 99, 235, 0.25);
    color: #2563eb; font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 700; padding: 10px 18px;
    border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.1);
    z-index: 50;
  }
  .desktop-back-btn:hover {
    border-color: #2563eb; background: #EBEBFF;
    color: #4338CA; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
    transform: translateY(-1px);
  }

  /* Filter Dropdown */
  .fc-filter-btn {
    position: absolute; left: 20px; top: 68px;
    display: inline-flex; align-items: center; gap: 6px;
    background: #ffffff; border: 1.5px solid rgba(37, 99, 235, 0.25);
    color: #2563eb; font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 700; padding: 10px 14px;
    border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.1);
    white-space: nowrap; z-index: 50;
  }
  .fc-filter-btn:hover {
    border-color: #2563eb; background: #EBEBFF;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
  }
  .fc-filter-chevron {
    display: inline-block; transition: transform 0.2s ease; font-style: normal;
  }
  .fc-filter-chevron.open { transform: rotate(180deg); }

  .fc-dropdown {
    position: absolute; left: 20px; top: 116px;
    background: white; border-radius: 16px;
    box-shadow: 0 8px 30px rgba(37, 99, 235, 0.18);
    border: 1.5px solid rgba(37, 99, 235, 0.15);
    overflow: hidden; z-index: 200;
    min-width: 180px; max-height: 360px; overflow-y: auto;
    animation: fc-drop-in 0.18s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes fc-drop-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fc-dropdown-item {
    width: 100%; padding: 12px 18px; text-align: left;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: #374151; transition: background 0.15s ease;
    display: block;
  }
  .fc-dropdown-item:hover { background: #EFF6FF; color: #2563eb; }
  .fc-dropdown-item.active { background: #EFF6FF; color: #2563eb; }
  .fc-dropdown-item + .fc-dropdown-item { border-top: 1px solid rgba(37,99,235,0.07); }

  .fc-sheet-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    z-index: 300; animation: fc-fade-in 0.2s ease;
  }
  @keyframes fc-fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }
  .fc-sheet {
    position: fixed; left: 0; right: 0; bottom: 0;
    background: white; border-radius: 24px 24px 0 0;
    padding: 12px 0 32px; z-index: 301;
    animation: fc-slide-up 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes fc-slide-up {
    from { transform: translateY(100%); } to { transform: translateY(0); }
  }
  .fc-sheet-handle {
    width: 40px; height: 4px; background: #e5e7eb;
    border-radius: 2px; margin: 0 auto 16px;
  }
  .fc-sheet-title {
    font-family: 'Nunito', sans-serif; font-size: 0.8rem; font-weight: 800;
    color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;
    padding: 0 20px 8px; display: block;
  }
  .fc-sheet-item {
    width: 100%; padding: 15px 20px; text-align: left;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 700;
    color: #374151; transition: background 0.15s ease; display: block;
  }
  .fc-sheet-item:hover { background: #EFF6FF; color: #2563eb; }
  .fc-sheet-item.active { color: #2563eb; background: #EFF6FF; }
  .fc-sheet-item + .fc-sheet-item { border-top: 1px solid #f3f4f6; }

  /* Mobile-specific Header & Filter Layout */
  @media (max-width: 768px) {
    .fc-header {
      padding: 0 16px;
      top: 16px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fc-counter {
      display: none; /* Removed from mobile */
    }
    /* Centers the category filter pill right in the header */
    .fc-filter-btn {
      position: static;
      transform: none;
      font-size: 13px;
      padding: 9px 14px;
      margin: 0 auto;
    }
    .fc-container { margin-top: 20px; min-height: 380px; }
    .fc-controls { margin-top: 20px; gap: 12px; }
    .fc-control-btn { padding: 15px; font-size: 1.1rem; }
    .fc-front, .fc-back { padding: 18px 16px 14px; border-radius: 24px; }
    .fc-example-box { padding: 12px 14px; }
  }

  /* See Full List button */
  .fc-list-btn {
    width: 90%; max-width: 600px; margin-top: 24px; margin-bottom: 40px;
    padding: 14px 20px; font-size: clamp(0.95rem, 3.5vw, 1.05rem); font-weight: 800;
    font-family: 'Nunito', sans-serif;
    border-radius: 20px; border: 2px solid rgba(37,99,235,0.25);
    background: rgba(255,255,255,0.7); color: #2563eb;
    cursor: pointer; transition: all 0.2s ease; outline: none;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 14px rgba(37,99,235,0.1); backdrop-filter: blur(4px);
  }
  .fc-list-btn:hover {
    background: white; border-color: #2563eb;
    box-shadow: 0 8px 22px rgba(37,99,235,0.2); transform: translateY(-2px);
  }
  .fc-list-btn:active { transform: translateY(1px) scale(0.98); }

  /* ── Full List View ── */
  .fc-list-root {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 99999;
    background: #dfeefc;
    display: flex; flex-direction: column; align-items: center;
    font-family: "Nunito", "Segoe UI", Tahoma, sans-serif;
    overflow-y: auto; overflow-x: hidden;
  }
  .fc-list-topbar-bg {
    position: fixed; top: 0; left: 0; right: 0;
    height: 80px;
    background: #dfeefc; z-index: 9; pointer-events: none;
  }
  .fc-list-header {
    position: fixed; top: 20px; left: 0; width: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 0 20px; box-sizing: border-box; z-index: 10;
  }
  .fc-list-title {
    color: #2563eb; font-size: 20px; font-weight: 800;
    background: rgba(255,255,255,0.6); border: 2px solid white;
    padding: 8px 24px; border-radius: 20px; letter-spacing: 1px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .fc-list-body {
    width: 90%; max-width: 650px;
    display: flex; flex-direction: column; gap: 14px;
    padding: 80px 0 40px 0;
  }
  .fc-list-item {
    background: white; border-radius: 18px; padding: 16px 20px;
    box-shadow: 0 6px 20px rgba(37,99,235,0.1);
    display: flex; align-items: center; gap: 16px;
    border: 2px solid transparent;
    font-family: 'Nunito', sans-serif; width: 100%; box-sizing: border-box;
  }
  .fc-list-num {
    min-width: 36px; height: 36px; border-radius: 10px;
    background: #dfeefc; color: #2563eb;
    font-size: 15px; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .fc-list-texts { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
  .fc-list-type {
    color: #2563eb; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .fc-list-eng {
    color: #4b5563; font-size: clamp(0.95rem, 3.5vw, 1.05rem); font-weight: 800;
    line-height: 1.3;
  }
  .fc-list-target {
    color: #2c3e50; font-size: clamp(1.05rem, 4vw, 20px); font-weight: 800;
    line-height: 1.3; word-break: break-word; text-transform: capitalize;
  }
  .fc-list-play-btn {
    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
    border: 2px solid rgba(37,99,235,0.2); background: #f5f9ff;
    cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s ease; outline: none;
  }
  .fc-list-play-btn:hover { border-color: #2563eb; background: #EBEBFF; transform: scale(1.08); }
  .fc-list-play-btn:active { transform: scale(0.92); }

  @media (max-width: 768px) {
    .fc-list-header { 
      top: 16px; 
      padding: 0 16px; 
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fc-list-topbar-bg { height: 76px; }
    .fc-list-body { width: 95%; padding-top: 80px; }
    .fc-list-title { display: none; }
    .fc-list-header .fc-filter-btn {
      position: static;
      transform: none;
      font-size: 13px;
      padding: 9px 12px;
      margin: 0 auto;
    }
    .fc-list-item { padding: 14px 14px; gap: 12px; }
    .fc-list-num { min-width: 32px; height: 32px; font-size: 14px; }
    .fc-list-eng { font-size: 0.85rem; }
    .fc-list-target { font-size: 16px; }
    .fc-list-btn { width: 95%; }
  }
`;function ne({deck:s,currentLanguage:o,activeFilter:x,setActiveFilter:c,isFilterOpen:l,setIsFilterOpen:d,isMobile:f,FILTERS:b,onBack:F}){return e.jsxs("div",{className:"fc-list-root",onClick:()=>l&&d(!1),children:[e.jsx("div",{className:"fc-list-topbar-bg"}),e.jsxs("div",{className:"fc-list-header",children:[e.jsx("div",{className:"fc-list-title",children:x}),e.jsxs("button",{className:"fc-filter-btn",onClick:i=>{i.stopPropagation(),d(p=>!p)},children:[x,e.jsx("i",{className:`fc-filter-chevron${l?" open":""}`,children:"▾"})]}),!f&&l&&e.jsx("div",{className:"fc-dropdown",onClick:i=>i.stopPropagation(),children:b.map(i=>e.jsx("button",{className:`fc-dropdown-item${x===i?" active":""}`,onClick:()=>{c(i),d(!1)},children:i},i))})]}),f&&l&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fc-sheet-overlay",onClick:()=>d(!1)}),e.jsxs("div",{className:"fc-sheet",onClick:i=>i.stopPropagation(),children:[e.jsx("div",{className:"fc-sheet-handle"}),e.jsx("span",{className:"fc-sheet-title",children:"Study by category"}),b.map(i=>e.jsx("button",{className:`fc-sheet-item${x===i?" active":""}`,onClick:()=>{c(i),d(!1)},children:i},i))]})]}),e.jsx("div",{className:"fc-list-body",children:s.map((i,p)=>{const m=i.translations[o];return e.jsxs("div",{className:"fc-list-item",children:[e.jsx("div",{className:"fc-list-num",children:p+1}),e.jsxs("div",{className:"fc-list-texts",children:[e.jsx("div",{className:"fc-list-type",children:i.type}),e.jsx("div",{className:"fc-list-eng",children:i.english}),e.jsx("div",{className:"fc-list-target",children:m})]}),e.jsx("button",{className:"fc-list-play-btn",onClick:()=>U(i.english,o),title:"Listen to pronunciation",children:"🔊"})]},p)})})]})}function ae({currentLanguage:s,onExit:o,isPaused:x}){const[c,l]=n.useState(0),[d,f]=n.useState(!1),[b,F]=n.useState(!1),[i,p]=n.useState("All Words"),[m,j]=n.useState(!1),[P,T]=n.useState(!1),[R,q]=n.useState(!1),[H,M]=n.useState(!1),[Y,w]=n.useState(""),[k,h]=n.useState("idle"),g=n.useRef(null),C=n.useRef(!1),D=["All Words","Pronoun","Adjective","Verb","Adverb","Preposition","Conjunction","Question Word"];n.useEffect(()=>{q(te())},[]),n.useEffect(()=>{l(0),f(!1),$()},[i]),n.useEffect(()=>{const t=window.matchMedia("(max-width: 768px)");F(t.matches);const r=u=>F(u.matches);return t.addEventListener("change",r),()=>t.removeEventListener("change",r)},[]);const N=n.useMemo(()=>i==="All Words"?[...A].sort(()=>Math.random()-.5):A.filter(t=>t.type===i),[i]),Q=n.useMemo(()=>i==="All Words"?A:A.filter(t=>t.type===i),[i]),$=()=>{if(g.current&&C.current)try{g.current.abort()}catch{}C.current=!1,M(!1),w(""),h("idle")};n.useEffect(()=>{f(!1),$()},[c]),n.useEffect(()=>()=>{if(W(),g.current)try{g.current.abort()}catch{}},[]),n.useEffect(()=>{const t=r=>{P&&(r.preventDefault(),T(!1))};return window.addEventListener("global-back",t),()=>window.removeEventListener("global-back",t)},[P]);const I=t=>(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,/#!$%^&*;:{}=\-_`~()¿¡?]/g,"").replace(/\s{2,}/g," ").trim(),X=(t,r)=>{const u=I(t),a=I(r);if(!u||!a)return!1;if(u.includes(a)||a.includes(u))return!0;const y=u.split(" "),z=a.split(" ");let B=0;return z.forEach(S=>{y.includes(S)&&B++}),B/z.length>=.7},v=N[c]||{},E=v.translations?v.translations[s]:"",L=v.examples?v.examples[s]:{target:"",eng:""},_={es:"Spanish",fr:"French",de:"German",it:"Italian",el:"Greek"}[s]||"Spanish";n.useEffect(()=>{if(!R)return;const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t)return;const r=new t,u={es:"es-ES",fr:"fr-FR",de:"de-DE",it:"it-IT",el:"el-GR"};return r.lang=u[s]||"es-ES",r.interimResults=!0,r.maxAlternatives=3,r.onstart=()=>{C.current=!0,M(!0),h("listening")},r.onresult=a=>{let y="",z="";for(let S=a.resultIndex;S<a.results.length;S++){const G=a.results[S][0].transcript;a.results[S].isFinal?y+=G:z+=G}if(z&&w(z),!y)return;if(w(y),!y.trim()){h("idle");return}const B=X(y,E);h(B?"correct":"incorrect")},r.onerror=a=>{switch(a.error){case"no-speech":h("idle"),w("No speech detected");break;case"audio-capture":case"not-allowed":case"service-not-allowed":h("error"),w("Mic blocked");break;default:h("idle"),w("Couldn't hear clearly")}},r.onend=()=>{C.current=!1,M(!1),h(a=>a==="listening"?"idle":a)},g.current=r,()=>{if(g.current)try{g.current.abort()}catch{}}},[s,E,R]);const J=t=>{if(t.stopPropagation(),C.current){try{g.current.stop()}catch{}return}W(),w("");try{g.current?.start()}catch{}},K=t=>{t.stopPropagation(),W();try{U(v.english,s)}catch{ee(E,s)}},Z=()=>{x||c<N.length-1&&(f(!1),setTimeout(()=>l(t=>t+1),150))},O=()=>{x||c>0&&(f(!1),setTimeout(()=>l(t=>t-1),150))};return N.length===0||c>=N.length?null:P?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:V}),e.jsx(ne,{deck:Q,currentLanguage:s,activeFilter:i,setActiveFilter:p,isFilterOpen:m,setIsFilterOpen:j,isMobile:b,FILTERS:D,onBack:()=>T(!1)})]}):e.jsxs("div",{className:"fc-root",onClick:()=>m&&j(!1),children:[e.jsx("style",{children:V}),e.jsxs("div",{className:"fc-header",children:[!b&&e.jsxs("div",{className:"fc-counter",children:[c+1," / ",N.length]}),e.jsxs("button",{className:"fc-filter-btn",onClick:t=>{t.stopPropagation(),j(r=>!r)},children:[i,e.jsx("i",{className:`fc-filter-chevron${m?" open":""}`,children:"▾"})]}),!b&&m&&e.jsx("div",{className:"fc-dropdown",onClick:t=>t.stopPropagation(),children:D.map(t=>e.jsx("button",{className:`fc-dropdown-item${i===t?" active":""}`,onClick:()=>{p(t),j(!1)},children:t},t))})]}),b&&m&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fc-sheet-overlay",onClick:()=>j(!1)}),e.jsxs("div",{className:"fc-sheet",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"fc-sheet-handle"}),e.jsx("span",{className:"fc-sheet-title",children:"Study by category"}),D.map(t=>e.jsx("button",{className:`fc-sheet-item${i===t?" active":""}`,onClick:()=>{p(t),j(!1)},children:t},t))]})]}),e.jsx("div",{className:"fc-container",onClick:()=>{!x&&!m&&(f(!d),$())},children:e.jsxs("div",{className:`fc-inner ${d?"flipped":""}`,children:[e.jsxs("div",{className:"fc-front",children:[e.jsx("p",{className:"fc-type",children:v.type}),e.jsx("h1",{className:"fc-word",children:v.english}),e.jsx("p",{className:"fc-hint",children:"Tap to flip"})]}),e.jsxs("div",{className:"fc-back",children:[e.jsx("p",{className:"fc-lang",children:_}),e.jsx("h1",{className:"fc-translated",style:{fontSize:ie(E)},children:E}),e.jsxs("div",{className:"fc-example-box",children:[e.jsxs("p",{className:"fc-example-target",children:['"',L.target,'"']}),e.jsxs("p",{className:"fc-example-eng",children:['"',L.eng,'"']})]}),e.jsxs("div",{className:"fc-action-bar",children:[e.jsx("button",{className:"fc-action-btn",onClick:K,title:"Listen to pronunciation",children:"🔊"}),e.jsx("div",{className:"fc-feedback-box",children:R?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`fc-feedback-text ${k}`,children:[k==="idle"&&"Tap mic to practice",k==="listening"&&"Listening... Speak now",k==="correct"&&"Perfect!",k==="incorrect"&&"Not quite. Try again!",k==="error"&&(Y||"Mic error")]}),Y&&k!=="idle"&&e.jsxs("div",{className:"fc-transcript-sub",children:['"',Y,'"']})]}):e.jsx("div",{className:"fc-feedback-text idle",children:"Tap card to flip"})}),R&&e.jsx("button",{className:`fc-action-btn ${H?"recording":""}`,onClick:J,title:"Practice speaking",children:"🎙️"})]})]})]})}),e.jsxs("div",{className:"fc-controls",children:[e.jsx("button",{className:"fc-control-btn",onClick:O,disabled:c===0,children:"Previous"}),e.jsx("button",{className:"fc-control-btn",onClick:Z,disabled:c===N.length-1,children:"Next"})]}),e.jsx("button",{className:"fc-list-btn",onClick:()=>T(!0),children:"☰ See the Full List"})]})}export{ae as default};
