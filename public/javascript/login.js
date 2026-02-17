window.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);

    if (params.get("resetPassword") === "1") {
        const dialog = document.getElementById("reset-password");
        dialog.showModal();

        document.getElementById("closepassword").style.display = "none";
    }

    lastlogin();
})

async function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            document.getElementById("username").value = ""
            document.getElementById("password").value = ""
            return;
        }

        if (data.firstLogin) {
            window.location.href = `/admin?resetPassword=1`;
        } else {
            window.location.href = `/admin`;
        }

    } catch (err) {
        console.error(err);
        alert('Server error');
    }
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = function () {
        window.location.href = "/logout";
    }
}

function showresetpassword() {
    const dialog = document.getElementById("reset-password");
    dialog.showModal();
}

async function checkpasswordchange(event) {
    event.preventDefault()
    const password = document.getElementById("password").value
    const rptpwd = document.getElementById("repeatpassword").value

    if (password !== rptpwd) {
        alert("Las contraseñas no coinciden")
        return
    }

    const response = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    })
    const data = await response.json()
    if (data.success === true) {
        document.getElementById("reset-msg").innerHTML = data.message;
    }

}

const closePasswordBtn = document.getElementById("closepassword")
if (closePasswordBtn) {
    closePasswordBtn.addEventListener("click", () => {
        document.getElementById("reset-password").close();
    })
}

async function lastlogin() {
    const lastlogin = document.getElementById("lastLogin");
    if (lastlogin) {
        const getlastlogin = await fetch("/getlastlogin");
        if (getlastlogin.ok) {
            const lastlogindata = await getlastlogin.json();
            if (lastlogindata.success === true) {

                const date = new Date(lastlogindata.message)
                const formatted = date.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                console.log(lastlogindata.message)
                console.log(formatted)
                document.getElementById("lastLogin").textContent = formatted;
            }
        }
    }
}