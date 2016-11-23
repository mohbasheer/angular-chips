(function() {
    angular.module('sample')
        .controller('basicController', BasicController);

    function BasicController() {
        /*for basic example*/
        this.companies = ['Apple', 'Cisco', 'Verizon', 'Microsoft'];

        /*for bootstrap.ui.typeahead example*/
        this.availableCompanies = ['ACCO Brands',
            'Accuquote',
            'Accuride Corporation',
            'Ace Hardware',
            'Google',
            'FaceBook',
            'Paypal',
            'Pramati',
            'Bennigan',
            'Berkshire Hathaway',
            'Berry Plastics',
            'Best Buy',
            'Carlisle Companies',
            'Carlson Companies',
            'Carlyle Group',
            'Denbury Resources',
            'Denny',
            'Dentsply',
            'Ebonite International',
            'EBSCO Industries',
            'EchoStar',
            'Gateway, Inc.',
            'Gatorade',
            'Home Shopping Network',
            'Honeywell',
        ];


        //for typeahead without bootstrap on objects
        this.selectedCountries = [{country:"United Kingdom", capital:"London"}];
        this.countries = [
            {
                country : "India",
                capital : "Delhi"
            },
            {
                country : "Russia",
                capital : "Moscow"
            },
            {
                country : "Singapore",
                capital : "Singapore"
            },
            {
                country : "Egypt",
                capital : "Cairo"
            },
            {
                country : "Japan",
                capital : "Tokyo"
            }
        ] 
    }
})();
