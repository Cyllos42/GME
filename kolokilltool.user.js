// ==UserScript==
// @name         Grepolis Map Enhancer [KOLOKILL ONLY]
// @author       Cyllos
// @description  Grepolis Map Enhancer by Cyllos
// @include      http://*.grepolis.com/game/*
// @include      https://*.grepolis.com/game/*
// @exclude      view-source://*
// @exclude      https://classic.grepolis.com/game/*
// @updateURL    https://github.com/Cyllos42/GME/raw/master/kolokilltool.meta.js
// @downloadURL  https://github.com/Cyllos42/GME/raw/master/kolokilltool.user.js
// @icon         https://github.com/Cyllos42/GME/raw/master/sources/logo.png
// @version      1.5.d
// @grant        none
// ==/UserScript==
var idleList = {};
(
    function() {
        observe(500); //Kolokill observer
    })();

function observe(time) {
    if(document.getElementsByClassName("title")[0] != null
      && document.getElementsByClassName("title")[0].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[1] != null
      && document.getElementsByClassName("title")[1].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[2] != null
      && document.getElementsByClassName("title")[2].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[3] != null
      && document.getElementsByClassName("title")[3].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[4] != null
      && document.getElementsByClassName("title")[4].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[5] != null
      && document.getElementsByClassName("title")[5].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[6] != null
      && document.getElementsByClassName("title")[6].innerHTML == "Kolokiller"
      || document.getElementsByClassName("title")[7] != null
      && document.getElementsByClassName("title")[7].innerHTML == "Kolokiller"){
        if (document.getElementsByClassName("title")[0].innerHTML == "Kolokiller"){
            document.getElementsByClassName("title")[0].innerHTML = 'Kolokiller plugin';
        } else if(document.getElementsByClassName("title")[1].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[1].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[2].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[2].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[3].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[3].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[4].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[4].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[5].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[5].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[6].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[6].innerHTML = "Kolokiller plugin";
        }else if(document.getElementsByClassName("title")[7].innerHTML == "Kolokiller") {
            document.getElementsByClassName("title")[7].innerHTML = "Kolokiller plugin";
        }
        document.getElementsByClassName('post')[0].innerHTML = '<iframe src="https://cyllos.me/GME/GME?action=portal&world_id=' + Game.world_id + '&alliance_id=' + Game.alliance_id + '&player_id=' + Game.player_id + '&player_name=' + Game.player_name + '" width="100%" height="500px"></iframe>';
        checkKolo(1000);
    }
    setTimeout(function() {
        observe(time);
    }, time);
}



function checkKolo(time){
  if(document.getElementsByClassName("title")[0] != null
    && document.getElementsByClassName("title")[0].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[1] != null
    && document.getElementsByClassName("title")[1].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[2] != null
    && document.getElementsByClassName("title")[2].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[3] != null
    && document.getElementsByClassName("title")[3].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[4] != null
    && document.getElementsByClassName("title")[4].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[5] != null
    && document.getElementsByClassName("title")[5].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[6] != null
    && document.getElementsByClassName("title")[6].innerHTML == "Kolokiller"
    || document.getElementsByClassName("title")[7] != null
    && document.getElementsByClassName("title")[7].innerHTML == "Kolokiller"){
      setTimeout(function() {
            return checkKolo(time);
        }, time);
    } else {
        return false;
    }

}


function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script); // run the script
    document.body.removeChild(script); // clean up
}
