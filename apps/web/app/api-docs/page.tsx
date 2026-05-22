import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference — Vectra',
  description: 'Documentation interactive de l\'API publique Vectra v1.',
};

// Swagger UI loaded via CDN — avoids bundling the heavy library.
// The spec is served from /public/api-spec.yaml.
export default function ApiDocsPage() {
  return (
    <html lang="fr" style={{ margin: 0, padding: 0, background: '#09090b' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        <style>{`
          body { margin: 0; background: #09090b; }

          /* Top bar */
          .swagger-ui .topbar { background: #09090b; border-bottom: 1px solid #27272a; padding: 10px 0; }
          .swagger-ui .topbar .download-url-wrapper { display: none; }

          /* Info block */
          .swagger-ui .info { margin: 32px 0 24px; }
          .swagger-ui .info .title { color: #fafafa; font-size: 28px; font-weight: 700; }
          .swagger-ui .info .description p { color: #a1a1aa; }
          .swagger-ui .info .base-url { color: #71717a; }

          /* Operation blocks */
          .swagger-ui .opblock { background: #18181b; border: 1px solid #27272a !important; border-radius: 10px; margin-bottom: 8px; }
          .swagger-ui .opblock .opblock-summary { border-bottom: 1px solid #27272a; }
          .swagger-ui .opblock .opblock-summary-description { color: #a1a1aa; }
          .swagger-ui .opblock-body pre.microlight { background: #09090b !important; border-radius: 6px; }

          /* Method badges */
          .swagger-ui .opblock-get .opblock-summary-method { background: #1d4ed8; }
          .swagger-ui .opblock-post .opblock-summary-method { background: #15803d; }
          .swagger-ui .opblock-put .opblock-summary-method { background: #b45309; }
          .swagger-ui .opblock-patch .opblock-summary-method { background: #7c3aed; }
          .swagger-ui .opblock-delete .opblock-summary-method { background: #b91c1c; }

          /* Text colors */
          .swagger-ui, .swagger-ui .opblock-tag, .swagger-ui .opblock-description-wrapper p,
          .swagger-ui table thead tr th, .swagger-ui .parameter__name { color: #e4e4e7; }
          .swagger-ui .model-title, .swagger-ui section.models h4 span { color: #a1a1aa; }

          /* Sections */
          .swagger-ui .scheme-container { background: #18181b; border: 1px solid #27272a; box-shadow: none; padding: 16px; border-radius: 10px; }
          .swagger-ui section.models { background: #18181b; border: 1px solid #27272a; border-radius: 10px; }
          .swagger-ui section.models .model-container { background: #09090b; border-radius: 6px; }

          /* Inputs / buttons */
          .swagger-ui input[type=text], .swagger-ui textarea { background: #27272a; border: 1px solid #3f3f46; color: #fafafa; border-radius: 6px; }
          .swagger-ui .btn { border-radius: 6px; font-weight: 600; }
          .swagger-ui .btn.authorize { background: #18181b; border: 1px solid #3f3f46; color: #a1a1aa; }
          .swagger-ui .btn.authorize svg { fill: #a1a1aa; }
          .swagger-ui .btn.execute { background: #2563eb; }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #09090b; }
          ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }

          /* Back link */
          #vectra-back { position: fixed; top: 14px; left: 16px; z-index: 100; display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #18181b; border: 1px solid #3f3f46; border-radius: 8px; color: #a1a1aa; font-size: 12px; font-weight: 500; text-decoration: none; transition: color .15s; font-family: system-ui, sans-serif; }
          #vectra-back:hover { color: #fafafa; border-color: #71717a; }
        `}</style>
      </head>
      <body>
        <a id="vectra-back" href="/app/settings/developer">← Portail développeur</a>
        <div id="swagger-ui" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
                script.onload = function() {
                  SwaggerUIBundle({
                    url: '/api-spec.yaml',
                    dom_id: '#swagger-ui',
                    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
                    layout: 'BaseLayout',
                    deepLinking: true,
                    tryItOutEnabled: true,
                    requestSnippetsEnabled: true,
                    defaultModelsExpandDepth: 1,
                    syntaxHighlight: { theme: 'monokai' },
                    persistAuthorization: true,
                    docExpansion: 'list',
                  });
                };
                document.head.appendChild(script);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
