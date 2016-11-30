describe('Testing directive',function(){


    var compile,scope,directiveElem;

    beforeEach(function(){
        angular.mock.module('eklabs.angularStarterPack');

        inject(function($compile, $rootScope){
            compile = $compile;
            scope = $rootScope;
        });

        directiveElem = getCompiledElement();
    });

    /**
     * Load the current element
     * @returns {*}
     */
    function getCompiledElement(){
        var element = angular.element('<my-user></my-user>');
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should have a no result message',function(){
        var message = directiveElem.find('div');
        expect(message[0]).toBeDefined();
    });

    it('should watch the update an user',function(){
        scope.user = {id : 1, name : 'name',photo : 'hello'};
        scope.$digest();
        var imgElement = directiveElem.find('img');
        expect(imgElement).toBeDefined();
        // console.log(scope);
        // console.log(imgElement);
        expect(imgElement).not.toEqual({});

    })

});