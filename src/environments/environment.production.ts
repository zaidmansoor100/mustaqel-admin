export const environment = {
    production: true,
    appBASEUrl: '/',
    cookie: {
        name: '_mus_admin',
        expires: 30,
        path: '/',
        domain: '.mustaqel.jusour.qa',
        secure: false,
        same_site: 'strict'
    },
    tokenExpiry: '60', // Token expires in 1 hour 60 mintues)
    tokenExpiryMin: '900', // Minimum expiry (15 minutes)
    auth_cookie: '_mus_admin',
    apiHostUrl: 'https://mustaqeladmin.jusour.qa',
    mediaURL: 'https://mustaqeladmin.jusour.qa/storage/' /** put slash at last **/
};
