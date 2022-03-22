import * as controller from './handler.js'

export default {
  fetch(request, env, ctx) {
    return handle(request, env.kv)
  },
};

async function handle(request, kv) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/encrypt') {
    return controller.encrypt(request, kv)
  } else if (path === '/decrypt') {
    return controller.decrypt(request, kv)
  } else if (path === '/truncate') {
    return controller.truncate(request, kv)
  } else {
    return new Response('', { status: 404 })
  }
}
