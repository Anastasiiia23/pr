const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function scene(kind,format=''){const shapes={cafe:'<ellipse cx="160" cy="165" rx="100" ry="15" fill="#bb8068"/><path d="M75 70h120v55q0 38-60 38t-60-38Z" fill="#fff6e7"/><path d="M196 82h15q37 0 25 35t-40 18" fill="none" stroke="#fff6e7" stroke-width="14"/><ellipse cx="135" cy="70" rx="60" ry="17" fill="#674333"/><path d="M115 49q-15-16 1-29m31 29q-15-16 1-29" fill="none" stroke="#fff6e7" stroke-width="5" stroke-linecap="round"/>',city:'<circle cx="238" cy="47" r="23" fill="#f6f4c7"/><path d="M38 171V78l37-22 37 22v93m9 0V47h63v124m10 0V91l49-29 39 29v80" fill="#69578b"/><path d="M56 92h17v22H56zm0 39h17v22H56zm86-63h20v24h-20zm0 41h20v24h-20zm76-9h19v23h-19zm0 35h19v23h-19z" fill="#dcd4f1"/><path d="M25 174h270" stroke="#183d32" stroke-width="7"/>',pottery:'<ellipse cx="159" cy="171" rx="101" ry="14" fill="#91ac98"/><path d="M115 53q-16 45-30 68-9 44 72 44t72-44q-17-27-30-68Z" fill="#b66b49"/><ellipse cx="157" cy="52" rx="43" ry="12" fill="#79452e"/><path d="M99 115q55 19 118 0m-123 23q64 16 126 0" fill="none" stroke="#d69a79" stroke-width="4"/>',book:'<path d="m55 63 106-19 104 19v105l-104-19-106 19Z" fill="#faf7e6"/><path d="M161 44v105" stroke="#aeb777" stroke-width="3"/><path d="m75 84 66-12m-66 33 66-12m-66 33 66-12m40-41 65 13m-65 8 65 13m-65 8 65 13" stroke="#7b8753" stroke-width="4"/><path d="M55 63v105l106-19 104 19V63" fill="none" stroke="#183d32" stroke-width="5"/>'};return `<div class="scene ${['cafe','city','pottery','book'].includes(kind)?kind:'cafe'}">${format?`<span class="format">${format}</span>`:''}<svg viewBox="0 0 320 200" aria-hidden="true">${shapes[kind]||shapes.cafe}</svg></div>`}
function card(raw){const a={...raw};for(const k in a)if(typeof a[k]==='string')a[k]=esc(a[k]);a.id=encodeURIComponent(raw.id);return `<article class="card">${scene(a.scene,a.platform+' · '+a.format)}<div class="card-body"><div class="chips"><span class="chip">Москва</span><span class="chip">${a.topic}</span></div><h3><a href="#author/${a.id}">${a.name}</a></h3><p>${a.service}</p><div class="price">от ${money(a.price)}</div><p>${a.availability}</p><p class="meta metric"><strong>${a.followers}</strong> подписчиков · <strong>${a.views}</strong> просмотров<br>Медиана 10 публикаций за 48 ч.<br>20.11.2026 · учебная выборка</p>${UI.button({label:"Посмотреть профиль",href:"#author/"+a.id,variant:"secondary"})}</div></article>`}
function jobCard(raw){const j={...raw};for(const k in j)if(typeof j[k]==='string')j[k]=esc(j[k]);j.id=encodeURIComponent(raw.id);return `<article class="card"><div class="jobtop"><span class="monogram">${j.letter}</span><span class="chip">${j.availability}</span></div><div class="card-body"><p>${j.company} · Москва</p><h3>${j.title}</h3><div class="chips"><span class="chip">${j.platform}</span><span class="chip">${j.format}</span><span class="chip">${j.topic}</span></div><div class="price">Бюджет до ${money(j.budget)}</div><p>${j.timing} после согласования</p><p>${j.id==='zerna'?'Выезд и съёмка двух блюд. Один раунд фактических исправлений.':'500–800 знаков, афиша и ссылка. Доступность поста минимум 48 часов.'}</p>${UI.button({label:"Открыть задание",href:"#job/"+j.id,variant:"secondary"})}</div></article>`}

// Shared, dependency-free presentation components. Text props are escaped.
// This is a proposal for Frontend A + B, not an approved framework choice.
let activeConfirmation = null;
const UI = {
  button({label, href, variant='primary', type='button', disabled=false, loading=false, id='', autofocus=false}) {
    const cls='btn '+(variant==='secondary'?'secondary':variant==='danger'?'danger':'');
    const text=(loading?'<span class="spinner" aria-hidden="true"></span>':'')+esc(label);
    const identity=id?` id="${esc(id)}"`:'';
    if(href && !disabled && !loading){
      const safe=href.startsWith('#')||/^(\.\/)?[\w/-]+\.(json|txt)$/.test(href);
      if(!safe)throw new Error('Use a route or local document for UI.button href');
      return `<a class="${cls}" href="${esc(href)}"${identity}>${text}</a>`;
    }
    return `<button class="${cls}" type="${type==='submit'?'submit':'button'}"${identity}${disabled||loading?' disabled':''}${loading?' aria-busy="true"':''}${autofocus?' autofocus':''}>${text}</button>`;
  },
  field({id,name=id,label,value='',kind='text',hint='',error='',placeholder='',required=false,disabled=false,min,max,options=[]}) {
    const common=`id="${esc(id)}" name="${esc(name)}"${required?' required':''}${disabled?' disabled':''} aria-describedby="${esc(id)}-hint ${esc(id)}-error" aria-invalid="${error?'true':'false'}"`;
    let control;
    if(kind==='select')control=`<select ${common}>${options.map(o=>`<option value="${esc(o.value)}"${String(value)===String(o.value)?' selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
    else if(kind==='textarea')control=`<textarea ${common} maxlength="1200" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
    else control=`<input ${common} type="${['text','number','email'].includes(kind)?kind:'text'}" value="${esc(value)}" placeholder="${esc(placeholder)}"${min!==undefined?` min="${esc(min)}"`:''}${max!==undefined?` max="${esc(max)}"`:''}${kind==='number'?' step="1"':''}>`;
    return `<div class="field"><label for="${esc(id)}">${esc(label)}${required?' <span aria-hidden="true">*</span>':''}</label>${control}<small class="field-hint" id="${esc(id)}-hint">${esc(hint)}</small><small class="field-error" id="${esc(id)}-error" aria-live="polite">${esc(error)}</small></div>`;
  },
  fieldError(input,message) {
    input.setAttribute('aria-invalid',message?'true':'false');
    document.getElementById(input.id+'-error').textContent=message;
  },
  alert({title,message,tone='error',action}) {
    return `<div class="notice ${tone==='success'?'notice-success':tone==='info'?'notice-info':'notice-error'}" role="${tone==='error'?'alert':'status'}"><strong>${esc(title)}</strong><p>${esc(message)}</p>${action?UI.button(action):''}</div>`;
  },
  skeleton(){return `<div class="loading-state" aria-busy="true"><p role="status">Загружаем подборку…</p><div class="grid" aria-hidden="true">${[1,2,3].map(()=>'<div class="skeleton-card"><div class="skeleton picture"></div><div class="skeleton line"></div><div class="skeleton line short"></div><div class="skeleton line"></div></div>').join('')}</div></div>`},
  catalogState(type,params) {
    const state=params.get('demo');const clean=new URLSearchParams(params);clean.delete('demo');const retry='#'+type+(clean.size?'?'+clean:'');
    if(state==='loading')return UI.skeleton();
    if(state==='error')return UI.alert({title:'Не удалось загрузить подборку',message:'Выбранные фильтры сохранены. Попробуйте ещё раз.',action:{label:'Повторить загрузку',href:retry}});
    if(state==='empty')return `<div class="empty"><h2>Пока нет совпадений</h2><p>Измените площадку или бюджет, чтобы расширить поиск.</p>${UI.button({label:'Сбросить фильтры',href:'#'+type,variant:'secondary'})}</div>`;
    return '';
  },
  demoBar(type,params) {
    const clean=new URLSearchParams(params);clean.delete('demo');const done='#'+type+(clean.size?'?'+clean:'');
    return `<aside class="demo-state-bar"><div><strong>Макет состояния · неделя 2</strong><p>Данные учебные. Загрузка и ошибка показаны специально для проверки интерфейса.</p></div><div class="actions">${UI.button({label:'Показать данные',href:done,variant:'secondary'})}${UI.button({label:'Все состояния',href:'#components?view=states',variant:'secondary'})}</div></aside>`;
  },
  confirm({title,message,confirmLabel='Подтвердить',danger=false}) {
    if(activeConfirmation)return Promise.resolve(false);
    const previous=document.activeElement;
    return new Promise(resolve=>{
      const dialog=document.createElement('dialog');activeConfirmation=dialog;
      dialog.className='confirmation';dialog.setAttribute('aria-labelledby','confirmation-title');dialog.setAttribute('aria-describedby','confirmation-message');
      dialog.innerHTML=`<p class="eyebrow">Подтверждение действия</p><h2 id="confirmation-title">${esc(title)}</h2><p id="confirmation-message">${esc(message)}</p><div class="actions">${UI.button({label:'Отмена',id:'confirmation-cancel',variant:'secondary',autofocus:true})}${UI.button({label:confirmLabel,id:'confirmation-accept',variant:danger?'danger':'primary'})}</div>`;
      document.body.append(dialog);
      dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const first=dialog.querySelector('#confirmation-cancel'),last=dialog.querySelector('#confirmation-accept');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
      dialog.querySelector('#confirmation-cancel').onclick=()=>dialog.close('cancel');
      dialog.querySelector('#confirmation-accept').onclick=()=>dialog.close('confirm');
      dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='confirm';dialog.remove();activeConfirmation=null;if(previous?.isConnected)previous.focus();resolve(accepted)},{once:true});
      dialog.showModal();
    });
  },
  authorCard:card,
  jobCard,
};
