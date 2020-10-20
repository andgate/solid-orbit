# solid-orbit

[![npm](https://img.shields.io/npm/v/solid-orbit.svg)](https://www.npmjs.com/package/solid-orbit)

[Solid](https://github.com/ryansolid/solid) bindings for [Orbit](https://orbitjs.com/).

This package provides Solid a provider and hooks for Orbit. Most notably, this provides a `useQuery` hook which is a query transform listener, updating component props with records as they are changed.

Based heavily on [developertown/react-orbitjs](https://github.com/developertown/react-orbitjs).

# Installation

npm
```
npm install --save solid-orbit
```

yarn
```
yarn add solid-orbit
```

# Example

Components that use hooks from this library must be children of `OrbitProvider`. 

```tsx
import { render, template, insert, createComponent } from 'solid-js/dom'
import MemorySource from '@orbit/memory'
import { Schema } from '@orbit/data'
import { OrbitProvider, OrbitRecord } from 'solid-orbit'

const schema = new Schema({
  models: {
    planet: {
      attributes: {
        name: { type: 'string' }
      }
    }
  }
})

const memory = new MemorySource({ schema });

const PlanetList: Component = () => {
  const recordsToPlanets = (records: OrbitRecord[]): string[] =>
    records.map(record => record?.attributes.name as string)
  const query = useQuery<{planets: string[]}>({
    planets: [
      q => q.findRecords("planet").sort("name"),
      recordsToPlanets
    ]
  })

  const actions = useUpdates({
    addPlanet: (name: string) => (t) => t.addRecord({
      type: 'planet', 
      id: name,
      attributes: {
        name
      }
    }),
    removePlanet: (name: string) => t => t.removeRecord({
      type: 'planet',
      id: name
    })
  })

  const [newPlanet, setNewPlanet] = createSignal<string>()

  return (
    <>
      <ul>
        <For each={query().planets}>
        {(planet) =>
          <li>{planet}</li>
          <button onClick={() => actions.removePlanet(planet)}>Delete</button>
        }
        </For>
      </ul>
      <input
        type="text"
        placeholder="enter planet name"
        value={newPlanet()}
        onInput={e => setNewPlanet(e.target.value)}
      />
      <button
        onClick={() => {
          actions.addPlanet(newPlanet())
          setNewPlanet('')
        }}
      >Add</button>
    </>
  )

}

const App: Component = () => (
  <OrbitProvider memory={memory}>
    <PlanetList>
  </OrbitProvider>
)

render(() => <App />, document.body)
```

# API

### `OrbitProvider`

Provider for using orbit hooks.

### `useQuery<T extends Record<string, unknown>>(subscribeToQueries: RecordsToProps<T>): (() => T)`

Hook which takes an object where the fields are queries coupled with a transform function, and returns a signal object that updates when query results are changed by a transform.

### `useUpdates<T extends Record<string, (...args: any[]) => Promise<any>>>(transforms: TransformsToActions<T>): T`

Hook which takes an object of functions that return transform builder functions, and maps them to an object of functions that return `Promise<any>`.

