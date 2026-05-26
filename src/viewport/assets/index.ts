import { useGLTF } from '@react-three/drei'

export function preloadMachine() {
  useGLTF.preload('/models/machine.glb')
}

export function useMachineGLTF() {
  return useGLTF('/models/machine.glb', /* draco */ true, /* meshopt */ true)
}
