import { win32 } from 'path'
/**
 * @return {array} containing entry & fragments
 */
export default ({entry, fragments}) => {
  if (!entry || !fragments) {
    console.warn(new Error(entry ? 'fragments undefined' : 'entry undefined'));
  }
  return [entry, ...fragments];
}
