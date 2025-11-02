export const environment = {
    production: true,
    appBASEUrl: '/',
    cookie: {
        name: '_mus_admin',
        expires: 30,
        path: '/',
        domain: '.mustaqeltest.jusour.qa',
        secure: false,
        same_site: 'strict'
    },
    tokenExpiry: '60', // Token expires in 1 hour 60 mintues)
    tokenExpiryMin: '900', // Minimum expiry (15 minutes)
    auth_cookie: '_mus_admin',
    apiHostUrl: 'https://mustaqeladmintest.jusour.qa',
    mediaURL: 'https://mustaqeladmintest.jusour.qa/storage/' /** put slash at last **/
};
