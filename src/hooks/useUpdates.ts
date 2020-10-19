import { useMemorySource } from 'solid-orbit/hooks/useMemorySource'
import { TransformsToActions } from 'solid-orbit/types'

export const useUpdates = <
  T extends Record<string, (...args: any[]) => Promise<any>>
>(
  transforms: TransformsToActions<T>
): T => {
  const memory = useMemorySource()

  const actions: any = {}
  Object.keys(transforms).map((propName: string) => {
    const transform = transforms[propName]
    const action = (...args: any[]) => memory.update(transform(...args))
    actions[propName] = action
  })

  return actions as T
}
