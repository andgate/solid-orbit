import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import cleanup from "rollup-plugin-cleanup";


export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/index.js",
      format: "cjs"
    },
    {
      file: "dist/index.js",
      format: "es"
    }
  ],
  external: [
    /@babel\/runtime/,
    "solid-js",
    "@orbit/data",
    "@orbit/memory",
    "@orbit/record-cache"
  ],
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts", ".tsx"]
    }),
    babel({
      extensions: [".js", ".ts"],
      exclude: "node_modules/**",
      babelHelpers: "runtime"
    }),
    cleanup({
      extensions: [".js", ".ts"]
    })
  ]
}
