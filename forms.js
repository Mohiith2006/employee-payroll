export function bindForm(form, onSubmit) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries((new FormData(form)).entries());
    onSubmit(data, form);
  });
}
