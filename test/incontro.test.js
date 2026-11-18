// Prove del calcolo del prossimo incontro: node --test test/
const test = require('node:test');
const assert = require('node:assert');
const { prossimoIncontro, formatta, fraseNumeri } = require('../incontro.js');

const base = { ora: 20, minuti: 30, durata: 60, extra: [], annullati: [] };
const giorno = (r) => r && `${r.inizio.getFullYear()}-${r.inizio.getMonth() + 1}-${r.inizio.getDate()}`;

test('oggi 18/11/2026: il prossimo è giovedì 3/12', () => {
  const r = prossimoIncontro(new Date(2026, 10, 18, 12, 0), base);
  assert.strictEqual(giorno(r), '2026-12-3');
  assert.strictEqual(r.inizio.getHours(), 20);
  assert.strictEqual(r.inizio.getMinutes(), 30);
  assert.strictEqual(r.titolo, 'il Ritrovarsi del giovedì');
});

test('durante l\'incontro resta quello in corso', () => {
  const r = prossimoIncontro(new Date(2026, 11, 3, 21, 0), base);
  assert.strictEqual(giorno(r), '2026-12-3');
});

test('finito l\'incontro passa al mese dopo (7/1/2027)', () => {
  const r = prossimoIncontro(new Date(2026, 11, 3, 21, 31), base);
  assert.strictEqual(giorno(r), '2027-1-7');
});

test('mese che inizia di giovedì: 1/10/2026', () => {
  const r = prossimoIncontro(new Date(2026, 8, 30, 9, 0), base);
  assert.strictEqual(giorno(r), '2026-10-1');
});

test('un incontro in più (Natale) viene prima del primo giovedì', () => {
  const cfg = { ...base, extra: [{ data: '2026-12-23', titolo: 'Ritrovarsi a Natale' }] };
  const r = prossimoIncontro(new Date(2026, 11, 18, 10, 0), cfg);
  assert.strictEqual(giorno(r), '2026-12-23');
  assert.strictEqual(r.titolo, 'Ritrovarsi a Natale');
});

test('un incontro annullato si salta', () => {
  const cfg = { ...base, annullati: ['2027-01-07'] };
  const r = prossimoIncontro(new Date(2026, 11, 10, 10, 0), cfg);
  assert.strictEqual(giorno(r), '2027-2-4');
});

test('la data si scrive in italiano', () => {
  const r = prossimoIncontro(new Date(2026, 10, 18, 12, 0), base);
  assert.strictEqual(formatta(r.inizio), 'giovedì 3 dicembre, ore 20:30');
  const n = prossimoIncontro(new Date(2026, 11, 18, 10, 0), { ...base, extra: [{ data: '2026-12-23', titolo: 'x' }] });
  assert.strictEqual(formatta(n.inizio), 'mercoledì 23 dicembre, ore 20:30');
});

// Riquadro "Come sta andando": numeri veri, scritti in CONFIG.numeri dopo ogni incontro
test('senza numeri il riquadro non compare', () => {
  assert.strictEqual(fraseNumeri(undefined), null);
  assert.strictEqual(fraseNumeri({ incontri: [], nelGruppo: null }), null);
});

test('ultimo incontro: vale il più recente, anche se scritto prima', () => {
  const n = { incontri: [{ data: '2027-01-07', presenti: 9 }, { data: '2026-12-03', presenti: 7 }] };
  assert.strictEqual(fraseNumeri(n), 'Al Ritrovarsi di giovedì 7 gennaio eravamo in 9.');
});

test('con le persone nel gruppo si aggiunge una frase', () => {
  const n = { incontri: [{ data: '2026-12-03', presenti: 7 }], nelGruppo: 42 };
  assert.strictEqual(fraseNumeri(n), 'Al Ritrovarsi di giovedì 3 dicembre eravamo in 7. Nel gruppo siamo in 42.');
});

test('solo le persone nel gruppo, prima del primo incontro', () => {
  assert.strictEqual(fraseNumeri({ incontri: [], nelGruppo: 12 }), 'Nel gruppo siamo in 12.');
});
