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

class Interactive {
    constructor() {
        // Initialize all properties
        this.k_options = [15, 51, 1];
        this.n_boundary = 50;
        this.n_train = 100;
        this.n_test = 100;

        this.train_data = [];
        this.test_data = [];
        this.model = [];
        this.pred = [];
        this.probs = [];
        this.boundary = [];
        this.metrics = [];
        this.roc_data = [];
        this.roc_collection = [];
        this.chart = [];
        this.pred_chart = [];
        this.roc_chart = [];

        // Build the site
        this.generate_data_training();
        this.generate_data_testing();
        this.reset_model();
        this.fit_model();
        this.plot_train_chart();
        this.plot_test_chart();
        this.plot_roc_chart();
    }

    generate_data_training() {
        this.train_data = new Data({type: 'gaussian', n: this.n_train});
    }

    generate_data_testing() {
        this.test_data = new Data({type: 'gaussian', n: this.n_test});
    }

    reset_model() {
        this.model = new KnnModel(this.k_options[0]); 
    }

    fit_model() {
        this.model.fit(this.train_data.data);
        this.preds = this.model.predict(this.test_data.data);
        this.probs = this.model.predict_proba(this.test_data.data);
        this.boundary = this.model.predict_boundary({data: this.test_data.data, extent: this.test_data.extent, n:this.n_boundary});

        this.metrics = new Metrics();
        this.metrics.setData({
            data: this.test_data.data,
            preds: this.probs
        });
        this.roc_data = this.metrics.roc();
    }

    plot_train_chart() {
        this.chart = new ScatterChart({
            element: document.querySelector('.plot-training-data'),
            data: this.train_data.data,
            extent: this.train_data.extent,
            boundary: this.boundary,
            axis_labels: {x:"Feature 1", y:"Feature 2"},
        });
    }

    plot_test_chart() {
        this.pred_chart = new PredictionsChart({
            element: document.querySelector('.plot-validation-data'),
            data: this.test_data.data,
            extent: this.test_data.extent,
            preds: this.preds,
            boundary: this.boundary,
            axis_labels: {x:"Feature 1", y:"Feature 2"}
        });
    }

    plot_roc_chart() {
        this.roc_chart = new RocChart({
            element: document.querySelector('.plot-roc'),
            data: this.roc_data,
            roc_collection: this.roc_collection,
            axis_labels: {x:"False Positive Rate", y:"True Positive Rate"},
            extent: {x:[0,1], y:[0,1]}
        });
    }

}

// Initiate the plot
let app = new Interactive();

// Interact with the plot through button clicks

// Generate new training data
d3.selectAll('button.train-data').on('click', () => {
    app.generate_data_training();
    app.fit_model();
    app.plot_train_chart();
    app.plot_test_chart();
    app.plot_roc_chart();
});

d3.selectAll('button.test-data').on('click', () => {
    app.generate_data_testing();
    app.fit_model();
    app.plot_train_chart();
    app.plot_test_chart();
    app.plot_roc_chart();
});


d3.selectAll('button.save-roc').on('click', () => {
    app.roc_collection.push(app.roc_data);
    app.plot_roc_chart();
});

d3.selectAll('button.clear-roc').on('click', () => {
    app.roc_collection = [];
    app.plot_roc_chart();
});

d3.selectAll('button.cycle-k').on('click', () => {
    // Cycle through k values
    app.k_options.push(app.k_options.shift(0));

    // Update the button information to match
    document.getElementsByClassName('cycle-k')[0].innerHTML = 'K = ' + app.k_options[0];

    // Refit and redraw all
    app.reset_model();
    app.fit_model();
    app.plot_train_chart();
    app.plot_test_chart();
    app.plot_roc_chart();
});

// Run 25 trials sequentially fitting the model and saving the ROC
d3.selectAll('button.trials').on('click', () => {
    for (let i = 0; i < 100; i++) {
        app.roc_collection.push(app.roc_data);
        app.generate_data_training();
        app.fit_model();
    }

    // Redraw all
    app.plot_train_chart();
    app.plot_test_chart();
    app.plot_roc_chart();
});

// redraw chart on each resize
// in a real-world example, it might be worth ‘throttling’ this
// more info: http://sampsonblog.com/749/simple-throttle-function
d3.select(window).on('resize', () => {app.chart.draw(); app.pred_chart.draw(); app.roc_chart.draw();} );