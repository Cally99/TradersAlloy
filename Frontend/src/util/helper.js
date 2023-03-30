const moment = require('moment');

function getConsole() {
  if (typeof window !== "undefined") {
    return window.console;
  }
  return global.console;
}
const console = getConsole();

function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

const regex = /-(\w)/g;
const camelize = cached(str =>
  str.replace(regex, (_, c) => (c ? c.toUpperCase() : ""))
);

function removeNode(node) {
  if (node.parentElement !== null) {
    node.parentElement.removeChild(node);
  }
}

function insertNodeAt(fatherNode, node, position) {
  const refNode =
    position === 0
      ? fatherNode.children[0]
      : fatherNode.children[position - 1].nextSibling;
  fatherNode.insertBefore(node, refNode);
}

function thousandFormatter(number) {
  return (number) ? (number.toString()).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 0;
};

function thousandFormatterWithDecimal(number, decimal) {
  return (number) ? (Number(number).toFixed(decimal)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : Number(0).toFixed(decimal);
};

function sectorNameConverter(value, thisVal) {
  let name = value;

  if(name === 'Sector / Industry') {
    name = 'sector_sect_industry';
  } else if(name === 'no sector') {
    name = 'sector_no_sector';
  }

  return thisVal.$t(name);
}

function getTimeDiff(timeOld) {
  const diffInYears = moment().diff(timeOld, 'years');
  const diffInMonths = moment().diff(timeOld, 'months') % 12;

  let showYears = false;
  let showMonths = false;

  if(diffInYears > 0) {
    showYears = true;
  }

  if(diffInMonths > 0) {
    showMonths = true;
  }

  let dateMessage = '';

  if(showYears && showMonths) {
    dateMessage += diffInYears + ' years and ' + diffInMonths + ' months ago';
  } else if(showYears) {
    dateMessage += diffInYears + ' years ago';
  } else {
    dateMessage += diffInMonths + ' months ago';
  }

  return dateMessage;
}

export {
  insertNodeAt,
  camelize,
  console,
  removeNode,
  thousandFormatter,
  thousandFormatterWithDecimal,
  sectorNameConverter,
  getTimeDiff
};
