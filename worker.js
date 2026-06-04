/**
 * Blue Latitude — Worker
 *
 * Solo intercepta las rutas de video (configurado en wrangler.jsonc con
 * `run_worker_first: ["/assets/videos/*"]`). El resto del sitio lo sirve
 * el sistema de Static Assets de forma estática.
 *
 * Motivo: Cloudflare Static Assets NO responde a peticiones HTTP Range
 * (devuelve 200 con el archivo completo y sin `Accept-Ranges`), lo que
 * impide el "seek" del <video> y rompe el scrubbing por scroll.
 * Aquí leemos el asset completo y devolvemos 206 Partial Content con
 * `Content-Range`, que es lo que el navegador necesita para hacer seek.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Pedimos el asset completo al sistema de Static Assets (devuelve 200).
    const assetRes = await env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));

    if (!assetRes.ok) return assetRes; // 404, etc.

    const contentType = assetRes.headers.get('Content-Type') || 'video/mp4';
    const range = request.headers.get('Range');

    // Sin cabecera Range: devolvemos el archivo entero, pero anunciando
    // que aceptamos rangos (para que el navegador haga seek si lo necesita).
    if (!range) {
      const headers = new Headers(assetRes.headers);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(assetRes.body, { status: 200, headers });
    }

    const buffer = await assetRes.arrayBuffer();
    const total = buffer.byteLength;

    const match = /bytes=(\d*)-(\d*)/.exec(range);
    let start = match && match[1] !== '' ? parseInt(match[1], 10) : 0;
    let end = match && match[2] !== '' ? parseInt(match[2], 10) : total - 1;

    if (Number.isNaN(start)) start = 0;
    if (Number.isNaN(end) || end >= total) end = total - 1;

    // Rango inválido → 416.
    if (start > end || start >= total) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${total}`, 'Accept-Ranges': 'bytes' },
      });
    }

    const chunk = buffer.slice(start, end + 1);

    return new Response(chunk, {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(chunk.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
