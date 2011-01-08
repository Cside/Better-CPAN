Node.prototype.insertAfter = function(node, referenceNode) {
    this.insertBefore(node, referenceNode.nextSibling);
};

function getBugInfo(url, callback) {
    var testResults;
    var reportBugs;
    chrome.extension.sendRequest(url, function onSuccess(res) {
        var tmp = document.createElement('div');
        tmp.innerHTML = res;

        Array.prototype.slice.apply(tmp.querySelector('table').querySelectorAll('tr')).forEach(function(tr) {
            var label = tr.querySelector('td.label');
            if (label) {
                var rowTitle = label.innerText;
                if (rowTitle == 'Links') {
                    reportBugs  = tr.querySelector('small').childNodes[3].textContent.substring(5);
                } else if (rowTitle == 'CPAN Testers') {
                    var tmp = tr.querySelector('small').childNodes[0].textContent.replace(/\s{2,}/g, " ");
                    testResults = tmp.substring(1, tmp.length - 3);
                }
            }
        });
        var result = { 'testResults': testResults, 'reportBugs' : reportBugs };
        callback(result);
    });
}

function checkYear(date) {
    var d = new Date();
    var yearNow = d.getFullYear();
    var year = date.textContent.split(' ')[2];
    var mon  = date.textContent.split(' ')[1];
    monToInt = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
    var diff = yearNow - (+year + monToInt[mon] / 12);

    if (diff >= 2 && diff < 4) {
        date.style.backgroundColor = '#ffe5e9';
    } else if (diff >= 4 && diff < 6) {
        date.style.backgroundColor = '#ffccd3';
    } else if (diff >= 6 && diff < 8) {
        date.style.backgroundColor = '#ffb2bc';
    } else if (diff >= 8 && diff < 10) {
        date.style.backgroundColor = '#ff99a6';
    } else if (diff >= 10) {
        date.style.backgroundColor = '#ff7f90';
    }
}

(function() {
    Array.prototype.slice.apply(document.querySelectorAll('h2')).forEach(function(h2){
        var title = h2;
        var descr = h2.nextSibling.nextSibling;
        var row3  = h2.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;

        if (row3.nodeName == '#text') row3 = descr;
        var latestVer = row3.childNodes[1];
        row3.parentNode.insertAfter(document.createElement('small'), row3);
        var row4  = row3.nextSibling;

        var date = row3.querySelector('.date');
        checkYear(date);

        row3.parentNode.insertBefore(document.createElement('br'), row4);

        function onGet() {
            getBugInfo(latestVer.href, function(result){
                row4.appendChild(document.createTextNode(result.testResults));
                row4.appendChild(document.createTextNode(' - '));
                row4.appendChild(document.createTextNode(result.reportBugs));
                row4.innerHTML = row4.textContent.replace(/\((.{1,3})\)/g, '(<b>$1</b>)');
                row4.style.backgroundColor = '#ffffe5';
            });
        }
        setTimeout(onGet, 0);
    });
})();


