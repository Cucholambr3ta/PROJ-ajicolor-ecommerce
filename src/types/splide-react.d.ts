// @splidejs/react-splide no declara "exports" en su package.json, así que
// TS con moduleResolution "bundler" no encuentra sus tipos (sí existen en
// dist/types/index.d.ts, Node los resuelve bien en runtime). Reexporta esos
// tipos reales para el módulo con el nombre con el que se importa.
declare module "@splidejs/react-splide" {
  export {
    Splide,
    SplideSlide,
    SplideTrack,
  } from "@splidejs/react-splide/dist/types/components";
  export * from "@splidejs/react-splide/dist/types/types";
  export { Options } from "@splidejs/splide";
}
