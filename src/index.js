import * as controller from './handler.js'

export default {
  fetch(request, env, ctx) {
    return handle(request, env.kv)
  },
};

async function handle(request, kv) {
  if (request.method === 'OPTIONS' || request.method === 'HEAD') {
    return controller.cors(request, null)
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/encrypt') {
    return controller.encrypt(request, kv)
  } else if (path === '/decrypt') {
    let response = await controller.decrypt(request, kv)
    return controller.cors(request, response)
  } else if (path === '/truncate') {
    return controller.truncate(request, kv)
  } else {
    return new Response('', { status: 404 })
  }
}
