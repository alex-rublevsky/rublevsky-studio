(()=>{var e={};e.id=492,e.ids=[492],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},8923:(e,r,t)=>{"use strict";t.r(r),t.d(r,{GlobalError:()=>i.a,__next_app__:()=>c,pages:()=>u,routeModule:()=>m,tree:()=>d});var n=t(6186),o=t(6557),s=t(6437),i=t.n(s),a=t(4842),l={};for(let e in a)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>a[e]);t.d(r,l);let d=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.t.bind(t,571,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,483)),"/Users/rublevskii/Desktop/rublevsky-studio/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,571,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(t.t.bind(t,1430,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(t.t.bind(t,5055,23)),"next/dist/client/components/unauthorized-error"]}],u=[],c={require:t,loadChunk:()=>Promise.resolve()},m=new n.AppPageRouteModule({definition:{kind:o.RouteKind.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},8892:(e,r,t)=>{Promise.resolve().then(t.bind(t,7659)),Promise.resolve().then(t.bind(t,6947))},7036:(e,r,t)=>{Promise.resolve().then(t.bind(t,7866)),Promise.resolve().then(t.bind(t,5775))},4539:(e,r,t)=>{Promise.resolve().then(t.t.bind(t,6093,23)),Promise.resolve().then(t.t.bind(t,1101,23)),Promise.resolve().then(t.t.bind(t,6437,23)),Promise.resolve().then(t.t.bind(t,5364,23)),Promise.resolve().then(t.t.bind(t,956,23)),Promise.resolve().then(t.t.bind(t,3896,23)),Promise.resolve().then(t.t.bind(t,5567,23))},3859:(e,r,t)=>{Promise.resolve().then(t.t.bind(t,6417,23)),Promise.resolve().then(t.t.bind(t,3609,23)),Promise.resolve().then(t.t.bind(t,5678,23)),Promise.resolve().then(t.t.bind(t,7312,23)),Promise.resolve().then(t.t.bind(t,2608,23)),Promise.resolve().then(t.t.bind(t,7204,23)),Promise.resolve().then(t.t.bind(t,2019,23))},7866:(e,r,t)=>{"use strict";t.d(r,{AnimationProvider:()=>s});var n=t(5422);t(719);var o=t(8312);function s({children:e}){return(0,o.usePathname)(),(0,n.jsx)(n.Fragment,{children:e})}t(1689),t(7257),t(878)},5775:(e,r,t)=>{"use strict";t.d(r,{NavBar:()=>p});var n=t(5422),o=t(719),s=t(7999),i=t(629),a=t.n(i),l=t(8312),d=t(838);let u=[{name:"Work",url:"/"},{name:"Contact",url:"/contact"},{name:"Blog",url:"/blog"},{name:"Store",url:"/store"}],c=({children:e,setPosition:r,href:t,isActive:i})=>{let l=(0,o.useRef)(null);return(0,n.jsx)(a(),{href:t,children:(0,n.jsxs)("li",{ref:l,onMouseEnter:()=>{if(!l.current)return;let{width:e}=l.current.getBoundingClientRect();r({width:e,opacity:1,left:l.current.offsetLeft})},className:(0,d.cn)("relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-4 md:py-2 md:text-base",i&&"underline underline-offset-4"),children:[e,i&&(0,n.jsx)(s.P.div,{layoutId:"active-pill",className:"absolute inset-0 z-0 rounded-full bg-black/10"})]})})},m=({position:e})=>(0,n.jsx)(s.P.li,{animate:e,className:"absolute z-0 h-7 rounded-full bg-black md:h-10"});function p({items:e=u,className:r}){let t=(0,l.usePathname)(),[s,i]=(0,o.useState)({left:0,width:0,opacity:0});return(0,n.jsx)("nav",{className:(0,d.cn)("fixed bottom-0 left-0 right-0 z-50 mb-6 flex justify-center",r),children:(0,n.jsxs)("ul",{className:"relative mx-auto flex w-fit rounded-full border border-black bg-white p-1",onMouseLeave:()=>i(e=>({...e,opacity:0})),children:[e.map(e=>(0,n.jsx)(c,{setPosition:i,href:e.url,isActive:t===e.url,children:e.name},e.url)),(0,n.jsx)(m,{position:s})]})})}},838:(e,r,t)=>{"use strict";t.d(r,{cn:()=>s});var n=t(3595),o=t(7418);function s(...e){return(0,o.QP)((0,n.$)(e))}},483:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>d,metadata:()=>l});var n=t(3002);t(3505),t(2394);var o=t(6947),s=t(2122),i=t.n(s);t(9490);var a=t(7659);let l={title:"Rublevsky Studio",description:"Visual Web Developer"};function d({children:e}){return(0,n.jsx)("html",{lang:"en",children:(0,n.jsx)("body",{className:`${i().variable} antialiased`,children:(0,n.jsxs)(a.AnimationProvider,{children:[(0,n.jsx)(o.NavBar,{}),e]})})})}},7659:(e,r,t)=>{"use strict";t.d(r,{AnimationProvider:()=>n});let n=(0,t(5002).registerClientReference)(function(){throw Error("Attempted to call AnimationProvider() from the server but AnimationProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/rublevskii/Desktop/rublevsky-studio/components/providers/animation-provider.tsx","AnimationProvider")},6947:(e,r,t)=>{"use strict";t.d(r,{NavBar:()=>n});let n=(0,t(5002).registerClientReference)(function(){throw Error("Attempted to call NavBar() from the server but NavBar is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/rublevskii/Desktop/rublevsky-studio/components/ui/navbar.tsx","NavBar")},3505:()=>{},2394:()=>{},9490:()=>{}};var r=require("../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[934,871],()=>t(8923));module.exports=n})();