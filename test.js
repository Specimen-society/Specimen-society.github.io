/* 입소 전 검사 — 24문항으로 사상 코드를 내고, 남은 표본 중 가장 가까운 캐릭터에 선착순 배정(Supabase ss_submit) */
(function(){
var API="https://uqxsqolcidnypqnxmcwo.supabase.co/rest/v1/rpc/",KEY="sb_publishable_AxXOh5W_XIvEu6QjUbQyOQ_Ph4FLcse";
function rpc(fn,body){return fetch(API+fn,{method:"POST",headers:{"Content-Type":"application/json",apikey:KEY,Authorization:"Bearer "+KEY},body:JSON.stringify(body)})
  .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
/* 순서가 곧 문항 id: 4문항씩 1~4축, 홀수 묶음은 앞 글자(R/E/U/O) 쪽, 짝수 묶음은 뒤 글자(P/W/I/C) 쪽 명제 — 서버 채점과 같은 규칙 */
var Q=[
  "가정 안에서 남녀의 역할이 어느 정도 나뉘는 것은 자연스러운 일이다.",
  "더 많이 노력한 사람이 더 많이 가져가는 것이 공정하다.",
  "공동체가 정한 결정이라면 내 생각과 달라도 따라야 한다.",
  "나와 전혀 다른 종교나 신념도 존중받아야 한다.",
  "직장 내 성별 할당제는 지금 사회에 필요한 제도다.",
  "많이 버는 사람은 지금보다 더 많은 세금을 내야 한다.",
  "남에게 피해를 주지 않는다면 무엇을 하든 개인의 자유다.",
  "잘못된 믿음은 바로잡아 주는 것이 그 사람을 위한 일이다.",
  "결혼과 출산은 사회를 지탱하는 기본적인 책임이다.",
  "세금은 낮을수록 좋다.",
  "질서를 지키기 위해서라면 개인의 자유는 어느 정도 제한될 수 있다.",
  "이해할 수 없는 믿음이라도 그 사람에게는 충분한 의미가 있다.",
  "성 정체성은 본인이 스스로 정할 수 있어야 한다.",
  "모든 사람에게 최소한의 생활은 국가가 보장해야 한다.",
  "다수가 원하더라도 소수에게 같은 선택을 강요할 수는 없다.",
  "사회에 해로운 신념을 가진 집단은 공동체에서 배제해야 한다.",
  "성별의 차이를 인정하는 것은 차별이 아니다.",
  "기업에 대한 규제는 경제 성장을 가로막는다.",
  "튀는 행동은 집단의 분위기를 해친다.",
  "신념이 전혀 다른 사람과도 한 공간에서 함께 살아갈 수 있다.",
  "동성 커플도 법적으로 가족으로 인정받아야 한다.",
  "공공 서비스는 이윤보다 누구나 누릴 수 있는지가 먼저다.",
  "나는 정해진 규칙보다 내 판단을 더 믿는다.",
  "신념이 다른 사람과는 깊은 관계를 맺기 어렵다."
];
var OPT=["전혀 아니다","아니다","보통이다","그렇다","매우 그렇다"];
window.SS_Q=Q;window.SS_OPT=OPT;
var AX=[{R:"전통",P:"변화"},{E:"경쟁",W:"분배"},{U:"집단",I:"개인"},{O:"인정",C:"배제"}];
var MSG={unknown:"참가자 명단에 없는 이름입니다. 제작진에게 받은 이름을 그대로 입력하세요.",done:"이미 검사를 마친 이름입니다. 검사는 한 번만 받을 수 있습니다.",full:"모든 표본의 배정이 끝났습니다.",closed:"지금은 검사를 받을 수 없습니다.",bad:"답변을 다시 확인하세요.",net:"연결에 실패했습니다. 잠시 후 다시 시도하세요."};
var SAVE="ss_result";
var root=document.getElementById("exam"),name="",ans=[],at=0;
if(!root)return;
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function pad(n){return String(n).padStart(2,"0")}
function load(){try{return JSON.parse(localStorage.getItem(SAVE)||"null")}catch(e){return null}}
function keep(r){try{localStorage.setItem(SAVE,JSON.stringify(r))}catch(e){}}
function top(){var s=document.getElementById("test");if(s)window.scrollTo(0,Math.max(0,s.offsetTop-80))}

function intro(){
  var saved=load();
  root.innerHTML='<div class="exam-card"><header><b>SPECIMEN TEST</b><span class="label">입소 전 검사</span></header><div class="exam-body">'+
    '<ol class="exam-rules"><li><b>24</b><span>문항마다 생각과 가장 가까운 답을 고릅니다. 정답은 없습니다.</span></li>'+
    '<li><b>1회</b><span>검사는 이름당 한 번만 받을 수 있고, 제출한 답은 고칠 수 없습니다.</span></li>'+
    '<li><b>선착순</b><span>결과 코드와 가장 가까운 표본에 배정됩니다. 먼저 배정된 표본은 다음 사람에게 가지 않습니다.</span></li></ol>'+
    '<form class="exam-form" id="exam-form"><label class="label" for="exam-name">참가자 이름</label>'+
    '<div class="exam-row"><input id="exam-name" autocomplete="off" required maxlength="30" placeholder="제작진에게 받은 이름"><button type="submit" class="go" id="exam-go">검사 시작</button></div>'+
    '<span class="err" id="exam-err" aria-live="polite"></span></form>'+
    (saved?'<button type="button" class="exam-link" id="exam-saved">이 기기에서 받은 결과 다시 보기 · '+esc(saved.name)+'</button>':'')+
    '</div></div>';
  var f=document.getElementById("exam-form"),inp=document.getElementById("exam-name"),err=document.getElementById("exam-err"),go=document.getElementById("exam-go");
  f.addEventListener("submit",function(e){e.preventDefault();var n=inp.value.trim();if(!n)return;
    go.disabled=true;err.textContent="";
    rpc("ss_check",{p_name:n}).then(function(st){
      if(st!=="ok"){err.textContent=MSG[st]||MSG.net;return}
      name=n;ans=[];at=0;ask()},function(){err.textContent=MSG.net}).then(function(){go.disabled=false})});
  if(saved)document.getElementById("exam-saved").addEventListener("click",function(){result(saved,false)});
}

function ask(){
  var segs="";for(var i=0;i<Q.length;i++)segs+='<span class="'+(i<at?"done":i===at?"now":"")+'"></span>';
  root.innerHTML='<div class="exam-card"><header><b>Q '+pad(at+1)+' / '+Q.length+'</b><span class="label">'+esc(name)+'</span></header>'+
    '<div class="exam-bar" aria-hidden="true">'+segs+'</div><div class="exam-body">'+
    '<p class="exam-q" id="exam-q">'+esc(Q[at])+'</p>'+
    '<div class="scale" role="radiogroup" aria-labelledby="exam-q">'+OPT.map(function(o,k){
      return '<button type="button" role="radio" class="opt" data-v="'+(k+1)+'" aria-checked="'+(ans[at]===k+1)+'"><b>'+(k+1)+'</b><span>'+o+'</span></button>'}).join("")+'</div>'+
    '<div class="exam-nav"><button type="button" class="exam-link" id="exam-prev"'+(at?'':' disabled')+'>← 이전 문항</button><span class="label">숫자 키 1~5로도 고를 수 있습니다</span></div>'+
    '</div></div>';
  root.querySelectorAll(".opt").forEach(function(b){b.addEventListener("click",function(){choose(+b.dataset.v)})});
  document.getElementById("exam-prev").addEventListener("click",function(){if(at){at--;ask()}});
  var cur=root.querySelector('.opt[aria-checked="true"]')||root.querySelector(".opt");cur.focus({preventScroll:true});
}
var lock=false;
function choose(v){if(lock)return;ans[at]=v;
  root.querySelectorAll(".opt").forEach(function(b){b.setAttribute("aria-checked",String(+b.dataset.v===v))});
  lock=true;setTimeout(function(){lock=false;at++;if(at<Q.length)ask();else confirm()},220)}
document.addEventListener("keydown",function(e){
  if(!root.querySelector(".scale")||e.altKey||e.ctrlKey||e.metaKey)return;
  var k=+e.key;if(k>=1&&k<=5){e.preventDefault();choose(k)}});

function confirm(){
  root.innerHTML='<div class="exam-card"><header><b>Q '+Q.length+' / '+Q.length+'</b><span class="label">'+esc(name)+'</span></header>'+
    '<div class="exam-bar full" aria-hidden="true">'+Q.map(function(){return '<span class="done"></span>'}).join("")+'</div><div class="exam-body">'+
    '<p class="exam-q">모든 문항에 답했습니다.</p><p>제출하면 답을 고칠 수 없고, 결과에 따라 표본이 바로 배정됩니다.</p>'+
    '<div class="exam-row"><button type="button" class="go" id="exam-send">검사 제출</button><button type="button" class="exam-link" id="exam-back">← 마지막 문항으로</button></div>'+
    '<span class="err" id="exam-err" aria-live="polite"></span></div></div>';
  document.getElementById("exam-back").addEventListener("click",function(){at=Q.length-1;ask()});
  var send=document.getElementById("exam-send");
  send.addEventListener("click",function(){send.disabled=true;var t0=Date.now();scan();
    rpc("ss_submit",{p_name:name,p_answers:ans}).then(function(r){
      setTimeout(function(){
        if(r.error){stopScan();confirm();document.getElementById("exam-err").textContent=MSG[r.error]||MSG.net;return}
        r.name=name;keep(r);stopScan();result(r,true)},Math.max(0,2200-(Date.now()-t0)))
    },function(){stopScan();confirm();document.getElementById("exam-err").textContent=MSG.net})});
}

/* 산출 중 연출: 글자 칸이 무작위로 바뀜 */
var scanT=null;
function slots(){return '<div class="code-rows"><span class="row-label">코드</span><div class="code-row">'+[0,1,2,3].map(function(k){return '<span class="slot letter" data-k="'+k+'">·<small></small></span>'}).join("")+
  '</div><span class="row-label">강도</span><div class="code-row num-row">'+[0,1,2,3].map(function(k){return '<span class="slot" data-n="'+k+'">·</span>'}).join("")+'</div></div>'}
function scan(){
  root.innerHTML='<div class="exam-card"><header><b>ANALYZING</b><span class="label">'+esc(name)+'</span></header><div class="exam-body"><p class="exam-q">사상 코드를 산출하고 있습니다.</p><div class="code-box">'+slots()+'</div></div></div>';
  var L=["RP","EW","UI","OC"];
  scanT=setInterval(function(){
    root.querySelectorAll("[data-k]").forEach(function(s,k){s.firstChild.nodeValue=L[k][Math.random()*2|0]});
    root.querySelectorAll("[data-n]").forEach(function(s){s.textContent=1+(Math.random()*3|0)})},90)}
function stopScan(){clearInterval(scanT);scanT=null}

function result(r,fresh){
  var L=r.code.split(""),N=r.strength.split("");
  root.innerHTML='<div class="exam-card result"><header><b>SPECIMEN '+pad(r.no)+'</b><span class="label">검사 결과</span></header><div class="exam-body">'+
    '<div class="res-grid"><div><span class="label">'+esc(r.name)+'님의 사상 코드</span><div class="code-box">'+slots()+'</div></div>'+
    '<div class="res-assign"><span class="label">배정 표본</span><div class="res-nick">'+esc(r.nick)+'</div><p>검사 결과와 가장 가까운 표본 '+pad(r.no)+'번에 배정되었습니다.</p></div></div>'+
    '<div class="res-pw"><span class="label">참가자 파일 암호</span>'+(r.file_pw?'<div class="exam-row"><code id="res-pw">'+esc(r.file_pw)+'</code><button type="button" class="exam-link" id="res-copy">복사</button></div>':'<p>암호 준비 중입니다. 제작진에게 받으세요.</p>')+
    '<p class="access">열람 권한: '+esc(r.nick)+' 본인.<br><em>코드와 암호를 타인에게 유출 시, 즉시 퇴소 처리됩니다.</em></p></div>'+
    '<div class="exam-row"><button type="button" class="go" id="res-file"'+(r.file_pw?'':' disabled')+'>캐릭터 파일 확인하러 가기</button><span class="err" id="res-err" aria-live="polite"></span></div>'+
    '<button type="button" class="exam-link" id="res-home">← 처음 화면으로</button>'+
    '</div></div>';
  var ls=root.querySelectorAll("[data-k]"),ns=root.querySelectorAll("[data-n]");
  function put(k){ls[k].innerHTML=L[k]+'<small>'+(AX[k][L[k]]||"")+'</small>';ns[k].textContent=N[k];ls[k].classList.add("on");ns[k].classList.add("on")}
  var still=!fresh||window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  for(var k=0;k<4;k++){if(still)put(k);else setTimeout(put,250+k*380,k)}
  top();
  var c=document.getElementById("res-copy");
  if(c)c.addEventListener("click",function(){var t=r.file_pw;
    (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){c.textContent="복사됨"},function(){
      var s=getSelection(),rg=document.createRange();rg.selectNodeContents(document.getElementById("res-pw"));s.removeAllRanges();s.addRange(rg)})});
  document.getElementById("res-file").addEventListener("click",function(){
    var b=this,err=document.getElementById("res-err");b.disabled=true;err.textContent="";
    window.ssOpenFile(pad(r.no),r.file_pw).then(null,function(){err.textContent="파일을 열 수 없습니다. 제작진에게 문의하세요."}).then(function(){b.disabled=false})});
  document.getElementById("res-home").addEventListener("click",intro);
}
intro();
})();
