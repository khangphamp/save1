const isEmpty = (value) => {
  if (!value) return true;
  if (Array.isArray(value)) return value?.length === 0 ? true : false;
  if (typeof value === 'object') return Object.keys(value).length === 0 ? true : false;
};

module.exports = {
  isEmpty,
};
