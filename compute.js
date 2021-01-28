class Data {
    
    constructor(opts) {
        this.type = opts.type;
        this.n = opts.n; // Must be even

        if (this.type == 'gaussian') {
            this.data = this.generate_data_gaussian();
            this.extent = {x:[-3,3],y:[-3,3]}
        }
    }
    
    // Data creation functions
    generate_data_gaussian(frac_pos=0.5) {
        let v = 0.5,
            mean = [[-v,v],[v,-v]],
            std = [1,1];

        let data = [];
        for (let i = 0; i < this.n; i++) {
            if (i < frac_pos*this.n) {
                // generate positive example
                let class0 = this.randn(mean[0],std[0]);
                data.push({x:class0, y:0, index:i})
            } else {
                // generate negative example
                let class1 = this.randn(mean[1],std[1]);
                data.push({x:class1, y:1, index:i})
            }
        }
        return data;
    }

    // Standard Normal variate using Box-Muller transform.
    randn(mean,std) {
        var u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let z0 = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ),
            z1 = Math.sqrt( -2.0 * Math.log( u ) ) * Math.sin( 2.0 * Math.PI * v );
        return [z0*std + mean[0], z1*std + mean[1]];
    }
}


// ANALYSIS OBJECT
// Methods: constructor, fit, predict, predict_proba
class KnnModel {
	constructor(k=5) {
		this.k = k;
    }
    
	fit(data) {
		this.train_data = data;
	}

	predict_proba(test_data) {
		// For each data point compare to each training sample
		let proba = [];
		// let k = this.k;
		// Sort the distances from smallest to largest
        // Determine the 5 smallest distances
		test_data.forEach(p => {
			let dist = []
			this.train_data.forEach((t,it) => {
				dist.push([(t.x[0] - p.x[0])**2 + (t.x[1] - p.x[1])**2, it]);
			})

			function sortFunction(a, b) {
				if (a[0] === b[0]) { return 0; }
				else { return (a[0] < b[0]) ? -1 : 1;}
			}

			dist.sort(sortFunction);
            let prob = 0;
			for (let i = 0; i < this.k; i++) {
                // console.log(i, this.train_data[dist[i][1]], this.train_data[dist[i][1]].y)
				prob += this.train_data[dist[i][1]].y;
            }
			proba.push(prob/this.k);
		})
		return proba;
	}

	predict(data) {
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

    predict_boundary(opts) {

        // Get x and y extent
        // const xExtent = d3.extent(opts.data, d => d.x[0]);
        // const yExtent = d3.extent(opts.data, d => d.x[1]);
        const xExtent = opts.extent.x;
        const yExtent = opts.extent.y;

        // Make predictions for a grid across the extent of the data
        let n = opts.n,
            dx = (xExtent[1] - xExtent[0])/(n-1),
            dy = (yExtent[1] - yExtent[0])/(n-1);
        
        let boundary_data = []
        for (let x = xExtent[0]; x <= xExtent[1]; x += dx) {
            for (let y = yExtent[0]; y <= yExtent[1]; y += dy) {
                boundary_data.push({x: [x,y]});
            }
        }

        let boundary_preds = this.predict(boundary_data);

        let boundary = boundary_data.map(function(d, i) {
            return {x:d.x, y:boundary_preds[i]};
        });

        return boundary;
    }
}

class Metrics {
    constructor() {
    }

    setData(opts) {
        this.data = opts.data,
        this.preds = opts.preds
    }

    roc() {
        let metrics = [] ;
    
        // For each threshold value in predict_proba, compute metrics
        let thresh_values = this.unique(this.preds);
        thresh_values.forEach((thresh) => {
            let cmetrics = this.compute_metrics(thresh);
            metrics.push(cmetrics);
        })
        metrics.push({tpr:0, fpr:0, precision:1})
        return metrics;
    }

    compute_metrics(thresh) {
        let tpr = [], fpr = [], precision = [];
        let tp = 0, fp = 0, tn = 0, fn = 0;
        this.preds.forEach((d,i) => {
            let truth = this.data[i].y;
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
    
    unique(array) {
        let uniq = [];
        array.forEach((d) => {
            if (!uniq.includes(d)) {
                uniq.push(d);
            }
        })
        uniq.sort();
        return uniq;
    }
}