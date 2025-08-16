
const starsContainer = document.getElementById('stars');
for(let i=0;i<100;i++){
  const star = document.createElement('div');
  const size = (Math.random()*2+1)+'px';
  star.classList.add('star');
  star.style.width=size;
  star.style.height=size;
  star.style.top=Math.random()*100+'%';
  star.style.left=Math.random()*100+'%';
  star.style.animationDelay=(Math.random()*3)+'s';
  starsContainer.appendChild(star);
}

const names = ["𝐀𝐈𝐆𝐑𝐀𝐌","ఎఐగ్రామ్","ＡＩグラム","एआईग्राम"];
const aigramEl=document.getElementById('aigramText');
const slotEl=aigramEl.parentElement;

function lockSlotSize(){
  const measure=document.createElement('span');
  measure.style.visibility='hidden';
  measure.style.position='absolute';
  measure.style.whiteSpace='nowrap';
  measure.style.fontWeight=getComputedStyle(aigramEl).fontWeight;
  measure.style.fontSize=getComputedStyle(aigramEl).fontSize;
  measure.style.fontFamily=getComputedStyle(aigramEl).fontFamily;
  measure.style.letterSpacing=getComputedStyle(aigramEl).letterSpacing;
  document.body.appendChild(measure);
  let maxWidth=0,maxHeight=0;
  for(const n of names){
    measure.textContent=n;
    const rect=measure.getBoundingClientRect();
    maxWidth=Math.max(maxWidth,rect.width);
    maxHeight=Math.max(maxHeight,rect.height);
  }
  document.body.removeChild(measure);
  slotEl.style.width=Math.ceil(maxWidth)+8+'px';
  slotEl.style.height=Math.ceil(maxHeight)+'px';
  document.querySelector('.welcome-container').style.minHeight=Math.ceil(maxHeight)+'px';
}
lockSlotSize();
window.addEventListener('resize',lockSlotSize);

aigramEl.style.opacity=1;
let idx=1;
setInterval(()=>{
  aigramEl.style.opacity=0;
  setTimeout(()=>{
    aigramEl.textContent=names[idx];
    aigramEl.style.opacity=1;
    idx=(idx+1)%names.length;
  },450);
},2000);

const message="We are in Stealth Mode ...";
const textElement=document.getElementById('text');
function typeMessage(){
  textElement.innerHTML="";
  textElement.classList.add('cursor');
  let index=0;
  (function typeStep(){
    if(index<message.length){
      const span=document.createElement('span');
      span.textContent=message[index];
      textElement.appendChild(span);
      index++;
      setTimeout(typeStep,100);
    }else{
      textElement.classList.remove('cursor');
      setTimeout(startDisappear,500);
    }
  })();
}
function startDisappear(){
  const spans=Array.from(textElement.querySelectorAll("span"));
  let visibleIndices=spans.map((_,i)=>i);
  (function fadeStep(){
    if(visibleIndices.length===0){ setTimeout(typeMessage,800); return; }
    const picks=[];
    for(let i=0;i<2&&visibleIndices.length>0;i++){
      const ri=Math.floor(Math.random()*visibleIndices.length);
      picks.push(visibleIndices[ri]);
      visibleIndices.splice(ri,1);
    }
    picks.forEach(i=>spans[i].classList.add("fade-out"));
    setTimeout(fadeStep,200);
  })();
}
setTimeout(typeMessage,500);

// Meeting form
const form=document.getElementById('meetForm');
const gcalLink=document.getElementById('gcalLink');
function toTwo(n){ return n.toString().padStart(2,'0'); }
function toICSDate(d){
  return d.getUTCFullYear()+toTwo(d.getUTCMonth()+1)+toTwo(d.getUTCDate())+'T'+toTwo(d.getUTCHours())+toTwo(d.getUTCMinutes())+toTwo(d.getUTCSeconds())+'Z';
}
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const emailsRaw=document.getElementById('emails').value.trim();
  const date=document.getElementById('date').value;
  const time=document.getElementById('time').value;
  const duration=parseInt(document.getElementById('duration').value,10)||60;
  const title=(document.getElementById('title').value||'Meeting with Aigram Founders').trim();
  if(!date||!time){ alert('Please pick date & time'); return; }
  const startLocal=new Date(`${date}T${time}`);
  const endLocal=new Date(startLocal.getTime()+duration*60000);
  const attendees=emailsRaw.split(',').map(s=>s.trim()).filter(Boolean);
  const icsLines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//aigram.in//Meeting//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${Date.now()}@aigram.in`,`DTSTAMP:${toICSDate(new Date())}`,`DTSTART:${toICSDate(startLocal)}`,`DTEND:${toICSDate(endLocal)}`,`SUMMARY:${title}`,'LOCATION:Bellevue, Washington','DESCRIPTION:Schedule via aigram.in — contact nathias@aigram.in'];
  attendees.forEach(a=>icsLines.push(`ATTENDEE;CN=${a};ROLE=REQ-PARTICIPANT:MAILTO:${a}`));
  icsLines.push('END:VEVENT','END:VCALENDAR');
  const icsBlob=new Blob([icsLines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(icsBlob);
  const a=document.createElement('a');
  a.href=url; a.download='Aigram-Meeting.ics'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  const dates=`${toICSDate(startLocal)}/${toICSDate(endLocal)}`;
  const details=encodeURIComponent('Scheduled via aigram.in — contact nathias@aigram.in');
  const addGuests=attendees.map(e=>`&add=${encodeURIComponent(e)}`).join('');
  const gcal=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${details}&location=${encodeURIComponent('Bellevue, Washington')}${addGuests}`;
  gcalLink.href=gcal; gcalLink.click();
});
