/**
 * Array Utility Functions
 * Performance-optimized array operations
 */

/**
 * Transform array to a full map (object with full items as values)
 * O(n) complexity - use instead of find() in loops
 * 
 * @example
 * const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
 * const usersMap = transformToFullMap(users, 'id');
 * // Result: { 1: { id: 1, name: 'John' }, 2: { id: 2, name: 'Jane' } }
 */
export function transformToFullMap<T>(
  array: T[],
  key: keyof T
): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = item;
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Transform array to a simple map (object with boolean values)
 * Useful for checking existence
 * 
 * @example
 * const ids = [{ id: 1 }, { id: 2 }, { id: 3 }];
 * const idsMap = transformToMap(ids, 'id');
 * // Result: { 1: true, 2: true, 3: true }
 */
export function transformToMap<T>(
  array: T[],
  key: keyof T
): Record<string, boolean> {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = true;
    return acc;
  }, {} as Record<string, boolean>);
}

