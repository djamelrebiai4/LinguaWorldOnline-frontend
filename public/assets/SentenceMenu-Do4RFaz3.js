import{r as n,j as e}from"./three-vendor-BrF7bqo1.js";import{s as M,b as D,f as H,g as U,h as P,a as G,i as V,d as R,u as O,H as X,R as q,j as T}from"./index-C2Y9NDyy.js";const A=`
  .sl-root {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 99999;
    background: #dfeefc;
    display: flex; flex-direction: column; align-items: center; 
    justify-content: flex-start; /* 👈 Changed from 'center' to 'flex-start' */
    font-family: "Nunito", "Segoe UI", Tahoma, sans-serif;
    overflow-y: auto; overflow-x: hidden;
    padding-top: 80px; /* 👈 Anchors content safely below the buttons */
    padding-bottom: 40px;
    box-sizing: border-box;
  }
  .sl-header {
    position: absolute; top: 20px; left: 0; width: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 0 20px; box-sizing: border-box; z-index: 10;
  }
  .sl-back-btn {
    position: absolute; left: 20px;
    display: inline-flex; align-items: center; gap: 8px;
    background: #ffffff; border: 1.5px solid rgba(79,159,255,0.25);
    color: #3a7fd4; font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 700; padding: 10px 18px;
    border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(79,159,255,0.1); outline: none; z-index: 50;
  }
  .sl-back-btn:hover {
    border-color: #4f9fff; background: #f0f7ff;
    color: #2563c4; box-shadow: 0 4px 16px rgba(79,159,255,0.2); transform: translateY(-1px);
  }
  .sl-counter {
    color: #2563c4; font-size: 18px; font-weight: bold;
    background: rgba(255,255,255,0.6); border: 2px solid white;
    padding: 8px 20px; border-radius: 20px; letter-spacing: 1px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  /* Filter trigger — mirrors flashcard filter button */
  .sl-filter-btn {
    position: absolute; left: 20px; top: 68px;
    display: inline-flex; align-items: center; gap: 6px;
    background: #ffffff; border: 1.5px solid rgba(58,127,212,0.25);
    color: #2563c4; font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 700; padding: 10px 14px;
    border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(58,127,212,0.1);
    white-space: nowrap; z-index: 50;
  }
  .sl-filter-btn:hover {
    border-color: #3a7fd4; background: #f0f7ff;
    box-shadow: 0 4px 16px rgba(58,127,212,0.2);
  }
  .sl-filter-chevron {
    display: inline-block; transition: transform 0.2s ease; font-style: normal; flex-shrink: 0;
  }
  .sl-filter-chevron.open { transform: rotate(180deg); }

  /* Desktop dropdown */
  .sl-dropdown {
    position: absolute; left: 20px; top: 116px;
    background: white; border-radius: 16px;
    box-shadow: 0 8px 30px rgba(58,127,212,0.18);
    border: 1.5px solid rgba(58,127,212,0.15);
    overflow: hidden; z-index: 200;
    min-width: 220px; max-height: 360px; overflow-y: auto;
    animation: sl-drop-in 0.18s cubic-bezier(0.4,0,0.2,1);
    scrollbar-width: none
  }
  @keyframes sl-drop-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sl-dropdown-item {
    width: 100%; padding: 12px 18px; text-align: left;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: #374151; transition: background 0.15s ease;
    display: block;
  }
  .sl-dropdown-item:hover { background: #EFF6FF; color: #2563c4; }
  .sl-dropdown-item.active { background: #EFF6FF; color: #2563c4; }
  .sl-dropdown-item + .sl-dropdown-item { border-top: 1px solid rgba(58,127,212,0.07); }

  /* Mobile bottom sheet */
  .sl-sheet-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    z-index: 300; animation: sl-fade-in 0.2s ease;
  }
  @keyframes sl-fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }
  .sl-sheet {
    position: fixed; left: 0; right: 0; bottom: 0;
    background: white; border-radius: 24px 24px 0 0;
    padding: 12px 0 32px; z-index: 301;
    max-height: 70vh; overflow-y: auto;
    animation: sl-slide-up 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes sl-slide-up {
    from { transform: translateY(100%); } to { transform: translateY(0); }
  }
  .sl-sheet-handle {
    width: 40px; height: 4px; background: #e5e7eb;
    border-radius: 2px; margin: 0 auto 16px;
  }
  .sl-sheet-title {
    font-family: 'Nunito', sans-serif; font-size: 0.8rem; font-weight: 800;
    color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;
    padding: 0 20px 8px; display: block;
  }
  .sl-sheet-item {
    width: 100%; padding: 15px 20px; text-align: left;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 700;
    color: #374151; transition: background 0.15s ease; display: block;
  }
  .sl-sheet-item:hover { background: #EFF6FF; color: #2563c4; }
  .sl-sheet-item.active { color: #2563c4; background: #EFF6FF; }
  .sl-sheet-item + .sl-sheet-item { border-top: 1px solid #f3f4f6; }

  .sl-card {
    width: 90%; max-width: 750px; background: white;
    border-radius: 24px; padding: 40px 30px; margin-top: 40px;
    box-shadow: 0 20px 50px rgba(58, 127, 212, 0.15);
    display: flex; flex-direction: column; align-items: center; box-sizing: border-box;
  }
  .sl-category-pill {
    margin: 0 0 14px 0; color: #2563c4; font-size: 13px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1.5px;
    background: rgba(58,127,212,0.1); padding: 6px 16px; border-radius: 12px;
  }
  .sl-eng-label { margin: 0 0 5px 0; color: #7f8c8d; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
  .sl-eng-text { margin: 0 0 20px 0; color: #2c3e50; font-size: clamp(1.5rem, 5vw, 36px); text-align: center; font-weight: 800; line-height: 1.2; }
  .sl-divider { width: 100%; height: 2px; background: #ecf0f1; margin: 10px 0 20px 0; }
  .sl-target-label { margin: 0 0 5px 0; color: #3a7fd4; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
  .sl-target-area { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 30px; width: 100%; }
  .sl-target-text { margin: 0; color: #2563c4; font-size: clamp(1.8rem, 6vw, 42px); text-align: center; font-weight: 800; line-height: 1.2; }
  .sl-speak-btn {
    width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
    border: 2px solid rgba(58, 127, 212, 0.25); background: white;
    cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s ease; outline: none; box-shadow: 0 4px 12px rgba(58, 127, 212, 0.1);
  }
  .sl-speak-btn:hover { border-color: #3a7fd4; background: rgba(58, 127, 212, 0.1); transform: scale(1.1); box-shadow: 0 6px 18px rgba(58, 127, 212, 0.3); }
  .sl-speak-btn:active { transform: scale(0.9); }
  .sl-breakdown-box { width: 100%; background: #f8f9fa; border-radius: 16px; padding: 20px; border: 1px solid #e9ecef; box-sizing: border-box; }
  .sl-breakdown-title { margin: 0 0 15px 0; color: #95a5a6; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-align: center; font-weight: bold; }
  .sl-word-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .sl-word-btn {
    padding: 10px 16px; border-radius: 12px; cursor: pointer; text-align: center; border: none;
    border-bottom: 3px solid #3a7fd4; background: white; outline: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: all 0.15s ease;
  }
  .sl-word-btn:hover { background: rgba(58, 127, 212, 0.08); border-bottom-color: #2563c4; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(58, 127, 212, 0.2); }
  .sl-word-btn:active { background: rgba(58, 127, 212, 0.15); border-bottom-color: #1e4a9e; transform: translateY(2px) scale(0.96); box-shadow: 0 2px 6px rgba(58, 127, 212, 0.15); }
  .sl-word-target { font-size: clamp(1rem, 4vw, 18px); font-weight: bold; margin-bottom: 4px; color: #2c3e50; pointer-events: none; }
  .sl-word-eng { font-size: clamp(0.8rem, 3.5vw, 14px); color: #7f8c8d; pointer-events: none; }
  .sl-controls { display: flex; gap: 16px; margin-top: 30px; width: 90%; max-width: 750px; }
  .sl-nav-btn {
    flex: 1; padding: 14px 20px; font-size: clamp(1rem, 4vw, 20px); font-weight: bold;
    border-radius: 15px; border: none; cursor: pointer; transition: all 0.15s ease;
    outline: none; background: white; color: #2563c4;
  }
  .sl-nav-btn:disabled { background: rgba(255,255,255,0.4); color: rgba(37, 99, 196, 0.4); cursor: default; box-shadow: none; }
  .sl-nav-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .sl-nav-btn:not(:disabled):active { transform: translateY(2px) scale(0.96); }

  /* See Full List button */
  .sl-list-btn {
    width: 90%; max-width: 750px; margin-top: 14px; margin-bottom: 40px;
    padding: 13px 20px; font-size: clamp(0.95rem, 3.5vw, 17px); font-weight: 700;
    border-radius: 15px; border: 2px solid rgba(58,127,212,0.25);
    background: rgba(255,255,255,0.7); color: #2563c4;
    cursor: pointer; transition: all 0.2s ease; outline: none;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 2px 10px rgba(58,127,212,0.08); font-family: 'Nunito', sans-serif;
    backdrop-filter: blur(4px);
  }
  .sl-list-btn:hover {
    background: white; border-color: #3a7fd4;
    box-shadow: 0 6px 20px rgba(58,127,212,0.18); transform: translateY(-2px);
  }
  .sl-list-btn:active { transform: translateY(1px) scale(0.98); }

  /* ── Full List View ── */
  .sl-list-root {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 99999;
    background: #dfeefc;
    display: flex; flex-direction: column; align-items: center;
    font-family: "Nunito", "Segoe UI", Tahoma, sans-serif;
    overflow-y: auto; overflow-x: hidden;
  }
  .sl-list-topbar-bg {
    position: fixed; top: 0; left: 0; right: 0; height: 80px;
    background: #dfeefc; z-index: 9; pointer-events: none;
  }
  .sl-list-header {
    position: fixed; top: 20px; left: 0; width: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 0 20px; box-sizing: border-box; z-index: 10;
  }
  .sl-list-title {
    color: #2563c4; font-size: 20px; font-weight: 800;
    background: rgba(255,255,255,0.6); border: 2px solid white;
    padding: 8px 24px; border-radius: 20px; letter-spacing: 1px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .sl-list-body {
    width: 90%; max-width: 750px;
    display: flex; flex-direction: column; gap: 14px;
    padding: 96px 0 40px 0;
  }
  .sl-list-item {
    background: white; border-radius: 18px; padding: 20px 24px;
    box-shadow: 0 6px 20px rgba(58,127,212,0.1);
    display: flex; align-items: center; gap: 16px;
    cursor: pointer; border: 2px solid transparent;
    transition: all 0.18s ease; outline: none;
    text-align: left; font-family: 'Nunito', sans-serif; width: 100%; box-sizing: border-box;
  }
  .sl-list-item:hover {
    border-color: rgba(58,127,212,0.35);
    box-shadow: 0 10px 30px rgba(58,127,212,0.18); transform: translateY(-2px);
  }
  .sl-list-item:active { transform: translateY(1px) scale(0.99); }
  .sl-list-item.sl-list-item--active {
    border-color: #3a7fd4;
    box-shadow: 0 8px 28px rgba(58,127,212,0.25);
    background: #f5f9ff;
  }
  .sl-list-num {
    min-width: 36px; height: 36px; border-radius: 10px;
    background: #dfeefc; color: #2563c4;
    font-size: 15px; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sl-list-item--active .sl-list-num {
    background: #2563c4; color: white;
  }
  .sl-list-texts { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .sl-list-category {
    color: #3a7fd4; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .sl-list-eng {
    color: #7f8c8d; font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    line-height: 1.3;
  }
  .sl-list-target {
    color: #2c3e50; font-size: clamp(1rem, 4vw, 19px); font-weight: 800;
    line-height: 1.3; word-break: break-word;
  }
  .sl-list-item--active .sl-list-target { color: #2563c4; }
  .sl-list-arrow {
    margin-left: auto; flex-shrink: 0; color: #b0c8ea; font-size: 20px; font-weight: bold;
  }
  .sl-list-item--active .sl-list-arrow { color: #3a7fd4; }

  @media (max-width: 768px) {
    .sl-header { 
      padding: 0 16px; 
      top: 16px; 
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sl-back-btn {
      width: 48px; height: 48px; padding: 0; border-radius: 50%;
      color: transparent !important; font-size: 0; left: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .sl-back-btn::after {
      content: ''; position: absolute; width: 22px; height: 22px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232563c4' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E");
      background-size: contain; background-repeat: no-repeat; background-position: center;
    }
    .sl-counter { 
      display: none;
    }
    .sl-filter-btn {
      position: static;
      transform: none;
      font-size: 13px;
      padding: 9px 12px;
      margin: 0 auto;
    }
    .sl-category-pill {
      display: none;
    }
    .sl-card { 
      width: 95%; 
      padding: 24px 16px; 
      margin-top: 12px;
    }
    .sl-eng-text { margin-bottom: 12px; }
    .sl-target-area { flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .sl-word-grid { gap: 8px; }
    .sl-word-btn { padding: 8px 12px; }
    .sl-controls { width: 95%; gap: 10px; }
    .sl-nav-btn { padding: 12px 10px; }
    .sl-list-btn { width: 95%; margin-bottom: 30px; }
    
    /* --- MOBILE LIST STRUCTURE --- */
    .sl-list-header { 
      top: 16px; 
      padding: 0 16px; 
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sl-list-topbar-bg { 
      height: 76px; 
    }
    .sl-list-body { 
      width: 95%; 
      padding-top: 80px; 
    }
    .sl-list-title { 
      display: none; 
    }
    .sl-list-header .sl-filter-btn {
      position: static;
      transform: none;
      font-size: 13px;
      padding: 9px 12px;
      margin: 0 auto;
    }

    /* --- MORE COMPACT MOBILE LIST STYLES --- */
    .sl-list-item { 
      padding: 14px 14px;
      gap: 12px; 
    }
    .sl-list-num { 
      min-width: 32px; height: 32px;
      font-size: 14px; 
    }
    .sl-list-eng {
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .sl-list-target {
      font-size: 15px;
    }
  }
`;function _({deck:i,currentLanguage:j,currentIndex:f,activeFilter:l,setActiveFilter:b,isFilterOpen:a,setIsFilterOpen:c,isMobile:m,FILTERS:h,onBack:u,onSelect:x}){const o=n.useRef(null);n.useEffect(()=>{o.current&&o.current.scrollIntoView({behavior:"smooth",block:"center"})},[]);const g=l==="All"?"All Sentences":l;return e.jsxs("div",{className:"sl-list-root",onClick:()=>a&&c(!1),children:[e.jsx("div",{className:"sl-list-topbar-bg"}),e.jsxs("div",{className:"sl-list-header",children:[e.jsx("div",{className:"sl-list-title",children:g}),e.jsxs("button",{className:"sl-filter-btn",onClick:t=>{t.stopPropagation(),c(d=>!d)},children:[l,e.jsx("i",{className:`sl-filter-chevron${a?" open":""}`,children:"▾"})]}),!m&&a&&e.jsx("div",{className:"sl-dropdown",onClick:t=>t.stopPropagation(),children:h.map(t=>e.jsx("button",{className:`sl-dropdown-item${l===t?" active":""}`,onClick:()=>{b(t),c(!1)},children:t},t))})]}),m&&a&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"sl-sheet-overlay",onClick:()=>c(!1)}),e.jsxs("div",{className:"sl-sheet",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"sl-sheet-handle"}),e.jsx("span",{className:"sl-sheet-title",children:"Browse by scenario"}),h.map(t=>e.jsx("button",{className:`sl-sheet-item${l===t?" active":""}`,onClick:()=>{b(t),c(!1)},children:t},t))]})]}),e.jsx("div",{className:"sl-list-body",children:i.map((t,d)=>{const r=d===f;return e.jsxs("button",{ref:r?o:null,className:`sl-list-item${r?" sl-list-item--active":""}`,onClick:()=>x(d),children:[e.jsx("div",{className:"sl-list-num",children:d+1}),e.jsxs("div",{className:"sl-list-texts",children:[e.jsx("div",{className:"sl-list-eng",children:t.english}),e.jsx("div",{className:"sl-list-target",children:t.translations[j]?.sentence??""})]}),e.jsx("div",{className:"sl-list-arrow",children:"›"})]},d)})})]})}function J({currentLanguage:i,onBack:j}){const[f,l]=n.useState(0),[b,a]=n.useState(!1),[c,m]=n.useState(!1),[h,u]=n.useState("All"),[x,o]=n.useState(!1),g=n.useMemo(()=>["All",...[...new Set(M.map(w=>w.category))]],[]),t=n.useMemo(()=>h==="All"?M:M.filter(s=>s.category===h),[h]);n.useEffect(()=>{l(0)},[h]),n.useEffect(()=>{const s=window.matchMedia("(max-width: 768px)");m(s.matches);const w=E=>m(E.matches);return s.addEventListener("change",w),()=>s.removeEventListener("change",w)},[]),n.useEffect(()=>()=>D(),[]),n.useEffect(()=>{const s=w=>{x?(w.preventDefault(),o(!1)):b&&(w.preventDefault(),a(!1))};return window.addEventListener("global-back",s),()=>window.removeEventListener("global-back",s)},[x,b]);const d=()=>{f<t.length-1&&l(s=>s+1)},r=()=>{f>0&&l(s=>s-1)};if(t.length===0)return null;const p=f<t.length?f:0,v=t[p],N=v.translations[i],I={es:"Spanish",fr:"French",de:"German",it:"Italian"}[i]??"Spanish";return b?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:A}),e.jsx(_,{deck:t,currentLanguage:i,currentIndex:p,activeFilter:h,setActiveFilter:u,isFilterOpen:x,setIsFilterOpen:o,isMobile:c,FILTERS:g,onBack:()=>{o(!1),a(!1)},onSelect:s=>{l(s),o(!1),a(!1)}})]}):e.jsxs("div",{className:"sl-root",onClick:()=>x&&o(!1),children:[e.jsx("style",{children:A}),e.jsxs("div",{className:"sl-header",children:[e.jsxs("div",{className:"sl-counter",children:["Sentence ",p+1," of ",t.length]}),e.jsxs("button",{className:"sl-filter-btn",onClick:s=>{s.stopPropagation(),o(w=>!w)},children:[h,e.jsx("i",{className:`sl-filter-chevron${x?" open":""}`,children:"▾"})]}),!c&&x&&e.jsx("div",{className:"sl-dropdown",onClick:s=>s.stopPropagation(),children:g.map(s=>e.jsx("button",{className:`sl-dropdown-item${h===s?" active":""}`,onClick:()=>{u(s),l(0),o(!1)},children:s},s))})]}),c&&x&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"sl-sheet-overlay",onClick:()=>o(!1)}),e.jsxs("div",{className:"sl-sheet",onClick:s=>s.stopPropagation(),children:[e.jsx("div",{className:"sl-sheet-handle"}),e.jsx("span",{className:"sl-sheet-title",children:"Browse by scenario"}),g.map(s=>e.jsx("button",{className:`sl-sheet-item${h===s?" active":""}`,onClick:()=>{u(s),l(0),o(!1)},children:s},s))]})]}),e.jsxs("div",{className:"sl-card",children:[e.jsx("p",{className:"sl-category-pill",children:v.category}),e.jsx("p",{className:"sl-eng-label",children:"English"}),e.jsxs("h2",{className:"sl-eng-text",children:['"',v.english,'"']}),e.jsx("div",{className:"sl-divider"}),e.jsx("p",{className:"sl-target-label",children:I}),e.jsxs("div",{className:"sl-target-area",children:[e.jsx("h1",{className:"sl-target-text",children:N.sentence}),e.jsx("button",{className:"sl-speak-btn",onClick:()=>H(N.sentence,i),title:"Listen to sentence",children:"🔊"})]}),e.jsxs("div",{className:"sl-breakdown-box",children:[e.jsx("p",{className:"sl-breakdown-title",children:"Word-by-Word Breakdown"}),e.jsx("div",{className:"sl-word-grid",children:N.breakdown.map((s,w)=>e.jsxs("button",{className:"sl-word-btn",onClick:E=>{E.stopPropagation(),U(s.target,i)},children:[e.jsx("div",{className:"sl-word-target",children:s.target}),e.jsx("div",{className:"sl-word-eng",children:s.eng})]},w))})]})]}),e.jsxs("div",{className:"sl-controls",children:[e.jsx("button",{className:"sl-nav-btn",onClick:r,disabled:p===0,children:"← Previous"}),e.jsx("button",{className:"sl-nav-btn",onClick:d,disabled:p===t.length-1,children:"Next Sentence →"})]}),e.jsx("button",{className:"sl-list-btn",onClick:()=>a(!0),children:"☰ See the Full List"})]})}const W=`
  .sp-root {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 99999;
    background: #dfeefc;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: "Nunito", "Segoe UI", Tahoma, sans-serif;
    overflow-y: auto; overflow-x: hidden;
  }

  .sp-header {
    position: absolute; top: 0; left: 0; width: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; z-index: 10;
  }

  .sp-back-btn {
    position: absolute; left: 20px;
    display: inline-flex; align-items: center; gap: 8px;
    background: #ffffff; border: 1.5px solid rgba(79,159,255,0.25);
    color: #3a7fd4; font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 700; padding: 10px 18px;
    border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(79,159,255,0.1);
    outline: none; z-index: 50;
  }
  .sp-back-btn:hover {
    border-color: #4f9fff; background: #f0f7ff;
    color: #2563c4; box-shadow: 0 4px 16px rgba(79,159,255,0.2);
    transform: translateY(-1px);
  }

  .sp-counter {
    color: #2563c4; font-size: 18px; font-weight: 800; 
    background: rgba(255,255,255,0.7); padding: 8px 20px;
    border: 2px solid white; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .sp-card {
    width: 90%; max-width: 750px; background: white; border-radius: 24px;
    padding: 40px 30px; box-shadow: 0 20px 50px rgba(58, 127, 212, 0.15);
    display: flex; flex-direction: column; align-items: center; box-sizing: border-box;
    margin-top: 40px;
  }

  .sp-eng-label { margin: 0 0 5px 0; color: #7f8c8d; font-size: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  .sp-eng-text { margin: 0 0 30px 0; color: #2c3e50; font-size: clamp(1.5rem, 5vw, 32px); text-align: center; font-weight: 800; line-height: 1.2; }

  .sp-target-box {
    width: 100%; background: #f8f9fa; border-radius: 16px;
    padding: 20px; margin-bottom: 40px; position: relative; box-sizing: border-box;
  }
  .sp-target-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  
  .sp-target-label { margin: 0; color: #3a7fd4; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  
  .sp-speak-btn {
    width: 44px; height: 44px; border-radius: 50%; border: none; flex-shrink: 0;
    background: #EDF4FF; color: #3a7fd4; cursor: pointer; font-size: 20px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; outline: none;
  }
  .sp-speak-btn:hover { transform: scale(1.1); background: #Dbeaff; }
  .sp-speak-btn:active { transform: scale(0.9); }

  .sp-target-text { margin: 0; color: #2563c4; font-size: clamp(1.8rem, 6vw, 38px); text-align: center; line-height: 1.3; font-weight: 800; }

  .sp-feedback-area { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; }
  .sp-feedback-text { height: 30px; font-size: clamp(1rem, 4vw, 18px); font-weight: bold; color: #7f8c8d; text-align: center; }

  .sp-mic-btn {
    width: 100px; height: 100px; border-radius: 50%; border: none; cursor: pointer; font-size: 40px;
    color: white; display: flex; justify-content: center; align-items: center; outline: none;
    transition: all 0.2s ease; user-select: none; -webkit-user-select: none; touch-action: none;
  }
  .sp-mic-btn.idle { background: #3a7fd4; box-shadow: 0 10px 20px rgba(58, 127, 212, 0.4); }
  .sp-mic-btn.recording { background: #e74c3c; box-shadow: 0 0 0 15px rgba(231,76,60,0.3); transform: scale(0.95); }

  .sp-transcript { min-height: 30px; color: #95a5a6; font-style: italic; text-align: center; font-size: clamp(0.9rem, 3.5vw, 16px); }

  .sp-unsupported-warn {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 99999;
    background: #2c3e50; display: flex; flex-direction: column; align-items: center; 
    justify-content: center; color: white; padding: 20px; text-align: center; box-sizing: border-box;
    font-family: "Nunito", "Segoe UI", Tahoma, sans-serif;
  }
  .sp-unsupported-warn .browser-list {
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin: 20px 0;
  }
  .sp-unsupported-warn .browser-chip {
    background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 20px;
    font-size: 14px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);
  }

  @media (max-width: 768px) {
    /* 1. Anchor the page flow to the top so content never creeps upward into the header */
    .sp-root {
      justify-content: flex-start;
      padding-top: 76px; /* 👈 Leaves clear room for the top-left global back button and counter */
      padding-bottom: 30px;
      box-sizing: border-box;
    }

    .sp-header { 
      padding: 16px; 
      top: 0; 
    }
    
    .sp-counter { 
      font-size: 14px; 
      padding: 6px 14px; 
    }

    /* 2. Set card margin to 10px (since sp-root already provides 76px of top padding) */
    .sp-card { 
      width: 95%; 
      padding: 24px 16px; 
      margin-top: 10px; /* 👈 Changed from 70px to 10px */
    }

    .sp-eng-text { margin-bottom: 20px; }
    .sp-target-box { margin-bottom: 24px; padding: 16px; }
    .sp-mic-btn { width: 80px; height: 80px; font-size: 32px; }
  }
`;function K({currentLanguage:i,onBack:j}){const[f,l]=n.useState(!0),[b,a]=n.useState(""),[c,m]=n.useState(0),[h,u]=n.useState(!1),[x,o]=n.useState(""),[g,t]=n.useState("idle"),[d,r]=n.useState(!1),p=n.useRef(null),v=n.useRef(""),N=n.useRef(!1),I=P[c],s=I?I.translations[i]:null,w={es:"Spanish",fr:"French",de:"German",it:"Italian",el:"Greek"}[i]||"Spanish";n.useEffect(()=>()=>D(),[]),n.useEffect(()=>{if(!window.isSecureContext){l(!1),a("Voice recognition requires a secure connection (HTTPS). Please access this site via HTTPS.");return}const S=/android|iphone|ipad|mobile/i.test(navigator.userAgent);r(S);const y=window.SpeechRecognition||window.webkitSpeechRecognition;l(!!y)},[]),n.useEffect(()=>{s&&(v.current=s.sentence)},[s]);const E=S=>S.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,/#!$%^&*;:{}=\-_`~()¿¡?]/g,"").replace(/\s{2,}/g," ").trim(),Y=(S,y)=>{const B=E(S).split(" "),k=E(y).split(" ");let z=0;return k.forEach(F=>{B.includes(F)&&z++}),z/k.length>=.8};n.useEffect(()=>{if(!f)return;const S=window.SpeechRecognition||window.webkitSpeechRecognition;if(!S)return;const y=new S,B={es:"es-ES",fr:"fr-FR",de:"de-DE",it:"it-IT",el:"el-GR"};return y.lang=B[i]||"es-ES",y.interimResults=!0,y.maxAlternatives=3,y.onstart=()=>{N.current=!0,u(!0),t("listening")},y.onresult=k=>{let z="",F="";for(let C=k.resultIndex;C<k.results.length;C++){const L=k.results[C][0].transcript;k.results[C].isFinal?z+=L:F+=L}if(F&&o(F),!z)return;if(o(z),!z.trim()){t("idle");return}Y(z,v.current)?(t("correct"),setTimeout(()=>{m(C=>C<P.length-1?C+1:C),t("idle"),o("")},2e3)):t("incorrect")},y.onerror=k=>{switch(k.error){case"no-speech":t("idle"),o("No speech detected. Please try again.");break;case"aborted":break;case"audio-capture":t("error"),o("No microphone found. Please connect a microphone and try again.");break;case"not-allowed":t("error");break;case"network":t("idle"),o("Connection issue. Please try again.");break;case"service-not-allowed":t("error"),o("Speech service is not allowed. Please check your browser settings.");break;default:t("idle"),o("Couldn't hear clearly. Please try again.")}},y.onend=()=>{N.current=!1,u(!1),t(k=>k==="listening"?"idle":k)},p.current=y,()=>{if(p.current)try{p.current.abort()}catch{}}},[i,f]);const $=()=>{if(!N.current&&(D(),g!=="correct")){o("");try{p.current.start()}catch{}}};return f?I?e.jsxs("div",{className:"sp-root",children:[e.jsx("style",{children:W}),e.jsx("div",{className:"sp-header",children:e.jsxs("div",{className:"sp-counter",children:["Speaking Practice: ",c+1," / ",P.length]})}),e.jsxs("div",{className:"sp-card",children:[e.jsx("p",{className:"sp-eng-label",children:"ENGLISH"}),e.jsxs("h2",{className:"sp-eng-text",children:['"',I.english,'"']}),e.jsxs("div",{className:"sp-target-box",children:[e.jsxs("div",{className:"sp-target-header",children:[e.jsxs("p",{className:"sp-target-label",children:["TARGET: ",w]}),e.jsx("button",{className:"sp-speak-btn",onClick:()=>G(s.sentence,i),title:"Hear Pronunciation",children:"🔊"})]}),e.jsx("h1",{className:"sp-target-text",children:s.sentence})]}),g==="error"?e.jsxs("div",{className:"sp-feedback-area",children:[e.jsx("div",{style:{color:"#e74c3c",fontWeight:"bold",textAlign:"center",marginBottom:"10px"},children:x||"Microphone access is missing or blocked."}),e.jsx("button",{onClick:()=>{t("idle"),o("")},style:{padding:"10px 20px",background:"#e74c3c",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"},children:"Reset & Try Again"})]}):e.jsxs("div",{className:"sp-feedback-area",children:[e.jsxs("div",{className:"sp-feedback-text",children:[g==="idle"&&"Press the mic, speak, then wait a moment",g==="listening"&&e.jsx("span",{style:{color:"#f39c12"},children:"Listening... Speak now!"}),g==="correct"&&e.jsx("span",{style:{color:"#2563c4"},children:"Perfect! Next sentence coming..."}),g==="incorrect"&&e.jsx("span",{style:{color:"#e74c3c"},children:"Not quite right. Try again!"})]}),e.jsx("button",{className:`sp-mic-btn ${h?"recording":"idle"}`,onClick:$,children:"🎙️"}),e.jsxs("div",{className:"sp-transcript",style:{opacity:x?1:0},children:['Heard: "',x,'"']}),!d&&e.jsx("p",{style:{fontSize:"0.78rem",color:"#f59e0b",textAlign:"center",margin:"4px 0 0 0",lineHeight:1.5},children:"⚠️ Voice recognition is experimental on desktop and may not work in all browsers."})]})]})]}):null:e.jsxs("div",{className:"sp-unsupported-warn",children:[e.jsx("style",{children:W}),e.jsx("h2",{style:{marginBottom:"20px"},children:"Voice Recognition Currently Unavailable"}),e.jsx("p",{style:{fontSize:"18px",maxWidth:"500px",lineHeight:"1.6"},children:b}),e.jsxs("div",{className:"browser-list",children:[e.jsx("span",{className:"browser-chip",children:"Chrome"}),e.jsx("span",{className:"browser-chip",children:"Edge"}),e.jsx("span",{className:"browser-chip",children:"Safari 14.1+"}),e.jsx("span",{className:"browser-chip",children:"Mobile browsers"})]}),e.jsx("button",{onClick:j,style:{marginTop:"20px",padding:"12px 28px",background:"#3a7fd4",color:"white",border:"none",borderRadius:"12px",fontSize:"16px",cursor:"pointer",fontWeight:"bold",boxShadow:"0 4px 12px rgba(58,127,212,0.3)"},children:"← Go Back"})]})}function Q({currentLanguage:i,onBack:j}){const[f,l]=n.useState(null),b=c=>{R.playSFX("click",.4),l(c)},a={position:"fixed",top:0,left:0,width:"100vw",height:"100dvh",zIndex:99999,background:"#dfeefc",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:'"Nunito", "Segoe UI", Tahoma, sans-serif'};return f?e.jsx("div",{style:a,children:e.jsx(Z,{dialogue:f,currentLanguage:i,onComplete:()=>l(null)})}):e.jsx("div",{style:a,children:e.jsxs("div",{className:"dia-menu-container",children:[e.jsxs("div",{className:"dia-menu-header-text",children:[e.jsx("h1",{className:"dia-main-title",children:"Select a Dialogue"}),e.jsx("p",{className:"dia-main-subtitle",children:"Choose a scenario to practice natural conversation."})]}),e.jsx("div",{className:"dia-grid",children:V.map(c=>e.jsxs("button",{className:"dia-card",onMouseEnter:()=>R.playSFX("hover",.4),onClick:()=>b(c),children:[e.jsx("div",{className:"dia-card-icon",children:e.jsx("img",{src:c.image,alt:c.title,className:"dia-card-icon-img"})}),e.jsxs("div",{className:"dia-card-content",children:[e.jsx("h2",{children:c.title}),e.jsx("p",{children:c.description})]})]},c.id))})]})})}function Z({dialogue:i,currentLanguage:j,onComplete:f}){const[l,b]=n.useState([]),[a,c]=n.useState(0),[m,h]=n.useState([]),[u,x]=n.useState(!1),[o,g]=n.useState(!1),t=n.useRef(null);n.useEffect(()=>{t.current?.scrollIntoView({behavior:"smooth"})},[l,m]),n.useEffect(()=>{if(a>=i.lines.length){setTimeout(()=>g(!0),1e3);return}const r=i.lines[a];if(r.speaker==="npc"){const p=setTimeout(()=>{R.playSFX("hover",.2),b(v=>[...v,{...r,id:a}]),c(a+1)},1e3);return()=>clearTimeout(p)}if(r.speaker==="player"){const p={text:r.text,isCorrect:!0},v={text:r.wrongOptions[0],isCorrect:!1},N=[p,v].sort(()=>Math.random()-.5);h(N)}},[a,i]),n.useEffect(()=>{const r=p=>{p.preventDefault(),f()};return window.addEventListener("global-back",r),()=>window.removeEventListener("global-back",r)},[f]);const d=r=>{if(r.isCorrect){R.playSFX("click",.4),x(!1),h([]);const p=i.lines[a];b(v=>[...v,{speaker:"player",text:p.text,id:a}]),setTimeout(()=>c(a+1),600)}else R.playSFX("click",.4),x(!0),setTimeout(()=>x(!1),600)};return e.jsxs("div",{className:"dia-chat-container",children:[e.jsx("header",{className:"dia-chat-header",children:e.jsx("h2",{children:i.title})}),e.jsxs("div",{className:"dia-messages-area",children:[l.map(r=>e.jsxs("div",{className:`dia-message-row ${r.speaker}`,children:[r.speaker==="npc"?e.jsx("div",{className:"dia-avatar npc",children:i.npcAvatar||"👨"}):e.jsx("div",{className:"dia-avatar player",children:i.playerAvatar||"👩"}),e.jsxs("div",{className:`dia-bubble ${r.speaker}`,children:[e.jsx("div",{className:"dia-target-text",children:r.text[j]}),e.jsxs("div",{className:"dia-english-text",children:["(",r.text.en,")"]})]})]},r.id)),a<i.lines.length&&i.lines[a].speaker==="npc"&&e.jsxs("div",{className:"dia-message-row npc typing",children:[e.jsx("div",{className:"dia-avatar npc",children:i.npcAvatar||"👨"}),e.jsxs("div",{className:"dia-bubble npc",children:[e.jsx("span",{className:"dot"}),e.jsx("span",{className:"dot"}),e.jsx("span",{className:"dot"})]})]}),e.jsx("div",{ref:t,className:"dia-scroll-anchor"})]}),!o&&m.length>0&&e.jsxs("div",{className:"dia-options-area",children:[e.jsx("p",{className:"dia-options-prompt",children:"Select the correct reply:"}),e.jsx("div",{className:`dia-options-grid ${u?"shake-anim":""}`,children:m.map((r,p)=>e.jsx("button",{className:"dia-option-btn",onClick:()=>d(r),onMouseEnter:()=>R.playSFX("hover",.4),children:e.jsx("div",{className:"dia-opt-target",children:r.text[j]})},p))}),u&&e.jsx("p",{className:"dia-wrong-feedback",children:"Incorrect choice! Please try the other one."})]}),o&&e.jsx("div",{className:"dia-complete-overlay",children:e.jsxs("div",{className:"dia-complete-modal",children:[e.jsx("h2",{children:"Complete!"}),e.jsx("p",{children:"You finished the dialogue."}),e.jsx("button",{className:"dia-finish-btn",onClick:f,children:"Back to Menu"})]})})]})}function ne({currentLanguage:i,onBack:j,onGrammarClick:f}){const l=O(),[b,a]=n.useState(!0),[c,m]=n.useState(!1),[h,u]=n.useState(null);n.useEffect(()=>{const t=window.SpeechRecognition||window.webkitSpeechRecognition;a(!!t);const d=window.matchMedia("(max-width: 768px)");m(d.matches);const r=p=>m(p.matches);return d.addEventListener("change",r),()=>d.removeEventListener("change",r)},[]);const x=[{id:"learning",image:"/Images/Sentences.webp",label:"Learn Common Sentences",color:{bg:"#eff6ff",border:"#97c6ff",borderBottom:"#65a0ff"},show:!0},{id:"grammar",image:"/Images/Grammar.webp",label:"Grammar",color:{bg:"#eff6ff",border:"#97c6ff",borderBottom:"#65a0ff"},show:!0},{id:"dialogues",image:"/Images/Dialogues.webp",label:"Dialogues",color:{bg:"#eff6ff",border:"#97c6ff",borderBottom:"#65a0ff"},show:!0},{id:"speaking",image:"/Images/Speak.webp",label:"Speak Out Loud",color:{bg:"#eff6ff",border:"#97c6ff",borderBottom:"#65a0ff"},show:b}].filter(t=>t.show),o=t=>{t==="grammar"?f():l(`/sentences/${t}`)},g=()=>c?e.jsxs("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100dvh",background:"#e2efff",display:"flex",flexDirection:"column",fontFamily:'"Nunito", "Segoe UI", Tahoma, sans-serif',zIndex:99999,overflowY:"auto",padding:"100px 20px 40px",boxSizing:"border-box"},children:[e.jsxs("div",{style:{marginBottom:32},children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(37,99,235,0.1)",border:"1.5px solid rgba(37,99,235,0.25)",borderRadius:30,padding:"5px 14px",marginBottom:14,fontSize:11,fontWeight:800,color:"#2563eb",letterSpacing:"1.5px",textTransform:"uppercase"},children:"✦ Sentences"}),e.jsx("h1",{style:{color:"#1a3a6e",fontSize:"2.4rem",fontWeight:900,margin:"0 0 8px",lineHeight:1.1,fontFamily:'"Outfit", "Nunito", sans-serif',letterSpacing:"-0.5px"},children:"Learn & Interact"}),e.jsx("p",{style:{color:"#6a74aa",fontSize:"1rem",fontWeight:600,margin:0},children:"Learn common sentences and interact to boost your confidence!"})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:14},children:x.map(t=>e.jsxs("button",{onClick:()=>o(t.id),onPointerDown:()=>u(t.id),onPointerUp:()=>u(null),onPointerLeave:()=>u(null),style:{display:"flex",flexDirection:"row",alignItems:"center",gap:18,padding:"18px 20px",borderRadius:22,cursor:"pointer",width:"100%",background:t.color.bg,border:`2px solid ${t.color.border}`,borderBottom:h===t.id?`4px solid ${t.color.borderBottom}`:`8px solid ${t.color.borderBottom}`,fontFamily:'"Nunito", sans-serif',transform:h===t.id?"translateY(4px)":"translateY(0)",transition:"transform 0.1s ease, border-bottom-width 0.1s ease",textAlign:"left",outline:"none",boxSizing:"border-box"},children:[e.jsx("div",{style:{width:68,height:68,borderRadius:18,flexShrink:0,background:"#ffffff",border:`2px solid ${t.color.border}`,boxShadow:"0 4px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem"},children:e.jsx("img",{src:t.image,alt:"",style:{width:"44px",height:"44px",objectFit:"contain"}})}),e.jsx("span",{style:{fontSize:"1.25rem",fontWeight:800,color:"#1e293b",lineHeight:1.25},children:t.label}),e.jsx("svg",{style:{marginLeft:"auto",flexShrink:0,opacity:.35},width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"#1e293b",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M9 18l6-6-6-6"})})]},t.id))})]}):e.jsxs("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100dvh",background:"#e2efff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:'"Nunito", "Segoe UI", Tahoma, sans-serif',zIndex:99999,overflowY:"auto",padding:"40px 20px",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:48,textAlign:"center"},children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(37,99,235,0.1)",border:"1.5px solid rgba(37,99,235,0.25)",borderRadius:30,padding:"5px 14px",marginBottom:14,fontSize:11,fontWeight:800,color:"#2563eb",letterSpacing:"1.5px",textTransform:"uppercase"},children:"✦ Sentences"}),e.jsx("h1",{style:{color:"#1a3a6e",fontSize:"3rem",fontWeight:900,margin:"0 0 12px",lineHeight:1.1,fontFamily:'"Outfit", "Nunito", sans-serif',letterSpacing:"-0.5px"},children:"Learn & Interact"}),e.jsx("p",{style:{color:"#6a74aa",fontSize:"1.1rem",fontWeight:600,margin:0,fontFamily:'"Nunito", sans-serif'},children:"Learn common sentences and interact to boost your confidence!"})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 300px)",gap:25,justifyContent:"center",maxWidth:1e3},children:x.map(t=>e.jsxs("button",{onClick:()=>o(t.id),style:{outline:"none",width:"100%",height:280,borderRadius:24,border:"none",background:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,cursor:"pointer",boxShadow:"0 10px 25px rgba(0,0,0,0.15)",transition:"all 0.3s ease",fontFamily:'"Nunito", sans-serif'},onMouseEnter:d=>{d.currentTarget.style.transform="translateY(-10px)",d.currentTarget.style.boxShadow="0 20px 40px rgba(0,0,0,0.3)"},onMouseLeave:d=>{d.currentTarget.style.transform="translateY(0)",d.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,0.15)"},children:[e.jsx("img",{src:t.image,alt:"",style:{width:"80px",height:"80px",objectFit:"contain"}}),e.jsx("span",{style:{fontSize:24,fontWeight:"bold",color:"#2c3e50",textAlign:"center"},children:t.label})]},t.id))})]});return e.jsxs(e.Fragment,{children:[e.jsxs(X,{children:[e.jsx("title",{children:"Learn and Practice Common Sentences | Lexi Explorer"}),e.jsx("meta",{name:"description",content:"Learn and practice common sentences, dialogues, and speaking exercises to improve your language skills naturally."}),e.jsx("link",{rel:"canonical",href:"/sentences"})]}),e.jsxs(q,{children:[e.jsx(T,{path:"/",element:g()}),e.jsx(T,{path:"/learning",element:e.jsx(J,{currentLanguage:i,onBack:()=>l("/sentences")})}),e.jsx(T,{path:"/speaking",element:e.jsx(K,{currentLanguage:i,onBack:()=>l("/sentences")})}),e.jsx(T,{path:"/dialogues",element:e.jsx(Q,{currentLanguage:i,onBack:()=>l("/sentences")})})]})]})}export{ne as default};
