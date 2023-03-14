
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const categoryModel = require('../models/categoryModel')
const nodemailer = require('nodemailer')
const bannerModel = require('../models/offerModel')
const { readdirSync } = require('fs')
const session = require('express-session')
const orderModel = require('../models/orderManagment')
const couponModel = require('../models/couponModel')
const createId=require('../middlewares/createId')
const axios=require('axios')

const signupPage = (req, res) => {
  res.render('user/login', { confirm: false, fill: false, message: false })
}
const loginPage = (req, res) => {

  res.render('user/login')
}
const homePage = async (req, res) => {
  const products = await productModel.find().limit(9).lean()
  const offer = await bannerModel.find().lean()
  console.log(products);
  console.log(offer);
  let login = false
  if (req.session.user) {
    login = true
  }
  else {
    login = false
  }
  res.render('user/home', { products, offer, login })
}
const signup = async (req, res) => {
  const { email, name, password, phoneNumber } = req.body;
  const userDetails = await userModel.findOne({ email })
  console.log(req.body);
  if (userDetails) {
    const message = 'already signed up'
    return res.json({ error: true, message })
  }
  if (req.body.name == "" || req.body.email == "" || req.body.password == "" || req.body.confirmpassword == "" || req.body.phoneNumber == "") {
    const message = 'Please Enter Full Details'
    return res.json({ error: true, message })
  }

  if (req.body.password != req.body.confirmPassword) {
    const message = 'Password Must Be Same'
    return res.json({ error: true, message })
  }
  var randomOtp = Math.floor(Math.random() * 1000000)

  req.session.tempUser = {
    otp: randomOtp,
    name, email, phoneNumber, password
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.password
    },
  });

  var mailOptions = {
    from: 'swabah.a.avd121@gmail.com',
    to: req.body.email,
    subject: "G-CART Email verification",
    html: `
          <h1>Verify Your Email For G-CART</h1>
          <h3>use this code to verify your email</h3>
          <h2>${randomOtp}</h2>
          `,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("email sent error ", error)
    } else {
      console.log("email sent successfull")
    }
  });

  res.json({ error: false })
}

const otpPage = (req, res) => {
  res.render('user/otpPage')
}
const otpforgot = (req, res) => {
  res.render('user/otp-forgot')
}

const otp = async (req, res) => {
  console.log(req.body);
  if (req.session.tempUser.otp == req.body.otp) {
    const { name, email, password, phoneNumber } = req.session.tempUser;
    const user = await userModel.create({
      email, name, password, phoneNumber
    })
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    }
    req.session.tempUser = null;
    return res.json({ error: false })
  }
  else {
    let message = 'You Have Entered Incorrect OTP'
    return res.json({ error: true, message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)
  const userExist = await userModel.findOne({ email: req.body.email })

  if (!userExist) {
    const banUser = 'user not found'
    return res.json({ error: true, message: "User not found" })
  }
  if (userExist.ban) {
    const banUser = 'You were banned'
    return res.json({ error: true, message: "You are banned" })
  }

  const userAuthenticate = await userModel.findOne({ email })

  let user = userAuthenticate
  if (userAuthenticate) {
    if (email == userAuthenticate.email && password == userAuthenticate.password) {
      req.session.user = {
        name: user.name,
        id: user._id,
        email: user.email
      }
      res.json({ error: false })
    }
    else {

      return res.json({ error: true, message: 'Incorrect Password' })
    }
  }
  else {
    const invalid = 'Invalid User'
    return res.json({ error: true, message: 'Invalid User' })

  }
}

const userLogout = (req, res) => {
  req.session.user = null
  res.redirect('/')
}
const fogetPassword = (req, res) => {
  res.render('user/forgetPassword')
}

const otpVerificationPage = (req, res) => {

  res.render('otpVerification', { incorrect: false })
}


const forget = async (req, res) => {
  const mailId = await userModel.findOne({ email: req.body.email })
  console.log(req.body);
  console.log(mailId);
  if (mailId) {
    var randomOtp = Math.floor(Math.random() * 1000000)
    req.session.tempUser = { email: req.body.email, otp: randomOtp }
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "swabah.a.avd121@gmail.com",
        pass: "ihkkvsurxvwlvrnb",
      },
    });
    var mailOptions = {
      from: 'swabah.a.avd121@gmail.com',
      to: req.body.email,
      subject: "G-CART OTP Verification",
      html: `
        <h1>Reset Your Password</h1>
          <h3>use this OTP</h3>
          <h2>${randomOtp}</h2>
        `,
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("email sent error ", error)
      } else {
        console.log("email sent successfull")
      }
    });

    res.json({ error: false })
  }
  else {

    res.json({ error: true, message: 'Not Found Such an Email please Check mail ID' })
  }

}
const forgototpVerification = (req, res) => {
  if (req.session.tempUser.otp == req.body.otp) {
    return res.json({ error: false })
  }
  else {
    let message = 'You Have Entrerd Incorrect OTP'
    res.json({ error: true, message })
  }
}


const ResetPassword = async (req, res) => {
  let userEmail = req.session.tempUser.email
  await userModel.updateOne({ email: userEmail }, {
    $set: {
      password: req.body.password,

    }
  })
  res.redirect("/login")


}

const getChangePassword = (req, res) => {
  res.render("user/changePassword")
}
const getProductPage = async (req, res) => {
  const category = await categoryModel.find().lean()
  const pageNumber = req.query.page ?? 1;
  let perpage = 1 ;
  let documentcount
  const products = await productModel.find().countDocuments()
    .then((documents => {
      documentcount = documents
      return productModel.find().skip((pageNumber - 1) * perpage).limit(perpage)
    }))
  let currentPage = pageNumber
  let totalDocuments = documentcount
  let pages = Math.ceil(documentcount / perpage)

  res.render('user/product', { category, products, currentPage, totalDocuments, pages })
}
const categorySort = async (req, res) => {
  try{

  const category = await categoryModel.find().lean()
  const pageNumber = req.query.page 
  const name = req.query.name ?? "";
  const sort = req.query.sort ?? "";
  const filter = req.query.filter ?? 0;
  let perpage = 6;
  let documentcount
  let products = []
  if (filter == 0) {
    products = await productModel
      .find({
        productName: new RegExp(name, "i"),
        category: new RegExp(sort, "i"),
        unlist: false,
      })
      .sort({ price: -1 })
      .skip(pageNumber * perpage)
      .limit(perpage)
      .lean()
  } else {
    products = await productModel
      .find({
        productName: new RegExp(name, "i"),
        category: new RegExp(sort, "i"),
        unlist: false,
      })
      .sort({ price: filter })
      .skip(pageNumber * perpage)
      .limit(perpage)
      .lean();
  }
  let currentPage = pageNumber
  let totalDocuments = documentcount
  let count = await productModel.find().count();
  let pages = Math.ceil(count / perpage);

  res.render('user/productList', { category, products, currentPage, totalDocuments, pages, name, filter, sort })
}
catch(err){
  console.log(err)
  res.redirect("/")
}
}

const productinfo = async (req, res) => {
  try {


    const product = await productModel.findOne({ _id: req.params.id }).lean()
    const userId = req.session?.user?.id
    let whishlistItems = []
    if (userId) {
      const { whishlist } = await userModel.findOne({ _id: userId }, { whishlist: 1 }).lean()
      whishlistItems = whishlist.map((item => {
        return item.productId
      }))
    }
    let wish
    console.log(whishlistItems)
    console.log(req.params.id)

    if (whishlistItems.includes(req.params.id)) {

      console.log('enter')

      wish = true


    } else {
      console.log('not ')
      wish = false

    }
    console.log(product)
    res.render('user/product', { product, wish })
  } catch (err) {
    res.json(err)
  }

}


const addtocart = async (req, res) => {
  const productId = req.params.id
  const userId = req.session.user.id
  await userModel.findByIdAndUpdate(userId, {
    $addToSet: {
      cart: {
        id: productId,
        quantity: 1
      }
    }
  })

  res.redirect('/cart')
}
const getCart = async (req, res) => {
  try {

    const _id = req.session.user.id
    const { cart } = await userModel.findOne({ _id }, { cart: 1 })

    const cartItems = cart.map((item) => {
      return item.id
    })

    const products = await productModel.find({ _id: { $in: cartItems } }).sort({ _id: 1 }).lean()
    let carts = {}
    cart.map((item) => {
      carts[item.id] = item.quantity;
    })
  
    const productdetail = products.map((item, index) => {
      return { ...item, cartQuantity: carts[item._id] }
     })

    let totalAmount = 0
    products.forEach((item, index) => {
      totalAmount = totalAmount + (item.price * cart[index].quantity)
    })

    res.render('user/cart', { productdetail, totalAmount })
  } catch (err) {
    res.json(err)
  }

}
const getwhishlist = async (req, res) => {
  const userId = req.session.user.id
  const { whishlist } = await userModel.findOne({ _id: userId }, { whishlist: 1 })

  const whishlistItems = whishlist.map(item => {
    return item.productId
  })
  const products = await productModel.find({ _id: { $in: whishlistItems } }).lean()


  res.render('user/wishlist', { products })
}
const addtowhishlist = async (req, res) => {
  const productId = req.params.id
  const userId = req.session.user.id
  await userModel.findByIdAndUpdate({ _id: userId }, {
    $addToSet: {
      whishlist: {
        productId: productId
      }
    }
  })
  res.redirect('back')
}
const removefromwhishlist = async (req, res) => {
  const productId = req.params.id
  const userId = req.session.user.id
  await userModel.findByIdAndUpdate({ _id: userId }, {
    $pull: {
      whishlist: {
        productId: productId
      }
    }
  })
  res.redirect('back')

}
const getcheckout = (req, res) => {
  res.render('checkout')
}
const addaddress = (req, res) => {
  res.render('user/addAddress')
}
const editaddress = async (req, res) => {
  const addressId = req.params.id
  let { address } = await userModel.findOne({ _id: req.session.user.id }, { address: 1 })
  let found = address.find(e => e.id == addressId)

  res.render('user/editAddress', { found })
}
const editingAddress = async (req, res) => {
  const userId = req.session.user.id
  await userModel.updateOne({ _id: userId, address: { $elemMatch: { id: req.body.id } } }, {
    $set: {
      "address.$": req.body
    }
  })
  res.redirect('/user-profile')
}
const deleteaddress = async (req, res) => {

  await userModel.findByIdAndUpdate({ _id: req.session.user.id }, { $pull: { address: { id: req.params.id } } })
  res.redirect('/user-profile')
}
const addingAddress = async (req, res) => {
  const userId = req.session.user.id
  const address = req.body
  address.id = 'id' + (new Date()).getTime();
  await userModel.findByIdAndUpdate({ _id: userId }, { $addToSet: { address: address } })
  res.redirect('/user-profile')


}
const userProfile = async (req, res) => {
  const userId = req.session.user.id
  const user = await userModel.findOne(({ _id: userId }))


  const address = await userModel.findOne({ _id: userId }, { address: 1 })
  console.log(address);
  res.render('user/userProfile', { user, address })
}
const checkoutpage = async (req, res) => {
  const address = await userModel.findOne({ _id: req.session.user.id }, { address: 1 })
  const wallet=await userModel.findOne({ _id: req.session.user.id }, { wallet: 1 })
  const _id = req.session.user.id
  const { cart } = await userModel.findOne({ _id }, { cart: 1 })
  const cartItems = cart.map((item) => {
    return item.id
  })

  const products = await productModel.find({ _id: { $in: cartItems } }).sort({ _id: 1 }).lean()
  let carts = {}
  cart.map((item) => {
    carts[item.id] = item.quantity;
  })

  const productdetail = products.map((item, index) => {

    return { ...item, cartQuantity: carts[item._id] }

  })
  let totalAmount = 0
  products.forEach((item, index) => {
    totalAmount = totalAmount + (item.price * cart[index].quantity)
  })

  res.render('user/checkout', { address, totalAmount,wallet })
}
const quantityup = async (req, res) => {
  await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
    $inc: {
      "cart.$.quantity": 1
    }
  })
  res.json({ success: true })

}
const quantitydown = async (req, res) => {
  let { cart } = await userModel.findOne({ "cart.id": req.params.id }, { _id: 0, cart: { $elemMatch: { id: req.params.id } } })

  if (cart[0].quantity <= 1) {
    return res.json({ success: false })
  }
  await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
    $inc: {
      "cart.$.quantity": -1
    }
  })
  return res.json({ success: true })
}
const removefromcart = async (req, res) => {
  await userModel.findByIdAndUpdate({ _id: req.session.user.id }, { $pull: { cart: { id: req.params.id } } })
  res.redirect('/cart')
}
const orderplace = (req, res) => {
  res.render('user/orderplace')
}


const orderHistory = async (req, res) => {
  const orders = await orderModel.find({ userId: req.session.user.id }).lean()
  console.log(orders);
  res.render('user/orderhistory', { orders })
}

const applycoupon = async (req, res) => {
  const coupon = await couponModel.findOne({ code: req.body.coupon })
  if (!coupon) {
    let message = 'No such Coupon found'
    return res.json({ error: true, message })
  }
  else {


    const { cart } = await userModel.findOne({ _id: req.session.user.id }, { cart: 1 })

    const cartItems = cart.map(item => {
      return item.id
    })

    let products = await productModel.find({ _id: { $in: cartItems } }).lean()
    let discountAmount = 0
    for (let index in products) {
      products[index].amountPayable = products[index].price;
      if (products[index].price > coupon.minAmount) {
        discountAmount = Math.floor(products[index].price * coupon.discount / 100)
        if (discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
        products[index].amountPayable = products[index].price - discountAmount;
      }
    }
    res.json({ error: false, discountAmount })
  }
}
const applyWallet=async(req,res)=>{
  console.log(req.body);
  
  if(parseInt(req.body.wallet)> parseInt(req.body.orginalAmount)){
    let result=parseInt(req.body.wallet) -parseInt(req.body.orginalAmount) ;
    let total=0;
    let wallet=result; 
    await userModel.updateOne({_id:req.session.user.id},{$inc:{"wallet":-wallet}}).then(result=>{
      console.log(result);
    })
    res.json({error:false,wallet,total})
  }else{
    let result= parseInt(req.body.orginalAmount)-parseInt(req.body.wallet) ;
    let wallet=0;
    await userModel.updateOne({_id:req.session.user.id},{$set:{"wallet":0}}).then(result=>{
      console.log(result);
    })
    let total=result;
    res.json({error:false,wallet,total})
  }
  
//   const wallet = await userModel.find({_id:req.session.user.id},{wallet:1}).lean()
//   console.log(wallet);

// const { cart } = await userModel.findOne({ _id: req.session.user.id }, { cart: 1 })

//  const cartItems = cart.map(item => {
//     return item.id
//   })

//   let products = await productModel.find({ _id: { $in: cartItems } }).lean()
//   for(let index in products){
//     products[index].amountPayable=products[index].amountPayable-(products.length/wallet)
//   }
  
}


const orderplacement = async (req, res) => {
  try{
 
  if (req.body.payment == 'cod') {
    let discountAmount = 0
    const coupon = await couponModel.findOne({ code: req.body.coupon })
    const { cart } = await userModel.findOne({ _id: req.session.user.id }, { cart: 1 })

    const cartItems = cart.map(item => {
      return item.id
    })

    let products = await productModel.find({ _id: { $in: cartItems } }).lean()

    if (coupon) {

      for (let index in products) {
        products[index].amountPayable = products[index].price;
        if (products[index].price > coupon.minAmount) {
          discountAmount = Math.floor(products[index].price * coupon.discount / 100)
          if (discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
          products[index].amountPayable = products[index].price - discountAmount;
        }
      }
    }
    const { address } = await userModel.findOne({ _id: req.session.user.id }, { address: { $elemMatch: { id: req.body.address } } })
    let orders = []
    let i = 0
    console.log(discountAmount)
    for (let item of products) {
      orders.push({
        address: address[0],
        product: item,
        userId: req.session.user.id,
        quantity: cart[i].quantity,
        total: cart[i].quantity * item.price,
        amountPayable: cart[i].quantity * item.price - (discountAmount / products.length)
      })
      i++
    }

    const order = await orderModel.create(orders)
    await userModel.findByIdAndUpdate({ _id: req.session.user.id }, { $set: { cart: [] } })
    res.redirect('/orderplace')
  } else {

    let discountAmount = 0
    const coupon = await couponModel.findOne({ code: req.body.coupon })
    const { cart } = await userModel.findOne({ _id: req.session.user.id }, { cart: 1 })

    const cartItems = cart.map(item => {
      return item.id
    })

    let products = await productModel.find({ _id: { $in: cartItems } }).lean()
    let totalamountpayble = 0;
    if (coupon) {
req.session.couponcode={code:coupon.code}
      for (let index in products) {
        products[index].amountPayable = products[index].price;
        if (products[index].price > coupon.minAmount) {
          discountAmount = Math.floor(products[index].price * coupon.discount / 100)
          if (discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
          products[index].amountPayable = products[index].price - discountAmount;
        }
      }

      products.forEach(item => {
        totalamountpayble = totalamountpayble + item.amountPayable
      })

    }
    else {
      products.forEach((item, index) => {
        totalamountpayble = totalamountpayble + (item.price * cart[index].quantity)

      })


    }
const user=await userModel.findOne({_id:req.session.user.id})
req.session.userDetails=user
console.log(req.session.userDetails);
    const { address } = await userModel.findOne({ _id: req.session.user.id }, { address: { $elemMatch: { id: req.body.address } } })
    req.session.userAddress={id:address[0].id}


    // cashfree
    let orderId = "order_" + createId();
    const options = {
      method: "POST",
      url: "https://sandbox.cashfree.com/pg/orders",
      headers: {
        accept: "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": '336657a76ae0c6ecd5bf471e36756633',
        "x-client-secret": '342903f011f9389cc33de39c502a89715d97a5a8',
        "content-type": "application/json",
      },
      data: {
        order_id: orderId,
        order_amount: totalamountpayble,
        order_currency: "INR",
        customer_details: {
          customer_id: req.session.user.id,
          customer_email: req.session.user.email,
          customer_phone: req.session.userDetails.phoneNumber,
        },

        order_meta: {
          return_url: "https://gadgets.swabah.online/return?order_id={order_id}"
        },
      },
    };

    await axios
      .request(options)
      .then(function (response) {

        return res.render("user/paymenttemp", {
          orderId,
          sessionId: response.data.payment_session_id,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }
} catch(err){
  console.log(err);
}
}
const paymenturl=async(req,res)=>{
  try {
    const order_id = req.query.order_id;
    const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
            accept: "application/json",
            "x-api-version": "2022-09-01",
            "x-client-id": '336657a76ae0c6ecd5bf471e36756633',
            "x-client-secret": '342903f011f9389cc33de39c502a89715d97a5a8',
            "content-type": "application/json",
        },
    };

    const response = await axios.request(options);

    const { cart } = await userModel.findOne({ _id: req.session.user.id }, { cart: 1 })
  
    const cartItems = cart.map(item => {
      return item.id
    })

    let products = await productModel.find({ _id: { $in: cartItems } }).lean()
    if (response.data.order_status == "PAID") {
      let discountAmount = 0
      if(req.session.couponcode){
      const coupon = await couponModel.findOne({ code: req.session.couponcode.code })
      for (let index in products) {
        products[index].amountPayable = products[index].price;
        if (products[index].price > coupon.minAmount) {
          discountAmount = Math.floor(products[index].price * coupon.discount / 100)
          if (discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
          products[index].amountPayable = products[index].price - discountAmount;
        }
      }
      }
     
  
      const { address } = await userModel.findOne({ _id: req.session.user.id }, { address: { $elemMatch: { id: req.session.userAddress.id } } })
      let orders = []
      let i = 0
      console.log(discountAmount)
      for (let item of products) {
        orders.push({
          address: address[0],
          paid:true,
          paymentType:'online',
          product: item,
          userId: req.session.user.id,
          quantity: cart[i].quantity,
          total: cart[i].quantity * item.price,
          amountPayable: cart[i].quantity * item.price - (discountAmount / products.length)
        })
        i++
      }
  
      const order = await orderModel.create(orders)
      await userModel.findByIdAndUpdate({ _id: req.session.user.id }, { $set: { cart: [] } })
      res.render('user/orderplace')
    }
  }
  catch(err){
    console.log('payment',err);
  }


}

const cancelOrder=async(req, res)=> {
  const _id = req.params._id;
  const order = await orderModel.findOne({ _id });
  console.log(order);
  let walletInc=order.amountPayable;
  if (order.paid) {
    await userModel.updateOne(
      { _id: req.session.user.id },
      { $inc: { wallet: walletInc } }
    );
  }
  await orderModel.updateOne(
    { _id },
    {
      $set: {
        orderStatus: "cancelled",
      },
    }
  );
  res.redirect("/order-history");
}

const returnProduct=async(req,res)=>{
  const _id=req.params._id
  const order=await orderModel.findOne({_id})
  if (order.orderStatus="delivered") {
    let walletInc=order.amountPayable;
    await userModel.updateOne(
      { _id: req.session.user.id },
      { $inc: { wallet: walletInc } }
    );
  }
  await orderModel.updateOne({_id},
    {$set:{orderStatus:'Return Proccessing' }})
    res.redirect('/order-history')
}
const orderedProduct=async(req,res)=>{
  try{
  const _id=req.params._id
  const order= await orderModel.findOne({_id})
 return res.render('user/product-order',{order})
}catch(err)
{
  console.log(err);
}
}

const coupons=async(req,res)=>{
  const coupons=await couponModel.find().lean()
  console.log(coupons);
  res.render('user/Coupons',{coupons})
}
module.exports = {
  signupPage, getProductPage, getChangePassword, categorySort, otpforgot,
  otp, otpPage, homePage, loginPage, login, signup, userProfile, userLogout, fogetPassword, forgototpVerification,
  forget, otpVerificationPage, ResetPassword, productinfo, addtocart, getCart, getwhishlist, addtowhishlist,
  removefromwhishlist, getcheckout, addaddress, editaddress, addingAddress, editingAddress, deleteaddress, checkoutpage,
  quantityup, quantitydown, removefromcart, orderplacement, orderplace, orderHistory, applycoupon,paymenturl,
  cancelOrder,returnProduct,orderedProduct,coupons,applyWallet
}