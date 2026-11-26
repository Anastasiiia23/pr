const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();let scrolled=false;
function node(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',focus(){},scrollIntoView(){scrolled=true},querySelector(){return{textContent:'Prototype'}}});return nodes.get(k)}
const context={document:{querySelector:node,querySelectorAll:()=>[],title:''},window:{addEventListener(){},scrollTo(){}},location:{hash:''},URLSearchParams,Intl,FormData:class{constructor(f){this.f=f}get(k){return this.f.values[k]}}};
vm.createContext(context);for(const file of ['ui.js','components.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const outputs=[];function test(name,fn){fn();outputs.push('PASS '+name)}
function route(hash){context.location.hash=hash;vm.runInContext('route()',context);return node('main').innerHTML}
test('Все основные маршруты и демонстрационные формы формируются без ошибок',()=>{for(const h of ['home','authors','jobs','author/sasha','author/gorod','author/nastya','job/zerna','job/stranicy','invite/sasha','respond/stranicy','guide']){assert(!route('#'+h).includes('Страница не найдена'))}});
test('Саша: 3100, дата и источник статистики',()=>{const html=route('#author/sasha');for(const s of ['3 100','20 ноября 2026','учебная выборка','48 часов','0 заказов'])assert(html.includes(s))});
test('Фильтр до 4000 исключает Настю и оставляет Сашу',()=>{route('#authors?budget=4000');const s=node('#results').innerHTML;assert(s.includes('Саша Медведева'));assert(!s.includes('Настя Котова'))});
test('Площадка Telegram оставляет только Город для своих',()=>{route('#authors?platform=Telegram');const s=node('#results').innerHTML;assert(s.includes('Город для своих'));assert(!s.includes('Саша Медведева'))});
test('Пустой результат и сброс доступны',()=>{route('#authors?budget=1000');assert(node('#results').innerHTML.includes('Пока нет совпадений'));route('#authors');assert(node('#results').innerHTML.includes('Настя Котова'))});
test('Фильтр заданий Telegram оставляет Страницы',()=>{route('#jobs?platform=Telegram');const s=node('#results').innerHTML;assert(s.includes('Страницы'));assert(!s.includes('Зёрна'))});
test('Приглашение сохраняет автора, канал, компанию и цену 3600',()=>{const s=route('#invite/sasha');for(const x of ['Саша пробует','Зёрна','value="3600"'])assert(s.includes(x))});
test('Отклик сохраняет канал, задание и цену 2500',()=>{const s=route('#respond/stranicy');for(const x of ['Город для своих','Страницы','value="2500"'])assert(s.includes(x))});
test('Предварительный просмотр не выдаёт отправку за выполненную и экранирует ввод',()=>{route('#respond/stranicy');const f=node('#proposal');f.values={price:'2500',idea:'<img src=x onerror=alert(1)>'};f.onsubmit({preventDefault(){}});const s=node('#proposal-result').innerHTML;assert(s.includes('&lt;img'));assert(!s.includes('<img'));assert(s.includes('Ничего не отправлено'));assert(scrolled)});
test('Неизвестный маршрут показывает возврат на главную',()=>{assert(route('#missing').includes('Страница не найдена'))});
const intro='Проверки в изолированной JS-среде с упрощёнными DOM-объектами.\nПроверяют формирование экранов и обработчики, не заменяют браузерную и визуальную проверку.\n\n';fs.writeFileSync('validation.txt',intro+outputs.join('\n')+'\n');console.log(outputs.join('\n'));
