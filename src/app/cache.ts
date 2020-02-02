import { zip } from './knn/jsHelper';

export class Cache {
  cache = {};

  get(key, computeValue) {
    // FK-TODO: Vergleich geht glaube ich über eine Stringkonvertierung des keys, was nicht gut ist. Anders prüfen mit compareFlatArrays().
    if (!this.containsKey(key)) {
      this._cacheValueForKey({ key, value: computeValue() });
    }
    return this._getValueForKey(key);
  }

  containsKey(key) {
    return this.cache.hasOwnProperty(key);
  }

  cacheValuesForKeys({ keys, values }) {
    zip(keys, values).forEach(([key, value]) => this._cacheValueForKey({ key, value }));
  }

  _cacheValueForKey({ key, value }) {
    this.cache[key] = value;
  }

  getValuesForKeys({ keys }) {
    return keys.map(key => this._getValueForKey(key));
  }

  _getValueForKey(key) {
    return this.cache[key];
  }
}
