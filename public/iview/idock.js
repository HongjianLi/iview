importScripts('gl-matrix.js');
var confs = [{
	pos: [1.002, 2.278, 0.027],
	ori: quat4.identity(),
	tor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}, {
	pos: [1.2, 2, 0.5],
	ori: quat4.identity(),
	tor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}];
var i = 0;
onmessage = function(event) {
//	var data = JSON.parse(event.data);
	while (true) {
		var now = new Date().getTime();
		while (new Date() < now + 1000);
		postMessage(confs[i++ & 1]);
		if (i == 10) break;
	}
};
