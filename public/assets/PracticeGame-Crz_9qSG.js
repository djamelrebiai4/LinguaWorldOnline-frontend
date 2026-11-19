import{r as t,k as B,l as D,n as U,b as N,j as e,M as _,h as q,f as Z,o as V,T as $}from"./three-vendor-BrF7bqo1.js";import{w as J}from"./index-C2Y9NDyy.js";function Q({speed:h=15,onPositionUpdate:o,isPaused:d}){const n=t.useRef(),[s,c]=B(),{nodes:a,animations:R}=D("/Models/PlayerAnim_TP2.glb",!0),{actions:g}=U(R,n),b=t.useRef(0),w=t.useRef(0),j=t.useRef(0),y=t.useRef(null),S=t.useRef(null),k=t.useRef(!1);return t.useEffect(()=>{g.Run&&(d?g.Run.paused=!0:(g.Run.paused=!1,g.Run.reset().fadeIn(.2).play(),g.Run.timeScale=1.3)),n.current&&(n.current.rotation.y=Math.PI)},[g,d]),t.useEffect(()=>{const l=i=>{(i.key==="a"||i.key==="A"||i.key==="ArrowLeft")&&(b.current=-1,w.current=-3),(i.key==="d"||i.key==="D"||i.key==="ArrowRight")&&(b.current=1,w.current=3)};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[]),t.useEffect(()=>{const l=f=>{const u=f.touches[0];y.current=u.clientX,S.current=u.clientY,k.current=!1},i=f=>{if(k.current||y.current===null)return;const u=f.touches[0],v=u.clientX-y.current,m=u.clientY-S.current;Math.abs(v)<30||Math.abs(m)>Math.abs(v)||(v<0?(b.current=-1,w.current=-3):(b.current=1,w.current=3),k.current=!0)},p=()=>{y.current=null,S.current=null,k.current=!1};return window.addEventListener("touchstart",l,{passive:!0}),window.addEventListener("touchmove",i,{passive:!0}),window.addEventListener("touchend",p,{passive:!0}),()=>{window.removeEventListener("touchstart",l),window.removeEventListener("touchmove",i),window.removeEventListener("touchend",p)}},[]),N((l,i)=>{if(d||!n.current)return;const p=window.innerWidth<=768;j.current-=h*i,n.current.position.x=_.lerp(n.current.position.x,w.current,10*i),n.current.position.z=j.current,o&&o(n.current.position);const f=p?14:10,u=p?5:4,v=-n.current.position.x*.4;l.camera.position.x=_.lerp(l.camera.position.x,n.current.position.x*.5+v,5*i),l.camera.position.y=u,l.camera.position.z=n.current.position.z+f,l.camera.lookAt(n.current.position.x*.3,2,j.current-20)}),e.jsx("group",{ref:n,dispose:null,children:a.Scene&&e.jsx("primitive",{object:a.Scene})})}const P=40,ee=5,z=50,te=24,C="lexi_practicegame_tutorial_seen",Y=h=>h?h.replace(/^[\d\s._|#\-:;,!?()[\]{}'"\\/@]+/,"").replace(/[\d\s._|#\-:;,!?()[\]{}'"\\/@]+$/,"").trim().toLowerCase():"";function re({isPaused:h}){const{scene:o}=D("/Grounds/PracticeGame.glb"),d=[t.useRef(),t.useRef(),t.useRef(),t.useRef(),t.useRef()],n=t.useMemo(()=>[o.clone(),o.clone(),o.clone(),o.clone(),o.clone()],[o]);return N(s=>{if(h)return;const c=s.camera.position.z-10;d.forEach(a=>{a.current&&a.current.position.z>c+P&&(a.current.position.z-=P*ee)})}),e.jsx(e.Fragment,{children:n.map((s,c)=>e.jsx("group",{ref:d[c],position:[0,0,-c*P],children:e.jsx("primitive",{object:s})},c))})}function H({position:h,color:o,text:d}){const n=d&&typeof d=="string"?d:"???",s=.65,c=4.2,a=2.8;return e.jsxs("group",{position:h,children:[e.jsxs("mesh",{position:[0,a/2,0],children:[e.jsx("boxGeometry",{args:[c,a,.4]}),e.jsx("meshStandardMaterial",{color:o,transparent:!0,opacity:.88})]}),e.jsxs("mesh",{position:[0,a/2,.22],children:[e.jsx("boxGeometry",{args:[c+.08,a+.08,.02]}),e.jsx("meshStandardMaterial",{color:"white",transparent:!0,opacity:.25})]}),e.jsx($,{position:[0,a/2,.25],fontSize:s,color:"white",anchorX:"center",anchorY:"middle",outlineWidth:.03,outlineColor:"black",maxWidth:c-.4,textAlign:"center",lineHeight:1.2,children:n}),e.jsxs("mesh",{position:[0,-.5,0],children:[e.jsx("boxGeometry",{args:[.2,1,.2]}),e.jsx("meshStandardMaterial",{color:o})]})]})}function se({unlockedWords:h,currentLanguage:o,onExit:d,isPaused:n}){const[s,c]=t.useState("playing"),[a,R]=t.useState(0),[g,b]=t.useState(null),[w,j]=t.useState(!1),{active:y}=q(),[S,k]=t.useState(()=>{try{return localStorage.getItem(C)!=="true"}catch{return!0}}),l=()=>{k(!1);try{localStorage.setItem(C,"true")}catch{}},i=n||S;t.useEffect(()=>{if(!y){const r=setTimeout(()=>{window.dispatchEvent(new Event("level-loading-end"))},150);return()=>clearTimeout(r)}},[y]),t.useEffect(()=>()=>{window.dispatchEvent(new Event("level-loading-end"))},[]),t.useEffect(()=>{const r=window.matchMedia("(max-width: 768px)");j(r.matches);const x=E=>j(E.matches);return r.addEventListener("change",x),()=>r.removeEventListener("change",x)},[]);const p=t.useMemo(()=>h.filter(r=>(r.language||"es")===o),[h,o]),f=t.useMemo(()=>{if(p.length<2)return[];const r=[];let x=-30-te;for(let E=0;E<z;E++){const A=p[Math.floor(Math.random()*p.length)],L=p.filter(X=>X.english!==A.english),W=L.length>0?L[Math.floor(Math.random()*L.length)]:null,I=Math.random()>.5,T=Y(A.english),K=W?Y(W.english):null,O=J[T]?.[o]||T,G=K||"—";r.push({id:E,z:x,prompt:O,leftText:I?T:G,rightText:I?G:T,correctLane:I?-3:3}),x-=40}return r},[p,o]),[u,v]=t.useState(0),m=f[u],M=r=>{b(r),setTimeout(()=>b(null),400)},F=r=>{s!=="playing"||!m||r.z<=m.z+1&&r.z>=m.z-3&&(Math.abs(r.x-m.correctLane)<1.5?(M("correct"),R(x=>x+1),u+1>=z?c("won"):v(x=>x+1)):(M("wrong"),c("lost")))};return e.jsxs("div",{style:{width:"100vw",height:"100dvh",position:"relative",overflow:"hidden"},children:[e.jsx("style",{children:`
        @keyframes flash-correct {
          0%   { box-shadow: inset 0 0 120px 60px rgba(46,204,113,0.7); background: rgba(46,204,113,0.2); }
          100% { box-shadow: inset 0 0 0 0 rgba(46,204,113,0); background: transparent; }
        }
        @keyframes flash-wrong {
          0%   { box-shadow: inset 0 0 150px 80px rgba(231,76,60,0.8); background: rgba(231,76,60,0.3); }
          100% { box-shadow: inset 0 0 0 0 rgba(231,76,60,0); background: transparent; }
        }
        @keyframes camera-shake {
          0%   { transform: translate(0, 0); }
          20%  { transform: translate(-2px, 2px); }
          40%  { transform: translate(2px, -2px); }
          60%  { transform: translate(-2px, -2px); }
          80%  { transform: translate(2px, 2px); }
          100% { transform: translate(0, 0); }
        }
        
        .desktop-back-btn {
          position: absolute; top: 20px; left: 20px;
          display: inline-flex; align-items: center; gap: 8px;
          background: #ffffff; border: 1.5px solid rgba(79,159,255,0.25);
          color: #3a7fd4; font-family: 'Nunito', sans-serif;
          font-size: 14px; font-weight: 700; padding: 10px 18px;
          border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(79,159,255,0.1);
          pointer-events: auto; z-index: 50;
        }
        .desktop-back-btn:hover {
          border-color: #4f9fff; background: #f0f7ff;
          color: #2563c4; box-shadow: 0 4px 16px rgba(79,159,255,0.2);
          transform: translateY(-1px);
        }

        /* --- Tutorial --- */
        @keyframes pgTutFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pgTutPopIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .pg-tutorial-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100dvh;
          background: rgba(10, 20, 35, 0.78);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 30000;
          pointer-events: auto;
          animation: pgTutFadeIn 0.25s ease-out;
          padding: 20px;
          box-sizing: border-box;
        }

        .pg-tutorial-modal {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px 28px 28px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          animation: pgTutPopIn 0.35s cubic-bezier(.25,.8,.25,1) both;
          font-family: 'Nunito', sans-serif;
        }

        .pg-tutorial-icon {
          font-size: 44px;
          margin-bottom: 6px;
        }

        .pg-tutorial-modal h2 {
          margin: 0 0 18px;
          color: #1a3a6e;
          font-size: 24px;
          font-weight: 800;
        }

        .pg-tutorial-steps {
          list-style: none;
          margin: 0 0 22px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .pg-tutorial-steps li {
          background: #f0f6ff;
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 15px;
          line-height: 1.5;
          color: #274a72;
          font-weight: 600;
        }

        .pg-tutorial-steps li strong {
          color: #2980b9;
        }

        .pg-tutorial-start-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #4f9fff, #2563c4);
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(37,99,196,0.35);
          transition: transform 0.15s ease;
        }
        .pg-tutorial-start-btn:active {
          transform: translateY(2px) scale(0.98);
        }
      `}),S&&e.jsx("div",{className:"pg-tutorial-overlay",children:e.jsxs("div",{className:"pg-tutorial-modal",children:[e.jsx("h2",{children:"How to Play"}),e.jsxs("ul",{className:"pg-tutorial-steps",children:[e.jsxs("li",{children:["A word in the target language appears at the top. Head toward the gate showing its ",e.jsx("strong",{children:"correct"})," translation."]}),w?e.jsxs("li",{children:[e.jsx("strong",{children:"Swipe left or right"})," anywhere on the screen to switch lanes."]}):e.jsxs("li",{children:["Press ",e.jsx("strong",{children:"A"})," / ",e.jsx("strong",{children:"D"})," or the ",e.jsx("strong",{children:"Left"})," / ",e.jsx("strong",{children:"Right Arrow Keys"})," to switch lanes."]}),e.jsx("li",{children:"Pick the wrong gate and it's game over, so choose carefully!"})]}),e.jsx("button",{className:"pg-tutorial-start-btn",onClick:l,children:"Let's Go!"})]})}),g&&e.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:15,animation:g==="correct"?"flash-correct 0.4s ease-out":"flash-wrong 0.4s ease-out"}}),e.jsxs("div",{style:{position:"absolute",top:0,left:0,width:"100%",pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center",zIndex:10,padding:"16px",boxSizing:"border-box"},children:[s==="playing"&&m&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{marginTop:56,background:"rgba(0,0,0,0.7)",color:"white",padding:"10px 28px",borderRadius:16,fontSize:"clamp(18px, 5vw, 28px)",fontWeight:900,border:"2px solid rgba(255,255,255,0.2)",textTransform:"capitalize",letterSpacing:1,textShadow:"0 2px 6px rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",maxWidth:"80%",textAlign:"center"},children:m.prompt}),e.jsxs("div",{style:{background:"rgba(0,0,0,0.55)",color:"white",fontSize:"clamp(13px, 3vw, 17px)",fontWeight:800,padding:"5px 14px",borderRadius:10,marginTop:8,backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.15)"},children:[a," / ",z]})]}),p.length<2&&s==="playing"&&e.jsx("div",{style:{color:"white",background:"rgba(200,0,0,0.8)",padding:"10px 20px",borderRadius:10,marginTop:10,fontSize:14,fontWeight:"bold"},children:"⚠️ Not enough words unlocked (need at least 2)"})]}),s!=="playing"&&e.jsxs("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",background:s==="won"?"linear-gradient(160deg, #11998e, #38ef7d)":"linear-gradient(160deg, #c0392b, #e74c3c)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:20,padding:32,boxSizing:"border-box",textAlign:"center",pointerEvents:"auto"},children:[e.jsx("h1",{style:{color:"white",fontSize:"clamp(28px, 8vw, 56px)",fontWeight:900,margin:"0 0 8px",textShadow:"0 4px 20px rgba(0,0,0,0.2)",letterSpacing:"-0.5px",lineHeight:1.1},children:s==="won"?"You Win!":"Game Over"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.8)",fontSize:"clamp(13px, 3.5vw, 18px)",fontWeight:600,margin:"0 0 28px"},children:s==="won"?"Amazing job! 🌟":"Better luck next time!"}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"clamp(12px, 4vw, 20px) clamp(28px, 8vw, 56px)",marginBottom:28},children:[e.jsx("p",{style:{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",margin:"0 0 4px"},children:"Final Score"}),e.jsxs("p",{style:{color:"white",fontSize:"clamp(36px, 10vw, 52px)",fontWeight:900,margin:0,lineHeight:1},children:[a,e.jsxs("span",{style:{fontSize:"60%",opacity:.6},children:["/",z]})]})]}),e.jsx("button",{onClick:d,style:{padding:"clamp(12px, 3vw, 16px) clamp(32px, 8vw, 48px)",fontSize:"clamp(15px, 4vw, 20px)",fontWeight:800,cursor:"pointer",background:"white",border:"none",borderRadius:16,color:s==="won"?"#0a7a60":"#c0392b",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",borderBottom:"4px solid rgba(0,0,0,0.15)"},onMouseEnter:r=>r.currentTarget.style.transform="translateY(-2px)",onMouseLeave:r=>r.currentTarget.style.transform="translateY(0)",onMouseDown:r=>r.currentTarget.style.transform="translateY(2px)",children:"Return to Menu"})]}),e.jsx("div",{style:{width:"100%",height:"100%",animation:g?"camera-shake 0.3s cubic-bezier(.36,.07,.19,.97) both":"none"},children:e.jsx(Z,{shadows:!0,camera:{fov:60,near:.1,far:2e3},children:e.jsxs(t.Suspense,{fallback:null,children:[e.jsx("fog",{attach:"fog",args:["#87CEEB",80,400]}),e.jsx(V,{preset:"city"}),e.jsx("ambientLight",{intensity:.5}),e.jsx("directionalLight",{position:[10,20,10],intensity:1,castShadow:!0}),e.jsx(re,{isPaused:i}),f.map((r,x)=>x<u||x>u+3?null:e.jsxs("group",{position:[0,0,r.z],children:[e.jsx(H,{position:[-3,0,0],color:"#2980b9",text:r.leftText}),e.jsx(H,{position:[3,0,0],color:"#c0392b",text:r.rightText})]},r.id)),s==="playing"&&e.jsx(Q,{speed:8,onPositionUpdate:F,isPaused:i})]})})})]})}export{se as default};
