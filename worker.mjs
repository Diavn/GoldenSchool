// Public catalogue gateway. No access to Google or master data.
const MAX=65536, TTL=900;
const keys=(o,k)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===k;
export function validateSnapshot(s,now=Date.now()){
  if(!keys(s,'classes,generatedAt,version')||s.version!=='0.3.2'||typeof s.generatedAt!=='string'||!Array.isArray(s.classes)||s.classes.length>30)return false;
  const t=Date.parse(s.generatedAt);if(!Number.isFinite(t)||t>now+30000||t<now-TTL*1000)return false;
  const ids=new Set();for(const c of s.classes){
    if(!keys(c,'approved,course,expires,fee,id,mode,schedule,seats,title')||c.approved!==true||typeof c.id!=='string'||!/^CLS-[A-F0-9-]{36}$/.test(c.id)||ids.has(c.id)||typeof c.course!=='string'||!/^GA(?:0[1-9]|10)$/.test(c.course)||typeof c.title!=='string'||!c.title.trim()||c.title.length>120||/[\x00-\x1f<>@]/.test(c.title)||/\b(?:TEST|PILOT|DEMO)\b/i.test(c.title)||typeof c.schedule!=='string'||!/^Buổi dự kiến tiếp theo: \d{2}\/\d{2}\/\d{4} \d{2}:\d{2} – \d{2}\/\d{2}\/\d{4} \d{2}:\d{2} \(giờ Việt Nam\)$/.test(c.schedule)||!['ONLINE','OFFLINE','HYBRID'].includes(c.mode)||!Number.isSafeInteger(c.fee)||c.fee<0||c.fee>1000000000||!Number.isSafeInteger(c.seats)||c.seats<1||c.seats>100||typeof c.expires!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(c.expires)||Date.parse(c.expires)<=now||Date.parse(c.expires)>t+TTL*1000)return false;
    ids.add(c.id);
  }return true;
}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function authFailure(secret,header){
  if(typeof secret!=='string'||secret.length===0)return 'SECRET_MISSING';
  if(secret.length!==64||!/^[a-f0-9]{64}$/.test(secret))return 'SECRET_FORMAT';
  if(!header)return 'AUTH_HEADER_MISSING';
  if(!/^Bearer [a-f0-9]{64}$/.test(header)||header.length!==71)return 'AUTH_HEADER_FORMAT';
  if(!equal(header,'Bearer '+secret))return 'TOKEN_MISMATCH';
  return null;
}
function json(v,status=200){return new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function bounded(req){const reader=req.body?.getReader();if(!reader)throw Error();const pieces=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>MAX){await reader.cancel();throw Error();}pieces.push(value);}const bytes=new Uint8Array(length);let i=0;for(const p of pieces){bytes.set(p,i);i+=p.length;}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
export default {async fetch(req,env){
  const url=new URL(req.url);if(url.pathname!=='/api/catalogue')return env.ASSETS.fetch(req);
  if(!env.GS_CATALOGUE)return json({ok:false},503);
  try{
    if(req.method==='GET'){
      const s=await env.GS_CATALOGUE.get('public-v1',{type:'json'});
      return validateSnapshot(s)?json(s):json({version:'0.3.2',generatedAt:null,classes:[]});
    }
    if(req.method!=='POST')return json({ok:false},405);
    const reason=authFailure(env.GS32_TOKEN,req.headers.get('Authorization'));
    if(reason){console.warn('GS32_AUTH '+reason);return json({ok:false},403);}
    console.log('GS32_AUTH PASS');
    if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('Content-Type')||''))return json({ok:false},415);
    let s;try{s=await bounded(req);}catch{return json({ok:false},400);}
    const now=Date.now();if(!validateSnapshot(s,now)||Date.parse(s.generatedAt)<now-120000)return json({ok:false},400);
    const old=await env.GS_CATALOGUE.get('public-v1',{type:'json'});if(old&&Date.parse(old.generatedAt)>=Date.parse(s.generatedAt))return json({ok:false},409);
    await env.GS_CATALOGUE.put('public-v1',JSON.stringify(s),{expirationTtl:TTL});
    return json({ok:true,count:s.classes.length});
  }catch{return json({ok:false},503);}
}};
