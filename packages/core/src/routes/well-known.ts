import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { adminConsoleApplicationId } from '@logto/schemas';
import etag from 'etag';

import { getApplicationIdFromInteraction } from '#src/libraries/session.js';

import type { AnonymousRouter, RouterInitArgs } from './types.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(
  ...[router, { provider, libraries }]: RouterInitArgs<T>
) {
  const {
    signInExperiences: { getSignInExperienceForApplication },
    connectors: { getLogtoConnectors },
  } = libraries;

  router.get(
    '/.well-known/sign-in-exp',
    async (ctx, next) => {
      const applicationId = await getApplicationIdFromInteraction(ctx, provider);

      const [signInExperience, logtoConnectors] = await Promise.all([
        getSignInExperienceForApplication(applicationId),
        getLogtoConnectors(),
      ]);

      const forgotPassword = {
        phone: logtoConnectors.some(({ type }) => type === ConnectorType.Sms),
        email: logtoConnectors.some(({ type }) => type === ConnectorType.Email),
      };

      const socialConnectors =
        applicationId === adminConsoleApplicationId
          ? []
          : signInExperience.socialSignInConnectorTargets.reduce<
              Array<ConnectorMetadata & { id: string }>
            >((previous, connectorTarget) => {
              const connectors = logtoConnectors.filter(
                ({ metadata: { target } }) => target === connectorTarget
              );

              return [
                ...previous,
                ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
              ];
            }, []);

      ctx.body = {
        ...signInExperience,
        socialConnectors,
        forgotPassword,
      };

      return next();
    },
    async (ctx, next) => {
      await next();

      ctx.response.etag = etag(JSON.stringify(ctx.body));

      if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
      }
    }
  );
}
