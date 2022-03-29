import * as controller from './handler.js'

export default {
  fetch(request, env, ctx) {
    return handle(request, env)
  },
};

async function handle(request, env) {
  if (request.method === 'OPTIONS' || request.method === 'HEAD') {
    return controller.cors(request, null)
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/encrypt') {
    return controller.encrypt(request, env)
  } else if (path === '/decrypt') {
    let response = await controller.decrypt(request, env)
    return controller.cors(request, response)
  } else if (path === '/truncate') {
    return controller.truncate(request, env)
  } else {
    return new Response('', { status: 404 })
  }
}
