/* eslint-disable */
// Content of the 石塭問答 (Ask Wen) guide, authored by the Stone Weirs, Shared Futures team.
// Ported verbatim from the standalone prototype; edit here to change guide text.
// Hakka lines: AI draft (Hakka Affairs Council speech database) pending an elder's review.

export const T: any={
 zh:{tagline:"石滬 AI 小精靈",veil:"新屋海邊的石滬，客家老人家叫它「石塭」。點一個問題，聽聽一般 AI 和社區治理的 AI 各怎麼說。",go:"開始",
  hello:"我是石滬小精靈小塭。點一個問題問我吧。",wen:"小塭",
  lead:"先聽一般 AI 怎麼說。",flag:"這段是 AI 自己編的。再聽社區治理的 AI。",
  baseWho:"一般 AI 說",govWho:"社區治理的 AI 說",src:"出處",
  pin:"拼音",big:"大字",sound:"聲音",
  stop:"停止",replay:"再聽一次",skipHint:"點字幕可跳到下一句",
  more:["聽耆老說","兩種腔調","測試結果","完整版能做什麼"],
  acc:{sixian:"四縣腔",hailu:"海陸腔"},again:"換{a}再聽一次",
  toneLead:"新屋的客家話有四縣腔和海陸腔兩種。",toneSay:"新屋的客家話有四縣腔和海陸腔兩種。四縣腔有六個聲調，海陸腔有七個聲調，同一句話，兩種腔調聽起來不一樣。",toneNote:"調值依教育部《客家語拼音方案使用手冊》。數字越大聲音越高，入聲是短促的調。",toneTry:"在客語模式點「四縣、海陸」切換，或答案講完後點「換腔調再聽」。",
  tn:{yinping:"陰平",yangping:"陽平",shang:"上聲",qu:"去聲",yinqu:"陰去",yangqu:"陽去",yinru:"陰入",yangru:"陽入"},
  noVoice:"這支手機沒有播出語音，請看字幕。iPhone 請關掉側邊的靜音開關、把音量調大後再試。",
  elderLead:"這一段，是新屋耆老親口說的。",elderWho:"耆老說",elderLines:["一般人講「石滬」，我們新屋的老人家講「石塭」。","「流水來」就是漲潮，「湧」就是海浪。"],elderMissing:"耆老錄音還沒放進來。",
  resLead:"24 題測試裡，AI 亂編的題數。",resR:"一般 AI",resG:"社區治理",resSay:"沒有治理的 AI，24 題有 15 題亂編；社區治理的 AI，0 題。",
  fullLead:"剛剛的 3 題，只是 35 筆紀錄裡的一小部分。完整版還能做這些事。",
  fullList:["35 筆石滬紀錄，每筆都有來源和同意紀錄","任何問題都只用審核過的紀錄回答","客語導覽，帶訪客走進新屋的故事","其他漁村可以照著用的社區治理範本"],
  contact:"合作洽詢：新屋愛鄉協會、新屋石滬故事館（聯絡方式待補）",
  allDone:"三個問題都聽完了。想知道完整版能做什麼嗎？",
  micB:"直接問小塭",micS:"正式版可以用客語或華語開口問",micSay:"正式版會在這裡聽你用客語或華語提問。現在請先點上面的問題。",
  hakNote:"客語字幕還在請耆老確認，先顯示華語。",hakAI:"客語由 AI 翻譯與合成（客委會臺灣客語語音資料庫），待耆老確認。",heard:"已聽過",
  foot:"資料來源：Tai, Lai, Lee & Chang（2026）〈Stone Weirs, Shared Futures〉24 題測試；原始敘事：戚文芬〈傳承百年的石滬文化〉。一般 AI 的回答依論文實測紀錄改寫。"},
 en:{tagline:"the stone-weir sprite",veil:"Xinwu’s Hakka elders call their stone weirs 石塭. Pick a question and hear how an ungoverned AI and a community-governed AI each answer.",go:"Start",
  hello:"Hi, I’m Wen, the stone-weir sprite. Pick a question to ask me.",wen:"Wen",
  lead:"First, here is what an ungoverned AI says.",flag:"That was made up. Now the community-governed AI.",
  baseWho:"An ungoverned AI says",govWho:"The community-governed AI says",src:"Source",
  pin:"Pinyin",big:"Large text",sound:"Sound",
  stop:"Stop",replay:"Play again",skipHint:"Tap a subtitle to skip ahead",
  more:["Hear an elder","Two Hakka accents","Test results","What the full version does"],
  acc:{sixian:"Sixian",hailu:"Hailu"},again:"Hear it again in {a}",
  toneLead:"Xinwu’s Hakka has two accents: Sixian and Hailu.",toneSay:"Xinwu’s Hakka has two accents, Sixian and Hailu. Sixian has six tones and Hailu has seven, so the same sentence sounds different in each.",toneNote:"Tone values from the Ministry of Education’s Hakka pinyin handbook. Higher numbers mean higher pitch; checked tones are short.",toneTry:"In Hakka mode, switch between Sixian and Hailu, or tap “Hear it again” after an answer.",
  tn:{yinping:"yinping",yangping:"yangping",shang:"shang",qu:"qu",yinqu:"yinqu",yangqu:"yangqu",yinru:"yinru",yangru:"yangru"},
  noVoice:"This phone didn’t play any speech, so please read the subtitles. On iPhone, turn off the silent switch and raise the volume.",
  elderLead:"This part is told by a Xinwu elder, in their own voice.",elderWho:"An elder says",elderLines:["Most people say ‘stone weir’ (石滬); Xinwu’s elders say 石塭.","‘流水來’ means the tide is coming in; ‘湧’ means a wave."],elderMissing:"The elder’s recording hasn’t been added yet.",
  resLead:"Made-up answers in a 24-question test.",resR:"Ungoverned",resG:"Governed",resSay:"Without governance, the AI made things up in 15 of 24 answers. With community governance, in none.",
  fullLead:"The 3 questions you heard come from 35 records. The full version can also do this.",
  fullList:["35 weir records, each with its source and consent status","Answers to any question, only from reviewed records","Hakka guided tours through Xinwu’s story","A governance template other fishing villages can use"],
  contact:"Partner with us: Xinwu Hometown Association and the Xinwu Stone Weir Story House (contact details to be added)",
  allDone:"You’ve heard all three. Want to know what the full version does?",
  micB:"Ask Wen out loud",micS:"The full version listens in Hakka or Mandarin",micSay:"In the full version, Wen listens here for questions in Hakka or Mandarin. For now, tap a question above.",
  hakNote:"",hakAI:"Hakka lines are AI-translated and AI-voiced (Hakka Affairs Council speech database), pending an elder’s review.",heard:"heard",
  foot:"Source: Tai, Lai, Lee & Chang (2026), ‘Stone Weirs, Shared Futures’, 24-item test; narrative by Chi Wen-Fen. Ungoverned answers paraphrase the paper’s logged outputs."}
};
/* [[wrong]] = made-up part, {{right}} = sourced part */
export const Q: any[]=[
 {id:"q1",rec:"PL-03",pos:[6,16],
  q:{zh:"石滬故事館以前是什麼？",en:"What was the Story House before?"},
  base:{zh:"它以前可能是[[社區中心或行政辦公室]]。",en:"It was probably [[a community centre or administrative office]]."},
  gov:{zh:"三十幾年前的{{警察宿舍}}，民國110年改建成石滬故事館。",en:"{{A police dormitory}} built over 30 years ago, converted into the Story House in 2021."}},
 {id:"q2",rec:"NE-01",pos:[60,8],
  q:{zh:"新屋客家人怎麼叫石滬？",en:"What do Xinwu’s Hakka people call a weir?"},
  base:{zh:"新屋的客家人對石滬有[[一個特別的稱呼]]。",en:"Xinwu’s Hakka people have [[a distinct word]] for it."},
  gov:{zh:"老人家講「{{石塭}}」，是客家族群的專用詞彙，代表他們和大海相依共存。",en:"Elders call it {{石塭 (shi-wen)}}, a Hakka-specific word for the community’s bond with the sea."}},
 {id:"q3",rec:"OB-04",pos:[66,64],
  q:{zh:"鹹醢飯怎麼做？",en:"How is xian-hai rice made?"},
  base:{zh:"把海產用[[醬油]]、鹽和蒜醃漬後配白飯。",en:"Seafood is pickled with [[soy sauce]], salt and garlic, then eaten with rice."},
  gov:{zh:"把吃不完的海產曝曬，或加{{鹽巴、蒜頭、酒}}醃漬，再配白飯。",en:"Leftover seafood is sun-dried or preserved with {{salt, garlic and rice wine}}, then eaten with rice."}}
];


export const slots=()=>({lead:null,flag:null,q1:{base:null,gov:null},q2:{base:null,gov:null},q3:{base:null,gov:null}});
export const HAK: any={
 sixian:{"lead": [["先", "xienˊ"], ["聽", "tangˊ"], ["一", "idˋ"], ["般", "banˊ"], ["AI", ""], ["仰", "ngiongˋ"], ["仔", "eˋ"], ["講", "gongˋ"], ["呢", "noˇ"], ["。", ""]], "flag": [["這", "iaˋ"], ["段", "ton"], ["係", "he"], ["AI", ""], ["自", "qidˋ"], ["家", "gaˊ"], ["編", "bienˊ"], ["个", "ge"], ["。", ""], ["過", "go"], ["聽", "tangˊ"], ["社", "sa"], ["區", "kiˊ"], ["治", "cii"], ["理", "liˊ"], ["个", "ge"], ["AI", ""], ["。", ""]], "q1": {"base": [["佢", "giˇ"], ["頭", "teuˇ"], ["擺", "baiˋ"], ["可", "koˋ"], ["能", "nenˇ"], ["係", "he"], ["社", "sa", "x"], ["區", "kiˊ", "x"], ["中", "zungˊ", "x"], ["心", "ximˊ", "x"], ["抑", "ia", "x"], ["係", "he", "x"], ["行", "hangˇ", "x"], ["政", "ziin", "x"], ["辦", "pan", "x"], ["公", "gungˊ", "x"], ["室", "siidˋ", "x"], ["。", ""]], "gov": [["三", "samˊ"], ["十", "siib"], ["零", "langˇ"], ["年", "ngienˇ"], ["前", "qienˇ"], ["這", "iaˋ"], ["位", "vi"], ["係", "he"], ["警", "ginˋ", "ok"], ["察", "cadˋ", "ok"], ["宿", "xiugˋ", "ok"], ["舍", "saˋ", "ok"], ["，", ""], ["後", "heu"], ["來", "loiˇ"], ["改", "goiˋ"], ["建", "gien"], ["做", "zo"], ["石", "sag"], ["滬", "fu"], ["故", "gu"], ["事", "sii"], ["館", "gonˋ"], ["。", ""]]}, "q2": {"base": [["新", "xinˊ"], ["屋", "vugˋ"], ["个", "ge"], ["客", "hagˋ"], ["人", "nginˇ"], ["對", "dui"], ["石", "sag"], ["滬", "fu"], ["仔", "eˋ"], ["有", "iuˊ"], ["一", "idˋ", "x"], ["個", "ge", "x"], ["特", "tid", "x"], ["別", "pied", "x"], ["个", "ge", "x"], ["稱", "ciinˊ", "x"], ["呼", "fu", "x"], ["。", ""]], "gov": [["老", "loˋ"], ["人", "nginˇ"], ["家", "gaˊ"], ["講", "gongˋ"], ["「", ""], ["石", "sag", "ok"], ["塭", "vunˊ", "ok"], ["」", ""], ["，", ""], ["係", "he"], ["客", "hagˋ"], ["家", "gaˊ"], ["族", "cug"], ["群", "kiunˇ"], ["个", "ge"], ["專", "zonˊ"], ["用", "iung"], ["詞", "ciiˇ"], ["彙", "fi"], ["，", ""], ["代", "toi"], ["表", "beuˋ"], ["佢", "giˇ"], ["兜", "deuˊ"], ["摎", "lauˊ"], ["大", "tai"], ["海", "hoiˋ"], ["相", "xiongˊ"], ["依", "iˊ"], ["共", "kiung"], ["存", "sunˇ"], ["。", ""]]}, "q3": {"base": [["摎", "lauˊ"], ["海", "hoiˋ"], ["產", "sanˋ"], ["用", "iung"], ["豆", "teu", "x"], ["油", "iuˇ", "x"], ["、", ""], ["鹽", "iamˇ"], ["還", "hanˇ"], ["過", "go"], ["蒜", "son"], ["頭", "teuˇ"], ["滷", "luˊ"], ["過", "go"], ["後", "heu"], ["傍", "bongˋ"], ["白", "pag"], ["飯", "fan"], ["。", ""]], "gov": [["老", "loˋ"], ["人", "nginˇ"], ["家", "gaˊ"], ["將", "jiongˊ"], ["食", "siid"], ["毋", "mˇ"], ["忒", "tedˋ"], ["个", "ge"], ["海", "hoiˋ"], ["產", "sanˋ"], ["拿", "naˊ"], ["去", "hi"], ["晒", "sai"], ["燥", "zauˊ"], ["，", ""], ["抑", "ia"], ["係", "he"], ["用", "iung"], ["鹽", "iamˇ", "ok"], ["、", "", "ok"], ["蒜", "son", "ok"], ["頭", "teuˇ", "ok"], ["、", "", "ok"], ["酒", "jiuˋ", "ok"], ["滷", "luˊ"], ["起", "hiˋ"], ["來", "loiˇ"], ["，", ""], ["再", "zai"], ["過", "go"], ["傍", "bongˋ"], ["白", "pag"], ["飯", "fan"], ["。", ""]]}},
 hailu:{"lead": [["先", "senˋ"], ["聽", "tangˇ"], ["一", "rhid"], ["般", "banˋ"], ["AI", ""], ["仰", "ngiongˊ"], ["般", "banˋ"], ["講", "gongˊ"], ["。", ""]], "flag": [["這", "liaˊ"], ["段", "ton+"], ["係", "heˇ"], ["AI", ""], ["自", "cid"], ["家", "gaˋ"], ["編", "bienˋ"], ["个", "gaiˇ"], ["。", ""], ["再", "zaiˇ"], ["過", "goˊ"], ["聽", "tangˇ"], ["社", "sha+"], ["區", "kiˋ"], ["治", "chi+"], ["理", "liˋ"], ["个", "gaiˇ"], ["AI", ""], ["。", ""]], "q1": {"base": [["佢", "gi"], ["頭", "teu"], ["擺", "baiˊ"], ["可", "koˊ"], ["能", "nen"], ["係", "heˇ"], ["社", "sha+", "x"], ["區", "kiˋ", "x"], ["中", "zhungˋ", "x"], ["心", "simˋ", "x"], ["或", "fedˋ", "x"], ["者", "zhaˊ", "x"], ["行", "hang", "x"], ["政", "zhinˇ", "x"], ["辦", "pan+", "x"], ["公", "gungˋ", "x"], ["室", "shid", "x"], ["。", ""]], "gov": [["三", "samˋ"], ["十", "shibˋ"], ["零", "lang"], ["年", "ngien"], ["前", "cien"], ["這", "liaˊ"], ["位", "vui+"], ["係", "heˇ"], ["警", "ginˇ", "ok"], ["察", "cad", "ok"], ["宿", "siug", "ok"], ["舍", "shaˇ", "ok"], ["，", ""], ["後", "heu+"], ["來", "loi"], ["改", "goiˊ"], ["建", "gienˇ"], ["成", "shin"], ["石", "shagˋ"], ["滬", "fuˇ"], ["故", "guˇ"], ["事", "sii+"], ["館", "gonˊ"], ["。", ""]]}, "q2": {"base": [["新", "sinˋ"], ["屋", "vug"], ["个", "gaiˇ"], ["客", "hag"], ["家", "gaˋ"], ["人", "ngin"], ["對", "duiˇ"], ["石", "shagˋ"], ["滬", "fuˇ"], ["有", "rhiuˋ"], ["一", "rhid", "x"], ["隻", "zhag", "x"], ["特", "tidˋ", "x"], ["別", "piedˋ", "x"], ["个", "gaiˇ", "x"], ["稱", "chinˋ", "x"], ["呼", "fuˋ", "x"], ["。", ""]], "gov": [["老", "loˊ"], ["人", "ngin"], ["家", "gaˋ"], ["講", "gongˊ"], ["「", ""], ["石", "shagˋ", "ok"], ["塭", "vunˋ", "ok"], ["」", ""], ["，", ""], ["係", "heˇ"], ["客", "hag"], ["家", "gaˋ"], ["族", "cugˋ"], ["群", "kiun"], ["个", "gaiˇ"], ["專", "zhonˋ"], ["用", "rhung+"], ["詞", "cii"], ["彙", "fui+"], ["，", ""], ["代", "toi+"], ["表", "biauˊ"], ["佢", "gi"], ["兜", "deuˋ"], ["摎", "lauˋ"], ["大", "tai+"], ["海", "hoiˊ"], ["共", "kiung+"], ["下", "ha+"], ["生", "senˋ"], ["存", "sun"], ["。", ""]]}, "q3": {"base": [["摎", "lauˋ"], ["海", "hoiˊ"], ["產", "sanˊ"], ["用", "rhung+"], ["豆", "teu+", "x"], ["油", "rhiu", "x"], ["、", ""], ["鹽", "rham"], ["摎", "lauˋ"], ["蒜", "sonˇ"], ["頭", "teu"], ["滷", "luˋ"], ["過", "goˇ"], ["以", "rhiˋ"], ["後", "heu+"], ["傍", "bongˊ"], ["白", "pagˋ"], ["飯", "pon+"], ["。", ""]], "gov": [["老", "loˊ"], ["人", "ngin"], ["家", "gaˋ"], ["摎", "lauˋ"], ["食", "shidˋ"], ["毋", "m"], ["煞", "sad"], ["个", "gaiˇ"], ["海", "hoiˊ"], ["產", "sanˊ"], ["拿", "naˋ"], ["去", "hiˇ"], ["晒", "saiˇ"], ["燥", "zauˋ"], ["，", ""], ["抑", "rha+"], ["係", "heˇ"], ["用", "rhung+"], ["鹽", "rham", "ok"], ["、", "", "ok"], ["蒜", "sonˇ", "ok"], ["頭", "teu", "ok"], ["、", "", "ok"], ["酒", "ziuˊ", "ok"], ["滷", "luˋ"], ["起", "hiˊ"], ["來", "loi"], ["，", ""], ["再", "zaiˇ"], ["過", "goˊ"], ["傍", "bongˊ"], ["白", "pagˋ"], ["飯", "pon+"], ["。", ""]]}},
 elder:[null,null] };

export const TONES: Record<string,[string,string][]>={
  sixian:[["yinping","24"],["yangping","11"],["shang","31"],["qu","55"],["yinru","2"],["yangru","5"]],
  hailu:[["yinping","53"],["yangping","55"],["shang","24"],["yinqu","11"],["yangqu","33"],["yinru","5"],["yangru","2"]]
};
