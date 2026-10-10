var o=/^([A-Za-z])(\d+)([A-Za-z])$/;function p(s){return s.split(`
`).slice(1).map(n=>n.trim()).filter(n=>!!n).flatMap((n,a)=>{let[i="",t,r]=n.split(","),e=o.exec(i);return e&&t!==void 0&&r!==void 0?[{uniqueId:`feat-${a}`,ref:e[1],variant:e[3],start:+e[2]-1,end:+e[2],score:+t,am_class:r}]:[]})}export{p as a};
//# sourceMappingURL=chunk-INWFM3CY.js.map
