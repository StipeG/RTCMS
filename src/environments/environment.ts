// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backend: {
    host: 'http://localhost:9004',
  },
  oauth: {
    host: 'https://demo0034835.mockable.io',
    client_id: '2',
    client_secret: 'tsN80QNwTawD3WZSX2uziOFI6HstTEs2bXBqsCyv',
    scope: '*',
  },
  movieDB: {
    host: 'https://api.themoviedb.org/3',
  },
  ba:{
    //EleybeNiTyW
    id: 'RWxleWJlTmlUeVc=',
    //Ta9hCw+{'b2KK-#TZz_C]9
    client_secret: 'VGE5aEN3K3snYjJLSy0jVFp6X0NdOQ=='
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.