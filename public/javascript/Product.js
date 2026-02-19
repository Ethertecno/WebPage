document.getElementById("logotext").addEventListener("click", function () {
    window.location.href = "/";
});

document.getElementById("footer-image").addEventListener("click", function () {
    window.location.href = "/";
});

const searchbar = new URLSearchParams(window.location.search).get('search');
const productSubsec = new URLSearchParams(window.location.search).get('product');

if (productSubsec) {
    const price = "";
    const brand = "";
    displayfilters(productSubsec);
    displayproducts(productSubsec, price, brand);

}

if (searchbar) {
    const price = "";
    const brand = "";

    displayproducts(productSubsec, price, brand);
}

if (!searchbar && !productSubsec) {

    if (document.getElementById("applyfilter")) {
        document.getElementById("applyfilter").style.display = "none";
    }
    if (document.getElementById("mobileFilterButton")) {
        document.getElementById("mobileFilterButton").style.display = "none";
    }
    productlist();
}

const productId = new URLSearchParams(window.location.search).get('id');

if (productId) {

    fetch(`/editProduct/${productId}`)
        .then(res => res.json())
        .then(product => {

            const contents = document.getElementById("contents")
            const productsDiv = document.getElementById("Products");
            const contentsbottom = document.getElementById("contentsbottom")
            if (productsDiv) {
                productsDiv.remove();
            }

            const viewdiv = document.createElement("div");
            viewdiv.innerHTML = ""
            viewdiv.className = "viewproduct"
            viewdiv.id = "viewproduct"
            const productdescriptiondiv = document.createElement("productdescription")

            const imagediv = document.createElement("div");
            imagediv.className = "ImageContainer"
            const imagesadidiv = document.createElement("div");
            imagesadidiv.className = "addDivContainer"
            const productdescdiv = document.createElement("div");
            productdescdiv.className = "productdesc"

            const aditionalimages = product.additionalImages;

            aditionalimages.forEach(Img => {
                const Adimagediv = document.createElement("div")
                Adimagediv.className = "aditionalImage"
                Adimagediv.innerHTML = `<img src="${Img}" alt="Product Image">`;
                imagesadidiv.appendChild(Adimagediv)
            });

            imagediv.innerHTML = `<img src="${product.mainImage}" alt="Product Image">`;

            const descelement = document.createElement("h2");
            descelement.textContent = product.description;

            const nameelement = document.createElement("p");
            nameelement.textContent = product.name;

            const brandelement = document.createElement("h3");
            brandelement.textContent = product.brand;

            const pricecontainer = document.createElement("div")
            pricecontainer.className = "pricecontainer"
            const pricetext = document.createElement("h3")
            pricetext.textContent = "Precio"
            const priceelement = document.createElement("h2");
            const formattedPrice = new Intl.NumberFormat('es-CL').format(product.price);
            priceelement.textContent = `$${formattedPrice}`;

            const buttondiv = document.createElement("a");
            buttondiv.textContent = "Comprar ahora"
            buttondiv.className = "whatsapp-btn-comprar"

            const link = window.location.href;
            const message = `Hola, quiero información sobre el producto ${link}`;

            buttondiv.href = `https://wa.me/56963034920?text=${encodeURIComponent(message)}`;
            buttondiv.target = "_blank";
            buttondiv.rel = "noopener";

            const bottomdiv = document.createElement("div")
            bottomdiv.className = "bottomdiv"

            const briefdescContainer = document.createElement("div");
            briefdescContainer.className = "brief-description";
            briefdescContainer.id = "brief-description";

            // Set text directly and preserve line breaks
            briefdescContainer.textContent = product.briefDescription;
            briefdescContainer.style.whiteSpace = "pre-line"; // preserves line breaks
            briefdescContainer.style.fontSize = "2ch"; // adjust as needed

            bottomdiv.appendChild(briefdescContainer);

            if (Array.isArray(product.specifications) && product.specifications.length > 0) {
                const specsContainer = document.createElement("div");
                specsContainer.className = "specifications";
                specsContainer.id = "specifications";
                specsContainer.style.display = "none";

                product.specifications.forEach(section => {
                    // Section title
                    const sectionTitle = document.createElement("h3");
                    sectionTitle.textContent = section.section;
                    specsContainer.appendChild(sectionTitle);

                    // Table
                    const table = document.createElement("table");
                    table.className = "spec-table";

                    section.items.forEach(item => {
                        const row = document.createElement("tr");

                        const keyTd = document.createElement("td");
                        keyTd.textContent = item.key;
                        keyTd.className = "spec-key";

                        const valueTd = document.createElement("td");
                        valueTd.textContent = item.value;
                        valueTd.className = "spec-value";

                        row.appendChild(keyTd);
                        row.appendChild(valueTd);
                        table.appendChild(row);
                    });

                    specsContainer.appendChild(table);
                });
                document.getElementById("showSpecs").style.display = "block";
                bottomdiv.appendChild(specsContainer);
            }

            pricecontainer.appendChild(pricetext)
            pricecontainer.appendChild(priceelement);
            productdescdiv.appendChild(descelement);
            productdescdiv.appendChild(nameelement);
            productdescdiv.appendChild(brandelement);
            productdescdiv.appendChild(pricecontainer);
            productdescdiv.appendChild(buttondiv);

            productdescriptiondiv.appendChild(productdescdiv);
            viewdiv.appendChild(imagesadidiv)
            viewdiv.appendChild(imagediv)

            viewdiv.appendChild(productdescriptiondiv)

            contents.appendChild(viewdiv)
            contentsbottom.appendChild(bottomdiv)

            const mainImage = imagediv.querySelector("img");
            const thumbnails = imagesadidiv.querySelectorAll("img");

            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener("mouseenter", () => {
                    mainImage.src = thumbnail.src;
                });
            });
        });
}
function showdesc() {
    document.getElementById("specifications").style.display = "none";
    document.getElementById("brief-description").style.display = "block";
    document.getElementById("descdiv").style.display = "block";

    document.querySelector(".showDesc").classList.add("activeTab");
    document.querySelector(".showSpecs").classList.remove("activeTab");
}

function showspecs() {
    document.getElementById("specifications").style.display = "block";
    document.getElementById("brief-description").style.display = "none";
    document.getElementById("descdiv").style.display = "none";

    document.querySelector(".showSpecs").classList.add("activeTab");
    document.querySelector(".showDesc").classList.remove("activeTab");
}


async function displaysections() {

    const sectionsdiv = document.getElementById("Sectionsdiv");
    sectionsdiv.innerHTML = "";

    const sectionslist = await fetch("/getSectionslist");
    if (sectionslist.ok) {
        const data = await sectionslist.json();

        data.forEach(product => {

            const sectionind = document.createElement("div");
            sectionind.className = "section";

            const sectionelement = document.createElement("h3");
            sectionelement.textContent = product.section;

            const subsectionelement = document.createElement("div");
            subsectionelement.className = product.section;

            product.subsections.forEach(subsection => {
                const subsectionelementtext = document.createElement("h3");
                subsectionelementtext.textContent = subsection;
                subsectionelementtext.onclick = function () {
                    window.location.href = `/products?product=${subsection}`
                };
                subsectionelement.appendChild(subsectionelementtext);
            });

            sectionind.appendChild(sectionelement);
            sectionind.appendChild(subsectionelement);

            sectionsdiv.appendChild(sectionind);
        });

        const somosdiv = document.createElement("div");
        somosdiv.className = "somosdiv";

        const somosa = document.createElement("h3");
        somosa.textContent = "Quiénes somos";
        somosa.onclick = function () {
            window.location.href = "/";
        };

        somosdiv.appendChild(somosa);
        sectionsdiv.appendChild(somosdiv);

        const categdiv = document.createElement("div");
        categdiv.className = "categdiv";

        const categtext = document.createElement("h3");
        categtext.textContent = "Categorias";
        categtext.onclick = function () {
            window.location.href = "/products";
        };

        categdiv.appendChild(categtext);
        sectionsdiv.appendChild(categdiv);

        // Add contact button at the bottom (for mobile menu)
        const contactDiv = document.createElement("div");
        contactDiv.className = "mobile-contact";

        const contactBtn = document.createElement("a");
        contactBtn.className = "mobile-contact";
        contactBtn.textContent = "Contáctanos"
        contactBtn.href = "https://wa.me/56963034920?text=Hola%20quiero%20más%20información";
        contactBtn.target = "_blank";
        contactBtn.rel = "noopener";

        contactDiv.appendChild(contactBtn);
        sectionsdiv.appendChild(contactDiv);

    }
}

displaysections();

async function displayproducts(subsection, price, brand) {

    const query = new URLSearchParams(window.location.search)
        .get('search')?.trim();

    const bodyData = {};
    let getproduct;

    if (subsection) bodyData.subsection = subsection;
    if (brand && brand.length > 0) bodyData.brand = brand;
    if (price && price.length > 0) bodyData.price = price;


    try {
        if (query) {

            bodyData.searchQuery = query;

            getproduct = await fetch('/getproductsearchbar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

        } else {

            getproduct = await fetch('/getproduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
        }

        if (getproduct.ok) {

            if (document.getElementById("viewproduct")) {
                document.getElementById("viewproduct").style.display = "none";
            }

            if (document.getElementById("Productslistdiv")) {
                document.getElementById("Productslistdiv").style.display = "none"
            }

            const data = await getproduct.json();

            const productcatalog = document.getElementById("ProductCatalog")

            productcatalog.innerHTML = ""

            if (!data || data.length === 0) {
                const msg = document.createElement("h2");
                msg.textContent = "No se encontraron productos";
                msg.style.textAlign = "center";
                msg.style.color = "#d4a62a";
                msg.style.margin = "100px";
                productcatalog.appendChild(msg);
                return; // exit early
            }

            data.forEach(product => {

                const productdiv = document.createElement("div");
                productdiv.className = "productdiv"
                const imageElement = document.createElement("div")
                imageElement.innerHTML = `<img src="${product.mainImage}" alt="Product Image">`;
                imageElement.className = "product-image"

                const brandElement = document.createElement("h3")
                brandElement.textContent = product.brand;
                brandElement.style.cursor = "pointer"
                brandElement.onclick = function () {
                    ViewProduct(product._id);
                }

                const descElement = document.createElement("h3");
                descElement.textContent = product.description;

                const priceElement = document.createElement("h3");
                const formattedPrice = new Intl.NumberFormat('es-CL').format(product.price);
                priceElement.textContent = `$${formattedPrice}`;

                productdiv.appendChild(imageElement)
                productdiv.appendChild(brandElement)
                productdiv.appendChild(descElement)
                productdiv.appendChild(priceElement)
                productcatalog.appendChild(productdiv)

            })

        }
    } catch (err) {
        console.error(err);
    }

}

async function displayfilters(subsection) {

    const getproduct = await fetch('/getproduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subsection: subsection
        })
    });

    if (getproduct.ok) {

        const data = await getproduct.json();

        const brands = document.getElementById("brands");
        const addedBrands = new Set();
        if (brands) brands.innerHTML = "";

        data.forEach(product => {

            if (brands) {
                const brandName = product.brand.trim();
                if (!addedBrands.has(brandName)) {
                    addedBrands.add(brandName);
                    const brandli = document.createElement("li");
                    const brandinput = document.createElement("input");
                    brandinput.type = "checkbox";
                    const labelinput = document.createElement("label");
                    labelinput.textContent = product.brand;

                    brandli.appendChild(brandinput)
                    brandli.appendChild(labelinput)
                    brands.appendChild(brandli)
                }
            }
        })

    }
}


async function ViewProduct(ProductId) {
    window.location.href = `/ViewProduct?id=${ProductId}`;
}

if (document.getElementById("brands")) {
    document.getElementById("brands").addEventListener("change", (e) => {
        if (e.target.type === "checkbox") {
            // get all checked brands as an array
            const checkedBrands = Array.from(
                document.querySelectorAll("#brands input[type='checkbox']:checked")
            ).map(cb => cb.nextElementSibling.textContent);

            // if none checked, pass empty array to show all products
            const brandsToSend = checkedBrands.length > 0 ? checkedBrands : [];
            displayproducts(productSubsec, "", brandsToSend);
        }
    });
}

if (document.getElementById("prices")) {
    document.getElementById("prices").addEventListener("change", () => {
        // Get all checked price ranges

        const checkedPrices = Array.from(
            document.querySelectorAll("#prices input[type='checkbox']:checked")
        ).map(cb => cb.nextElementSibling.textContent.trim().replace(/\s+/g, " "));

        console.log(checkedPrices)
        // Pass price ranges to displayproducts
        // Also get checked brands to keep both filters working together
        const checkedBrands = Array.from(
            document.querySelectorAll("#brands input[type='checkbox']:checked")
        ).map(cb => cb.nextElementSibling.textContent);

        displayproducts(productSubsec, checkedPrices, checkedBrands);
    });
}


async function productlist() {

    const productcatalog = document.getElementById("ProductCatalog")


    try {
        const productlist = await fetch("/getSectionslist");
        if (!productlist.ok) throw new Error("No se pudo traer la lista de productos");

        const Productslistdiv = document.getElementById("Productslistdiv");

        const data = await productlist.json();

        if (!data || data.length === 0) {
            const msg = document.createElement("h2");
            msg.textContent = "No se encontraron productos";
            msg.style.textAlign = "center";
            msg.style.color = "#d4a62a";
            msg.style.margin = "100px";
            productcatalog.appendChild(msg);
            return; // exit early
        }

        data.forEach(product => {

            const productsdiv = document.createElement("div");

            const sectiondiv = document.createElement("h3");
            sectiondiv.textContent = product.section;

            const subsectiondiv = document.createElement("div");
            subsectiondiv.className = "subsection";

            const subsections = Array.isArray(product.subsections)
                ? product.subsections      // already an array
                : product.subsections.split(',');

            subsections.forEach(item => {
                const p = document.createElement("p");
                p.textContent = item.trim();

                p.onclick = function () {
                    window.location.href = `/products?product=${p.textContent}`
                };
                subsectiondiv.appendChild(p);
            });

            productsdiv.appendChild(sectiondiv);
            productsdiv.appendChild(subsectiondiv);
            Productslistdiv.appendChild(productsdiv)
        })

    } catch (err) {
        console.error(err);

    }
}

const burger = document.getElementById("burger");
const menu = document.getElementById("Sectionsdiv");

burger.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.classList.toggle("active");
    burger.classList.toggle("active");

    // Change icon
    if (burger.classList.contains("active")) {
        burger.innerHTML = "✖"; // Cross icon
    } else {
        burger.innerHTML = "☰"; // Hamburger icon
    }
});

// Close menu on click outside
document.addEventListener("click", function (e) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove("active");
        burger.classList.remove("active");
        burger.innerHTML = "☰";
    }
});

const mobileFilterButton = document.getElementById("mobileFilterButton");
const applyFilter = document.getElementById("applyfilter");

// Toggle filters on button click
if (mobileFilterButton) {

    mobileFilterButton.addEventListener("click", () => {
        applyFilter.classList.toggle("active"); // add/remove "active" class
    });
}

// Close filter panel if any checkbox is clicked
if (applyFilter) {

    applyFilter.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT" && e.target.type === "checkbox") {
            applyFilter.classList.remove("active");
        }
    });
}

function displaysearch() {
    const searchvalue = document.getElementById("searchInput").value.trim();

    if (!searchvalue) return; // prevent empty search

    const encodedValue = encodeURIComponent(searchvalue);

    window.location.href = `/search-products?search=${encodedValue}`;
}
