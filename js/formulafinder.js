var app = angular.module('gofangApp', ['ngTagsInput', 'ui.bootstrap']);

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
			return $http.get('src/sanghan_formulas.json')
		}
	}
}])

app.controller('FormulaCtrl', ['$scope', '$q', 'loadSrc', 'copyright', '$uibModal', '$log', '$window', function($scope, $q, loadSrc, copyright, $uibModal, $log, $window) {

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

  $scope.reload = function(){
    $window.location.reload();
  }

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

  $scope.searchOpts = [
      {label: '본초구성'},
      {label: '처방이름'},
  ]

  $scope.searchTab = 0

  $scope.searchBy = function(idx){
    $scope.resetForms()
    $scope.searchByWhat = $scope.searchOpts[idx].label
    $scope.searchTab = idx
  }

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

  $scope.searchByFormulaName = function(){
    var formulaName = $scope.formulaName.map(function(item) { return item.formulas })[0];
    console.log(formulaName)
    if( keys.formulas.indexOf(formulaName) > -1 ){
      $scope.results = [formulaName]
    } else {
      $scope.results = []
    }
  }

	$scope.addHerb = function(hb){
		var included = $scope.inHerbs.filter(function(herb){return herb.herbs == hb}) // 이미 있다면 넣지 않음 (ng-repeat 오류 회피)
		if (included.length > 0){ return }
		$scope.inHerbs.push( {herbs: hb} );
		$scope.find()
	};

  $scope.showDetail = function(formula, index){
    $scope.fmlIdx = index

    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: 'html/modal.html',
      controller: 'fangDetailCtrl',
      // size: "",
      resolve: {
        data: function () { return data },
        params: function() {return {formula: formula, index: index} }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      // $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });

		delete $scope.yackIdx
	};

	$scope.resetForms = function(){
		delete $scope.inHerbs;
		delete $scope.outHerbs;
    delete $scope.fmlName;
		delete $scope.results;

		delete $scope.detail;
		delete $scope.yack;
		delete $scope.herbdetails;

		delete $scope.inSymp;
		delete $scope.symptoms;
		delete $scope.herbssymptoms;
	};

}]);

app.controller('fangDetailCtrl', function ($scope, $uibModalInstance, data, params) {

  (function(){
    $scope.detail = data.formulas[params.formula];
    $scope.herbdetails = Object.keys(data.formulas[params.formula].ingOrg);
    $scope.yack = "약징 내용";
  })();

  $scope.showHerbDetail = function(h, index){
		$scope.yack = data.herbs[h].txYG;
		$scope.yackIdx = index
	};

  $scope.close = function () {
    $uibModalInstance.close();
  };


});
