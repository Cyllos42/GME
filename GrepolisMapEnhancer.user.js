// ==UserScript==
// @name         Grepolis Map Enhancer
// @author       Cyllos
// @description  Grepolis Map Enhancer by Cyllos
// @include      http://*.grepolis.com/game/*
// @include      https://*.grepolis.com/game/*
// @exclude      view-source://*
// @exclude      https://classic.grepolis.com/game/*
// @updateURL    https://github.com/Cyllos42/GME/raw/master/GrepolisMapEnhancer.meta.js
// @downloadURL  https://github.com/Cyllos42/GME/raw/master/GrepolisMapEnhancer.user.js
// @icon         https://github.com/Cyllos42/GME/raw/master/sources/logo.png
// @version      1.4.a
// @grant        none
// ==/UserScript==
var idleList = {};
(
    function() {
        console.log("GME: Starting Grepolis Map Enhancer");
        setCSS();
        stadsinfoStarter();
        console.log("GME: Succesfully loaded Grepolis Map Enhancer!");
        // observe(500); //Kolokill observer
    })();

function observe(time) {
    console.log('GME: Entering observe');
        if(document.getElementsByClassName("title")[0] != null && document.getElementsByClassName("title")[0].innerHTML == "Kolokiller"){
            console.log('GME: Found kolo kill topic');
            document.getElementsByClassName("title")[0].innerHTML = 'Kolokiller plugin';
            document.getElementById("postlist").innerHTML = '<iframe src="https://gme.cyllos.me/Site?action=koloKill&allianceid=' + Game.alliance_id + '&playerid=' + Game.player_id + '&playername=' + Game.player_name + '" width="100%" height="100%"></iframe>';
        }
        setTimeout(function() {
                observe(time);
            }, time);
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function setCSS() {
    var css = [
        "input {",
        " color: black;",
        "}",
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
        "#questlog .questlog_icon {",
        " background-color: rgba(0, 0, 0, 0);",
        " background-image: url('https://github.com/Cyllos42/GME/raw/master/sources/questionlog.png');",
        "}",
        "",
        ".tile.farm_town {",
        "	border: none;",
        "}",
        ".attack_planner li.selected {",
        "background: sandybrown;",
        "}",
        "#map_towns .flag .alliance_name {",
        "opacity: 0.8;",
        "position: absolute;",
        "top: -17px;",
        "left: -58px;",
        "width: 110px;",
        "color: white;",
        "text-align: center;",
        "display: block;",
        "font-size: x-small;",
        "text-shadow: 1px 1px rgba(0,0,0,0.7);",
        "}",
        "",
        ".crm_icon {",
        "	display: none;",
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
    var var3 = (typeof Layout.notify == 'undefined') ? new NotificationHandler() : Layout;
    var3.notify($('#notification_area>.notification').length + 1, var1, '<span><b>' + 'Grepolis Map Enhancer' + '</b></span>' + var2 + '<span class=\'small notification_date\'>' + ' </span>');
}

function getidleList() {
    return $.ajax({
        url: "https://www.grcrt.net/json.php",
        method: "get",
        data: {
            method: "getIdleJSON",
            world: Game.world_id
        },
        cache: !0
    });
}

function stadsinfo(var1, var3, data) {

    if (var1 != undefined && var1.length > 0 && var3.player_id) {
        for (var var2 = 0; var2 < var1.length; var2++) {
            if (var1[var2].className == 'flag town') {
                var border = "";
                var inactive = "";
                if (data.JSON[var3.player_id] > 0.5 && data.JSON[var3.player_id] < 7) {
                    inactive = "(" + parseInt(data.JSON[var3.player_id]) + "d)";
                    border = "border: rgba(255, 0, 0, 1) solid 2px;";
                } else {
                    border = " ";
                    inactive = " ";
                }
                $(var1[var2]).append('<div class="alliance_name" style="background-color: inherit;' + border + '">' + (var3.alliance_name || '') + " " + inactive + '</div>');
                break;
            }
        }
    }
    return var1;
}

function stadsinfoStarter() {
    idleList = getidleList();
    idleList.success(function(data) {
        console.log("GME: Adding town tags");
        var var1 = function(var10) {
            return function() {
                var var1 = var10.apply(this, arguments);
                return stadsinfo(var1, arguments[0], data);
            };
        };
        MapTiles.createTownDiv = var1(MapTiles.createTownDiv);
    });
}

function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script); // run the script
    document.body.removeChild(script); // clean up
}
