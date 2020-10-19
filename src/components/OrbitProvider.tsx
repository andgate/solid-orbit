import MemorySource from '@orbit/memory'
import { Component } from 'solid-js'
import { MemorySourceContext } from 'solid-orbit/contexts/MemorySourceContext'

export type OrbitProviderProps = {
  memory: MemorySource
}

export const OrbitProvider: Component<OrbitProviderProps> = (props) => (
  <MemorySourceContext.Provider value={props.memory}>
    {props.children}
  </MemorySourceContext.Provider>
)
