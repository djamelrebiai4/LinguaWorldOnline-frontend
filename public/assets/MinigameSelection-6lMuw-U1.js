import{j as e}from"./three-vendor-BrF7bqo1.js";import{H as y,d as i}from"./index-C2Y9NDyy.js";const k=`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@500;600;700;800&display=swap');

  .mg-root {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100dvh;
    background: #e2efff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    font-family: 'Nunito', sans-serif;
    z-index: 99999;
  }

  .mg-content {
    width: 100%;
    padding: 20px 0 40px;
  }

  .mg-back-btn {
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

  .mg-back-btn:hover {
    border-color: #4f9fff;
    background: #f0f7ff;
    color: #2563c4;
    box-shadow: 0 4px 16px rgba(79,159,255,0.2);
    transform: translateY(-1px);
  }

  .mg-header {
    text-align: center;
    margin-bottom: 32px;
    animation: mgFadeUp 0.4s ease-out both;
  }

  .mg-eyebrow {
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

  .mg-title {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(28px, 4.5vw, 42px);
    font-weight: 800;
    color: #1a3a6e;
    line-height: 1.1;
    letter-spacing: -0.5px;
    margin: 0 0 10px;
  }

  .mg-subtitle {
    color: #6b8cb0;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }

  /* Grid: 3 cards per row */
  .mg-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    width: 92%;
    max-width: 1020px;
    margin: 0 auto;
  }

  .mg-card {
    width: 310px;
    border-radius: 24px;
    padding: 24px 18px 20px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.25s cubic-bezier(.25,.8,.25,1), box-shadow 0.25s ease;
    border: 2px solid transparent;
    border-bottom-width: 7px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    position: relative;
  }

  .mg-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 45px rgba(0,0,0,0.12);
  }

  .mg-card:active {
    transform: translateY(2px);
  }

  .mg-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .mg-icon-box {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
  }

  .mg-tag {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 5px 11px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  .mg-card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 21px;
    font-weight: 700;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }

  .mg-card-desc {
    font-size: 13.5px;
    line-height: 1.5;
    margin: 0;
    font-weight: 600;
  }

  .mg-play-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 800;
    font-size: 13.5px;
    margin-top: auto;
    padding-top: 6px;
  }

  .mg-mobile-icon { display: none; }

  @keyframes mgFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mg-anim-0 { animation: mgFadeUp 0.4s 0.00s ease-out both; }
  .mg-anim-1 { animation: mgFadeUp 0.4s 0.05s ease-out both; }
  .mg-anim-2 { animation: mgFadeUp 0.4s 0.10s ease-out both; }
  .mg-anim-3 { animation: mgFadeUp 0.4s 0.15s ease-out both; }
  .mg-anim-4 { animation: mgFadeUp 0.4s 0.20s ease-out both; }
  .mg-anim-5 { animation: mgFadeUp 0.4s 0.25s ease-out both; }
  .mg-anim-6 { animation: mgFadeUp 0.4s 0.30s ease-out both; }

  .mg-card-locked {
    filter: grayscale(1) brightness(0.97);
    cursor: not-allowed;
  }

  .mg-lock-label {
    font-family: 'Nunito', sans-serif;
    font-size: 12px;
    font-weight: 800;
    color: #7a8fa8;
    margin: 6px 0 0;
  }

  @media (max-width: 992px) {
    .mg-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .mg-root {
      align-items: flex-start;
      justify-content: flex-start;
      padding: 20px 20px 40px;
      box-sizing: border-box;
    }

    .mg-back-btn {
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

    .mg-back-btn::after {
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

    .mg-grid {
      grid-template-columns: 1fr;
      gap: 14px;
      width: 100%;
    }

    .mg-card {
      flex-direction: row;
      align-items: center;
      padding: 16px 18px;
      border-radius: 22px;
      border-bottom-width: 6px;
      gap: 16px;
      box-sizing: border-box;
    }

    .mg-card:hover { transform: none; }
    .mg-card:active { transform: translateY(3px); }

    .mg-card-top { display: none; }
    .mg-play-row { display: none; }

    .mg-mobile-icon {
      display: flex;
      width: 60px;
      height: 60px;
      min-width: 60px;
      border-radius: 16px;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .mg-card-body { flex: 1; min-width: 0; }
    .mg-card-title { font-size: 1.15rem; margin-bottom: 4px; }
    .mg-card-desc { font-size: 0.88rem; line-height: 1.4; }

    .mg-card::after {
      content: '';
      width: 20px;
      height: 20px;
      min-width: 20px;
      flex-shrink: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e293b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.3;
    }
  }
`,C=[{id:"whereisit",image:"/Images/whereisit.webp",title:"Where Is It?",desc:"Search the 3D worlds and click on the object matching the target word.",icon:"🔍",tag:"3D Hunt",cardBg:"linear-gradient(135deg, #fff9e6 0%, #fef0cd 100%)",borderColor:"rgba(217, 119, 6, 0.32)",accent:"#b45309",iconBg:"rgba(217, 119, 6, 0.15)",tagColor:"#b45309",tagBg:"rgba(217, 119, 6, 0.12)",descColor:"#7c4a16"},{id:"runner",image:"/Images/Run.webp",title:"Run Forrest Run",desc:"Dodge wrong words on an endless 3D track. Test your reflexes!",icon:"🏃",tag:"Reflexes",cardBg:"linear-gradient(135deg, #ffeede 0%, #fff4e8 100%)",borderColor:"rgba(255,140,66,0.3)",accent:"#c96a10",iconBg:"rgba(255,140,66,0.15)",tagColor:"#c96a10",tagBg:"rgba(255,140,66,0.12)",descColor:"#8a6040"},{id:"builder",image:"/Images/Word_Builder.webp",title:"Word Builder",desc:"Piece together the correct translation from scrambled letters.",icon:"🔤",tag:"Spelling",cardBg:"linear-gradient(135deg, #eedeff 0%, #f6f0ff 100%)",borderColor:"rgba(176,111,255,0.3)",accent:"#7c3fbf",iconBg:"rgba(176,111,255,0.15)",tagColor:"#7c3fbf",tagBg:"rgba(176,111,255,0.12)",descColor:"#7a5a98"},{id:"sentence",image:"/Images/SentenceMaking.webp",title:"Sentence Maker",desc:"Arrange words in the correct syntax and construct perfect sentences.",icon:"📝",tag:"Syntax",cardBg:"linear-gradient(135deg, #e6f9f0 0%, #f0fdf4 100%)",borderColor:"rgba(16, 185, 129, 0.3)",accent:"#059669",iconBg:"rgba(16, 185, 129, 0.15)",tagColor:"#059669",tagBg:"rgba(16, 185, 129, 0.12)",descColor:"#2e634f"},{id:"falling",image:"/Images/Fall.webp",title:"Falling Words",desc:"Find the correct English word before it crashes to the ground!",icon:"🌧️",tag:"Speed",cardBg:"linear-gradient(135deg, #d8e9fa 0%, #edf4fd 100%)",borderColor:"rgba(20, 76, 180, 0.3)",accent:"#0f498c",iconBg:"rgba(20, 84, 180, 0.15)",tagColor:"#0f418c",tagBg:"rgba(20, 89, 180, 0.12)",descColor:"#3d557a"},{id:"audiomatch",image:"/Images/Listen.webp",title:"Hear & Match",desc:"Listen to spoken words and match them to the correct picture.",icon:"🔊",tag:"Listening",cardBg:"linear-gradient(135deg, #fdecea 0%, #fff5f5 100%)",borderColor:"rgba(220, 60, 60, 0.3)",accent:"#c0392b",iconBg:"rgba(220, 60, 60, 0.15)",tagColor:"#c0392b",tagBg:"rgba(220, 60, 60, 0.12)",descColor:"#7a2e2e"},{id:"balloon",image:"/Images/BalloonPop.webp",title:"Balloon Pop",desc:"Aim and pop the balloon containing the correct translation!",icon:"🎈",tag:"Speed",cardBg:"linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",borderColor:"rgba(14, 165, 233, 0.25)",accent:"#0284C7",iconBg:"rgba(14, 165, 233, 0.15)",tagColor:"#0284C7",tagBg:"rgba(14, 165, 233, 0.12)",descColor:"#0C4A6E"}];function z({onClose:j,onPlayWhereIsIt:s,onPlayRunner:g,onPlaySpelling:l,onPlaySentence:d,onPlayFalling:c,onPlayAudioMatch:m,onPlayBalloon:p,unlockedWords:x=[],currentLanguage:f="es"}){const b=()=>i.playSFX("hover",.4),h=()=>i.playSFX("click",.4),o=new Set(["runner","builder","falling","balloon"]),r=x.filter(t=>(t.language||"es")===f),n=r.length>=10,u=t=>{h(),!(o.has(t)&&!n)&&(t==="whereisit"?s():t==="runner"?g():t==="builder"?l():t==="sentence"?d():t==="falling"?c():t==="audiomatch"?m():t==="balloon"&&p())};return e.jsxs(e.Fragment,{children:[e.jsxs(y,{children:[e.jsx("title",{children:"Language Learning Games | Play to Practice | Lexi Explorer"}),e.jsx("meta",{name:"description",content:"Play interactive language learning games like Where Is It, runner, spelling, sentence building, and falling words to improve vocabulary."}),e.jsx("link",{rel:"canonical",href:"/games"})]}),e.jsx("style",{dangerouslySetInnerHTML:{__html:k}}),e.jsx("div",{className:"mg-root",children:e.jsxs("div",{className:"mg-content",children:[e.jsxs("div",{className:"mg-header",children:[e.jsx("div",{className:"mg-eyebrow",children:"🎮 Games"}),e.jsx("h1",{className:"mg-title",children:"Choose Your Game"}),e.jsx("p",{className:"mg-subtitle",children:"Pick a game and start practicing"})]}),e.jsx("div",{className:"mg-grid",children:C.map((t,w)=>{const a=o.has(t.id)&&!n;return e.jsxs("button",{className:`mg-card mg-anim-${w} ${a?"mg-card-locked":""}`,onMouseEnter:b,onClick:()=>u(t.id),style:{background:t.cardBg,borderColor:t.borderColor},children:[e.jsx("div",{className:"mg-mobile-icon",style:{background:"transparent"},children:e.jsx("img",{src:t.image,alt:"",style:{width:"60px",height:"60px",objectFit:"contain"}})}),e.jsxs("div",{className:"mg-card-top",children:[e.jsx("div",{className:"mg-icon-box",style:{background:"transparent"},children:e.jsx("img",{src:t.image,alt:"",style:{width:"70px",height:"70px",objectFit:"contain"}})}),e.jsx("span",{className:"mg-tag",style:{color:t.tagColor,background:t.tagBg},children:t.tag})]}),e.jsxs("div",{className:"mg-card-body",children:[e.jsx("h2",{className:"mg-card-title",style:{color:t.accent},children:t.title}),a?e.jsxs("p",{className:"mg-lock-label",children:[r.length,"/",10," words discovered.",e.jsx("br",{}),"Explore levels and learn at least ",10," words to unlock this."]}):e.jsx("p",{className:"mg-card-desc",style:{color:t.descColor},children:t.desc})]}),!a&&e.jsxs("div",{className:"mg-play-row",style:{color:t.accent},children:["Play now ",e.jsx("span",{style:{fontSize:16},children:"→"})]})]},t.id)})})]})})]})}export{z as default};
