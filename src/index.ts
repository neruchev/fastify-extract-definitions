import { FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyRoutes from 'fastify-routes';

import { compile } from './compile';
import { prettify } from './prettify';
import { bannerComment, bannerImports } from './constants';
import { save } from './save';
import { ExtractorOptions } from './types';

export * from './types';

const plugin: FastifyPluginCallback<ExtractorOptions> = async (
  fastify,
  options = { enabled: false, outputs: {} },
  done
) => {
  if (!options.enabled) {
    done();
    return;
  }

  fastify.register(fastifyRoutes);

  fastify.addHook('onReady', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = fastify as any;
    const definitions = app.getSchemas();

    const outputs = Object.keys(options.outputs);
    const baseComment = options.compilerOptions?.bannerComment || bannerComment;

    const [{ text, handlers }, prettier] = await Promise.all([
      compile(app.routes, definitions, options.compilerOptions),
      prettify(options.compilerOptions),
    ]);

    await Promise.all(
      outputs.map(async (output) => {
        const item = options.outputs[output];
        const isServer = item.target === 'serverTypes';

        const banner = baseComment + (isServer ? bannerImports : '');
        const beHandlers = isServer ? handlers : '';

        const formatted = await prettier(banner + text + beHandlers);
        await save(formatted, output);
      })
    );
  });

  done();
};

export default fastifyPlugin(plugin, {
  fastify: '>=3.x',
  name: 'fastify-extract-definitions',
});
