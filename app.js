const $=id=>document.getElementById(id);
const students={wakasugi:{name:'若杉 凛来华',pinyin:'ruò shān lǐn lái huá',audio:'audio/wakasugi-part1.m4a'},kawahara:{name:'川原 小捺',pinyin:'chuān yuán xiǎo nà',audio:'audio/kawahara-part1.m4a'}};
const paragraphs=[
['古时候，有个孩子叫司马光。一天，他和几个小朋友在花园儿里玩儿。花园儿里有座假山，假山下面有一口大水缸，缸里装满了水。','gǔ shí hou yǒu gè hái zi jiào sī mǎ guāng yì tiān tā hé jǐ gè xiǎo péng you zài huā yuán r lǐ wán r huā yuán r lǐ yǒu zuò jiǎ shān jiǎ shān xià miàn yǒu yì kǒu dà shuǐ gāng gāng lǐ zhuāng mǎn le shuǐ'],
['有个小朋友爬上了假山，一不小心，掉进了大水缸里。别的小朋友都慌了，有的哭，有的喊，还有的跑去找大人。','yǒu gè xiǎo péng you pá shàng le jiǎ shān yí bù xiǎo xīn diào jìn le dà shuǐ gāng lǐ bié de xiǎo péng you dōu huāng le yǒu de kū yǒu de hǎn hái yǒu de pǎo qù zhǎo dà rén'],
['可是，只有司马光没有慌，他搬起一块大石头，使劲儿砸那口缸。水缸破了，缸里的水流了出来，掉在缸里的小朋友得救了。','kě shì zhǐ yǒu sī mǎ guāng méi yǒu huāng tā bān qǐ yí kuài dà shí tou shǐ jìn r zá nà kǒu gāng shuǐ gāng pò le gāng lǐ de shuǐ liú le chū lái diào zài gāng lǐ de xiǎo péng you dé jiù le']
];
function ruby(text,pinyin){const syllables=pinyin.split(/\s+/);let i=0;const result=Array.from(text).map(c=>/\p{Script=Han}/u.test(c)?`<ruby>${c}<rt>${syllables[i++]||''}</rt></ruby>`:c).join('');if(i!==syllables.length)throw Error('拼音与正文数量不匹配');return result;}

const audioStarts={"below":0.15,"boy-named-sima-guang":0.88,"children":0.43,"garden-rockery":0.6,"greeting":0.83,"in-garden":0.46,"kawahara-name":0.79,"kawahara-part1":0.44,"long-ago":0.78,"one-day":0.78,"play":0.41,"playing-in-garden":0.85,"rockery-water-vat":0.1,"school":0.27,"sima-guang":0.58,"topic":0.72,"vat-full-of-water":0.66,"wakasugi-name":0.75,"wakasugi-part1":0.68,"zhuang":0.47,"water":0.37,"climbed-rockery":1.11,"by-accident":0.3,"fell-into-vat":1.01,"children-panicked":0.8,"some-cried":0.5,"some-shouted":0.55,"ran-for-adults":0,"however":0.14,"sima-stayed-calm":0.6,"lifted-stone":0.2,"smashed-vat":0.26,"vat-broke":0,"water-flowed-out":0.2,"child-rescued":0.89,"part2":0.39,"part3":0.24,"thanks-for-listening":0.78};
const phraseAudio={
 '感谢倾听':'thanks-for-listening','大家好':'greeting','我是谏早商业高中的':'school','若杉 凛来华':'wakasugi-name','川原 小捺':'kawahara-name','我的题目是':'topic','司马光':'sima-guang',
 '古时候':'long-ago','有个孩子叫司马光':'boy-named-sima-guang','一天':'one-day','他和几个小朋友在花园儿里玩儿':'playing-in-garden','花园儿里有座假山':'garden-rockery','假山下面有一口大水缸':'rockery-water-vat','缸里装满了水':'vat-full-of-water'
};
Object.assign(phraseAudio,{"有个小朋友爬上了假山":"climbed-rockery","一不小心":"by-accident","掉进了大水缸里":"fell-into-vat","别的小朋友都慌了":"children-panicked","有的哭":"some-cried","有的喊":"some-shouted","还有的跑去找大人":"ran-for-adults","可是":"however","只有司马光没有慌":"sima-stayed-calm","他搬起一块大石头":"lifted-stone","使劲儿砸那口缸":"smashed-vat","水缸破了":"vat-broke","缸里的水流了出来":"water-flowed-out","掉在缸里的小朋友得救了":"child-rescued"});
const wordAudio={'司马光':'sima-guang','小朋友':'children','花园儿里':'in-garden','玩儿':'play','下面':'below','装':'zhuang','水':'water'};
const words=Object.keys(wordAudio).sort((a,b)=>b.length-a.length);
const audioCache=new Map();
let selectedStudent='wakasugi';
let playback=null;
let playbackVersion=0;
let loadingTimer=0;
function getAudio(clip){
 if(audioCache.has(clip))return audioCache.get(clip);
 const audio=new Audio();audio.preload='auto';
 audio.addEventListener('loadedmetadata',()=>{if(!playback||playback.audio!==audio||audio.paused)audio.currentTime=audioStarts[clip]||0;});
 audio.addEventListener('ended',()=>{if(playback?.audio===audio)stopAudio();});
 audio.addEventListener('playing',()=>{if(playback?.audio===audio){clearTimeout(loadingTimer);$('status').textContent='';playback.element?.removeAttribute('aria-busy');}});
 audio.addEventListener('error',()=>{if(playback?.audio===audio){stopAudio();$('status').textContent='音声を読み込めませんでした。もう一度お試しください。';}});
 audio.src=`audio/${clip}.m4a`;audio.load();audioCache.set(clip,audio);return audio;
}
function annotatedText(text,pinyin,clip){
 const syllables=pinyin.split(/\s+/);let syllableIndex=0;let result='';
 const plain=text.replace(/[，。！？：《》]/g,'');
 for(let offset=0;offset<text.length;){
  const word=words.find(w=>text.startsWith(w,offset)&&!(plain===w&&wordAudio[w]===clip));const chunk=word||text[offset];
  const count=Array.from(chunk).filter(c=>/\p{Script=Han}/u.test(c)).length;
  const markup=count?ruby(chunk,syllables.slice(syllableIndex,syllableIndex+count).join(' ')):chunk;
  result+=word?`<span class="word playable" role="button" tabindex="0" data-word="${word}" data-clip="${wordAudio[word]}" title="「${word}」の発音を聞く" aria-label="「${word}」の発音を聞く">${markup}</span>`:markup;
  syllableIndex+=count;offset+=chunk.length;
 }
 if(syllableIndex!==syllables.length)throw Error('拼音与正文数量不匹配');return result;
}
function phrase(id,text,pinyin){
 const clip=phraseAudio[text.replace(/[，。！？：《》]/g,'')];
 return `<span class="sentence${clip?' available':''}" data-sentence="${id}" ${clip?'data-clip="'+clip+'" role="group" tabindex="0"':''} title="${clip?'クリック、または Enter キーでこの短い文だけを聞く':'この文の音声は準備中です'}" ${clip?'aria-label="'+text+' この短い文の音声を再生"':''}>${annotatedText(text,pinyin,clip)}</span>`;
}
function render(){
 document.querySelectorAll('[data-student]').forEach(button=>{const selected=button.dataset.student===selectedStudent;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
 const s=students[selectedStudent];
 let html='<p class="intro">'+phrase('greeting','大家好！','dà jiā hǎo')+phrase('school','我是谏早商业高中的','wǒ shì jiàn zǎo shāng yè gāo zhōng de')+phrase('name',s.name+'。',s.pinyin)+phrase('topic','我的题目是：','wǒ de tí mù shì')+'</p>';
 html+='<h1>'+phrase('title','《司马光》','sī mǎ guāng')+'</h1>';
 paragraphs.forEach(([text,pinyin],paragraphIndex)=>{
  const syllables=pinyin.split(/\s+/);let cursor=0;
  html+='<p>'+text.match(/[^，。！？]+[，。！？]?/g).map((text,i)=>{const count=Array.from(text).filter(c=>/\p{Script=Han}/u.test(c)).length;const py=syllables.slice(cursor,cursor+count).join(' ');cursor+=count;return phrase(`paragraph-${paragraphIndex+1}-phrase-${i+1}`,text,py);}).join('')+'</p>';
  if(paragraphIndex===2)html+='<p class="closing">'+phrase('closing','感谢倾听。','gǎn xiè qīng tīng')+'</p>';
  html+=`<div class="part-actions" lang="ja"><button id="play-part${paragraphIndex+1}" class="part-play" data-play-part="${paragraphIndex+1}" type="button" title="${paragraphIndex===0?'自己紹介・題名・第1段落のお手本音声':'第'+(paragraphIndex+1)+'段落のお手本音声'}">▶ お手本を聞く（Part ${paragraphIndex+1}）</button></div>`;
 });
 $('script').innerHTML=html;
 refreshPartButtons();
}
function getPlaybackPart(){
 if(!playback)return 0;
 return {'wakasugi-part1':1,'kawahara-part1':1,part2:2,part3:3}[playback.clip]||0;
}
function refreshPartButtons(){
 const current=getPlaybackPart();document.querySelectorAll('[data-play-part]').forEach(button=>{const part=Number(button.dataset.playPart);button.textContent=current===part?'■ 停止':`▶ お手本を聞く（Part ${part}）`;button.setAttribute('aria-pressed',String(current===part));});
}
function stopAudio(){
 playbackVersion++;clearTimeout(loadingTimer);
 if(playback){playback.audio.pause();playback.element?.classList.remove('playing');playback.element?.removeAttribute('aria-busy');}
 playback=null;refreshPartButtons();$('status').textContent='';
}
function selectStudent(id){
 if(!Object.hasOwn(students,id))throw Error('名前を確認してください');stopAudio();selectedStudent=id;render();return {student:students[id].name};
}
async function playClip(clip,element=null){
 stopAudio();const version=playbackVersion;const audio=getAudio(clip);playback={audio,clip,element};
 element?.classList.add('playing');element?.setAttribute('aria-busy','true');refreshPartButtons();
 const seek=()=>{if(version===playbackVersion&&playback?.audio===audio)audio.currentTime=audioStarts[clip]||0;};
 if(audio.readyState>=1)seek();else audio.addEventListener('loadedmetadata',seek,{once:true});
 loadingTimer=setTimeout(()=>{if(version===playbackVersion)$('status').textContent='音声を読み込み中…';},400);
 try{await audio.play();}
 catch{if(version!==playbackVersion)return;stopAudio();$('status').textContent='音声を再生できませんでした。もう一度お試しください。';}
}
function activate(element){return playClip(element.dataset.clip,element);}
document.querySelectorAll('[data-student]').forEach(button=>button.addEventListener('click',()=>selectStudent(button.dataset.student)));
$('script').addEventListener('click',event=>{const control=event.target.closest('[data-play-part]');if(control){const part=Number(control.dataset.playPart);if(getPlaybackPart()===part)stopAudio();else playClip(part===1?selectedStudent+'-part1':'part'+part);return;}const target=event.target.closest('[data-word],.sentence.available');if(target){event.stopPropagation();activate(target);}});
$('script').addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const target=event.target.closest('[data-word],.sentence.available');if(target){event.preventDefault();event.stopPropagation();activate(target);}});
render();
// Reuse preloaded media rather than replacing the source for each click.
Object.keys(audioStarts).forEach(getAudio);
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'select_speech_student',description:'名前を選び、自己紹介とお手本音声を切り替えます。',inputSchema:{type:'object',properties:{student:{type:'string',enum:['wakasugi','kawahara']}},required:['student'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>selectStudent(input.student)})).catch(()=>{});}catch{}}
