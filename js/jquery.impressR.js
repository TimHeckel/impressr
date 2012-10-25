/*
* Created by Tim Heckel, &copy; 2012 
* Licensed under the MIT.
*/

(function ($) {
    var methods = {
        init: function (options) {
            options = options || {};

            return this.each(function () {
                var _self = $(this);
                if (!_self.data('impressR')) {

                    options.impressR =
                        $(this)
                            .bind("impress:init", function (e) {
                                send({ name: "init", step: $(e.target).attr("id") });
                            }).bind("impress:stepleave", function (e) {
                                send({ name: "goto", step: $(e.originalEvent.detail.nextStep).attr("id") });
                            });

                    options.proxyName = options.proxyName || _guid();
                    options.clientId = _guid();
                    options.impress = window.impress($(this).attr("id"));

                    $(this).signalRamp({
                        proxyName: options.proxyName
                        , callbacks: {
                            bridgeInitialized: function (bridge, done) {

                                bridge.on('init', function (pkg) {
                                    if (options.clientId !== pkg.id) {
                                        options.impress.init();
                                    }
                                });

                                bridge.on('goto', function (pkg) {
                                    if (options.clientId !== pkg.id) {
                                        options.impress.goto(pkg.step);
                                    }
                                });

                                done();
                            }
                            , bridgeStarted: function () {

                                //kick off impress
                                options.impress.init();
                            }
                        }
                    });

                    function send(pkg) {
                        $.extend(pkg, { id: options.clientId });
                        var bridge = _self.signalRamp("bridge");
                        bridge.invoke(pkg.name, pkg);
                    };

                    _self.data({ impressR: { options: options} });
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                var _self = $(this);
                _self.removeData("impressR");
            })

        }
    };

    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function _guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).substring(0, 7);
    };

    $.fn.impressR = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.impressR');
        }
    };

})(jQuery);