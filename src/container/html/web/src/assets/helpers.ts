export const textmap = (
  text: string, 
  keyObject: {[key: string]: string}): string  => {
    let map = Object.keys(keyObject);
    map.forEach((key): void => {
      let targetEl = keyObject[key];
      targetEl = targetEl.slice(1, targetEl.length )
      let regx = new RegExp(key, "g")
      text = text.replace(regx, targetEl)
    })
    return text;
}