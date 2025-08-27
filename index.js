#!/usr/bin/env node

/**
 * Compares two range arrays for sorting.
 * @param {string[]} a - First range [start, end].
 * @param {string[]} b - Second range [start, end].
 * @returns {number} -1, 0, or 1 for sorting.
 */
function compare(a, b) {
  if (parseInt(a[0]) < parseInt(b[0])) return -1;
  if (parseInt(a[0]) > parseInt(b[0])) return 1;
  if (parseInt(a[1]) < parseInt(b[1])) return -1;
  if (parseInt(a[1]) > parseInt(b[1])) return 1;
  return 0;
}

/**
 * Excludes specified ranges from the included ranges.
 * @param {string[][]} includes - Array of [start, end] ranges to include.
 * @param {string[][]} excludes - Array of [start, end] ranges to exclude.
 * @returns {number[][]} Resulting ranges after exclusion.
 */
function excludeRanges(includes, excludes) {
  let excludeIndex = 0;
  let includeIndex = 0;

  // Initialize output with the first include range
  let output = [
    [parseInt(includes[includeIndex][0]), parseInt(includes[includeIndex][1])],
  ];
  includeIndex++;

  while (true) {
    if (excludeIndex > excludes.length - 1) break;
    const currentInclude = output[output.length - 1];
    const currentExclude = [
      parseInt(excludes[excludeIndex][0]),
      parseInt(excludes[excludeIndex][1]),
    ];

    // Exclude is fully inside current include
    if (
      currentExclude[0] > currentInclude[0] &&
      currentExclude[1] < currentInclude[1]
    ) {
      output[output.length - 1] = [currentInclude[0], currentExclude[0] - 1];
      output.push([currentExclude[1] + 1, currentInclude[1]]);
    }
    // Exclude overlaps right edge of current include
    else if (
      includeIndex >= includes.length - 1 &&
      currentExclude[0] > currentInclude[0] &&
      currentExclude[1] >= currentInclude[1]
    ) {
      output[output.length - 1] = [currentInclude[0], currentExclude[0] - 1];
      output.push([currentExclude[1] + 1, parseInt(includes[includeIndex][1])]);
      includeIndex++;
      continue;
    }
    // Exclude overlaps left edge of first include
    else if (
      includeIndex === 0 &&
      currentExclude[0] <= currentInclude[0] &&
      currentExclude[1] < currentInclude[1]
    ) {
      output[output.length - 1] = [currentExclude[1] + 1, currentInclude[1]];
    }
    // Exclude extends past current include, move to next include
    else if (
      includeIndex < includes.length - 1 &&
      currentExclude[1] > parseInt(includes[includeIndex][1])
    ) {
      includeIndex++;
      output.push([
        parseInt(includes[includeIndex][0]),
        parseInt(includes[includeIndex][1]),
      ]);
      continue;
    }
    // Exclude overlaps next include
    else if (
      includeIndex < includes.length &&
      currentExclude[1] > parseInt(includes[includeIndex][0])
    ) {
      if (
        currentExclude[0] > currentInclude[0] &&
        currentExclude[1] >= currentInclude[1]
      ) {
        output[output.length - 1] = [currentInclude[0], currentExclude[0] - 1];
      }
      output.push([currentExclude[1] + 1, parseInt(includes[includeIndex][1])]);
    }

    excludeIndex++;
  }

  // Merge any remaining includes
  while (includeIndex < includes.length) {
    if (output[output.length - 1][1] >= parseInt(includes[includeIndex][0])) {
      output[output.length - 1][1] = parseInt(includes[includeIndex][1]);
    } else {
      output.push([
        parseInt(includes[includeIndex][0]),
        parseInt(includes[includeIndex][1]),
      ]);
    }
    includeIndex++;
  }

  return output.map((item) => item.join("-")).join(", ");
}

const argos = process.argv.slice(2);

if (argos.length && argos.length % 2 == 0) {
  let include = [];
  let exclude = [];
  for (let i = 0; i < argos.length; i += 2) {
    switch (argos[i]) {
      case "-i":
        include = argos[i + 1].split(",").map((item) => item.split("-"));
        continue;
      case "-e":
        exclude = argos[i + 1].split(",").map((item) => item.split("-"));
        continue;

      default:
        console.log(`unknown parameter: '${argos[i]}'`);
        break;
    }
  }

  console.log(excludeRanges(include.sort(compare), exclude.sort(compare)));
} else {
  console.log("Invalid usage of script.");
}
