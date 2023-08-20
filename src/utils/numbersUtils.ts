import { Big } from 'big.js'

export const safeMul = (a: number, b: number) => new Big(a).mul(b).toNumber()
export const safeAdd = (a: number, b: number) => new Big(a).add(b).toNumber()
export const safeMinus = (a: number, b: number) =>
  new Big(a).minus(b).toNumber()
