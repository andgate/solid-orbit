import MemorySource from '@orbit/memory'
import { useContext } from 'solid-js'
import { MemorySourceContext } from 'solid-orbit/contexts/MemorySourceContext' 

export const useMemorySource = (): MemorySource => useContext(MemorySourceContext)