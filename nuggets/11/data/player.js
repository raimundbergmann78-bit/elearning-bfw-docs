let i=0;const e=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function zeige(){const f=FOLIEN[i],el=document.getElementById('f');
el.className='folie'+(i===0?' start':'');
el.innerHTML=i===0?'<h1>'+e(f[0])+'</h1><p>'+e(f[1]||'')+'</p>':'<div class="t">'+e(f[0])+'</div><ul>'+f.slice(1).map(z=>'<li>'+e(z)+'</li>').join('')+'</ul>';
document.getElementById('n').textContent=(i+1)+' / '+FOLIEN.length;
document.getElementById('b').style.width=((i+1)/FOLIEN.length*100)+'%';
document.getElementById('z').disabled=i===0;document.getElementById('w').disabled=i===FOLIEN.length-1;}
document.getElementById('z').onclick=()=>{i--;zeige()};document.getElementById('w').onclick=()=>{i++;zeige()};
document.onkeydown=ev=>{if(ev.key==='ArrowRight'&&i<FOLIEN.length-1){i++;zeige()}if(ev.key==='ArrowLeft'&&i>0){i--;zeige()}};
zeige();