modelFiles = {
    src : [
        'src/modules/ttc-json-admin/module.js',
        'src/modules/ttc-json-admin/{,**/}*.js',

        'src/modules/json-editor/module.js',
        'src/modules/json-editor/{,**/}*.js',

        'src/modules/forms/module.js',
        'src/modules/forms/{,**/}*.js',

        'src/module.js',

        'src/services/{,**/}*.js'
    ]
};

if (exports) {
    exports.files       = modelFiles;
}
