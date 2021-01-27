// THIS NEEDS TO BE FUNCTIONALIZED TO ENABLE REFRESHING
// - Switch between data types
// - Switch between different classifiers
// - Vary "separation" parameter
// - Move / add / delete training data points
// - See multiple ROC curves from past data each time new data are added
// - Vary dataset size
// - click on a point on the ROC curve to see the classifications based on that
// Main takeaways: 
// 1. tangible understanding of the bias-variance tradeoff

// 2. understanding of how ROC curves are constructed 

// These should likely be two separate interactives.

let k_options = [15, 99, 1],
    n_boundary = 50,
    n_train = 100,
    n_test = 100;


// create new chart using Chart constructor
let train_data = new Data({type: 'gaussian', n: n_train}),
    test_data = new Data({type: 'gaussian', n: n_test});

// Initiate an untrained model
let model = new KnnModel(k=k_options[0]);

// Fit the model to the training data and make predictions
model.fit(train_data.data);
let preds = model.predict(test_data.data),
    probs = model.predict_proba(test_data.data),
    boundary = model.predict_boundary({data: test_data.data, extent: test_data.extent, n:n_boundary});

let metrics = new Metrics();
metrics.setData({
    data: test_data.data,
    preds: probs
});
let roc_data = metrics.roc(),
    roc_collection = [];

// Create the scatter chart
const chart = new ScatterChart({
	element: document.querySelector('.plot-training-data'),
    data: train_data.data,
    extent: train_data.extent,
    boundary: boundary,
    axis_labels: {x:"Feature 1", y:"Feature 2"},
});

// Create the prediction chart
const pred_chart = new PredictionsChart({
	element: document.querySelector('.plot-validation-data'),
    data: test_data.data,
    extent: test_data.extent,
    preds: preds,
    boundary: boundary,
    axis_labels: {x:"Feature 1", y:"Feature 2"}
});

// Create the ROC chart
const roc_chart = new RocChart({
    element: document.querySelector('.plot-roc'),
    data: roc_data,
    roc_collection: roc_collection,
    axis_labels: {x:"False Positive Rate", y:"True Positive Rate"},
    extent: {x:[0,1], y:[0,1]}
});

// *** This section need refactoring so that there is only one update script each time a button is pressed

// change data on click to something randomly-generated
d3.selectAll('button.train-data').on('click', () => {
    train_data = new Data({
        type: 'gaussian',
        n: n_train
    });

    model.fit(train_data.data);
    preds = model.predict(test_data.data);
    probs = model.predict_proba(test_data.data);
    boundary = model.predict_boundary({data: test_data.data, extent: test_data.extent, n:n_boundary});
    metrics.setData({
        data: test_data.data,
        preds: probs
    });
    roc_data = metrics.roc()

    let train_options = {   
        data: train_data.data,
        extent: train_data.extent,
        boundary: boundary
    };

    chart.setData(train_options);

    let test_options = {   
        data: test_data.data,
        extent: test_data.extent,
        preds: preds,
        boundary: boundary
    };
    pred_chart.setData(test_options);


    let roc_options = {
        data: roc_data,
        roc_collection: roc_collection
    }
    
    roc_chart.setData(roc_options);
});

d3.selectAll('button.test-data').on('click', () => {
    test_data = new Data({
        type: 'gaussian',
        n: n_test
    });
    // model.fit(train_data.data);
    // chart.setData(train_data.data);
    // model.fit(train_data.data);
    preds = model.predict(test_data.data);
    probs = model.predict_proba(test_data.data);
    boundary = model.predict_boundary({data: test_data.data, extent: test_data.extent, n:n_boundary});
    metrics.setData({
        data: test_data.data,
        preds: probs
    });
    roc_data = metrics.roc()

    let test_options = {   
        element: document.querySelector('.plot-validation-data'),
        data: test_data.data,
        extent: test_data.extent,
        preds: preds,
        boundary: boundary
    };
    pred_chart.setData(test_options);

    let roc_options = {
        data: roc_data,
        roc_collection: roc_collection
    }
    
    roc_chart.setData(roc_options);

});


d3.selectAll('button.save-roc').on('click', () => {
    roc_collection.push(roc_data);

    let roc_options = {
        data: metrics.roc(),
        roc_collection: roc_collection
    }
    
    roc_chart.setData(roc_options);
});

d3.selectAll('button.clear-roc').on('click', () => {
    roc_collection = [];

    let roc_options = {
        data: metrics.roc(),
        roc_collection: roc_collection
    }
    
    roc_chart.setData(roc_options);
});

d3.selectAll('button.cycle-k').on('click', () => {
    // Cycle through k values
    k_options.push(k_options.shift(0));

    // Update the button information to match
    document.getElementsByClassName('cycle-k')[0].innerHTML = 'K = ' + k_options[0];

    model = new KnnModel(k=k_options[0]);
    roc_collection = [];

    model.fit(train_data.data);
    preds = model.predict(test_data.data);
    probs = model.predict_proba(test_data.data);
    boundary = model.predict_boundary({data: test_data.data, extent: test_data.extent, n:n_boundary});
    metrics.setData({
        data: test_data.data,
        preds: probs
    });
    roc_data = metrics.roc()

    let train_options = {   
        data: train_data.data,
        extent: train_data.extent,
        boundary: boundary
    };

    chart.setData(train_options);

    let test_options = {   
        data: test_data.data,
        extent: test_data.extent,
        preds: preds,
        boundary: boundary
    };
    pred_chart.setData(test_options);


    let roc_options = {
        data: roc_data,
        roc_collection: roc_collection
    }
    
    roc_chart.setData(roc_options);
});

// redraw chart on each resize
// in a real-world example, it might be worth ‘throttling’ this
// more info: http://sampsonblog.com/749/simple-throttle-function
d3.select(window).on('resize', () => {chart.draw(); pred_chart.draw(); roc_chart.draw();} );