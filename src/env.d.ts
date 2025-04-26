interface ImportMetaEnv {
    readonly VITE_URL_SERVER: string;
    // add other environment variables here as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }