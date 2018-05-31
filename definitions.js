const url = require('url');

/**
 * Extract the text content of a selected node
 */
exports.text = select(asText);

/**
 * Extract the text of multiple nodes and guarantees results are unique
 */
exports.uniq = select(asText).transform(
  (list) => Object.keys(list.reduce((all, value) => Object.assign(all, { [value]: value }), {}))
);

/**
 * Extract the text content of a node and coverts to a Number,
 * returns 0 if node is missing
 */
exports.number = select(asText, (text) => Number(text) || 0);

/**
 * Extract the attribute / property / data of a node as text
 */
['attr', 'prop', 'data'].forEach((fn) => {
  exports[fn] = select((node, name) => node[fn](name));
});

/**
 * Special treatment for href / src attributes. If the link is relative,
 * converts it to absolute using the base URI
 */
['href', 'src'].forEach((name) => {
  exports[name] = select((node, base) => url.resolve(base, node.attr(name)));
});

/**
 * Logically group nested selectors
 */
exports.group = (selector, template) => ($, iterate) => [$(selector), iterate(template)];

function select(...fns) {
  const resultSelector = (transform) => (selector, ...args) => ($) => [
    $(selector),
    (node) => fns.reduce((prevResult, fn) => fn(prevResult, ...args), node),
    transform
  ];
  const withDefaultTransform = resultSelector();
  withDefaultTransform.transform = resultSelector;
  return withDefaultTransform;
}

function asText(node) {
  return node.text().trim();
}
