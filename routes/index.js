var express = require('express');
var router = express.Router();
const app = express()
const path=require('path')
/* GET home page. */
const multer=require('multer')
const fs = require('fs');
const bodyParser = require('body-parser');
const countrylist = require("country-list");
const countryNames = countrylist.getNames();
// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
router.get('/register', function (req, res, next) {
    res.render('register',{
        countryNames: countryNames
    });
});

function readRegisterData() {
    const filePath = path.join(__dirname, 'public', 'register.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}



const bcrypt = require('bcrypt');
const saltRounds = 10; 

router.post('/register', async (req, res) => {
    const { name, email, password, confirm, age, country, phone } = req.body;

    let registrationMessage = '';

    if (!name || !email || !password || !confirm || !phone) {
        registrationMessage = 'All fields are required.';
    } else if (password !== confirm) {
        registrationMessage = 'Passwords do not match.';
    } else {
        const passwordPattern = /^(?=.*[A-Z]).{8,}$/;
        if (!passwordPattern.test(password)) {
            registrationMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter.';
        } else {
            const phonePattern = /^\d{10}$/;
            if (!phonePattern.test(phone)) {
                registrationMessage = 'Phone number must be 10 digits.';
            } else {
                const users = readRegisterData();
                const existingUser = users.find((user) => user.email === email || user.phone === phone);

                if (existingUser) {
                    registrationMessage = 'Email or phone number already registered.';
                } else {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);

                    const newUser = {
                        name,
                        email,
                        password: hashedPassword,
                        age,
                        country,
                        phone,
                    };

                    users.push(newUser);
                    const filePath = path.join(__dirname, 'public', 'register.json');
                    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');

                    registrationMessage = 'Registration successful. Login Back!!';
                }
            }
        }
    }

    // Send a single response with the registration message
    res.send(`<script>alert("${registrationMessage}"); window.location.href = "/register";</script>`);
});



router.get('/login', function (req, res) {
    res.render('login')
})
router.get('/register', function (req, res) {
    res.render('register', { country: countryNames })
})
let isAuthenticated = false;
function checkAuth(req, res, next) {
    if (isAuthenticated) {
        next(); 
    } else {
        res.redirect('/login'); 
    }
}


var globalmail,globalname,globalphone,globalage,globalcountry

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    fs.readFile('./routes/public/register.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        try {
            const users = JSON.parse(data);
            const user = users.find((u) => u.email === email);

            if (user) {
                bcrypt.compare(password, user.password, (bcryptErr, result) => {
                    if (bcryptErr) {
                        console.error(bcryptErr);
                        return res.status(500).send('Internal Server Error');
                    }

                    if (result) {
                        globalmail = user.email;
                        globalname = user.name;
                        globalphone = user.phone;
                        globalage = user.age;
                        globalcountry = user.country;
                        isAuthenticated = true;
                        res.redirect('/');
                    } else {
                        res.send('<script>alert("Authentication failed."); window.location.href = "/login";</script>');
                    }
                });
            } else {
                res.send('<script>alert("Authentication failed."); window.location.href = "/login";</script>');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
});


router.get('/profile', checkAuth,function (req, res) {
    res.render("profile",{country : countryNames , name :globalname,email:globalmail,country:globalcountry,age:globalage,phone:globalphone })
})
router.get('/logout',(req,res)=>{
    isAuthenticated = false;
    res.redirect('/login');
})


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });

router.get('/registerproduct', (req, res) => {
    res.render('registerproduct.ejs');
});
function getProductData() {
    const filePath = path.join(__dirname, 'public', 'products.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function writeProductData(data) {
    const filePath = path.join(__dirname, 'public', 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
app.use('./images', express.static(path.join(__dirname, 'public', 'images')));
var registeredProducts = [];
router.post('/registerproduct', upload.single('image'), (req, res) => {
    const { name, description, price, category } = req.body;
    const imagePath = `/images/${req.file.filename}`; 
    const newProduct = {
        name,
        description,
        price: parseFloat(price), 
        category,
        imagePath
    };

    let products = getProductData();
    products.push(newProduct);
    writeProductData(products);

    registeredProducts = products; // Update registeredProducts with the new data

    res.redirect('/');
});

router.get('/', checkAuth, (req, res) => {
    let products = getProductData();
    registeredProducts = products; // Update registeredProducts with the latest data

    res.render('home',{
        products: registeredProducts
    });
});
router.get('/updateprofile',checkAuth,(req,res)=>{
    res.render('updateprofile',{ name :globalname,email:globalmail,countryNames,age:globalage,phone:globalphone })
})

router.post('/updateprofile',checkAuth,(req,res)=>{
    const { name, email, age, country, phone } = req.body;
    const filePath = path.join(__dirname, 'public', 'register.json');
    let users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let user = users.find((user) => user.email === globalmail);
    user.name = name;
    user.email = email;
    user.age = age;
    user.country = country;
    user.phone = phone;
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
    globalname = name;
    globalmail=email
    globalage = age;
    globalcountry = country;
    globalphone = phone;
    res.redirect('/profile');
})
router.get('/deleteprofile',checkAuth,(req,res)=>{
    const filePath = path.join(__dirname, 'public', 'register.json');
    let users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    users = users.filter((user) => user.email !== globalmail);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
    res.redirect('/logout');
})
module.exports = router;
