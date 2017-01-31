
function ViewModel() {
	this.availablelocations = [
          {name:'Eden Gardens'}, {name :'Dumdum Airport'}, {name :'Victoria Memorial'}, {name : 'Prinsep Ghat'}, {name : 'Jorasanko Thakurbari'}, {name : 'Dakshineswar Kali Temple'}];
    this.chosenlocation = ko.observable();
    this.resetlocation = function(){this.chosenlocation(null)};
    };
    ko.applyBindings(new ViewModel() );
