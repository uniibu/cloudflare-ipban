"use strict";
var ipstorage = {};
var alreadyblocked = [];
var _ = require('lodash');
var request = require('request');

exports.checkbanip = function(){
return function *(next) {
if(this.path === '/'){

	var ip = this.request.ip;
	console.log('Checking ip',ip);
	var timenow = new Date;
	var checkip = ipstorage[ip];
	if(!checkip || typeof checkip === 'undefined' ){
		if(_.indexOf(alreadyblocked,checkip) === -1){
		ipstorage[ip] = timenow;
		console.log('First time ip is seen, adding this ip to storage-->',ip);
		}else{
			console.log('Ip already blcoked',ip);
		}
	}else{
		var difference = (timenow - checkip) / 1000;
		if(difference < 0.2) { //0.2 seconds  CHANGE THIS

				addtoCF(ip,difference);
				alreadyblocked.push(ip);
				delete ipstorage[ip];
		}else{
			ipstorage[ip] = timenow;
			console.log('Ip has passed time check, continuing -->',ip);
		}
	}

}
console.log('ipstorage now has a length of', Object.keys(ipstorage).length);
  yield* next;

};
};
function addtoCF(ip,difference){
	console.error('This ip has been banned-->', ip , 'tried to access /  more than once in', difference + ' seconds');
    var options = {
        method: 'POST',
        url:'https://api.cloudflare.com/client/v4/zones/CHANGETOZONEID/firewall/access_rules/rules',
        headers: {
            'X-Auth-Email': 'CHANGE TO YOUR CF EMAIL',
            'X-Auth-Key': 'GET AUTH API KEY ON CF',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({"mode":"block","configuration":{"target":"ip","value":ip},"notes":"ddos"})
    };
    request(options,function(error, response, body){
        if(error){console.error('error',error)};
        //console.log(response);
        return;
    })
}
