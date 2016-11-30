'use strict';

angular.module('eklabs.angularStarterPack.ttcJsonAdmin', ['ngMaterial'])
    .directive('ttcJsonAdmin', ['$log', '$http', '$mdDialog', function($log,
        $http, $mdDialog) {
        return {
            templateUrl: 'eklabs.angularStarterPack/modules/ttc-json-admin/directives/json-admin/jsonAdminView.html',
            scope: {
                'routeApiActions': '=routeApiActions'
            },
            link: function(scope) {




                // TODO : Faire une factory pour les objets que l'on utilise (voir le code factory du prof)
                // TODO : Mettre la route de l'api dans le fichier de config.
                // TODO : Voir le factory USER du prod pour prendre exemple
                scope.actions = {};
                scope.actions.data = [];
                scope.selectedAction = {};
                // INIT
                $http({
                    method: 'GET',
                    url: scope.routeApiActions.api_route
                }).then(function successCallback(response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var act = response.data[i];
                        scope.actions.data.push({
                            name: act.name,
                            originJson: act.json,
                            currentJson: act.json,
                            id : act.id
                        });
                    }
                }, function errorCallback(response) {
                    $log.info('Get actions : Unable to reach server');
                });

                /**
                 * Method to render well or params
                 * @param json
                 * @returns {string}
                 */
                scope.convertToAce = function(json) {

                    var transform = "",
                        previousChar = "",
                        tabs = [],
                        jsonString = JSON.stringify(json);

                    angular.forEach(jsonString, function(char) {
                        if (char == '{') {
                            tabs.push("\t");
                            transform += char + '\n' + tabs.join("");
                        } else if (char == ',' && (previousChar == '"' ||
                                previousChar == 'e' || previousChar == 'd')) {
                            transform += char + '\n' + tabs.join("");
                        } else if (char == '}') {
                            tabs.splice(0, 1);
                            transform += '\n' + tabs.join("") + char;
                        } else {
                            transform += char
                        }
                        previousChar = char;
                    });

                    return transform;
                };

                /**
                 * Trigger to load ace editor
                 */
                scope.$watch('loadAce', function(loadAce) {
                    scope.aceOption = {
                        mode: 'json',
                        require: ['ace/ext/language_tools'],
                        theme: 'chrome',
                        onLoad: function(_ace) {
                            var _session = _ace.getSession();

                            _session.on('changeAnnotation', function() {

                                var annot = _ace.getSession().getAnnotations();

                                if (!annot.length) {
                                    scope.editorError = false;
                                    // no error
                                } else {
                                    scope.editorError = annot[0];
                                }

                                // we save all changes in local
                                if (scope.selectedAction) {
                                    scope.selectedAction.currentJson = _ace.getValue();
                                }
                            })
                        }
                    };
                    scope.aceAvailable = true;
                });


                /*
                 * CSS
                 */
                scope.$watch('height', function(height) {
                    scope.currentHeight = (height - 20) || 800;
                    scope.maxHeightContainer = height - 45;
                });


                // TODO Faire une factory avec les modeles
                /*
                 * ACTIONS
                 */
                scope.jsonActionModels = {
                    "image": {
                        "type": "image",
                        "cmd": "string",
                        "url": "string"
                    },
                    "service": {
                        "type": "service",
                        "cmd": "string",
                        "url": "string",
                        "method": "string"
                    }
                };

                /*
                 * Affiche le json sous forme de caractères
                 */
                scope.showHelp = function() {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Aide des modèles')
                        .textContent(scope.convertToAce(scope.jsonActionModels))
                        .ariaLabel('JSON')
                        .ok('OK')

                    );
                };

                /*
                 * Valide le json d'une image
                 */
                scope.isValidateImageAction = function(json) {
                    var model = scope.jsonActionModels.image;
                    if (json.type != model.type)
                        return false;
                    if (typeof json.cmd != typeof model.cmd)
                        return false;
                    if (typeof json.url != typeof model.url)
                        return false;
                    // no problem with that json
                    return true;
                };

                /*
                 * Valide le json d'un Service
                 */
                scope.isValidateServiceAction = function(json) {
                    var model = scope.jsonActionModels.service;
                    if (json.type != model.type)
                        return false;
                    if (typeof json.cmd != typeof model.cmd)
                        return false;
                    if (typeof json.url != typeof model.url)
                        return false;
                    if (!json.method)
                        return false;
                    if (typeof json.method != typeof model.method)
                        return false;
                    // no problem with that json
                    return true;
                };

                /*
                 * Valide le json saisie
                 */
                scope.isValidateJson = function(json) {

                    // if input are string, convert it to string
                    if (typeof json == "string") {
                        try {
                            json = angular.fromJson(json)
                        } catch (e) {
                            // during converting, if the json is broken is not a valid json
                            return false;
                        }
                    };

                    // we need a type
                    if (!json.type)
                        return false;
                    // wich is number
                    if (typeof json.type != "string")
                        return false;
                    // we need a name for a command
                    if (!json.cmd)
                        return false;
                    // and the url for the execution
                    if (!json.url)
                        return false;
                    switch (json.type) {
                        case "image":
                            return scope.isValidateImageAction(json);
                        case "service":
                            return scope.isValidateServiceAction(json);
                        default:
                            return false;
                    }

                };


                scope.selectAction = function(selectedAction) {
                    scope.selectedAction = selectedAction;
                    scope.aceAvailable = false;
                    scope.actions.idActionSelected = selectedAction.id;

                    if (!selectedAction) {
                        scope.aceModel = '{\n\t\n}';
                    } else {
                        scope.aceModel = selectedAction.currentJson;
                    }
                    scope.loadAce = moment().valueOf();
                };



                scope.newAction = function() {

                    var action = {
                        name: "",
                        originJson: "{}",
                        currentJson: "{}",
                    }

                    var confirm = $mdDialog.prompt()
                        .title('Name your action')
                        .textContent("Insert your action's name")
                        .placeholder('My Action')
                        .ariaLabel('action')
                        .ok('Okay!')
                        .cancel('Cancel')


                    $mdDialog.show(confirm).then(function(result) {
                        action.name = result;
                        $http({
                            method: 'POST',
                            url: scope.routeApiActions.api_route,
                            data: {
                                name: action.name,
                                json: action.currentJson
                            }
                        }).then(function successCallback(response) {
                                action.id = response.data
                                scope.actions.data.push(action);
                                scope.selectAction(action);
                            },
                            function errorCallback(response) {
                                $log.error(response);
                            })
                    }, function() {
                        action = false;
                    });


                };

                scope.clearActionLocalChange = function() {
                    if (scope.selectedAction.currentJson && scope.selectedAction.originJson) {
                        scope.selectedAction.currentJson = scope.selectedAction.originJson;
                    }

                    scope.selectAction(scope.selectedAction);
                };

                scope.saveAction = function() {
                    if (!scope.isValidateJson(scope.selectedAction.currentJson)) {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('JSON Incompatible')
                            .textContent('Votre JSON ne correspond pas aux modèles possibles ou un érreur de syntaxe empèche sa sauvegarde.')
                            .ariaLabel('Compatibilité JSON')
                            .ok('OK')

                        );
                        return false;
                    }

                    $http({
                        method: "PUT",
                        url: scope.routeApiActions.api_route + scope.selectedAction.id,
                        data: {
                            name : scope.selectedAction.name,
                            json : scope.selectedAction.currentJson
                        }
                    }).then(function successCallback(response) {
                            $log.debug(response);
                        },
                        function errorCallback(response) {
                            $log.error(response);
                        });
                };

                scope.deleteAction = function() {
                    $http({
                        method: 'DELETE',
                        url: scope.routeApiActions.api_route + scope.selectedAction.id
                    }).then(function successCallback(response) {
                            for (var i = 0 ; i < scope.actions.data.length; i++) {
                                var act = scope.actions.data[i];
                                if (act.id = scope.selectedAction.id) {
                                    scope.actions.data.splice(i,1);
                                    scope.aceModel = '';
                                    break;
                                }
                            }
                            $log.debug(response);
                        },
                        function errorCallback(response) {
                            $log.error(response);
                        });
                };

                scope.confirmAndDeleteAction = function(ev) {
                    var confirm = $mdDialog.confirm()
                        .title('Souhaitez vous vraiment supprimer cette commande ?')
                        .textContent('')
                        .ariaLabel('Suppréssion de commande')
                        .targetEvent(ev)
                        .ok('Oui')
                        .cancel('Non');

                    $mdDialog.show(confirm).then(function() {
                            scope.deleteAction(scope.selectedAction.id);
                        },
                        function() {
                            $log.info('action not deleted')
                        });
                }

            }
        }
    }]);
