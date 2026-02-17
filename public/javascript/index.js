
function showcreateproduct() {
    document.getElementById("CreateProducts").style.display = "block";
    document.getElementById("ProductsList").style.display = "none";
    document.getElementById("CreateSections").style.display = "none";
    document.getElementById("SectionsList").style.display = "none";
}

function showlistproduct() {
    document.getElementById("CreateProducts").style.display = "none";
    document.getElementById("ProductsList").style.display = "block";
    document.getElementById("CreateSections").style.display = "none";
    document.getElementById("SectionsList").style.display = "none";
}

function showcreatesections() {
    document.getElementById("CreateProducts").style.display = "none";
    document.getElementById("ProductsList").style.display = "none";
    document.getElementById("CreateSections").style.display = "block";
    document.getElementById("SectionsList").style.display = "none";
}

function showlistsections() {
    document.getElementById("CreateProducts").style.display = "none";
    document.getElementById("ProductsList").style.display = "none";
    document.getElementById("CreateSections").style.display = "none";
    document.getElementById("SectionsList").style.display = "block";
}
function addsubsections() {
    const container = document.getElementById("subsections-container");

    const input = document.createElement("input");
    input.type = "text";
    input.name = "subsection[]";
    input.placeholder = "Ingresa Sub Sección";
    input.className = "form-control";
    input.required = true;

    container.appendChild(input);

    const button = document.createElement("button")
    button.type = "button";
    button.id = "DeleteSubSections"
    button.addEventListener("click", deletesubsections);
    button.textContent = "Eliminar Sub Sección";

    container.appendChild(button);
}

function deletesubsections(e) {
    const button = e.target;
    const input = button.previousElementSibling;

    input.remove();
    button.remove();
}

async function getsectionslist() {

    const sectionlistdiv = document.getElementById("SectionsList")
    const sectionlisttable = document.getElementById("SectionslistTable")

    const tbody = document.getElementById("SectionsListBody");
    tbody.innerHTML = ""; // clear previous content

    try {
        const response = await fetch("/getSectionslist");
        if (!response.ok) throw new Error("No se pudo traer la lista de secciones");

        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">No hay secciones creadas</td></tr>`;
            return;
        }

        data.forEach(section => {
            const tr = document.createElement("tr");

            const tdSection = document.createElement("td");
            tdSection.textContent = section.section;

            const tdSubsections = document.createElement("td");
            tdSubsections.textContent = section.subsections.join(", "); // join array

            const tdCreated = document.createElement("td");
            tdCreated.textContent = new Date(section.createdAt).toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            // --- NEW: Actions td with Edit/Delete buttons ---
            const tdActions = document.createElement("td");

            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️ Edit";
            editBtn.className = "edit-btn";
            editBtn.onclick = () => openEditSection(section._id);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deleteSection(section._id);

            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);

            // Append all tds
            tr.appendChild(tdSection);
            tr.appendChild(tdSubsections);
            tr.appendChild(tdCreated);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4">No es posible traer la lista de secciones</td></tr>`;
    }
}

async function openEditSection(sectionId) {
    try {
        const res = await fetch(`/getSectionslist`); // or endpoint to get single section
        const sections = await res.json();
        const section = sections.find(s => s._id === sectionId);
        if (!section) throw new Error("Sección no encontrada");

        // Show the CreateSections form
        document.getElementById("CreateSections").style.display = "block";

        // Fill the main section name
        const form = document.getElementById("createsectionsform");
        form.dataset.editId = section._id; // store ID for update
        form.section.value = section.section;

        const container = document.getElementById("subsections-container");
        container.innerHTML = ""; // clear existing inputs

        section.subsections.forEach(sub => {
            // create div to wrap input + delete button
            const div = document.createElement("div");
            div.className = "subsection-item";

            // input
            const input = document.createElement("input");
            input.type = "text";
            input.className = "form-control";
            input.name = "subsection[]";
            input.value = sub;

            // delete button
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.textContent = "Eliminar Sub Sección";
            delBtn.onclick = () => div.remove(); // remove the whole div when clicked

            div.appendChild(input);
            div.appendChild(delBtn);

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la sección para editar");
    }
}

// Handle edit form submit
document.getElementById("createsectionsform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const sectionId = form.dataset.editId; // undefined if creating new

    const subsections = Array.from(form.querySelectorAll("input[name='subsection[]']"))
        .map(i => i.value.trim())
        .filter(Boolean);

    const bodyData = {
        section: form.section.value.trim(),
        subsections
    };

    try {
        if (sectionId) {
            // Edit existing
            const res = await fetch(`/sections/${sectionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error al actualizar sección");
            }

            const result = await res.json();
            alert("Sección actualizada ✅"); // Only alert once
            document.getElementById("CreateSections").style.display = "none";

        } else {
            // Create new — submit normally
            form.submit();
            return; // exit function to prevent running rest of JS after submit
        }

        getsectionslist(); // refresh table
        form.reset();
        delete form.dataset.editId;

    } catch (err) {
        console.error(err);
        alert("Error al guardar sección: " + err.message);
    }
});


async function deleteSection(sectionId) {
    if (!confirm("⚠️ ¿Seguro que quieres eliminar esta sección?")) return;

    try {
        const res = await fetch(`/sections/${sectionId}`, { method: "DELETE" });
        const result = await res.json();

        if (result.success) {
            alert("Sección eliminada ✅");
            getSectionsList();
        } else {
            alert(result.message || "Error al eliminar sección");
        }
    } catch (err) {
        console.error(err);
        alert("Error del servidor al eliminar sección");
    }
}

async function loadSections(sectionId, subsectionId, selectedSection = null, selectedSubsection = null) {
    const sectionSelect = document.getElementById(sectionId);
    const subsectionSelect = document.getElementById(subsectionId);

    try {
        const response = await fetch('/getSectionslist');
        const sections = await response.json();

        sectionSelect.innerHTML = '<option value="">Selecciona una sección</option>';
        subsectionSelect.innerHTML = '<option value="">Selecciona una sub sección</option>';

        sections.forEach(sec => {
            const option = document.createElement('option');
            option.value = sec.section;
            option.textContent = sec.section;

            if (selectedSection === sec.section) {
                option.selected = true;
            }

            sectionSelect.appendChild(option);
        });

        // If editing → load subsections immediately
        if (selectedSection) {
            const selected = sections.find(s => s.section === selectedSection);
            if (selected) {
                selected.subsections.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;

                    if (selectedSubsection === sub) {
                        opt.selected = true;
                    }

                    subsectionSelect.appendChild(opt);
                });
            }
        }

        // Change listener
        sectionSelect.addEventListener('change', () => {
            const selected = sections.find(s => s.section === sectionSelect.value);

            subsectionSelect.innerHTML = '<option value="">Selecciona una sub sección</option>';

            if (selected) {
                selected.subsections.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    subsectionSelect.appendChild(opt);
                });
            }
        });

    } catch (err) {
        console.error(err);
        sectionSelect.innerHTML = '<option value="">No se pudieron cargar las secciones</option>';
    }
}

let currentPage = 1;
const itemsPerPage = 10;

async function getproductslist(page = 1) {
    currentPage = page;
    const tbody = document.getElementById("ProductosListBody");
    tbody.innerHTML = "";

    try {
        // Fetch all products
        const res = await fetch("/getProductslist");
        if (!res.ok) throw new Error("No se pudo traer la lista de productos");

        const data = await res.json(); // old structure: array of products
        const totalItems = data.length;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="8">No hay productos creados</td></tr>`;
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        // Slice data for pagination
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageProducts = data.slice(start, end);

        pageProducts.forEach(product => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.section || ""}</td>
                <td>${product.subsection || ""}</td>
                <td>${product.name || ""}</td>
                <td>${product.brand || ""}</td>
                <td>${product.description || ""}</td>
                <td>${product.price || ""}</td>
                <td>${new Date(product.createdAt).toLocaleString("es-ES")}</td>
                <td>
                    <button onclick="editProduct('${product._id}')">✏️</button>
                    <button onclick="deleteProduct('${product._id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        renderPagination(totalItems, page);

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="8">Error al traer productos</td></tr>`;
    }
}

function renderPagination(totalItems, page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === page ? "active-page" : "";
        btn.onclick = () => getproductslist(i);
        pagination.appendChild(btn);
    }
}


async function deleteProduct(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
        const res = await fetch(`/products/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error();

        alert("Producto eliminado");
        getproductslist(1); // reload table
    } catch {
        alert("Error al eliminar producto");
    }
}


async function openEditForm(productId) {
    // Show edit form and hide other sections
    document.getElementById("EditProducts").style.display = "block";
    document.getElementById("CreateProducts").style.display = "none";
    document.getElementById("ProductsList").style.display = "none";

    try {
        const res = await fetch(`/editProduct/${productId}`);
        if (!res.ok) throw new Error("No se pudo traer el producto");

        const product = await res.json();

        // Fill the form
        document.getElementById("edit-productId").value = product._id;
        document.getElementById("edit-name").value = product.name;
        document.getElementById("edit-brand").value = product.brand;
        document.getElementById("edit-description").value = product.description ?? "";
        document.getElementById("edit-price").value = product.price;
        document.getElementById("edit-briefdescription").value = product.briefDescription ?? "";
        document.getElementById("edit-productspec").value = specificationsToText(product.specifications) ?? "";


        // Load sections/subsections dynamically if needed
        await loadSections("edit-section-select", "edit-subsection-select", product.section, product.subsection);

    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del producto");
    }
}

document.getElementById("editproductsform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const productId = document.getElementById("edit-productId").value;

    const bodyData = {
        productname: document.getElementById("edit-name").value,
        productbrand: document.getElementById("edit-brand").value,
        productsection: document.getElementById("edit-section-select").value,
        productsubsection: document.getElementById("edit-subsection-select").value,
        productprice: document.getElementById("edit-price").value,
        productdesc: document.getElementById("edit-description").value,
        productbriefdesc: document.getElementById("edit-briefdescription").value,
        productspec: document.getElementById("edit-productspec").value
    };

    try {
        const response = await fetch(`/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (result.success) {
            alert("Producto actualizado correctamente ✅");
            getproductslist(1); // refresh table
            document.getElementById("EditProducts").style.display = "none";
        } else {
            alert(result.message || "Error al actualizar");
        }

    } catch (error) {
        console.error(error);
        alert("Error del servidor");
    }
});

function specificationsToText(specsArray) {
    if (!Array.isArray(specsArray)) return "";

    let lines = [];

    specsArray.forEach(section => {
        if (!section || !section.section) return;

        // Section header
        lines.push(section.section);

        if (Array.isArray(section.items)) {
            section.items.forEach(item => {
                lines.push(`${item.key}: ${item.value}`);
            });
        }
    });

    return lines.join("\n");
}

loadSections("section-select", "subsection-select");
getsectionslist();
getproductslist(1);