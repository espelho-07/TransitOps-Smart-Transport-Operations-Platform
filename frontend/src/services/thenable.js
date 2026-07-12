/**
 * Helper to wrap raw data into a Thenable object (Promise-compatible).
 * This allows synchronous initial rendering (preventing white flashes)
 * while remaining fully async-ready (returning standard promises for await/then).
 */
export const makeThenable = (data) => {
  if (data === null || data === undefined) return data;
  
  // Clone the object or array
  const obj = Array.isArray(data) ? [...data] : typeof data === 'object' ? { ...data } : data;
  
  // If it's a primitive, just return it
  if (typeof obj !== 'object') {
    return Promise.resolve(data);
  }

  // Attach then and catch properties
  Object.defineProperty(obj, 'then', {
    value: function(resolve) {
      return Promise.resolve(data).then(resolve);
    },
    configurable: true,
    writable: true
  });

  Object.defineProperty(obj, 'catch', {
    value: function(reject) {
      return Promise.resolve(data).catch(reject);
    },
    configurable: true,
    writable: true
  });

  return obj;
};

export default makeThenable;
