let e=!1;const t="undefined"!=typeof window?window:{},n=t.document||{head:{}},s={t:0,o:"",jmp:e=>e(),raf:e=>requestAnimationFrame(e),ael:(e,t,n,s)=>e.addEventListener(t,n,s),rel:(e,t,n,s)=>e.removeEventListener(t,n,s),ce:(e,t)=>new CustomEvent(e,t)},a=e=>Promise.resolve(e),r=(e,t)=>{t&&!e.i&&t["s-p"]&&t["s-p"].push(new Promise((t=>e.i=t)))},o=e=>{if(!(4&e.t))return r(e,e.l),E((()=>c(e)));e.t|=512},c=e=>{const t=e.m;return $(void 0,(()=>i(e,t)))},i=async(e,t)=>{const n=e.$,s=n["s-rc"];l(e,t),s&&(s.map((e=>e())),n["s-rc"]=void 0);{const t=n["s-p"],s=()=>d(e);0===t.length?s():(Promise.all(t).then(s),e.t|=4,t.length=0)}},l=(e,t)=>{try{t=t.render(),e.t|=2}catch(t){w(t,e.$)}return null},d=e=>{const t=e.$,n=e.l;64&e.t||(e.t|=64,u(t),e.u(t),n||m()),e.i&&(e.i(),e.i=void 0),512&e.t&&C((()=>o(e))),e.t&=-517},m=()=>{u(n.documentElement),C((()=>(e=>{const t=s.ce("appload",{detail:{namespace:"joy-stick"}});return e.dispatchEvent(t),t})(t)))},$=(e,t)=>e&&e.then?e.then(t):t(),u=e=>e.classList.add("hydrated"),f=(e,a={})=>{const c=[],i=a.exclude||[],l=t.customElements,d=n.head,$=d.querySelector("meta[charset]"),u=n.createElement("style"),f=[];let p,b=!0;Object.assign(s,a),s.o=new URL(a.resourcesUrl||"./",n.baseURI).href,e.map((e=>{e[1].map((t=>{const n={t:t[0],p:t[1],h:t[2],v:t[3]},a=n.p,d=class extends HTMLElement{constructor(e){super(e),h(e=this,n)}connectedCallback(){p&&(clearTimeout(p),p=null),b?f.push(this):s.jmp((()=>(e=>{if(0==(1&s.t)){const t=y(e),n=t.g,s=()=>{};if(!(1&t.t)){t.t|=1;{let n=e;for(;n=n.parentNode||n.host;)if(n["s-p"]){r(t,t.l=n);break}}(async(e,t,n,s,a)=>{if(0==(32&t.t)){if(t.t|=32,(a=v(n)).then){const e=()=>{};a=await a,e()}const e=()=>{};try{new a(t)}catch(e){w(e)}e()}const r=t.l,c=()=>o(t);r&&r["s-rc"]?r["s-rc"].push(c):c()})(0,t,n)}s()}})(this)))}disconnectedCallback(){s.jmp((()=>{}))}componentOnReady(){return y(this).k}};n.M=e[0],i.includes(a)||l.get(a)||(c.push(a),l.define(a,d))}))})),u.innerHTML=c+"{visibility:hidden}.hydrated{visibility:inherit}",u.setAttribute("data-styles",""),d.insertBefore(u,$?$.nextSibling:d.firstChild),b=!1,f.length?f.map((e=>e.connectedCallback())):s.jmp((()=>p=setTimeout(m,30)))},p=new WeakMap,y=e=>p.get(e),h=(e,t)=>{const n={t:0,$:e,g:t,j:new Map};return n.k=new Promise((e=>n.u=e)),e["s-p"]=[],e["s-rc"]=[],p.set(e,n)},w=(e,t)=>(0,console.error)(e,t),b=new Map,v=e=>{const t=e.p.replace(/-/g,"_"),n=e.M,s=b.get(n);return s?s[t]:import(`./${n}.entry.js`).then((e=>(b.set(n,e),e[t])),w)},g=[],k=[],M=(t,n)=>a=>{t.push(a),e||(e=!0,n&&4&s.t?C(P):s.raf(P))},j=e=>{for(let t=0;t<e.length;t++)try{e[t](performance.now())}catch(e){w(e)}e.length=0},P=()=>{j(g),j(k),(e=g.length>0)&&s.raf(P)},C=e=>a().then(e),E=M(k,!0);export{f as b,a as p}