import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.varunms.dieagain',
  appName: 'Die Again',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
