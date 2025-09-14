export function $id(id) {
  return document.getElementById(id);
}
export function createEl(tag, attrs={}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === "class") el.className = v;
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if(typeof child === "string") el.textContent = child;
    else if(child) el.appendChild(child);
  });
  return el;
}
export function clear(el) {
  if (el) el.replaceChildren();
}
