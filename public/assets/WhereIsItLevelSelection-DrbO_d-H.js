import{j as e}from"./three-vendor-BrF7bqo1.js";import{u as s,H as l,d as i}from"./index-C2Y9NDyy.js";const d=`
  .wit-root {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    background: #e2efff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    font-family: 'Nunito', sans-serif;
    padding: 20px 16px 40px;
    box-sizing: border-box;
    z-index: 99999;
  }

  .wit-content {
    width: 100%;
    max-width: 1040px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Back Button - Identical to MiniGameSelection */
  .wit-back-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1.5px solid rgba(79,159,255,0.25);
    color: #3a7fd4;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 10px 18px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 10px rgba(79,159,255,0.1);
    z-index: 2;
  }

  .wit-back-btn:hover {
    border-color: #4f9fff;
    background: #f0f7ff;
    color: #2563c4;
    box-shadow: 0 4px 16px rgba(79,159,255,0.2);
    transform: translateY(-1px);
  }

  .wit-header {
    text-align: center;
    margin-bottom: 28px;
  }

  .wit-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(79,159,255,0.12);
    border: 1.5px solid rgba(79,159,255,0.3);
    border-radius: 30px;
    padding: 6px 16px;
    margin-bottom: 14px;
    font-size: 12px;
    font-weight: 800;
    color: #2e7dd6;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .wit-title {
    font-family: 'Outfit', 'Nunito', sans-serif;
    font-size: clamp(28px, 4.5vw, 42px);
    font-weight: 800;
    color: #1a3a6e;
    line-height: 1.1;
    letter-spacing: -0.5px;
    margin: 0 0 10px;
  }

  .wit-subtitle {
    color: #6b8cb0;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }

  .wit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 290px));
    gap: 18px;
    width: 100%;
    justify-content: center;
  }

  .wit-card {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-bottom: 6px solid #cbd5e1;
    border-radius: 24px;
    padding: 24px 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 18px rgba(0,0,0,0.05);
    outline: none;
  }

  .wit-card:hover {
    transform: translateY(-6px);
    border-color: #93c5fd;
    border-bottom-color: #3b82f6;
    box-shadow: 0 16px 32px rgba(37, 99, 235, 0.15);
  }

  .wit-card:active {
    transform: translateY(2px);
  }

  /* Responsive Mobile Layout */
  @media (max-width: 768px) {
    .wit-root {
      align-items: flex-start;
      justify-content: flex-start;
      padding: 20px 20px 40px;
    }

    .wit-content {
      align-items: flex-start;
    }

    .wit-back-btn {
      position: relative;
      top: auto;
      left: auto;
      width: 48px;
      height: 48px;
      min-width: 48px;
      padding: 0;
      border-radius: 50%;
      color: transparent !important;
      font-size: 0;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 2px solid rgba(79,159,255,0.25);
      box-shadow: 0 4px 12px rgba(58,143,239,0.1);
      flex-shrink: 0;
    }

    .wit-back-btn::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233a7fd4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      transition: transform 0.25s ease;
    }

    .wit-back-btn:hover::after { transform: translateX(-3px); }

    .wit-back-btn:active {
      transform: translateY(2px) scale(0.92);
    }

    .wit-header {
      text-align: left;
      padding-top: 64px;
      margin-bottom: 24px;
    }

    .wit-grid {
      grid-template-columns: 1fr;
      gap: 14px;
      width: 100%;
    }
  }
`,p=[{id:"city",name:"City",world:"City",sub:"Streets, vehicles & buildings",image:"/Images/City.webp"},{id:"house",name:"House",world:"House",sub:"Rooms, appliances & furniture",image:"/Images/House.webp"},{id:"classroom",name:"Classroom",world:"Classroom",sub:"Desks, stationery & school items",image:"/Images/Classroom.webp"},{id:"restaurant",name:"Restaurant",world:"Restaurant",sub:"Food, drinks & dining areas",image:"/Images/Restaurant.webp"},{id:"supermarket",name:"Supermarket",world:"Supermarket",sub:"Groceries, snacks & items",image:"/Images/Supermarket.webp"}];function g({isMobile:c}){const a=s(),o=()=>i.playSFX?.("hover",.4),r=()=>i.playSFX?.("click",.4),n=t=>{r(),a(`/games/whereisit/play/${t}`)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{children:e.jsx("title",{children:"Where Is It? - Choose a Place | Lexi Explorer"})}),e.jsx("style",{dangerouslySetInnerHTML:{__html:d}}),e.jsx("div",{className:"wit-root",children:e.jsxs("div",{className:"wit-content",children:[e.jsxs("div",{className:"wit-header",children:[e.jsx("div",{className:"wit-eyebrow",children:"3D Scavenger Hunt"}),e.jsx("h1",{className:"wit-title",children:"Where is it?"}),e.jsx("p",{className:"wit-subtitle",children:"Pick a place to explore and find the target objects"})]}),e.jsx("div",{className:"wit-grid",children:p.map(t=>e.jsxs("button",{className:"wit-card",onClick:()=>n(t.id),onMouseEnter:o,children:[e.jsx("div",{style:{width:"100px",height:"100px",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("img",{src:t.image,alt:t.name,style:{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 6px 12px rgba(0,0,0,0.12))"}})}),e.jsx("h2",{style:{margin:"0 0 6px 0",fontSize:"21px",fontWeight:800,color:"#0f172a",fontFamily:"'Outfit', 'Nunito', sans-serif"},children:t.name}),e.jsx("p",{style:{margin:"0 0 16px 0",fontSize:"13.5px",color:"#64748b",fontWeight:600,lineHeight:1.4},children:t.sub}),e.jsx("div",{style:{marginTop:"auto",width:"100%",background:"#eff6ff",color:"#2563eb",fontWeight:800,fontSize:"13.5px",padding:"9px 0",borderRadius:"12px",border:"1px solid #bfdbfe"},children:"Start Search →"})]},t.id))})]})})]})}export{g as default};
