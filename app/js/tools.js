function bootstrap() {
    gapi.client.load('drive', 'v2', function() {
        angular.bootstrap(document, ['app']);
    });
}

Array.prototype.empty = function() {
    this.splice(0, this.length);
};

Array.prototype.pushArray = function(items) {
    Array.prototype.push.apply(this, items);
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var isFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;