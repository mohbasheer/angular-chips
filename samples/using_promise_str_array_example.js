(function() {
    angular.module('sample')
        .controller('usingPromiseStrArrayController', UsingPromiseStrArrayController);

    function UsingPromiseStrArrayController($scope, $q) {
        var self = this;

        var countries = [
            'Afghanistan','Albania','Algeria','Andorra','Angola','Anguilla','Antigua & Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
            'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','Bosnia & Herzegovina','Botswana','Brazil','Brunei Darussalam','Bulgaria','Burkina Faso','Myanmar/Burma','Burundi',
            'Cambodia','Cameroon','Canada','Cape Verde','Cayman Islands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
            'Democratic Republic of the Congo','Denmark','Djibouti','Dominican Republic','Dominica',
            'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia',
            'Fiji','Finland','France','French Guiana',
            'Gabon','Gambia','Georgia','Germany','Ghana','Great Britain','Greece','Grenada','Guadeloupe','Guatemala','Guinea','Guinea-Bissau','Guyana',
            'Haiti','Honduras','Hungary',
            'Iceland','Indonesia','Iran','Iraq','Israel and the Occupied Territories','Italy','Ivory Coast (Cote d\'Ivoire)',
            'Jamaica','Japan','Jordan',
            'Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyz Republic (Kyrgyzstan)',
            'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
            'Republic of Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Martinique','Mauritania','Mauritius','Mayotte','Mexico','Moldova, Republic of','Monaco','Mongolia','Montenegro','Montserrat','Morocco','Mozambique',
            'Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','Korea, Democratic Republic of (North Korea)','Norway',
            'Oman',
            'Pacific Islands','Pakistan','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Puerto Rico',
            'Qatar',
            'Reunion','Romania','Russian Federation','Rwanda',
            'Saint Kitts and Nevis','Saint Lucia','Saint Vincent\'s & Grenadines','Samoa','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovak Republic (Slovakia)','Slovenia','Solomon Islands','Somalia','South Africa','Korea, Republic of (South Korea)','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria',
            'Tajikistan','Tanzania','Thailand','Timor Leste','Togo','Trinidad & Tobago','Tunisia','Turkey','Turkmenistan','Turks & Caicos Islands',
            'Uganda','Ukraine','United Arab Emirates','United States of America (USA)','Uruguay','Uzbekistan',
            'Venezuela','Vietnam','Virgin Islands (UK)','Virgin Islands (US)',
            'Yemen',
            'Zambia','Zimbabwe'
        ];

        self.list = ['India', 'China'];

        /*call back method for chip*/
        self.render = function(val) {
            var deferred = $q.defer();
            setTimeout(function() {
                var ret = []
                for (var i = 0; i < countries.length; i++) {
                    if (countries[i].toLowerCase().indexOf(val.toLowerCase()) !== -1) {
                        ret.push(countries.splice(i, 1)[0]);
                        i--;
                    }
                }
                deferred.resolve(ret); // : deferred.reject(val);
            }, getDelay());
            return deferred.promise;
        };

        /*call back method for chip delete*/
        self.deleteChip = function(val) {
            if (val && val.defer && !val.isFailed) {
                countries.push(val.defer);
            }
            return true;
        }

        function getDelay(){
            return (Math.floor(Math.random() * 3) + 1) * 1000;
        }
    }
})();
