'use strict';

export function getHtml(url) {
    let capturedHtml;

    $.ajax({
        url: url,
        dataType: 'html',
        success: function(html) {
            capturedHtml = html;
        },
        async: false
    });

    return $.parseHTML(capturedHtml)[0];
}

export function getInputValueById(id) {
    return getInputValueBy('#' + id);
}

export function getInputValueByName(name) {
    return getInputValueBy(`input[name = "${name}"]`);
}

function getInputValueBy(selectors) {
    return document.querySelector(selectors).value;
}