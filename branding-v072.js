(()=>{
const BUILD='v0.7.2 · Build 20260813-17';
const version=document.querySelector('.version');if(version)version.textContent=BUILD;
const style=document.createElement('style');style.textContent=`
.brand-logo{width:188px!important;max-width:52vw!important}.prehip-sport-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-4px 0 14px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.06)}.prehip-sport-left{display:flex;align-items:center;gap:9px}.prehip-speed{display:flex;flex-direction:column;gap:3px}.prehip-speed i{display:block;height:3px;background:#F17C20;border-radius:9px}.prehip-speed i:nth-child(1){width:26px}.prehip-speed i:nth-child(2){width:20px;margin-left:6px}.prehip-speed i:nth-child(3){width:14px;margin-left:12px}.prehip-sport-icon{width:34px;height:34px}.prehip-sport-word{font-size:25px;font-weight:650;font-style:italic;letter-spacing:-1.2px}.prehip-sport-word .pre{color:#fff}.prehip-sport-word .hip{color:#F17C20}.prehip-sport-tag{font-size:9px;letter-spacing:.13em;color:#aaa;text-transform:uppercase}.prehip-mini-heading{display:flex;align-items:center;gap:8px}.prehip-mini-heading img{width:24px;height:24px;object-fit:contain}.prehip-mono{margin:22px auto 4px;display:flex;align-items:center;justify-content:center;gap:8px;opacity:.5}.prehip-mono img{width:28px;height:28px;filter:grayscale(1)}.prehip-mono span{font-size:20px;font-weight:650;letter-spacing:-1px;color:#222}.prehip-brand-caption{text-align:center;font-size:9px;letter-spacing:.12em;color:#aaa;text-transform:uppercase;margin-bottom:12px}@media(max-width:390px){.brand-logo{width:166px!important}.prehip-sport-word{font-size:22px}.prehip-sport-tag{display:none}}
`;document.head.appendChild(style);
function sportStrip(){return `<div class="prehip-sport-strip" data-prehip-brand="sport"><div class="prehip-sport-left"><span class="prehip-speed"><i></i><i></i><i></i></span><img class="prehip-sport-icon" src="assets/prehip-icon.svg" alt=""><div><div class="prehip-sport-word"><span class="pre">pre</span><span class="hip">HIP</span></div><div class="prehip-sport-tag">move · strengthen · prepare</div></div></div></div>`}
function decorate(){
 const content=document.getElementById('content');if(!content)return;
 const active=document.querySelector('.tabbar button.active')?.dataset.page;
 if(active==='home'){
   const hero=content.querySelector('.hero');if(hero&&!hero.querySelector('[data-prehip-brand="sport"]'))hero.insertAdjacentHTML('afterbegin',sportStrip());
 }
 if(active==='plan'){
   const title=content.querySelector('.section-title');if(title&&!title.classList.contains('prehip-mini-heading')){title.classList.add('prehip-mini-heading');title.insertAdjacentHTML('afterbegin','<img src="assets/prehip-icon.svg" alt="">');}
 }
 if(active==='stats'&&!content.querySelector('.prehip-mono')){
   const page=content.querySelector('.page');if(page)page.insertAdjacentHTML('beforeend','<div class="prehip-mono"><img src="assets/prehip-icon.svg" alt=""><span>preHIP</span></div><div class="prehip-brand-caption">Dein starker Start für deine Hüfte</div>');
 }
}
const content=document.getElementById('content');if(content)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(content,{childList:true,subtree:true});
setTimeout(decorate,250);setTimeout(decorate,900);
})();