describe('User Factory', function(){

    var User;

    // Before each test load our api.users module
    beforeEach(angular.mock.module('ui.ace'));
    beforeEach(angular.mock.module('eklabs.angularStarterPack'));

    // ---- Inject Default config for the test
    angular.module('eklabs.angularStarterPack')
        .constant('WEBAPP_CONFIG', {
            api         : 'http://91.134.241.60:3050/'
        });

    // Before each test set our injected Users factory (_User_) to our local User variable
    beforeEach(inject(function(_User_) {
        User = _User_;
    }));

    // A simple test to verify the Users factory exists
    it('should exist', function() {
        expect(User).toBeDefined();
    });

    // A set of tests for our Users.get() method
    describe('.get(id)', function() {
        // A simple test to verify the method all exists
        it('should exist', function() {
            expect(User.prototype.get).toBeDefined();
        });

        it('should return one user object if it exists',inject(function(User,$httpBackend){

            var testUser = function(user){
              console.log(user);
            };

            var failed = function(user){
                console.log(user);
            };

            $httpBackend.expect('GET','http://91.134.241.60:3050/users/1')
                .respond(200,"{id : 1, name : 'test@donf'}");

            User.prototype.get('1').then(function(data){
                expect(data.id).toEqual(2);
            });
        }))


    });
});
