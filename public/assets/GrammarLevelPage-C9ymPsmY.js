import{r as o,u as oe,k as se,V as W,E as ae,b as H,j as e,p as ie,l as q,q as ce,M as le,C as Z,o as de,K as fe,f as pe,P as ue,h as ge}from"./three-vendor-BrF7bqo1.js";import{d as D,u as me,e as xe,P as he,J as be,k as Q,L as we}from"./index-C2Y9NDyy.js";import{u as ye,g as je,R as K,C as ve,a as ke,P as Ne}from"./physics-vendor-HODa8zue.js";import{G as Se,O as Le,d as Ee,a as ze}from"./CollisionConfig-_pz6FJXP.js";const re=o.forwardRef(({joystickInput:t={x:0,y:0},initialPosition:a={x:0,y:1,z:0},eyeHeight:f=1.5,cameraLerp:u=.2,isPaused:s=!1,isMobile:i=!1},d)=>{const{camera:g}=oe(),{world:b}=ye(),[,x]=se(),w=8,p=17.6,k=6,G=1.05,z=o.useRef(!1),y=o.useRef(!1),P=o.useRef(!1),j=o.useRef(new W),M=o.useRef(new W),S=o.useRef(new W),I=o.useRef(new W),L=o.useRef(),v=o.useRef(1),E=o.useRef(new ae(0,0,0,"YXZ")),F=o.useRef(new je.Ray({x:0,y:0,z:0},{x:0,y:-1,z:0}));o.useEffect(()=>{const n=h=>{h.key==="Shift"&&(z.current=!0)},r=h=>{h.key==="Shift"&&(z.current=!1)};window.addEventListener("keydown",n),window.addEventListener("keyup",r);let c=0;const m=setInterval(()=>{++c>=10&&(P.current=!0,clearInterval(m))},16);return()=>{window.removeEventListener("keydown",n),window.removeEventListener("keyup",r),clearInterval(m)}},[]),o.useEffect(()=>{if(!i)return;let n=!1,r=null;const c=T=>{const R=T.changedTouches[0];R.clientX>window.innerWidth/2&&(n=!0,r=R)},m=T=>{if(!n||!r)return;const R=Array.from(T.touches).find(X=>X.identifier===r.identifier);if(!R)return;const O=R.clientX-r.clientX,Y=R.clientY-r.clientY;r=R;const $=.005;E.current.setFromQuaternion(g.quaternion),E.current.y-=O*$,E.current.x-=Y*$;const _=Math.PI/2-.05;E.current.x=Math.max(-_,Math.min(_,E.current.x)),g.quaternion.setFromEuler(E.current)},h=T=>{r&&(Array.from(T.touches).find(O=>O.identifier===r.identifier)||(n=!1,r=null))};return window.addEventListener("touchstart",c,{passive:!1}),window.addEventListener("touchmove",m,{passive:!1}),window.addEventListener("touchend",h),window.addEventListener("touchcancel",h),()=>{window.removeEventListener("touchstart",c),window.removeEventListener("touchmove",m),window.removeEventListener("touchend",h),window.removeEventListener("touchcancel",h)}},[i,g]),o.useEffect(()=>{s&&document.pointerLockElement&&document.exitPointerLock()},[s]),H((n,r)=>{if(s){if(d.current){const C=d.current.linvel();d.current.setLinvel({x:0,y:C.y,z:0},!0)}return}if(!d.current||!P.current)return;const c=d.current.translation();F.current.origin.x=c.x,F.current.origin.y=c.y,F.current.origin.z=c.z;const m=b.castRay(F.current,G,!0);y.current=m!==null;const{forward:h,backward:T,left:R,right:O,jump:Y}=x(),$=z.current||Math.abs(t.x)>.7||Math.abs(t.y)>.7,_=$?p:w,X=(h?1:0)-(T?1:0)-t.y,U=(O?1:0)-(R?1:0)+t.x;g.getWorldDirection(M.current),M.current.y=0,M.current.normalize(),S.current.crossVectors(M.current,g.up).normalize(),j.current.set(0,0,0),j.current.addScaledVector(M.current,X),j.current.addScaledVector(S.current,U),j.current.length()>.1?j.current.normalize():j.current.set(0,0,0),j.current.multiplyScalar(_);const V=d.current.linvel();if(d.current.setLinvel({x:j.current.x,y:V.y,z:j.current.z},!0),(Math.abs(U)>.1||Math.abs(X)>.1)&&y.current){v.current+=r;const C=$?.3:.6;v.current>=C&&(D.playSFX("footstep",.1),v.current=0)}else v.current=1;Y&&y.current&&(d.current.applyImpulse({x:0,y:k,z:0},!0),y.current=!1),I.current.set(c.x,c.y+f,c.z);const N=i?1:u;g.position.lerp(I.current,N)});const B=[a.x,a.y+f+2,a.z];return e.jsxs(e.Fragment,{children:[e.jsx(K,{ref:d,name:"player",type:"dynamic",colliders:!1,position:B,mass:1,linearDamping:1.5,angularDamping:1.5,canSleep:!1,lockRotations:!0,ccd:!0,children:e.jsx(ve,{args:[.8,.4]})}),!s&&!i&&e.jsx(ie,{ref:L})]})});re.displayName="GrammarCharacter";const J=[{normal:"GT1",revealed:"GT1_R"},{normal:"GT2",revealed:"GT2_R"},{normal:"GT3",revealed:"GT3_R"},{normal:"GT4",revealed:"GT4_R"}];function Re({onPositionsReady:t,testsCompleted:a=[!1,!1,!1,!1]}){const{scene:f}=q("/Grounds/GrammarLevel.glb",!0),{scene:u}=q("/Grounds/GrammarLevel_Collision.glb",!0),s=o.useRef({}),i=o.useRef(!1),d=o.useMemo(()=>f.clone(),[f]),g=o.useMemo(()=>{const x=u.clone(),w=new ce({visible:!1});return x.traverse(p=>{p.isMesh&&(p.material=w)}),x},[u]),b=o.useMemo(()=>({playerStart:{x:0,y:0,z:0}}),[]);return o.useEffect(()=>{t&&t(b)},[t,b]),o.useEffect(()=>{const x=new Set(J.flatMap(p=>[p.normal,p.revealed])),w={};d.traverse(p=>{p.isMesh&&(p.receiveShadow=!1,p.castShadow=!1,x.has(p.name)&&(w[p.name]=p))}),s.current=w,i.current=!0,J.forEach(({normal:p,revealed:k})=>{s.current[p]&&(s.current[p].visible=!0),s.current[k]&&(s.current[k].visible=!1)}),console.log("Initialized meshes:",Object.keys(s.current))},[d]),o.useEffect(()=>{if(!i.current){console.log("Not initialized yet");return}console.log("Updating visibility for tests:",a),J.forEach(({normal:x,revealed:w},p)=>{const k=!!a[p],G=s.current[x],z=s.current[w];G?(G.visible=!k,console.log(`${x} visible: ${!k}`)):console.warn(`Mesh ${x} not found`),z?(z.visible=k,console.log(`${w} visible: ${k}`)):console.warn(`Mesh ${w} not found`)})},[a]),e.jsxs(e.Fragment,{children:[e.jsx("primitive",{object:d}),e.jsx(K,{type:"fixed",colliders:"trimesh",friction:1,collisionGroups:Se,children:e.jsx("primitive",{object:g})})]})}function ee({position:t,scale:a,isOpen:f,color:u="#2a2f52"}){const s=o.useRef(),i=t[1],d=i-a[1]*2.2,g=o.useRef(i),b=o.useRef(!0);return o.useEffect(()=>{if(b.current){b.current=!1;return}f&&D.playSFX("doorOpen",1)},[f]),H((x,w)=>{if(!s.current)return;const p=f?d:i;g.current=le.damp(g.current,p,.35,w),s.current.setNextKinematicTranslation({x:t[0],y:g.current,z:t[2]})}),e.jsx(K,{ref:s,type:"kinematicPosition",position:t,colliders:"cuboid",friction:1,children:e.jsxs("mesh",{castShadow:!0,receiveShadow:!0,children:[e.jsx("boxGeometry",{args:a}),e.jsx("meshStandardMaterial",{color:u,roughness:.35,metalness:.4,emissive:u,emissiveIntensity:f?.1:.4})]})})}function A({position:t,scale:a,onEnter:f,active:u=!0,debug:s=!1}){return e.jsxs(K,{type:"fixed",position:t,colliders:!1,sensor:!0,children:[e.jsx(ke,{args:[a[0]/2,a[1]/2,a[2]/2],sensor:!0,collisionGroups:Le,onIntersectionEnter:({other:i})=>{u&&i?.rigidBodyObject?.name==="player"&&f?.()}}),s&&e.jsxs("mesh",{children:[e.jsx("boxGeometry",{args:a}),e.jsx("meshBasicMaterial",{color:"lime",wireframe:!0})]})]})}const te=["octahedron","tetrahedron","icosahedron","dodecahedron","box","torus","cone","sphere"];function Ce({shape:t,radius:a}){switch(t){case"tetrahedron":return e.jsx("tetrahedronGeometry",{args:[a,0]});case"icosahedron":return e.jsx("icosahedronGeometry",{args:[a,0]});case"dodecahedron":return e.jsx("dodecahedronGeometry",{args:[a,0]});case"box":return e.jsx("boxGeometry",{args:[a*1.3,a*1.3,a*1.3]});case"torus":return e.jsx("torusGeometry",{args:[a*.7,a*.3,16,32]});case"cone":return e.jsx("coneGeometry",{args:[a*.9,a*1.6,8]});case"sphere":return e.jsx("sphereGeometry",{args:[a,24,24]});case"octahedron":default:return e.jsx("octahedronGeometry",{args:[a,0]})}}function Pe({position:t,scale:a,progress:f,levelNum:u=1}){const s=o.useRef(),i=o.useRef(new Z("#e11d48")),d=o.useRef(new Z("#e11d48")),g=te[(u-1)%te.length];return H((b,x)=>{s.current&&(s.current.rotation.y+=x*.6,d.current.set(f>=1?"#22c55e":"#e11d48"),i.current.lerp(d.current,x*3),s.current.material.color.copy(i.current),s.current.material.emissive.copy(i.current))}),e.jsxs("mesh",{ref:s,position:t,children:[e.jsx(Ce,{shape:g,radius:a[0]/2}),e.jsx("meshStandardMaterial",{emissiveIntensity:.6,roughness:.2,metalness:.3})]})}function Te({joystickInput:t,isPaused:a,isMobile:f,testsCompleted:u}){const s=o.useRef(),[i,d]=o.useState(null),g=o.useCallback(b=>{d(b),window.dispatchEvent(new CustomEvent("level-loading-end"))},[]);return e.jsxs(e.Fragment,{children:[i&&e.jsx(re,{ref:s,joystickInput:t,initialPosition:i.playerStart,isPaused:a,isMobile:f}),e.jsx(Re,{onPositionsReady:g,testsCompleted:u})]})}function Ge({joystickInput:t,isPaused:a,isMobile:f,levelNum:u,door1Open:s,door2Open:i,testsProgress:d,testsCompleted:g,onLearnTrigger:b,onTestTrigger:x,onTeleportTrigger:w}){return e.jsxs(e.Fragment,{children:[e.jsx("ambientLight",{intensity:.15,color:16777215}),e.jsx("hemisphereLight",{skyColor:8900331,groundColor:9139029,intensity:.2}),e.jsx("directionalLight",{position:[10,20,10],intensity:.15,color:16775388,castShadow:!0}),e.jsx(de,{preset:"city"}),e.jsx(o.Suspense,{children:e.jsxs(Ne,{gravity:[0,-9.81,0],debug:!1,children:[e.jsx(Te,{joystickInput:t,isPaused:a,isMobile:f,testsCompleted:g}),e.jsx(ee,{position:[0,3,-19.8],scale:[4,6,.4],isOpen:s}),e.jsx(ee,{position:[0,3,-45.251],scale:[4,6,.4],isOpen:i}),e.jsx(A,{position:[0,0,-15.5],scale:[5,5,5],onEnter:b}),e.jsx(A,{position:[-10.5,0,-42.5],scale:[4,4,4],onEnter:()=>x(0)}),e.jsx(A,{position:[10.5,0,-42.5],scale:[4,4,4],onEnter:()=>x(1)}),e.jsx(A,{position:[10.5,0,-22.3],scale:[4,4,4],onEnter:()=>x(2)}),e.jsx(A,{position:[-10.5,0,-22.3],scale:[4,4,4],onEnter:()=>x(3)}),e.jsx(A,{position:[0,0,-51],scale:[6,6,6],active:i,onEnter:w})]})}),e.jsx(Pe,{position:[0,1.75,-32.5],scale:[1.5,1.5,1.5],progress:d,levelNum:u}),!f&&e.jsx(Ee,{disableNormalPass:!0,children:e.jsx(ze,{aoRadius:2,intensity:2,color:"black"})})]})}const Me=`
  .gl-overlay {
    position: fixed; inset: 0; z-index: 40000;
    background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box;
    animation: gl-fade-in 0.25s ease-out;
  }
  @keyframes gl-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gl-pop-in {
    from { opacity: 0; transform: scale(0.9) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .gl-modal {
    background: white; border-radius: 28px; padding: 36px 32px;
    max-width: 480px; width: 100%; text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,0.3);
    animation: gl-pop-in 0.3s cubic-bezier(.25,.8,.25,1) both;
    font-family: 'Nunito', sans-serif;
  }
  .gl-badge {
    display: inline-block; background: rgba(37,99,235,0.1); color: #2563eb;
    font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 6px 16px; border-radius: 20px; margin-bottom: 14px;
  }
  .gl-title { font-size: 1.7rem; font-weight: 900; color: #1a3a6e; margin: 0 0 10px; }
  .gl-pattern {
    display: inline-block; background: #eff6ff; color: #2563eb;
    font-weight: 800; font-size: 0.95rem; padding: 6px 16px;
    border-radius: 12px; margin-bottom: 16px;
  }
  .gl-explanation { color: #475569; font-size: 1.05rem; font-weight: 600; line-height: 1.6; margin: 0 0 20px; }
  .gl-examples { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .gl-example-row {
    background: #f0f7ff; border-radius: 14px; padding: 12px 16px;
    display: flex; flex-direction: column; gap: 2px; text-align: left;
  }
  .gl-example-target { color: #1e3a8a; font-weight: 800; font-size: 1.05rem; }
  .gl-example-eng { color: #94a3b8; font-size: 0.9rem; font-style: italic; }
  .gl-done-btn {
    width: 100%; padding: 16px; border: none; border-radius: 16px;
    background: linear-gradient(135deg, #4f9fff, #2563c4); color: white;
    font-size: 1.05rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 8px 20px rgba(37,99,235,0.35); transition: transform 0.15s ease;
  }
  .gl-done-btn:active { transform: translateY(2px) scale(0.98); }

  .gl-more-btn {
    width: 100%; padding: 14px; border: 2px solid #97c6ff; border-radius: 16px;
    background: #eff6ff; color: #2563eb; font-size: 1rem; font-weight: 800;
    cursor: pointer; margin-bottom: 12px; transition: all 0.15s ease;
    font-family: 'Nunito', sans-serif;
  }
  .gl-more-btn:hover { background: #dbeafe; border-color: #2563eb; }
`;function Ie({lesson:t,currentLanguage:a,onDone:f,onLearnMore:u}){return e.jsxs("div",{className:"gl-overlay",children:[e.jsx("style",{children:Me}),e.jsxs("div",{className:"gl-modal",children:[e.jsx("span",{className:"gl-badge",children:"Grammar Rule"}),e.jsx("h2",{className:"gl-title",children:t.title.en}),e.jsx("div",{className:"gl-pattern",children:t.grammarLabel.en}),e.jsx("p",{className:"gl-explanation",children:t.explanation.en}),e.jsx("div",{className:"gl-examples",children:t.examples.map((s,i)=>e.jsxs("div",{className:"gl-example-row",children:[e.jsx("span",{className:"gl-example-target",children:s[a]||s.en}),e.jsx("span",{className:"gl-example-eng",children:s.en})]},i))}),t.elaboration&&e.jsx("button",{className:"gl-more-btn",onClick:u,children:"Learn More"}),e.jsx("button",{className:"gl-done-btn",onClick:f,children:"Got it!"})]})]})}const Fe=`
  .flp-overlay {
    position: fixed; inset: 0; z-index: 42000;
    background: #e2efff; overflow-y: auto;
    font-family: 'Nunito', sans-serif;
  }
  .flp-back-btn {
    position: fixed; top: 20px; left: 20px; z-index: 50000;
    background: transparent; border: none; padding: 0;
    cursor: pointer; outline: none;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s ease;
  }
  .flp-back-btn:hover {
    transform: scale(1.08);
  }
  .flp-back-btn:active {
    transform: scale(0.92);
  }
  .flp-back-img {
    width: 50px; height: 50px;
    object-fit: contain; display: block;
    pointer-events: none;
  }
  .flp-content { max-width: 700px; margin: 0 auto; padding: 90px 24px 60px; }
  .flp-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(37,99,235,0.1); border: 1.5px solid rgba(37,99,235,0.25);
    border-radius: 30px; padding: 5px 14px; margin-bottom: 14px;
    font-size: 11px; font-weight: 800; color: #2563eb;
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .flp-title { font-size: 2.2rem; font-weight: 900; color: #1a3a6e; margin: 0 0 8px; }
  .flp-pattern {
    display: inline-block; background: #eff6ff; color: #2563eb;
    font-weight: 800; font-size: 0.95rem; padding: 6px 16px;
    border-radius: 12px; margin-bottom: 24px;
  }
  .flp-intro { font-size: 1.1rem; color: #475569; font-weight: 600; line-height: 1.7; margin-bottom: 32px; }
  .flp-section { margin-bottom: 28px; }
  .flp-section h3 { font-size: 1.3rem; font-weight: 800; color: #1a3a6e; margin: 0 0 10px; }
  .flp-section p { font-size: 1.05rem; color: #475569; font-weight: 600; line-height: 1.7; margin: 0; }
  .flp-examples-title { font-size: 1.3rem; font-weight: 800; color: #1a3a6e; margin: 32px 0 16px; }
  .flp-example-row {
    background: white; border-radius: 16px; padding: 16px 20px; margin-bottom: 10px;
    border: 2px solid #d6e7ff; display: flex; flex-direction: column; gap: 4px;
  }
  .flp-example-target { color: #1e3a8a; font-weight: 800; font-size: 1.1rem; }
  .flp-example-eng { color: #94a3b8; font-size: 0.95rem; font-style: italic; }

  @media (max-width: 768px) {
    .flp-back-btn {
      top: 16px; left: 16px;
    }
    .flp-back-img {
      width: 46px; height: 46px;
    }
    .flp-content {
      padding: 76px 16px 40px;
    }
    .flp-title {
      font-size: 1.8rem;
    }
  }
`;function De({lesson:t,currentLanguage:a,onBack:f}){const u=t.elaboration?.en,s=()=>{D.playSFX("click",.4),f()};return e.jsxs("div",{className:"flp-overlay",children:[e.jsx("style",{children:Fe}),e.jsx("button",{className:"flp-back-btn",onClick:s,title:"Back to Level","aria-label":"Back to Level",children:e.jsx("img",{src:"/Images/BackButton.webp",alt:"Back",width:"50",height:"50",decoding:"async",className:"flp-back-img"})}),e.jsxs("div",{className:"flp-content",children:[e.jsx("div",{className:"flp-eyebrow",children:"✦ Grammar Lesson"}),e.jsx("h1",{className:"flp-title",children:t.title.en}),e.jsx("div",{className:"flp-pattern",children:t.grammarLabel.en}),u?.intro&&e.jsx("p",{className:"flp-intro",children:u.intro}),u?.sections?.map((i,d)=>e.jsxs("div",{className:"flp-section",children:[e.jsx("h3",{children:i.heading}),e.jsx("p",{children:i.body})]},d)),u?.moreExamples?.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("h3",{className:"flp-examples-title",children:"More Examples"}),u.moreExamples.map((i,d)=>e.jsxs("div",{className:"flp-example-row",children:[e.jsx("span",{className:"flp-example-target",children:i[a]||i.en}),e.jsx("span",{className:"flp-example-eng",children:i.en})]},d))]})]})]})}const Oe=`
  .gt-overlay {
    position: fixed; inset: 0; z-index: 40000;
    background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box;
    animation: gt-fade-in 0.25s ease-out;
  }
  @keyframes gt-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gt-pop-in {
    from { opacity: 0; transform: scale(0.9) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes gt-shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
  }
  .gt-modal {
    position: relative; background: white; border-radius: 28px; padding: 36px 32px;
    max-width: 480px; width: 100%; text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,0.3);
    animation: gt-pop-in 0.3s cubic-bezier(.25,.8,.25,1) both;
    font-family: 'Nunito', sans-serif;
    border: 3px solid transparent; transition: border-color 0.2s ease;
  }
  .gt-modal.gt-correct { border-color: #22c55e; }
  .gt-modal.gt-wrong { border-color: #ef4444; }
  .gt-close-btn {
    position: absolute; top: 24px; right: 24px;
    width: 36px; height: 36px; border-radius: 50%; border: none;
    background: #f1f5f9; color: #64748b; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .gt-badge {
    display: inline-block; background: rgba(37,99,235,0.1); color: #2563eb;
    font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 6px 16px; border-radius: 20px; margin-bottom: 18px;
  }
  .gt-prompt {
    font-size: 1rem; font-weight: 700; color: #2563eb;
    background: #eff6ff; border-radius: 12px; padding: 10px 16px;
    margin: 0 0 20px;
  }
  .gt-sentence { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0 0 22px; }
  .gt-instruction { font-size: 1.05rem; font-weight: 700; color: #475569; margin: 0 0 20px; }
  .gt-choices { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .gt-choices-column { flex-direction: column; }
  .gt-choice-btn {
    padding: 14px 22px; border-radius: 14px; border: 2px solid #e2e8f0;
    background: #f8fafc; color: #1e293b; font-size: 1.05rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s ease; font-family: 'Nunito', sans-serif;
  }
  .gt-choice-btn:hover { border-color: #2563eb; background: #eff6ff; }
  .gt-choice-correct { background: #dcfce7 !important; border-color: #22c55e !important; color: #15803d; }
  .gt-choice-wrong { background: #fee2e2 !important; border-color: #ef4444 !important; color: #b91c1c; }
  .gt-built-sentence {
    min-height: 48px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
    margin-bottom: 18px; padding: 10px; background: #f0f7ff; border-radius: 14px;
  }
  .gt-built-word {
    background: #2563eb; color: white; padding: 8px 14px; border-radius: 10px;
    font-weight: 700; font-size: 0.95rem;
  }
  .gt-word-bank { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .gt-word-tile {
    padding: 12px 18px; border-radius: 12px; border: 2px solid #e2e8f0;
    background: white; color: #1e293b; font-weight: 700; font-size: 1rem;
    cursor: pointer; transition: all 0.15s ease; font-family: 'Nunito', sans-serif;
  }
  .gt-word-tile:hover:not(:disabled) { border-color: #2563eb; background: #eff6ff; }
  .gt-word-tile:disabled { opacity: 0.35; cursor: default; }
  .gt-labels { display: flex; gap: 10px; justify-content: center; margin-bottom: 18px; }
  .gt-label-btn {
    padding: 10px 16px; border-radius: 12px; border: 2px solid #e2e8f0;
    background: #f8fafc; color: #1e293b; font-weight: 800; font-size: 0.9rem;
    cursor: pointer; font-family: 'Nunito', sans-serif;
  }
  .gt-label-active { border-color: #2563eb; background: #eff6ff; }
  .gt-label-done { background: #dcfce7; border-color: #22c55e; opacity: 0.7; }
  .gt-feedback { margin-top: 18px; font-weight: 800; font-size: 1.05rem; }
  .gt-feedback-correct { color: #16a34a; }
  .gt-feedback-wrong { color: #dc2626; }

  /* --- New: True/False --- */
  .gt-tf-row { display: flex; gap: 14px; justify-content: center; }
  .gt-tf-btn {
    flex: 1; max-width: 160px; padding: 16px; border-radius: 14px;
    border: 2px solid #e2e8f0; background: #f8fafc; font-weight: 800;
    font-size: 1.05rem; cursor: pointer; transition: all 0.15s ease;
    font-family: 'Nunito', sans-serif; color: #1e293b;
  }
  .gt-tf-btn:hover { border-color: #2563eb; background: #eff6ff; }
  .gt-tf-pair {
    background: #f0f7ff; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;
  }
  .gt-tf-english { font-size: 0.95rem; color: #64748b; font-weight: 700; margin: 0 0 6px; }
  .gt-tf-translation { font-size: 1.25rem; color: #1e293b; font-weight: 800; margin: 0; }

  /* --- New: Match Pairs --- */
  .gt-pairs-wrap { display: flex; gap: 24px; justify-content: center; }
  .gt-pairs-col { display: flex; flex-direction: column; gap: 10px; min-width: 140px; }
  .gt-pair-item {
    padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0;
    background: white; color: #1e293b; font-weight: 700; font-size: 0.95rem;
    cursor: pointer; transition: all 0.15s ease; font-family: 'Nunito', sans-serif;
  }
  .gt-pair-item:hover:not(:disabled) { border-color: #2563eb; background: #eff6ff; }
  .gt-pair-selected { border-color: #2563eb !important; background: #dbeafe !important; }
  .gt-pair-matched { background: #dcfce7 !important; border-color: #22c55e !important; color: #15803d; opacity: 0.7; cursor: default; }
  .gt-pair-wrong { background: #fee2e2 !important; border-color: #ef4444 !important; animation: gt-shake 0.4s; }
`,ne={selectedLeft:null,matched:[],wrongPair:null};function $e({test:t,currentLanguage:a,onCorrect:f,onClose:u}){const s=a||"es",[i,d]=o.useState(null),[g,b]=o.useState(null),[x,w]=o.useState([]),[p,k]=o.useState(null),[G,z]=o.useState({}),[y,P]=o.useState(ne);o.useEffect(()=>{d(null),b(null),w([]),k(null),z({}),P(ne)},[t]);const j=o.useMemo(()=>t.type!=="arrange"?[]:(t.words[s]||t.words.en).map((r,c)=>({word:r,originalIndex:c})).sort(()=>Math.random()-.5),[t,s]),M=o.useMemo(()=>t.type!=="matchPattern"?[]:(t.items[s]||t.items.en).map((r,c)=>({word:r,originalIndex:c})).sort(()=>Math.random()-.5),[t,s]),S=o.useMemo(()=>{if(t.type!=="matchPairs")return{left:[],right:[]};const n=t.pairs[s]||t.pairs.en,r=n.map((m,h)=>({text:m.en,originalIndex:h})).sort(()=>Math.random()-.5),c=n.map((m,h)=>({text:m.target,originalIndex:h})).sort(()=>Math.random()-.5);return{left:r,right:c}},[t,s]),I=n=>{if(i)return;b(n);const r=n===t.answer;d(r?"correct":"wrong"),setTimeout(r?f:()=>{d(null),b(null)},700)},L=n=>{if(i||x.includes(n.originalIndex))return;const r=[...x,n.originalIndex];w(r);const c=(t.words[s]||t.words.en).length;if(r.length===c){const m=r.every((h,T)=>h===t.answer[T]);d(m?"correct":"wrong"),m?setTimeout(f,700):setTimeout(()=>{d(null),w([])},900)}},v=n=>{if(i||p==null)return;const r={...G,[p]:n};z(r),k(null);const c=Object.keys(t.answer);if(c.every(m=>r[m]!==void 0)){const m=c.every(h=>r[h]===t.answer[h]);d(m?"correct":"wrong"),m?setTimeout(f,700):setTimeout(()=>{d(null),z({})},900)}},E=n=>{if(i)return;b(n?0:1);const r=n===t.answer;d(r?"correct":"wrong"),setTimeout(r?f:()=>{d(null),b(null)},700)},F=n=>{y.matched.includes(n)||P(r=>({...r,selectedLeft:n,wrongPair:null}))},B=n=>{if(y.selectedLeft==null||y.matched.includes(n))return;if(y.selectedLeft===n){const c=[...y.matched,n];P({selectedLeft:null,matched:c,wrongPair:null});const m=(t.pairs[s]||t.pairs.en).length;c.length===m&&(d("correct"),setTimeout(f,700))}else P(c=>({...c,wrongPair:{left:c.selectedLeft,right:n}})),setTimeout(()=>{P(c=>({...c,selectedLeft:null,wrongPair:null}))},500)};return e.jsxs("div",{className:"gt-overlay",children:[e.jsx("style",{children:Oe}),e.jsxs("div",{className:`gt-modal ${i==="correct"?"gt-correct":""} ${i==="wrong"?"gt-wrong":""}`,children:[e.jsx("button",{className:"gt-close-btn",onClick:u,children:"✕"}),e.jsx("span",{className:"gt-badge",children:"Quick Test"}),t.prompt&&e.jsx("p",{className:"gt-prompt",children:t.prompt.en}),t.type==="fillBlank"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-sentence",children:t.sentence[s]||t.sentence.en}),e.jsx("div",{className:"gt-choices",children:(t.choices[s]||t.choices.en).map((n,r)=>e.jsx("button",{className:`gt-choice-btn ${g===r?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>I(r),children:n},r))})]}),t.type==="chooseSentence"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-instruction",children:"Which sentence is correct?"}),e.jsx("div",{className:"gt-choices gt-choices-column",children:(t.options[s]||t.options.en).map((n,r)=>e.jsx("button",{className:`gt-choice-btn ${g===r?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>I(r),children:n},r))})]}),t.type==="arrange"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-instruction",children:"Tap the words in the right order"}),e.jsx("div",{className:"gt-built-sentence",children:x.map((n,r)=>e.jsx("span",{className:"gt-built-word",children:(t.words[s]||t.words.en)[n]},r))}),e.jsx("div",{className:"gt-word-bank",children:j.map(n=>e.jsx("button",{className:"gt-word-tile",disabled:x.includes(n.originalIndex),onClick:()=>L(n),children:n.word},n.originalIndex))})]}),t.type==="matchPattern"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-instruction",children:"Tap a label, then tap its matching word"}),e.jsx("div",{className:"gt-labels",children:t.labels.en.map((n,r)=>{const c=["subject","verb","object"][r],m=G[c]!==void 0;return e.jsx("button",{className:`gt-label-btn ${p===c?"gt-label-active":""} ${m?"gt-label-done":""}`,onClick:()=>k(c),disabled:m,children:n},c)})}),e.jsx("div",{className:"gt-word-bank",children:M.map(n=>{const r=Object.values(G).includes(n.originalIndex);return e.jsx("button",{className:"gt-word-tile",disabled:r,onClick:()=>v(n.originalIndex),children:n.word},n.originalIndex)})})]}),t.type==="trueFalse"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"gt-tf-pair",children:[e.jsx("p",{className:"gt-tf-english",children:t.english}),e.jsx("p",{className:"gt-tf-translation",children:t.translation[s]||t.translation.en})]}),e.jsx("p",{className:"gt-instruction",children:"Is this translation correct?"}),e.jsxs("div",{className:"gt-tf-row",children:[e.jsx("button",{className:`gt-tf-btn ${g===0?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>E(!0),children:"True"}),e.jsx("button",{className:`gt-tf-btn ${g===1?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>E(!1),children:"False"})]})]}),t.type==="multipleChoice"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-sentence",children:t.question[s]||t.question.en}),e.jsx("div",{className:"gt-choices gt-choices-column",children:(t.choices[s]||t.choices.en).map((n,r)=>e.jsx("button",{className:`gt-choice-btn ${g===r?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>I(r),children:n},r))})]}),t.type==="translate"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-instruction",children:"How do you say this?"}),e.jsx("p",{className:"gt-sentence",children:t.english}),e.jsx("div",{className:"gt-choices gt-choices-column",children:(t.options[s]||t.options.en).map((n,r)=>e.jsx("button",{className:`gt-choice-btn ${g===r?i==="correct"?"gt-choice-correct":"gt-choice-wrong":""}`,onClick:()=>I(r),children:n},r))})]}),t.type==="matchPairs"&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"gt-instruction",children:"Match each word to its translation"}),e.jsxs("div",{className:"gt-pairs-wrap",children:[e.jsx("div",{className:"gt-pairs-col",children:S.left.map(n=>{const r=y.matched.includes(n.originalIndex),c=y.selectedLeft===n.originalIndex,m=y.wrongPair?.left===n.originalIndex;return e.jsx("button",{className:`gt-pair-item ${r?"gt-pair-matched":""} ${c?"gt-pair-selected":""} ${m?"gt-pair-wrong":""}`,disabled:r,onClick:()=>F(n.originalIndex),children:n.text},n.originalIndex)})}),e.jsx("div",{className:"gt-pairs-col",children:S.right.map(n=>{const r=y.matched.includes(n.originalIndex),c=y.wrongPair?.right===n.originalIndex;return e.jsx("button",{className:`gt-pair-item ${r?"gt-pair-matched":""} ${c?"gt-pair-wrong":""}`,disabled:r,onClick:()=>B(n.originalIndex),children:n.text},n.originalIndex)})})]})]}),i==="correct"&&e.jsx("p",{className:"gt-feedback gt-feedback-correct",children:"Correct!"}),i==="wrong"&&e.jsx("p",{className:"gt-feedback gt-feedback-wrong",children:"Try again!"})]})]})}function Be(){return e.jsxs("div",{className:"gte-overlay",children:[e.jsx("style",{children:`
        .gte-overlay {
          position: fixed; inset: 0; z-index: 45000;
          background: radial-gradient(circle, rgba(79,159,255,0.9) 0%, rgba(30,58,138,0.95) 60%, #000 100%);
          display: flex; align-items: center; justify-content: center;
          animation: gte-fade-in 0.4s ease-out;
        }
        @keyframes gte-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .gte-text {
          color: white; font-family: 'Nunito', sans-serif; font-size: 1.6rem;
          font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
          animation: gte-pulse 1s ease-in-out infinite;
        }
        @keyframes gte-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}),e.jsx("span",{className:"gte-text",children:"Returning to Grammar Menu..."})]})}const _e=[{name:"forward",keys:["ArrowUp","w","W"]},{name:"backward",keys:["ArrowDown","s","S"]},{name:"left",keys:["ArrowLeft","a","A"]},{name:"right",keys:["ArrowRight","d","D"]},{name:"interact",keys:["f","F"]}],Xe=400,Ae=500;function Ye({forceShow:t}){const{active:a,progress:f}=ge();if(!a&&!t)return null;const u=a?Math.max(15,f):15;return e.jsx(we,{progress:u})}function Je({currentLanguage:t,isMobile:a}){const f=me(),{levelNum:u}=xe(),s=parseInt(u,10)||1,[i,d]=o.useState({x:0,y:0}),[g,b]=o.useState(!1),[x,w]=o.useState(!0),[p,k]=o.useState(!1),[G,z]=o.useState(!1),[y,P]=o.useState([!1,!1,!1,!1]),[j,M]=o.useState([!1,!1,!1,!1]),[S,I]=o.useState(!1),[L,v]=o.useState(null),E=Q[s-1]||Q[0];o.useEffect(()=>{k(!1),P([!1,!1,!1,!1]),M([!1,!1,!1,!1]),I(!1),v(null)},[s]);const F=o.useRef(p),B=o.useRef(y),n=o.useRef(!1);o.useEffect(()=>{F.current=p},[p]),o.useEffect(()=>{B.current=y},[y]),o.useEffect(()=>{n.current=S},[S]),o.useEffect(()=>{const l=()=>w(!1);return window.addEventListener("level-loading-end",l),()=>window.removeEventListener("level-loading-end",l)},[]),o.useEffect(()=>{if(!j.every(Boolean)||S)return;const N=setTimeout(()=>I(!0),Ae);return()=>clearTimeout(N)},[j,S]),o.useEffect(()=>{if(S)try{const l=`lexi_grammar_completed_${t}`,N=localStorage.getItem(l),C=new Set(N?JSON.parse(N):[]);C.add(s),localStorage.setItem(l,JSON.stringify([...C]))}catch{}},[S,s,t]);const r=p;o.useEffect(()=>{r&&z(!0)},[r]);const c=j.filter(Boolean).length/j.length,m=(l,N)=>d({x:l,y:N}),h=o.useCallback(()=>{F.current||v(l=>l===null?(D.playSFX("testEnter",1),"lesson"):l)},[]),T=()=>{D.playSFX("testPassed",1),k(!0),v(null)},R=()=>v("fullLesson"),O=()=>v("lesson"),Y=()=>{document.pointerLockElement&&document.exitPointerLock(),v(l=>l!==null?l:"lesson")},$=o.useCallback(l=>{B.current[l]||v(N=>N===null?(D.playSFX("testEnter",1),l):N)},[]),_=l=>{P(N=>{const C=[...N];return C[l]=!0,C}),v(null),setTimeout(()=>{D.playSFX("testPassed",1),M(N=>{const C=[...N];return C[l]=!0,C})},Xe)},X=o.useCallback(()=>{n.current&&v(l=>l!==null?l:"teleport")},[]);o.useEffect(()=>{if(L==="teleport"){D.playSFX("lessonComplete",.5);const l=setTimeout(()=>f("/sentences/grammar"),2e3);return()=>clearTimeout(l)}},[L,f]);const U=l=>{l&&(l.stopPropagation(),l.preventDefault()),document.pointerLockElement&&document.exitPointerLock(),setTimeout(()=>f("/sentences/grammar"),100)},V=L!==null;return e.jsxs("div",{className:"app-container",children:[e.jsx(Ye,{forceShow:x}),!V&&e.jsxs(e.Fragment,{children:[e.jsx(he,{isPaused:g,setIsPaused:b}),G&&e.jsx("button",{className:"tutorial-toggle-btn",onPointerDown:l=>{l.stopPropagation(),l.preventDefault()},onClick:l=>{l.stopPropagation(),l.preventDefault(),Y()},title:"Show Grammar Rule",style:{background:"transparent",border:"none",boxShadow:"none",padding:0},children:e.jsx("img",{src:"/Images/Tutorial.webp",alt:"Grammar Rule",width:"50",height:"50",decoding:"async",style:{width:"100%",height:"100%",objectFit:"contain",display:"block",pointerEvents:"none"}})})]}),e.jsx("button",{className:"home-button",onPointerDown:U,onClick:U,title:"Home",style:{background:"transparent",border:"none",boxShadow:"none",padding:0},children:e.jsx("img",{src:"/Images/Home.webp",alt:"Home",width:"50",height:"50",decoding:"async",style:{width:"100%",height:"100%",objectFit:"contain",display:"block",pointerEvents:"none",imageRendering:"-webkit-optimize-contrast"}})}),e.jsx(fe,{map:_e,children:e.jsx(pe,{camera:{position:[0,10,15],fov:a?80:60},shadows:!a,gl:{antialias:!a,alpha:!0,powerPreference:"high-performance",pixelRatio:a?1:Math.min(window.devicePixelRatio,2),failIfMajorPerformanceCaveat:!1},onCreated:({gl:l})=>{l.setSize(l.domElement.clientWidth,l.domElement.clientHeight)},children:e.jsxs(o.Suspense,{fallback:null,children:[e.jsx(Ge,{joystickInput:i,isPaused:g||V,isMobile:a,levelNum:s,door1Open:r,door2Open:S,testsProgress:c,testsCompleted:j,onLearnTrigger:h,onTestTrigger:$,onTeleportTrigger:X}),e.jsx(ue,{all:!0})]})})}),a&&e.jsx(be,{onMove:m}),L==="lesson"&&e.jsx(Ie,{lesson:E,currentLanguage:t,onDone:T,onLearnMore:R}),L==="fullLesson"&&e.jsx(De,{lesson:E,currentLanguage:t,onBack:O}),typeof L=="number"&&e.jsx($e,{test:E.tests[L],currentLanguage:t,onCorrect:()=>_(L),onClose:()=>v(null)}),L==="teleport"&&e.jsx(Be,{})]})}export{Je as default};
