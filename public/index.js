$(function() {
//	var canvas = document.getElementById('iview');
//	if (canvas.getContext('webgl')));
//	if (canvas.getContext('experimental-webgl'));
//	window.open(canvas.toDataURL('image/png'));

	$.get('receptor.pdb', function(complex) {
		var c = new iview('iview');
		c.setBox([49.712, -28.923, 36.824], [18, 18, 20]);
		c.setReceptor(c.parseReceptor(complex));
	});
});
