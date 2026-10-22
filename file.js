/* 참가자 파일 렌더러 — 인물 파일 아티팩트의 render()를 옮겨 옴. secret-src/port.mjs 로 생성. 데이터는 secrets.js에서 암호로 풀어 넘겨받음 */
(function(){
var AX=[{R:"전통",P:"변화"},{E:"경쟁",W:"분배"},{U:"집단",I:"개인"},{O:"인정",C:"배제"}];
var ALL=["제우스","머니","히어로","백지","카니","새벽"];
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function md(s){s=esc(s);
  s=s.replace(/~~([\s\S]+?)~~/g,"<s>$1</s>");
  s=s.replace(/\*\*\*([\s\S]+?)\*\*\*/g,"<strong><em>$1</em></strong>");
  s=s.replace(/\*\*([\s\S]+?)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/\*([\s\S]+?)\*/g,"<em>$1</em>");
  return s}
function para(p){
  if(p==="---")return '<p class="break" aria-hidden="true">· · ·</p>';
  var t=p.trim(),cls=[];
  if(/^\*[^*][\s\S]*\*$/.test(t)&&t.indexOf("*",1)===t.length-1)cls.push("voice");
  else if(/^\*\*[\s\S]*\*\*$/.test(t)&&t.indexOf("**",2)===t.length-2)cls.push("loud");
  if(t.indexOf("\n")>-1)cls.push("ln");
  return '<p'+(cls.length?' class="'+cls.join(" ")+'"':'')+'>'+md(t)+'</p>'}
function pad(n){return String(n).padStart(2,"0")}
function render(f){
  var L=f.code[0].split(""),N=f.code[1].split("");
  var h='';
  h+='<section class="file-head"><div class="container fh-grid"><div>';
  h+='<div class="fh-no"><span class="label">참가자 파일 · Specimen '+pad(f.no)+'</span></div>';
  h+='<h1 class="big">'+f.nick+'</h1>';
  h+=f.culprit?'<p class="verdict guilty">당신은 범인입니다.</p><p class="order">범인은 거짓말이 가능하며, 다른 참여자를 이용하여 완전 범죄를 완성하세요.</p>'
              :'<p class="verdict">당신은 범인이 아닙니다.</p>';
  h+='<p class="access">열람 권한: '+f.nick+' 본인. <em>타인에게 유출 시, 즉시 퇴소 처리됩니다.</em></p>';
  h+='</div><div class="label-card" aria-label="신상 정보"><header><b>SPECIMEN '+pad(f.no)+'</b><span class="label">'+(f.culprit?'범인 전용':'개인 파일')+'</span></header><dl class="facts">';
  ["이름","나이","성별","직업"].forEach(function(k){h+='<div><dt>'+k+'</dt><dd>'+esc(f.info[k]||"")+'</dd></div>'});
  h+='</dl><div class="code-box"><span class="label">사상 코드</span><div class="code-rows"><span class="row-label">코드</span><div class="code-row">';
  L.forEach(function(c,k){h+='<span class="slot letter">'+c+'<small>'+(AX[k][c]||"")+'</small></span>'});
  h+='</div><span class="row-label num-row">강도</span><div class="code-row num-row">';
  N.forEach(function(c){h+='<span class="slot">'+c+'</span>'});
  h+='</div></div></div></div></div></section>';

  h+='<section class="sec" id="interview"><div class="container"><div class="sec-head"><span class="label">사전 인터뷰</span><h2>출연 전 제작진 녹화</h2></div><div class="qs">';
  f.qs.forEach(function(q,k){h+='<div class="qcard"><span class="label">Q'+(k+1)+'</span><p class="qq">'+md(q[0])+'</p><p class="qa">'+md(q[1])+'</p></div>'});
  h+='</div></div></section>';

  h+='<section class="sec" id="story"><div class="container"><div class="sec-head"><span class="label">인물 서사</span><h2>'+f.nick+'의 이야기</h2></div><div class="story"><nav class="toc" aria-label="서사 목차">';
  f.chapters.forEach(function(c,k){var t=c.t.replace(/^\d+\.\s*/,"");h+='<a href="#ch-'+f.id+'-'+(k+1)+'" data-k="'+k+'"><span>'+pad(k+1)+'</span>'+esc(t)+'</a>'});
  h+='</nav><div>';
  f.chapters.forEach(function(c,k){var t=c.t.replace(/^\d+\.\s*/,"");
    h+='<article class="chapter" id="ch-'+f.id+'-'+(k+1)+'"><h3><span>'+pad(k+1)+'</span>'+esc(t)+'</h3><div class="prose">'+c.p.map(para).join("")+'</div></article>'});
  h+='</div></div></div></section>';

  h+='<section class="sec" id="record"><div class="container"><div><div class="sec-head"><span class="label">기록</span><h2>표본사회 6일의 기록</h2><p>일차별로 있었던 일을 채워 넣는 칸입니다.</p></div><div class="tbl-wrap"><table><thead><tr><th>일차</th><th>있었던 일</th></tr></thead><tbody>';
  f.rec.forEach(function(d){h+='<tr><td class="day">'+esc(d)+'일차</td><td><span class="blank"></span></td></tr>'});
  h+='</tbody></table></div></div></div></section><section class="sec" id="night"><div class="container"><div><div class="sec-head"><span class="label">행적</span><h2>'+(f.culprit?'6일차 밤의 진짜 행적':'6일차 밤의 행적')+'</h2><p>'+(f.culprit?'당신만 알고 있는 진실입니다.':'시각별로 장소와 한 일을 적는 칸입니다.')+'</p></div><div class="tbl-wrap"><table><thead><tr><th>시각</th><th>장소</th><th>한 일</th>'+(f.culprit?'':'<th>보고 들은 것</th>')+'</tr></thead><tbody>';
  for(var r=0;r<4;r++){h+='<tr><td class="day"><span class="blank"></span></td><td><span class="blank"></span></td><td><span class="blank"></span></td>'+(f.culprit?'':'<td><span class="blank"></span></td>')+'</tr>'}
  h+='</tbody></table></div></div></div></section>';

  h+='<section class="sec" id="evidence"><div class="container"><div class="sec-head"><span class="label">증거</span><h2>증거 목록</h2><p>배정된 증거 카드가 이 자리에 들어갑니다.</p></div><div class="ev">';
  for(var e=1;e<=3;e++)h+='<div class="ev-slot"><b>EVIDENCE '+pad(e)+'</b><p>증거 카드 배정 전</p></div>';
  h+='</div></div></section>';

  h+='<section class="sec" id="relations"><div class="container"><div class="sec-head"><span class="label">인물 관계</span><h2>'+f.nick+(((f.nick.charCodeAt(f.nick.length-1)-0xAC00)%28)?'이':'가')+' 본 사람들</h2></div><div class="rels">';
  f.rels.forEach(function(r){var v=r[0]==="제우스",no=ALL.indexOf(r[0])+1;
    h+='<div class="rel'+(v?' victim':'')+'"><header><span class="nk">'+esc(r[0])+'</span><span class="tag">'+(v?'피해자':'표본 '+pad(no))+'</span></header><ul>'+r[1].map(function(x){return '<li>'+md(x)+'</li>'}).join("")+'</ul></div>'});
  h+='</div></div></section>';

  return h}

var obs=null;
function watchToc(root){
  var links=root.querySelectorAll(".toc a");
  links.forEach(function(a){a.addEventListener("click",function(e){var t=document.getElementById(a.getAttribute("href").slice(1));if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth"})}})});
  if(!("IntersectionObserver" in window))return;
  if(obs)obs.disconnect();
  obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var id=e.target.id;links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+id)})}})},{rootMargin:"-30% 0px -60% 0px"});
  root.querySelectorAll(".chapter").forEach(function(c){obs.observe(c)})}
window.renderFile=function(root,f){root.innerHTML=render(f);watchToc(root)};
})();
