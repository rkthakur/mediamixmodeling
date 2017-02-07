var PythonShell = require('python-shell');

PythonShell.run('../RegressionAnalysis/LinearRegression.py', function (err, results) {
  if (err) throw err;
  console.log('finished', results);
});
