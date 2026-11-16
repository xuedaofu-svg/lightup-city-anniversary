(() => {
  'use strict';

  // Provincial participation regions and their common city search terms.
  const domestic = `CN-SH|上海|Shanghai|上海市
CN-BJ|北京|Beijing|北京市
CN-TJ|天津|Tianjin|天津市
CN-CQ|重庆|Chongqing|重庆市
CN-ZJ|浙江|Zhejiang|杭州 Hangzhou 宁波 Ningbo 温州 Wenzhou
CN-GD|广东|Guangdong|广州 Guangzhou 深圳 Shenzhen 佛山 Foshan 东莞 Dongguan 珠海 Zhuhai
CN-FJ|福建|Fujian|福州 Fuzhou 厦门 Xiamen 泉州 Quanzhou
CN-JS|江苏|Jiangsu|南京 Nanjing 苏州 Suzhou 无锡 Wuxi
CN-SC|四川|Sichuan|成都 Chengdu
CN-AH|安徽|Anhui|合肥 Hefei
CN-JX|江西|Jiangxi|南昌 Nanchang
CN-SD|山东|Shandong|济南 Jinan 青岛 Qingdao
CN-HA|河南|Henan|郑州 Zhengzhou 洛阳 Luoyang
CN-HB|湖北|Hubei|武汉 Wuhan
CN-HN|湖南|Hunan|长沙 Changsha
CN-HE|河北|Hebei|石家庄 Shijiazhuang
CN-SX|山西|Shanxi|太原 Taiyuan
CN-SN|陕西|Shaanxi|西安 Xian Xi'an
CN-LN|辽宁|Liaoning|沈阳 Shenyang 大连 Dalian
CN-JL|吉林|Jilin|长春 Changchun
CN-HL|黑龙江|Heilongjiang|哈尔滨 Harbin
CN-HI|海南|Hainan|海口 Haikou 三亚 Sanya
CN-GZ|贵州|Guizhou|贵阳 Guiyang
CN-YN|云南|Yunnan|昆明 Kunming
CN-GS|甘肃|Gansu|兰州 Lanzhou
CN-QH|青海|Qinghai|西宁 Xining
CN-NM|内蒙古|Inner Mongolia|内蒙古自治区 呼和浩特 Hohhot Neimenggu
CN-GX|广西|Guangxi|广西壮族自治区 南宁 Nanning 桂林 Guilin
CN-XZ|西藏|Tibet|西藏自治区 拉萨 Lhasa Xizang
CN-NX|宁夏|Ningxia|宁夏回族自治区 银川 Yinchuan
CN-XJ|新疆|Xinjiang|新疆维吾尔自治区 乌鲁木齐 Urumqi
CN-HK|香港|Hong Kong|香港特别行政区 中国香港 Xianggang HK
CN-MO|澳门|Macao|澳门特别行政区 中国澳门 Macau MO
CN-TW|台湾|Taiwan|中国台湾 台北 Taipei TW`;

  // Bundled ISO region codes with CLDR Chinese and English names for offline search.
  const overseas = `JP|日本|Japan
TH|泰国|Thailand
SG|新加坡|Singapore
MY|马来西亚|Malaysia
AE|阿拉伯联合酋长国|United Arab Emirates
GB|英国|United Kingdom
DE|德国|Germany
US|美国|United States
FR|法国|France
AU|澳大利亚|Australia
KR|韩国|South Korea
CA|加拿大|Canada
AD|安道尔|Andorra
AF|阿富汗|Afghanistan
AG|安提瓜和巴布达|Antigua & Barbuda
AI|安圭拉|Anguilla
AL|阿尔巴尼亚|Albania
AM|亚美尼亚|Armenia
AO|安哥拉|Angola
AQ|南极洲|Antarctica
AR|阿根廷|Argentina
AS|美属萨摩亚|American Samoa
AT|奥地利|Austria
AW|阿鲁巴|Aruba
AX|奥兰群岛|Åland Islands
AZ|阿塞拜疆|Azerbaijan
BA|波斯尼亚和黑塞哥维那|Bosnia & Herzegovina
BB|巴巴多斯|Barbados
BD|孟加拉国|Bangladesh
BE|比利时|Belgium
BF|布基纳法索|Burkina Faso
BG|保加利亚|Bulgaria
BH|巴林|Bahrain
BI|布隆迪|Burundi
BJ|贝宁|Benin
BL|圣巴泰勒米|St. Barthélemy
BM|百慕大|Bermuda
BN|文莱|Brunei
BO|玻利维亚|Bolivia
BQ|荷属加勒比区|Caribbean Netherlands
BR|巴西|Brazil
BS|巴哈马|Bahamas
BT|不丹|Bhutan
BV|布韦岛|Bouvet Island
BW|博茨瓦纳|Botswana
BY|白俄罗斯|Belarus
BZ|伯利兹|Belize
CC|科科斯（基林）群岛|Cocos (Keeling) Islands
CD|刚果（金）|Congo - Kinshasa
CF|中非共和国|Central African Republic
CG|刚果（布）|Congo - Brazzaville
CH|瑞士|Switzerland
CI|科特迪瓦|Côte d’Ivoire
CK|库克群岛|Cook Islands
CL|智利|Chile
CM|喀麦隆|Cameroon
CO|哥伦比亚|Colombia
CR|哥斯达黎加|Costa Rica
CU|古巴|Cuba
CV|佛得角|Cape Verde
CW|库拉索|Curaçao
CX|圣诞岛|Christmas Island
CY|塞浦路斯|Cyprus
CZ|捷克|Czechia
DJ|吉布提|Djibouti
DK|丹麦|Denmark
DM|多米尼克|Dominica
DO|多米尼加共和国|Dominican Republic
DZ|阿尔及利亚|Algeria
EC|厄瓜多尔|Ecuador
EE|爱沙尼亚|Estonia
EG|埃及|Egypt
EH|西撒哈拉|Western Sahara
ER|厄立特里亚|Eritrea
ES|西班牙|Spain
ET|埃塞俄比亚|Ethiopia
FI|芬兰|Finland
FJ|斐济|Fiji
FK|福克兰群岛|Falkland Islands
FM|密克罗尼西亚|Micronesia
FO|法罗群岛|Faroe Islands
GA|加蓬|Gabon
GD|格林纳达|Grenada
GE|格鲁吉亚|Georgia
GF|法属圭亚那|French Guiana
GG|根西岛|Guernsey
GH|加纳|Ghana
GI|直布罗陀|Gibraltar
GL|格陵兰|Greenland
GM|冈比亚|Gambia
GN|几内亚|Guinea
GP|瓜德罗普|Guadeloupe
GQ|赤道几内亚|Equatorial Guinea
GR|希腊|Greece
GS|南乔治亚和南桑威奇群岛|South Georgia & South Sandwich Islands
GT|危地马拉|Guatemala
GU|关岛|Guam
GW|几内亚比绍|Guinea-Bissau
GY|圭亚那|Guyana
HM|赫德岛和麦克唐纳群岛|Heard & McDonald Islands
HN|洪都拉斯|Honduras
HR|克罗地亚|Croatia
HT|海地|Haiti
HU|匈牙利|Hungary
ID|印度尼西亚|Indonesia
IE|爱尔兰|Ireland
IL|以色列|Israel
IM|马恩岛|Isle of Man
IN|印度|India
IO|英属印度洋领地|British Indian Ocean Territory
IQ|伊拉克|Iraq
IR|伊朗|Iran
IS|冰岛|Iceland
IT|意大利|Italy
JE|泽西岛|Jersey
JM|牙买加|Jamaica
JO|约旦|Jordan
KE|肯尼亚|Kenya
KG|吉尔吉斯斯坦|Kyrgyzstan
KH|柬埔寨|Cambodia
KI|基里巴斯|Kiribati
KM|科摩罗|Comoros
KN|圣基茨和尼维斯|St. Kitts & Nevis
KP|朝鲜|North Korea
KW|科威特|Kuwait
KY|开曼群岛|Cayman Islands
KZ|哈萨克斯坦|Kazakhstan
LA|老挝|Laos
LB|黎巴嫩|Lebanon
LC|圣卢西亚|St. Lucia
LI|列支敦士登|Liechtenstein
LK|斯里兰卡|Sri Lanka
LR|利比里亚|Liberia
LS|莱索托|Lesotho
LT|立陶宛|Lithuania
LU|卢森堡|Luxembourg
LV|拉脱维亚|Latvia
LY|利比亚|Libya
MA|摩洛哥|Morocco
MC|摩纳哥|Monaco
MD|摩尔多瓦|Moldova
ME|黑山|Montenegro
MF|法属圣马丁|St. Martin
MG|马达加斯加|Madagascar
MH|马绍尔群岛|Marshall Islands
MK|北马其顿|North Macedonia
ML|马里|Mali
MM|缅甸|Myanmar (Burma)
MN|蒙古|Mongolia
MP|北马里亚纳群岛|Northern Mariana Islands
MQ|马提尼克|Martinique
MR|毛里塔尼亚|Mauritania
MS|蒙特塞拉特|Montserrat
MT|马耳他|Malta
MU|毛里求斯|Mauritius
MV|马尔代夫|Maldives
MW|马拉维|Malawi
MX|墨西哥|Mexico
MZ|莫桑比克|Mozambique
NA|纳米比亚|Namibia
NC|新喀里多尼亚|New Caledonia
NE|尼日尔|Niger
NF|诺福克岛|Norfolk Island
NG|尼日利亚|Nigeria
NI|尼加拉瓜|Nicaragua
NL|荷兰|Netherlands
NO|挪威|Norway
NP|尼泊尔|Nepal
NR|瑙鲁|Nauru
NU|纽埃|Niue
NZ|新西兰|New Zealand
OM|阿曼|Oman
PA|巴拿马|Panama
PE|秘鲁|Peru
PF|法属波利尼西亚|French Polynesia
PG|巴布亚新几内亚|Papua New Guinea
PH|菲律宾|Philippines
PK|巴基斯坦|Pakistan
PL|波兰|Poland
PM|圣皮埃尔和密克隆群岛|St. Pierre & Miquelon
PN|皮特凯恩群岛|Pitcairn Islands
PR|波多黎各|Puerto Rico
PS|巴勒斯坦领土|Palestinian Territories
PT|葡萄牙|Portugal
PW|帕劳|Palau
PY|巴拉圭|Paraguay
QA|卡塔尔|Qatar
RE|留尼汪|Réunion
RO|罗马尼亚|Romania
RS|塞尔维亚|Serbia
RU|俄罗斯|Russia
RW|卢旺达|Rwanda
SA|沙特阿拉伯|Saudi Arabia
SB|所罗门群岛|Solomon Islands
SC|塞舌尔|Seychelles
SD|苏丹|Sudan
SE|瑞典|Sweden
SH|圣赫勒拿|St. Helena
SI|斯洛文尼亚|Slovenia
SJ|斯瓦尔巴和扬马延|Svalbard & Jan Mayen
SK|斯洛伐克|Slovakia
SL|塞拉利昂|Sierra Leone
SM|圣马力诺|San Marino
SN|塞内加尔|Senegal
SO|索马里|Somalia
SR|苏里南|Suriname
SS|南苏丹|South Sudan
ST|圣多美和普林西比|São Tomé & Príncipe
SV|萨尔瓦多|El Salvador
SX|荷属圣马丁|Sint Maarten
SY|叙利亚|Syria
SZ|斯威士兰|Eswatini
TC|特克斯和凯科斯群岛|Turks & Caicos Islands
TD|乍得|Chad
TF|法属南部领地|French Southern Territories
TG|多哥|Togo
TJ|塔吉克斯坦|Tajikistan
TK|托克劳|Tokelau
TL|东帝汶|Timor-Leste
TM|土库曼斯坦|Turkmenistan
TN|突尼斯|Tunisia
TO|汤加|Tonga
TR|土耳其|Türkiye
TT|特立尼达和多巴哥|Trinidad & Tobago
TV|图瓦卢|Tuvalu
TZ|坦桑尼亚|Tanzania
UA|乌克兰|Ukraine
UG|乌干达|Uganda
UM|美国本土外小岛屿|U.S. Outlying Islands
UY|乌拉圭|Uruguay
UZ|乌兹别克斯坦|Uzbekistan
VA|梵蒂冈|Vatican City
VC|圣文森特和格林纳丁斯|St. Vincent & Grenadines
VE|委内瑞拉|Venezuela
VG|英属维尔京群岛|British Virgin Islands
VI|美属维尔京群岛|U.S. Virgin Islands
VN|越南|Vietnam
VU|瓦努阿图|Vanuatu
WF|瓦利斯和富图纳|Wallis & Futuna
WS|萨摩亚|Samoa
YE|也门|Yemen
YT|马约特|Mayotte
ZA|南非|South Africa
ZM|赞比亚|Zambia
ZW|津巴布韦|Zimbabwe`;

  const commonNames = {
    JP: '日本国 东京 Tokyo Nihon Nippon', TH: '曼谷 Bangkok', GB: 'UK Great Britain Britain 英格兰 伦敦 London',
    US: 'USA America United States of America 美国纽约 New York', AE: 'UAE 阿联酋 迪拜 Dubai',
    SG: '狮城', AU: '澳洲 悉尼 Sydney', DE: 'Deutschland 柏林 Berlin', FR: '巴黎 Paris',
    KR: '南韩 韩国 首尔 Seoul', MY: '大马 吉隆坡 Kuala Lumpur', NZ: '纽西兰'
  };
  const entries = new Map();
  const records = [];
  const normalize = value => value.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f\s.'’_-]/g, '');

  function addRows(rows, inland) {
    for (const row of rows.split('\n')) {
      const [id, name, en, terms = ''] = row.split('|');
      const location = Object.freeze({id, name, en});
      const words = [name, en, id, terms, commonNames[id] || ''].map(normalize);
      entries.set(id, location);
      records.push({location, words, inland});
    }
  }
  addRows(overseas, false);
  addRows(domestic, true);

  function search(term, current) {
    const needle = normalize(term.trim());
    const localNeedle = needle.replace(/(?:特别行政区|自治区|省|市)$/, '') || needle;
    const results = [];
    for (const {location, words, inland} of records) {
      const query = inland ? localNeedle : needle;
      let rank = 0;
      if (query) {
        if (words.slice(0, 3).includes(query)) rank = 1;
        else if (words.slice(0, 2).some(word => word.startsWith(query))) rank = 2;
        else if (words.some(word => word.includes(query))) rank = 3;
        else continue;
      } else if (location.id !== current.id) rank = 1;
      results.push({location, rank});
    }
    return results.sort((a,b) => a.rank - b.rank).map(item => item.location);
  }

  function open({current, show, close, save, light}) {
    let selecting = false;
    let pending = current;
    let animation;
    const viewport = window.visualViewport;
    function fitKeyboard() {
      if (!viewport) return;
      const layer = surface.parentElement;
      layer.style.top = viewport.offsetTop + 'px';
      layer.style.bottom = 'auto';
      layer.style.height = viewport.height + 'px';
    }
    const surface = show('', {
      modal: true, title: '点亮我的城市',
      onDispose() {
        viewport?.removeEventListener('resize', fitKeyboard);
        viewport?.removeEventListener('scroll', fitKeyboard);
      },
      onBack() {
        if (!selecting) return false;
        renderConfirmation('edit');
        return true;
      }
    });
    surface.classList.add('location-surface');
    fitKeyboard();
    viewport?.addEventListener('resize', fitKeyboard);
    viewport?.addEventListener('scroll', fitKeyboard);

    function switchContent(html, title, after) {
      animation?.cancel();
      const before = surface.offsetHeight;
      surface.innerHTML = html;
      surface.setAttribute('aria-label', title);
      surface.scrollTop = 0;
      after();
      const height = surface.offsetHeight;
      if (before && height && before !== height && surface.animate
          && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation = surface.animate([{height: before + 'px'}, {height: height + 'px'}],
          {duration: 200, easing: 'cubic-bezier(.2,.7,.2,1)'});
      }
    }

    function renderConfirmation(focus) {
      selecting = false;
      switchContent(`<div class="location-view location-confirm">
        <h2>点亮我的城市</h2><p class="location-current"></p>
        <button class="location-primary" type="button" data-light></button>
        <button class="location-secondary" type="button" data-later>再逛逛</button>
        <button class="location-edit" type="button" data-edit>定位不准？<span>修改位置</span></button>
      </div>`, '点亮我的城市', () => {
        surface.querySelector('.location-current').textContent = '当前点亮位置：' + current.name;
        const confirm = surface.querySelector('[data-light]');
        confirm.textContent = '点亮' + current.name;
        confirm.onclick = () => { close(); light(); };
        surface.querySelector('[data-later]').onclick = close;
        surface.querySelector('[data-edit]').onclick = renderPicker;
        if (focus) surface.querySelector('[data-' + focus + ']').focus({preventScroll: true});
      });
    }

    function renderPicker() {
      selecting = true;
      pending = current;
      switchContent(`<div class="location-view location-picker">
        <h2 tabindex="-1">修改点亮位置</h2>
        <label class="location-search"><span class="location-search-icon" aria-hidden="true"></span>
          <input type="search" aria-label="搜索省份、国家或地区" placeholder="搜索省份、国家或地区" autocomplete="off" enterkeyhint="search">
        </label>
        <p class="location-hint">支持中文或英文搜索</p>
        <div class="location-list" role="radiogroup" aria-label="可点亮的位置"></div>
        <p class="location-empty" role="status" hidden>没有找到匹配的位置，试试其他关键词。</p>
        <div class="location-actions"><button class="location-secondary" data-cancel type="button">取消</button>
          <button class="location-primary" data-confirm type="button">确认</button></div>
      </div>`, '修改点亮位置', () => {
        const list = surface.querySelector('.location-list');
        const searchBox = surface.querySelector('input[type=search]');
        const confirm = surface.querySelector('[data-confirm]');
        const empty = surface.querySelector('.location-empty');
        function update() {
          const matches = search(searchBox.value, current);
          const rows = document.createDocumentFragment();
          for (const item of matches) {
            const label = document.createElement('label');
            label.className = 'location-option';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'participation-location';
            input.value = item.id;
            input.checked = item === pending;
            const name = document.createElement('span');
            name.className = 'location-name';
            name.textContent = item.name;
            const english = document.createElement('span');
            english.className = 'location-english';
            english.lang = 'en'; english.textContent = item.en;
            const check = document.createElement('span');
            check.className = 'location-check';
            check.setAttribute('aria-hidden', 'true');
            label.append(input, name, english, check);
            rows.append(label);
          }
          list.replaceChildren(rows);
          list.scrollTop = 0;
          list.hidden = matches.length === 0;
          empty.hidden = matches.length !== 0;
          confirm.disabled = !matches.includes(pending);
        }
        searchBox.oninput = update;
        list.onchange = event => {
          const item = entries.get(event.target.value);
          if (item) { pending = item; confirm.disabled = false; }
        };
        confirm.onclick = () => {
          if (confirm.disabled) return;
          if (pending !== current) { current = pending; save(current); }
          renderConfirmation('light');
        };
        surface.querySelector('[data-cancel]').onclick = () => renderConfirmation('edit');
        update();
        surface.querySelector('h2').focus({preventScroll: true});
      });
    }
    renderConfirmation();
  }

  window.CityLocations = Object.freeze({get: id => entries.get(id), open});
})();
