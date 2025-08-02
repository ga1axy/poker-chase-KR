// ==UserScript==
// @name         Poker Chase - KR patch
// @namespace    http://tampermonkey.net/
// @version      2025-08-02
// @description  try to take over the world!
// @author       ga1axy
// @match        https://game.poker-chase.com/play/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=poker-chase.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    var patched = false;
    let replace_text = [[/text_key,jp,kr/g, 'text_key,kr,jp'], [/"\[""jp"",""kr""\]"/g, '"[""kr"",""jp""]"']];

    function kr_patch(st, key) {
        st.get(key).onsuccess = function(event) {
            var text = new TextDecoder().decode(event.target.result.contents);
            for (var index = 0; index < replace_text.length; index++) {
                if (text.match(replace_text[index][0])) {
                    text = text.replaceAll(replace_text[index][0], replace_text[index][1]);
                    event.target.result.contents = new TextEncoder().encode(text);
                    st.put(event.target.result, key).onsuccess = function (event) {
                        patched = true;
                        console.log("Poker Chase - KR patched: " + key);
                    }
                }
            }
        }
    };

    let db;
    let request;
    let transaction;
    let store;

    request = window.indexedDB.open("/idbfs");
    request.onerror = function(error) {
        console.log("open error(indexedDB-/idbfs): " + error.target.errorCode)
    } ;
    request.onsuccess = function(event) {
        db = event.target.result;
        transaction = db.transaction("FILE_DATA", "readwrite");
        transaction.oncomplete = function(event) {
            db.close();
            console.log("db close(oncomplete)");
            // window.location.reload()
        };
        transaction.onerror = function(error) {
            db.close();
            console.log("transaction.onerror(): " + error.target.errorCode)
        };
        store = transaction.objectStore("FILE_DATA");
        store.getAllKeys().onsuccess = function(event) {
            let rows = event.target.result;
            for (var index = 0; index < rows.length; index++) {
                if (rows[index].match(/\.csv/)) {
                    kr_patch(store, rows[index]);
                }
            }
            if (patched) {
                window.location.reload();
            }
        }
    }

})();