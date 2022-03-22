import * as pt from './crypto.js'

export async function encrypt(request, kv) {
    const body = await request.text()
    const headers = request.headers
    const password = headers.get('x-app-password')
    if (!body || !password) {
        return new Response('', { status: 403 })
    }

    const encrypted = await pt.encrypt(body, password)
    if (!headers.get('x-app-kv')) {
        return new Response(encrypted, {
            headers: { 'content-type': 'text/plain' }
        })
    }

    const key = pt.uuid()
    await kv.put(key, encrypted)
    return new Response(key, {
        headers: { 'content-type': 'text/plain' }
    })
}

export async function decrypt(request, kv) {
    const headers = request.headers
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return new Response('', { status: 500 })
    }
    const {password, key} = await request.json();
    if (!password || !key) {
        return new Response('', { status: 500 })
    }

    const encrypted = await kv.get(key)
    if (encrypted === null) {
        return new Response('', { status: 500 })
    }

    const decrypted = await pt.decrypt(encrypted, password);
    return new Response(decrypted, {
        headers: { 'content-type': 'text/plain' }
    })
}

export async function truncate(request, kv) {
    if (!request.headers.get('x-app-clean')) {
        return new Response('', { status: 403 })
    }

    const value = await kv.list()
    await Promise.all(value.keys.map(async (key) => {
        await kv.delete(key.name)
    }));

    return new Response('ok', {
        headers: { 'content-type': 'text/plain' }
    })
} 