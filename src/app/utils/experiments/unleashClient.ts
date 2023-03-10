import AsyncStorage from "@react-native-async-storage/async-storage"
import { EXPERIMENT_NAME, experiments } from "app/utils/experiments/experiments"
import { nullToUndef } from "app/utils/nullAndUndef"
import { Config } from "react-native-config"
import { UnleashClient } from "unleash-proxy-client"

/**
 * This will return an unleash client
 * If `env` is undefined, it will use whatever environment we are currently using,
 * production by default.
 * If a specific env is asked, then it will either use the current one if it's right,
 * or create a new one in the requested env.
 */
export function getUnleashClient(env?: "production" | "staging", userId?: string | null) {
  if (!unleashClient || (env !== undefined && env !== envBeingUsed)) {
    if (env !== undefined) {
      envBeingUsed = env
    }
    unleashClient = createUnleashClient(nullToUndef(userId))
    unleashClient.start()
  }
  return unleashClient
}

let unleashClient: UnleashClient | null = null

const storageName = (name: string) => `unleash-values:${name}`

const createUnleashClient = (userId: string | undefined) => {
  console.debug("Unleash creating client", envBeingUsed)

  return new UnleashClient({
    url:
      envBeingUsed === "production"
        ? Config.UNLEASH_PROXY_URL_PRODUCTION
        : Config.UNLEASH_PROXY_URL_STAGING,
    clientKey:
      envBeingUsed === "production"
        ? Config.UNLEASH_PROXY_CLIENT_KEY_PRODUCTION
        : Config.UNLEASH_PROXY_CLIENT_KEY_STAGING,
    appName: "eigen",
    context: {
      userId,
    },
    refreshInterval: 0, // don't refresh. we will manually refresh on appStart and goingForeground.
    storageProvider: {
      save: async (name, data) => AsyncStorage.setItem(storageName(name), JSON.stringify(data)),
      get: async (name) => {
        const data = await AsyncStorage.getItem(storageName(name))
        return data ? JSON.parse(data) : undefined
      },
    },
    bootstrapOverride: false,
    bootstrap: (Object.keys(experiments) as EXPERIMENT_NAME[]).map((key) => ({
      name: key,
      enabled: experiments[key].fallbackEnabled,
      variant: {
        enabled: experiments[key].fallbackVariant ? true : false,
        name: experiments[key].fallbackVariant ?? "disabled",
        payload:
          experiments[key].fallbackPayload === undefined
            ? undefined
            : { type: "string", value: String(experiments[key].fallbackPayload) },
      },
      impressionData: true,
    })),
  })
}

let envBeingUsed: "production" | "staging" = "production"
