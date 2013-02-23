var forest = function (x, y) {
	var nSamples = x.length, nVariables = x[0].length;

	var tree = function () {
		var node = function () {
			this.samples = [];
			this.children = [0, 0];
		};

		// Initialize the root node
		var root = new node();
		for (var i = 0; i < nSamples; ++i) {
			root.samples.push(Math.floor(Math.random() * nSamples));
		}
		this.nodes = [root];
		
		// Populate nodes
		for (var k = 0; k < this.nodes.length; ++k) {
			var n = this.nodes[k];

			// Evaluate node y and purity
			var sum = n.samples.reduce(function (previous, current) {
				return previous + y[current];
			}, 0.0);
			n.y = sum / n.samples.length;
			n.p = n.y * n.y * n.samples.length;

			// Do not split the node if it contains too few samples
			if (n.samples.length <= 5) continue;
			
			// Find the best split that has the highest increase in node purity
			var bestChildNodePurity = n.p;
			var mind = new Array(nVariables).join(' ').split(' ').map(function (value, index) { return index; });
			for (var i = 0; i < 5; ++i) {
				// Randomly select a variable without replacement
				var j = Math.floor(Math.random() * (nVariables - i));
				var v = mind[j];
				mind[j] = mind[nVariables - i - 1];

				// Sort the samples in ascending order of the selected variable
				var ncase = new Array(n.samples.length).join(' ').split(' ').map(function (value, index) { return index; }).sort(function (idx1, idx2) {
					return x[n.samples[idx1]][v] - x[n.samples[idx2]][v];
				});

				// Search through the gaps in the selected variable
				var suml = 0.0;
				var sumr = sum;
				var popl = 0;
				var popr = n.samples.length;
				for (var j = 0; j < n.samples.length - 1; ++j) {
					var d = y[n.samples[ncase[j]]];
					suml += d;
					sumr -= d;
					++popl;
					--popr;
					if (x[n.samples[ncase[j]]][v] == x[n.samples[ncase[j+1]]][v]) continue;
					var curChildNodePurity = (suml * suml / popl) + (sumr * sumr / popr);
					if (curChildNodePurity > bestChildNodePurity)
					{
						bestChildNodePurity = curChildNodePurity;
						n.var = v;
						n.val = (x[n.samples[ncase[j]]][v] + x[n.samples[ncase[j+1]]][v]) * 0.5;
					}
				}
			}

			// Do not split the node if purity does not increase
			if (bestChildNodePurity == n.p) continue;

			// Create two child nodes and distribute samples
			n.children[0] = this.nodes.length;
			this.nodes.push(new node);
			n.children[1] = this.nodes.length;
			this.nodes.push(new node);
			for (var i in n.samples) {
				var s = n.samples[i];
				this.nodes[n.children[x[s][n.var] > n.val ? 1 : 0]].samples.push(s);
			}
		}

		// Clear node samples to save memory
		this.clear = function() {
			for (var k in this.nodes) {
				this.nodes[k].samples.length = 0;
			}
		};

		// Predict the y value of the given sample x
		this.predict = function (x) {
			var k;
			for (k = 0; this.nodes[k].children[0]; k = this.nodes[k].children[x[this.nodes[k].var] > this.nodes[k].val ? 1 : 0]);
			return this.nodes[k].y;
		};
	};

	// Build trees one by one
	this.trees = new Array(5);
	for (var i = 0; i < this.trees.length; ++i) {
		this.trees[i] = new tree;
	}

	this.clear = function () {
		for (var i in this.trees) {
			this.trees[i].clear();
		}
	};

	this.predict = function (x) {
		var y = 0.0;
		for (var i in this.trees) {
			y += this.trees[i].predict(x);
		}
		return y /= this.trees.length;
	};
};

var f;

onmessage = function(ev) {
	var data = JSON.parse(ev.data);
	if (data.y === undefined) {
		postMessage(f.predict(data.x));
	} else {
		f = new forest(data.x, data.y);
		postMessage();
	}
};
