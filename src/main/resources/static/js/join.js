document.addEventListener("DOMContentLoaded", init);

function init() {
    document.getElementById("joinButton")
        .addEventListener("click", joinGroup);
}

async function joinGroup() {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get("code");

    try {
        const response = await fetch(`/api/private/join/${inviteCode}`, {
            method: "POST"
        });

        if (!response.ok) {
            alert("No fue posible unirse al grupo");
            return;
        }

        alert("✅ Te uniste al grupo correctamente");
        window.location.href = "/pages/privategroups.html";

    } catch (error) {
        console.error(error);
        alert("Error al unirse al grupo");
    }
}
