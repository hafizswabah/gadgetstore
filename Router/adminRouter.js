const express = require('express')
const Router = express.Router()
const multer = require('multer')
const verifyadmin = require('../middlewares/verifyadmin')

const { adminLogin, Login, adminUser, addProduct, adminProduct, editProduct, productEditPage, productPage, ban, unban, unlistUser,
     userSearch, restrictUser, category, addCategory, addCategoryPage, logout, getdashboard, unlistProduct, listProduct, 
     unlistCategory, listCategory, getofferpage, addofferpage, offer, editbanner, deletebanner,
      editbannerpage, getorderpage, getcoupenpage, getaddcoupen, postaddcoupon, listcoupon, 
      unlistcoupon, geteditcoupon, editcoupon, editOrderStatus ,getsalesReport, hiii} = require('../controller/admin')
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, public/productImages)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})


let storage2 = multer.diskStorage({
    destination: 'public/products',
    filename: (req, file, cb) => {
        cb(null, file.originalname + new Date())
    }
})


let upload = multer({
    storage: storage2
})

Router.get('/login', adminLogin)
Router.post('/loginAdmin', Login)
Router.get('/logout', logout)



Router.get('/dashboard',verifyadmin, getdashboard)
Router.get('/' ,verifyadmin, getdashboard)
Router.get('/staff-managment' ,verifyadmin, adminUser)
Router.get('/order',verifyadmin, getorderpage)
Router.get('/product',verifyadmin, adminProduct)
Router.post('/search',verifyadmin, userSearch)
Router.get('/delete/:id',verifyadmin, unlistUser)
Router.get('/remove-staff/:id',verifyadmin, restrictUser)
Router.get('/user-managment',verifyadmin, ban)
Router.get('/add-staff/:id',verifyadmin, unban)
Router.get('/add',verifyadmin, productPage)
Router.post('/addProduct', verifyadmin, upload.fields([{name:'mainImage', maxCount:1},{name:'subImage', maxCount:12}]),addProduct)
Router.get("/unlist-product/:id",verifyadmin,unlistProduct)
Router.get("/list-product/:id",verifyadmin, listProduct)
Router.get('/edit-product/:id',verifyadmin, productEditPage)
Router.post('/edit-product', verifyadmin,upload.fields([{name:'mainImage', maxCount:1},{name:'subImage', maxCount:12}]) ,editProduct)
Router.get('/category',verifyadmin, category)
Router.get('/addCategoryPage',verifyadmin, addCategoryPage)
Router.post('/addCategory',verifyadmin, addCategory)
Router.get('/unlistCategory/:id',verifyadmin, unlistCategory)
Router.get('/listCategory/:id',verifyadmin, listCategory)
Router.get('/offers',verifyadmin, getofferpage)
Router.get('/add-offerpage',verifyadmin, addofferpage)
Router.post('/add-offer', verifyadmin, upload.single('image'), offer)
Router.get('/edit-offer/:id',verifyadmin, editbannerpage)
Router.get('/delete-offer/:id',verifyadmin, deletebanner)
Router.post('/edit-banner', verifyadmin, upload.single('image'), editbanner)
Router.get('/coupons',verifyadmin,getcoupenpage)
Router.get('/add-coupons',verifyadmin,getaddcoupen)
Router.post('/add-coupon',verifyadmin,postaddcoupon)
Router.get('/list-coupon/:id',verifyadmin,listcoupon)
Router.get('/unlist-coupon/:id',verifyadmin,unlistcoupon)
Router.get('/edit-coupon/:id',verifyadmin,geteditcoupon)
Router.post('/edit-coupon',verifyadmin,editcoupon)
Router.post('/edit-order-status/:id',verifyadmin,editOrderStatus)
Router.get('/sales-report',verifyadmin,getsalesReport)

module.exports = Router