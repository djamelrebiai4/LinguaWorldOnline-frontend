import{r as a,j as r}from"./three-vendor-BrF7bqo1.js";import{p as P,b as N}from"./index-C2Y9NDyy.js";const G=new Set(["ambulance","bank","bench","bicycle","bookstore","bridge","building","bus","car","church","cinema","dustbin","factory","fountain","hospital","hotel","house","museum","office","park","restaurant","school","sea","street","supermarket","taxi","tower","tree","truck","university","basin","bathroom","bed","bedroom","book","chair","chimney","closet","door","fridge","kitchen","mattress","microwave","pen","pillow","plate","shower","sofa","stove","table","television","toilet","vase","window","mirror","bookshelf","soap","bathtub","glass","pan","knife","spoon","fork","pot","computer","eight","eraser","five","four","keyboard","nine","one","paper","pencil","projector","seven","six","speaker","three","two","zero","avocado","bar","bottle","carrot","chicken","female","fish","male","meat","pizza","stool","apple","candy","cheese","freezer","honey","orange","pant"]),d=g=>g?g.toLowerCase().trim().replace(/\s+/g,""):"",I=()=>{const k=[...Array.from(G).map(s=>({english:s}))].sort(()=>Math.random()-.5),p=[];for(let s=0;s<k.length;s+=3)if(s+3<=k.length){const f=k.slice(s,s+3),m=f.map(u=>u.english).sort().join("|");p.push({id:m,words:f})}return p};function H({currentLanguage:g,onExit:k,isPaused:p}){const[s,f]=a.useState([]),[m,u]=a.useState(0),[C,z]=a.useState([]),[j,B]=a.useState([]),[x,S]=a.useState(null),[b,E]=a.useState(null),[i,F]=a.useState([]),[l,y]=a.useState("idle"),[n,v]=a.useState(!1);a.useEffect(()=>{const e=window.matchMedia("(max-width: 768px)");v(e.matches);const t=o=>v(o.matches);return e.addEventListener("change",t),()=>{e.removeEventListener("change",t),N()}},[]),a.useEffect(()=>{const e=I();f(e),u(0)},[g]);const w=s[m];a.useEffect(()=>{if(!w)return;const e=[...w.words].sort(()=>Math.random()-.5),t=[...w.words].sort(()=>Math.random()-.5);z(e),B(t),S(null),E(null),F([]),y("idle")},[w,m]);const A=e=>{if(p||l==="correct")return;P(e.english,g);const t=d(e.english);i.some(o=>o.audioWordKey===t)||S(e)},D=e=>{if(p||l==="correct")return;const t=d(e.english);i.some(o=>o.imageWordKey===t)||E(e)};a.useEffect(()=>{if(x&&b){const e=d(x.english),t=d(b.english),o=i.filter(h=>h.audioWordKey!==e&&h.imageWordKey!==t),c=[0,1,2].find(h=>!o.some(L=>L.colorId===h))??0;F([...o,{audioWordKey:e,imageWordKey:t,colorId:c}]),S(null),E(null)}},[x,b,i]);const M=e=>{l==="idle"&&F(t=>t.filter(o=>o.audioWordKey!==e))},K=()=>{if(p||i.length<3)return;y("checking");const e=i.every(t=>t.audioWordKey===t.imageWordKey);setTimeout(()=>{e?(y("correct"),setTimeout(()=>{if(m+1<s.length)u(t=>t+1);else{const t=I();f(t),u(0)}},1500)):(y("wrong"),setTimeout(()=>{F([]),y("idle")},1500))},800)},$=e=>{const t=d(e.english),o=i.find(c=>c.audioWordKey===t);return l==="wrong"?"amg-tile-wrong":l==="correct"&&o?"amg-tile-correct":o?`amg-tile-matched-${o.colorId}`:x&&d(x.english)===t?"amg-tile-active":""},R=e=>{const t=d(e.english),o=i.find(c=>c.imageWordKey===t);return l==="wrong"?"amg-tile-wrong":l==="correct"&&o?"amg-tile-correct":o?`amg-tile-matched-${o.colorId}`:b&&d(b.english)===t?"amg-tile-active":""};if(s.length===0||!w)return null;const T={es:"Spanish",fr:"French",de:"German",it:"Italian",el:"Greek"}[g]||"Spanish",W=n?8:16;return r.jsxs("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100dvh",zIndex:99999,background:"linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:'"Nunito", "Segoe UI", Tahoma, sans-serif',padding:n?"16px":"20px",boxSizing:"border-box",overflowY:"auto"},children:[r.jsx("style",{children:`
        /* Premium Back Button styling - Light Red Theme */
        /* .amg-desktop-back-btn {
          position: absolute; top: 20px; left: 20px;
          display: inline-flex; align-items: center; gap: 8px;
          background: #ffffff; 
          border: 1.5px solid rgba(225, 29, 72, 0.25);
          color: #E11D48; font-family: 'Nunito', sans-serif;
          font-size: 14px; font-weight: 800; padding: 10px 18px;
          border-radius: 14px; cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(225, 29, 72, 0.08);
          z-index: 50;
        }
        .amg-desktop-back-btn:hover {
          background: #FFF1F2;
          border-color: rgba(225, 29, 72, 0.4);
          color: #BE123C;
          transform: translateY(-1px);
        } */

        /* 3D Matching Audio Buttons (Optimized for Horizontal Row) */
        .amg-tile-audio {
          background: #ffffff;
          border: 2.5px solid #E2E8F0;
          color: #1E293B;
          border-radius: 16px;
          padding: ${n?"10px 12px":"16px 20px"};
          font-weight: 800;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 4px 0 #CBD5E1;
          transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          min-width: ${n?"130px":"200px"};
          font-size: ${n?"15px":"18px"};
        }
        .amg-tile-audio:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 #CBD5E1;
        }

        /* 3D Matching Image Cards (Bigger size horizontally!) */
        .amg-tile-image {
          background: #ffffff;
          border: 2.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 8px;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 4px 0 #CBD5E1;
          transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: ${n?"100px":"180px"};
          height: ${n?"100px":"180px"};
        }
        .amg-tile-image:active {
          transform: translateY(4px);
          box-shadow: 0 0 0 #CBD5E1;
        }

        /* Outline selection styles - Rose Accent */
        .amg-tile-active {
          border-color: #E11D48 !important;
          box-shadow: 0 4px 0 #9F1239 !important;
        }

        /* Connection feedback colors (Rose Red, Royal Blue, Purple) */
        .amg-tile-matched-0 {
          border-color: #F43F5E !important;
          background: #FFF1F2 !important;
          box-shadow: 0 4px 0 #F43F5E !important;
        }
        .amg-tile-matched-1 {
          border-color: #3B82F6 !important;
          background: #EFF6FF !important;
          box-shadow: 0 4px 0 #3B82F6 !important;
        }
        .amg-tile-matched-2 {
          border-color: #8B5CF6 !important;
          background: #F5F3FF !important;
          box-shadow: 0 4px 0 #8B5CF6 !important;
        }

        /* Success & Error styles */
        .amg-tile-correct {
          border-color: #10B981 !important;
          background: #D1FAE5 !important;
          box-shadow: 0 4px 0 #10B981 !important;
        }
        .amg-tile-wrong {
          border-color: #EF4444 !important;
          background: #FEF2F2 !important;
          box-shadow: 0 4px 0 #EF4444 !important;
        }

        .amg-check-btn {
          background: #E11D48;
          color: white;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 0 #9F1239;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .amg-check-btn:active {
          transform: translateY(6px);
          box-shadow: 0 0 0 #9F1239;
        }
        .amg-check-btn:disabled {
          background: #ff8290;
          box-shadow: 0 6px 0 #F43F5E;
          cursor: not-allowed;
        }
      `}),r.jsxs("div",{style:{background:"rgba(255,255,255,0.7)",padding:"6px 16px",borderRadius:20,color:"#E11D48",fontSize:n?13:15,fontWeight:"800",margin:"0 0 16px",border:"1px solid rgba(225, 29, 72, 0.15)"},children:["Set ",m+1," of ",s.length]}),r.jsxs("h2",{style:{color:"#F43F5E",fontSize:n?13:16,margin:0,textTransform:"uppercase",letterSpacing:2,textAlign:"center",fontWeight:"bold"},children:["Listening Practice (",T,"):"]}),r.jsx("h1",{style:{color:"#4C0519",fontSize:n?24:34,margin:"6px 0 20px 0",textShadow:"0 4px 12px rgba(225, 29, 72, 0.1)",textAlign:"center",fontWeight:"800",maxWidth:"90%"},children:"Match the Audios to the Images"}),r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:n?20:32,alignItems:"center",justifyContent:"center",width:"100%",maxWidth:900,marginBottom:n?20:30},children:[r.jsx("div",{style:{display:"flex",flexDirection:"row",gap:W,justifyContent:"center",flexWrap:"wrap",width:"100%"},children:C.map(e=>{const t=d(e.english),o=i.some(c=>c.audioWordKey===t);return r.jsxs("button",{className:`amg-tile-audio ${$(e)}`,onClick:()=>A(e),children:[r.jsx("span",{style:{fontSize:n?18:22},children:"🔊"}),r.jsx("span",{children:o?"Linked ✓":"Hear Word"}),o&&r.jsx("div",{onClick:c=>{c.stopPropagation(),M(t)},title:"Tap to unlink",style:{marginLeft:"auto",background:"#EF4444",color:"white",width:18,height:18,borderRadius:"50%",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]},`audio-${e.english}`)})}),r.jsx("div",{style:{display:"flex",flexDirection:"row",gap:W,justifyContent:"center",flexWrap:"wrap",width:"100%"},children:j.map(e=>{const t=d(e.english),o=i.find(h=>h.imageWordKey===t),c=`/Images/ImageGame/${d(e.english)}.webp`;return r.jsxs("div",{className:`amg-tile-image ${R(e)}`,onClick:()=>D(e),children:[r.jsx("img",{src:c,alt:"",onError:h=>{h.target.src="/Images/Wordbuilder.webp"},style:{width:"85%",height:"85%",objectFit:"contain",pointerEvents:"none",filter:"drop-shadow(0px 3px 6px rgba(0,0,0,0.04))"}}),o&&r.jsx("span",{style:{fontSize:9,fontWeight:800,marginTop:2,color:o.colorId===0?"#F43F5E":o.colorId===1?"#3B82F6":"#8B5CF6"},children:"Linked ✓"})]},`img-${e.english}`)})})]}),r.jsxs("div",{style:{height:n?60:80,display:"flex",alignItems:"center"},children:[l==="idle"&&r.jsx("button",{className:"amg-check-btn",disabled:i.length<3,onClick:K,style:{padding:n?"12px 32px":"16px 54px",fontSize:n?16:20,borderRadius:16},children:i.length<3?`Link All 3 (${i.length}/3)`:"Verify Matches"}),l==="checking"&&r.jsx("span",{style:{color:"#E11D48",fontSize:18,fontWeight:"bold"},children:"Evaluating matches..."}),l==="correct"&&r.jsx("h2",{style:{color:"#10B981",fontSize:n?26:32,margin:0,textShadow:"0 2px 8px rgba(16, 185, 129, 0.2)",fontWeight:"800"},children:"Well Done! Correct!"}),l==="wrong"&&r.jsx("h2",{style:{color:"#EF4444",fontSize:n?26:32,margin:0,textShadow:"0 2px 8px rgba(239, 68, 68, 0.2)",fontWeight:"800"},children:"Some matches are wrong!"})]})]})}export{H as default};
