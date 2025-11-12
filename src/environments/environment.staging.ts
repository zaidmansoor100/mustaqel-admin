export const environment = {
    production: true,
    appBASEUrl: '/',
    cookie: {
        name: '_mus_admin',
        expires: 30,
        path: '/',
        domain: 'localhost',
        secure: false,
        same_site: 'strict'
    },
    tokenExpiry: '60', // Token expires in 1 hour 60 mintues)
    tokenExpiryMin: '900', // Minimum expiry (15 minutes)
    auth_cookie: '_mus_admin',
    apiHostUrl: 'http://192.168.201.5:8069',
    mediaURL: 'http://192.168.201.5:8069/storage/' /** put slash at last **/
};
