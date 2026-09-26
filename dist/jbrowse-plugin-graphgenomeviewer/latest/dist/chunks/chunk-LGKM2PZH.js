function o(n,{refRefNameMap:f={},queryRefNameMap:m={}}={}){let r=[];for(let e of n){let t=e.get("mate");if(t){let a=e.get("refName");r.push({refRefName:f[a]??a,queryRefName:m[t.refName]??t.refName,refStart:e.get("start"),refEnd:e.get("end"),queryStart:t.start,queryEnd:t.end,strand:e.get("strand")??1})}}return r}export{o as a};
//# sourceMappingURL=chunk-LGKM2PZH.js.map
