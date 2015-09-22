
let
  nonWord   = /[^\w, ]+/,
  accended  = "àáäâèéëêìíïîòóöôùúüûñç",
  plain     = "aaaaeeeeiiiioooouuuunc";
  


let normalize = (str) => {
  let i, l;

  str = str.toLowerCase();
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  
  // remove accents, swap ñ for n, etc
  for(i = 0, l = accended.length; i < l; i++) {
    str = str.replace(new RegExp(accended.charAt(i), 'g'), plain.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  return str;
};


// http://en.wikipedia.org/wiki/Levenshtein_distance
let levenshtein = (str1, str2) => {
  let current = [], prev, value, i, j;

  for(i = 0; i <= str2.length; i++) {
    for (j = 0; j <= str1.length; j++) {
      if (i && j) {
        if (str1.charAt(j - 1) === str2.charAt(i - 1)) {
          value = prev;
        } else {
          value = Math.min(current[j], current[j - 1], prev) + 1;
        }
      } else {
        value = i + j;
      }

      prev = current[j];
      current[j] = value;
    }
  }
  return current.pop();
};


let distance = (str1, str2) => {
  let dist = levenshtein(str1, str2);

  if (str1 === null && str2 === null) { throw new Error("Trying to compare two null values"); }
  if (str1 === null || str2 === null) { return 0; }

  str1 = String(str1); 
  str2 = String(str2);
  
  if (str1.length > str2.length) {
    return 1 - dist / str1.length;
  } else {
    return 1 - dist / str2.length;
  }
};


let iterateGrams = (value, gramSize) => {
  let simplified, lenDiff, results, i;

  gramSize = gramSize || 2;
  simplified = '-' + value.toLowerCase().replace(nonWord, '') + '-';
  lenDiff = gramSize - simplified.length;
  results = [];

  if(lenDiff > 0) {
    for(i = 0; i < lenDiff; ++i) {
      value += '-';
    }
  }
  
  for(i = 0; i < simplified.length - gramSize + 1; ++i) {
    results.push(simplified.slice(i, i + gramSize));
  }

  return results;
};


let gramCounter = (value, gramSize) => {
  // return an object where key=gram, value=number of occurrences
  let result, grams, i;

  result = {};
  gramSize = gramSize || 2;
  grams = iterateGrams(value, gramSize);

  for (i = 0; i < grams.length; ++i) {
    if (grams[i] in result) {
      result[grams[i]] += 1;
    } else {
      result[grams[i]] = 1;
    }
  }

  return result;
};

let sortDescending = (a, b) => {
  if (a[0] < b[0]) { return 1; } 
  else if (a[0] > b[0]) { return -1; } 
  else { return 0; }
};

let isEmptyObject = (obj) => {
  let prop;
  for(prop in obj) {
    if(obj.hasOwnProperty(prop)) { return false; }
  }
  return true;
};


class FuzzySet {
  constructor(list, levenshtein, sizeLower, sizeUpper) {
    
    if(list.some(function(str) { return typeof str !== "string";})) {
      throw new Error("Fuzzy list argument elements must be strings!");
    }

    this.sets = {
      matches: {},
      items: {},
      exact: {}
    };

    this.options = {
      "levenshtein":    levenshtein ? true : false,
      "sizeLower":      sizeLower ? sizeLower : 2,
      "sizeUpper":      sizeUpper ? sizeUpper : 3 
    };

    this.data = list || [];

    for(i = this.options.sizeLower; i < this.options.sizeUpper + 1; ++i) {
      this.sets.items[i] = [];
    }
    // add all the items to the set
    for(i = 0; i < data.length; ++i) {
      this.add(this.data[i]);
    }

  }

  add(value) {
    let i, normalizedValue = normalize(value);

    if(normalizedValue in this.sets.exact) {
      return false;
    }

    i = this.options.sizeLower;
    for (i; i < this.options.sizeUpper + 1; ++i) {
      __add(value, i);
    }
  }
  
  get(value, defaultValue) {
    let result;

    result = __get(value);

    if(!result && defaultValue) {
      return defaultValue;
    }
    return result;
  }

  length() {
    let count, prop;

    count = 0;

    for(prop in this.sets.exact) {
      if(this.sets.exact.hasOwnProperty(prop)) { count++; }
    }
    return count;
  }

  empty() {
    let prop;

    for(prop in this.sets.exact) {
      if(this.sets.exact.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }
  
  values() {
    let values, prop;

    values = [];

    for(prop in this.sets.exact) {
      if (this.sets.exact.hasOwnProperty(prop)) {
        values.push(this.sets.exact[prop]);
      }
    }
    return values;
  }


  __add(value, gramSize) {
    let 
      normalizedValue,
      items,
      index,
      gramCounts,
      sumOfSquareGramCounts,
      gram,
      gramCount,
      normal;


    normalizedValue = normalize(value);
    items = this.sets.items[gramSize] || [];
    index = items.length;
    items.push(0);

    gramCounts = gramCounter(normalizedValue, gramSize);
    sumOfSquareGramCounts = 0;

    for(gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if(gram in this.sets.matches) {
        this.sets.matches[gram].push([index, gramCount]);
      } else {
        this.sets.matches[gram] = [[index, gramCount]];
      }
    }

    normal = Math.sqrt(sumOfSquareGramCounts);
    items[index] = [normal, normalizedValue];
    
    this.sets.items[gramSize] = items;
    this.sets.exact[normalizedValue] = value;
  }

  __calculate(value, gramSize) {
    var 
      normalizedValue = normalize(value),
      matches = {},
      gramCounts = gramCounter(normalizedValue, gramSize),
      items = this.sets.items[gramSize],
      sumOfSquareGramCounts = 0,
      gram,
      gramCount,
      i,
      index,
      otherGramCount,
      normal,
      results,
      matchScore,
      matchIndex,
      newResults,
      endIndex;

    for(gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if (gram in this.sets.matches) {
        for (i = 0; i < this.sets.matches[gram].length; ++i) {
          index = this.sets.matches[gram][i][0];
          otherGramCount = this.sets.matches[gram][i][1];
          if (index in matches) {
            matches[index] += gramCount * otherGramCount;
          } else {
            matches[index] = gramCount * otherGramCount;
          }
        }
      }
    }

    if(isEmptyObject(matches)) {
      return null;
    }

    normal = Math.sqrt(sumOfSquareGramCounts);
    results = [];

    // build a results list of [score, str]
    for(matchIndex in matches) {
      matchScore = matches[matchIndex];
      results.push([matchScore / (normal * items[matchIndex][0]), items[matchIndex][1]]);
    }
    
    results.sort(sortDescending);
    if(options.levenshtein) {
      newResults = [];
      endIndex = Math.min(50, results.length);
      
      // truncate somewhat arbitrarily to 50
      for(i = 0; i < endIndex; ++i) {
        newResults.push([distance(results[i][1], normalizedValue), results[i][1]]);
      }
      results = newResults;
      results.sort(sortDescending);
    }
    
    newResults = [];
    for(i = 0; i < results.length; ++i) {
      if(results[i][0] === results[0][0]) {
        newResults.push([results[i][0], sets.exact[results[i][1]]]);
      }
    }
    return newResults;
  }

  __get(value) {
    var
      normalizedValue,
      result,
      results,
      gramSize;

    normalizedValue = normalize(value);
    result = this.sets.exact[normalizedValue];

    if(result) {
      return [[1, result]];
    }

    results = [];
    // start with high gram size and if there are no results, go to lower gram sizes
    for(gramSize = this.options.sizeUpper; gramSize >= this.options.sizeLower; --gramSize) {
      results = this.__calculate(value, gramSize);
      if(results) {
        return results;
      }
    }
    return null;
  }
}

export default FuzzySet;
