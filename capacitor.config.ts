import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wildvue.app',
  appName: 'Wildvue',
  webDir: 'public',
  server: {
    url: 'https://app.wildvue.com',
    cleartext: false,
    androidScheme: 'https'
  }
};

export default config;
