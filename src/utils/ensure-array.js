'use strict';
export default array => {
  if (Array.isArray(array)) return array;
	if (!array) return [];
	return [array];
}
