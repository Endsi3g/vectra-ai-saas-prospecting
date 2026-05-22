import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'Documentation interactive de l\'API publique Vectra.',
};

// Swagger UI is loaded via CDN to avoid bundling the heavy library.
// The spec is served from /public/api-spec.yaml.
export default function ApiDocsPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <div
        id="swagger-ui"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: '100vh',
          background: '#09090b',
        }}
      />
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
                });
              };
              document.head.appendChild(script);
            })();
          `,
        }}
      />
    </>
  );
}
