require('dotenv').config();
const express = require("express")
const app = express()
const session = require('express-session');
const port = process.env.PORT || 3000;


const multer = require('multer');

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // files go here
    },
    filename: function (req, file, cb) {
        // Add timestamp to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

// Initialize multer
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"))

app.use(session({
    secret: process.env.SESSION_SECRET, // change this to something secure
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const mongodb = require("mongoose")
const dbURI = process.env.MONGO_URI;

mongodb.connect(dbURI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));


const Admin = require('./public/Schemas/UserSchema.js');
const Section = require('./public/Schemas/SectionSchema.js');
const Product = require('./public/Schemas/ProductSchema.js')


const {
    parseBriefDescription,
    parseSpecifications
} = require('./public/utils/productParsers.js')

function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }
    next();
}

async function createFirstAdmin() {
    const existing = await Admin.findOne({ username: "admin" });
    if (!existing) {
        const admin = new Admin({
            username: "admin",
            name: "Diego", // required
            passwordHash: "Vecino123"    // will be hashed automatically
        });
        await admin.save();
        console.log("First admin created");
    }
}

createFirstAdmin();


app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/admin", requireLogin, async (req, res) => {
    res.sendFile(__dirname + "/admin.html")
})

app.get('/login', (req, res) => res.sendFile(__dirname + '/login.html'));


app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const user = await Admin.findOne({ username });
    if (!user) {
        return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const valid = await user.isValidPassword(password);
    if (!valid) {
        return res.status(401).json({ success: false, message: "Contraseña invalida" });
    }

    req.session.user = {
        id: user._id,
        username: user.username
    };

    const firstLogin = !user.lastLogin;

    if (!firstLogin) {
        user.lastLogin = new Date();
        await user.save();
    }

    res.json({
        success: true,
        firstLogin
    });

});

app.get("/getlastlogin", async (req, res) => {
    const user = await Admin.findById(req.session.user.id);
    if (!user) {
        return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, message: user.lastLogin })
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.post('/reset-password', async (req, res) => {
    try {

        const password = req.body.password;

        const loginuser = await Admin.findById(req.session.user.id);

        // Assign new password — pre-save hook will hash it
        loginuser.passwordHash = password;
        if (!loginuser.lastLogin) {
            loginuser.lastLogin = new Date();
        }
        await loginuser.save();

        req.session.destroy();
        res.json({ success: true, message: 'Contraseña actualizada con exito! <a href="/login">Ingresa aqui</a>' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});

app.post("/Createsections", async (req, res) => {
    try {
        const subsections = Array.isArray(req.body.subsection) ? req.body.subsection : [req.body.subsection];

        await Section.create({
            section: req.body.section,
            subsections
        });

        res.send("Sección creada con éxito!");
    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error
            res.status(400).send("La sección ya existe!");
        } else {
            console.error(err);
            res.status(500).send("Error al crear la sección");
        }
    }
});

app.get("/getSectionslist", async (req, res) => {

    try {
        const findsections = await Section.find();
        if (!findsections) {
            return res.status(401).json({ success: false, message: "Lista de secciónes no encontrado" });
        }

        res.json(findsections)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al listar las secciónes");
    }
})

app.put("/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const subsections = Array.isArray(req.body.subsections) ? req.body.subsections : [req.body.subsections];

        const updated = await Section.findByIdAndUpdate(
            id,
            { section: req.body.section, subsections },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Sección no encontrada" });

        res.json({ success: true, section: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error al actualizar sección" });
    }
});

app.delete("/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Section.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Sección no encontrada" });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error al eliminar sección" });
    }
});

app.get("/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id);

        if (!section) return res.status(404).json({ success: false, message: "Sección no encontrada" });

        res.json(section);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error al traer la sección" });
    }
});

app.post('/CreateProducts', upload.fields([
    { name: 'productimageprin', maxCount: 1 },
    { name: 'productimages', maxCount: 5 } // max 5 extra images
]), async (req, res) => {
    try {
        const product = new Product({
            name: req.body.productname,
            brand: req.body.productbrand,
            section: req.body.productsection,
            subsection: req.body.productsubsection,
            price: req.body.productprice,
            description: req.body.productdesc,
            briefDescription: req.body.productbriefdesc,
            specifications: parseSpecifications(req.body.productspec),
            mainImage: req.files['productimageprin'][0].filename,
            additionalImages: req.files['productimages'] ? req.files['productimages'].map(f => f.filename) : []
        });

        await product.save();
        res.send('Producto creado correctamente!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear producto');
    }
});

app.get("/getProductslist", async (req, res) => {

    try {
        const findproducts = await Product.find();
        if (!findproducts) {
            return res.status(401).json({ success: false, message: "Lista de Productos no encontrado" });
        }

        res.json(findproducts)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al listar los productos");
    }
});

// UPDATE product
app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = {
            name: req.body.productname,
            brand: req.body.productbrand,
            section: req.body.productsection,
            subsection: req.body.productsubsection,
            price: req.body.productprice,
            description: req.body.productdesc,
            briefDescription: req.body.productbriefdesc
        };

        // ✅ Only update specifications if it exists and is not empty
        if (req.body.productspec && req.body.productspec.trim() !== "") {
            updateData.specifications = parseSpecifications(req.body.productspec);
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ success: true, product: updated });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error al editar producto" });
    }
});


app.delete("/products/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/editProduct', async (req, res) => {
    res.sendFile(__dirname + "/editproduct.html")
});

// Get Product by ID for editing
app.get('/editProduct/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Producto no encontrado');
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el producto');
    }
});

app.get("/products", async (req, res) => {
    res.sendFile(__dirname + "/products.html")
})

app.get("/ViewProduct", async (req, res) => {
    res.sendFile(__dirname + "/ViewProduct.html")
})

app.get("/search-products", async (req, res) => {
    res.sendFile(__dirname + "/Searchproducts.html")
})


app.post("/getproduct", async (req, res) => {
    const { subsection, price, brand } = req.body;
    
    try {
        let query = { subsection };

        // Brand filter (array or single value)
        if (brand && brand.length > 0) {
            query.brand = Array.isArray(brand) ? { $in: brand } : brand;
        }

        // Price filter (array of ranges)
        if (price && price.length > 0) {
            query.$or = price.map(range => {
                const [min, max] = range
                    .replace(/\$/g, '')      // remove $ signs
                    .replace(/\./g, '')      // remove dots in numbers
                    .split(' - ')
                    .map(Number);
                return { price: { $gte: min, $lte: max } };
            });
        }

        const getproductinfo = await Product.find(query);
        res.json(getproductinfo);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al conseguir el producto");
    }
});


app.post("/getproductsearchbar", async (req, res) => {
    const searchvalue = req.body.searchQuery;
    
    try {

        let getproductinfo;

        getproductinfo = await Product.find({ subsection: searchvalue })

        if (getproductinfo.length === 0) {
            getproductinfo = await Product.find({ brand: searchvalue });
        }

        if (getproductinfo.length === 0) {
            getproductinfo = await Product.find({ section: searchvalue });
        }

        res.json(getproductinfo);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al conseguir el producto");
    }
});

