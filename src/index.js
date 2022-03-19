import { encrypt } from './crypto.js'

export default {
  fetch(request) {
    return handle(request)
  },
};

async function handle(request) {
  const body = await request.text()
  const password = request.headers.get('x-app-password')
  if (!body || !password) {
    return new Response()
  }

  const encrypted = await encrypt(body, password)
  return new Response(encrypted, {
    headers: { 'content-type': 'text/plain' }
  })
}

