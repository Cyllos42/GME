// ==UserScript==
// @name         Grepolis Map Enhancer BETA
// @author       Cyllos
// @description  Grepolis Map Enhancer by Cyllos BETA VERSION
// @include      http://*.grepolis.com/game/*
// @include      https://*.grepolis.com/game/*
// @exclude      view-source://*
// @exclude      https://classic.grepolis.com/game/*
// @updateURL    https://cyllos.keybase.pub/grepomod_cyllos.user.js
// @downloadURL https://cyllos.keybase.pub/grepomod_cyllos.user.js
// @version      1.2-BETA
// @grant        none
// ==/UserScript==
(
  function() {
    console.log("GME: Starting Grepolis Map Enhancer");
    setCSS();
    createAwesomeNotification("", "You are using BETA Grepolis Map Enhancer!");
    initMapTownFeature();
    console.log("GME: Succesfully loaded Grepolis Map Enhancer! Player ID: " + Game.player_id);
  })();

function setCSS() {
  var css = [
    ".grcrtpoints {",
    "	color: white !important ;",
    "	font-size: 9px !important ;",
    "}",
    "",
    "#map .badge.claim{",
    "	animation: blink-animation 2s steps(30, start) infinite;",
    "}",
    "@keyframes blink-animation {",
    "50% {",
    "    opacity: 0.0;",
    "  }",
    "}",
    "",
    ".RepConvON {",
    "	opacity: 0.04 !important;",
    "}",
    ".tile.lvl1 {",
    "	opacity: 0.6;",
    "}",
    "",
    ".tile.lvl2 {",
    "	opacity: 0.7;",
    "}",
    "",
    ".tile.lvl3 {",
    "	border: 3px rgba(255,255,255,0.2) solid;",
    "}",
    "",
    ".tile.lvl4 {",
    "	border: 3px rgba(255,255,255,0.2) solid;",
    "}",
    "",
    ".tile.lvl5 {",
    "	border: 3px rgba(255,255,255,0.7) solid;",
    // "	border: 3px " + RepConvTool.hexToRGB(require("helpers/default_colors").getDefaultColorForPlayer(Game.player_id)) + " solid;",
    "}",
    "",
    "#questlog .questlog_icon {",
    " background-color: rgba(0, 0, 0, 0);",
    " background-image: url('https://cyllos.keybase.pub/questionlog.png');",
    "}",
    "",
    ".tile.farm_town {",
    "	border: none;",
    "}",
    "#map_towns .flag .alliance_name {",
    "position: absolute;",
    "top: -17px;",
    "left: -63px;",
    "width: 130px;",
    "color: white;",
    "text-align: center;",
    "display: block;",
    "background: rgba(0,0,0,0.3);",
    "}"
  ].join("\n");

  var node = document.createElement("style");
  node.type = "text/css";
  node.appendChild(document.createTextNode(css));
  var heads = document.getElementsByTagName("head");
  if (heads.length > 0) {
    heads[0].appendChild(node);
  } else {
    // no head yet, stick it whereever
    document.documentElement.appendChild(node);
    // }
  }
  console.log("GME: Added CSS");
}

function createAwesomeNotification(var1, var2) {
  var var3 = (typeof Layout['notify'] == 'undefined') ? new NotificationHandler() : Layout;
  var3['notify']($('#notification_area>.notification')['length'] + 1, var1, '<span><b>' + 'Grepolis Map Enhancer' + '</b></span>' + var2 + '<span class=\'small notification_date\'>' + ' </span>')
}

function town_map_info(var1, var3) {
  if (var1 != undefined && var1['length'] > 0 && var3['player_name']) {
    for (var var2 = 0; var2 < var1['length']; var2++) {
      if (var1[var2]['className'] == 'flag town') {
        if (typeof Assistant !== 'undefined') {
          if (Assistant['settings']['town_names']) {
            $(var1[var2])['addClass']('active_town')
          };
          if (Assistant['settings']['player_name']) {
            $(var1[var2])['addClass']('active_player')
          };
          if (Assistant['settings']['alliance_name']) {
            $(var1[var2])['addClass']('active_alliance')
          }
        };
        // $(var1[var2])['append']('<div class="player_name">' + (var3['player_name'] || '') + '</div>');
        // $(var1[var2])['append']('<div class="town_name">' + var3['name'] + '</div>');
        exec(function() {
          alert(require("helpers/default_colors").getDefaultColorForPlayer(Game.player_id));
        });
        $(var1[var2])['append']('<div class="alliance_name">' + (var3['alliance_name'] || '') + '</div>');
        break
      }
    }
  };
  return var1
}

function initMapTownFeature() {
  console.log("GME: Adding town tags");
  var var1 = function(var10) {
    return function() {
      var var1 = var10['apply'](this, arguments);
      return town_map_info(var1, arguments[0]);
    }
  };
  MapTiles['createTownDiv'] = var1(MapTiles['createTownDiv'])
}

function exec(fn) {
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = '(' + fn + ')();';
  document.body.appendChild(script); // run the script
  document.body.removeChild(script); // clean up
}
