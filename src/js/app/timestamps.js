import {getPlayer} from './player/player';

function getTime(){
    // get timestamp
    const player = getPlayer();
    let time = 0;
    if (player) {
        time = player.getTime();
    }

    return {
        formatted: formatMilliseconds(time),
        raw: time
    };
};

function formatMilliseconds(time) {
    const hours = Math.floor(time / 3600).toString();
    const minutes = ("0" + Math.floor(time / 60) % 60).slice(-2);
    const seconds = ("0" + Math.floor( time % 60 )).slice(-2);
    let formatted = minutes+":"+seconds;
    if (hours !== '0') {
        formatted = hours + ":" + minutes + ":" + seconds;
    }
    formatted = formatted.replace(/\s/g,'');
    return formatted;
}

// http://stackoverflow.com/a/25943182
function insertHTML(newElement) {
    var sel, range;
    if (window.getSelection && (sel = window.getSelection()).rangeCount) {
        range = sel.getRangeAt(0);
        range.collapse(true);
        range.insertNode(newElement);

        // Move the caret immediately after the inserted span
        range.setStartAfter(newElement);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}


/**
 * auto move cursor to next paragraph and auto scroll down
 * add auto=1 at URL to enable this feature
 * @since 2024.08.04
 */
function autoMoveToNext() {
  const enableAuto = (new URLSearchParams(window.location.search)).get('auto');
  if(!enableAuto || enableAuto=='false') return;
  var anchorNode = document.getSelection().anchorNode;
  //console.log(anchorNode);
  //console.log(anchorNode.nextSibling);
  if(anchorNode.nextSibling && anchorNode.nextSibling.tagName == 'BR') {
	if(anchorNode.nextSibling.nextSibling) {
      anchorNode = anchorNode.nextSibling.nextSibling;
	  //console.log('nextSibling: ',anchorNode);
	} else {
	  anchorNode = anchorNode.parentElement;	
    }
  }
  if(!anchorNode || (anchorNode && !anchorNode.nextElementSibling && (anchorNode.parentElement && !anchorNode.parentElement.nextElementSibling) ) ) {
	  console.log('next element not found');
	  return;
  }
  //if(typeof(anchorNode.innerHTML)=='undefined') {
  if(!anchorNode || !anchorNode.nextElementSibling) {
    anchorNode = anchorNode.parentElement;
  }
  var nextOne = anchorNode.nextElementSibling
  //console.log(anchorNode, nextOne);
  var range = document.createRange();
  range.setStart(nextOne, 0);
  range.setEnd(nextOne, 0);
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  var height = parseInt(getComputedStyle(anchorNode).getPropertyValue("height"));
  var p = document.querySelector('.textbox-container');
  p.scrollBy(0, height);
};

function insertTimestamp(){
    var time = getTime();
    if (time) {
        const space = document.createTextNode("\u00A0");
		
		//add by gsyan
		const br = document.createElement('br');
		insertHTML(br);
		//const br2 = document.createElement('br');
		//insertHTML(br2);	
		
        insertHTML(createTimestampEl(time));
        insertHTML(space);
        activateTimestamps();
		autoMoveToNext(); //add by gsyan
    }
}

function createTimestampEl(time) {
    const timestamp = document.createElement('span');
    timestamp.innerText = time.formatted;
    timestamp.className = 'timestamp';
    timestamp.setAttribute('contenteditable', 'false');
    timestamp.setAttribute('data-timestamp', time.raw);
    return timestamp;
}

function activateTimestamps(){
    Array.from(document.querySelectorAll('.timestamp')).forEach(el => {
        el.contentEditable = false;
        el.removeEventListener('click', onClick);
        el.addEventListener('click', onClick);
    });
}

function onClick() {
    const player = getPlayer();
    var time = this.dataset.timestamp;
    if (player) {
        if (typeof time === 'string' && time.indexOf(':') > -1) {
            // backwards compatibility, as old timestamps have string rather than number
            player.setTime(convertTimestampToSeconds(time));
        } else {
            player.setTime( time );
        }
		//play the media at current time
		if(player.getStatus()!='playing') {
			//setTimeout(function() {				
			//	player.play();
			//}, 500);
			player.driver.play();
		}
		//the clicked timestamp element add 'timestamp-current'
		const cName = 'timestamp-current';
		const current = document.querySelectorAll('.'+cName);
		if(current) {
			for(var i=0; i<current.length; i++) {
				current[i].classList.remove(cName);
			}
		}
		this.classList.add(cName);
    } else {
		const lang = (localStorageManager.getItem('oTranscribe-language') || navigator.language || navigator.userLanguage);
		if(lang.match(/^zh-/i)) {
			alert('請先選擇聲音(影片)檔案，或是YouTube影片，才能播放聲音。');
		} else {
			alert('Please choose audio(or video) file, or YouTube video to play the audio.');
		}
	}		
}

// backwards compatibility, as old timestamps use setFromTimestamp() and ts.setFrom()
window.setFromTimestamp = function(clickts, element){
    window.ts.setFrom(clickts, element);
}
window.ts = {
    setFrom: function(clickts, element){
        const player = getPlayer();
        var time = this.dataset.timestamp;
        if (player && element.childNodes.length == 1) {
            player.setTime( convertTimestampToSeconds(time) );
        }
    }
}

function convertTimestampToSeconds(hms) {
    var a = hms.split(':');
    if (a.length === 3) {
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    }
    return (+a[0]) * 60 + (+a[1]);
}

export {activateTimestamps, insertTimestamp, convertTimestampToSeconds, formatMilliseconds};
