////

Array.prototype.intersection = function(b){
	return this.filter(function(i) {return b.indexOf(i) != -1 });
};

Array.prototype.diff = function(b) {
	return this.filter(function(i) {return b.indexOf(i) < 0;});
};

////

Array.prototype.now = 0;

Array.prototype.setnow = function(i){
    var l = this.length;
    if(l === 0){
       this.now = 0;
   } else {
        var j = i % l;
        this.now = j;
   }
};

Array.prototype.next = function() {
    var i = ++this.now;
    var l = this.length;
    if(l === 0){
		this.now = 0;
        return this[0];
   } else {
        var j = i % l;
        this.now = j;
		return this.current();
   }
};
		
Array.prototype.prev = function() {
	var i = --this.now;
	var l = this.length;
	if(l === 0){
		this.now = 0;
		return this[0];
	} else if(i < 0){
		this.now = l - 1;
		return this.current();
	} else {
		this.now = i;
		return this.current();
	}
};
		
Array.prototype.current = function(){
	return this[this.now];
};		


////
Array.prototype.search = function(key, value){
    for (var i=0; i < this.length; i++) {
        if (this[i][key] === value) {
            return this[i];
        } else {
        	return false;
        }
    }
};

Array.prototype.sortby = function(key){
	this.sort( 
		function(a, b){
			if (a[key] < b[key]){return -1};
			if (a[key] > b[key]){return 1};
			return 0;
		}
	);
};


Array.prototype.keys = function(){
    var idx = [];
    for(var i=0 ; i<this.length ; i++){ idx.push(i); }   
    return idx;
}

Array.prototype.suffle = function(){
    var o = this;
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
} //[ref](http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript)

Array.prototype.clone = function() {
	return this.slice(0);
}; //http://davidwalsh.name/javascript-clone-array


// remove element by index
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
}; // http://stackoverflow.com/questions/500606/javascript-array-delete-elements

