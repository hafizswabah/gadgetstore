const adminModel = require('../models/adminModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const bannerModel = require('../models/offerModel')
const { render } = require('ejs')
const orderModel = require('../models/orderManagment')
const couponModel = require('../models/couponModel')
const moment = require('moment')
const cloudinary = require("../config/cloudinary")

const adminLogin = async(req, res) => {
    let admin = await adminModel.findOne({email:"Admin@gmail.com",password:"123"})
    if(!admin){
        await adminModel.create({email:"Admin@gmail.com",password:"123"})
    }
    res.render('admin/adminLogin')
}

const Login = async (req, res) => {

    const { email, password } = req.body
    console.log(req.body);
    const staff = await userModel.findOne({ email, staff: true })
    const adminAuth = await adminModel.findOne({ email })
    console.log(staff);
    console.log(adminAuth);

    if (adminAuth) {
        if (email == adminAuth.email && password == adminAuth?.password) {
            req.session.admin = { id: adminAuth?._id, admin: true }

            return res.json({ error: false })
        }
        else {
            const message = 'Incorrect Email Or Password'
            return res.json({ error: true, message })
        }
    }
    else {
        if (email == staff?.email && password == staff?.password) {
            req.session.admin = { id: staff?._id, admin: false }
            return res.json({ error: false })
        }
        else {
            const message = 'Invalid staff Details'
            return res.json({ error: true, message })
        }
    }
}

const adminUser = async (req, res) => {
    const userData = await userModel.find({ staff: true }).lean()

    res.render('admin/staffManagment', { userData, admin: req.session.admin.admin })
}
const adminProduct = async (req, res) => {
    var products = await productModel.find().lean();
    res.render('admin/productSection', { products, admin: req.session.admin.admin })
}

const userSearch = async (req, res) => {
    const userName = req.body.name
    const userData = await userModel.find({ name: new RegExp(userName) }).lean()
    res.render('admin/userSection', { userData, admin: req.session.admin.admin })
}

const unlistUser = (req, res) => {
    const id = req.params.id
    userModel.deleteOne({ _id: id })
        .then(() => {
            res.redirect('/admin/user')
        })
        .catch((err) => {
            console.log('error:', err)
        })
}

const restrictUser = async (req, res) => {
    const _id = req.params.id
    await userModel.findByIdAndUpdate(_id, { $set: { staff: false } })
    res.redirect('/admin/staff-managment')



}
const ban = async (req, res) => {
    const users = await userModel.find({ staff: false }).lean()
    res.render('admin/userManagment', { users, admin: req.session.admin.admin })
}
const unban = async (req, res) => {
    const _id = req.params.id
    await userModel.findByIdAndUpdate({ _id }, { $set: { staff: true } })
    res.redirect("/admin/user-managment")

}
const productPage = async (req, res) => {
    const category = await categoryModel.find().lean()

    res.render('admin/addProduct', { category, admin: req.session.admin.admin })
}


const addProduct = async (req, res) => {

    try {

        let mainImage = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: 'sample'
        })
        let subImages = []
        for (let item of req.files.subImage) {
            let result = await cloudinary.uploader.upload(item.path, {
                folder: 'sample'
            })
            subImages.push(result)
        }
        const productDetail = await productModel.create({
            productName: req.body.productName,
            mainImage,
            subImages,
            category: req.body.category,
            price: req.body.price,
            MRP: req.body.MRP,
            quantity: req.body.quantity,
            description: req.body.description,
            brand: req.body.brand
        })
        return res.redirect('/admin/product')

    } catch (err) {
        console.log(err)
    }

}


const unlistProduct = async (req, res) => {
    const _id = req.params.id;
    await productModel.findByIdAndUpdate({ _id }, { $set: { status: false } })

    res.redirect("/admin/product")
}


const listProduct = async (req, res) => {
    const _id = req.params.id;
    await productModel.findByIdAndUpdate({ _id }, { $set: { status: true } })

    res.redirect("/admin/product")
}


const productEditPage = async (req, res) => {
    const product = await productModel.findOne({ _id: req.params.id })
    const category = await categoryModel.find().lean()
    res.render("admin/editProduct", { _id: req.params.id, product, category, admin: req.session.admin.admin })
}


const editProduct = async (req, res) => {
    let mainImage = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: 'sample'
    })
    let subImages = []
    for (let item of req.files.subImage) {
        let result = await cloudinary.uploader.upload(item.path, {
            folder: 'sample'
        })
        subImages.push(result)
    }
    if (req.files.mainImage && req.files.subImage) {
        await productModel.updateOne({ _id: req.body._id }, {
            $set: {
                productName: req.body.productName,
                mainImage,
                subImages,
                category: req.body.category,
                price: req.body.price,
                MRP: req.body.MRP,
                quantity: req.body.quantity,
                description: req.body.description,
                brand: req.body.brand
            }
        })
    } else {
        await productModel.updateOne({ _id: req.body._id }, {
            $set: {
                productName: req.body.productName,
                category: req.body.category,
                price: req.body.price,
                MRP: req.body.MRP,
                quantity: req.body.quantity,
                description: req.body.description,
                brand: req.body.brand
            }
        })
    }

    return res.redirect('/admin/product')
}



const category = async (req, res) => {
    const categoryData = await categoryModel.find().lean()
    res.render('admin/category', { categoryData, admin: req.session.admin.admin })
}

const addCategoryPage = (req, res) => {


    res.render('admin/addCategory', { message: false, admin: req.session.admin.admin })
}
const addCategory = async (req, res) => {

    const categoryExist = await categoryModel.findOne({ category: { $regex: new RegExp(req.body.category, "i") } });

    if (categoryExist) {
        const message = 'Category already exists';
        return res.render("admin/addCategory", { message, admin: req.session.admin.admin });
    }

    const category = await categoryModel.create({ category: req.body.category });



    res.redirect('/admin/category')



}
const unlistCategory = async (req, res) => {
    const _id = req.params.id
    await categoryModel.findByIdAndUpdate({ _id }, { $set: { status: false } })
    res.redirect('/admin/category')
}
const listCategory = async (req, res) => {
    const _id = req.params.id
    await categoryModel.findByIdAndUpdate({ _id }, { $set: { status: true } })
    res.redirect('/admin/category')
}
const logout = (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/login")
}
const getofferpage = async (req, res) => {
    const banners = await bannerModel.find().lean()
    res.render('admin/offerpage', { banners, admin: req.session.admin.admin })
}
const addofferpage = (req, res) => {
    res.render('admin/addofferpage', { admin: req.session.admin.admin })
}
const offer = async (req, res) => {
    try {

        let image = await cloudinary.uploader.upload(req.file.path, {
            folder: 'sample'
        })
        const offerdetails = await bannerModel.create({
            banner: req.body.banner,
            url: req.body.url,
            image

        })
        res.redirect('offers')
    } catch (err) {
        console.log(err)
    }
}
const deletebanner = async (req, res) => {
    await bannerModel.deleteOne({ _id: req.params.id })
    res.redirect("/admin/offers")
}
const editbanner = async (req, res) => {

    if (req?.file?.filename) {
        let image = await cloudinary.uploader.upload(req.file.path, {
            folder: 'sample'
        })
        await bannerModel.updateOne({ _id: req.body.id }, {
            $set: {
                banner: req.body.banner,
                url: req.body.url,
                image

            }
        })
        res.redirect('/admin/offers')
    }
    else {
        await bannerModel.updateOne({ _id: req.body.id }, {
            banner: req.body.banner,
            url: req.body.url
        })
        res.redirect('/admin/offers')
    }
}
const editbannerpage = async (req, res) => {
    const banner = await bannerModel.findOne({ _id: req.params.id })
    res.render('admin/editBannerPage', { banner, admin: req.session.admin.admin })
}
const getorderpage = async (req, res) => {
    const orders = await orderModel.find().lean()
    res.render('admin/orderPage', { orders, admin: req.session.admin.admin })
}
const getcoupenpage = async (req, res) => {
    let coupons = await couponModel.find().lean()
    res.render('admin/coupen', { coupons, admin: req.session.admin.admin })
}
const getaddcoupen = (req, res) => {
    res.render('admin/addCoupons', { admin: req.session.admin.admin })
}
const postaddcoupon = async (req, res) => {
    const coupondetails = await couponModel.create({
        name: req.body.couponName,
        code: req.body.couponcode,
        minAmount: req.body.mindiscount,
        discount: req.body.discount,
        maxDiscountAmount: req.body.maxdiscount,
        expiry: req.body.Expiry
    })

}
const listcoupon = async (req, res) => {

    await couponModel.findByIdAndUpdate(req.params.id, { $set: { unlist: false } })
    res.redirect('/admin/coupons')
}
const unlistcoupon = async (req, res) => {

    await couponModel.findByIdAndUpdate(req.params.id, { $set: { unlist: true } })
    res.redirect('/admin/coupons')
}
const geteditcoupon = async (req, res) => {
    const coupon = await couponModel.findOne({ _id: req.params.id })

    res.render('admin/editcoupon', { coupon, admin: req.session.admin.admin })
}
const editcoupon = async (req, res) => {
    await couponModel.findByIdAndUpdate(req.body.id, {
        $set: {
            name: req.body.couponName,
            code: req.body.couponcode,
            minAmount: req.body.mindiscount,
            discount: req.body.discount,
            maxDiscountAmount: req.body.maxdiscount,
            expiry: req.body.Expiry
        }
    })
    res.redirect('/admin/coupons')
}

const editOrderStatus = async (req, res) => {
    await orderModel.findByIdAndUpdate(req.body.id, { $set: { orderStatus: req.body.orderStatus } })
    res.redirect('/admin/order')
}

const getdashboard = async (req, res) => {
    const orders = await orderModel.find().lean()
    const monthlyDataArray = await orderModel.aggregate([{ $match: { orderStatus: 'delivered' } }, { $group: { _id: { $month: '$createdAt' }, sum: { $sum: '$total' } } }])
    let totalOrders = orders.length
    let totalreveniue = 0
    let totalpending = 0
    let totaldispatch = 0
    console.log(monthlyDataArray);
    orders.map((item) => {
        if (item.orderStatus == "pending" || item.orderStatus == "outForDelivery") {
            totalpending++
        }
        if (item.orderStatus == 'delivered') {
            totalreveniue = totalreveniue + item.amountPayable
            totaldispatch++
        }
    })

    let monthlydataobject = {}
    monthlyDataArray.map((item) => {
        monthlydataobject[item._id] = item.sum
    })

    let monthlydata = []
    for (let i = 1; i <= 12; i++) {
        monthlydata[i - 1] = monthlydataobject[i] ?? 0
    }
    res.render('admin/dashboard', { monthlydata, totaldispatch, totalOrders, totalpending, totalreveniue, admin: req.session.admin.admin })
}

const getsalesReport = async (req, res) => {
    let startDate = new Date(new Date().setDate(new Date().getDate() - 8))
    let endDate = new Date

    if (req.query.startDate) {
        startDate = new Date(req.query.startDate)
        startDate.setHours(0, 0, 0, 0);
    }

    if (req.query.endDate) {
        endDate = new Date(req.query.startDate)
        endtDate.setHours(24, 0, 0, 0);
    }
    if (req.query.filter == 'thisYear') {
        let currentDate = new Date()
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(new Date().setDate(new Date().getDate() + 1))
        endDate.setHours(0, 0, 0, 0);
    }
    if (req.query.filter == 'lastYear') {
        let currentDate = new Date()
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        endDate.setHours(0, 0, 0, 0);
    }
    if (req.query.filter == 'thisMonth') {
        let currentDate = new Date()
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        endDate.setHours(0, 0, 0, 0);
    }
    if (req.query.filter == 'lastMonth') {
        let currentDate = new Date()
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate.setHours(0, 0, 0, 0);
    }

    const order = await orderModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).lean()
    let totalOrders = order.length
    let totalRevenue = 0
    let totalPending = 0
    let totalDiscount = 0
    let totalDispatch = 0
    let totalAmount = 0
    order.map((item) => {
        if (item.orderStatus == 'pending' || item.orderStatus == 'outForDelivery') {
            totalPending++
        }
        if (item.orderStatus == 'delivered' || item.paid == true) {

            totalAmount = totalAmount + item.total
            totalDiscount = item.total - item.amountPayable

        }
        if (item.orderStatus == 'delivered') {
            totalDispatch++
        }
        totalRevenue = totalAmount - totalDiscount
    })

    let filter = req.query.filter ?? ""
    if (!req.query.filter && !req.query.startDate) {
        filter = "lastWeek"
    }
    let orderTable = []
    order.map(item => {
        orderTable.push([item.product.productName, item.total, item.orderStatus, item.quantity, item.createdAt.toLocaleDateString()])
    })

    let categories = await orderModel.aggregate([{ $match: { createdAt: { $gt: startDate, $lt: endDate } } }, { $group: { _id: "$product.category", count: { $sum: 1 }, price: { $sum: "$product.price" } } }])
    let byBrand = await orderModel.aggregate([{ $match: { createdAt: { $gt: startDate, $lt: endDate } } }, { $group: { _id: "$product.brand", count: { $sum: 1 }, profit: { $sum: "$product.price" } } }])
    res.render('admin/salesReport', {
        totalOrders, totalDispatch, totalRevenue, totalAmount, totalDiscount, totalPending, admin: req.session.admin.admin,
        startDate: moment(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).utc().format('YYYY-MM-DD'),
        endDate: moment(endDate).utc().format('YYYY-MM-DD'), filter, orderTable, order, categories, byBrand,
    })
}



const addAdmin = async (req, res) => {
    let email = "Admin@gmail.com";
    let password = process.env.adminPass

    const admin = await adminModel.findOne({ email: email, password: password });
    if (admin) {
        return res.json({ message: "admin exist" })
    }
    await adminModel.create({ email, password })
    return res.json({ message: "admin created" })

}
module.exports = {
    adminLogin, getorderpage, offer, editbanner, editbannerpage,
    deletebanner, offer, getofferpage, addofferpage, Login, logout, getdashboard,
    adminUser, unlistCategory, listCategory, addProduct, adminProduct, editProduct,
    listProduct, unlistProduct, productEditPage, productPage, ban, unban, unlistUser,
    userSearch, restrictUser, category, addCategory, addCategoryPage, getofferpage, getcoupenpage
    , getaddcoupen, postaddcoupon, listcoupon, unlistcoupon, editcoupon, geteditcoupon, editOrderStatus,
    getsalesReport, addAdmin
}