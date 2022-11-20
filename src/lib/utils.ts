export function waitThen<T>(func: () => T, waitTime = 500): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = func();

        // Gottcha: Promise.resolves *flattens* the promise, so even though "result" can be a Promise, we only have to await once outside of waitThen
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }, waitTime)
  })
}