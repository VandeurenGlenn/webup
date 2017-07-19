import { win32 } from 'path'
/**
 * @return {array} containing entry & fragments
 */
export default ({entry, fragments, element}) => {
  if (!entry || !fragments && !element) {
    console.warn(new Error(entry ? 'fragments undefined' : 'entry undefined'));
  }
  return [entry, ...fragments];
}
