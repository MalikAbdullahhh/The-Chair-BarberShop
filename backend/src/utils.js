export function asyncHandler(fn){return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)}
export function hmToMinutes(v){const [h,m]=String(v).split(":").map(Number);return h*60+m}
export function toLocalDateTime(date,time){return new Date(`${date}T${time}:00`)}
export function slotKeys(start,end,step=5){const out=[];for(let t=start.getTime();t<end.getTime();t+=step*60000)out.push(new Date(t).toISOString());return out}
export function dayKey(date){return ["sun","mon","tue","wed","thu","fri","sat"][date.getDay()]}
export function slugify(s=""){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
