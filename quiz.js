// Quiz zur Projektpräsentation: alle beantworten alle Fragen, die Farbe zeigt, wessen Thema es ist.
(function () {
  "use strict";

  var TEILE = {
    hoch:     { name: "Hoch",     folien: "Folien 1–6" },
    hass:     { name: "Hass",     folien: "Folien 7–11" },
    bergmann: { name: "Bergmann", folien: "Folien 12–16" }
  };
  var REIHENFOLGE = ["hoch", "hass", "bergmann"];
  var BUCHSTABEN = ["A", "B", "C", "D"];
  var SPEICHER = "bfwQuizBestwert";

  var alleFragen = window.QUIZ_FRAGEN;
  var bereich = document.getElementById("quiz");
  var runde = [];       // Fragen dieser Runde mit gemischten Antworten
  var pos = 0;
  var ergebnisse = [];  // { frage, gewaehlt, richtig }
  var beantwortet = false;

  function mischen(liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  function marke(teil, zusatz) {
    var m = el("span", "marke teil-" + teil, TEILE[teil].name + (zusatz ? " · " + zusatz : ""));
    return m;
  }

  function anzahlJeTeil(fragen) {
    var z = { hoch: 0, hass: 0, bergmann: 0 };
    fragen.forEach(function (f) { z[f.teil]++; });
    return z;
  }

  function bestwert() {
    try { return JSON.parse(localStorage.getItem(SPEICHER)); } catch (e) { return null; }
  }

  // ---------- Startseite ----------
  function zeigeStart() {
    bereich.innerHTML = "";
    var karte = el("div", "quiz-karte");
    karte.appendChild(el("h2", null, "So funktioniert’s"));
    karte.appendChild(el("p", null,
      "Jeder von uns muss das ganze Projekt kennen – darum beantwortet jeder alle " + alleFragen.length +
      " Fragen. Die Farbe zeigt, wessen Thema die Frage ist."));

    var legende = el("div", "legende");
    var z = anzahlJeTeil(alleFragen);
    REIHENFOLGE.forEach(function (t) {
      legende.appendChild(marke(t, TEILE[t].folien + " · " + z[t] + " Fragen"));
    });
    karte.appendChild(legende);

    karte.appendChild(el("p", "hinweis",
      "Antwort anklicken oder Taste 1–4 bzw. A–D drücken. Weiter mit Enter. Nach jeder Antwort kommt eine kurze Erklärung."));

    var opt = el("div", "optionen");
    var label = el("label");
    var box = el("input"); box.type = "checkbox"; box.id = "mischen"; box.checked = true;
    label.appendChild(box);
    label.appendChild(document.createTextNode(" Fragen mischen (sonst in Folien-Reihenfolge)"));
    opt.appendChild(label);
    karte.appendChild(opt);

    var b = bestwert();
    if (b) karte.appendChild(el("p", "hinweis", "Dein bestes Ergebnis auf diesem Gerät: " + b.richtig + " von " + b.gesamt + " (" + b.datum + ")"));

    var fuss = el("div", "quiz-fuss");
    var start = el("button", "knopf primaer", "Quiz starten");
    start.addEventListener("click", function () { starteRunde(alleFragen, box.checked); });
    fuss.appendChild(start);
    karte.appendChild(fuss);
    bereich.appendChild(karte);
    start.focus();
  }

  // ---------- Runde ----------
  function starteRunde(fragen, gemischt) {
    var liste = gemischt ? mischen(fragen) : fragen.slice();
    runde = liste.map(function (f) {
      var optionen = mischen(f.a.map(function (text, i) { return { text: text, richtig: i === 0 }; }));
      return { quelle: f, optionen: optionen };
    });
    pos = 0;
    ergebnisse = [];
    zeigeFrage();
  }

  function zeigeFrage() {
    beantwortet = false;
    var r = runde[pos];
    var f = r.quelle;
    bereich.innerHTML = "";

    var karte = el("div", "quiz-karte teil-" + f.teil);
    var kopf = el("div", "quiz-kopf");
    var links = el("div");
    links.appendChild(marke(f.teil, f.folie));
    kopf.appendChild(links);
    kopf.appendChild(el("span", null, "Frage " + (pos + 1) + " von " + runde.length));
    karte.appendChild(kopf);

    var fort = el("div", "fortschritt");
    var balken = el("div");
    balken.style.width = (pos / runde.length * 100) + "%";
    fort.appendChild(balken);
    karte.appendChild(fort);

    karte.appendChild(el("h2", "quiz-frage", f.q));

    var antworten = el("div", "antworten");
    r.optionen.forEach(function (o, i) {
      var knopf = el("button", "antwort");
      knopf.type = "button";
      knopf.appendChild(el("span", "buchstabe-klein", BUCHSTABEN[i]));
      knopf.appendChild(el("span", null, o.text));
      knopf.addEventListener("click", function () { waehle(i); });
      antworten.appendChild(knopf);
    });
    karte.appendChild(antworten);

    karte.appendChild(el("div", "platz-erklaerung"));
    var fuss = el("div", "quiz-fuss");
    var abbrechen = el("button", "knopf", "Abbrechen");
    abbrechen.addEventListener("click", function () {
      if (confirm("Quiz abbrechen? Der Fortschritt dieser Runde geht verloren.")) zeigeStart();
    });
    fuss.appendChild(abbrechen);
    karte.appendChild(fuss);
    bereich.appendChild(karte);
  }

  function waehle(i) {
    if (beantwortet) return;
    beantwortet = true;
    var r = runde[pos];
    var gewaehlt = r.optionen[i];
    var richtigIndex = r.optionen.findIndex(function (o) { return o.richtig; });
    ergebnisse.push({ frage: r.quelle, gewaehlt: gewaehlt.text, richtig: gewaehlt.richtig });

    var knoepfe = bereich.querySelectorAll(".antwort");
    knoepfe.forEach(function (k, j) {
      k.disabled = true;
      if (j === richtigIndex) k.classList.add("richtig");
      else if (j === i) k.classList.add("falsch");
    });

    var box = el("div", "erklaerung");
    box.appendChild(el("strong", null, gewaehlt.richtig ? "✓ Richtig!" : "✗ Leider falsch – richtig ist " + BUCHSTABEN[richtigIndex] + "."));
    box.appendChild(document.createTextNode(r.quelle.e));
    var platz = bereich.querySelector(".platz-erklaerung");
    platz.appendChild(box);

    var fuss = bereich.querySelector(".quiz-fuss");
    var weiter = el("button", "knopf primaer", pos + 1 < runde.length ? "Weiter →" : "Ergebnis ansehen");
    weiter.addEventListener("click", naechste);
    fuss.appendChild(weiter);
    weiter.focus();
  }

  function naechste() {
    if (!beantwortet) return;
    pos++;
    if (pos < runde.length) zeigeFrage();
    else zeigeErgebnis();
    window.scrollTo(0, 0);
  }

  // ---------- Ergebnis ----------
  function zeigeErgebnis() {
    bereich.innerHTML = "";
    var richtig = ergebnisse.filter(function (e) { return e.richtig; }).length;
    var gesamt = ergebnisse.length;
    var prozent = Math.round(richtig / gesamt * 100);

    if (gesamt === alleFragen.length) {
      var b = bestwert();
      if (!b || richtig > b.richtig) {
        try {
          localStorage.setItem(SPEICHER, JSON.stringify({ richtig: richtig, gesamt: gesamt, datum: new Date().toLocaleDateString("de-DE") }));
        } catch (e) { /* privater Modus: Bestwert wird nicht gespeichert */ }
      }
    }

    var karte = el("div", "quiz-karte");
    karte.appendChild(el("h2", null, "Ergebnis"));
    karte.appendChild(el("div", "ergebnis-zahl", richtig + " / " + gesamt));
    karte.appendChild(el("p", null, prozent + " % richtig – " + (
      prozent >= 90 ? "super, du bist bereit fürs Fachgespräch!" :
      prozent >= 70 ? "gut! Übe die falschen Fragen noch einmal." :
      "da geht noch was – lies die Erklärungen und übe die falschen Fragen.")));

    var zeilen = el("div", "teil-zeilen");
    REIHENFOLGE.forEach(function (t) {
      var vomTeil = ergebnisse.filter(function (e) { return e.frage.teil === t; });
      if (!vomTeil.length) return;
      var ok = vomTeil.filter(function (e) { return e.richtig; }).length;
      var zeile = el("div", "teil-zeile teil-" + t);
      zeile.appendChild(marke(t));
      var balken = el("div", "balken");
      var fuell = el("div");
      fuell.style.width = (ok / vomTeil.length * 100) + "%";
      balken.appendChild(fuell);
      zeile.appendChild(balken);
      zeile.appendChild(el("span", "zahl", ok + " / " + vomTeil.length));
      zeilen.appendChild(zeile);
    });
    karte.appendChild(zeilen);

    var falsche = ergebnisse.filter(function (e) { return !e.richtig; });
    if (falsche.length) {
      karte.appendChild(el("h3", null, "Diese Fragen solltest du noch üben"));
      var liste = el("ul", "fehler-liste");
      falsche.forEach(function (e) {
        var li = el("li", "teil-" + e.frage.teil);
        li.appendChild(el("strong", null, e.frage.q));
        li.appendChild(el("div", null, "Richtig: " + e.frage.a[0]));
        li.appendChild(el("small", null, "Deine Antwort: " + e.gewaehlt + " · " + TEILE[e.frage.teil].name + ", " + e.frage.folie));
        liste.appendChild(li);
      });
      karte.appendChild(liste);
    }

    var fuss = el("div", "quiz-fuss");
    if (falsche.length) {
      var nochmal = el("button", "knopf primaer", "Nur die falschen nochmal (" + falsche.length + ")");
      nochmal.addEventListener("click", function () {
        starteRunde(falsche.map(function (e) { return e.frage; }), true);
      });
      fuss.appendChild(nochmal);
    }
    var neu = el("button", "knopf" + (falsche.length ? "" : " primaer"), "Alle Fragen neu starten");
    neu.addEventListener("click", function () { starteRunde(alleFragen, true); });
    fuss.appendChild(neu);
    var zurueck = el("button", "knopf", "Zur Startseite des Quiz");
    zurueck.addEventListener("click", zeigeStart);
    fuss.appendChild(zurueck);
    karte.appendChild(fuss);
    bereich.appendChild(karte);
    fuss.querySelector("button").focus();
  }

  // ---------- Tastatur ----------
  document.addEventListener("keydown", function (ev) {
    if (!bereich.querySelector(".antwort")) return;
    var k = ev.key.toUpperCase();
    var i = "1234".indexOf(k);
    if (i < 0) i = BUCHSTABEN.indexOf(k);
    if (i >= 0 && !beantwortet && i < runde[pos].optionen.length) { ev.preventDefault(); waehle(i); }
    else if (k === "ENTER" && beantwortet && document.activeElement && !document.activeElement.classList.contains("knopf")) { ev.preventDefault(); naechste(); }
  });

  zeigeStart();
})();
