(()=>{
const baseModal=modal;
const baseCloseModal=closeModal;
modal=function(html,large=false){document.body.classList.add('modal-open');baseModal(html,large)};
closeModal=function(){baseCloseModal();document.body.classList.remove('modal-open')};
window.modal=modal;
window.closeModal=closeModal;
const observer=new MutationObserver(()=>{const m=document.getElementById('modal');document.body.classList.toggle('modal-open',!!m&&!m.classList.contains('hidden'))});
const m=document.getElementById('modal');if(m)observer.observe(m,{attributes:true,attributeFilter:['class']});
})();