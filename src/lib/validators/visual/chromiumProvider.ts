import { type Browser, type LaunchOptions, chromium as pwChromium } from '@playwright/test';

const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function buildLaunchOptions(): Promise<LaunchOptions> {
  if (!IS_SERVERLESS) {
    return { headless: true };
  }
  const sparticuz = await import('@sparticuz/chromium');
  const chromiumMod = sparticuz.default ?? sparticuz;
  return {
    args: chromiumMod.args,
    executablePath: await chromiumMod.executablePath(),
    headless: true,
  };
}

export async function launchBrowser(): Promise<Browser> {
  const opts = await buildLaunchOptions();
  return pwChromium.launch(opts);
}
