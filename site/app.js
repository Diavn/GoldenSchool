'use strict';
const COURSES=[["GA01","Toán tiếng Anh – Tiểu học","Nền tảng",1,5,"thinking","Cảm nhận số, lập luận và giải toán có lời văn bằng tiếng Anh."],["GA02","Toán tiếng Anh – THCS","Nền tảng",6,9,"thinking","Đại số, hình học, lập luận và giải quyết vấn đề bằng tiếng Anh."],["GA03","Singapore Scholarship","Học bổng",6,10,"scholarship","Chuẩn bị năng lực Toán và tư duy cho lộ trình dự tuyển học bổng Singapore."],["GA04","Cambridge Mathematics","Quốc tế",9,12,"international","IGCSE hoặc A-Level Mathematics theo chương trình và mục tiêu thi."],["GA05","Further Mathematics","Quốc tế",11,12,"international","Toán chuyên sâu cho học sinh có nền tảng A-Level phù hợp."],["GA06","IB Mathematics","Quốc tế",11,12,"international","Mathematics AA hoặc AI, SL hoặc HL theo nhu cầu học tập."],["GA07","Digital SAT Mathematics","Luyện thi",9,12,"sat","Đại số, phân tích dữ liệu, tư duy và chiến lược làm bài Digital SAT."],["GA08","Olympiad Mathematics","Nâng cao",4,12,"thinking scholarship","Bài toán không quen thuộc, lập luận và tư duy toán học sáng tạo."],["GA09","International Physics","Vật lý",10,12,"physics","Khái niệm, mô hình, xử lý dữ liệu và giải bài A-Level hoặc IB Physics."],["GA10","Advanced Physics","Vật lý",9,12,"physics","Mô hình hóa và giải quyết vấn đề Vật lý chuyên sâu."]];
function validResponder(v){return typeof v==="string"&&/^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform$/.test(v)&&!/\s/.test(v);}
function normalize(v){return String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/đ/g,"d").trim();}
function matching(c,g,t,q){return (!g||+g>=c[3]&&+g<=c[4])&&(!t||c[5].split(" ").includes(t))&&(!q||normalize([c[0],c[1],c[2],c[6]].join(" ")).includes(normalize(q)));}
function usableForm(cfg,key){const f=cfg.forms?.[key];return cfg.admissionsOpen===true&&f?.enabled===true&&validResponder(f.url)?f.url:null;}
function publicClass(c,ids){return !!c&&Object.keys(c).every(k=>["id","course","title","schedule","mode","fee","seats","approved","expires"].includes(k))&&c.approved===true&&typeof c.id==="string"&&/^[A-Z0-9-]{1,40}$/.test(c.id)&&ids.includes(c.course)&&typeof c.title==="string"&&c.title.length>0&&c.title.length<=120&&typeof c.schedule==="string"&&c.schedule.length>0&&c.schedule.length<=160&&["ONLINE","OFFLINE","HYBRID"].includes(c.mode)&&Number.isSafeInteger(c.fee)&&c.fee>=0&&Number.isSafeInteger(c.seats)&&c.seats>0&&typeof c.expires==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(c.expires)&&Date.parse(c.expires)>Date.now();}
function selectedForm(cfg,key,code){const base=usableForm(cfg,key);if(!base)return null;if(key!=="enrollment"||!/^GA(?:0[1-9]|10)$/.test(code||""))return base;const url=cfg.forms[key].prefill?.[code];if(typeof url!=="string"||!url.startsWith(base+"?")||/[\s#]/.test(url))return base;let entry=0,usp=0;for(const part of url.slice(base.length+1).split("&")){const m=/^entry\.\d+=(.*)$/.exec(part);if(m){entry++;try{const v=decodeURIComponent(m[1].replace(/\+/g," "));if(!v.startsWith(code+" | ")||v.length>180||/[\r\n]/.test(v))return base;}catch{return base;}}else if(part==="usp=pp_url"){usp++;}else return base;}return entry===1&&usp<=1?url:base;}
const $=id=>document.getElementById(id);
const cfg=window.GS_CONFIG||{};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function filter(){const ids=new Set(COURSES.filter(c=>matching(c,$('grade').value,$('goal').value,$('query').value)).map(c=>c[0]));for(const n of document.querySelectorAll('.course'))n.hidden=!ids.has(n.dataset.id);$('count').textContent=ids.size+' chương trình phù hợp';$('no-results').hidden=ids.size>0;}
for(const id of ['grade','goal','query'])$(id).addEventListener('input',filter);
$('reset').addEventListener('click',()=>{for(const id of ['grade','goal','query'])$(id).value='';filter();});
filter();
let chosenCode='';
const labels={enrollment:'Mở Form đăng ký học',returning:'Mở Form gia đình hiện tại',consultation:'Mở Form tư vấn',staff:'Mở Form hợp tác'};
function updateLinks(){let open=0;for(const a of document.querySelectorAll('.form-link')){const url=selectedForm(cfg,a.dataset.key,chosenCode);if(url){a.href=url;a.rel='noreferrer';a.removeAttribute('aria-disabled');a.textContent=labels[a.dataset.key];open++;}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');}}$('status').textContent=open?'Chỉ các dịch vụ có nút mở biểu mẫu mới nhận đăng ký. Không thanh toán trên website; đọc thông báo quyền riêng tư trước khi gửi.':'Các biểu mẫu đang đóng trong giai đoạn chuẩn bị. Website không nhận thông tin cá nhân hoặc thanh toán.';}
function choose(code,className){const c=COURSES.find(x=>x[0]===code);if(!c)return;chosenCode=code;updateLinks();const link=selectedForm(cfg,'enrollment',code),base=usableForm(cfg,'enrollment');const hint=!link?' Biểu mẫu chưa mở.':link!==base?' Chương trình được điền sẵn trong Form đăng ký lần đầu; vui lòng kiểm tra trước khi gửi.':' Hãy chọn chương trình tương ứng trong Form.';$('selection').hidden=false;$('selection').textContent='Quan tâm: '+c[1]+(className?' · '+className+' (mã lớp chưa được chuyển vào Form)':'')+'.'+hint+' Lựa chọn này chưa được gửi.';location.hash='apply';$('selection').setAttribute('tabindex','-1');$('selection').focus();}
for(const b of document.querySelectorAll('.choose'))b.addEventListener('click',()=>choose(b.dataset.course));
updateLinks();
async function loadCatalogue(){
  const root=$('class-list'),empty=$('class-empty');
  root.replaceChildren();empty.hidden=false;
  if(cfg.catalogueEnabled!==true){empty.textContent='Hiện chưa có thông tin lớp được công bố.';return;}
  try{
    const res=await fetch('/api/catalogue',{cache:'no-store',credentials:'omit',redirect:'error'});
    if(!res.ok)throw Error();const data=await res.json();
    if(data.version!=='0.3.2'||!Array.isArray(data.classes)||data.classes.length>30)throw Error();
    const ids=COURSES.map(c=>c[0]),seen=new Set();
    for(const c of data.classes){if(!publicClass(c,ids)||seen.has(c.id))continue;seen.add(c.id);
      const a=el('article');a.append(el('span',c.course+' · '+c.id,'tag'),el('h3',c.title),el('p',c.schedule+' · '+({ONLINE:'Trực tuyến',OFFLINE:'Trực tiếp',HYBRID:'Kết hợp'}[c.mode])),el('p','Học phí công bố: '+c.fee.toLocaleString('vi-VN')+' đ'),el('p','Chỗ tham khảo: '+c.seats,'muted'));
      const b=el('button','Quan tâm lớp này','button secondary');b.type='button';b.addEventListener('click',()=>choose(c.course,c.title));a.append(b);root.append(a);
      const ms=Math.max(0,Date.parse(c.expires)-Date.now());setTimeout(()=>{a.remove();if(!root.children.length){empty.hidden=false;empty.textContent='Thông tin lớp đã hết hạn. Vui lòng tải lại trang.';}},ms);
    }empty.hidden=seen.size>0;empty.textContent='Hiện chưa có thông tin lớp được công bố.';
  }catch{root.replaceChildren();empty.hidden=false;empty.textContent='Chưa tải được thông tin lớp. Vui lòng thử lại sau.';}
}
loadCatalogue();
