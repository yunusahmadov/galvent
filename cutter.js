// Galvent Cutter Driver
var umName = 0;
var umCoef = 1.0;
var umCoef2 = 0.423;
var umCoef3 = 3600;
var umDecimals = 3;
var umDecimals2 = 2;
var bRapidG;
var nSheet = 0,
  szMater = "",
  szGauge = "";
var szJob = "",
  szDraw = "",
  szTakeoff = "";
var curX = 0;
var curY = 0; //vars for current position of torch
var curZ = 0;
var bTorch = 0; //0-idling (G00), 1-line cutting (G01)
var bArc = 0;
var ZStart = 10; //Z coordinate at idle speed
var string_number = 5;
var FWork = 15000; //Speed ​​during cutting
var FStart = true;

function OnInit(szJb, szTak) {
  Format(string_number);
  string_number += 5;
  sendfin_boj("G90G80G49", 1);

  Format(string_number);
  string_number += 5;
  sendfin_boj("G0 Z" + um2str(ZStart, umDecimals), 2);

  Format(string_number);
  string_number += 5;
  sendfin_boj("G90.1", 3);

  Format(string_number);
  string_number += 5;
  sendfin_boj("S0", 4);

  Format(string_number);
  string_number += 5;
  sendfin_boj("M5", 5);

  Format(string_number);
  string_number += 5;
  sendfin_boj("G0 Z" + um2str(ZStart, umDecimals), 6);
}

function OnLine(fX, fY, fZ) {
  curX = curX + fX;
  curY = curY + fY;
  if (is_umzero(fX, umDecimals) && is_umzero(fY, umDecimals)) return;

  bArc = 0;

  if (bTorch == 0) {
    Format(string_number);
    string_number += 5;
    send("G0");
    send(" X");
    send(um2str(curX, umDecimals2));
    send(" Y");
    sendfin(um2str(curY, umDecimals2));
  }
  if (bTorch) {
    Format(string_number);
    string_number += 5;

    if (FStart == true) {
      var f3 = get_value("CutSpeed") / umCoef3;
      if (f3 == 0) f3 = FWork;
      send(" F" + um2str(f3, umDecimals2));
      FStart = false;
    }

    send("G1");
    send(" X");
    send(um2str(curX, umDecimals2));
    send(" Y");
    sendfin(um2str(curY, umDecimals2));
  }
}

//Turn on
function OnTorchOn() {
  Format(string_number);
  string_number += 5;

  var f3 = get_value("CutSpeed") / umCoef3;
  if (f3 == 0) f3 = FWork;
  send(" F" + um2str(f3, umDecimals2));

  sendfin("M3");
  //send("G0")

  bTorch = 1;
  FStart = true;
}

//Turn off
function OnTorchOff() {
  Format(string_number);
  string_number += 5;
  sendfin("M5");
  bTorch = 0;
  var z1 = in2um(get_value("HeightMove"), umCoef, umDecimals);
  if (z1 == 0) z1 = ZStart;
  Format(string_number);
  string_number += 5;
  sendfin("G0 Z" + um2str(z1, umDecimals));
}

function OnArc(fEndX, fEndY, fCenterX, fCenterY, fRadius, bCW) {
  curX = curX + fEndX;
  curY = curY + fEndY;

  if (is_umzero(curX, umDecimals) && is_umzero(curY, umDecimals)) return;
  if (is_umzero(fCenterX, umDecimals) && is_umzero(fCenterY, umDecimals))
    return;

  if (bCW == true) {
    Format(string_number);
    string_number += 5;

    if (FStart == true) {
      var f3 = get_value("CutSpeed") / umCoef3;
      if (f3 == 0) f3 = FWork;
      send(" F" + um2str(f3, umDecimals2));
      FStart = false;
    }

    send("G2");
  } else {
    Format(string_number);
    string_number += 5;

    if (FStart == true) {
      var f3 = get_value("CutSpeed") / umCoef3;
      if (f3 == 0) f3 = FWork;
      send(" F" + um2str(f3, umDecimals2));
      FStart = false;
    }

    send("G3");
  }
  bArc = 1;

  send(" X");
  send(um2str(curX, umDecimals2));
  send(" Y");
  send(um2str(curY, umDecimals2));
  send(" I");
  send(um2str(fCenterX, umDecimals2));
  send(" J");
  sendfin(um2str(fCenterY, umDecimals2));
}

function OnDone() {
  Format(string_number);
  string_number += 5;
  sendfin_eoj("M30", 1);
}

function Format(string_number) {
  send("N" + string_number + " ");
}
