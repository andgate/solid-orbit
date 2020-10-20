import alias from '@rollup/plugin-alias';
import babel from "@rollup/plugin-babel";
import cleanup from "rollup-plugin-cleanup";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "path";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/index.js",
      format: "cjs",
      exports: "auto"
    },
    {
      file: "dist/index.js",
      format: "es"
    }
  ],
  external: [
    /@babel\/runtime/,
    /solid-js/,
    /@orbit\/data/,
    /@orbit\/memory/,
    /@orbit\/record-cache/
  ],
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts", ".tsx"]
    }),
    alias({
      resolve: [
        { find: 'solid-orbit', replacement: path.resolve(__dirname, "src") }
      ]
    }),
    babel({
      extensions: [".js", ".ts", ".tsx"],
      exclude: "node_modules/**",
      babelHelpers: "runtime"
    }),
    cleanup({
      extensions: [".js", ".ts"]
    })
  ]
}
