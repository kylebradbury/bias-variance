/*
Interactive bias variance explorer
Author: Kyle Bradbury
Date: May 31, 2020
*/

blobs_data_path = './data/data.csv';

// Data object
// Methods: constructor (load), split
class Data {
	constructor(data, name="unnamed") {
		this.name = name;
		this.data = data;
		this.train = [];
		this.val = [];
		this.npos_train = this.nneg_train = 0;
	}

	split(frac=0.8) {
		this.data.forEach((d) => {
			if (Math.random() < frac) {
				this.train.push(d);
			} else {
				this.val.push(d);
			}
		})
		this.stats();
	}

	stats() {
		this.train.forEach((d) => {
			if (d.y == 0) {
				this.nneg_train += 1;
			} else {
				this.npos_train += 1;
			}
		})
	}
}

// Analysis object
// Methods: constructor, set_algorithm, fit, predict
class Knn {
	constructor(k=5) {
		this.train_data = [];
		this.k = k;
		this.dist = [];
	}
	fit(data) {
		this.train_data = data;
	}

	predict_proba(test_data) {
		// For each data point compare to each training sample
		let train_data = this.train_data;
		let proba = [];
		let k = this.k;
		// Sort the distances from smallest to largest
		// Determine the 5 smallest distances
		test_data.forEach((p,ip)=>{
			let dist = []
			train_data.forEach((t,it)=>{
				dist.push([(t.x0 - p.x0)**2 + (t.x1 - p.x1)**2,it]);
			})

			function sortFunction(a, b) {
				if (a[0] === b[0]) { return 0; }
				else { return (a[0] < b[0]) ? -1 : 1;}
			}

			dist.sort(sortFunction);
			let prob = 0;
			for (let i = 0; i < k; i++) {
				prob += train_data[dist[i][1]].y;
			}
			proba.push(prob/k);
		})
		return proba;
	}

	predict (data) {
		let predictions = [];
		this.predict_proba(data).forEach((d)=>{
			if (d>0.5) {
				predictions.push(1);
			} else {
				predictions.push(0);
			}
		})
		return predictions;
	}
}

function roc(state) {
	let tpr = [], fpr = [], precision = [];

	// For each threshold value in predict_proba, compute metrics
	thresh_values = unique(state.probs);
	thresh_values.forEach((d) => {
		cmetrics = metrics(state,d);
		tpr.push(cmetrics.tpr);
		fpr.push(cmetrics.fpr);
		precision.push(cmetrics.precision);
	})
	return {tpr:tpr, fpr:fpr, precision:precision};
}

function metrics(state,thresh) {
	let tpr = [], fpr = [], precision = [];
	let tp = fp = tn = fn = 0;
	state.probs.forEach((d,i) => {
		let truth = state.data.train[i].y;
		// Decision rule is x < thresh => 0, else 1
		if (d < thresh) {
			if (truth == 1) { // Prediction is zero
				fn += 1; // False negative
			} else {
				tn += 1; // True negative
			}
		} else { // Prediction is one
			if (truth == 1) { 
				tp += 1; // True positive
			} else {
				fp += 1; // False positive
			}
		}
	})

	tpr = tp / (tp + fn) ;
	fpr = fp / (tn + fp) ;
	precision = tp / (tp + fp);
	return {tpr:tpr, fpr:fpr, precision:precision};
}

function unique(array) {
	let uniq = [];
	array.forEach((d) => {
		if (!uniq.includes(d)) {
			uniq.push(d);
		}
	})
	uniq.sort();
	return uniq;
}

let state = {
	probs : [],
	preds : [],
	data : [],
	model : []
}

d3.csv(blobs_data_path,function(d,i) {
	return {
	  id : i,
	  x0 : +d.x0,
	  x1 : +d.x1,
	  y : +d.y
	};}).then(data => {
	// Load the data and split it into training and test sets
	state.data = new Data(data, name="blobs");
	state.data.split();
	state.model = new Knn(k=3);
	state.model.fit(state.data.train);
	state.probs = state.model.predict_proba(state.data.train);
	state.preds = state.model.predict(state.data.train);
	state.metrics = roc(state) ;
});

