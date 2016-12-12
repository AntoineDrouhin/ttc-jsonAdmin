/**
 * Admin json action registering
 * @version v1.0.0-dev-2016-12-12
 * @link 
 */

'use strict';

angular.module('ttcJsonAdminModule', ['ngMaterial', 'ui.ace'])
    .directive('ttcJsonAdmin', ['$log', '$http', '$mdDialog', function($log,
        $http, $mdDialog) {
        return {
            restrict : 'E',
            template:    "<div>\n" +
                            "\n" +
                            "    <md-toolbar>\n" +
                            "        <div class=\"md-toolbar-tools\">\n" +
                            "            <span>Editeur JSON</span>\n" +
                            "\n" +
                            "            <!-- fill up the space between left and right area -->\n" +
                            "            <span flex></span>\n" +
                            "\n" +
                            "            <md-button class=\"md-raised md-primary\" ng-click=\"newAction()\">\n" +
                            "                Nouveau\n" +
                            "            </md-button>\n" +
                            "            <md-button class=\"md-raised md-warn\" ng-click=\"confirmAndDeleteAction($event)\">\n" +
                            "                Supprimer\n" +
                            "            </md-button>\n" +
                            "            <md-button class=\"md-raised md-accent\" ng-click=\"clearActionLocalChange()\">\n" +
                            "                Annuler\n" +
                            "            </md-button>\n" +
                            "            <md-button class=\"md-raised md-primary\" ng-click=\"saveAction()\">\n" +
                            "                Sauvegarder\n" +
                            "            </md-button>\n" +
                            "            <md-button class=\"md-raised md-primary\" ng-click=\"showHelp()\">\n" +
                            "                ?\n" +
                            "            </md-button>\n" +
                            "        </div>\n" +
                            "    </md-toolbar>\n" +
                            "\n" +
                            "    <div layout=\"row\">\n" +
                            "        <md-content flex=\"30\">\n" +
                            "\n" +
                            "            <md-list>\n" +
                            "                <md-subheader class=\"md-no-sticky\">Listes des commandes</md-subheader>\n" +
                            "                <md-list-item class=\"md-1-line\" ng-repeat=\"item in actions.data\" ng-click=\"selectAction(item)\">\n" +
                            "                    <div class=\"md-list-item-text\" layout=\"column\">\n" +
                            "                        {{item.name}}\n" +
                            "                    </div>\n" +
                            "                </md-list-item>\n" +
                            "            </md-list>\n" +
                            "\n" +
                            "        </md-content>\n" +
                            "\n" +
                            "        <md-content flex=\"70\">\n" +
                            "            <div ui-ace=\"aceOption\" ng-model=\"aceModel\" style=\"width: 100%;height:350px\"></div>\n" +
                            "            <div ng-if=\"errors.length || editorError\" layout=\"row\" class=\"warn-font\" style=\"font-size: 0.9em\">\n" +
                            "\n" +
                            "                <md-icon md-svg-src=\"material-design:error_outline\" class=\"ic_16px warn-font\" style=\"margin: 0 2px;\"></md-icon>\n" +
                            "\n" +
                            "                <span ng-if=\"errors.length\" ng-repeat=\"error in errors\">{{error}}</span>\n" +
                            "\n" +
                            "                <span ng-if=\"editorError\">{{editorError}}</span>\n" +
                            "\n" +
                            "            </div>\n" +
                            "        </md-content>\n" +
                            "    </div>\n" +
                            "    </md-content>\n" +
                            "\n" +
                            "</div>\n",
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
