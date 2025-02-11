'use strict';

const logTimers = [];

/**
 * Logs message to console with styling.
 * @param {string} message Log message
 * @param {string} label Label prepending log message (useful for filtering) (default is "log:")
 * @param {string} bgColor Background color of log message (default is (black) #000)
 * @param {string} textColor Colour of log message (default is (white) #fff)
 */
export const log = (message = '', label = 'log:', bgColor = '#000', textColor = '#fff') =>
{
    let duration;
    
    if ( logTimers[label] ) {
        duration = (new Date()).getTime() - logTimers[label].getTime();
    } else {
        duration = 0;
    }
    logTimers[label] = (new Date());
    
    let date = new Date();
    let hours   = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    let seconds = ('0' + date.getSeconds()).slice(-2);
    let milliseconds = date.getMilliseconds();
    
    let time = hours + ':' + minutes + ':' + seconds + '.' + milliseconds + ' (' + duration + ' ms)';
    
    console.log(
        '%c%s%c%s%c%s',
        'background-color: #ddd; color: #333; padding: 4px 8px; font-family: monospace;',
        label,
        'background-color: ' + bgColor + '; color: ' + textColor + '; padding: 4px 8px;',
        message,
        'background-color: #ddd; color: #333; padding: 4px 8px; font-family: monospace;',
        ' ' + time,
    );
}

/**
 * Logs warning to console
 * @param message
 * @param label
 * @param bgColor
 * @param textColor
 */
export const logWarning = (message = '', label = 'warning:', bgColor = '#fb0', textColor = '#fff') =>
{
    log(message, label, bgColor, textColor);
}

/**
 * Logs error to console
 * @param message
 * @param label
 * @param bgColor
 * @param textColor
 */
export const logError = (message = '', label = 'error:', bgColor = '#900', textColor = '#fff') =>
{
    log(message, label, bgColor, textColor);
}