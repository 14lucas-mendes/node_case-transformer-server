const { createServer: createHttpServer } = require('node:http');
const { convertToCase } = require('./convertToCase');

/**
 * Cria e retorna um servidor HTTP que converte textos entre casos.
 * @returns {import('node:http').Server}
 */
function createServer() {
  const server = createHttpServer((req, res) => {
    // Sempre responder com JSON
    res.setHeader('Content-Type', 'application/json');

    const url = req.url || '/';
    const [path, queryString = ''] = url.split('?');

    // Texto é o path sem a barra inicial
    const rawText = path.startsWith('/') ? path.slice(1) : path;
    const text = rawText ? decodeURIComponent(rawText) : '';

    const params = new URLSearchParams(queryString);
    const toCase = params.get('toCase');

    const supportedCases = new Set([
      'SNAKE',
      'KEBAB',
      'CAMEL',
      'PASCAL',
      'UPPER',
    ]);
    const errors = [];

    // Validações
    if (!text) {
      errors.push({
        message:
          'Text to convert is required. Correct request is: ' +
          '"/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
      });
    }

    if (!toCase) {
      errors.push({
        message:
          '"toCase" query param is required. Correct request is: ' +
          '"/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
      });
    } else if (!supportedCases.has(toCase)) {
      errors.push({
        message:
          'This case is not supported. Available cases: ' +
          'SNAKE, KEBAB, CAMEL, PASCAL, UPPER.',
      });
    }

    if (errors.length > 0) {
      res.statusCode = 400;
      res.statusMessage = 'Bad request';
      res.end(JSON.stringify({ errors }));

      return;
    }

    // Invoca a lógica de negócio
    const { originalCase, convertedText } = convertToCase(text, toCase);

    const body = {
      originalCase,
      targetCase: toCase,
      originalText: text,
      convertedText,
    };

    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.end(JSON.stringify(body));
  });

  return server;
}

module.exports = {
  createServer,
};
