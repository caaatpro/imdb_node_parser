'use strict';
var Downloader, FTP, fs, zlib,
    extend = function(child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) {
							child[key] = parent[key];
						}
        }

        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    },
    hasProp = {}.hasOwnProperty;

FTP = require('ftp');

fs = require('fs');

zlib = require('zlib');

module.exports = Downloader = (function(superClass) {
    extend(Downloader, superClass);

    Downloader.prototype.options = {};

    Downloader.prototype.host = 'ftp.fu-berlin.de';

    Downloader.prototype.rootPath = '/pub/misc/movies/database';

    Downloader.prototype.manifest = [];

    Downloader.prototype.files = ['actors.list.gz', 'actresses.list.gz', 'complete-crew.list.gz', 'crazy-credits.list.gz', 'genres.list.gz', 'movies.list.gz'];

    function Downloader(options) {
        if (options === null) {
            options = {};
        }
        this.options.noisy = !!options.noisy || false;
        this.on('completed', function() {
            this.client.end();
            if (this.options.noisy) {
                return console.log("Closed connection to " + this.host);
            }
        });
        this.on('fetched', function(options) {
            if (options === null) {
                options = {};
            }
            if (this.options.noisy) {
                console.log(options.exists ? "Skipped " + options.source + " because " + options.target + " already exists" : "Downloaded " + options.source + " to " + options.target);
            }
            this.unzip(options.target);
            this.manifest.push(options.file);
            if (this.manifest.length >= this.files.length) {
                return this.emit('completed', this);
            }
        });
    }

    Downloader.prototype.fetchAll = function() {
        this.client = new FTP();
        this.client.on('ready', (function(_this) {
            return function() {
                var file, i, len, ref, results;
                if (_this.options.noisy) {
                    console.log("Opened connection to " + _this.host);
                }
                ref = _this.files;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    file = ref[i];
                    results.push(_this.download(file));
                }
                return results;
            };
        })(this));
        return this.client.connect({
            host: this.host
        });
    };

    Downloader.prototype.download = function(file) {
        var source, target;
        source = [this.rootPath, file].join('/');
        target = "tmp/" + file;
        return fs.exists(target, (function(_this) {
            return function(exists) {
                if (exists) {
                    return _this.emit('fetched', {
                        exists: true,
                        file: file,
                        source: source,
                        target: target
                    });
                } else {
                    if (_this.options.noisy) {
                        console.log("Downloading " + source);
                    }
                    return _this.client.get(source, function(err, stream) {
                        if (err) {
                            throw err;
                        }
                        stream.once('close', function() {
                            return _this.emit('fetched', {
                                exists: false,
                                file: file,
                                source: source,
                                target: target
                            });
                        });
                        return stream.pipe(fs.createWriteStream(target));
                    });
                }
            };
        })(this));
    };

    Downloader.prototype.unzip = function(file) {
        var input, output, outputTarget;
        outputTarget = file.substring(0, file.lastIndexOf('.gz'));
        input = fs.createReadStream(file);
        output = fs.createWriteStream(outputTarget);
        return input.pipe(zlib.createGunzip()).pipe(output);
    };

    return Downloader;

})(require('events').EventEmitter);
