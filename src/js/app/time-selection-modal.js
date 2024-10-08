const $ = require('jquery');
import { getPlayer } from './player/player';
import { insertTimestamp, convertTimestampToSeconds, formatMilliseconds } from './timestamps';

let timeSelectionModalActive = false;
const $timeSelection = $('.controls .time-selection');
let rangeBackup = {}; //for backup the cursor position, apply with getCursor && setCursor

/**
 * get the current cursor position
 * @since 2024.08.12
 */
const getCursor = () => {
	if (window.getSelection && window.getSelection().rangeCount) {
		const range = window.getSelection().getRangeAt(0);
		rangeBackup = {
			node: range.startContainer,
			startOffset: range.startOffset,
			endOffset: range.endOffset
		};
	}
	//console.log('get: ', rangeBackup);
}
/**
 * recover the current cursor position
 * @since 2024.08.12
 */
const setCursor = () => {
	if(rangeBackup && rangeBackup.node) {
		const range = document.createRange();
		range.setStart(rangeBackup.node, rangeBackup.startOffset);
		range.setEnd(rangeBackup.node, rangeBackup.endOffset);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
	//console.log('set: ', rangeBackup);
}

const hide = () => {
	setCursor(); //restore the cursor
    timeSelectionModalActive = false;
    $('.controls .time-selection').removeClass('active');	
}

const show = () => {
    timeSelectionModalActive = true;
    const player = getPlayer();
	getCursor();	//save the cursor

    if (timeSelectionModalActive === true) {
        $timeSelection.addClass('active');
        $timeSelection.find('input')
            .off()
            .val(formatMilliseconds(player.getTime()))
            .keyup(onTimeSelectionModalSubmit)
            .focus()
            .select();
    } else {
        $('.controls .time-selection').removeClass('active');
    }

    function onTimeSelectionModalSubmit(ev) {
        if (ev.keyCode === 13) { // return key
            const time = $(this).val();
            if (time.indexOf(':') > -1) {
                player.setTime(convertTimestampToSeconds(time));
            } else {
                // assume user is thinking in minutes
                player.setTime(parseFloat(time) * 60);
            }
            hide();
			//setCursor(); //restore the cursor
        }
    }
}

const toggle = () => {
    if (timeSelectionModalActive) {
        hide();		
    } else {
        show();
    }	
}

export default {
    toggle, show, hide, getCursor, setCursor
}
