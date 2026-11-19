// Ritrovarsi: calcolo del prossimo incontro.
// Regola fissa: ogni giovedì alle 20:30, un'ora.
// Le eccezioni stanno in CONFIG (in fondo): incontri in più ed eventuali annullati.

(function (radice) {
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio',
    'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function chiave(d) {
    var m = d.getMonth() + 1, g = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (g < 10 ? '0' : '') + g;
  }

  function prossimiGiovedi(adesso, quanti) {
    var risultato = [];
    var base = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());
    var scarto = (4 - base.getDay() + 7) % 7;
    base.setDate(base.getDate() + scarto);
    for (var i = 0; i < quanti; i++) {
      risultato.push(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i * 7));
    }
    return risultato;
  }

  function prossimoIncontro(adesso, cfg) {
    var candidati = prossimiGiovedi(adesso, 8).map(function (g) {
      return { inizio: new Date(g.getFullYear(), g.getMonth(), g.getDate(), cfg.ora, cfg.minuti), titolo: 'il Ritrovarsi del giovedì' };
    });
    (cfg.extra || []).forEach(function (e) {
      var p = e.data.split('-');
      candidati.push({ inizio: new Date(+p[0], +p[1] - 1, +p[2], cfg.ora, cfg.minuti), titolo: e.titolo });
    });
    var annullati = cfg.annullati || [];
    var validi = candidati.filter(function (c) {
      var fine = new Date(c.inizio.getTime() + cfg.durata * 60000);
      return fine > adesso && annullati.indexOf(chiave(c.inizio)) === -1;
    });
    validi.sort(function (a, b) { return a.inizio - b.inizio; });
    return validi[0] || null;
  }

  function formatta(d) {
    var min = d.getMinutes();
    return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()] +
      ', ore ' + d.getHours() + ':' + (min < 10 ? '0' : '') + min;
  }

  // Frase del riquadro "Come sta andando"; null = riquadro nascosto.
  function fraseNumeri(n) {
    if (!n) return null;
    var parti = [];
    var incontri = (n.incontri || []).slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    if (incontri.length) {
      var p = incontri[0].data.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      parti.push('Al Ritrovarsi di ' + GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()] +
        ' eravamo in ' + incontri[0].presenti + '.');
    }
    if (n.nelGruppo) parti.push('Nel gruppo siamo in ' + n.nelGruppo + '.');
    return parti.length ? parti.join(' ') : null;
  }

  var esporta = { prossimoIncontro: prossimoIncontro, formatta: formatta, fraseNumeri: fraseNumeri };
  if (typeof module !== 'undefined' && module.exports) { module.exports = esporta; }
  else { radice.Ritrovarsi = esporta; }
})(this);

// ---- Da modificare quando serve (lo fa Claude) ----
// extra: incontri in più, es. { data: '2026-12-23', titolo: 'Ritrovarsi a Natale' }
// annullati: date 'AAAA-MM-GG' di giovedì saltati
// numeri: dopo ogni incontro, es. incontri: [{ data: '2026-12-03', presenti: 7 }], nelGruppo: 42
// foto, video, audio: nome del file nella cartella (es. 'foto.jpg'); vuoto = non si vede
var CONFIG = {
  ora: 20, minuti: 30, durata: 60, extra: [], annullati: [],
  numeri: { incontri: [], nelGruppo: null },
  foto: 'foto.jpg', video: '', audio: ''
};
