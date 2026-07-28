// ---------- scroll reveal ----------
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold:0.15 });
reveals.forEach(el=>io.observe(el));

// ---------- active nav link on scroll ----------
const navLinks = document.querySelectorAll('.primary-nav a');
const sections = [...navLinks].map(a=>document.querySelector(a.getAttribute('href')));
window.addEventListener('scroll', ()=>{
  let idx = 0;
  const y = window.scrollY + 140;
  sections.forEach((s,i)=>{ if(s && s.offsetTop <= y) idx = i; });
  navLinks.forEach(a=>a.classList.remove('active'));
  navLinks[idx].classList.add('active');
});

// ---------- mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
navToggle.addEventListener('click', ()=> primaryNav.classList.toggle('open'));
navLinks.forEach(a=>a.addEventListener('click', ()=> primaryNav.classList.remove('open')));

// ---------- CV download implementation ----------
function handleCvRequest(){
  // Programmatically open the linked PDF file in a new tab
  window.open('Koyel_Kar_Resume_Improved.pdf', '_blank');
}

// ---------- contact form ----------
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('cName').value;
  const email = document.getElementById('cEmail').value;
  const msg = document.getElementById('cMsg').value;
  const subject = encodeURIComponent('Portfolio contact from ' + name);
  const body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
  window.location.href = `mailto:kar351191@gmail.com?subject=${subject}\&body=${body}`;
});

// ---------- AI Cyber Assistant (Sentinel) ----------
const aiToggle = document.getElementById('aiToggle');
const aiPanel = document.getElementById('aiPanel');
const aiClose = document.getElementById('aiClose');
const aiBody = document.getElementById('aiBody');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');

aiToggle.addEventListener('click', ()=> aiPanel.classList.toggle('open'));
aiClose.addEventListener('click', ()=> aiPanel.classList.remove('open'));

function addMsg(text, who){
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.textContent = text;
  aiBody.appendChild(d);
  aiBody.scrollTop = aiBody.scrollHeight;
}

function botReply(raw){
  const q = raw.toLowerCase();
  let res;
  if(/who|about|koyel/.test(q)){
    res = "Koyel Kar is a Cyber Security student at GNIT, specializing in responsive web development, cryptography, and password security.";
  } else if(/skill/.test(q)){
    res = "Skills: Python, C, C++, JS · HTML5/CSS3 · Cryptography, Ethical Hacking, Network Security, Password Analysis · MySQL, Git, VS Code.";
  } else if(/project/.test(q)){
    res = "Projects: Password Analyzer (Python, CustomTkinter) and Text Encryption Tool (Python, Tkinter).";
    document.getElementById('projects').scrollIntoView({behavior:'smooth'});
  } else if(/educat|study|college|school|degree/.test(q)){
    res = "B.Sc in Cyber Security @ Guru Nanak Institute of Technology (2024–Present). Higher Secondary & Secondary from Uttarpara Girls' High School.";
    document.getElementById('education').scrollIntoView({behavior:'smooth'});
  } else if(/cv|resume|download/.test(q)){
    res = "Opening Koyel's CV now...";
    handleCvRequest(); // Automatically trigger the download/open file command
  } else if(/contact|email|reach|hire/.test(q)){
    res = "Reach Koyel at kar351191@gmail.com, or use the contact links below.";
    document.getElementById('contact').scrollIntoView({behavior:'smooth'});
  } else if(/research/.test(q)){
    res = "Currently exploring: classical & modern cryptography, password entropy, and frontend frameworks.";
    document.getElementById('research').scrollIntoView({behavior:'smooth'});
  } else if(/^(hi|hello|hey)\b/.test(q)){
    res = "Hey there! How can I help you learn more about Koyel?";
  } else {
    res = "Feel free to ask about Koyel's skills, projects, education, research, or contact info!";
  }
  setTimeout(()=> addMsg(res, 'bot'), 400);
}

function sendQuery(text){
  if(!text.trim()) return;
  addMsg(text, 'user');
  botReply(text);
}

aiSend.addEventListener('click', ()=>{ sendQuery(aiInput.value); aiInput.value=''; });
aiInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){ sendQuery(aiInput.value); aiInput.value=''; }
});
document.querySelectorAll('.ai-chips button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    aiPanel.classList.add('open');
    sendQuery(btn.dataset.q);
  });
});