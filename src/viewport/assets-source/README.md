# Source assets

Heavy source files **not shipped to the client**. Vite's `public/` directory
is copied verbatim into the build output, so anything large that we don't
serve at runtime belongs here instead.

## machine.original.glb (~31 MB)

Uncompressed export from the CAD pipeline. The runtime model is
`public/models/machine.glb` (~2.5 MB, draco + meshopt compressed). Keep this
original around for re-compression / pipeline reruns; it never reaches the
build output and never goes over the wire.
