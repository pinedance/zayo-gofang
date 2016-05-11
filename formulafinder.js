var app = angular.module('gofangApp', ['ngTagsInput']);

app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);  // https://medium.com/swlh/improving-angular-performance-with-1-line-of-code-a1fb814a6476#.afzq4lagg

app.service('copyright', function(){
	this.year = function(startYear){
		var thisYear = new Date().getFullYear();
		if (thisYear > startYear) { 
			return(startYear + '-' + thisYear);
		} else {
			return(thisYear);
		}
	};
});

app.factory('loadSrc', ["$http", function($http){
	return {
		formulas: function(){ 
			return $http.get('./src/sanghan_formulas.json')
		}
	}
}])

app.controller('FormulaCtrl', ['$scope', '$q', 'loadSrc', 'copyright', function($scope, $q, loadSrc, copyright) {
			
	////copyright
	$scope.copyrightYear = copyright.year(2015);

	var data, keys
	
	loadSrc.formulas().success(function(d, s){
		data = d
		keys = {
			herbs: Object.keys(d.herbs), 
			formulas: Object.keys(d.formulas), 
			symptoms: Object.keys(d.symptoms)
		}
		$scope.gotData = true
	})

	$scope.loadItems = function(query, mykey) {
		var deferred = $q.defer();
		var filtered = keys[mykey].filter(function(s) { return s.indexOf(query) > -1; });
		deferred.resolve( filtered.map( function(item){ 
			var result = new Object;
			result[mykey] = item;
			return result;
		}) );
		return deferred.promise;
	};  // solution : http://stackoverflow.com/questions/23069562/autocomplete-using-ngtagsinput-cannot-read-property-then-of-undefined 
	
	$scope.find = function(){
		var tmp_in = $scope.inHerbs.map(function(item) { return item.herbs });
		var tmp_out = $scope.outHerbs.map(function(item) { return item.herbs });
		
		if ( (tmp_in.length + tmp_out.length)==0 ){
			$scope.results = [];
		} else {
			var handler = Object.keys(data.formulas);
		
			for (var i=0; i < tmp_in.length ; i++){ 
				if (data.herbs[tmp_in[i]]){
					handler = handler.intersection( data.herbs[tmp_in[i]].link );
				} else {
					continue;
				}
			}
			for (var j=0; j < tmp_out.length ; j++){
				if (data.herbs[tmp_out[j]]){
					handler = handler.diff( data.herbs[tmp_out[j]].link );
				} else {
					continue;
				}
			}

			$scope.results = handler;
		}
		delete $scope.fmlIdx
	};
	
	$scope.findHerbsymp = function(){
		var _output = $scope.inSymp.map(function(item) { return data.symptoms[item.symptoms] });
		var herbArr = _output.map(function(item){ return item.herbs })
		var _outHerbArr = herbArr[0]
		for (var j=0; j < herbArr.length ; j++){
			_outHerbArr = _outHerbArr.intersection(herbArr[j]);
		}
		$scope.symptoms = _output.map(function(item){ return item.org })
		$scope.herbssymptoms = _outHerbArr

	};

	$scope.addHerb = function(hb){
		var included = $scope.inHerbs.filter(function(herb){return herb.herbs == hb}) // 이미 있다면 넣지 않음 (ng-repeat 오류 회피)
		if (included.length > 0){ return }
		$scope.inHerbs.push( {herbs: hb} );
		$scope.find()
	};
	
	$scope.showDetail = function(formula, index){ 
		$scope.detail = data.formulas[formula];
		$scope.herbdetails = Object.keys(data.formulas[formula].ingOrg);
		$scope.yack = "약징 내용";
		$scope.fmlIdx = index
		delete $scope.yackIdx
	};
	
	$scope.showHerbDetail = function(h, index){
		$scope.yack = data.herbs[h].txYG;
		$scope.yackIdx = index
	};
	
	$scope.resetForms = function(){
		delete $scope.inHerbs;
		delete $scope.outHerbs;
		delete $scope.results;
		
		delete $scope.detail;
		delete $scope.yack;
		delete $scope.herbdetails;
		
		delete $scope.inSymp;
		delete $scope.symptoms;
		delete $scope.herbssymptoms;
	};

}]);


	
