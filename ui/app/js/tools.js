Array.prototype.empty = function() {
    this.splice(0, this.length);
};

Array.prototype.pushArray = function(items) {
    Array.prototype.push.apply(this, items);
};

Array.prototype.spliceArray = function(start, deleteCount, insertItems) {
    Array.prototype.splice.apply(this, [start, deleteCount].concat(insertItems));
};

Array.prototype.remove = function(item) {
    var index = this.indexOf(item);

    if (index !== -1) {
        this.splice(index, 1);
    }
};

Array.prototype.add = function(item) {
    if (this.indexOf(item) === -1) {
        this.push(item);
    }
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var isFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

//// hide bootstrap dropdown menu on mousedown, not on click
//$(document).on('mousedown', function(e) {
//    if ($(e.target).parents('.dropdown').length === 0) {
//        $('.dropdown').removeClass('open');
//    }
//});
//
//$(document).on('click.bs.dropdown.data-api', '.accounts li', function (e) { e.stopPropagation(); })
//$(document).on('click.bs.dropdown.data-api', '.accounts button', function (e) { $('.accounts').removeClass('open'); })