export const utils = `
function throttle(callback, delay = 1000) {
  let shouldWait = false;
  return (...args) => {
    if (shouldWait) return;
    callback(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
}

function debounce(callback, delay = 1000) {
  let time;
  return (...args) => {
    clearTimeout(time);
    time = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function shallowEqual(object1, object2) {
  return JSON.stringify(object1) === JSON.stringify(object2)
}
`;
