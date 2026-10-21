import{Q as n}from"./chunk-2MXFJYQ7.js";var c="protein3d-alignment";async function l({rpcManager:e,name:r,args:t,inPlace:a,current:i=()=>!0}){try{return await e.call(c,r,t)}catch(o){if(!i())throw o;return console.warn(`${r} failed in the RPC worker, aligning in place`,o),a()}}function s(e,r){let t=n(e);return t.length>0&&t===n(r)}export{l as a,s as b};
//# sourceMappingURL=chunk-RA7XMMBU.js.map
