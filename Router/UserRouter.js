
const express = require('express')
const Router = express.Router()
const {signupPage,loginPage,homePage,login,signup,userProfile,userLogout, fogetPassword, otpVerification, forget, otpVerificationPage, getChangePassword, ResetPassword, otp, otpPage, getProductPage, searchProducts, categorySort, filterproducts, productinfo, cartpage, getCart, addtocart, getwhishlist, addtowhishlist, removefromwhishlist, addaddress, editaddress, addingAddress, editingAddress, deleteaddress, checkoutpage, quantityup, quantitydown, removefromcart, orderplacement, orderplace, splide, orderHistory, applycoupon, otpforgot, forgototpVerification, paymenturl, orderedProduct, cancelOrder, returnProduct, wallet, coupons, applyWallet}=require('../controller/user')
const verifyUser = require("../middlewares/verifyUser")

Router.get('/signup',signupPage)

Router.get('/login', loginPage)

Router.get('/',homePage )
Router.post('/signup', signup)
Router.post('/login',login)

Router.get('/add-address',verifyUser,addaddress)
Router.get('/edit-address/:id',verifyUser,editaddress)
Router.get('/delete-address/:id',verifyUser,deleteaddress)
Router.post('/edit-address',verifyUser,editingAddress)
Router.post('/add-address',verifyUser,addingAddress)
Router.get('/checkout',verifyUser,checkoutpage)
Router.get('/add-quantity/:id',verifyUser,quantityup)
Router.get('/down-quantity/:id',verifyUser,quantitydown)

Router.post('/otp',otp)
Router.get('/otp-page',otpPage)
Router.get('/otp-page-forgot',otpforgot)

Router.get('/user-profile',verifyUser,userProfile)
Router.get('/logout',userLogout)
Router.get('/forget',fogetPassword)
Router.get('/otpVerification',otpVerificationPage)
Router.post('/fogot-otp',forgototpVerification)
Router.post('/forget',forget)
Router.get('/change-password',getChangePassword)
Router.post('/reset-password',ResetPassword)
Router.get('/product-page',getProductPage)

Router.get('/shop',categorySort)
Router.get('/product-info/:id',productinfo)
Router.get('/add-to-cart/:id',verifyUser,addtocart)
Router.get('/cart',verifyUser,getCart)
Router.get('/wishlist',verifyUser,getwhishlist)
Router.get('/add-to-whishlist/:id',verifyUser,addtowhishlist)
Router.get('/remove-from-whishlist/:id',verifyUser,removefromwhishlist)
Router.get('/remove-from-cart/:id',verifyUser,removefromcart)
Router.get('/orderplace',verifyUser,orderplace)
Router.post('/orderplace',verifyUser,orderplacement)
Router.get('/order-history',verifyUser,orderHistory)
Router.post('/apply-coupon',applycoupon)
Router.get('/return',paymenturl)
Router.get('/ordered-product/:_id',orderedProduct)
Router.get('/cancel-order/:_id',cancelOrder)
Router.get('/return-order/:_id',returnProduct)
Router.get('/user-coupons',coupons)
Router.post('/apply-wallet',applyWallet)




module.exports = Router