Vue.prototype.$http = axios


var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        copyrightYear: get_copyright_year( 2015 )
    }
})

function get_copyright_year(startYear ){
    var thisYear = new Date().getFullYear();
    var expression = (thisYear > startYear) ? (startYear + '-' + thisYear) : thisYear;
    return expression;
}