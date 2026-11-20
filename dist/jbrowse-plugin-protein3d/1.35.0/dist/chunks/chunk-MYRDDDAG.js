var c="protein3d-alignment";async function i({rpcManager:n,name:r,args:t,inPlace:a,current:o=()=>!0}){try{return await n.call(c,r,t)}catch(e){if(!o())throw e;return console.warn(`${r} failed in the RPC worker, aligning in place`,e),a()}}export{i as a};
//# sourceMappingURL=chunk-MYRDDDAG.js.map
