const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const itemController = require('../controllers/itemController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const homeController = require('../controllers/homeController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));

router.get('/add', authController.isLoggedIn, homeController.add);

/*****************************************      STORES  *****************************************/

router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/addstore', authController.isLoggedIn, storeController.addStore);

router.post('/addstore',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);

router.post('/addstore/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);

router.get('/store/:id/delete', catchErrors(storeController.deleteStore));
router.post('/store/:id/delete', catchErrors(storeController.dropStore));

/************************************************************************************************/


/*****************************************      ITEMS   *****************************************/

router.get('/items', catchErrors(itemController.getItems));
router.get('/items/page/:page', catchErrors(itemController.getItems));
router.get('/item/:id/edit', catchErrors(itemController.editItem));
router.get('/item/:slug', catchErrors(itemController.getItemBySlug));

router.get('/additem', authController.isLoggedIn, itemController.addItem);

router.post('/additem',
    itemController.upload,
    catchErrors(itemController.resize),
    catchErrors(itemController.createItem)
);

router.post('/additem/:id',
    itemController.upload,
    catchErrors(itemController.resize),
    catchErrors(itemController.updateItem)
);

router.get('/item/:id/delete', catchErrors(itemController.deleteItem));
router.post('/item/:id/delete', catchErrors(itemController.dropItem));

router.get('/item/:id/prices', catchErrors(itemController.getItemWithPrices));

/************************************************************************************************/

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
    authController.confirmedPasswords,
    catchErrors(authController.update)
);
router.get('/map', storeController.mapPage);
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));
router.post('/reviews/:id',
    authController.isLoggedIn,
    catchErrors(reviewController.addReview)
);

router.get('/top', catchErrors(storeController.getTopStores));

/*****************************************      API     *****************************************/

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

router.post('/api/items/:id/heart', catchErrors(itemController.heartItem));

/************************************************************************************************/

module.exports = router;