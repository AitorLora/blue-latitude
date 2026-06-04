/**
 * Blue Latitude — Worker
 *
 * Solo se ejecuta para las rutas de video (configurado en wrangler.jsonc
 * con `run_worker_first: ["/assets/videos/*"]`). El resto del sitio lo
 * sirve el sistema de Static Assets de forma estática.
 *
 * Sirve los videos desde el bucket R2 "bluelatitude" (binding MEDIA).
 * R2 soporta HTTP Range de forma nativa, así que el corte del rango se
 * hace en origen (sin cargar el archivo entero en memoria). Esto da el
 * 206 Partial Content que necesita el <video> para hacer "seek", que es
 * lo que mueve el frame al hacer scroll (scrubbing).
 *
 * Mapa de rutas:  /assets/videos/<archivo>  ->  objeto R2 "<archivo>"
 */
export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/assets\/videos\//, ''));
    if (!key) return new Response('Not Found', { status: 404 });

    // Pasamos las cabeceras del request: R2 interpreta Range y onlyIf.
    const object = await env.MEDIA.get(key, {
      range: request.headers,
      onlyIf: request.headers,
    });

    if (object === null) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers); // Content-Type, etc. desde R2
    headers.set('etag', object.httpEtag);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');

    // Petición condicional (If-None-Match / If-Modified-Since) sin cuerpo.
    if (!('body' in object) || object.body === undefined) {
      return new Response(null, { status: 304, headers });
    }

    // ¿Petición de rango? object.range describe el tramo servido.
    const r = object.range;
    if (request.headers.get('Range') && r) {
      let offset = r.offset ?? 0;
      let length = r.length ?? (object.size - offset);
      if (r.suffix != null) {
        offset = object.size - r.suffix;
        length = r.suffix;
      }
      const end = offset + length - 1;
      headers.set('Content-Range', `bytes ${offset}-${end}/${object.size}`);
      headers.set('Content-Length', String(length));
      return new Response(object.body, { status: 206, headers });
    }

    headers.set('Content-Length', String(object.size));
    return new Response(object.body, { status: 200, headers });
  },
};
