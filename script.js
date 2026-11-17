const STORAGE_KEY = "sonechkinsStoriesFinalV2";
const THEME_KEY = "sonechkinsStoriesTheme";
const STANDARD_EVENTS = [];
const AGE_LABELS = {infant:"Младенец",toddler:"Тоддлер",child:"Ребёнок",teen:"Подросток",young:"Молодой",adult:"Взрослый",elder:"Пожилой"};
const GENDER_LABELS = {female:"Женский",male:"Мужской",unknown:"Не указан"};
const RELATIONS = {
 mother:"мать",father:"отец",daughter:"дочь",son:"сын",stepmother:"мачеха",stepfather:"отчим",
 stepdaughter:"падчерица",stepson:"пасынок",sister:"сестра",brother:"брат",grandmother:"бабушка",
 grandfather:"дедушка",granddaughter:"внучка",grandson:"внук",wife:"жена",husband:"муж",
 aunt:"тётя",uncle:"дядя",niece:"племянница",nephew:"племянник",
 adoptiveMother:"приёмная мать",adoptiveFather:"приёмный отец",adoptedDaughter:"приёмная дочь",adoptedSon:"приёмный сын"
};
const REVERSE = {
 mother:s=>childWord(s),father:s=>childWord(s),daughter:s=>parentWord(s),son:s=>parentWord(s),
 stepmother:s=>stepchildWord(s),stepfather:s=>stepchildWord(s),stepdaughter:s=>stepparentWord(s),stepson:s=>stepparentWord(s),
 sister:s=>siblingWord(s),brother:s=>siblingWord(s),grandmother:s=>grandchildWord(s),grandfather:s=>grandchildWord(s),
 granddaughter:s=>grandparentWord(s),grandson:s=>grandparentWord(s),wife:s=>"муж / жена",husband:s=>"жена / муж",
 aunt:s=>nieceWord(s),uncle:s=>nieceWord(s),niece:s=>auntWord(s),nephew:s=>auntWord(s),
 adoptiveMother:s=>adoptedChildWord(s),adoptiveFather:s=>adoptedChildWord(s),adoptedDaughter:s=>adoptiveParentWord(s),adoptedSon:s=>adoptiveParentWord(s)
};
const $ = id => document.getElementById(id);
const uid = () => "id-" + Math.random().toString(36).slice(2,9) + Date.now().toString(36);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function childWord(s){return s.gender==="female"?"дочь":s.gender==="male"?"сын":"ребёнок"}
function parentWord(s){return s.gender==="female"?"мать":s.gender==="male"?"отец":"родитель"}
function stepchildWord(s){return s.gender==="female"?"падчерица":s.gender==="male"?"пасынок":"пасынок / падчерица"}
function stepparentWord(s){return s.gender==="female"?"мачеха":s.gender==="male"?"отчим":"отчим / мачеха"}
function grandchildWord(s){return s.gender==="female"?"внучка":s.gender==="male"?"внук":"внук / внучка"}
function grandparentWord(s){return s.gender==="female"?"бабушка":s.gender==="male"?"дедушка":"бабушка / дедушка"}
function siblingWord(s){return s.gender==="female"?"сестра":s.gender==="male"?"брат":"брат / сестра"}
function nieceWord(s){return s.gender==="female"?"племянница":s.gender==="male"?"племянник":"племянник / племянница"}
function auntWord(s){return s.gender==="female"?"тётя":s.gender==="male"?"дядя":"тётя / дядя"}
function adoptedChildWord(s){return s.gender==="female"?"приёмная дочь":s.gender==="male"?"приёмный сын":"приёмный ребёнок"}
function adoptiveParentWord(s){return s.gender==="female"?"приёмная мать":s.gender==="male"?"приёмный отец":"приёмный родитель"}
function reverseLabel(type, from){return REVERSE[type] ? REVERSE[type](from) : "родственник"}
function defaultState(){return {families:[],sets:[],activeSetId:null,history:[]};}
function loadState(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(saved&&Array.isArray(saved.families)&&Array.isArray(saved.sets)){
   saved.history ||= [];
   // Удаляем встроенный старый каталог событий; пользовательские коллекции сохраняем.
   saved.sets = saved.sets.filter(set => set.id !== "standard" && !set.builtIn);
   saved.activeSetId = saved.sets.some(set => set.id === saved.activeSetId) ? saved.activeSetId : (saved.sets[0]?.id || null);
   return saved;
  }
 }catch(e){}
 // Переносим семьи и дневник из предыдущей версии сайта, чтобы обновление не затёрло уже внесённые данные.
 try{
  const legacy=JSON.parse(localStorage.getItem("sonechkinsStoriesDataV1")||"null");
  if(legacy&&Array.isArray(legacy.families)){
   const migrated=defaultState();
   migrated.families=legacy.families.map(f=>({...f,sims:(f.sims||[]).map(s=>({...s,gender:s.gender||"unknown"})),relationships:f.relationships||[]}));
   const oldHistory=JSON.parse(localStorage.getItem("fateHistory")||"[]");
   migrated.history=Array.isArray(oldHistory)?oldHistory.map(h=>({event:h.event||"",target:h.target||"Событие из прошлой версии",setName:"Старый дневник",date:h.date||""})): [];
   return migrated;
  }
 }catch(e){}
 return defaultState();
}
let state=loadState(), currentFamilyId=state.families[0]?.id||null, currentSetId=state.activeSetId||state.sets[0]?.id||null, spinning=false, rotation=0;
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function family(){return state.families.find(f=>f.id===currentFamilyId)||null}
function activeSet(){return state.sets.find(s=>s.id===currentSetId)||state.sets[0]||null}
function notify(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove("show"),2400)}
function showModal(title,content){$("modal-title").textContent=title;$("modal-content").innerHTML=content;$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden")}
document.addEventListener("click",e=>{if(e.target.matches("[data-close-modal]"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
function applyTheme(theme){document.documentElement.dataset.theme=theme;$("theme-icon").textContent=theme==="dark"?"☀":"☾";$("theme-label").textContent=theme==="dark"?"Светлая тема":"Тёмная тема";localStorage.setItem(THEME_KEY,theme);document.querySelector('meta[name="theme-color"]').content=theme==="dark"?"#19151f":"#fff7fa"}
const savedTheme=localStorage.getItem(THEME_KEY);applyTheme(savedTheme==="dark"?"dark":"light");
$("theme-toggle").addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
function renderAll(){renderFamilies();renderWheelControls();renderSets();renderHistory()}
function renderFamilies(){
 $("family-count").textContent=`${state.families.length} / 5`;
 $("family-list").innerHTML=state.families.map(f=>`<button class="family-choice ${f.id===currentFamilyId?"active":""}" data-family="${f.id}"><strong>${esc(f.name)}</strong><small>${esc(f.surname)} · ${f.sims.length} персонажей</small></button>`).join("")||'<p class="empty-copy">Пока нет сохранённых семей.</p>';
 $("add-family").disabled=state.families.length>=5;
 $("family-empty").classList.toggle("hidden",!!family());$("family-details").classList.toggle("hidden",!family());
 if(!family())return;
 const f=family();$("family-title").textContent=f.name;$("family-subtitle").textContent=`Фамилия персонажей: ${f.surname}`;
 $("sim-list").innerHTML=f.sims.map(s=>`<div class="sim-card"><div><strong>${esc(s.firstName)} ${esc(f.surname)}</strong><small>${AGE_LABELS[s.age]||s.age} · ${GENDER_LABELS[s.gender||"unknown"]}</small></div><div class="sim-actions"><button class="mini-action" data-edit-sim="${s.id}">Изменить</button><button class="mini-action" data-delete-sim="${s.id}">Удалить</button></div></div>`).join("")||'<p class="empty-inline">Персонажей пока нет.</p>';
 $("relationship-list").innerHTML=f.relationships.map(r=>{const a=f.sims.find(s=>s.id===r.from),b=f.sims.find(s=>s.id===r.to);if(!a||!b)return "";return `<div class="relation-card"><div><strong>${esc(a.firstName)} — ${esc(RELATIONS[r.type]||"родственник")} — ${esc(b.firstName)}</strong><small>${esc(b.firstName)} — ${esc(reverseLabel(r.type,a))} — ${esc(a.firstName)}</small></div><button class="mini-action" data-delete-rel="${r.id}">Удалить</button></div>`}).join("")||'<p class="empty-inline">Родственные связи пока не добавлены.</p>';
}
function renderWheelControls(){
 const fs=$("wheel-family"),previous=fs.value||currentFamilyId||"";
 fs.innerHTML=state.families.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join("")||'<option value="">Сначала добавь семью</option>';
 if(previous&&state.families.some(f=>f.id===previous))fs.value=previous;
 const f=state.families.find(x=>x.id===fs.value);
 $("wheel-sim").innerHTML=(f?.sims||[]).map(s=>`<option value="${s.id}">${esc(s.firstName)} ${esc(f.surname)}</option>`).join("");
 $("wheel-target").disabled=!f?.sims.length;$("wheel-sim").disabled=!f?.sims.length;
 $("specific-sim-box").classList.toggle("hidden",$("wheel-target").value!=="specific");
 $("wheel-set").innerHTML=state.sets.length ? state.sets.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("") : '<option value="">Пока нет коллекций</option>';
 if(state.sets.some(s=>s.id===currentSetId))$("wheel-set").value=currentSetId;
 $("wheel-set").disabled=!state.sets.length;
 $("spin-button").disabled=!state.sets.some(s=>s.events?.length);
 renderWheelCategories();
}
function renderWheelCategories(){
 const set=state.sets.find(s=>s.id===$("wheel-set").value)||activeSet(),select=$("wheel-category"),prev=select.value||"all";
 const cats=[...new Set((set?.events||[]).map(e=>e.category||"Без категории"))];
 select.disabled=!set?.events?.length;
 select.innerHTML='<option value="all">Все категории</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
 if(cats.includes(prev))select.value=prev;
}
function renderHistory(){
 $("wheel-history").innerHTML=state.history.length?state.history.slice(0,100).map((h,i)=>`<div class="history-entry"><span class="history-number">${state.history.length-i}</span><div><strong>${esc(h.event)}</strong><small>${esc(h.target||"")} · ${esc(h.setName||"")}</small></div><small>${esc(h.date)}</small></div>`).join(""):'<p class="empty-copy">Здесь пока тихо. Самое время сделать первый поворот!</p>';
}
function renderSets(){
 $("set-count").textContent=state.sets.length+" наб.";
 $("set-list").innerHTML=state.sets.map(s=>`<button class="set-choice ${s.id===currentSetId?"active":""}" data-set="${s.id}"><strong>${esc(s.name)}</strong><small>${s.events.length} событий</small></button>`).join("") || '<p class="empty-copy">Пока нет пользовательских наборов.</p>';
 const set=activeSet();$("set-empty").classList.toggle("hidden",!!set);$("set-details").classList.toggle("hidden",!set);if(!set)return;
 $("set-title").textContent=set.name;$("set-description").textContent=set.description||`${set.events.length} событий в наборе`;
 const cats=[...new Set(set.events.map(e=>e.category||"Без категории"))];const filter=$("category-filter"),old=filter.value||"all";
 filter.innerHTML='<option value="all">Все категории</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");if(cats.includes(old))filter.value=old;
 const shown=filter.value==="all"?set.events:set.events.filter(e=>(e.category||"Без категории")===filter.value);
 $("event-list").innerHTML=shown.map(e=>`<div class="event-row"><div><p>${esc(e.text)}</p><small>${esc(e.category||"Без категории")} · ${esc(e.section||"Пользовательские события")}</small></div><div class="event-actions"><button class="mini-action" data-edit-event="${e.id}">Изменить</button><button class="mini-action" data-delete-event="${e.id}">Удалить</button></div></div>`).join("")||'<p class="empty-copy">В этой категории пока нет событий.</p>';
}
$("family-list").addEventListener("click",e=>{const b=e.target.closest("[data-family]");if(b){currentFamilyId=b.dataset.family;renderAll()}});
$("add-family").addEventListener("click",()=>openFamilyForm());
$("edit-family").addEventListener("click",()=>openFamilyForm(family()));
$("delete-family").addEventListener("click",deleteFamily);
$("add-sim").addEventListener("click",()=>openSimForm());
$("add-relation").addEventListener("click",openRelationForm);
$("sim-list").addEventListener("click",e=>{const edit=e.target.closest("[data-edit-sim]"),del=e.target.closest("[data-delete-sim]");if(edit)openSimForm(family().sims.find(s=>s.id===edit.dataset.editSim));if(del)deleteSim(del.dataset.deleteSim)});
$("relationship-list").addEventListener("click",e=>{const b=e.target.closest("[data-delete-rel]");if(b){family().relationships=family().relationships.filter(r=>r.id!==b.dataset.deleteRel);save();renderFamilies()}});
function openFamilyForm(existing=null){if(!existing&&state.families.length>=5)return notify("Можно сохранить не больше пяти семей.");showModal(existing?"Изменить семью":"Новая семья",`<form class="modal-form" id="family-form"><label>Название семьи<input name="name" required maxlength="50" placeholder="Например, Харрингтоны" value="${esc(existing?.name||"")}"></label><label>Фамилия персонажей<input name="surname" required maxlength="40" placeholder="Например, Харрингтон" value="${esc(existing?.surname||"")}"></label><div class="modal-actions"><button class="primary-button">Сохранить</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);
 $("family-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),name=fd.get("name").trim(),surname=fd.get("surname").trim();if(existing){existing.name=name;existing.surname=surname}else{const f={id:uid(),name,surname,sims:[],relationships:[]};state.families.push(f);currentFamilyId=f.id}save();closeModal();renderAll();notify("Семья сохранена")};
}
function deleteFamily(){const f=family();if(!f||!confirm(`Удалить семью «${f.name}» вместе с персонажами?`))return;state.families=state.families.filter(x=>x.id!==f.id);currentFamilyId=state.families[0]?.id||null;save();renderAll()}
function openSimForm(existing=null){const f=family();if(!f)return;showModal(existing?"Изменить персонажа":"Новый персонаж",`<form class="modal-form" id="sim-form"><label>Имя персонажа<input name="firstName" required maxlength="30" value="${esc(existing?.firstName||"")}" placeholder="Например, Эмили"></label><div class="field-row"><label>Возраст<select name="age">${Object.entries(AGE_LABELS).map(([k,v])=>`<option value="${k}" ${existing?.age===k?"selected":""}>${v}</option>`).join("")}</select></label><label>Пол<select name="gender"><option value="unknown">Не указывать</option><option value="female" ${existing?.gender==="female"?"selected":""}>Женский</option><option value="male" ${existing?.gender==="male"?"selected":""}>Мужской</option></select></label></div><p class="hint">Фамилия автоматически берётся из настроек семьи: ${esc(f.surname)}.</p><div class="modal-actions"><button class="primary-button">Сохранить</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);
 $("sim-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),sim={firstName:fd.get("firstName").trim(),age:fd.get("age"),gender:fd.get("gender")};if(existing)Object.assign(existing,sim);else f.sims.push({id:uid(),...sim});save();closeModal();renderAll();notify("Персонаж сохранён")};
}
function deleteSim(id){const f=family(),s=f.sims.find(x=>x.id===id);if(!s||!confirm(`Удалить ${s.firstName}? Его родственные связи тоже будут удалены.`))return;f.sims=f.sims.filter(x=>x.id!==id);f.relationships=f.relationships.filter(r=>r.from!==id&&r.to!==id);save();renderAll()}
function openRelationForm(){const f=family();if(!f||f.sims.length<2)return notify("Добавь хотя бы двух персонажей.");const opts=f.sims.map(s=>`<option value="${s.id}">${esc(s.firstName)}</option>`).join("");showModal("Новая родственная связь",`<form class="modal-form" id="relation-form"><label>Первый персонаж<select name="from">${opts}</select></label><label>Кем приходится второму?<select name="type">${Object.entries(RELATIONS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label><label>Второй персонаж<select name="to">${opts}</select></label><p class="hint">Обратная связь будет определена автоматически с учётом указанного пола.</p><div class="modal-actions"><button class="primary-button">Добавить связь</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);
 $("relation-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),from=fd.get("from"),to=fd.get("to"),type=fd.get("type");if(from===to)return notify("Нужно выбрать двух разных персонажей.");if(f.relationships.some(r=>r.from===from&&r.to===to&&r.type===type))return notify("Такая связь уже есть.");f.relationships.push({id:uid(),from,to,type});save();closeModal();renderFamilies();notify("Связь добавлена")};
}
$("wheel-family").addEventListener("change",renderWheelControls);
$("wheel-target").addEventListener("change",()=>{$("specific-sim-box").classList.toggle("hidden",$("wheel-target").value!=="specific")});
$("wheel-set").addEventListener("change",()=>{currentSetId=$("wheel-set").value;state.activeSetId=currentSetId;save();renderWheelCategories()});
$("wheel-category").addEventListener("change",()=>{});
$("spin-button").addEventListener("click",spinWheel);
function spinWheel(){
 if(spinning)return;const f=state.families.find(x=>x.id===$("wheel-family").value);if(!f||!f.sims.length)return notify("Сначала добавь персонажей в выбранную семью.");
 const set=state.sets.find(x=>x.id===$("wheel-set").value)||activeSet();if(!set?.events.length)return notify("В этом наборе пока нет событий.");
 const category=$("wheel-category").value;let candidates=set.events.filter(e=>category==="all"||(e.category||"Без категории")===category);if(!candidates.length)return notify("В выбранной категории нет событий.");
 const mode=$("wheel-target").value;let target="Вся семья: "+f.name;if(mode==="specific"){const sim=f.sims.find(s=>s.id===$("wheel-sim").value);target=sim?`${sim.firstName} ${f.surname}`:f.name}else if(mode==="random"){const sim=f.sims[Math.floor(Math.random()*f.sims.length)];target=`${sim.firstName} ${f.surname}`}
 const event=candidates[Math.floor(Math.random()*candidates.length)];spinning=true;$("spin-button").disabled=true;$("wheel-result").innerHTML='<span class="result-label">ТВОЁ СОБЫТИЕ</span><p>Судьба выбирает…</p>';
 rotation+=1440+Math.floor(Math.random()*720);$("wheel-disc").style.transform=`rotate(${rotation}deg)`;
 setTimeout(()=>{ $("wheel-result").innerHTML=`<span class="result-label">ТВОЁ СОБЫТИЕ</span><p>${esc(event.text)}</p><div class="result-meta">${esc(target)} · ${esc(event.category||"Без категории")}</div>`;
 state.history.unshift({event:event.text,target,setName:set.name,date:new Date().toLocaleString("ru-RU")});save();renderHistory();spinning=false;$("spin-button").disabled=false;},4000);
}
$("clear-history").addEventListener("click",()=>{if(!state.history.length)return;if(confirm("Очистить весь дневник судьбы?")){state.history=[];save();renderHistory()}});
$("set-list").addEventListener("click",e=>{const b=e.target.closest("[data-set]");if(b){currentSetId=b.dataset.set;state.activeSetId=currentSetId;save();renderSets();renderWheelControls()}});
$("add-set").addEventListener("click",()=>{showModal("Создать набор событий",`<form class="modal-form" id="new-set-form"><label>Название набора<input name="name" required maxlength="60" placeholder="Например, Семейные драмы"></label><label>Описание<textarea name="description" placeholder="Для какого игрового сюжета этот набор?"></textarea></label><div class="modal-actions"><button class="primary-button">Создать</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);$("new-set-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),s={id:uid(),name:fd.get("name").trim(),description:fd.get("description").trim(),events:[]};state.sets.push(s);currentSetId=s.id;state.activeSetId=s.id;save();closeModal();renderSets();renderWheelControls();notify("Набор создан")}})
$("rename-set").addEventListener("click",()=>{const s=activeSet();if(!s)return;showModal("Настройки набора",`<form class="modal-form" id="rename-form"><label>Название<input name="name" required value="${esc(s.name)}"></label><label>Описание<textarea name="description">${esc(s.description||"")}</textarea></label><div class="modal-actions"><button class="primary-button">Сохранить</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);$("rename-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);s.name=fd.get("name").trim();s.description=fd.get("description").trim();save();closeModal();renderSets();renderWheelControls()}})
$("delete-set").addEventListener("click",()=>{const s=activeSet();if(!s)return;if(state.sets.length===1)return notify("Нельзя удалить последний набор.");if(!confirm(`Удалить набор «${s.name}»?`))return;state.sets=state.sets.filter(x=>x.id!==s.id);currentSetId=state.sets[0].id;state.activeSetId=currentSetId;save();renderSets();renderWheelControls()});
$("category-filter").addEventListener("change",renderSets);
$("add-event").addEventListener("click",()=>openEventForm());
$("event-list").addEventListener("click",e=>{const edit=e.target.closest("[data-edit-event]"),del=e.target.closest("[data-delete-event]");if(edit)openEventForm(activeSet().events.find(x=>x.id===edit.dataset.editEvent));if(del){const s=activeSet();s.events=s.events.filter(x=>x.id!==del.dataset.deleteEvent);save();renderSets();renderWheelControls()}});
function openEventForm(existing=null){const set=activeSet();if(!set)return;const cats=[...new Set(set.events.map(e=>e.category).filter(Boolean))];showModal(existing?"Изменить событие":"Новое событие",`<form class="modal-form" id="event-form"><label>Текст события<textarea name="text" required maxlength="500" placeholder="Что произойдёт с симом?">${esc(existing?.text||"")}</textarea></label><label>Категория<input name="category" list="category-options" value="${esc(existing?.category||"Новая категория")}" required><datalist id="category-options">${cats.map(c=>`<option value="${esc(c)}">`).join("")}</datalist></label><div class="modal-actions"><button class="primary-button">Сохранить</button><button class="cancel-button" type="button" data-close-modal>Отмена</button></div></form>`);$("event-form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),obj={id:existing?.id||uid(),text:fd.get("text").trim(),category:fd.get("category").trim(),section:"Пользовательские события"};if(existing)Object.assign(existing,obj);else set.events.push(obj);save();closeModal();renderSets();renderWheelControls();notify("Событие сохранено")}}
$("export-set").addEventListener("click",()=>{const s=activeSet();if(!s)return;downloadFile(`${s.name.replace(/[^\p{L}\p{N}-]+/gu,"_")}.json`,JSON.stringify({format:"sonechkins-stories-set",version:1,set:s},null,2),"application/json");notify("Набор экспортирован")});
function downloadFile(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
$("import-set").addEventListener("click",()=>$("import-file").click());
$("import-file").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const text=await file.text();let imported;if(file.name.toLowerCase().endsWith(".csv")){const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean),head=parseCSVLine(lines.shift());const idxText=head.findIndex(x=>/событие|event/i.test(x)),idxCat=head.findIndex(x=>/категория|category|пак/i.test(x));if(idxText<0)throw new Error("В CSV не найдена колонка «Событие».");imported={name:file.name.replace(/\.csv$/i,""),description:"Импортировано из CSV",events:lines.map((line,i)=>{const cols=parseCSVLine(line);return{id:uid(),text:cols[idxText]||"",category:cols[idxCat]||"Импортированные события",section:"Импорт"}}).filter(x=>x.text.trim())}}else{const parsed=JSON.parse(text);const s=parsed.set||parsed;if(!s||!Array.isArray(s.events))throw new Error("В JSON не найден список событий.");imported={name:s.name||file.name.replace(/\.json$/i,""),description:s.description||"Импортированный набор",events:s.events.map(e=>({id:uid(),text:String(e.text||e.event||"").trim(),category:e.category||"Импортированные события",section:e.section||"Импорт"})).filter(e=>e.text)}}if(!imported.events.length)throw new Error("В файле нет событий.");const s={id:uid(),...imported};state.sets.push(s);currentSetId=s.id;state.activeSetId=s.id;save();renderSets();renderWheelControls();notify(`Импортировано событий: ${s.events.length}`)}catch(err){alert("Не удалось импортировать файл: "+err.message)}finally{e.target.value=""}});
function parseCSVLine(line){const out=[];let cur="",quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&quoted){cur+='"';i++}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){out.push(cur);cur=""}else cur+=c}out.push(cur);return out}
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".main-nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active")}));
renderAll();
