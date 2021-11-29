/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-this-alias */
/**
 * Self-adjusting interval to account for drifting
 *
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds) - This
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
 function AdjustingInterval(workFunc, interval, errorFunc) {
  const that = this;
  let expected;
  let timeout;
  let timestamp;
  let count = 0;
  this.interval = interval;

  this.start = function () {
    timestamp = Date.now();
    expected = timestamp + this.interval;
    count += 1;
    timeout = setTimeout(step, this.interval);
  };

  this.stop = function () {
    clearTimeout(timeout);
  };

  function step() {
    count += 1;
    const n = Date.now();
    const drift = n - expected;
    if (drift > that.interval) {
      if (errorFunc) errorFunc();
    }

    if (count === 10) {
      workFunc();
      count = 0;
    }
    expected += that.interval;
    timeout = setTimeout(step, Math.max(0, that.interval - drift));
    timestamp = n;
  }
}

export default AdjustingInterval;
