export function delay(t: number) {
  return new Promise(resolve => setTimeout(resolve, t));
}

export function twoDecimalsAbs(x: number) {
  return Math.round(Math.abs(x) * 100) / 100
}