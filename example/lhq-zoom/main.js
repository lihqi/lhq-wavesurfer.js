'use strict';

// Create an instance
var wavesurfer;
// 触发一次窗口的reisze事件，解决 WaveSurfer 不自动调整宽度的问题
const dispatchResizeEvent = () => {
    const e = document.createEvent('Event');
    e.initEvent('resize', true, true);
    window.dispatchEvent(e);
};


function formatTimeCallback(seconds, pxPerSec) {
    seconds = Number(seconds);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // fill up seconds with zeroes
    let secondsStr = Math.round(seconds).toString();
    if (pxPerSec >= 25 * 10) {
        secondsStr = seconds.toFixed(2);
    } else if (pxPerSec >= 25 * 1) {
        secondsStr = seconds.toFixed(1);
    }

    if (minutes > 0) {
        if (seconds < 10) {
            secondsStr = '0' + secondsStr;
        }
        return `${minutes}:${secondsStr}`;
    }
    return secondsStr;
}

/**
 * Use timeInterval to set the period between notches, in seconds,
 * adding notches as the number of pixels per second increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param: pxPerSec
 */
function timeInterval(pxPerSec) {
    let retval = 1;
    if (pxPerSec >= 25 * 100) {
        retval = 0.01;
    } else if (pxPerSec >= 25 * 40) {
        retval = 0.025;
    } else if (pxPerSec >= 25 * 10) {
        retval = 0.1;
    } else if (pxPerSec >= 25 * 4) {
        retval = 0.25;
    } else if (pxPerSec >= 25) {
        retval = 1;
    } else if (pxPerSec * 5 >= 25) {
        retval = 5;
    } else if (pxPerSec * 15 >= 25) {
        retval = 15;
    } else {
        retval = Math.ceil(0.5 / pxPerSec) * 60;
    }
    return retval;
}

/**
 * Return the cadence of notches that get labels in the primary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function primaryLabelInterval(pxPerSec) {
    let retval = 1;
    if (pxPerSec >= 25 * 100) {
        retval = 10;
    } else if (pxPerSec >= 25 * 40) {
        retval = 4;
    } else if (pxPerSec >= 25 * 10) {
        retval = 10;
    } else if (pxPerSec >= 25 * 4) {
        retval = 4;
    } else if (pxPerSec >= 25) {
        retval = 1;
    } else if (pxPerSec * 5 >= 25) {
        retval = 5;
    } else if (pxPerSec * 15 >= 25) {
        retval = 15;
    } else {
        retval = Math.ceil(0.5 / pxPerSec) * 60;
    }
    return retval;
}

/**
 * Return the cadence of notches to get labels in the secondary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Secondary labels are drawn after primary labels, so if
 * you want to have labels every 10 seconds and another color labels
 * every 60 seconds, the 60 second labels should be the secondaries.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function secondaryLabelInterval(pxPerSec) {
    // draw one every 10s as an example
    return Math.floor(10 / timeInterval(pxPerSec));
}

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    // Init
    wavesurfer = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        waveColor: '#A8DBA8',
        progressColor: '#3B8686',
        // backend: 'MediaElement',
        scrollParent: false,
        hideScrollbar: true,
        normalize: true,
        responsive: 0,
        plugins: [
            WaveSurfer.regions.create({
                regions: [
                    {
                        start: 0,
                        end: 5,
                        color: 'hsla(400, 100%, 30%, 0.1)'
                    },
                    {
                        start: 10,
                        end: 20,
                        color: 'hsla(200, 50%, 70%, 0.1)'
                    }
                ]
            }),
            WaveSurfer.timeline.create({
                container: '#timeline',
                formatTimeCallback: formatTimeCallback,
                timeInterval: timeInterval,
                primaryLabelInterval: primaryLabelInterval,
                secondaryLabelInterval: secondaryLabelInterval,
            })
        ]
    });

    wavesurfer.on('error', function (e) {
        console.warn(e);
    });

    // Load audio from URL
    wavesurfer.load('../media/阿悠悠-旧梦一场.mp3');

    // Zoom slider
    let slider = document.querySelector('[data-action="zoom"]');

    slider.value = wavesurfer.params.minPxPerSec;
    slider.min = 1;
    // slider.min = wavesurfer.params.minPxPerSec;
    // Allow extreme zoom-in, to see individual samples
    slider.max = 100;

    slider.addEventListener('input', function () {
        // wavesurfer.zoom(Number(this.value));
        console.log(this.value)


        document.querySelector('#waveform').style.width = `${Number(this.value) * 1000}%`
        dispatchResizeEvent()
    });

    // set initial zoom to match slider value
    // wavesurfer.zoom(slider.value);

    // Play button
    let button = document.querySelector('[data-action="play"]');

    button.addEventListener('click', wavesurfer.playPause.bind(wavesurfer));
});
