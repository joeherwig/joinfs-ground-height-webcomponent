'use strict';
// Writes src/joinfs-ground-height-<locale>.json from the table below (English lives in the script). Run: node tools/make-locales.cjs
// German uses the informal "du". Translations other than German are first drafts - corrections are welcome.
const fs = require('fs');
const path = require('path');

const KEYS = ['legend.aircraft', 'legend.ground', 'legend.agl', 'tip.time', 'tip.altitude', 'tip.ground', 'tip.agl', 'btn.zoomIn', 'btn.zoomOut',
  'btn.fit', 'btn.unit', 'hint', 'aria.chart', 'noGround', 'stat.minAgl', 'stat.maxAlt', 'stat.maxGround', 'empty'];

const T = {
  de: ['Flughöhe', 'Höhe des Bodens', 'Höhe über Grund', 'Zeit', 'Höhe', 'Boden', 'Über Grund', 'Vergrößern', 'Verkleinern', 'Alles anzeigen',
    'Einheit wechseln (jetzt {unit})', 'Mausrad: zoomen · Strg+Mausrad oder ziehen: verschieben · Klick: Wiedergabeposition setzen · Doppelklick: alles anzeigen',
    'Höhe und Bodenhöhe von {name}, von {from} bis {to}', 'Keine Bodenhöhe verfügbar: es wird nur die Flughöhe gezeigt.',
    'Geringste Höhe über Grund: {value}', 'Größte Höhe: {value}', 'Höchster Boden: {value}', 'Keine Daten vorhanden.'],
  es: ['Altitud de la aeronave', 'Altura del terreno', 'Altura sobre el terreno', 'Tiempo', 'Altitud', 'Terreno', 'Sobre el terreno', 'Acercar', 'Alejar',
    'Mostrar todo', 'Cambiar la unidad (ahora {unit})', 'Rueda: zoom · Ctrl+rueda o arrastrar: desplazar · Clic: mover el cursor de reproducción · Doble clic: mostrar todo',
    'Altitud y altura del terreno de {name}, de {from} a {to}', 'No hay altura del terreno disponible: solo se muestra la altitud de la aeronave.',
    'Altura mínima sobre el terreno: {value}', 'Altitud máxima: {value}', 'Terreno más alto: {value}', 'No hay datos que mostrar.'],
  fr: ['Altitude de l’aéronef', 'Hauteur du sol', 'Hauteur au-dessus du sol', 'Temps', 'Altitude', 'Sol', 'Au-dessus du sol', 'Zoom avant', 'Zoom arrière',
    'Tout afficher', 'Changer l’unité (actuellement {unit})', 'Molette : zoom · Ctrl+molette ou glisser : défiler · Clic : déplacer la position de lecture · Double-clic : tout afficher',
    'Altitude et hauteur du sol de {name}, de {from} à {to}', 'Aucune hauteur du sol disponible : seule l’altitude de l’aéronef est affichée.',
    'Hauteur minimale au-dessus du sol : {value}', 'Altitude maximale : {value}', 'Sol le plus haut : {value}', 'Aucune donnée à afficher.'],
  it: ['Quota dell’aeromobile', 'Altezza del terreno', 'Altezza sul terreno', 'Tempo', 'Quota', 'Terreno', 'Sul terreno', 'Ingrandisci', 'Riduci',
    'Mostra tutto', 'Cambia l’unità (ora {unit})', 'Rotella: zoom · Ctrl+rotella o trascina: scorri · Clic: sposta la posizione di riproduzione · Doppio clic: mostra tutto',
    'Quota e altezza del terreno di {name}, da {from} a {to}', 'Nessuna altezza del terreno disponibile: viene mostrata solo la quota dell’aeromobile.',
    'Altezza minima sul terreno: {value}', 'Quota massima: {value}', 'Terreno più alto: {value}', 'Nessun dato da mostrare.'],
  ko: ['항공기 고도', '지면 높이', '지상고', '시간', '고도', '지면', '지상 높이', '확대', '축소',
    '전체 보기', '단위 변경 (현재 {unit})', '휠: 확대/축소 · Ctrl+휠 또는 드래그: 스크롤 · 클릭: 재생 위치 이동 · 더블 클릭: 전체 보기',
    '{name}의 고도와 지면 높이, {from}부터 {to}까지', '지면 높이를 사용할 수 없습니다. 항공기 고도만 표시됩니다.',
    '최저 지상고: {value}', '최고 고도: {value}', '최고 지면: {value}', '표시할 데이터가 없습니다.'],
  nl: ['Vlieghoogte', 'Hoogte van de grond', 'Hoogte boven de grond', 'Tijd', 'Hoogte', 'Grond', 'Boven de grond', 'Inzoomen', 'Uitzoomen',
    'Alles tonen', 'Eenheid wijzigen (nu {unit})', 'Wiel: zoomen · Ctrl+wiel of slepen: scrollen · Klik: afspeelpositie verplaatsen · Dubbelklik: alles tonen',
    'Hoogte en grondhoogte van {name}, van {from} tot {to}', 'Geen grondhoogte beschikbaar: alleen de vlieghoogte wordt getoond.',
    'Laagste hoogte boven de grond: {value}', 'Hoogste hoogte: {value}', 'Hoogste grond: {value}', 'Geen gegevens om te tonen.'],
  pt: ['Altitude da aeronave', 'Altura do solo', 'Altura acima do solo', 'Tempo', 'Altitude', 'Solo', 'Acima do solo', 'Aumentar', 'Diminuir',
    'Mostrar tudo', 'Mudar a unidade (agora {unit})', 'Roda: zoom · Ctrl+roda ou arrastar: deslocar · Clique: mover a posição de reprodução · Duplo clique: mostrar tudo',
    'Altitude e altura do solo de {name}, de {from} a {to}', 'Sem altura do solo disponível: só a altitude da aeronave é mostrada.',
    'Menor altura acima do solo: {value}', 'Maior altitude: {value}', 'Solo mais alto: {value}', 'Sem dados para mostrar.'],
  uk: ['Висота польоту', 'Висота землі', 'Висота над землею', 'Час', 'Висота', 'Земля', 'Над землею', 'Збільшити', 'Зменшити',
    'Показати все', 'Змінити одиницю (зараз {unit})', 'Колесо: масштаб · Ctrl+колесо або перетягування: прокрутка · Клік: перемістити позицію відтворення · Подвійний клік: показати все',
    'Висота та висота землі для {name}, від {from} до {to}', 'Висота землі недоступна: показано лише висоту польоту.',
    'Найменша висота над землею: {value}', 'Найбільша висота: {value}', 'Найвища земля: {value}', 'Немає даних для показу.'],
};

for (const [lang, values] of Object.entries(T)) {
  if (values.length !== KEYS.length) throw new Error(`${lang}: ${values.length} strings, expected ${KEYS.length}`);
  const obj = {};
  KEYS.forEach((k, i) => { obj[k] = values[i]; });
  fs.writeFileSync(path.join(__dirname, '..', 'src', `joinfs-ground-height-${lang}.json`), JSON.stringify(obj, null, 2) + '\n');
}
console.log('wrote', Object.keys(T).join(', '));
