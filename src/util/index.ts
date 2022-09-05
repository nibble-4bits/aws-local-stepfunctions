export function isPlainObj(value: any): boolean {
  return !!value && Object.getPrototypeOf(value) === Object.prototype;
}
