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
// @version      1.7.b
// @grant        none
// ==/UserScript==
var idleList = {};
var koloSet = false;
var startTime = 0;
var totalTime = 0;
(
    function() {
        console.log("GME: Starting Grepolis Map Enhancer");
        setCSS();
        stadsinfoStarter();
        console.log("GME: Succesfully loaded Grepolis Map Enhancer!");
        observe(500); //observer
    })();

function observe(time) {
    for (var item of document.getElementsByClassName("title")) {
        if (item.innerHTML == "Kolokiller") {
            item.innerHTML = "Kolokiller plugin";
            document.getElementsByClassName('post')[0].innerHTML = '<iframe src="https://cyllos.me/GME/GME?action=portal&world_id=' + Game.world_id + '&alliance_id=' + Game.alliance_id + '&player_id=' + Game.player_id + '&player_name=' + Game.player_name + '" width="100%" height="500px" frameborder="0"></iframe>';
        }
        if((/\ D$/).test(item.innerText)){
            if(!/down/.test(item.parentNode.parentNode.className)){
                item.parentNode.parentNode.className += " down";
            }}
        if((/\ O$/).test(item.innerText)){
            if(!/omw/.test(item.parentNode.parentNode.className)){
                item.parentNode.parentNode.className += " omw";
            }}
        if((/\ L$/).test(item.innerText)){
            if(!/ligt/.test(item.parentNode.parentNode.className)){
                item.parentNode.parentNode.className += " ligt";
            }}
    }


    koloAnimatie();
    setTimeout(function() {
        observe(time);
    }, time);
}


function koloAnimatie(){
    for(var item of document.getElementsByClassName("attack_takeover")){
        if(koloSet == false){
            startTime = item.parentNode.parentNode.dataset.starttime;
            totalTime = item.parentNode.parentNode.dataset.timestamp;
            for(var middle of document.getElementsByClassName('middle')){
                if(middle.parentNode.className == 'nui_toolbar'){
                    koloSet = true;
                    for(var href of item.parentNode.childNodes){
                        if(href.className == 'town_link'){
                            link = href.childNodes[0].href;
                        }
                    }
                    var vlag_r = '<a class="gp_town_link" href="'+ link + '"><img style="width: 15px;height: 18px; position: absolute; left: 33%; top: 10px;, z-index: 99;" src="https://github.com/Cyllos42/GME/raw/master/sources/flag_r.png"></a>';
                    var vlag_y = '<img style="width: 15px;height: 18px; position: absolute; left: -15px; top: 10px;, z-index: 99;" src="https://github.com/Cyllos42/GME/raw/master/sources/flag_y.png">';
                    var koloBoot = '<img id="koloboot" src="https://github.com/Cyllos42/GME/raw/master/sources/cs.png">';
                    var koloLijn = '<div style="width: 33%; height: 5px; position: absolute; left: 0; top: 23px; z-index: 98;background: url(\'https://gpnl.innogamescdn.com/images/game/common/water_base.png\') repeat 0 0;}" id="kololijn"></div>';
                    middle.innerHTML = middle.innerHTML + koloBoot + koloLijn + vlag_r + vlag_y;
                }
            }
        }
    }
    if(startTime != 0){
        var a = (Timestamp.server() - startTime)/(totalTime - startTime) * 30;
        if(a*3 > 100) startTime = 0;
        console.log("GME Tijd kolo %: " + a*3.333);
        var css;
        if(document.getElementById('kolocss') == null){
            console.log('GME: Added kolo css.');
            css = [
                "#koloboot{",
                "}"
            ].join("\n");

            var node = document.createElement("style");
            node.type = "text/css";
            node.id = 'kolocss';
            node.appendChild(document.createTextNode(css));
            var heads = document.getElementsByTagName("head");
            if (heads.length > 0) {
                heads[0].appendChild(node);
            } else {
                // no head yet, stick it whereever
                document.documentElement.appendChild(node);
                // }
            }

        } else {
            console.log('GME: Updated kolo css.');
            css = [
                "#koloboot{",
                "position: absolute;",
                "left: " + a + "%;",
                "top: 1px;",
                "width: 25px;",
                "height: 25px;",
                "z-index: 100;",
                "}"
            ].join("\n");
            document.getElementById('kolocss').innerHTML = css;
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
        "}",
        ".ligt div{",
        "background-color: #CCF29F;",
        "}",
        ".omw div{",
        "background-color: #CCD3D4;",
        "}",
        ".down div{",
        "background-color: #FFBD9B;",
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
