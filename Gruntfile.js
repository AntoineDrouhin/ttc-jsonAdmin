/*global module:false*/
module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('grunt-angular-templates')(grunt);

    grunt.loadNpmTasks('grunt-angular-templates');
    // --- Register npm task
    grunt.loadNpmTasks('grunt-karma');

    var files   = require('./files').files;


    // ------------------------------------------------------------
    // GRUNT CONFIGURATION ----------------------------------------
    // Description of all small task association to npm module ----
    // ------------------------------------------------------------

    grunt.initConfig({

        // --- Variable Configuration
        appdir      : 'src',
        builddir    : 'demo/build',

        pkg         : grunt.file.readJSON('package.json'),
        buildtag    : '-dev-' + grunt.template.today('yyyy-mm-dd'),
        meta: {
            banner: '/**\n' +
            ' * <%= pkg.description %>\n' +
            ' * @version v<%= pkg.version %><%= buildtag %>\n' +
            ' * @link <%= pkg.homepage %>\n' +
            ' */'
        },

        // --- Task clean > remove all stuff in the directory build dir
        clean: [ '<%= builddir %>', '.tmp' ],

        // --- Task to concat all JS project file in one
        concat: {
            options: {
                banner: '<%= meta.banner %>\n\n',
                footer: ''
            },
            build: {
                src: files.src, // -> need to order concat
                dest: '<%= builddir %>/<%= pkg.name %>.js'
            },
            css : {
                src : ['.tmp/styles/{**/,}*.css','.tmp/public/{**/,}*.css'], // -> need to order concat
                dest : '<%= builddir %>/<%= pkg.name %>.css',
                options : {
                    banner : '',
                    footer : ''
                }
            }
        },

        // --- Task to minimize JS concat file
        uglify: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            build: {
                files: {
                    '<%= builddir %>/<%= pkg.name %>.min.js': [ '<banner:meta.banner>','<%= concat.build.dest %>'] ,
                    '<%= builddir %>/<%= pkg.name %>_view.min.js': [ '<banner:meta.banner>', '<%= ngtemplates.app.dest %>'] ,
                }
            }
        },

        // --- Task to copy file to the realase folder
        release: {
            files: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js', '<%= pkg.name %>_view.js', '<%= pkg.name %>_view.min.js'],
            src: '<%= builddir %>',
            dest: 'release'
        },

        // --- Task to test the JS
        jshint: {
            all: ['Gruntfile.js', 'src/{,*/}*.js', '<%= builddir %>/<%= pkg.name %>.js', '<%= builddir %>/<%= pkg.name %>_view.js'],
            options: {
                eqnull: true
            }
        },

        // --- Watches files for changes and runs tasks based on the changed files
        watch: {
            build : {
                files: [
                    'src/{,**/}*.js','src/{**/,}*.html',
                    'src/modules/*/{,**/}*.js', 'src/modules/*/{,**/}*.html'],
                tasks: ['build'] //['build', 'karma:background:run']
            },

            compass: {
                files: ['src/{,*/}*.{scss,sass}'],
                tasks: ['compass:server']
            }
        },

        // --- Configuration to load a little server to test vieviewer
        connect: {
            options: {
                port: grunt.option('port') || 9100,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: grunt.option('host') || '127.0.0.1'
            },
            dev: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect.static('./demo/')
                        ];
                    }
                }
            }
        },

        // ----
        changelog: {
            options: {
                dest: 'CHANGELOG.md'
            }
        },

        // --- Build a JS to stock all project different views
        ngtemplates: {
            app : {
                src: ['src/views/{**/,}*.html','src/public/{**/,}*.svg','src/modules/{**/,}*.html'],
                dest: '<%= builddir %>/eklabs.angularStarterPack_view.js',
                concat: 'dist',
                options: {
                    url: function (url) {
                        url = url.substr(0, 4) === 'src/' ? url.substr(4) : url;
                        return 'eklabs.angularStarterPack/'+url;
                    },
                    module: 'eklabs.angularStarterPack'
                }
            }
        },

        // --- Compiles Sass to CSS and generates necessary files if requested
        // compass: {
        //     dist : {
        //         options: {
        //             sassDir             : 'src/', // Where we have to check
        //             cssDir              : '.tmp/', // Where we put the file
        //             importPath          : './demo/bower_components',
        //             httpImagesPath      : '/images',
        //             relativeAssets      : false,
        //             assetCacheBuster    : false,
        //             raw                 : 'Sass::Script::Number.precision = 10\n',
        //             imagesDir           : 'src/public/images/'
        //         }
        //     }
        // },

        // --- Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [

                ]
            },
            styles : {
                expand: true,
                src: 'src/{**/,}*.css',
                dest: '.tmp/styles'
            },
            font : {
                flatten : true,
                expand: true,
                src: ['src/{**/,}*.eot','src/{**/,}*.ttf','src/{**/,}*.woff','src/{**/,}*.svg'],
                dest: '<%= builddir %>/fonts'
            },
            images : {
                files : [{
                    expand : true,
                    src : 'src/public/images/*',
                    dest: '<%= builddir %>/images/',
                    flatten : true
                }]
            }
        },

        // --- CSS minification
        cssmin : {
            target:{
                files: [{
                    expand : true,
                    cwd : '<%= builddir %>',
                    src : '*.css',
                    dest : '<%= builddir %>',
                    ext : '.min.css'
                }]
            }
        },

        karma : {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        }
    });


    // ------------------------------------------------------------
    // TASK DESCRIPTION -------------------------------------------
    // ------------------------------------------------------------

    // ------------- BUILD TASK
    grunt.registerTask('default', ['build', 'jshint']);
    grunt.registerTask('build', 'Perform a normal build', [ 'concat',               // -- Build one js file
                                                            'ngtemplates',          // -- HTML to JS
                                                            'uglify',               // -- Minimize the JS
                                                            'css_light',                  // -- Perform css treatments
                                                            'copy:images'          // -- Perform image treatment
    ]);

    grunt.registerTask('buildComplete', 'Perform a normal build', [ 'concat',               // -- Build one js file
        'ngtemplates',          // -- HTML to JS
        'uglify',               // -- Minimize the JS
        'css',                  // -- Perform css treatments
        'copy:images'          // -- Perform image treatment
    ]);

    // --- Task About CSS
    grunt.registerTask('css', "Build css stuff", ['compass:dist','copy:styles','concat:css','cssmin', 'copy:font']);
    grunt.registerTask('css_light', "Build css stuff", ['copy:styles','copy:font']);
    // --- Make Clean Build
    grunt.registerTask('dist', 'Perform a clean build', ['clean', 'buildComplete']);

    // ------------- DEV TASK
    grunt.registerTask('dev', 'Run dev server and watch for changes', ['clean','build', 'connect:dev', 'watch']);
    grunt.registerTask('integration', 'Run test with osoft-cabinet and watch for changes', ['clean','build_cabinet', 'watch']);
    grunt.registerTask('test', 'Build and run tests', ['build','karma:unit']);


    // ------------- RELEASE TASK
    grunt.registerTask('release', 'Tag and perform a release', ['prepare-release', 'dist', 'perform-release']);

    // ------------- Interface working
    grunt.registerTask('plug-cabinet','When you work between vieviewer and cabinet',['watch','copy:osoftCabinet']);

    // ---
    grunt.registerTask('prepare-release', function () {
        var bower = grunt.file.readJSON('bower.json'),
            component = grunt.file.readJSON('component.json'),
            version = bower.version;

        if (version != grunt.config('pkg.version')) throw grunt.util.error('Version mismatch in bower.json');
        if (version != component.version) throw grunt.util.error('Version mismatch in component.json');

        promising(this,
            ensureCleanMaster().then(function () {
                return exec('git tag -l \'' + version + '\'');
            }).then(function (result) {
                if (result.stdout.trim() !== '') throw 'Tag \'' + version + '\' already exists';
                grunt.config('buildtag', '');
                grunt.config('builddir', 'release');
            })
        );
    });

    // ---
    grunt.registerTask('perform-release', function () {
        grunt.task.requires([ 'prepare-release', 'dist' ]);

        var version = grunt.config('pkg.version'), releasedir = grunt.config('builddir');
        promising(this,
            system('git add \'' + releasedir + '\'').then(function () {
                return system('git commit -m \'Release ' + version + '\'');
            }).then(function () {
                return system('git tag \'' + version + '\'');
            })
        );
    });

    // ------------------------------------------------------------
    // HELPERS ----------------------------------------------------
    // ------------------------------------------------------------

    // Helpers for custom tasks, mainly around promises / exec
    var exec = require('faithful-exec'), shjs = require('shelljs');

    function system(cmd) {
        grunt.log.write('% ' + cmd + '\n');
        return exec(cmd).then(function (result) {
            grunt.log.write(result.stderr + result.stdout);
        }, function (error) {
            grunt.log.write(error.stderr + '\n');
            throw 'Failed to run \'' + cmd + '\'';
        });
    }

    function promising(task, promise) {
        var done = task.async();
        promise.then(function () {
            done();
        }, function (error) {
            grunt.log.write(error + '\n');
            done(false);
        });
    }

    function ensureCleanMaster() {
        return exec('git symbolic-ref HEAD').then(function (result) {
            if (result.stdout.trim() !== 'refs/heads/master') throw 'Not on master branch, aborting';
            return exec('git status --porcelain');
        }).then(function (result) {
            if (result.stdout.trim() !== '') throw 'Working copy is dirty, aborting';
        });
    }
};
